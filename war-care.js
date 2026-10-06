'use strict';
// v0.33: per-city defense doctrine and a paid hospital. Old returned wounded are not reclaimed.
const WarCare=(()=>{
  const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const int=n=>Number.isSafeInteger(n)&&n>=0;
  const time=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
  const roster=u=>u||(typeof ManualData!=='undefined'?ManualData.units:{});
  const blank=u=>Object.fromEntries(Object.keys(roster(u)).map(id=>[id,0]));
  const sum=a=>Object.values(a).reduce((n,v)=>n+v,0);
  const same=(a,b)=>JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort());
  const counts=(a,u,full=true)=>obj(a)&&(!full||Object.keys(u).every(id=>int(a[id])))&&Object.entries(a).every(([id,n])=>Object.hasOwn(u,id)&&int(n));
  function defaultDefense(u){return {mode:'field',autoResolve:true,orders:Object.fromEntries(Object.keys(roster(u)).map(id=>[id,{command:'hold',target:''}]))};}
  function init(s,u){u=roster(u);if(s.warCare===undefined)s.warCare={version:1,defense:defaultDefense(u),autoHeal:false,wounded:blank(u),admitted:blank(u),treated:blank(u),receipts:{},archived:{counts:blank(u),through:{}}};return s.warCare;}
  const cityOf=s=>s.scopeID||s.realm?.activeCity;
  function token(id){const m=/^(field|npc|pvp):([^:]+):([0-9]+)(?::([^:]+))?$/.exec(id),sequence=m?Number(m[3]):NaN;return m&&int(sequence)&&sequence>0&&(m[1]!=='npc'?!!m[4]:!m[4])?{city:m[2],channel:m[1]+':'+m[2]+(m[1]!=='npc'?':'+m[4]:''),sequence}:null;}
  function validDefense(d,u){u=roster(u);return obj(d)&&['field','inside'].includes(d.mode)&&typeof d.autoResolve==='boolean'&&obj(d.orders)&&Object.keys(d.orders).length===Object.keys(u).length&&Object.keys(u).every(id=>{const r=d.orders[id];return obj(r)&&Object.keys(r).length===2&&['advance','hold','fallback'].includes(r.command)&&typeof r.target==='string'&&(r.target===''||Object.hasOwn(u,r.target));});}
  function valid(s,u){
    u=roster(u);const w=s.warCare;if(!obj(w)||w.version!==1||!validDefense(w.defense,u)||typeof w.autoHeal!=='boolean'||![w.wounded,w.admitted,w.treated].every(a=>counts(a,u))||!obj(w.receipts))return false;
    if(!obj(w.archived)||!counts(w.archived.counts,u)||!obj(w.archived.through)||Object.entries(w.archived.through).some(([channel,n])=>!/^(npc:[^:]+|(field|pvp):[^:]+:[^:]+)$/.test(channel)||cityOf(s)&&channel.split(':')[1]!==cityOf(s)||!int(n))||Object.keys(w.receipts).length>100)return false;
    const total={...w.archived.counts};
    for(const [id,r]of Object.entries(w.receipts)){const t=token(id);if(!t||id.length>200||cityOf(s)&&t.city!==cityOf(s)||t.sequence<=(w.archived.through[t.channel]||0)||!obj(r)||Object.keys(r).length!==2||!time(r.at)||!counts(r.counts,u,false)||!sum(r.counts))return false;for(const [unit,n]of Object.entries(r.counts)){total[unit]+=n;if(!int(total[unit]))return false;}}
    if(!Object.keys(u).every(id=>total[id]===w.admitted[id]&&w.treated[id]<=w.admitted[id]&&w.wounded[id]===w.admitted[id]-w.treated[id]))return false;
    if(w.lastAuto!==undefined){const r=w.lastAuto;if(!obj(r)||!time(r.at)||!['healed','gold','remaining'].every(k=>int(r[k]))||typeof r.blocked!=='boolean')return false;}
    return true;
  }
  function setDefense(s,d,u){if(!validDefense(d,u))return '守城战术格式不正确';if(s.cityDefense?.battle)return '当前守城战使用已冻结战术，请结束后再调整';s.warCare.defense=JSON.parse(JSON.stringify(d));return null;}
  function defenseSnapshot(s,u){return JSON.parse(JSON.stringify(s.warCare?.defense||defaultDefense(u)));}
  function admit(s,id,a,now,u){
    u=roster(u);init(s,u);const t=typeof id==='string'?token(id):null;if(!t||id.length>200||cityOf(s)&&t.city!==cityOf(s)||!time(now)||!counts(a,u,false))return '伤兵来源记录不正确';
    const positive=Object.fromEntries(Object.entries(a).filter(([,n])=>n>0)),w=s.warCare,old=w.receipts[id];
    if(old)return same(old.counts,positive)?null:'同一战斗的伤兵记录不匹配';
    if(t.sequence<=(w.archived.through[t.channel]||0))return '该历史战斗的伤兵已经结算';
    if(!sum(positive))return null;
    if(Object.entries(positive).some(([unit,n])=>!int(w.admitted[unit]+n)||!int(w.wounded[unit]+n)))return '伤兵数量达到数值上限';
    w.receipts[id]={at:now,counts:positive};for(const [unit,n]of Object.entries(positive)){w.admitted[unit]+=n;w.wounded[unit]+=n;}
    if(Object.keys(w.receipts).length>100){const [retired,r]=Object.entries(w.receipts).sort((a,b)=>a[1].at-b[1].at||token(a[0]).sequence-token(b[0]).sequence)[0],past=token(retired);w.archived.through[past.channel]=Math.max(w.archived.through[past.channel]||0,past.sequence);for(const [unit,n]of Object.entries(r.counts))w.archived.counts[unit]+=n;delete w.receipts[retired];}
    return null;
  }
  // Trial gold price: 5% of one soldier's original recruitment materials, minimum 1.
  function price(id,u){const row=roster(u)[id];return row?Math.max(1,Math.ceil(Object.entries(row.cost||{}).filter(([r])=>['food','wood','stone','iron'].includes(r)).reduce((n,[,v])=>n+v,0)*.05)):null;}
  function quote(s,unit='all',count,u){
    u=roster(u);const w=s.warCare;if(!w||unit!=='all'&&!Object.hasOwn(u,unit))return null;
    const available=unit==='all'?sum(w.wounded):w.wounded[unit];
    if(count!==undefined&&(!int(count)||unit==='all'))return null;
    const amount=count===undefined?available:Math.min(count,available),selected=unit==='all'?{...w.wounded}:{[unit]:amount},gold=sum(Object.fromEntries(Object.entries(selected).map(([id,n])=>[id,n*price(id,u)])));
    const rows=Object.keys(u).map(id=>({id,count:w.wounded[id],price:price(id,u),gold:w.wounded[id]*price(id,u),affordable:Math.min(w.wounded[id],Math.floor(s.res.gold/price(id,u)))}));
    const reason=!int(gold)||!int(amount)?'治疗数量达到数值上限':!amount?'本城没有待治疗的伤兵':gold>s.res.gold?'黄金不足：需要 '+gold+'，现有 '+Math.floor(s.res.gold):Object.entries(selected).some(([id,n])=>!int((s.army[id]||0)+n))?'驻军数量达到数值上限':'';
    return {unit,count:amount,selected,gold,available,rows,autoHeal:w.autoHeal,reason,key:[unit,amount,w.wounded[unit]??available,sum(w.treated)].join('|'),lastAuto:w.lastAuto?{...w.lastAuto}:null};
  }
  function heal(s,unit='all',count,key,u){
    const q=quote(s,unit,count,u);if(!q)return '请选择有效兵种与治疗人数';if(key!==undefined&&key!==q.key)return '治疗预览已变化，请重新查看';if(q.reason)return q.reason;
    s.res.gold-=q.gold;for(const [id,n]of Object.entries(q.selected)){s.warCare.wounded[id]-=n;s.warCare.treated[id]+=n;s.army[id]=(s.army[id]||0)+n;}
    return {healed:q.count,gold:q.gold,counts:{...q.selected}};
  }
  function setAuto(s,enabled){if(typeof enabled!=='boolean')return '请选择是否自动治疗';s.warCare.autoHeal=enabled;return null;}
  function tick(s,now,u){
    u=roster(u);const w=s.warCare;if(!w?.autoHeal||!sum(w.wounded))return null;let healed=0,gold=0;
    for(const id of Object.keys(u)){const n=Math.min(w.wounded[id],Math.floor(s.res.gold/price(id,u)));if(!n)continue;const result=heal(s,id,n,undefined,u);if(typeof result==='string')continue;healed+=result.healed;gold+=result.gold;}
    const remaining=sum(w.wounded),blocked=remaining>0;
    if(healed||!w.lastAuto||w.lastAuto.remaining!==remaining||w.lastAuto.blocked!==blocked)w.lastAuto={at:now,healed,gold,remaining,blocked};
    return {healed,gold,remaining,blocked};
  }
  return {init,valid,validDefense,defaultDefense,setDefense,defenseSnapshot,admit,price,quote,heal,setAuto,tick,heldArmy:s=>({...s.warCare?.wounded})};
})();
