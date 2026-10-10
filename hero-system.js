'use strict';
// General cultivation and equipment numbers are prototype rules, not historical tables.
const HeroSystem=(()=>{
  const attrs={atk:'勇武',def:'统御',pol:'内政',wis:'智谋',lead:'统率'};
  // Free points only raise these three; 统御 and 统率 grow from level and equipment.
  const allocatable=['atk','pol','wis'];
  const legacySlots=['weapon','armor','helmet','accessory'];
  const forgeSlots=[...legacySlots,'cloak','bracer','boots'];
  const slots={weapon:'兵器',helmet:'头盔',armor:'铠甲',cloak:'披风',bracer:'护腕',boots:'战靴',mount:'坐骑',accessory:'奇物'};
  const qualities=['','普通','精良','珍稀','传说','神兵'];
  const names={weapon:['','精铁长枪','百炼战刃','龙纹战戟','赤霄战戟'],armor:['','皮甲','锁子甲','玄铁战甲','麒麟宝铠'],helmet:['','铁盔','明光盔','狮纹金盔','凤翅紫金冠'],accessory:['','竹简','青玉佩','龙凤玉印','传国玉珏'],cloak:['','布披风','锦披风','云纹披风','御风披风'],bracer:['','皮护腕','铁护腕','玄铁护腕','龙纹护腕'],boots:['','布战靴','皮战靴','踏云战靴','御风战靴'],mount:['','驮马','良马','骏马','名驹']};
  const bases={weapon:{atk:8,lead:2},armor:{def:8,lead:2},helmet:{def:3,wis:5},accessory:{pol:6,wis:4},cloak:{def:2,wis:2},bracer:{atk:3,def:1},boots:{def:2}};
  const zero=()=>Object.fromEntries(Object.keys(attrs).map(k=>[k,0]));
  // Prototype: defeated wild generals are held first, then recruited manually.
  // Fixed leads and attributes make repeated inquiries unable to reroll rewards.
  const wild=(()=>{
    const definitions=[
      {line:'wanderer',name:'陈岚',title:'山林游侠',historical:false,fieldLevel:1,anchor:{x:28,y:34},level:2,atk:68,def:56,pol:48,wis:52,bonus:'cavalry',portraitPrice:10,noble:0,gold:6000,jewels:{pearl:1}},
      {line:'warrior',name:'魏延',title:'在野骁将',historical:true,fieldLevel:3,anchor:{x:21,y:30},level:4,atk:84,def:76,pol:48,wis:58,bonus:'spear',portraitPrice:30,noble:1,gold:25000,jewels:{pearl:2,coral:2}},
      {line:'strategist',name:'徐庶',title:'在野谋士',historical:true,fieldLevel:5,anchor:{x:11,y:34},level:6,atk:58,def:68,pol:88,wis:92,bonus:'shield',portraitPrice:50,noble:2,gold:60000,jewels:{coral:2,glass:3}},
      {line:'zhaoyun',name:'赵云',title:'常山骁骑',historical:true,region:'河北',minInn:2,fieldLevel:4,anchor:{x:32,y:16},level:5,atk:92,def:88,pol:52,wis:70,bonus:'cavalry',portraitPrice:60,noble:1,gold:80000,jewels:{pearl:3,coral:3}},
      {line:'huangzhong',name:'黄忠',title:'荆襄神射',historical:true,region:'荆州',minInn:2,fieldLevel:5,anchor:{x:32,y:53},level:6,atk:94,def:80,pol:48,wis:66,bonus:'archer',portraitPrice:70,noble:2,gold:100000,jewels:{coral:4,glass:2}},
      {line:'ganning',name:'甘宁',title:'江东猛将',historical:true,region:'江东',minInn:3,fieldLevel:6,anchor:{x:54,y:43},level:7,atk:90,def:82,pol:42,wis:64,bonus:'cavalry',portraitPrice:85,noble:3,gold:140000,jewels:{coral:4,glass:4}},
      {line:'zhangliao',name:'张辽',title:'雁门雄将',historical:true,region:'并州',minInn:3,fieldLevel:6,anchor:{x:12,y:17},level:7,atk:91,def:92,pol:62,wis:78,bonus:'spear',portraitPrice:85,noble:3,gold:140000,jewels:{coral:4,glass:4}},
      {line:'machao',name:'马超',title:'西凉铁骑',historical:true,region:'西凉',minInn:3,fieldLevel:7,anchor:{x:3,y:24},level:8,atk:98,def:87,pol:40,wis:62,bonus:'cavalry',portraitPrice:100,noble:4,gold:180000,jewels:{glass:5,jade:2}},
      {line:'xunyu',name:'荀彧',title:'颍川王佐',historical:true,region:'中原',minInn:4,fieldLevel:7,anchor:{x:8,y:10},level:8,atk:44,def:68,pol:99,wis:96,bonus:'shield',portraitPrice:100,noble:4,gold:180000,jewels:{glass:5,jade:2}},
      {line:'pangtong',name:'庞统',title:'荆襄凤雏',historical:true,region:'南境',minInn:4,fieldLevel:8,anchor:{x:15,y:62},level:9,atk:48,def:65,pol:92,wis:100,bonus:'catapult',portraitPrice:120,noble:5,gold:240000,jewels:{jade:4,agate:2}},
      {line:'zhouyu',name:'周瑜',title:'江东都督',historical:true,region:'东南',minInn:5,fieldLevel:9,anchor:{x:61,y:61},level:10,atk:82,def:88,pol:89,wis:99,bonus:'archer',portraitPrice:150,noble:6,gold:320000,jewels:{jade:5,agate:3}},
      {line:'guanyu',name:'关羽',title:'河东武圣',historical:true,region:'北境',minInn:5,fieldLevel:10,anchor:{x:0,y:0},level:12,atk:105,def:100,pol:66,wis:74,bonus:'cavalry',portraitPrice:180,noble:7,gold:400000,jewels:{agate:5,crystal:3}}
    ];
    const ID_BASE=1000000000000000,MAX_SEQ=1000000;
    const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),integer=n=>Number.isSafeInteger(n)&&n>=0;
    const definition=line=>definitions.find(d=>d.line===line);
    function initWild(s){
      if(s.wildGenerals===undefined)s.wildGenerals={version:1,seq:0,rumors:[],captives:[],recruited:[],portraits:[]};
      if(object(s.wildGenerals)&&s.wildGenerals.portraits===undefined)s.wildGenerals.portraits=[];
      if(s.heroLoyalty===undefined)s.heroLoyalty={};
      if(object(s.heroLoyalty))for(const id of s.generals)if(s.heroLoyalty[id]===undefined)s.heroLoyalty[id]=80;
    }
    const heldCaptives=s=>(s.wildGenerals?.captives?.length||0)+(s.heroService?.captives?.length||0);
    const roomUsed=s=>s.generals.length+heldCaptives(s);
    const roomCapacity=s=>Game.heroCapacity?.(s)??s.buildings.tavern;
    function unlockReason(s,d){return !d.minInn?'':s.buildings.inn<d.minInn?'需要 '+d.minInn+' 级客栈':s.honors.noble<d.noble?'需要爵位 '+HeritageData.nobles[d.noble].name:'';}
    function codex(s){return definitions.map(d=>{const r=s.wildGenerals?.rumors?.find(r=>r.line===d.line),reason=unlockReason(s,d);return {...d,region:d.region||'近郊',locked:!!reason,reason,status:r?.status||'undiscovered',portraitOwned:portraitOwned(s,d.line),node:r?.node||null,heroId:r?.id||null};});}
    const loyalty=(s,id)=>s.heroLoyalty?.[id]??s.wildGenerals?.captives?.find(c=>c.id===id)?.loyalty??80;
    const portraitOwned=(s,line)=>!!s.wildGenerals?.portraits?.includes(line);
    const hero=(d,id,node)=>({id,name:d.name,title:d.title,type:'将',level:d.level,atk:d.atk,def:d.def,pol:d.pol,wis:d.wis,lead:d.level*10,price:d.gold,bonus:d.bonus,desc:d.historical?'在野历史将领，数值与招降条件为本作试玩设定。':'山林中的游侠，清剿其驻守野地后可手动招降。',origin:'wild',wildLine:d.line,sourceNode:node});
    function validId(id,s){const seq=s.wildGenerals?.seq;if(!integer(seq)||typeof id!=='string'||!/^local_\d+$/.test(id))return false;const n=Number(id.slice(6));return Number.isSafeInteger(n)&&n>ID_BASE&&n<=ID_BASE+seq;}
    function nodeValid(id,s){const m=/^wild_(\d{1,2})_(\d{1,2})$/.exec(id||'');return !!m&&Number(m[1])<64&&Number(m[2])<64&&id==='wild_'+Number(m[1])+'_'+Number(m[2])&&!!Game.getNode(id,s)?.wild;}
    function validWild(s){
      const w=s.wildGenerals;if(!object(w)||w.version!==1||!integer(w.seq)||w.seq>MAX_SEQ||!Array.isArray(w.rumors)||w.rumors.length>definitions.length||!Array.isArray(w.captives)||w.captives.length>definitions.length||!Array.isArray(w.recruited)||w.recruited.length>definitions.length||!Array.isArray(w.portraits)||w.portraits.length>definitions.length||!w.portraits.every(line=>!!definition(line))||new Set(w.portraits).size!==w.portraits.length||!object(s.heroLoyalty))return false;
      if(!s.generals.every(id=>Number.isInteger(s.heroLoyalty[id])&&s.heroLoyalty[id]>=0&&s.heroLoyalty[id]<=100)||!Object.keys(s.heroLoyalty).every(id=>s.generals.includes(id)))return false;
      if(!w.rumors.every(r=>object(r)&&definition(r.line)&&validId(r.id,s)&&nodeValid(r.node,s)&&integer(r.at)&&['active','captive','recruited','released'].includes(r.status)))return false;
      if(new Set(w.rumors.map(r=>r.line)).size!==w.rumors.length||new Set(w.rumors.map(r=>r.id)).size!==w.rumors.length||new Set(w.rumors.filter(r=>r.status==='active').map(r=>r.node)).size!==w.rumors.filter(r=>r.status==='active').length)return false;
      if(!w.captives.every(c=>{const d=definition(c?.line),r=w.rumors.find(r=>r.id===c?.id),expected=d&&hero(d,c.id,c.node);return object(c)&&!!d&&!!r&&r.line===c.line&&r.node===c.node&&r.status==='captive'&&integer(c.at)&&c.loyalty===40&&object(c.hero)&&Object.entries(expected).every(([k,v])=>c.hero[k]===v)&&!s.generals.includes(c.id)&&!s.customGenerals.some(g=>g.id===c.id);} ))return false;
      if(new Set(w.captives.map(c=>c.id)).size!==w.captives.length||s.customGenerals.length+w.captives.length>100||new Set(w.recruited).size!==w.recruited.length)return false;
      if(!w.recruited.every(id=>s.generals.includes(id)&&s.customGenerals.some(g=>g.id===id&&g.origin==='wild')&&w.rumors.some(r=>r.id===id&&r.status==='recruited')))return false;
      return w.rumors.every(r=>r.status==='captive'?w.captives.some(c=>c.id===r.id):r.status==='recruited'?w.recruited.includes(r.id):!w.captives.some(c=>c.id===r.id)&&!w.recruited.includes(r.id)&&!s.generals.includes(r.id));
    }
    function validReceipt(r,s){if(r===undefined||r===null)return true;return object(r)&&definition(r.line)?.name===r.name&&validId(r.id,s)&&nodeValid(r.node,s)&&['captured','released','portrait_required'].includes(r.status)&&r.loyalty===(r.status==='captured'?40:0)&&typeof r.reason==='string'&&r.reason.length<=100;}
    function location(s,d){
      const occupied=new Set(s.wildGenerals.rumors.filter(r=>r.status!=='released').map(r=>r.node));
      const available=n=>n?.wild&&n.level===d.fieldLevel&&!s.conquered[n.id]&&!occupied.has(n.id)&&Object.values(n.army).some(v=>v>0);
      const preferred=Game.getWorldTile(d.anchor.x,d.anchor.y);if(available(preferred))return preferred;
      let best=null,score=Infinity;for(let y=0;y<Game.WORLD_SIZE;y++)for(let x=0;x<Game.WORLD_SIZE;x++){const n=Game.getWorldTile(x,y);if(!available(n))continue;const next=Math.hypot(x-d.anchor.x,y-d.anchor.y);if(next<score){best=n;score=next;}}return best;
    }
    function liveWild(){const error=Game.saveBlockReason();if(error)return {error};Game.tick(Date.now(),false);init(Game.state);return {s:Game.state};}
    const persist=()=>Game.save()?null:Game.saveBlockReason()||'保存失败，请保留当前页面';
    function discover(){
      const live=liveWild();if(live.error)return live.error;const s=live.s,w=s.wildGenerals;if(s.buildings.inn<1)return '请先建造 1 级客栈';
      let changed=false;for(const d of definitions){const previous=w.rumors.find(r=>r.line===d.line);if(unlockReason(s,d))continue;if(s.customGenerals.some(g=>s.generals.includes(g.id)&&g.name===d.name))continue;
        if(previous&&previous.status==='active'&&s.conquered[previous.node]){const next=location(s,d);if(next){previous.node=next.id;previous.at=Date.now();changed=true;}continue;}
        if(previous&&previous.status!=='released')continue;const n=location(s,d);if(!n)continue;
        const used=new Set([...s.generals,...s.innCandidates.map(g=>g.id),...w.rumors.map(r=>r.id)]);let id;while(w.seq<MAX_SEQ){const next='local_'+(ID_BASE+(++w.seq));if(!used.has(next)){id=next;break;}}if(!id)return changed?(persist()||'线索序号已达上限'):'线索序号已达上限';
        const r={line:d.line,id,node:n.id,at:Date.now(),status:'active'};if(previous)w.rumors.splice(w.rumors.indexOf(previous),1,r);else w.rumors.push(r);changed=true;
      }
      return changed?persist():w.rumors.length?null:'暂时没有可用野地，请先整理领地';
    }
    function portraitQuote(s,line){
      const d=definition(line);if(!d)return null;const r=s.wildGenerals?.rumors?.find(r=>r.line===line),owned=portraitOwned(s,line);
      const reason=!r?'请先在客栈打听这名将领的线索':r.status==='recruited'?'这名将领已经归顺':owned?'已永久拥有这名将领的画像':r.status==='captive'?'这名将领已被俘获，无需补买画像':s.gems<d.portraitPrice?'元宝不足':'';
      return {line,name:d.name,price:d.portraitPrice,owned,reason,key:[line,d.portraitPrice,r?.id||'',r?.status||'',owned].join('|')};
    }
    function buyPortrait(line,key){
      const live=liveWild();if(live.error)return live.error;const s=live.s,q=portraitQuote(s,line);if(!q||typeof key!=='string'||q.key!==key)return '画像报价或线索已变化，请重新查看';if(q.reason)return q.reason;
      s.gems-=q.price;s.wildGenerals.portraits.push(line);return persist();
    }
    function settle(s,n,b,won,at=Date.now()){
      if(!won||!n?.wild||b.finished||!['raid','occupy'].includes(b.mode)||!b.enemy.length||b.enemy.some(r=>r.hp>0))return null;
      const w=s.wildGenerals,r=w.rumors.find(r=>r.node===n.id&&r.status==='active');if(!r)return null;const d=definition(r.line);
      if(!portraitOwned(s,r.line))return {line:r.line,id:r.id,name:d.name,node:n.id,status:'portrait_required',loyalty:0,reason:'尚未拥有 '+d.name+' 画像，请先在客栈购买后再出征俘获'};
      const reason=s.customGenerals.some(g=>s.generals.includes(g.id)&&g.name===d.name)?'这名将领已在帐下':roomUsed(s)>=roomCapacity(s)?'招贤馆位置已满':s.customGenerals.length+w.captives.length>=100?'将领总量已达上限':'';
      if(reason){r.status='released';return {line:r.line,id:r.id,name:d.name,node:n.id,status:'released',loyalty:0,reason};}
      r.status='captive';w.captives.push({id:r.id,line:r.line,node:n.id,at,loyalty:40,hero:hero(d,r.id,n.id)});
      return {line:r.line,id:r.id,name:d.name,node:n.id,status:'captured',loyalty:40,reason:'等待手动招降'};
    }
    const payment=(d,method)=>method==='gold'?{gold:d.gold,jewels:{}}:method==='jewels'?{gold:0,jewels:{...d.jewels}}:null;
    function fundsReason(s,cost){if(s.res.gold<cost.gold)return '黄金不足';for(const [id,n]of Object.entries(cost.jewels))if((s.jewels[id]||0)<n)return Progression.jewels[id].name+'不足';return '';}
    function recruitQuote(s,id,method='gold'){
      const c=s.wildGenerals?.captives.find(c=>c.id===id),d=c&&definition(c.line),cost=d&&payment(d,method);if(!c||!cost)return null;
      const reason=(s.honors.noble<d.noble?'需要爵位 '+HeritageData.nobles[d.noble].name:'')||(roomUsed(s)>roomCapacity(s)?'招贤馆名额不足，请扩建或释放俘将':'')||(s.customGenerals.length>=100?'将领总量已达上限':'')||fundsReason(s,cost);
      return {id,name:c.hero.name,method,cost,noble:d.noble,nobleName:HeritageData.nobles[d.noble].name,loyalty:c.loyalty,reason,key:[id,method,s.honors.noble,roomUsed(s),roomCapacity(s),s.customGenerals.length].join('|')};
    }
    function recruit(id,method,key){
      const live=liveWild();if(live.error)return live.error;const s=live.s,q=recruitQuote(s,id,method);if(!q||typeof key!=='string'||q.key!==key)return '招降条件已变化，请重新查看俘将';if(q.reason)return q.reason;
      const w=s.wildGenerals,c=w.captives.find(c=>c.id===id);s.res.gold-=q.cost.gold;for(const [j,n]of Object.entries(q.cost.jewels))s.jewels[j]-=n;
      s.customGenerals.push({...c.hero});s.generals.push(id);s.generalLevels[id]=c.hero.level;s.generalXp[id]=0;s.heroLoyalty[id]=c.loyalty;w.captives=w.captives.filter(c=>c.id!==id);w.rumors.find(r=>r.id===id).status='recruited';w.recruited.push(id);init(s);return persist();
    }
    function rewardQuote(s,id,method='gold'){
      if(!s.generals.includes(id)||!['gold','jewels'].includes(method))return null;const current=loyalty(s,id),raise=Math.min(10,100-current),cost=method==='gold'?{gold:2000,jewels:{}}:{gold:0,jewels:{pearl:1}};
      const reason=!raise?'忠诚已达 100':Game.generalBusy(id)?'将领在外，请返城后奖励':fundsReason(s,cost);
      return {id,name:Game.general(id).name,method,current,next:current+raise,raise,cost,reason,key:[id,method,current,!!Game.generalBusy(id)].join('|')};
    }
    function reward(id,method,key){const live=liveWild();if(live.error)return live.error;const s=live.s,q=rewardQuote(s,id,method);if(!q||typeof key!=='string'||q.key!==key)return '奖励条件已变化，请重新查看将领';if(q.reason)return q.reason;s.res.gold-=q.cost.gold;for(const [j,n]of Object.entries(q.cost.jewels))s.jewels[j]-=n;s.heroLoyalty[id]=q.next;return persist();}
    function releaseQuote(s,id){const c=s.wildGenerals?.captives.find(c=>c.id===id);return c?{id,name:c.hero.name,key:[id,c.line,c.at].join('|')}:null;}
    function release(id,key){const live=liveWild();if(live.error)return live.error;const s=live.s,q=releaseQuote(s,id);if(!q||typeof key!=='string'||q.key!==key)return '俘将状态已变化，请重新查看';s.wildGenerals.captives=s.wildGenerals.captives.filter(c=>c.id!==id);s.wildGenerals.rumors.find(r=>r.id===id).status='released';return persist();}
    return {definitions,init:initWild,valid:validWild,validReceipt,heldCaptives,roomUsed,roomCapacity,unlockReason,codex,loyalty,portraitOwned,portraitQuote,buyPortrait,discover,settle,recruitQuote,recruit,rewardQuote,reward,releaseQuote,release};
  })();
  function init(s){
    if(!s||!Array.isArray(s.generals))return;
    if(s.heroPoints===undefined)s.heroPoints={};
    if(s.heroDrills===undefined)s.heroDrills={};
    if(s.equipment===undefined)s.equipment=[];
    if(s.equipmentCapacity===undefined)s.equipmentCapacity=50;
    if(s.equipmentSeq===undefined)s.equipmentSeq=0;
    if(s.heroGiftClaimed===undefined)s.heroGiftClaimed=false;
    wild.init(s);
    if(s.heroPoints&&typeof s.heroPoints==='object')for(const id of s.generals)if(s.heroPoints[id]===undefined)s.heroPoints[id]=zero();
  }
  const totalPoints=(s,id)=>Math.max(0,((s.generalLevels[id]||1)-1)*3);
  const remaining=(s,id)=>totalPoints(s,id)-Object.values(s.heroPoints[id]||zero()).reduce((a,b)=>a+b,0);
  const itemName=e=>e.named&&typeof LegendaryWeapons!=='undefined'?LegendaryWeapons.weapons[e.named]?.name||'神兵':names[e.slot]?.[e.tier]||'未知装备';
  const requiredLevel=e=>[0,1,5,10,15,20][e.tier];
  // Late-game equipment (Sprint 6): legendary tier, four-piece set bonuses and one refined extra stat on rare+ items.
  const SET_BONUS={2:{atk:5},3:{atk:10,def:10},4:{atk:15,def:15,lead:10}},REFINE_STATS=['atk','def','pol','wis','lead'];
  const mountSpeed=e=>e?.slot==='mount'?Math.round([0,6,10,14,18][e.tier]*(1+e.enhance*.05)):0;
  const profileForSpeed=speed=>({version:1,speed,march:1+Math.min(.25,speed/100),initiative:1+Math.min(.15,speed/200),cavalry:1+Math.min(.25,speed/100)});
  const mountProfile=(s,id)=>profileForSpeed(typeof id==='string'&&id&&s.generals.includes(id)?mountSpeed((s.equipment||[]).find(e=>e.hero===id&&e.slot==='mount')):0);
  function validMountProfile(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===5&&Number.isInteger(p.speed)&&p.speed>=0&&p.speed<=27&&Object.entries(profileForSpeed(p.speed)).every(([k,v])=>p[k]===v);}
  function mountQuote(){const s=Game.state;return {gold:5000,tier:1,slot:'mount',reason:Game.saveBlockReason()||((s.equipment||[]).length>=s.equipmentCapacity?'装备库已满':s.res.gold<5000?'黄金不足':'')};}
  function buyMount(){const blocked=Game.saveBlockReason();if(blocked)return blocked;const s=live(),q=mountQuote();if(q.reason)return q.reason;s.res.gold-=q.gold;addEquipment(s,'mount',1);return Game.save()?null:Game.saveBlockReason()||'保存失败';}
  const actionSpeed=stats=>stats.initiative??stats.speed;
  const movementSpeed=stats=>stats.moveSpeed??stats.speed;
  const speedStats=(stats,id,p)=>p?{...stats,initiative:stats.speed*p.initiative,moveSpeed:stats.speed*(['cavalry','heavy'].includes(id)?p.cavalry:1)}:stats;
  function validSpeedStats(stats,id,p,player=true){
    if(!p||!player)return stats.initiative===undefined&&stats.moveSpeed===undefined;
    return validMountProfile(p)&&stats.initiative===stats.speed*p.initiative&&stats.moveSpeed===stats.speed*(['cavalry','heavy'].includes(id)?p.cavalry:1);
  }
  function stats(e){if(e.slot==='mount')return {};const out=Object.fromEntries(Object.entries(bases[e.slot]).map(([id,n])=>[id,Math.round(n*[0,1,2,4,8,12][e.tier]*(1+e.enhance*.15))]));if(e.refine)out[e.refine.stat]=(out[e.refine.stat]||0)+e.refine.value;return out;}
  function setTier(s,id){const worn=(s.equipment||[]).filter(e=>e.hero===id&&legacySlots.includes(e.slot));if(worn.length!==4)return 0;const tier=Math.min(...worn.map(e=>e.tier));return tier>=2&&worn.every(e=>e.tier>=tier)?tier:0;}
  function bonus(s,id){const out={...zero(),...(s.heroPoints?.[id]||{})};for(const e of s.equipment||[])if(e.hero===id)for(const [k,n] of Object.entries(stats(e)))out[k]+=n;for(const [k,n] of Object.entries(SET_BONUS[setTier(s,id)]||{}))out[k]+=n;for(const [k,n] of Object.entries(typeof HeroBonds!=='undefined'?HeroBonds.statBonus(s,id):{}))out[k]=(out[k]||0)+n;return out;}
  function validEquipment(e,s){return !!e&&typeof e==='object'&&!Array.isArray(e)&&Number.isSafeInteger(e.id)&&e.id>0&&e.id<=s.equipmentSeq&&Object.hasOwn(slots,e.slot)&&(e.slot==='mount'?[1,2,3,4].includes(e.tier)&&e.named===undefined&&e.refine===undefined:[1,2,3,4,5].includes(e.tier))&&(e.tier===5?e.slot==='weapon'&&typeof e.named==='string'&&(typeof LegendaryWeapons==='undefined'||Object.hasOwn(LegendaryWeapons.weapons,e.named)):e.named===undefined)&&Number.isInteger(e.enhance)&&e.enhance>=0&&e.enhance<=10&&(e.refine===undefined||e.tier>=3&&!!e.refine&&typeof e.refine==='object'&&Object.keys(e.refine).length===2&&REFINE_STATS.includes(e.refine.stat)&&Number.isInteger(e.refine.value)&&e.refine.value>=3&&e.refine.value<=8)&&(e.hero===''||s.generals.includes(e.hero)&&s.generalLevels[e.hero]>=requiredLevel(e));}
  function valid(s){
    const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
    if(!wild.valid(s))return false;
    if(!obj(s.heroPoints)||!obj(s.heroDrills)||!Array.isArray(s.equipment)||!int(s.equipmentSeq)||!Number.isInteger(s.equipmentCapacity)||s.equipmentCapacity<50||s.equipmentCapacity>500||s.equipment.length>s.equipmentCapacity||typeof s.heroGiftClaimed!=='boolean')return false;
    if(!Object.keys(s.heroPoints).every(id=>s.generals.includes(id))||!s.generals.every(id=>obj(s.heroPoints[id])&&Object.keys(s.heroPoints[id]).length===5&&Object.keys(attrs).every(k=>int(s.heroPoints[id][k]))&&remaining(s,id)>=0))return false;
    if(!Object.entries(s.heroDrills).every(([id,d])=>s.generals.includes(id)&&obj(d)&&int(d.day)&&int(d.count)&&d.count<=3))return false;
    if(!s.equipment.every(e=>validEquipment(e,s))||new Set(s.equipment.map(e=>e.id)).size!==s.equipment.length)return false;
    const worn=s.equipment.filter(e=>e.hero).map(e=>e.hero+':'+e.slot);return new Set(worn).size===worn.length;
  }
  // Construction rewards depend on the completed level, not duration or game speed.
  const constructionXp=level=>level*10;
  function addXp(s,id,xp){s.generalXp[id]=(s.generalXp[id]||0)+xp;while(s.generalLevels[id]<10000&&s.generalXp[id]>=s.generalLevels[id]*80){s.generalXp[id]-=s.generalLevels[id]*80;s.generalLevels[id]++;}init(s);}
  function addEquipment(s,slot,tier,named){const e={id:++s.equipmentSeq,slot,tier,enhance:0,hero:'',...(named?{named}:{})};s.equipment.push(e);return e;}
  function drops(s,level){
    const result={equipmentDrops:[],equipmentDiscarded:0};
    if(Math.random()>=Math.min(.55,.25+level*.03))return result;
    if(s.equipment.length>=s.equipmentCapacity){result.equipmentDiscarded=1;return result;}
    const r=Math.random(),tier=level>=8&&r<.15?3:level>=3&&r<.45?2:1;
    result.equipmentDrops.push({...addEquipment(s,legacySlots[Math.floor(Math.random()*4)],tier)});return result;
  }
  const live=()=>{Game.tick();init(Game.state);return Game.state;};
  const busy=id=>!Game.state.generals.includes(id)?'请选择已招募将领':Game.generalBusy(id)?'将领出征或驻守中，请返城后调整':null;
  const save=()=>{Game.save();return null;};
  function allocate(id,points){const s=live(),error=busy(id);if(error)return error;if(!points||Object.keys(points).length!==5||!Object.keys(attrs).every(k=>Number.isSafeInteger(points[k])&&points[k]>=0))return '加点格式不正确';if(Object.keys(attrs).some(k=>!allocatable.includes(k)&&points[k]>0))return '统御与统率不能加点';const sum=Object.values(points).reduce((a,b)=>a+b,0);if(sum<1||sum>remaining(s,id))return '可分配属性点不足';for(const k of Object.keys(attrs))s.heroPoints[id][k]+=points[k];return save();}
  function reset(id){const s=live(),error=busy(id);if(error)return error;const used=totalPoints(s,id)-remaining(s,id),count=Math.ceil(s.generalLevels[id]/10);if(!used)return '这位将领没有已分配属性点';if((s.inventory.resetHero||0)<count)return '需要洗髓丹 ×'+count;s.inventory.resetHero-=count;s.heroPoints[id]=zero();Progression.record(s,'item',count);return save();}
  function drillQuote(s,id){const day=Progression.period(Date.now()),d=s.heroDrills[id],used=d?.day===day?d.count:0;return {used,cost:1000*(s.generalLevels[id]||1),xp:80};}
  function drill(id){const s=live(),error=busy(id);if(error)return error;if(s.buildings.drill<1)return '请先建造校场';if(s.generalLevels[id]>=10000)return '将领已达最高等级';const q=drillQuote(s,id);if(q.used>=3)return '今日已操练 3 次，北京时间 05:00 重置';if(s.res.gold<q.cost)return '黄金不足';s.res.gold-=q.cost;s.heroDrills[id]={day:Progression.period(Date.now()),count:q.used+1};addXp(s,id,q.xp);return save();}
  function gift(){const s=live();if(s.heroGiftClaimed)return '将领装备礼包已领取';if(s.equipment.length+8>s.equipmentCapacity)return '需要 8 格装备空间';for(let i=0;i<2;i++)for(const slot of legacySlots)addEquipment(s,slot,1);s.inventory.pearl=(s.inventory.pearl||0)+5;s.inventory.resetHero=(s.inventory.resetHero||0)+2;s.heroGiftClaimed=true;return save();}
  const equipBusy=id=>Game.battlefieldCanEquip?.(id)?null:busy(id);
  function equip(eid,id){const blocked=Game.saveBlockReason();if(blocked)return blocked;const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';const error=equipBusy(id)||(e.hero&&equipBusy(e.hero));if(error)return error;if(s.generalLevels[id]<requiredLevel(e))return '需要将领 '+requiredLevel(e)+' 级';for(const old of s.equipment)if(old.hero===id&&old.slot===e.slot)old.hero='';e.hero=id;return Game.save()?null:Game.saveBlockReason()||'保存失败';}
  function unequip(eid){const blocked=Game.saveBlockReason();if(blocked)return blocked;const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e?.hero)return '装备未穿戴';const error=equipBusy(e.hero);if(error)return error;e.hero='';return Game.save()?null:Game.saveBlockReason()||'保存失败';}
  function forgeQuote(slot,tier){if(!forgeSlots.includes(slot)||![1,2,3].includes(tier))return null;const factor=[0,1,4,12][tier]*(1-(typeof Game!=='undefined'&&Game.forgeDiscount?Game.forgeDiscount():0));return {smith:[0,1,3,6][tier],cost:{wood:Math.round(1000*factor),stone:Math.round(800*factor),iron:Math.round(2000*factor),gold:Math.round(3000*factor)}};}
  function forge(slot,tier){const s=live(),q=forgeQuote(slot,tier);if(!q)return '请选择装备';if(s.buildings.smith<q.smith)return '需要 '+q.smith+' 级铁匠铺';if(s.equipment.length>=s.equipmentCapacity)return '装备库已满';if(!Game.canPay(q.cost))return '打造材料不足';for(const [id,n] of Object.entries(q.cost))s.res[id]-=n;addEquipment(s,slot,tier);return save();}
  function enhanceQuote(e){return {gold:1000*e.tier*(e.enhance+1),pearls:Math.ceil((e.enhance+1)/3)};}
  function enhance(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.hero&&busy(e.hero))return busy(e.hero);if(s.buildings.smith<1)return '请先建造铁匠铺';if(e.enhance>=10)return '强化已达 +10';const q=enhanceQuote(e);if(s.res.gold<q.gold||(s.inventory.pearl||0)<q.pearls)return '黄金或强化宝珠不足';s.res.gold-=q.gold;s.inventory.pearl-=q.pearls;e.enhance++;Progression.record(s,'item',q.pearls);return save();}
  function salvage(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.named)return '神兵不能分解';if(e.hero)return '请先卸下装备';s.equipment=s.equipment.filter(x=>x.id!==eid);s.inventory.pearl=(s.inventory.pearl||0)+e.tier+Math.floor(e.enhance/3);return save();}
  // Legendary pieces come from the 铸神兵 quest line (legend-quest.js): first a timed quench, then direct quenching.
  function legendQuote(slot){const s=live();return LegendQuest.forgeQuote(s,slot);}
  function forgeLegend(slot){const s=live(),error=LegendQuest.startForge(s,slot,Date.now(),addEquipment);return error||save();}
  function claimLegend(){const s=live(),error=LegendQuest.claim(s,Date.now(),addEquipment);return error||save();}
  function seekLegend(){const s=live(),error=LegendQuest.seek(s);return error||save();}
  // 炼化鼎: add (or reroll) one extra stat of +3..+8 on a rare or legendary piece.
  function refine(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.slot==='mount')return '坐骑不能炼化属性';if(e.tier<3)return '只有珍稀和传说装备可以炼化';if(e.hero&&busy(e.hero))return busy(e.hero);if((s.inventory.refine||0)<1)return '需要炼化鼎';s.inventory.refine--;e.refine={stat:REFINE_STATS[Math.floor(Math.random()*REFINE_STATS.length)],value:3+Math.floor(Math.random()*6)};Progression.record(s,'item');return save();}
  function expand(item){const s=live();if(!['rack','rackAdvanced'].includes(item)||(s.inventory[item]||0)<1)return '没有武器架';if(s.equipmentCapacity>=500)return '装备容量已达 500 格';s.equipmentCapacity=Math.min(500,s.equipmentCapacity+(item==='rack'?5:50));s.inventory[item]--;Progression.record(s,'item');return save();}
  for(const [id,effect] of Object.entries({resetHero:'heroReset',rack:'equipmentRack',rackAdvanced:'equipmentRack',pearl:'equipmentMaterial',refine:'equipmentRefine'}))ManualData.shop.find(x=>x.id===id).effect=effect;
  return {attrs,allocatable,slots,legacySlots,forgeSlots,mountSpeed,mountProfile,validMountProfile,actionSpeed,movementSpeed,speedStats,validSpeedStats,mountQuote,buyMount,qualities,names,wild,init,valid,validEquipment,totalPoints,remaining,itemName,requiredLevel,stats,bonus,constructionXp,addXp,addEquipment,drops,allocate,reset,drillQuote,drill,gift,equip,unequip,forgeQuote,forge,enhanceQuote,enhance,salvage,expand,SET_BONUS,setTier,legendQuote,forgeLegend,claimLegend,seekLegend,refine};
})();
