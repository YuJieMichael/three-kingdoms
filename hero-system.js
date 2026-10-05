'use strict';
// General cultivation and equipment numbers are prototype rules, not historical tables.
const HeroSystem=(()=>{
  const attrs={atk:'勇武',def:'统御',pol:'内政',wis:'智谋',lead:'统率'};
  const slots={weapon:'兵器',armor:'铠甲',helmet:'头盔',accessory:'佩饰'};
  const qualities=['','普通','精良','珍稀'];
  const names={weapon:['','精铁长枪','百炼战刃','龙纹战戟'],armor:['','皮甲','锁子甲','玄铁战甲'],helmet:['','铁盔','明光盔','狮纹金盔'],accessory:['','竹简','青玉佩','龙凤玉印']};
  const bases={weapon:{atk:8,lead:2},armor:{def:8,lead:2},helmet:{def:3,wis:5},accessory:{pol:6,wis:4}};
  const zero=()=>Object.fromEntries(Object.keys(attrs).map(k=>[k,0]));
  function init(s){
    if(!s||!Array.isArray(s.generals))return;
    if(s.heroPoints===undefined)s.heroPoints={};
    if(s.heroDrills===undefined)s.heroDrills={};
    if(s.equipment===undefined)s.equipment=[];
    if(s.equipmentCapacity===undefined)s.equipmentCapacity=50;
    if(s.equipmentSeq===undefined)s.equipmentSeq=0;
    if(s.heroGiftClaimed===undefined)s.heroGiftClaimed=false;
    if(s.heroPoints&&typeof s.heroPoints==='object')for(const id of s.generals)if(s.heroPoints[id]===undefined)s.heroPoints[id]=zero();
  }
  const totalPoints=(s,id)=>Math.max(0,((s.generalLevels[id]||1)-1)*3);
  const remaining=(s,id)=>totalPoints(s,id)-Object.values(s.heroPoints[id]||zero()).reduce((a,b)=>a+b,0);
  const itemName=e=>names[e.slot]?.[e.tier]||'未知装备';
  const requiredLevel=e=>[0,1,5,10][e.tier];
  function stats(e){return Object.fromEntries(Object.entries(bases[e.slot]).map(([id,n])=>[id,Math.round(n*[0,1,2,4][e.tier]*(1+e.enhance*.15))]));}
  function bonus(s,id){const out={...zero(),...(s.heroPoints?.[id]||{})};for(const e of s.equipment||[])if(e.hero===id)for(const [k,n] of Object.entries(stats(e)))out[k]+=n;return out;}
  function validEquipment(e,s){return !!e&&typeof e==='object'&&!Array.isArray(e)&&Number.isSafeInteger(e.id)&&e.id>0&&e.id<=s.equipmentSeq&&Object.hasOwn(slots,e.slot)&&[1,2,3].includes(e.tier)&&Number.isInteger(e.enhance)&&e.enhance>=0&&e.enhance<=10&&(e.hero===''||s.generals.includes(e.hero)&&s.generalLevels[e.hero]>=requiredLevel(e));}
  function valid(s){
    const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
    if(!obj(s.heroPoints)||!obj(s.heroDrills)||!Array.isArray(s.equipment)||!int(s.equipmentSeq)||!Number.isInteger(s.equipmentCapacity)||s.equipmentCapacity<50||s.equipmentCapacity>500||s.equipment.length>s.equipmentCapacity||typeof s.heroGiftClaimed!=='boolean')return false;
    if(!Object.keys(s.heroPoints).every(id=>s.generals.includes(id))||!s.generals.every(id=>obj(s.heroPoints[id])&&Object.keys(s.heroPoints[id]).length===5&&Object.keys(attrs).every(k=>int(s.heroPoints[id][k]))&&remaining(s,id)>=0))return false;
    if(!Object.entries(s.heroDrills).every(([id,d])=>s.generals.includes(id)&&obj(d)&&int(d.day)&&int(d.count)&&d.count<=3))return false;
    if(!s.equipment.every(e=>validEquipment(e,s))||new Set(s.equipment.map(e=>e.id)).size!==s.equipment.length)return false;
    const worn=s.equipment.filter(e=>e.hero).map(e=>e.hero+':'+e.slot);return new Set(worn).size===worn.length;
  }
  // Construction rewards depend on the completed level, not duration or game speed.
  const constructionXp=level=>level*10;
  function addXp(s,id,xp){s.generalXp[id]=(s.generalXp[id]||0)+xp;while(s.generalLevels[id]<10000&&s.generalXp[id]>=s.generalLevels[id]*80){s.generalXp[id]-=s.generalLevels[id]*80;s.generalLevels[id]++;}init(s);}
  function addEquipment(s,slot,tier){const e={id:++s.equipmentSeq,slot,tier,enhance:0,hero:''};s.equipment.push(e);return e;}
  function drops(s,level){
    const result={equipmentDrops:[],equipmentDiscarded:0};
    if(Math.random()>=Math.min(.55,.25+level*.03))return result;
    if(s.equipment.length>=s.equipmentCapacity){result.equipmentDiscarded=1;return result;}
    const r=Math.random(),tier=level>=8&&r<.15?3:level>=3&&r<.45?2:1;
    result.equipmentDrops.push({...addEquipment(s,Object.keys(slots)[Math.floor(Math.random()*4)],tier)});return result;
  }
  const live=()=>{Game.tick();init(Game.state);return Game.state;};
  const busy=id=>!Game.state.generals.includes(id)?'请选择已招募将领':Game.generalBusy(id)?'将领出征或驻守中，请返城后调整':null;
  const save=()=>{Game.save();return null;};
  function allocate(id,points){const s=live(),error=busy(id);if(error)return error;if(!points||Object.keys(points).length!==5||!Object.keys(attrs).every(k=>Number.isSafeInteger(points[k])&&points[k]>=0))return '加点格式不正确';const sum=Object.values(points).reduce((a,b)=>a+b,0);if(sum<1||sum>remaining(s,id))return '可分配属性点不足';for(const k of Object.keys(attrs))s.heroPoints[id][k]+=points[k];return save();}
  function reset(id){const s=live(),error=busy(id);if(error)return error;const used=totalPoints(s,id)-remaining(s,id),count=Math.ceil(s.generalLevels[id]/10);if(!used)return '这位将领没有已分配属性点';if((s.inventory.resetHero||0)<count)return '需要洗髓丹 ×'+count;s.inventory.resetHero-=count;s.heroPoints[id]=zero();Progression.record(s,'item',count);return save();}
  function drillQuote(s,id){const day=Progression.period(Date.now()),d=s.heroDrills[id],used=d?.day===day?d.count:0;return {used,cost:1000*(s.generalLevels[id]||1),xp:80};}
  function drill(id){const s=live(),error=busy(id);if(error)return error;if(s.buildings.drill<1)return '请先建造校场';if(s.generalLevels[id]>=10000)return '将领已达最高等级';const q=drillQuote(s,id);if(q.used>=3)return '今日已操练 3 次，北京时间 05:00 重置';if(s.res.gold<q.cost)return '黄金不足';s.res.gold-=q.cost;s.heroDrills[id]={day:Progression.period(Date.now()),count:q.used+1};addXp(s,id,q.xp);return save();}
  function gift(){const s=live();if(s.heroGiftClaimed)return '将领装备礼包已领取';if(s.equipment.length+8>s.equipmentCapacity)return '需要 8 格装备空间';for(let i=0;i<2;i++)for(const slot of Object.keys(slots))addEquipment(s,slot,1);s.inventory.pearl=(s.inventory.pearl||0)+5;s.inventory.resetHero=(s.inventory.resetHero||0)+2;s.heroGiftClaimed=true;return save();}
  function equip(eid,id){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';const error=busy(id)||(e.hero&&busy(e.hero));if(error)return error;if(s.generalLevels[id]<requiredLevel(e))return '需要将领 '+requiredLevel(e)+' 级';for(const old of s.equipment)if(old.hero===id&&old.slot===e.slot)old.hero='';e.hero=id;return save();}
  function unequip(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e?.hero)return '装备未穿戴';const error=busy(e.hero);if(error)return error;e.hero='';return save();}
  function forgeQuote(slot,tier){if(!Object.hasOwn(slots,slot)||![1,2,3].includes(tier))return null;const factor=[0,1,4,12][tier];return {smith:[0,1,3,6][tier],cost:{wood:1000*factor,stone:800*factor,iron:2000*factor,gold:3000*factor}};}
  function forge(slot,tier){const s=live(),q=forgeQuote(slot,tier);if(!q)return '请选择装备';if(s.buildings.smith<q.smith)return '需要 '+q.smith+' 级铁匠铺';if(s.equipment.length>=s.equipmentCapacity)return '装备库已满';if(!Game.canPay(q.cost))return '打造材料不足';for(const [id,n] of Object.entries(q.cost))s.res[id]-=n;addEquipment(s,slot,tier);return save();}
  function enhanceQuote(e){return {gold:1000*e.tier*(e.enhance+1),pearls:Math.ceil((e.enhance+1)/3)};}
  function enhance(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.hero&&busy(e.hero))return busy(e.hero);if(s.buildings.smith<1)return '请先建造铁匠铺';if(e.enhance>=10)return '强化已达 +10';const q=enhanceQuote(e);if(s.res.gold<q.gold||(s.inventory.pearl||0)<q.pearls)return '黄金或强化宝珠不足';s.res.gold-=q.gold;s.inventory.pearl-=q.pearls;e.enhance++;Progression.record(s,'item',q.pearls);return save();}
  function salvage(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.hero)return '请先卸下装备';s.equipment=s.equipment.filter(x=>x.id!==eid);s.inventory.pearl=(s.inventory.pearl||0)+e.tier+Math.floor(e.enhance/3);return save();}
  function expand(item){const s=live();if(!['rack','rackAdvanced'].includes(item)||(s.inventory[item]||0)<1)return '没有武器架';if(s.equipmentCapacity>=500)return '装备容量已达 500 格';s.equipmentCapacity=Math.min(500,s.equipmentCapacity+(item==='rack'?5:50));s.inventory[item]--;Progression.record(s,'item');return save();}
  for(const [id,effect] of Object.entries({resetHero:'heroReset',rack:'equipmentRack',rackAdvanced:'equipmentRack',pearl:'equipmentMaterial'}))ManualData.shop.find(x=>x.id===id).effect=effect;
  return {attrs,slots,qualities,names,init,valid,validEquipment,totalPoints,remaining,itemName,requiredLevel,stats,bonus,constructionXp,addXp,addEquipment,drops,allocate,reset,drillQuote,drill,gift,equip,unequip,forgeQuote,forge,enhanceQuote,enhance,salvage,expand};
})();
