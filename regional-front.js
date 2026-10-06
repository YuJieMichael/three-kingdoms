'use strict';
// Voluntary local fronts share the real city-defense battle. Values are trial PVE rules.
const RegionalFront=(()=>{
  const WARNING=5*60*1000,COOLDOWN=30*60*1000,MAX_LEVEL=3;
  const stages=Object.freeze(['进犯','强攻','守住']);
  const profiles=Object.freeze({
    granary:Object.freeze({name:'粮城护粮战线',profile:'region_granary',army:Object.freeze({militia:80,spear:30,archer:40}),resource:Object.freeze({food:1800}),hint:'步弓混编争夺粮道，补充弓兵并用工事分担损伤。'}),
    mine:Object.freeze({name:'矿城保矿战线',profile:'region_mine',army:Object.freeze({shield:50,spear:40,archer:30,ram:4}),resource:Object.freeze({wood:600,stone:600,iron:600}),hint:'盾枪掩护冲车，检查城墙、远程兵与器械防线。'}),
    pass:Object.freeze({name:'关隘扼守战线',profile:'region_pass',army:Object.freeze({spear:30,cavalry:45,heavy:8,archer:20}),resource:Object.freeze({food:700,wood:400,iron:400}),hint:'骑军威胁关口，长枪、拒马与箭塔可帮助拦截。'})
  });
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
  const keys=(x,list)=>object(x)&&Object.keys(x).length===list.length&&list.every(k=>Object.hasOwn(x,k));
  const same=(a,b)=>object(a)&&object(b)&&JSON.stringify(Object.keys(a).sort().map(k=>[k,a[k]]))===JSON.stringify(Object.keys(b).sort().map(k=>[k,b[k]]));
  const current=s=>s.realm?.cities?.[s.scopeID||s.realm?.activeCity];
  const kind=city=>typeof CityStrategy==='undefined'?'balanced':CityStrategy.profile(city).id;
  const sumStage=(f,i)=>[1,2,3].reduce((n,l)=>n+f.wins[l][i],0);
  const completed=f=>[1,2,3].reduce((n,l)=>n+f.wins[l][2],0);
  function init(s){if(s.regionalFront===undefined)s.regionalFront={version:1,seq:0,run:null,nextAt:0,wins:{1:[0,0,0],2:[0,0,0],3:[0,0,0]},earnedMerit:0,last:null};}
  function waveSpec(m){
    if(!keys(m,['version','id','city','kind','level','stage','attempt','startedAt','arriveAt','first'])||m.version!==1||typeof m.city!=='string'||!/^city_[a-zA-Z0-9_]+$/.test(m.city)||!Object.hasOwn(profiles,m.kind)||kind(m.city)!==m.kind||typeof m.id!=='string'||!new RegExp('^front_'+m.city+'_[1-9]\\d*$').test(m.id)||!int(Number(m.id.slice(('front_'+m.city+'_').length)))||!int(m.level)||m.level<1||m.level>MAX_LEVEL||!int(m.stage)||m.stage<1||m.stage>3||!int(m.attempt)||m.attempt<1||!int(m.startedAt)||!int(m.arriveAt)||m.arriveAt-m.startedAt!==WARNING||typeof m.first!=='boolean')return null;
    const p=profiles[m.kind],factor=m.level*m.stage;
    return {profile:p.profile,name:p.name+' · '+stages[m.stage-1],army:Object.fromEntries(Object.entries(p.army).map(([id,n])=>[id,n*factor])),reward:Object.fromEntries(Object.entries(p.resource).map(([id,n])=>[id,n*factor*(m.first?2:.5)])),cost:{gold:0,food:0},xp:m.level*NPCDefenseData.xpPerLevel,merit:[3,5,8][m.stage-1]*m.level+(m.first?[12,18,30][m.stage-1]:0)};
  }
  function matches(s,m,cityId=s.scopeID||s.realm?.activeCity){
    const f=s.regionalFront,r=f?.run;
    return !!waveSpec(m)&&!!r&&r.city===cityId&&m.city===cityId&&r.id===m.id&&r.kind===m.kind&&r.level===m.level&&r.stage===m.stage&&r.attempt===m.attempt&&same(r.pending,m)&&m.first===(sumStage(f,m.stage-1)===0);
  }
  function valid(s,city=current(s)){
    try{
      const f=s.regionalFront;
      if(!keys(f,['version','seq','run','nextAt','wins','earnedMerit','last'])||f.version!==1||!int(f.seq)||!int(f.nextAt)||!int(f.earnedMerit)||!keys(f.wins,['1','2','3'])||![1,2,3].every(l=>Array.isArray(f.wins[l])&&f.wins[l].length===3&&f.wins[l].every(int)))return false;
      const r=f.run,done=completed(f),cityKind=kind(city),owned=city&&s.realm?.cities?.[city.id]&&s.conquered?.[city.node]===true;
      if(r===null)return f.seq===0&&f.nextAt===0&&f.earnedMerit===0&&f.last===null&&[0,1,2].every(i=>sumStage(f,i)===0)&&!s.cityDefense?.incoming?.front&&!s.cityDefense?.battle?.front;
      if(!owned||!Object.hasOwn(profiles,cityKind)||!keys(r,['id','city','kind','level','stage','status','attempt','startedAt','pending'])||r.city!==city.id||r.kind!==cityKind||r.id!=='front_'+city.id+'_'+f.seq||!int(r.level)||r.level<1||r.level>MAX_LEVEL||!int(r.stage)||r.stage<1||r.stage>3||!['ready','incoming','battle','retry','complete'].includes(r.status)||!int(r.attempt)||!int(r.startedAt)||f.seq!==(done+(r.status==='complete'?0:1))||r.status==='complete'&&r.stage!==3)return false;
      for(const l of [1,2,3])for(let i=0;i<3;i++)if(f.wins[l][i]!==f.wins[l][2]+(r.status!=='complete'&&l===r.level&&i<r.stage-1?1:0))return false;
      let merit=0;for(let i=0;i<3;i++){if(sumStage(f,i)>0)merit+=[12,18,30][i];for(const l of [1,2,3])merit+=f.wins[l][i]*[3,5,8][i]*l;}if(!int(merit)||merit!==f.earnedMerit)return false;
      if(r.status==='complete'?(f.nextAt===0||!f.last||!f.last.won||f.nextAt!==f.last.at+COOLDOWN):f.nextAt!==0)return false;
      if(['incoming','battle'].includes(r.status)){
        if(!matches(s,r.pending,city.id)||r.pending.startedAt<r.startedAt)return false;
        const w=r.status==='incoming'?s.cityDefense?.incoming:s.cityDefense?.battle;
        if(!w||!same(w.front,r.pending)||w.drill===true)return false;
        if(r.status==='incoming'&&s.cityDefense?.battle?.front||r.status==='battle'&&s.cityDefense?.incoming?.front)return false;
      }else if(r.pending!==null||s.cityDefense?.incoming?.front||s.cityDefense?.battle?.front)return false;
      if(f.last!==null){
        const a=f.last,q=waveSpec(a.front);
        if(!keys(a,['front','won','at','merit'])||!q||a.front.city!==city.id||a.front.kind!==cityKind||!int(a.at)||a.at<a.front.arriveAt||typeof a.won!=='boolean'||a.merit!==(a.won?q.merit:0)||Number(a.front.id.slice(('front_'+city.id+'_').length))>f.seq||a.won&&f.wins[a.front.level][a.front.stage-1]<1)return false;
        if(r.status==='retry'&&(!same(a.front,{...a.front,id:r.id,level:r.level,stage:r.stage,attempt:r.attempt})||a.won))return false;
        if(r.status==='complete'&&(a.front.id!==r.id||a.front.stage!==3||!a.won))return false;
      }else if(r.status==='retry'||r.status==='complete'||f.earnedMerit>0)return false;
      const history=(s.cityDefense?.reports||[]).filter(a=>a.front);
      const ids=new Set();for(const a of history){const m=a.front,q=waveSpec(m),k=m.id+':'+m.stage+':'+m.attempt,c=a.regionalFront;if(!q||m.city!==city.id||m.kind!==cityKind||Number(m.id.slice(('front_'+city.id+'_').length))>f.seq||ids.has(k)||a.won&&f.wins[m.level][m.stage-1]<1||m.id===r.id&&r.status!=='complete'&&(m.stage>r.stage||a.won&&m.stage>=r.stage||m.stage===r.stage&&m.attempt>r.attempt)||!keys(c,['merit','first','complete'])||c.merit!==(a.won?q.merit:0)||c.first!==(a.won&&m.first)||c.complete!==(a.won&&m.stage===3))return false;ids.add(k);}
      for(const l of [1,2,3])for(let i=1;i<=3;i++)if(history.filter(a=>a.won&&a.front.level===l&&a.front.stage===i).length>f.wins[l][i-1])return false;
      for(let i=1;i<=3;i++)if(history.filter(a=>a.won&&a.front.stage===i&&a.front.first).length>1)return false;
      return true;
    }catch{return false;}
  }
  function quote(s,city=current(s),now=Date.now(),selectedLevel){
    const f=s.regionalFront,r=f?.run,p=profiles[kind(city)];if(!p||!city||!s.realm?.cities?.[city.id]||s.conquered?.[city.node]!==true)return null;
    const active=!!r&&r.status!=='complete',maxLevel=Math.min(MAX_LEVEL,Math.max(1,Math.floor((s.buildings?.hall||0)/2))),level=active?r.level:selectedLevel===undefined?1:selectedLevel;
    if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)return null;
    const stage=active?r.stage:1,first=sumStage(f,stage-1)===0,m=active&&r.pending?{...r.pending}:{version:1,id:active?r.id:'front_'+city.id+'_'+(f.seq+1),city:city.id,kind:kind(city),level,stage,attempt:active?r.attempt+1:1,startedAt:now,arriveAt:now+WARNING,first},spec=waveSpec(m);
    const reason=!valid(s,city)?'战线记录异常，请重新载入':s.realm.activeCity!==city.id?'请先进入此城，再从本城开启战线':s.buildings.hall<2?'本城官府达到 2 级后可开启战线':!active&&level>maxLevel?'难度不能超过本城官府允许的上限':r&&['incoming','battle'].includes(r.status)?'本阶段已开始，请先完成当前守城':s.cityDefense?.incoming||s.cityDefense?.battle?'本城已有来袭或守城战，请先处理':f.nextAt>now?'本城正在整军，请等待冷却结束':'';
    return {...spec,city:city.id,cityName:city.name,kind:kind(city),level,stage,status:r?.status||'idle',maxLevel,active,first,warningMs:WARNING,arriveAt:active&&r.pending?r.pending.arriveAt:m.arriveAt,nextAt:f.nextAt,hint:p.hint,reason,key:[city.id,f.seq,r?.stage||0,r?.status||'idle',r?.attempt||0,level,first,s.buildings.hall,!!s.cityDefense?.incoming,!!s.cityDefense?.battle,f.nextAt].join('|'),meta:m};
  }
  function start(s,city,now,key,api={},level){
    const q=quote(s,city,now,level);if(!q||q.key!==key)return '战线条件已变化，请重新预览';if(q.reason)return q.reason;
    if(typeof api.requestRegional!=='function')return '守城接口尚未准备好';
    const f=s.regionalFront,prior={seq:f.seq,run:f.run,nextAt:f.nextAt};
    if(!q.active){f.seq++;f.run={id:q.meta.id,city:city.id,kind:q.kind,level:q.level,stage:1,status:'ready',attempt:0,startedAt:now,pending:null};}
    const r=f.run,previous={...r};r.attempt=q.meta.attempt;r.status='incoming';r.pending={...q.meta};f.nextAt=0;
    const error=api.requestRegional(r.pending);if(error){if(!q.active)Object.assign(f,prior);else f.run=previous;return error;}
    return null;
  }
  function markBattle(s,b){const r=s.regionalFront?.run;if(!b?.front||b.drill||r?.status!=='incoming'||!matches(s,b.front))return false;r.status='battle';return true;}
  function settle(s,report,now,api={}){
    const f=s.regionalFront,r=f?.run,m=report?.front,q=waveSpec(m);
    if(!q||r?.status!=='battle'||!matches(s,m)||s.cityDefense?.battle||s.cityDefense?.reports?.[0]!==report||report.drill||report.kind!=='defense'||report.regionalFront!==undefined||report.profile!==q.profile||report.level!==m.level||!same(report.rewardSnapshot,q.reward)||!same(report.costSnapshot,q.cost)||!same(report.resourceReceipt?.loaded,report.won?q.reward:{})||report.xp!==(report.won?q.xp:0)||!Number.isSafeInteger(now)||now<m.arriveAt||typeof report.won!=='boolean')return '战线战报不匹配，未重复结算';
    const points=report.won?q.merit:0;if(points&&typeof api.addMerit!=='function'&&(!s.warOrders||!int(s.warOrders.merit)||!int(s.warOrders.earned)))return '军功接口尚未准备好';
    if(points){if(api.addMerit)api.addMerit(points);else {s.warOrders.merit+=points;s.warOrders.earned+=points;}f.earnedMerit+=points;f.wins[r.level][r.stage-1]++;}
    f.last={front:{...m},won:report.won,at:now,merit:points};r.pending=null;
    if(!report.won)r.status='retry';else if(r.stage===3){r.status='complete';f.nextAt=now+COOLDOWN;}else {r.stage++;r.attempt=0;r.status='ready';}
    report.regionalFront={merit:points,first:report.won&&m.first,complete:r.status==='complete'};return null;
  }
  return Object.freeze({WARNING,COOLDOWN,MAX_LEVEL,stages,profiles,init,valid,quote,start,settle,markBattle,waveSpec,matches});
})();
