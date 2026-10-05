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
  const targets=Object.fromEntries(Object.entries(routes).flatMap(([route,spec])=>Array.from({length:MAX_TIER},(_,i)=>{
    const tier=i+1,champion=tier===5||tier===10,factor=1+i*.16,plan=spec.plans[i%spec.plans.length];
    const id=`order_${route}_${tier}`,army=Object.fromEntries(Object.entries(plan).map(([key,n])=>[key,Math.ceil(n*factor)]));
    const node={id,orderRoute:route,orderTier:tier,name:spec.name+' · 第 '+tier+' 阶',terrain:route==='siege'?'mountain':'camp',wild:false,level:Math.min(10,6+Math.floor(i/2)),time:45+tier*3,desc:spec.hint+(champion?' 本阶由精锐敌将督战。':''),army,loot:{food:2000+tier*500,wood:1500+tier*400,stone:1500+tier*400,iron:1500+tier*400,gold:2500+tier*600},reward:'战胜敌军，领取军功；部队返城，讨伐不改变领地归属。',commander:{name:['伏骑校尉','守寨都尉','精锐统领'][Object.keys(routes).indexOf(route)],title:champion?'精锐督战':'军令敌将',attack:1+(route==='elite'?.12:0)+(champion?.1:0),defense:1+(route==='siege'?.1:0)+(champion?.1:0),order:route==='siege'?'hold':'advance'}};
    if(route==='siege')node.fortification={name:champion?'重垒门墙':'营寨门墙',hp:12000+i*3500+(champion?6000:0),protection:1.4,tower:400+i*70,range:1100};
    return [id,node];
  })));
  function init(s){if(s.warOrders===undefined)s.warOrders={schema:1,merit:0,earned:0,spent:0,cleared:{field:0,siege:0,elite:0},wins:{field:0,siege:0,elite:0},nextAt:{field:0,siege:0,elite:0},last:null};}
  function getNode(id){return Object.hasOwn(targets,id)?targets[id]:null;}
  function points(n,first=false){const base=12+4*n.orderTier+(n.orderRoute==='siege'?4:n.orderRoute==='elite'?8:0);return base*(first?2:1);}
  function validReceipt(r){if(r===undefined||r===null)return true;const n=getNode(r.node);return !!n&&r.route===n.orderRoute&&r.tier===n.orderTier&&typeof r.first==='boolean'&&r.points===points(n,r.first);}
  function valid(s){const w=s.warOrders,int=n=>Number.isSafeInteger(n)&&n>=0,object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);return object(w)&&w.schema===1&&int(w.merit)&&int(w.earned)&&int(w.spent)&&w.merit+w.spent===w.earned&&['cleared','wins','nextAt'].every(key=>object(w[key])&&Object.keys(w[key]).length===3&&Object.keys(routes).every(route=>int(w[key][route])))&&Object.keys(routes).every(route=>w.cleared[route]<=MAX_TIER&&w.wins[route]>=w.cleared[route])&&(w.last===null||!!w.last&&validReceipt(w.last)&&w.last.tier<=w.cleared[w.last.route]&&w.last.points<=w.earned);}
  function unlocked(s){return !!s.conquered.north_keep;}
  function maxTier(s,route){return Math.min(MAX_TIER,s.warOrders.cleared[route]+1);}
  function blocked(s,n,mode,now=Date.now()){
    if(!unlocked(s))return '先平定北境大营，开放战役军令';
    if(mode!=='occupy')return '军令需要讨伐，战胜守军并破坏城防';
    if(n.orderTier>maxTier(s,n.orderRoute))return '先完成此路线第 '+(n.orderTier-1)+' 阶';
    if(s.warOrders.nextAt[n.orderRoute]>now)return '此路线正在整军，请等待倒计时结束';
    const deployed=[...(s.expedition?[s.expedition]:[]),...s.expeditions];
    if(deployed.some(e=>getNode(e.node)?.orderRoute===n.orderRoute))return '此路线已有部队出征，请等待返城';
    return null;
  }
  // Called only by the engine's one-time battle settlement, never by viewing or claiming UI.
  function settle(s,n,won,now){
    if(!n.orderRoute)return null;
    const w=s.warOrders;w.nextAt[n.orderRoute]=now+RECOVERY;
    if(!won)return null;
    const first=n.orderTier>w.cleared[n.orderRoute],receipt={node:n.id,route:n.orderRoute,tier:n.orderTier,first,points:points(n,first)};
    w.cleared[n.orderRoute]=Math.max(w.cleared[n.orderRoute],n.orderTier);w.wins[n.orderRoute]++;w.merit+=receipt.points;w.earned+=receipt.points;w.last=receipt;
    return receipt;
  }
  function exchange(id){Game.tick(Date.now(),false);const s=Game.state,offer=offers.find(o=>o.id===id);if(!unlocked(s))return '先平定北境大营，开放军功兑换';if(!offer)return '兑换物品不存在';if(s.warOrders.merit<offer.cost)return '军功不足';s.warOrders.merit-=offer.cost;s.warOrders.spent+=offer.cost;s.inventory[id]=(s.inventory[id]||0)+1;Game.save();return null;}
  return {MAX_TIER,RECOVERY,routes,offers,init,valid,validReceipt,getNode,points,unlocked,maxTier,blocked,settle,exchange};
})();
