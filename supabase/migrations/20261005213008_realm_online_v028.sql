-- Review source for the dedicated Three Kingdoms project. Generate the migration
-- filename with `supabase migration new online_world` before applying this file.
create table if not exists public.online_players (
 realm text not null, user_id uuid not null references auth.users(id) on delete cascade,
 revision bigint not null default 1 check(revision>0), state jsonb not null,
 home_x integer not null check(home_x between 0 and 63), home_y integer not null check(home_y between 0 and 63),
 name text not null, level integer not null default 1, updated_at timestamptz not null default now(),
 primary key(realm,user_id),unique(realm,home_x,home_y),check(pg_column_size(state)<=3000000)
);
create table if not exists public.online_private_saves (
 user_id uuid primary key references auth.users(id) on delete cascade, revision bigint not null check(revision>0),
 state jsonb not null check(pg_column_size(state)<=3000000),updated_at timestamptz not null default now()
);
create table if not exists public.online_receipts (
 user_id uuid not null references auth.users(id) on delete cascade,realm text not null,command_id text not null,
 payload_hash text not null,response jsonb not null,created_at timestamptz not null default now(),primary key(user_id,realm,command_id)
);
create index if not exists online_receipts_actor_time on public.online_receipts(user_id,created_at desc);
create table if not exists public.online_heroes (
 realm text not null,line text not null,name text not null,node text not null,owner_id uuid references auth.users(id),
 status text not null default 'wild' check(status in ('wild','captured','owned')),version bigint not null default 0,
 primary key(realm,line),check((status='wild')=(owner_id is null))
);
create table if not exists public.online_city_claims (
 realm text not null,city_id text not null,name text not null,owner_id uuid references auth.users(id),
 version bigint not null default 0,open_city boolean not null default false,x integer check(x between 0 and 63),y integer check(y between 0 and 63),primary key(realm,city_id),unique(realm,x,y)
);
create table if not exists public.online_marches (
 realm text not null,march_id text not null,source_id uuid not null references auth.users(id),target_id uuid references auth.users(id),
 kind text not null check(kind in ('hunt','pvp','aid')),status text not null check(status in ('march','stationed','return','done')),
 arrive_at bigint not null,return_at bigint,version bigint not null default 0,data jsonb not null,primary key(realm,march_id)
);
create index if not exists online_marches_due on public.online_marches(realm,status,arrive_at) where status in ('march','return');
create index if not exists online_marches_source on public.online_marches(realm,source_id,status);
create index if not exists online_marches_target on public.online_marches(realm,target_id,status);
create index if not exists online_marches_hero_due on public.online_marches(realm,(data->>'line'),arrive_at) where kind='hunt' and status='march';
create table if not exists public.online_alliances (
 realm text not null,alliance_id text not null,name text not null,leader_id uuid not null references auth.users(id),
 primary key(realm,alliance_id),unique(realm,name)
);
create table if not exists public.online_memberships (
 realm text not null,user_id uuid not null references auth.users(id),alliance_id text not null,role text not null check(role in ('leader','member')),
 primary key(realm,user_id),foreign key(realm,alliance_id) references public.online_alliances(realm,alliance_id) on delete cascade
);
create table if not exists public.online_alliance_versions(realm text primary key,version bigint not null default 0);
do $$declare name text;begin
 foreach name in array array['online_players','online_private_saves','online_receipts','online_heroes','online_city_claims','online_marches','online_alliances','online_memberships','online_alliance_versions'] loop
  execute format('alter table public.%I enable row level security',name);
  execute format('revoke all on public.%I from anon,authenticated',name);
  execute format('grant select,insert,update,delete on public.%I to service_role',name);
 end loop;
end$$;
-- Browser access is confined to its own private snapshots. All authoritative
-- mutation goes through authenticated Edge commands and service-only RPCs.
grant select on public.online_players,public.online_private_saves to authenticated;
create policy online_player_self_read on public.online_players for select to authenticated using((select auth.uid())=user_id);
create policy online_private_self_read on public.online_private_saves for select to authenticated using((select auth.uid())=user_id);
-- A verified JWT's session_id must still refer to a live Auth session.
-- BYPASSRLS does not grant table privileges; expose only these two columns to
-- the server role, never to the browser roles or Data API schema.
grant usage on schema auth to service_role;
grant select(id,user_id) on auth.sessions to service_role;

