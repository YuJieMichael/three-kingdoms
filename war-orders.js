'use strict';
// Repeatable PVE orders use immutable target IDs so expeditions and saves retain their exact encounter.
const WarOrders=(()=>{
  const MAX_TIER=10,RECOVERY=10*60*1000;
  const routes={
    field:{name:'野战破阵',hint:'骑兵突击、盾阵和弓弩交替出现，按敌军组成调整前排与远程。',plans:[{spear:120,shield:80,archer:120,cavalry:90},{shield:180,spear:100,archer:140},{spear:100,archer:210,ballista:12}]},
    siege:{name:'攻坚拔寨',hint:'守军依托门墙，必须破城并歼敌；为冲车与投石车配备护卫。',plans:[{shield:140,spear:120,archer:130},{shield:180,archer:160,ballista:12},{spear:170,archer:140,cavalry:70}]},
    elite:{name:'精锐会战',hint:'敌将率领重骑和器械，训练、将领装备与混编部队决定持久战表现。',plans:[{shield:130,spear:100,archer:140,heavy:35},{spear:160,cavalry:110,archer:120,heavy:25},{shield:150,spear:120,archer:150,ballista:20}]}
  };
  const offers=[
    {id:'speed_train_1h',cost:20},
    {id:'starterJewelBox',cost:50},
    {id:'speed_research_3h',cost:65},
    {id:'speed_build_3h',cost:65},
    {id:'starterEquipmentBasic',cost:100},
    {id:'pearl',cost:40},
    {id:'speed_train_8h',cost:140},
    {id:'starterEquipmentFine',cost:240}
  ];
  const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
  // Scenario data is separate from wild-general provenance. Commanders are not captive heroes.
  // Positions and plans are engine-owned: player troops retain the normal shared line deployment.
  const encounters=freeze([
    {id:'order_encounter_field_5_screen',route:'field',tier:5,name:'盾幕蓄弦',kind:'loss',limit:20,bonus:45,encounter:true,army:{shield:240,spear:160,archer:340},condition:'击败盾枪护卫与预备弓阵，永久损失不超过出征人数的 20%。',hint:'任何主将均可察伏取消敌弓预备；也可用盾兵探阵或快骑抢入射程。限损只看永久战损，不要求拥有名将。',config:{version:1,length:2600,deployment:'line',enemyPositions:{shield:1200,spear:1400,archer:1650},enemyOrders:{shield:{command:'advance',target:''},spear:{command:'hold',target:''},archer:{command:'hold',target:''}},enemyIdentity:'huangzhong',plans:[{atRound:0,action:{type:'huangzhong',unit:'archer'}}],intel:{warning:'盾枪护弓，弓队开战即蓄弦；下一行动轮等待敌队从射程外进入。',response:'察伏在下一轮准备仍有效时可用；盾兵探阵、首轮抢入射程或暂不进入均可应对。'}}},
    {id:'order_encounter_elite_7_lure',route:'elite',tier:7,name:'游骑诱阵',kind:'loss',limit:25,bonus:55,encounter:true,army:{cavalry:210,spear:300,archer:280},condition:'击败轻骑诱兵与后方枪弓阵，永久损失不超过出征人数的 25%。',hint:'敌骑首轮后退准备诱追，只诱下一轮仍前进的近战队。坚守或后退即可不追；弓兵不受诱追，可承担主输出。',config:{version:1,length:3000,deployment:'line',enemyPositions:{cavalry:1600,spear:2200,archer:2700},enemyOrders:{cavalry:{command:'advance',target:''},spear:{command:'hold',target:''},archer:{command:'hold',target:''}},enemyIdentity:'weiyan',plans:[{atRound:0,action:{type:'weiyan',unit:'cavalry'},targetPolicy:'firstEligibleMelee'}],intel:{warning:'轻骑摆出退势，后方留有枪弓阵；仅在诱兵价值足够且存在近战目标时准备诱追。',response:'给前排坚守或后退，不随轻骑追入后阵；保持弓兵输出。徐庶可提前看见已经锁定的追兵。'}}},
    {id:'order_encounter_siege_10_fire',route:'siege',tier:10,name:'火隘截骑',kind:'swift_loss',limit:30,maxRound:12,bonus:70,encounter:true,army:{cavalry:300,spear:260,archer:380},condition:'在 12 回合内击败火区骑枪弓阵，永久损失不超过出征人数的 30%。',hint:'本场是营外截击，没有门墙。火区只封路、不直接扣血且阻挡双方；徐庶能早揭区间，普通将可先观察，待公开后调整前进、坚守或后退。',config:{version:1,length:3000,deployment:'line',enemyPositions:{cavalry:2600,spear:2250,archer:2800},enemyOrders:{cavalry:{command:'advance',target:''},spear:{command:'advance',target:''},archer:{command:'hold',target:''}},enemyIdentity:'ordinary',plans:[{atRound:0,action:{type:'fire',unit:'archer',left:1400}}],intel:{warning:'弓阵正在准备火攻，轻骑抢进；火攻类型公开，准备区间尚未公开，下一行动轮冻结指令后生效。',response:'徐庶可提前揭露准确区间；普通将可先稳住前排，火区公开后再调整。火区只维持一轮，不要求特定主将。'}}}
  ]);
  const challenges=Object.freeze([
    Object.freeze({id:'order_challenge_field_5_preserve',route:'field',tier:5,name:'稳阵保兵',kind:'loss',limit:15,bonus:30,condition:'战胜第 5 阶野战敌军，永久损失不超过出征人数的 15%。',hint:'永久损失按结算战损计算，已救回伤兵不计入；可调整阵型、科技和将领装备。'}),
    Object.freeze({id:'order_challenge_elite_5_swift',route:'elite',tier:5,name:'六回合决胜',kind:'round',limit:6,bonus:40,condition:'在 6 回合以内战胜第 5 阶精锐敌军。',hint:'在射程内集中火力，避免远程在阵地上空等；超过回合条件仍可取得普通胜利。'}),
    Object.freeze({id:'order_challenge_siege_5_engines',route:'siege',tier:5,name:'护械破城',kind:'engines',limit:80,minimum:5,bonus:40,condition:'派出至少 5 架冲车或投石车，器械实际攻击城防至少一次，破城歼敌时至少 80% 器械仍在战场存活。',hint:'停在后方而未参与攻城不能达标；器械按架数计算，伤兵救回不算战场存活。搭配护卫并关注城防箭楼的射程。'}),
    Object.freeze({id:'order_branch_field_10_intercept',route:'field',tier:10,branch:true,name:'截骑护弓',kind:'loss',limit:30,bonus:60,army:Object.freeze({cavalry:500}),condition:'击退 500 轻骑，永久损失不超过出征人数的 30%。',hint:'枪兵克制轻骑，可在弓阵前接住冲锋；弓兵继续担当输出。先比较战损和补兵成本，再决定护卫人数。'}),
    Object.freeze({id:'order_branch_elite_10_flank',route:'elite',tier:10,branch:true,name:'疾袭弩阵',kind:'swift_loss',limit:15,maxRound:2,bonus:70,army:Object.freeze({ballista:200}),condition:'在 2 回合内击败 200 床弩，永久损失不超过出征人数的 15%。',hint:'轻骑的速度能及时接近长射程弩阵；纯弓能速胜但可能损失较高，慢护卫更省兵却可能超时。可用科技、装备或指挥尝试其他解法。'}),
    ...encounters
  ]);
  const targets=Object.fromEntries(Object.entries(routes).flatMap(([route,spec])=>Array.from({length:MAX_TIER},(_,i)=>{
    const tier=i+1,champion=tier===5||tier===10,factor=1+i*.16,plan=spec.plans[i%spec.plans.length];
    const id=`order_${route}_${tier}`,army=Object.fromEntries(Object.entries(plan).map(([key,n])=>[key,Math.ceil(n*factor)]));
    const node={id,orderRoute:route,orderTier:tier,name:spec.name+' · 第 '+tier+' 阶',terrain:route==='siege'?'mountain':'camp',wild:false,level:Math.min(10,6+Math.floor(i/2)),time:45+tier*3,desc:spec.hint+(champion?' 本阶由精锐敌将督战。':''),army,loot:{food:2000+tier*500,wood:1500+tier*400,stone:1500+tier*400,iron:1500+tier*400,gold:2500+tier*600},reward:'战胜敌军，领取军功；部队返城，讨伐不改变领地归属。',commander:{name:['伏骑校尉','守寨都尉','精锐统领'][Object.keys(routes).indexOf(route)],title:champion?'精锐督战':'军令敌将',attack:1+(route==='elite'?.12:0)+(champion?.1:0),defense:1+(route==='siege'?.1:0)+(champion?.1:0),order:route==='siege'?'hold':'advance'}};
    if(route==='siege')node.fortification={name:champion?'重垒门墙':'营寨门墙',hp:12000+i*3500+(champion?6000:0),protection:1.4,tower:400+i*70,range:1100};
    return [id,node];
  })));
  for(const c of challenges){const base=targets[`order_${c.route}_${c.tier}`];targets[c.id]=Object.freeze({...base,id:c.id,name:c.name+' · '+(c.branch?'进阶分支':'第 '+c.tier+' 阶战术挑战'),challengeId:c.id,desc:c.condition+' '+c.hint,army:Object.freeze({...(c.army||base.army)}),loot:Object.freeze({...base.loot}),commander:Object.freeze(c.branch?{name:c.kind==='loss'?'游骑统领':'弩阵校尉',title:'分支守将',attack:1,defense:1,order:'advance'}:{...base.commander}),...(base.fortification?{fortification:Object.freeze({...base.fortification})}:{}),reward:'胜利获得普通军功；首次达成战术条件额外获得 '+c.bonus+' 军功。'});}
  for(const c of encounters){const {fortification,...base}=targets[c.id];targets[c.id]=freeze({...base,name:c.name+' · 战术遭遇',terrain:'camp',encounter:c.config,commander:{name:c.name+'守将',title:'军令战术守将',attack:1,defense:1,order:'advance'}});}
  function init(s){if(s.warOrders===undefined)s.warOrders={schema:1,merit:0,earned:0,spent:0,cleared:{field:0,siege:0,elite:0},wins:{field:0,siege:0,elite:0},nextAt:{field:0,siege:0,elite:0},last:null};if(s.warOrders&&typeof s.warOrders==='object'&&!Array.isArray(s.warOrders)&&s.warOrders.challenges===undefined)s.warOrders.challenges={schema:1,completed:{},earned:0,lastAttempts:{}};}
  function getNode(id){return Object.hasOwn(targets,id)?targets[id]:null;}
  function challenge(id){return challenges.find(c=>c.id===id)||null;}
  function encounterConfig(id){return getNode(id)?.encounter||null;}
  function points(n,first=false){const base=12+4*n.orderTier+(n.orderRoute==='siege'?4:n.orderRoute==='elite'?8:0);return base*(first?2:1);}
  const int=n=>Number.isSafeInteger(n)&&n>=0,object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  function challengeMet(c,a){if(!a.won||!a.deployed)return false;if(c.kind==='loss')return a.lost<=Math.floor(a.deployed*c.limit/100);if(c.kind==='round')return a.round<=c.limit;if(c.kind==='swift_loss')return a.round<=c.maxRound&&a.lost<=Math.floor(a.deployed*c.limit/100);return a.machines>=c.minimum&&a.machineAlive>=Math.ceil(a.machines*c.limit/100)&&(a.rulesVersion===undefined||a.machineGateAttacks>0);}
  function validAttempt(a,c){return object(a)&&a.id===c.id&&typeof a.won==='boolean'&&typeof a.met==='boolean'&&(a.rulesVersion===undefined?!c.branch&&!c.encounter&&a.machineGateAttacks===undefined:a.rulesVersion===2&&int(a.machineGateAttacks)&&a.machineGateAttacks<=a.round*2)&&['round','deployed','lost','machines','machineAlive'].every(k=>int(a[k]))&&(a.round>=1||!a.won)&&a.round<=30&&a.lost<=a.deployed&&a.machines<=a.deployed&&a.machineAlive<=a.machines&&a.machineAlive<=a.deployed-a.lost&&(!a.machineGateAttacks||a.machines>0)&&a.met===challengeMet(c,a);}
  function validReceipt(r){
    if(r===undefined||r===null)return true;
    const n=getNode(r.node);if(!n||r.route!==n.orderRoute||r.tier!==n.orderTier||typeof r.first!=='boolean')return false;
    if(!n.challengeId)return r.challenge===undefined&&r.basePoints===undefined&&r.points===points(n,r.first);
    const c=challenge(n.challengeId),a=r.challenge;
    return r.first===false&&r.basePoints===points(n)&&validAttempt(a,c)&&a.won===true&&typeof a.first==='boolean'&&(!a.first||a.met)&&a.bonus===(a.first?c.bonus:0)&&r.points===r.basePoints+a.bonus;
  }
  function valid(s){
    const w=s.warOrders;if(!object(w)||w.schema!==1||!int(w.merit)||!int(w.earned)||!int(w.spent)||w.merit+w.spent!==w.earned||!['cleared','wins','nextAt'].every(key=>object(w[key])&&Object.keys(w[key]).length===3&&Object.keys(routes).every(route=>int(w[key][route])))||!Object.keys(routes).every(route=>w.cleared[route]<=MAX_TIER&&w.wins[route]>=w.cleared[route])||!(w.last===null||!!w.last&&validReceipt(w.last)&&w.last.tier<=w.cleared[w.last.route]&&w.last.points<=w.earned))return false;
    const ledger=w.challenges;if(!object(ledger)||ledger.schema!==1||!object(ledger.completed)||!object(ledger.lastAttempts)||!int(ledger.earned)||!Object.entries(ledger.completed).every(([id,value])=>{const c=challenge(id);return c&&value===true&&w.cleared[c.route]>=c.tier&&w.wins[c.route]>w.cleared[c.route];})||ledger.earned!==Object.keys(ledger.completed).reduce((sum,id)=>sum+challenge(id).bonus,0)||ledger.earned>w.earned||!Object.entries(ledger.lastAttempts).every(([id,a])=>{const c=challenge(id);return c&&w.cleared[c.route]>=c.tier&&validAttempt(a,c)&&(!a.met||ledger.completed[id]===true);}))return false;
    const receipts=[w.last,...(s.reports||[]).map(r=>r.warOrder),s.battle?.finished?s.battle.result?.warOrder:null].filter(r=>r?.challenge);
    if(receipts.some(r=>!validReceipt(r)||r.challenge.met&&ledger.completed[r.node]!==true))return false;
    // A saved finished battle and its history entry share one receipt; history itself cannot replay a first bonus.
    for(const c of challenges)if((s.reports||[]).filter(r=>r.warOrder?.challenge?.id===c.id&&r.warOrder.challenge.first).length>1)return false;
    return true;
  }
  function unlocked(s){return !!s.conquered.north_keep;}
  function maxTier(s,route){return Math.min(MAX_TIER,s.warOrders.cleared[route]+1);}
  function blocked(s,n,mode,now=Date.now()){
    if(!unlocked(s))return '先平定北境大营，开放战役军令';
    if(mode!=='occupy')return '军令需要讨伐，战胜守军并破坏城防';
    if(n.challengeId&&s.warOrders.cleared[n.orderRoute]<n.orderTier)return '先完成此路线普通第 '+n.orderTier+' 阶，再开启战术挑战';
    if(n.orderTier>maxTier(s,n.orderRoute))return '先完成此路线第 '+(n.orderTier-1)+' 阶';
    if(s.warOrders.nextAt[n.orderRoute]>now)return '此路线正在整军，请等待倒计时结束';
    const deployed=[...(s.expedition?[s.expedition]:[]),...s.expeditions];
    if(deployed.some(e=>getNode(e.node)?.orderRoute===n.orderRoute))return '此路线已有部队出征，请等待返城';
    return null;
  }
  // Called only by the engine's one-time battle settlement, never by viewing or claiming UI.
  function attempt(n,won,context){
    const c=challenge(n.challengeId),sum=a=>Object.values(a||{}).reduce((total,value)=>total+value,0),army=context?.army,lost=context?.lost,alive=context?.alive;
    const counts=a=>object(a)&&Object.keys(a).every(id=>Object.hasOwn(ManualData.units,id))&&Object.values(a).every(int)&&int(sum(a));
    const validContext=context&&int(context.round)&&(context.round>=1||!won)&&context.round<=30&&counts(army)&&counts(lost)&&counts(alive)&&sum(army)>0&&sum(lost)<=sum(army)&&sum(alive)<=sum(army)&&Object.keys(ManualData.units).every(id=>(lost[id]||0)+(alive[id]||0)<=(army[id]||0));
    const a={id:c.id,rulesVersion:2,machineGateAttacks:validContext&&int(context.machineGateAttacks)&&context.machineGateAttacks<=context.round*2?context.machineGateAttacks:0,won:!!won,met:false,round:validContext?context.round:30,deployed:validContext?sum(army):0,lost:validContext?sum(lost):0,machines:validContext?(army.ram||0)+(army.catapult||0):0,machineAlive:validContext?(alive.ram||0)+(alive.catapult||0):0};a.met=challengeMet(c,a);return a;
  }
  function settle(s,n,won,now,context){
    if(!n.orderRoute)return null;
    const w=s.warOrders;w.nextAt[n.orderRoute]=now+RECOVERY;
    const a=n.challengeId?attempt(n,won,context):null;if(a)w.challenges.lastAttempts[n.id]=a;
    if(!won)return null;
    const first=!a&&n.orderTier>w.cleared[n.orderRoute],receipt={node:n.id,route:n.orderRoute,tier:n.orderTier,first,points:points(n,first)};
    if(a){const c=challenge(n.challengeId),first=a.met&&!w.challenges.completed[n.id],bonus=first?c.bonus:0;receipt.basePoints=receipt.points;receipt.challenge={...a,first,bonus};receipt.points+=bonus;if(first){w.challenges.completed[n.id]=true;w.challenges.earned+=bonus;}}
    if(!a)w.cleared[n.orderRoute]=Math.max(w.cleared[n.orderRoute],n.orderTier);w.wins[n.orderRoute]++;w.merit+=receipt.points;w.earned+=receipt.points;w.last=receipt;
    return receipt;
  }
  function exchange(id){Game.tick(Date.now(),false);const s=Game.state,offer=offers.find(o=>o.id===id);if(!unlocked(s))return '先平定北境大营，开放军功兑换';if(!offer)return '兑换物品不存在';if(s.warOrders.merit<offer.cost)return '军功不足';s.warOrders.merit-=offer.cost;s.warOrders.spent+=offer.cost;s.inventory[id]=(s.inventory[id]||0)+1;Game.save();return null;}
  return {MAX_TIER,RECOVERY,routes,offers,challenges,encounters,challenge,encounterConfig,init,valid,validReceipt,getNode,points,unlocked,maxTier,blocked,settle,exchange};
})();
