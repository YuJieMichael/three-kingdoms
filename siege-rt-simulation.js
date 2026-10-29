const SiegeRTSimulation=(()=>{
  const D=SiegeRTData,clone=x=>JSON.parse(JSON.stringify(x));
  function create({mode='drill',generalSnapshot={},seed=1}={}){
    const units=[];const attack=D.multiplier(generalSnapshot.valor),health=D.multiplier(generalSnapshot.leadership);
    function add(id,team,kind,x,y,hp,speed,damage,interval,range){units.push({id,team,kind,x,y,hp,maxHP:hp,speed,attack:damage,interval,range,r:kind==='hero'?17:11,facing:team==='player'?0:Math.PI,ready:0,home:{x,y}});}
    add('hero','player','hero',300,800,1200,180,50*attack,17,75);
    for(let i=0;i<24;i++)add('p'+i,'player','shield',180-(i%4)*27,730+Math.floor(i/4)*27,160*health,110,16,30,28);
    for(let i=0;i<12;i++)add('o'+i,'enemy','melee',750+(i%3)*36,680+Math.floor(i/3)*65,130,90,14,36,28);
    for(let t=0;t<2;t++)for(let i=0;i<4;i++)add('a'+t+i,'enemy','archer',990+(i%2)*30, D.map.towers[t].y+Math.floor(i/2)*30,90,0,12,60,350);
    for(let i=0;i<16;i++)add('c'+i,'enemy','melee',1700+(i%4)*45,690+Math.floor(i/4)*65,130,90,14,36,28);
    return {version:1,checkpointRevision:0,mode,seed:seed>>>0,tick:0,units,projectiles:[],gate:{hp:4000,maxHP:4000},capture:0,result:null,input:{x:0,y:0,aim:0,attack:false},squad:{order:'follow',target:null,facing:0,chargeReady:0,chargeUntil:0,chargeHits:[]},hero:{skillReady:0,dodgeReady:0,dodgeUntil:0,immuneUntil:0,dodgeX:0,dodgeY:0},nextProjectile:0,tutorial:{}};
  }

  const N=SiegeRTNavigation,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const alive=u=>u.hp>0,point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  function step(original,commands=[]){
    if(original.result)return {state:original,events:[]};
    const s=clone(original),events=[],nav=N.build(D.map,s.gate.hp<=0);s.tick++;
    const h=s.units.find(u=>u.kind==='hero'),squad=s.squad,heroes=s.hero;
    function event(type,u,t,amount){events.push({type,entityId:u?.id,targetId:t?.id,amount,pos:t?{x:t.x,y:t.y}:undefined});}
    function damage(t,n,from,arrow=false){if(!alive(t))return;if(t===h&&s.tick<heroes.immuneUntil)return;
      if(arrow&&t.team==='player'&&t.kind==='shield'&&squad.order==='hold'&&Math.abs(angleDiff(Math.atan2(from.y-t.y,from.x-t.x),t.facing))<=Math.PI/3)n*=.5;
      t.hp=Math.max(0,t.hp-n);event('hit',from,t,n);if(!t.hp)event('death',from,t,n);
    }
    function hitGate(u,n){if(s.gate.hp>0){s.gate.hp=Math.max(0,s.gate.hp-n);event('gate_hit',u,{id:'gate',x:1175,y:800},n);}}
    function gateDistance(u){const g=D.map.gate;return Math.hypot(u.x-Math.max(g.x,Math.min(g.x+g.w,u.x)),u.y-Math.max(g.y,Math.min(g.y+g.h,u.y)));}
    function swing(u,range,amount,max,arc){const foes=s.units.filter(v=>v.team!==u.team&&alive(v)&&dist(u,v)<=range+v.r&&Math.abs(angleDiff(Math.atan2(v.y-u.y,v.x-u.x),u.facing))<=arc/2&&N.clear(nav,u,v)).sort((a,b)=>dist(u,a)-dist(u,b)||a.id.localeCompare(b.id));
      foes.slice(0,max).forEach(v=>damage(v,amount,u));if(!foes.length&&u.team==='player'&&gateDistance(u)<=range&&Math.abs(angleDiff(Math.atan2(800-u.y,1175-u.x),u.facing))<=arc/2)hitGate(u,amount);event('swing',u,u,range);
    }
    for(const c of commands){if(!c||typeof c.type!=='string')continue;
      if(c.type==='moveHero'&&Number.isFinite(c.x)&&Number.isFinite(c.y)){const l=Math.max(1,Math.hypot(c.x,c.y));s.input.x=c.x/l;s.input.y=c.y/l;s.tutorial.move=true;}
      if(c.type==='aim'&&Number.isFinite(c.angle))s.input.aim=c.angle;
      if(c.type==='attack')s.input.attack=c.held===true;
      if(c.type==='dodge'&&alive(h)&&s.tick>=heroes.dodgeReady){const l=Math.hypot(s.input.x,s.input.y);heroes.dodgeX=l?s.input.x/l:Math.cos(s.input.aim);heroes.dodgeY=l?s.input.y/l:Math.sin(s.input.aim);heroes.dodgeReady=s.tick+90;heroes.dodgeUntil=s.tick+8;heroes.immuneUntil=s.tick+5;event('dodge',h,h,0);}
      if(c.type==='skill'&&alive(h)&&s.tick>=heroes.skillReady){heroes.skillReady=s.tick+300;swing(h,110,h.attack*1.8,61,Math.PI*2);event('skill',h,h,110);}
      if(c.type==='follow'){squad.order='follow';squad.target=null;s.tutorial.follow=true;}
      if(c.type==='hold'){const ps=s.units.filter(u=>u.team==='player'&&u.kind!=='hero'&&alive(u));squad.center=ps.length?{x:ps.reduce((v,u)=>v+u.x,0)/ps.length,y:ps.reduce((v,u)=>v+u.y,0)/ps.length}:{x:h.x,y:h.y};squad.facing=s.input.aim;squad.order='hold';squad.target=null;s.tutorial.hold=true;}
      if((c.type==='moveSquad'||c.type==='charge')&&point(c.target)){
        const ps=s.units.filter(u=>u.team==='player'&&u.kind!=='hero'&&alive(u));const center=ps.length?{x:ps.reduce((v,u)=>v+u.x,0)/ps.length,y:ps.reduce((v,u)=>v+u.y,0)/ps.length}:h;
        if(!N.path(nav,center,c.target)){event('unreachable',h,h,0);continue;}
        if(c.type==='charge'&&s.tick<squad.chargeReady)continue;
        squad.order=c.type==='charge'?'charge':'move';squad.target={...c.target};squad.facing=Math.atan2(c.target.y-center.y,c.target.x-center.x);
        if(c.type==='charge'){squad.chargeReady=s.tick+450;squad.chargeUntil=s.tick+90;squad.chargeHits=[];squad.chargeStart={x:center.x,y:center.y};event('charge',h,center,0);s.tutorial.charge=true;}
        for(const u of ps){delete u.path;u.pathTick=0;u.chargeDistance=0;}
      }
      if(c.type==='retreat')s.result={won:false,reason:'retreat',endedTick:s.tick};
    }
    if(s.result)return {state:s,events};
    h.facing=s.input.aim;
    if(alive(h)){const dodging=s.tick<heroes.dodgeUntil;const delta=dodging?{x:heroes.dodgeX*480/30,y:heroes.dodgeY*480/30}:{x:s.input.x*h.speed/30,y:s.input.y*h.speed/30};Object.assign(h,N.move(nav,h,delta));if(s.input.attack&&s.tick>=h.ready&&!dodging){swing(h,75,h.attack,3,Math.PI/2);h.ready=s.tick+17;s.tutorial.attack=true;}}
    const ps=s.units.filter(u=>u.team==='player'&&u.kind!=='hero'&&alive(u));
    let center=squad.order==='follow'?{x:h.x-Math.cos(s.input.aim)*100,y:h.y-Math.sin(s.input.aim)*100}:squad.target||squad.center||h;
    const slots=N.slots(center,squad.facing,ps.map(u=>u.id));
    function moveToward(u,target,speed){if(!point(target)||dist(u,target)<3)return;let goal=target;
      if(!N.clear(nav,u,target,u.r)){if(u.path===undefined||s.tick>=(u.pathTick||0)){u.path=N.path(nav,u,target,u.r);u.pathTick=s.tick+15;}if(!u.path?.length)return;while(u.path.length>1&&dist(u,u.path[0])<16)u.path.shift();goal=u.path[0];}
      const d=dist(u,goal);if(!d)return;const a=Math.atan2(goal.y-u.y,goal.x-u.x);u.facing=a;const m=Math.min(speed/30,d),p=N.move(nav,u,{x:Math.cos(a)*m,y:Math.sin(a)*m});if(squad.order==='charge'&&u.team==='player')u.chargeDistance=(u.chargeDistance||0)+dist(u,p);Object.assign(u,p);
    }
    for(const u of s.units){if(!alive(u)||u.kind==='hero')continue;const foes=s.units.filter(v=>v.team!==u.team&&alive(v)&&dist(u,v)<=400&&N.clear(nav,u,v)).sort((a,b)=>dist(u,a)-dist(u,b)||a.id.localeCompare(b.id));const nearest=foes[0];
      if(u.team==='player'){
        const slot=slots.find(v=>v.id===u.id)||center;const anchor=squad.order==='hold'?squad.center||center:center;
        if(squad.order==='charge'){if(s.tick>=squad.chargeUntil||(u.chargeDistance||0)>=360)continue;moveToward(u,squad.target,Math.min(220,(360-(u.chargeDistance||0))*30));for(const v of foes)if(dist(u,v)<u.r+v.r+12&&!squad.chargeHits.includes(u.id+':'+v.id)){damage(v,32,u);squad.chargeHits.push(u.id+':'+v.id);const a=Math.atan2(v.y-u.y,v.x-u.x);Object.assign(v,N.move(nav,v,{x:Math.cos(a)*20,y:Math.sin(a)*20}));}if(gateDistance(u)<30&&!squad.chargeHits.includes(u.id+':gate')){hitGate(u,32);squad.chargeHits.push(u.id+':gate');}continue;}
        const engage=nearest&&dist(u,nearest)<140&&((squad.order==='hold'&&dist(nearest,anchor)<=70)||(squad.order==='follow'&&dist(u,anchor)<=150));
        if(engage)moveToward(u,nearest,u.speed);else moveToward(u,slot,u.speed);
        if(squad.order==='hold')u.facing=squad.facing;
        if(s.tick>=u.ready){if(nearest&&dist(u,nearest)<=u.range+nearest.r){damage(nearest,u.attack,u);u.ready=s.tick+u.interval;}else if(gateDistance(u)<u.range+4){hitGate(u,u.attack);u.ready=s.tick+u.interval;}}
      }else{
        if(u.kind==='melee'){if(nearest&&dist(nearest,u.home)<=220)moveToward(u,nearest,u.speed);else moveToward(u,u.home,u.speed);}
        if(nearest&&dist(u,nearest)<=u.range+nearest.r&&s.tick>=u.ready){u.facing=Math.atan2(nearest.y-u.y,nearest.x-u.x);u.ready=s.tick+u.interval;if(u.kind==='archer')s.projectiles.push({id:s.nextProjectile++,x:u.x,y:u.y,dx:Math.cos(u.facing),dy:Math.sin(u.facing),team:u.team,damage:u.attack,ttl:30});else damage(nearest,u.attack,u);}
      }
    }
    // Gentle separation allows narrow passages without stacking an entire squad.
    const live=s.units.filter(alive);for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],b=live[j],d=dist(a,b),min=a.r+b.r;if(d<min&&d>0){const scale=Math.min(2,(min-d)/2)/d;if(a!==h)Object.assign(a,N.move(nav,a,{x:(a.x-b.x)*scale,y:(a.y-b.y)*scale}));if(b!==h)Object.assign(b,N.move(nav,b,{x:(b.x-a.x)*scale,y:(b.y-a.y)*scale}));}}
    s.projectiles=s.projectiles.filter(p=>{const from={x:p.x,y:p.y},to={x:p.x+p.dx*500/30,y:p.y+p.dy*500/30};if(!N.clear(nav,from,to))return false;p.x=to.x;p.y=to.y;p.ttl--;const t=live.find(u=>u.team!==p.team&&dist(u,p)<u.r+8);if(t){damage(t,p.damage,{...from,id:'arrow'},true);return false;}return p.ttl>0;});
    if(squad.order==='charge'&&(s.tick>=squad.chargeUntil||ps.every(u=>(u.chargeDistance||0)>=360||dist(u,squad.target)<20))||squad.order==='move'&&ps.length&&ps.every(u=>dist(u,center)<135)){squad.order='hold';squad.center={x:ps.reduce((v,u)=>v+u.x,0)/Math.max(1,ps.length),y:ps.reduce((v,u)=>v+u.y,0)/Math.max(1,ps.length)};squad.target=null;}
    if(original.gate.hp>0&&s.gate.hp===0)event('gate_open',h,{id:'gate',x:1175,y:800},0);
    const onPoint=u=>alive(u)&&dist(u,D.map.capture)<=D.map.capture.r;
    if(s.gate.hp===0&&s.units.some(u=>u.team==='player'&&onPoint(u))&&!s.units.some(u=>u.team==='enemy'&&onPoint(u)))s.capture=Math.min(600,s.capture+1);
    if(!alive(h))s.result={won:false,reason:'hero_dead',endedTick:s.tick};
    else if(s.capture>=600)s.result={won:true,reason:'captured',endedTick:s.tick};
    else if(s.tick>=18000)s.result={won:false,reason:'timeout',endedTick:s.tick};
    if(s.result)event('result',h,h,0);
    return {state:s,events};
  }
  return {create,clone,step};
})();