create or replace function public.online_game_time() returns bigint language sql stable security invoker set search_path='' as $$select floor(extract(epoch from now())*1000)::bigint$$;
create or replace function public.online_game_due() returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('actor',user_id,'realm',realm,'revision',revision)),'[]'::jsonb) from
 (select distinct p.realm,p.user_id,p.revision from public.online_players p join public.online_marches m on m.realm=p.realm and m.source_id=p.user_id where m.status='march' and m.arrive_at<=public.online_game_time() or m.status='return' and m.return_at<=public.online_game_time() order by p.realm,p.user_id limit 8) due
$$;
create or replace function public.online_game_session(p_user uuid,p_session uuid) returns boolean language sql stable security invoker set search_path='' as $$select exists(select 1 from auth.sessions where id=p_session and user_id=p_user)$$;
create or replace function public.online_game_receipt(p_actor uuid,p_realm text,p_id text) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('hash',payload_hash,'response',response) from public.online_receipts where user_id=p_actor and realm=p_realm and command_id=p_id
$$;
create or replace function public.online_game_private_load(p_actor uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('revision',revision,'state',state) from public.online_private_saves where user_id=p_actor
$$;
create or replace function public.online_game_private_save(p_actor uuid,p_id text,p_expected bigint,p_hash text,p_response jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.online_receipts;current_revision bigint;begin
 perform pg_advisory_xact_lock(hashtextextended('private:'||p_actor::text,0));
 select * into old from public.online_receipts where user_id=p_actor and realm='private' and command_id=p_id;
 if found then if old.payload_hash<>p_hash then raise exception 'ID_REUSED';end if;return old.response||'{"replayed":true}'::jsonb;end if;
 select revision into current_revision from public.online_private_saves where user_id=p_actor for update;
 if coalesce(current_revision,0)<>p_expected then raise exception 'REVISION_CONFLICT';end if;
 insert into public.online_private_saves(user_id,revision,state) values(p_actor,p_expected+1,p_response->'state') on conflict(user_id) do update set revision=excluded.revision,state=excluded.state,updated_at=now();
 insert into public.online_receipts(user_id,realm,command_id,payload_hash,response) values(p_actor,'private',p_id,p_hash,p_response);return p_response;
end$$;
create or replace function public.online_game_join(p_actor uuid,p_realm text,p_id text,p_expected bigint,p_hash text,p_state jsonb,p_seed jsonb,p_now bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare item jsonb;old public.online_receipts;position record;reply jsonb;begin
 perform pg_advisory_xact_lock(hashtextextended('join:'||p_realm,0));
 select * into old from public.online_receipts where user_id=p_actor and realm=p_realm and command_id=p_id;
 if found then if old.payload_hash<>p_hash then raise exception 'ID_REUSED';end if;return old.response||'{"replayed":true}'::jsonb;end if;
 if p_expected<>0 or exists(select 1 from public.online_players where realm=p_realm and user_id=p_actor) then raise exception 'REVISION_CONFLICT';end if;
 for item in select * from jsonb_array_elements(p_seed->'heroes') loop
  insert into public.online_heroes(realm,line,name,node) values(p_realm,item->>'line',item->>'name',item->>'node') on conflict do nothing;
 end loop;
 for item in select * from jsonb_array_elements(p_seed->'cities') loop
  insert into public.online_city_claims(realm,city_id,name,open_city,x,y) values(p_realm,item->>'id',item->>'name',(item->>'openCity')::boolean,(item->>'x')::integer,(item->>'y')::integer) on conflict do nothing;
 end loop;
 perform pg_advisory_xact_lock(hashtextextended('location:'||p_realm,0));
 select gx.x,gy.y into position from generate_series(2,61) as gx(x) cross join generate_series(2,61) as gy(y) where not exists(select 1 from public.online_players p where p.realm=p_realm and p.home_x=gx.x and p.home_y=gy.y) and not exists(select 1 from public.online_city_claims c where c.realm=p_realm and c.x=gx.x and c.y=gy.y) order by (gx.x-32)^2+(gy.y-32)^2,gy.y,gx.x limit 1;
 if position is null then raise exception 'WORLD_FULL';end if;
 insert into public.online_players(realm,user_id,state,home_x,home_y,name,level) values(p_realm,p_actor,p_state,position.x,position.y,p_state->>'ruler',(p_state->'buildings'->>'hall')::integer);
 reply=jsonb_build_object('ok',true,'serverTime',p_now,'revision',1,'state',p_state,'home',jsonb_build_object('x',position.x,'y',position.y));
 insert into public.online_receipts(user_id,realm,command_id,payload_hash,response) values(p_actor,p_realm,p_id,p_hash,reply);return reply;
end$$;
create or replace function public.online_game_context(p_actor uuid,p_realm text,p_target uuid default null,p_settle boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
 with due as (select source_id,target_id from public.online_marches where p_settle and realm=p_realm and ((status='march' and arrive_at<=public.online_game_time()) or (status='return' and return_at<=public.online_game_time())) order by coalesce(return_at,arrive_at),march_id limit 8),
 needed as (select p_actor id union select p_target union select source_id from due union select target_id from due),
 players as (select jsonb_build_object('id',user_id,'revision',revision,'state',state,'home',jsonb_build_object('x',home_x,'y',home_y),'name',name,'level',level) value from public.online_players where realm=p_realm and user_id in(select id from needed))
 select jsonb_build_object('actor',p_actor,'serverTime',public.online_game_time(),
 'players',coalesce((select jsonb_agg(value) from players),'[]'::jsonb),
 'map',coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'name',name,'home',jsonb_build_object('x',home_x,'y',home_y),'level',level)) from public.online_players where realm=p_realm),'[]'::jsonb),
 'heroes',coalesce((select jsonb_agg(jsonb_build_object('line',line,'name',name,'node',node,'owner',owner_id,'status',status,'version',version,'pendingAt',(select min(m.arrive_at) from public.online_marches m where m.realm=p_realm and m.kind='hunt' and m.status='march' and m.data->>'line'=h.line))) from public.online_heroes h where realm=p_realm),'[]'::jsonb),
 'cities',coalesce((select jsonb_agg(jsonb_build_object('id',city_id,'name',name,'x',x,'y',y,'owner',owner_id,'version',version,'openCity',open_city)) from public.online_city_claims where realm=p_realm),'[]'::jsonb),
 'marches',coalesce((select jsonb_agg(data) from (
  select data from public.online_marches where realm=p_realm and status<>'done' and (p_settle or source_id=p_actor or target_id=p_actor)
  union all select data from (select data from public.online_marches where realm=p_realm and status='done' and (source_id=p_actor or target_id=p_actor) and data ? 'report' order by (data->'report'->>'at')::bigint desc limit 20) done
 ) read_model),'[]'::jsonb),
 'alliances',coalesce((select jsonb_agg(jsonb_build_object('id',alliance_id,'name',name,'leader',leader_id)) from public.online_alliances where realm=p_realm),'[]'::jsonb),
 'memberships',coalesce((select jsonb_agg(jsonb_build_object('user',user_id,'alliance',alliance_id,'role',role)) from public.online_memberships where realm=p_realm),'[]'::jsonb),
 'allianceRevision',coalesce((select version from public.online_alliance_versions where realm=p_realm),0))
