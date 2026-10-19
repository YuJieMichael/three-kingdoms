'use strict';
// Chapter stage objectives (design/quick-specs/progression-rework-2026-10-18.md §3). A stage is cleared by its own task, not
// only by occupation. Progress comes from existing battle, scout, gather, building and resource records. Trial values.
const ChapterTasks=(()=>{
  const groups={archer:['archer'],spear:['spear'],cavalry:['cavalry','heavy']},groupNames={archer:'弓兵',spear:'枪兵',cavalry:'骑兵（轻骑+铁骑）'};
  const defs={
    field:{kind:'occupy',type:'首战',raid:true,text:'掠夺或占领河畔荒田并获胜'},
    wood:{kind:'occupy',type:'清剿',raid:true,text:'掠夺或占领青竹林并获胜'},
    pass:{kind:'scout',type:'侦察',text:'取得白石隘口的精确侦察报告，在报告有效期内占领'},
    mine:{kind:'collect',type:'冶铁搜集',plot:'mine',level:3,need:3,item:'军械残图',text:'城外铁矿升到 3 级后，掠夺或占领赤铁山胜利 3 次，每次缴获 1 份军械残图'},
    camp:{kind:'army',type:'兵种',share:{archer:.6},lossCap:{archer:.2},guideArmy:{archer:160},text:'弓兵占出征士兵 ≥ 60% 占领黄巾营寨，弓兵伤亡 ≤ 20%'},
    north_road:{kind:'deliver',type:'运粮',cost:{food:5000},text:'先向北原驿道的乡勇运送粮食 5,000，再占领驿道'},
    north_granary:{kind:'defend',type:'守城',counter:{cavalry:150,spear:110,archer:120,shield:60},text:'占领北原粮仓后，黄巾反扑，再打一场守城战'},
    north_ford:{kind:'gather',type:'采集',need:3000,text:'渡口开放后，先派驻军在野地采集资源累计 3,000（备足渡河物资），再占领寒川渡口'},
    north_camp:{kind:'army',type:'兵种',share:{spear:.4},guideArmy:{spear:620,archer:610,shield:300},text:'枪兵占出征士兵 ≥ 40% 占领朔风骑营（枪克骑）'},
    north_pass:{kind:'build',type:'建设',building:'workshop',level:5,text:'工匠作坊升到 5 级（为攻城器械做准备），再占领玄石关'},
    north_keep:{kind:'city',type:'攻城',text:'攻取北原城：每次占领胜利民心 −35，低于 0 易主'},
    luo_outpost:{kind:'deliver',type:'招降',cost:{gold:50000},army:{spear:150,shield:100},text:'先以黄金 50,000 招降孟衡麾下一部（枪兵 150、盾兵 100 归队），再占领洛水前哨'},
    luo_gate:{kind:'siege',type:'器械破门',engines:5,guideArmy:{archer:1650,shield:525,ram:5},text:'带冲车或投石车至少 5 辆（洛水前哨的盟军冲车）攻破城门，占领河洛东门'},
    luo_cavalry:{kind:'army',type:'兵种',share:{cavalry:.5},rounds:6,guideArmy:{cavalry:1100,archer:800,shield:300},text:'骑兵（轻骑+铁骑）占出征士兵 ≥ 50%，6 回合内攻下赤垒外营'},
    luo_wall:{kind:'deliver',type:'委托',cost:{iron:20000},text:'先向城外工坊送去铁锭 20,000 打造攻城器具，再占领白石城垣'},
    luo_citadel:{kind:'occupy',type:'攻城',text:'破城并占领河洛内城'}
  };
  const ids=Object.keys(defs),def=id=>defs[id]||null;
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=n=>Number.isSafeInteger(n)&&n>=0;
  const soldiers=army=>Object.entries(army||{}).filter(([id])=>!['scout','worker','wagon'].includes(id)).reduce((n,[,v])=>n+(v||0),0);
  const groupCount=(army,group)=>groups[group].reduce((n,id)=>n+(army?.[id]||0),0);
  const engines=army=>(army?.ram||0)+(army?.catapult||0);
  const record=(s,id)=>s.stageTasks?.[id]||{};
  const plotLevel=(s,type)=>Math.max(0,...(s.plots||[]).filter(p=>p.type===type).map(p=>p.level));
  // Saves from before v0.35.3 keep every stage they had already reached.
  function init(s){
    if(!s||s.stageTasks!==undefined)return;s.stageTasks={};
    for(const id of ids){const d=defs[id],reached=d.raid||d.kind==='collect'?!!(s.raided?.[id]||s.conquered?.[id]):!!s.conquered?.[id];if(reached)s.stageTasks[id]={done:true};}
  }
  // Every requirement is checked before the march or when the battle is won, so a reached stage is a done stage.
  function done(s,id){
    const d=def(id);if(!d)return !!s?.conquered?.[id];if(record(s,id).done)return true;
    if(d.kind==='collect')return (record(s,id).count||0)>=d.need||!!s.conquered?.[id];
    return d.raid?!!(s.raided?.[id]||s.conquered?.[id]):!!s.conquered?.[id];
  }
  // Pre-attack requirement still open for this stage, or ''.
  function prerequisite(s,id){
    const d=def(id),r=record(s,id);if(!d||done(s,id))return '';
    if(d.plot&&plotLevel(s,d.plot)<d.level)return '先把城外铁矿升到 '+d.level+' 级（当前最高 '+plotLevel(s,d.plot)+' 级）';
    if(d.kind==='deliver'&&!r.delivered)return '先完成'+d.type+'：'+d.text;
    if(d.kind==='gather'&&(r.gathered||0)<d.need)return '先在野地采集资源 '+d.need+'（已采集 '+(r.gathered||0)+'）';
    return '';
  }
  // Blocks a march that could never clear the stage, before any food or troops leave the city.
  function dispatchBlocked(s,n,army,mode,api={}){
    const d=def(n?.id);if(!d||done(s,n.id))return '';
    const before=prerequisite(s,n.id);if(before)return before;
    if(mode!=='occupy'&&d.kind!=='collect')return '';
    if(d.kind==='scout'&&!api.intel?.(n.id)?.exact)return '先取得'+n.name+'的精确侦察报告，再在有效期内占领';
    if(d.kind==='build'&&d.building&&(s.buildings?.[d.building]||0)<d.level)return '先把工匠作坊升到 '+d.level+' 级（当前 '+(s.buildings?.[d.building]||0)+' 级）';
    if(d.engines&&engines(army)<d.engines)return '至少带冲车或投石车 '+d.engines+' 辆（当前 '+engines(army)+' 辆）';
    if(d.share){const total=soldiers(army);for(const [group,share] of Object.entries(d.share)){const have=groupCount(army,group);if(!total||have<total*share)return groupNames[group]+'须占出征士兵 '+Math.round(share*100)+'% 以上（当前 '+(total?Math.floor(have/total*100):0)+'%）';}}
    return '';
  }
  function counterArmy(s,n){const d=def(n?.id);return d?.kind==='defend'&&record(s,n.id).pending&&!s.conquered?.[n.id]?{...d.counter}:null;}
  // Called on every won battle at a stage. claim: true/false overrides whether this win occupies the stage; null keeps the rule.
  function victory(s,n,mode,f){
    const d=def(n?.id);if(!d||done(s,n.id))return {claim:null,note:''};
    if(!s.stageTasks)s.stageTasks={};const r=s.stageTasks[n.id]||(s.stageTasks[n.id]={});
    if(d.kind==='collect'){r.count=Math.min(d.need,(r.count||0)+1);return {claim:r.count>=d.need?true:false,note:'缴获'+d.item+' 1 份（'+r.count+' / '+d.need+'）'+(r.count>=d.need?'，'+n.name+'平定。':'。')};}
    if(mode!=='occupy')return {claim:null,note:''};
    if(d.kind==='defend'){if(!r.pending){r.pending=true;return {claim:false,note:'黄巾反扑！'+n.name+'尚未稳固，再打一场守城战。'};}delete r.pending;return {claim:true,note:'守住反扑，'+n.name+'平定。'};}
    if(d.lossCap)for(const [group,cap] of Object.entries(d.lossCap)){const sent=groupCount(f.army,group),lost=sent-groupCount(f.alive,group);if(sent&&lost>sent*cap)return {claim:false,note:groupNames[group]+'伤亡 '+Math.round(lost/sent*100)+'%，超过 '+Math.round(cap*100)+'%：任务未达成，据点未平定，可重新出征。'};}
    if(d.rounds&&f.rounds>d.rounds)return {claim:false,note:'用了 '+f.rounds+' 回合，超过 '+d.rounds+' 回合：任务未达成，据点未平定，可重新出征。'};
    return {claim:null,note:''};
  }
  function deliverQuote(s,id){
    const d=def(id);if(!d||d.kind!=='deliver')return {reason:'这一关不需要运送'};
    if(done(s,id)||record(s,id).delivered)return {reason:'已完成'};if(blocked(s,id))return {reason:blocked(s,id)};
    const short=Object.entries(d.cost).filter(([k,n])=>(s.res?.[k]||0)<n).map(([k])=>k);
    return {reason:short.length?'资源不足':'',cost:{...d.cost},army:d.army?{...d.army}:null,short};
  }
  // A stage can be worked on once its chapter and previous stage are done (ChapterData.blocked; chapter one is always open).
  const blocked=(s,id)=>typeof ChapterData!=='undefined'?ChapterData.blocked(s,id):null;
  function deliver(s,id){const q=deliverQuote(s,id);if(q.reason)return q.reason;for(const [k,n] of Object.entries(q.cost))s.res[k]-=n;if(q.army)for(const [k,n] of Object.entries(q.army))s.army[k]=(s.army[k]||0)+n;(s.stageTasks[id]||(s.stageTasks[id]={})).delivered=true;return null;}
  // Gathering counts toward a gather stage while that stage is open (its chapter and previous stage done) and not yet taken.
  function onGather(s,amount){for(const id of ids){const d=defs[id];if(d.kind!=='gather'||done(s,id)||blocked(s,id))continue;const r=s.stageTasks[id]||(s.stageTasks[id]={});r.gathered=Math.min(d.need,(r.gathered||0)+Math.max(0,Math.floor(amount)));}}
  function view(s,id,apiArg={}){
    const d=def(id);if(!d)return null;const r=record(s,id),cleared=done(s,id);let progress='';
    if(d.kind==='collect')progress=(d.plot&&plotLevel(s,d.plot)<d.level?'铁矿最高 '+plotLevel(s,d.plot)+' / '+d.level+' 级 · ':'')+(r.count||0)+' / '+d.need+' 份'+d.item;
    else if(d.kind==='gather')progress='已采集 '+(r.gathered||0)+' / '+d.need;
    else if(d.kind==='deliver')progress=r.delivered?'已运送，可以出征':'待运送';
    else if(d.kind==='defend')progress=r.pending?'反扑来袭，待守城':'';
    else if(d.kind==='build')progress='工匠作坊 '+(s.buildings?.[d.building]||0)+' / '+d.level+' 级';
    else if(d.kind==='scout')progress=apiArg.intel?.(id)?.exact?'已有精确报告':'未取得精确报告';
    return {id,kind:d.kind,type:d.type,text:d.text,progress,done:cleared,pending:!!r.pending,deliver:d.kind==='deliver'&&!r.delivered&&!cleared&&!blocked(s,id),cost:d.cost?{...d.cost}:null,guideArmy:d.guideArmy?{...d.guideArmy}:null};
  }
  function valid(s){
    const t=s?.stageTasks;if(!object(t))return false;
    return Object.entries(t).every(([id,r])=>Object.hasOwn(defs,id)&&object(r)&&Object.keys(r).every(k=>['done','count','delivered','pending','gathered'].includes(k))&&(r.done===undefined||r.done===true)&&(r.delivered===undefined||r.delivered===true)&&(r.pending===undefined||r.pending===true)&&(r.count===undefined||int(r.count)&&r.count<=(defs[id].need||0))&&(r.gathered===undefined||int(r.gathered)&&r.gathered<=(defs[id].need||0)));
  }
  return {prerequisite,defs,ids,def,init,done,dispatchBlocked,counterArmy,victory,deliverQuote,deliver,onGather,view,valid,soldiers,groupCount,engines,plotLevel};
})();
