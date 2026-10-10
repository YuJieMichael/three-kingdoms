'use strict';
// Legendary named weapons (design/quick-specs/legendary-weapons-2026-10-09.md), vanilla-WoW style:
// rare scroll halves from the hardest repeatable fights → an inn rumour reveals a hidden site for 72 h →
// smelt a weapon blank from large material costs → an awakening battle (once per day) → the weapon is born.
// First weapon: 青龙偃月刀. State: s.legendary.qinglong.
const LegendaryWeapons=(()=>{
  const HOUR=3600000,DAY=86400000;
  const weapons=Object.freeze({
    qinglong:Object.freeze({id:'qinglong',name:'青龙偃月刀',owner:'guanyu',ownerName:'关羽',scrolls:['qinglongScrollUpper','qinglongScrollLower'],
      dropChance:.015,siteName:'青龙冢',rumour:'冷艳锯',
      materials:{meteor:40,refined:20},cost:{jade:10,blueprint:30,gold:5000000},
      spirit:{name:'青龙刀灵',title:'沉睡的刀魂',attack:1.5,defense:1.4,order:'advance'},
      // Story beats (design/narrative/legendary-qinglong-story.md), shown in the smithy as the line advances.
      story:{scrolls:'韩铁当年为一位红面长须的义士铸刀：九尺五寸，八十二斤，吞口铸青龙。董卓焚洛阳，刀谱被西凉兵扯作两半，上卷流落关外野地，下卷辗转落入豪强府库。',smelt:'两卷合璧，刀谱发烫。荒野古冢里传出刀鸣——刀被劫出洛阳后陷于山洪，刀灵沉睡至今。照谱所记，须以陨铁为骨、精金为刃、玉石镇魂，重铸刀胚。',awaken:'刀胚抬到冢前，青光化作长龙盘踞冢上。刀灵不认刀胚，也不认旁人——它只等那位红面长须的义士。须由关羽亲自出阵，刀灵才肯现身一战。',done:'刀灵与关羽一战，青龙俯首，没入刀胚。锈迹剥落，九尺长刀寒光逼人。神兵归于主公帐下，交予任何将领都能发出拖刀斩；握在关羽手中，刀势更盛。'},
      army:{cavalry:8000,spear:8000,shield:6000,archer:6000,heavy:2000},rule:{kind:'spirit',every:3,share:.15,total:20000},
      proc:{chance:.15,ownerChance:.25},desc:'「拖刀斩」：每回合 15% 几率让主将部队额外出手一次；关羽持刀时 25%。'})
  });
  const C=Object.freeze({siteMs:72*HOUR,retryMs:DAY,meteorPerGather:5,meteorLevel:9,refinedIron:50000,refinedDaily:5,refinedSpecialty:3});
  const STAGES=['scrolls','seek','smelt','awaken','done'];
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=n=>Number.isSafeInteger(n)&&n>=0;
  const fresh=()=>({stage:'scrolls',site:'',siteUntil:0,meteor:0,refined:0,refinedDay:-1,refinedToday:0,lastTry:0,obtainedAt:0,announced:false});
  const get=(s,id='qinglong')=>s.legendary?.[id]||fresh();
  function ensure(s,id='qinglong'){if(!s.legendary)s.legendary={};if(!s.legendary[id])s.legendary[id]=fresh();return s.legendary[id];}
  function valid(s){const L=s.legendary;if(L===undefined)return true;if(!object(L)||!Object.keys(L).every(id=>Object.hasOwn(weapons,id)))return false;return Object.values(L).every(r=>object(r)&&Object.keys(r).length===10&&STAGES.includes(r.stage)&&typeof r.site==='string'&&(r.site===''||/^wild_\d{1,2}_\d{1,2}$/.test(r.site))&&int(r.siteUntil)&&int(r.meteor)&&int(r.refined)&&Number.isSafeInteger(r.refinedDay)&&r.refinedDay>=-1&&int(r.refinedToday)&&int(r.lastTry)&&int(r.obtainedAt)&&typeof r.announced==='boolean');}
  const hasScrolls=(s,w)=>w.scrolls.every(id=>(s.inventory?.[id]||0)>0);
  const open=s=>typeof ChapterData!=='undefined'&&ChapterData.completed(s,4);
  // Scroll halves drop from level 9-10 wild wins and famous-general city battles once chapter 4 is cleared.
  function rollScrolls(s,n,random=Math.random){const out={};const w=weapons.qinglong,r=get(s);if(!open(s)||r.stage==='done')return out;
    const eligible=(n.wild&&n.level>=9)||(typeof NamedGarrison!=='undefined'&&NamedGarrison.has(n.id));if(!eligible)return out;
    for(const id of w.scrolls)if(!(s.inventory?.[id]>0)&&random()<w.dropChance)out[id]=1;return out;}
  // Hidden site: a free wild tile 3-6 cells from the home city, valid for 72 hours.
  function seek(s,now,api){const w=weapons.qinglong,r=ensure(s);if(r.stage==='done')return '神兵已经出世';if(!hasScrolls(s,w))return '客栈里没有这样的传闻';if(r.site&&r.siteUntil>now)return '冷艳锯已现，去'+w.siteName+'看看';
    const h=api.home(),tiles=[];for(let dx=-6;dx<=6;dx++)for(let dy=-6;dy<=6;dy++){const d=Math.max(Math.abs(dx),Math.abs(dy));if(d<3)continue;const x=h.x+dx,y=h.y+dy,id='wild_'+x+'_'+y,t=api.getNode(id);if(t?.wild&&!s.conquered?.[id]&&!s.landClaims?.[id])tiles.push(id);}
    if(!tiles.length)return '附近没有可以显现的荒野';r.site=tiles[Math.floor(api.random()*tiles.length)];r.siteUntil=now+C.siteMs;if(r.stage==='scrolls'||r.stage==='seek')r.stage='smelt';return null;}
  const siteActive=(s,id,now)=>{const r=get(s);return r.site===id&&r.siteUntil>now&&r.stage!=='done';};
  // Materials: 陨铁 from gathering on level 9+ owned tiles; 精金 refined from iron where a 冶署 is level 3+.
  function onGather(s,level){const r=s.legendary?.qinglong;if(r&&r.stage!=='done'&&r.stage!=='scrolls'&&level>=C.meteorLevel)r.meteor=Math.min(weapons.qinglong.materials.meteor,r.meteor+C.meteorPerGather);}
  function refineQuote(s,now,api){const r=get(s),day=Math.floor(now/DAY),used=r.refinedDay===day?r.refinedToday:0,w=weapons.qinglong;
    const reason=r.stage==='scrolls'||r.stage==='done'?'现在不需要精金':r.refined>=w.materials.refined?'精金已够':api.mineSpecialty()<C.refinedSpecialty?'需要一座冶署 3 级以上的城':used>=C.refinedDaily?'今日精炼次数已用完':(s.res.iron||0)<C.refinedIron?'铁锭不足':'';return {iron:C.refinedIron,used,limit:C.refinedDaily,reason};}
  function refine(s,now,api){const q=refineQuote(s,now,api);if(q.reason)return q.reason;const r=ensure(s),day=Math.floor(now/DAY);s.res.iron-=q.iron;if(r.refinedDay!==day){r.refinedDay=day;r.refinedToday=0;}r.refinedToday++;r.refined++;return null;}
  function smeltQuote(s){const r=get(s),w=weapons.qinglong,m=w.materials,c=w.cost;
    const reason=r.stage!=='smelt'?(r.stage==='awaken'?'刀胚已成':'先找到冷艳锯'):r.meteor<m.meteor?'陨铁不足':r.refined<m.refined?'精金不足':(s.jewels?.jade||0)<c.jade?'玉石不足':(s.inventory?.blueprint||0)<c.blueprint?'图纸不足':(s.res?.gold||0)<c.gold?'黄金不足':'';return {reason,materials:m,cost:c,have:{meteor:r.meteor,refined:r.refined}};}
  function smelt(s){const q=smeltQuote(s);if(q.reason)return q.reason;const r=ensure(s),w=weapons.qinglong;s.jewels.jade-=w.cost.jade;s.inventory.blueprint-=w.cost.blueprint;s.res.gold-=w.cost.gold;r.meteor=0;r.refined=0;for(const id of w.scrolls)s.inventory[id]--;r.stage='awaken';return null;}
  // The awakening battle happens at the hidden site; getNode replaces the wild tile there.
  function siteNode(s,id,base,now){const w=weapons.qinglong;if(!siteActive(s,id,now))return null;return {...base,name:w.siteName,level:10,army:{...w.army},commander:{...w.spirit},rule:{...w.rule},legendSite:'qinglong',desc:'荒草间一座古冢，刀鸣隐隐，青光时现。熔炼好刀胚后，由关羽亲自为主将、带不超过 '+w.rule.total+' 名士兵前来唤醒神兵；青龙刀灵每 '+w.rule.every+' 回合斩我军前排 '+Math.round(w.rule.share*100)+'%。每天只能挑战一次。'};}
  // Owner decision: only 关羽 leading the army can wake the blade.
  function awakenBlocked(s,now,general){const r=get(s);if(r.stage!=='awaken')return '先熔炼好刀胚';if(general!==undefined&&HeroIdentity.key(s,general)!==weapons.qinglong.owner)return '青龙刀灵只认关羽：请让关羽担任主将';if(now-r.lastTry<C.retryMs)return '刀魂已沉睡，明日再来';return '';}
  function onDispatch(s,now){ensure(s).lastTry=now;}
  function onBattle(s,n,o,now,addEquipment){if(!n.legendSite||!o.won)return false;const r=ensure(s);if(r.stage!=='awaken')return false;addEquipment(s,'weapon',5,'qinglong');r.stage='done';r.obtainedAt=now;r.site='';r.siteUntil=0;return true;}
  // Battle proc for the army led by `general` (the wearer).
  function procChance(s,general){const e=(s.equipment||[]).find(x=>x.hero===general&&x.named==='qinglong');if(!e)return 0;const w=weapons.qinglong;return HeroIdentity.key(s,general)===w.owner?w.proc.ownerChance:w.proc.chance;}
  function status(s,now){const r=get(s),w=weapons.qinglong;return {...r,weapon:w,open:open(s),scrolls:w.scrolls.map(id=>(s.inventory?.[id]||0)>0),siteActive:!!r.site&&r.siteUntil>now&&r.stage!=='done'};}
  return {C,weapons,valid,rollScrolls,seek,siteActive,siteNode,onGather,refineQuote,refine,smeltQuote,smelt,awakenBlocked,onDispatch,onBattle,procChance,status,hasScrolls:s=>hasScrolls(s,weapons.qinglong)};
})();
// Scroll halves are inventory items so they show in battle reports and the bag.
if(typeof ManualData!=='undefined')ManualData.shop.push(
  {id:'qinglongScrollUpper',name:'青龙刀谱·上卷',category:'宝物',effect:'legendScroll',rewardOnly:true,price:0,seconds:0,desc:'残缺的刀谱上卷，记载一柄青龙宝刀的锻法。与下卷合璧后，客栈或许会有传闻。'},
  {id:'qinglongScrollLower',name:'青龙刀谱·下卷',category:'宝物',effect:'legendScroll',rewardOnly:true,price:0,seconds:0,desc:'残缺的刀谱下卷。与上卷合璧后，客栈或许会有传闻。'}
);