$$;
create or replace function public.online_game_commit(p_actor uuid,p_realm text,p_id text,p_hash text,p_patch jsonb,p_response jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.online_receipts;item jsonb;current_version bigint;begin
 -- Stable UUID ordering fences both cross-device commands and two-player fights.
 perform 1 from public.online_players where realm=p_realm and user_id in(select (value->>'id')::uuid from jsonb_array_elements(p_patch->'players')) order by user_id for update;
 select * into old from public.online_receipts where user_id=p_actor and realm=p_realm and command_id=p_id;
 if found then if old.payload_hash<>p_hash then raise exception 'ID_REUSED';end if;return old.response||'{"replayed":true}'::jsonb;end if;
 if (select count(*) from public.online_receipts where user_id=p_actor and created_at>now()-interval '1 second')>=10 then raise exception 'RATE_LIMITED';end if;
 if not exists(select 1 from jsonb_array_elements(p_patch->'players') p where p->>'id'=p_actor::text) then raise exception 'ACTOR_REQUIRED';end if;
 for item in select * from jsonb_array_elements(p_patch->'players') order by value->>'id' loop
  select revision into current_version from public.online_players where realm=p_realm and user_id=(item->>'id')::uuid;
  if current_version is null or current_version<>(item->>'expectedRevision')::bigint then raise exception 'REVISION_CONFLICT';end if;
 end loop;
 for item in select * from jsonb_array_elements(coalesce(p_patch->'heroes','[]'::jsonb)) order by value->>'line' loop
  select version into current_version from public.online_heroes where realm=p_realm and line=item->>'line' for update;
  if current_version is null or current_version<>(item->>'expectedVersion')::bigint then raise exception 'REVISION_CONFLICT';end if;
  update public.online_heroes set owner_id=nullif(item->>'owner','')::uuid,status=item->>'status',version=(item->>'version')::bigint where realm=p_realm and line=item->>'line';
 end loop;
 if exists(select 1 from jsonb_array_elements(coalesce(p_patch->'cities','[]'::jsonb)) where value->'expectedVersion'='null'::jsonb) then perform pg_advisory_xact_lock(hashtextextended('location:'||p_realm,0));end if;
 for item in select * from jsonb_array_elements(coalesce(p_patch->'cities','[]'::jsonb)) order by value->>'id' loop
  perform pg_advisory_xact_lock(hashtextextended('city:'||p_realm||':'||(item->>'id'),0));
  select version into current_version from public.online_city_claims where realm=p_realm and city_id=item->>'id' for update;
  if item->'expectedVersion'='null'::jsonb then
   if current_version is not null or exists(select 1 from public.online_players where realm=p_realm and home_x=(item->>'x')::integer and home_y=(item->>'y')::integer) or exists(select 1 from public.online_city_claims where realm=p_realm and x=(item->>'x')::integer and y=(item->>'y')::integer) then raise exception 'REVISION_CONFLICT';end if;
   insert into public.online_city_claims(realm,city_id,name,owner_id,version,open_city,x,y) values(p_realm,item->>'id',item->>'name',(item->>'owner')::uuid,(item->>'version')::bigint,true,(item->>'x')::integer,(item->>'y')::integer);
  else
   if current_version is null or current_version<>(item->>'expectedVersion')::bigint then raise exception 'REVISION_CONFLICT';end if;
   update public.online_city_claims set owner_id=nullif(item->>'owner','')::uuid,version=(item->>'version')::bigint where realm=p_realm and city_id=item->>'id';
  end if;
 end loop;
 for item in select * from jsonb_array_elements(coalesce(p_patch->'marches','[]'::jsonb)) order by value->>'id' loop
  select version into current_version from public.online_marches where realm=p_realm and march_id=item->>'id' for update;
  if item->'expectedVersion'='null'::jsonb then if current_version is not null then raise exception 'REVISION_CONFLICT';end if;
  elsif current_version is null or current_version<>(item->>'expectedVersion')::bigint then raise exception 'REVISION_CONFLICT';end if;
  insert into public.online_marches(realm,march_id,source_id,target_id,kind,status,arrive_at,return_at,version,data) values(p_realm,item->>'id',(item->>'source')::uuid,nullif(item->>'target','')::uuid,item->>'kind',item->>'status',(item->>'arrive')::bigint,(item->>'returnAt')::bigint,(item->>'version')::bigint,item-'expectedVersion') on conflict(realm,march_id) do update set status=excluded.status,return_at=excluded.return_at,version=excluded.version,data=excluded.data;
 end loop;
 -- Alliance mutations alone use a realm metadata lock; normal game commands do
 -- not lock the realm or replace unrelated players' progress.
 if p_patch ? 'allianceExpected' then
  perform pg_advisory_xact_lock(hashtextextended('alliance:'||p_realm,0));
  insert into public.online_alliance_versions(realm,version) values(p_realm,0) on conflict do nothing;
  select version into current_version from public.online_alliance_versions where realm=p_realm for update;
  if current_version<>(p_patch->>'allianceExpected')::bigint then raise exception 'REVISION_CONFLICT';end if;
 end if;
 if p_patch ? 'memberships' then
  delete from public.online_memberships where realm=p_realm;
  delete from public.online_alliances where realm=p_realm;
  for item in select * from jsonb_array_elements(p_patch->'alliances') loop insert into public.online_alliances values(p_realm,item->>'id',item->>'name',(item->>'leader')::uuid);end loop;
  for item in select * from jsonb_array_elements(p_patch->'memberships') loop insert into public.online_memberships values(p_realm,(item->>'user')::uuid,item->>'alliance',item->>'role');end loop;
  update public.online_alliance_versions set version=version+1 where realm=p_realm;
 end if;
 for item in select * from jsonb_array_elements(p_patch->'players') loop
  update public.online_players set state=item->'state',revision=revision+1,name=item->'state'->>'ruler',level=(item->'state'->'buildings'->>'hall')::integer,updated_at=now() where realm=p_realm and user_id=(item->>'id')::uuid;
 end loop;
 insert into public.online_receipts(user_id,realm,command_id,payload_hash,response) values(p_actor,p_realm,p_id,p_hash,p_response);return p_response;
end$$;
do $$declare item record;begin
 for item in select oid::regprocedure signature from pg_proc where pronamespace='public'::regnamespace and proname like 'online_game_%' loop
  execute format('revoke all on function %s from public,anon,authenticated',item.signature);
  execute format('grant execute on function %s to service_role',item.signature);
 end loop;
end$$;
