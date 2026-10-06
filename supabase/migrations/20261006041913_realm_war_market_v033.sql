-- The public browser roles cannot mutate diplomacy, escrow or delivery rows.
-- Existing player revision and realm metadata revision remain the CAS fences.
create table if not exists public.online_market_orders (
 realm text not null,order_id text not null,seller_id uuid not null references auth.users(id),
 status text not null check(status in ('open','filled','cancelled')),
 version bigint not null check(version>=0),data jsonb not null,
 primary key(realm,order_id),check(pg_column_size(data)<16384)
);
create index if not exists online_market_open on public.online_market_orders(realm,status) where status='open';
create index if not exists online_market_seller on public.online_market_orders(realm,seller_id);
create table if not exists public.online_alliance_details (
 realm text not null,alliance_id text not null,data jsonb not null default '{}'::jsonb,
 primary key(realm,alliance_id),foreign key(realm,alliance_id) references public.online_alliances(realm,alliance_id) on delete cascade,
 check(pg_column_size(data)<65536)
);
alter table public.online_market_orders enable row level security;
alter table public.online_alliance_details enable row level security;
revoke all on public.online_market_orders,public.online_alliance_details from public,anon,authenticated;
grant select,insert,update,delete on public.online_market_orders,public.online_alliance_details to service_role;
alter table public.online_marches drop constraint if exists online_marches_kind_check;
alter table public.online_marches add constraint online_marches_kind_check check(kind in ('hunt','pvp','aid','trade'));

-- Preserve the reviewed city/general/player transaction as the inner reducer.
alter function public.online_game_context(uuid,text,uuid,boolean) rename to online_game_context_v028;
alter function public.online_game_commit(uuid,text,text,text,jsonb,jsonb) rename to online_game_commit_v028;

create function public.online_game_context(p_actor uuid,p_realm text,p_target uuid default null,p_settle boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
 with base as (select public.online_game_context_v028(p_actor,p_realm,p_target,p_settle) body)
 select body||jsonb_build_object(
 'players',(body->'players')||coalesce((select jsonb_agg(jsonb_build_object('id',p.user_id,'revision',p.revision,'state',p.state,'home',jsonb_build_object('x',p.home_x,'y',p.home_y),'name',p.name,'level',p.level)) from public.online_players p where p.realm=p_realm and not exists(select 1 from jsonb_array_elements(body->'players') own where own->>'id'=p.user_id::text) and exists(select 1 from public.online_marches m where m.realm=p_realm and m.kind='aid' and m.status='stationed' and m.source_id=p.user_id and m.target_id::text in(select value->>'id' from jsonb_array_elements(body->'players')))),'[]'::jsonb),
 'marches',(body->'marches')||coalesce((select jsonb_agg(m.data) from public.online_marches m where m.realm=p_realm and m.status<>'done' and (m.source_id=p_target or m.target_id=p_target) and not exists(select 1 from jsonb_array_elements(body->'marches') own where own->>'id'=m.march_id)),'[]'::jsonb),
 'orders',coalesce((select jsonb_agg(data) from public.online_market_orders where realm=p_realm and (status='open' or seller_id=p_actor)),'[]'::jsonb),
 'alliances',coalesce((select jsonb_agg(jsonb_build_object('id',a.alliance_id,'name',a.name,'leader',a.leader_id)||coalesce(d.data,'{}'::jsonb)) from public.online_alliances a left join public.online_alliance_details d using(realm,alliance_id) where a.realm=p_realm),'[]'::jsonb),
 'map',coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'name',name,'home',jsonb_build_object('x',home_x,'y',home_y),'level',coalesce((state#>>'{realm,cities,capital,data,buildings,hall}')::integer,(state#>>'{buildings,hall}')::integer,level),'policy',jsonb_build_object('protectionUntil',coalesce((state->'onlineRealm'->>'protectionUntil')::bigint,0),'peaceUntil',coalesce((state->'onlineRealm'->>'peaceUntil')::bigint,0)))) from public.online_players where realm=p_realm),'[]'::jsonb)) from base
$$;

create function public.online_game_commit(p_actor uuid,p_realm text,p_id text,p_hash text,p_patch jsonb,p_response jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare old public.online_receipts;item jsonb;current_version bigint;reply jsonb;begin
 -- Acquire player locks first, exactly as the existing reducer does. This order
 -- avoids buyer/seller deadlocks when different users accept the same order.
 perform 1 from public.online_players where realm=p_realm and user_id in(select (value->>'id')::uuid from jsonb_array_elements(p_patch->'players')) order by user_id for update;
 select * into old from public.online_receipts where user_id=p_actor and realm=p_realm and command_id=p_id;
 if found then if old.payload_hash<>p_hash then raise exception 'ID_REUSED';end if;return old.response||'{"replayed":true}'::jsonb;end if;
 for item in select * from jsonb_array_elements(coalesce(p_patch->'orders','[]'::jsonb)) order by value->>'id' loop
  perform pg_advisory_xact_lock(hashtextextended('market:'||p_realm||':'||(item->>'id'),0));
  select version into current_version from public.online_market_orders where realm=p_realm and order_id=item->>'id' for update;
  if item->'expectedVersion'='null'::jsonb then
   if current_version is not null then raise exception 'REVISION_CONFLICT';end if;
  elsif current_version is null or current_version<>(item->>'expectedVersion')::bigint then raise exception 'REVISION_CONFLICT';end if;
 end loop;
 reply=public.online_game_commit_v028(p_actor,p_realm,p_id,p_hash,p_patch,p_response);
 for item in select * from jsonb_array_elements(coalesce(p_patch->'orders','[]'::jsonb)) order by value->>'id' loop
  insert into public.online_market_orders(realm,order_id,seller_id,status,version,data) values(p_realm,item->>'id',(item->>'seller')::uuid,item->>'status',(item->>'version')::bigint,item-'expectedVersion') on conflict(realm,order_id) do update set status=excluded.status,version=excluded.version,data=excluded.data;
 end loop;
 if p_patch ? 'memberships' then
  for item in select * from jsonb_array_elements(p_patch->'alliances') loop
   insert into public.online_alliance_details(realm,alliance_id,data) values(p_realm,item->>'id',jsonb_build_object('relations',coalesce(item->'relations','{}'::jsonb),'marks',coalesce(item->'marks','[]'::jsonb))) on conflict(realm,alliance_id) do update set data=excluded.data;
  end loop;
 end if;
 return reply;
end$$;

revoke all on function public.online_game_context(uuid,text,uuid,boolean),public.online_game_commit(uuid,text,text,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.online_game_context(uuid,text,uuid,boolean),public.online_game_commit(uuid,text,text,text,jsonb,jsonb) to service_role;
