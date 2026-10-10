'use strict';
// Pure 1D PvE prototype for design/gdd/hero-stratagems.md. The engine owns
// strike/counterstrike, frozen orders, persistence, and unsupported-mode gates.
const BattleStratagems=(()=>{
  const sides=['player','enemy'],opposite=side=>side==='player'?'enemy':'player';
  const RULES=Object.freeze({version:2,points:3,fireLength:100,maxPlans:6,maxEvents:160,melee:['worker','militia','scout','spear','shield','cavalry','heavy','wagon','ram']});
  const definitions=[
    {type:'watch',name:'察伏',cost:1,timing:'当前规划回合、移动之前识破上轮预备射击',consequences:'只取消选定黄忠准备；筹策不退，预留的主攻击不恢复。'},
    {type:'fire',name:'火攻封路',cost:2,timing:'本轮准备，下轮冻结响应后生效一轮',consequences:'本轮施计队放弃主攻击。火区阻挡双方，不造成额外生命伤害；已有队伍占据时失效。'},
    {type:'huangzhong',name:'蓄弦先射',cost:1,timing:'本轮坚守准备，下轮等待敌队实际进入射程',consequences:'两轮预留弓兵主攻击；未触发、取消或被察伏也不补射。'},
    {type:'weiyan',name:'佯退诱追',cost:1,timing:'本轮实际后退准备，下轮只诱前进的敌近战队',consequences:'只放弃准备轮主攻击；诱兵训练价值至少为目标现存价值的三分之一。'},
    {type:'zhaoyun',name:'接应撤军',cost:1,timing:'本轮坚守接应准备，下轮被保护队实际后退时生效',consequences:'准备轮轻骑放弃主攻击；响应轮仍坚守且距被保护队不超过300，后退速度最多为原速1.5倍。被保护队接应后退本轮放弃主攻击，不传送、不增加伤害。'},
    {type:'machao',name:'冲阵退敌',cost:1,timing:'本轮实际前进准备，下轮实际推进接触指定敌近战队',consequences:'准备轮骑兵放弃主攻击；冲阵成功再消耗响应轮主攻击，推退距离为目标速度的一半，最多200。目标坚守完全反制，不额外伤害。'},
    {type:'xushu',name:'料敌先机',cost:1,timing:'当前规划回合即时揭露一个已锁定的敌计目标',consequences:'不取消敌计、不读取未来命令；黄忠尚未确定的进入射程目标不能揭露。'}
  ];
  const identities={
    huangzhong:{id:'huangzhong',name:'黄忠',action:'huangzhong',description:'坚守蓄弦，以两轮主攻击机会换敌军进入射程时的先射。',condition:'存活弓兵；触发轮仍坚守；敌队本次从正常射程外移入。',counter:'坚守、盾兵探阵、察伏或在射程外压制。'},
    weiyan:{id:'weiyan',name:'魏延',action:'weiyan',description:'长枪或轻骑实际后退，使选定的前进近战队追向诱兵。',condition:'诱兵可后退，现存训练价值达到追兵三分之一。',counter:'保持阵线不追、改为后退或先击溃诱兵。'},
    xushu:{id:'xushu',name:'徐庶',action:'xushu',description:'提前看见一个敌方已经提交、尚未公开的具体目标。',condition:'有未公开的火区、诱追、接应或冲阵目标可查。',counter:'正面强攻或不用隐藏目标的战法。'},
    zhaoyun:{id:'zhaoyun',name:'赵云',action:'zhaoyun',description:'轻骑坚守接应另一队撤退，以准备轮主攻击换一次有距离限制的撤军加速。',condition:'存活轻骑；响应轮仍坚守，距被保护队不超过300，被保护队实际后退。',counter:'先击溃或逼离接应骑兵、保持距离，接应不会带来传送或额外攻击。'},
    machao:{id:'machao',name:'马超',action:'machao',description:'轻骑或重骑两轮真实推进接触敌近战队，以主攻击机会换一次有限推退。',condition:'准备轮实际前进，响应轮仍前进并实际移动到指定敌近战队射程内。',counter:'坚守完全抵消冲阵；保持距离或后退使其无法接触。'},
    ordinary:{id:'',name:'普通主将',action:'',description:'可使用察伏、火攻封路。',condition:'按公共计谋条件施计。',counter:'通过距离、指令和公共察伏反制。'}
  };
  const legacyLines={huangzhong:'huangzhong',warrior:'weiyan',strategist:'xushu'},lines={...legacyLines,zhaoyun:'zhaoyun',machao:'machao'};
  const identityTypes=['huangzhong','weiyan','xushu','zhaoyun','machao'],preparingTypes=['fire','huangzhong','weiyan','zhaoyun','machao'],targetTypes=['fire','weiyan','zhaoyun','machao'];
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),integer=n=>Number.isSafeInteger(n)&&n>=0;
  const copy=x=>JSON.parse(JSON.stringify(x)),unitId=id=>typeof id==='string'&&id.length>0&&id.length<=40;
  const rows=(b,side)=>side==='player'?b.player:b.enemy,row=(b,side,id)=>rows(b,side)?.find(r=>r.id===id);
  const alive=r=>!!r&&r.hp>0,kind=type=>definitions.find(d=>d.type===type);
  const units=api=>api?.units||(typeof ManualData!=='undefined'?ManualData.units:{});
  const unitName=(id,api)=>units(api)[id]?.name||id;
  function savedIdentity(hero,version=RULES.version){
    const line=typeof hero==='string'?hero:hero?.wildLine;
    if(version===RULES.version&&!line&&typeof hero?.id==='string'&&hero.id.startsWith('enemy_order_encounter_')&&typeof WarOrders!=='undefined'&&typeof WarOrders.encounterConfig==='function'){
      const cfg=WarOrders.encounterConfig(hero.id.slice(6));if(cfg&&cfg.enemyIdentity===hero.encounterIdentity&&['huangzhong','weiyan'].includes(cfg.enemyIdentity))return cfg.enemyIdentity;
    }
    return (version===1?legacyLines:lines)[line]||'';
  }
  function identity(hero){return {...(identities[savedIdentity(hero)]||identities.ordinary)};}
  function leader(hero){return {id:typeof hero?.id==='string'?hero.id:'',wildLine:typeof hero==='string'?hero:typeof hero?.wildLine==='string'?hero.wildLine:''};}
  function create(b,heroes={}){
    const snapshots={player:heroes.player||b.generalSnapshot,enemy:heroes.enemy||b.enemyGeneralSnapshot},leaders={player:leader(snapshots.player),enemy:leader(snapshots.enemy)};
    return {version:RULES.version,round:(b.round||0)+1,phase:'planning',leaders,identities:Object.fromEntries(sides.map(side=>[side,identity(snapshots[side]).id])),points:{player:RULES.points,enemy:RULES.points},submitted:{player:0,enemy:0},identityUsed:{player:false,enemy:false},seq:0,plans:[],reservations:[],spent:[],orders:null,events:[]};
  }
  function emit(b,type,plan,text,api={},visibleTo=sides){
    const s=b.stratagem,event={id:s.events.length?s.events.at(-1).id+1:1,round:s.round,type,side:plan?.side||'',unit:plan?.unit||'',planId:plan?.id||'',text,visibleTo:[...visibleTo]};
    s.events.push(event);s.events=s.events.slice(-RULES.maxEvents);
    if(visibleTo.length===2)api.log?.(b,text);return event;
  }
  function canonical(action){
    if(!object(action)||!kind(action.type))return null;
    const fields={watch:['type','planId'],fire:['type','unit','left'],huangzhong:['type','unit'],weiyan:['type','unit','target'],zhaoyun:['type','unit','target'],machao:['type','unit','target'],xushu:['type','planId']}[action.type];
    if(Object.keys(action).some(k=>!fields.includes(k)))return null;
    const a={type:action.type};for(const k of fields.slice(1))if(action[k]!==undefined)a[k]=action[k];
    if(a.type==='huangzhong'&&a.unit===undefined)a.unit='archer';return a;
  }
  const undecided=p=>p.status==='prepared'||p.status==='ready'||p.status==='active';
  const liveFire=s=>s.plans.find(p=>p.type==='fire'&&undecided(p));
  function publicPlan(b,p,viewer,api={}){
    const s=b.stratagem,known=p.side===viewer||p.public||p.revealedTo.includes(viewer),d=kind(p.type);
    const v={id:p.id,type:p.type,name:d.name,side:p.side,unit:p.unit,actor:p.unit,planId:p.planId,round:p.round,readyRound:p.readyRound,status:p.status,hidden:!known&&targetTypes.includes(p.type),public:p.public,revealed:known,cancelable:p.side===viewer&&s.phase==='planning'&&p.status==='prepared',reason:p.reason};
    if(known){v.target=p.target;if(p.type==='fire'){v.left=p.left;v.right=p.left+RULES.fireLength;}v.details=p.type==='zhaoyun'?`接应 ${unitName(p.unit,api)}，被保护队 ${unitName(p.target,api)}；距离不超过300，后退最多1.5倍`:p.type==='machao'?`冲阵 ${unitName(p.unit,api)}，敌近战 ${unitName(p.target,api)}；坚守完全反制，推退最多200`:p.type==='fire'?`火区 ${p.left}–${p.left+RULES.fireLength}`:p.type==='weiyan'?`诱兵 ${unitName(p.unit,api)}，追兵 ${unitName(p.target,api)}`:d.timing;}
    return v;
  }
  function options(b,side,type,api={}){
    const s=b.stratagem,foe=opposite(side),catalog=units(api),candidate=kind(type),label=r=>({id:r.id,name:catalog[r.id]?.name||r.id});
    const actors=(rows(b,side)||[]).filter(alive).filter(r=>type==='huangzhong'?r.id==='archer':type==='weiyan'?['spear','cavalry'].includes(r.id):type==='zhaoyun'?r.id==='cavalry':type==='machao'?['cavalry','heavy'].includes(r.id):true).map(label);
    const targets=(rows(b,type==='zhaoyun'?side:foe)||[]).filter(alive).filter(r=>['weiyan','machao'].includes(type)?RULES.melee.includes(r.id):true).map(label);
    const preparations=s?s.plans.filter(p=>p.side===foe&&p.status==='prepared'&&(type==='watch'?p.type==='huangzhong'&&p.readyRound===s.round:type==='xushu'?targetTypes.includes(p.type)&&!p.public&&!p.revealedTo.includes(side):true)).map(p=>publicPlan(b,p,side,api)):[];
    return {actors,targets,preparations,fireBounds:{min:1,max:b.length-RULES.fireLength-1,length:RULES.fireLength},available:!!candidate};
  }
  function trainingValue(r,api){const cost=units(api)[r?.id]?.cost;if(!alive(r)||!object(cost)||!(r.stats?.hp>0))return NaN;return Math.ceil(r.hp/r.stats.hp)*Object.values(cost).reduce((n,c)=>n+c,0);}
  function currentOrder(b,side,id){return side==='player'?b.orders?.[id]?.command||'advance':b.enemyOrders?.[id]?.command||b.stratagem?.orders?.enemy?.[id]?.command||'advance';}
  function quote(b,side,action,api={}){
    const a=canonical(action),d=a&&kind(a.type),s=b?.stratagem;
    const q={ok:false,reason:'',type:a?.type||'',side,unit:a?.unit||'',actor:a?.unit||'',cost:d?.cost||0,round:s?.round||0,readyRound:(s?.round||0)+(preparingTypes.includes(a?.type)?1:0),key:'',requiredOrder:['huangzhong','zhaoyun'].includes(a?.type)?'hold':a?.type==='weiyan'?'fallback':a?.type==='machao'?'advance':'',currentOrder:a?.unit?currentOrder(b,side,a.unit):'',changesOrder:false,timing:d?.timing||'',consequences:d?.consequences||'',options:s&&sides.includes(side)?options(b,side,a?.type,api):{actors:[],targets:[],preparations:[],fireBounds:{min:1,max:0,length:RULES.fireLength}}};
    const reject=reason=>({...q,reason});
    if(!s)return reject('此旧战斗沿原规则结束，未启用计谋');if(!sides.includes(side)||!a)return reject('计谋参数不合法');
    if(b.finished||s.phase!=='planning'||s.round!==b.round+1)return reject('响应指令已经冻结，不能在行动中提交');
    if(preparingTypes.includes(a.type)&&s.round>=30)return reject('本轮已是最后一回合，新的准备来不及生效');
    if(s.submitted[side]===s.round)return reject('本回合已提交一个计谋或身份战法');if(s.points[side]<d.cost)return reject('筹策不足');
    if(!rows(b,side).some(alive))return reject('己方已没有可施计的部队');
    if(identityTypes.includes(a.type)){if(s.identities[side]!==a.type)return reject('此主将没有该身份战法');if(s.identityUsed[side])return reject('主将身份战法每战只能使用一次');}
    const actor=a.unit&&row(b,side,a.unit),target=a.target&&row(b,a.type==='zhaoyun'?side:opposite(side),a.target);
    if(s.version===1&&['zhaoyun','machao'].includes(a.type))return reject('此旧战斗继续原有三名将规则，新战法在下次出征启用');
    if(preparingTypes.includes(a.type)){
      if(!alive(actor))return reject('请选择存活的己方施计队');
      if(s.reservations.some(r=>r.side===side&&r.unit===a.unit&&r.round===s.round))return reject('该队本轮主攻击已经用于另一项准备');
    }
    if(a.type==='huangzhong'&&a.unit!=='archer')return reject('黄忠预备射击需要弓箭兵');
    if(a.type==='weiyan'){
      if(!['spear','cavalry'].includes(a.unit))return reject('魏延诱兵只能选择长枪或轻骑');
      if(!alive(target)||!RULES.melee.includes(target.id))return reject('追兵必须是存活的敌近战队');
      if(side==='player'?actor.pos<=0:actor.pos>=b.length)return reject('诱兵没有实际后退空间');
      const baitValue=trainingValue(actor,api),targetValue=trainingValue(target,api);
      if(!Number.isSafeInteger(baitValue)||!Number.isSafeInteger(targetValue)||baitValue<Math.ceil(targetValue/3))return reject('诱兵现存训练价值不足追兵的三分之一');
      q.baitValue=baitValue;q.targetValue=targetValue;
    }
    if(a.type==='zhaoyun'){
      if(a.unit!=='cavalry')return reject('赵云接应必须选择轻骑');
      if(!alive(target)||target.id===actor.id)return reject('请选择另一支存活的己方被保护队');
      if(side==='player'?target.pos<=0:target.pos>=b.length)return reject('被保护队没有实际后退空间');
      if(Math.abs(actor.pos-target.pos)>300)return reject('接应轻骑距被保护队超过300');
    }
    if(a.type==='machao'){
      if(!['cavalry','heavy'].includes(a.unit))return reject('马超冲阵必须选择轻骑或重骑');
      if(!alive(target)||!RULES.melee.includes(target.id))return reject('冲阵目标必须是存活的敌近战队');
      if(side==='player'?actor.pos>=b.length||target.pos<=actor.pos:actor.pos<=0||target.pos>=actor.pos)return reject('骑兵没有向指定敌队实际前进的空间');
    }
    if(a.type==='fire'){
      if(liveFire(s))return reject('战场已有准备或生效火区');
      const left=a.left,right=left+RULES.fireLength,own=rows(b,side).filter(alive),foes=rows(b,opposite(side)).filter(alive);
      if(!Number.isSafeInteger(left)||left<1||right>b.length-1)return reject('火区必须在战场内，长度为100');
      if([...own,...foes].some(r=>r.pos>=left&&r.pos<=right))return reject('火区内已有部队，请选择空区间');
      if(!foes.some(r=>r.pos>right&&own.some(x=>x.pos<left))&&!foes.some(r=>r.pos<left&&own.some(x=>x.pos>right)))return reject('火区需要位于双方队伍之间');
    }
    if(a.type==='watch'||a.type==='xushu'){
      if(!q.options.preparations.some(p=>p.id===a.planId))return reject(a.type==='watch'?'没有可察伏的上轮黄忠预备射击':'没有可揭露的未公开敌计目标');
    }
    q.changesOrder=!!q.requiredOrder&&q.currentOrder!==q.requiredOrder;
    // The quote ID never serializes an opposing hidden interval or target.
    q.key=JSON.stringify([side,s.round,s.seq,a]);q.ok=true;return q;
  }
  function submit(b,side,action,key,api={}){
    const s=b?.stratagem,a=canonical(action);if(!s||!a||!sides.includes(side))return {ok:false,reason:'计谋参数不合法'};
    if(typeof key!=='string'||!key.length||key.length>1024)return {ok:false,reason:'请先核对当前计谋预览'};
    const previous=s.plans.find(p=>p.key===key);
    if(previous)return previous.side===side&&JSON.stringify(previous.action)===JSON.stringify(a)?{ok:true,reason:'',planId:previous.id,replayed:true,requiredOrder:'',changesOrder:false,cost:0}:{ok:false,reason:'同一命令ID不能用于不同计谋载荷'};
    const q=quote(b,side,a,api);if(!q.ok)return q;if(key!==q.key)return {ok:false,reason:'计谋条件已变化，请重新预览'};
    const preparing=preparingTypes.includes(a.type),p={id:'stratagem_'+(++s.seq),key,action:a,side,type:a.type,unit:a.unit||'',target:a.target||'',planId:a.planId||'',left:a.left??null,round:s.round,readyRound:s.round+(preparing?1:0),status:preparing?'prepared':'resolved',public:!preparing,revealedTo:[],reason:'',sourcePos:a.unit?row(b,side,a.unit).pos:null,retreated:false,baitValue:q.baitValue??null,targetValue:q.targetValue??null,originalTarget:'',originalCaptured:false,chased:false};
    if(['zhaoyun','machao'].includes(p.type))p.effectApplied=false;if(p.type==='machao')p.preparedAdvance=false;
    s.plans.push(p);s.points[side]-=q.cost;s.submitted[side]=s.round;if(identityTypes.includes(a.type))s.identityUsed[side]=true;
    if(preparing){s.reservations.push({side,unit:p.unit,round:p.round,planId:p.id});if(p.type==='huangzhong')s.reservations.push({side,unit:p.unit,round:p.readyRound,planId:p.id});}
    emit(b,'submit',p,(side==='player'?'我军':'敌军')+kind(p.type).name+'已宣布'+(preparing?'，准备一轮':'')+'；筹策 -'+q.cost+'。',api);
    if(p.type==='watch'){
      const targetPlan=s.plans.find(x=>x.id===p.planId);targetPlan.status='cancelled';targetPlan.reason='察伏识破';
      emit(b,'watch',p,'察伏取消了'+unitName(targetPlan.unit,api)+'的预备射击；本回合预留主攻击仍已消耗，筹策不退。',api);
    }
    if(p.type==='xushu'){
      const targetPlan=s.plans.find(x=>x.id===p.planId);targetPlan.revealedTo.push(side);
      emit(b,'reveal',p,'徐庶已揭露一项敌计的锁定目标，没有取消敌计。',api);
      emit(b,'revealDetail',p,'料敌先机：'+publicPlan(b,targetPlan,side,api).details,api,[side]);
    }
    return {...q,planId:p.id,replayed:false};
  }
  function invalidate(b,p,reason,api={}){if(!undecided(p))return;p.status='cancelled';p.reason=reason;emit(b,'cancel',p,kind(p.type).name+(p.type==='weiyan'&&p.chased?'结束：':'失效：')+reason+'；筹策不退，已预留主攻击不恢复。',api);}
  function cancel(b,side,planId,api={}){
    const s=b?.stratagem,p=s?.plans.find(x=>x.id===planId);if(!s||!p||p.side!==side)return {ok:false,reason:'准备不存在或不属于己方'};
    if(b.finished||s.phase!=='planning'||p.status!=='prepared')return {ok:false,reason:'响应已冻结或准备已经结束，不能取消'};
    invalidate(b,p,'主动取消',api);return {ok:true,reason:'',planId};
  }
  function pruneDead(b,api={}){
    const s=b?.stratagem;if(!s)return;
    for(const p of s.plans.filter(undecided))if(!alive(row(b,p.side,p.unit))||['weiyan','machao'].includes(p.type)&&!alive(row(b,opposite(p.side),p.target))||p.type==='zhaoyun'&&!alive(row(b,p.side,p.target)))invalidate(b,p,'关联兵队已失去战斗力',api);
  }
  function normalizeOrders(b,side,input){
    const entries=Array.isArray(input)?Object.fromEntries(input.map(x=>[x.id||x.unit,x.order||x])):input;
    if(!object(entries))return null;const out={};
    for(const r of rows(b,side)){const o=entries[r.id];if(!o){if(alive(r))return null;out[r.id]={command:'hold',target:''};continue;}const target=o.target||'';if(!['advance','hold','fallback'].includes(o.command)||typeof (o.target??'')!=='string'||target!==''&&!(side==='player'&&target==='gate'&&b.gate)&&!row(b,opposite(side),target))return null;out[r.id]={command:o.command,target};}
    return out;
  }
  function beginRound(b,ordersBySide,api={}){
    const s=b?.stratagem;if(!s)return {ok:true,reason:''};
    if(s.phase!=='planning'||s.round!==b.round)return {ok:false,reason:'计谋回合状态不一致'};
    const frozen={player:normalizeOrders(b,'player',ordersBySide?.player),enemy:normalizeOrders(b,'enemy',ordersBySide?.enemy)};
    if(!frozen.player||!frozen.enemy)return {ok:false,reason:'需要双方完整、有效的冻结响应指令'};
    s.orders=frozen;s.phase='acting';s.spent=[];pruneDead(b,api);
    for(const p of s.plans){
      if(p.type==='weiyan'&&p.status==='prepared'&&p.round===s.round){p.originalTarget=frozen[opposite(p.side)][p.target].target;p.originalCaptured=true;}
      if(p.readyRound<=s.round&&!p.public){p.public=true;if(targetTypes.includes(p.type))emit(b,'public',p,'响应已冻结：'+publicPlan(b,p,p.side,api).details+'。',api);}
      if(p.status!=='prepared'||p.readyRound!==s.round)continue;
      if(p.type==='huangzhong'&&frozen[p.side][p.unit].command!=='hold'){invalidate(b,p,'预备射击触发轮未继续坚守',api);continue;}
      if(p.type==='weiyan'){
        if(!p.retreated){invalidate(b,p,'准备轮没有实际后退',api);continue;}
        const targetOrder=frozen[opposite(p.side)][p.target];if(targetOrder.command!=='advance'){invalidate(b,p,'追兵保持阵线或后退，没有追击',api);continue;}
      }
      if(p.type==='zhaoyun'){
        const cover=row(b,p.side,p.unit),protectedRow=row(b,p.side,p.target);
        if(frozen[p.side][p.unit].command!=='hold'){invalidate(b,p,'接应轻骑响应轮没有继续坚守',api);continue;}
        if(frozen[p.side][p.target].command!=='fallback'){invalidate(b,p,'被保护队没有选择后退',api);continue;}
        if(Math.abs(cover.pos-protectedRow.pos)>300){invalidate(b,p,'接应轻骑距被保护队超过300',api);continue;}
      }
      if(p.type==='machao'){
        if(!p.preparedAdvance){invalidate(b,p,'准备轮没有实际前进',api);continue;}
        if(frozen[p.side][p.unit].command!=='advance'){invalidate(b,p,'冲阵骑兵响应轮没有继续前进',api);continue;}
        if(frozen[opposite(p.side)][p.target].command==='hold'){invalidate(b,p,'目标坚守，完全抵消冲阵',api);continue;}
      }
      if(p.type==='fire'){
        if([...b.player,...b.enemy].some(r=>alive(r)&&r.pos>=p.left&&r.pos<=p.left+RULES.fireLength)){invalidate(b,p,'生效时火区内已有部队',api);continue;}
        p.status='active';emit(b,'fire',p,'火区 '+p.left+'–'+(p.left+RULES.fireLength)+'生效一轮，同时阻挡双方，不造成额外伤害。',api);continue;
      }
      p.status='ready';
    }
    return {ok:true,reason:''};
  }
  function preparationOrder(b,side,id,order){
    const s=b?.stratagem,p=s?.plans.find(p=>p.side===side&&p.unit===id&&p.round===s.round&&p.status==='prepared');
    return p&&['huangzhong','zhaoyun'].includes(p.type)?{...order,command:'hold'}:p&&p.type==='weiyan'?{...order,command:'fallback'}:p&&p.type==='machao'?{...order,command:'advance'}:{...order};
  }
  function movementOverride(b,side,r,order,api={}){
    const s=b?.stratagem,p=s?.plans.find(p=>p.type==='weiyan'&&p.side!==side&&p.target===r.id&&p.readyRound===s.round&&p.status==='ready');
    const target=p&&row(b,p.side,p.unit);if(p&&order.command==='advance'&&alive(r)&&alive(target)){
      if(!p.chased){p.chased=true;emit(b,'chase',p,'魏延诱追：'+unitName(r.id,api)+'仍选择前进，改向诱兵'+unitName(target.id,api)+'；接触不到时不改打其他队。',api);}
      return {forcedTarget:target,exclusive:true};
    }
    const rescue=s?.plans.find(p=>p.type==='zhaoyun'&&p.side===side&&p.target===r.id&&p.readyRound===s.round&&p.status==='ready'&&!p.effectApplied);
    if(rescue&&order.command==='fallback'){const cover=row(b,side,rescue.unit);if(alive(cover)&&alive(r)&&s.orders?.[side]?.[cover.id]?.command==='hold'&&Math.abs(cover.pos-r.pos)<=300)return {forcedTarget:null,exclusive:false,speedFactor:1.5};invalidate(b,rescue,'接应队已失去战斗力或距离超过300',api);}
    return {forcedTarget:null,exclusive:false,speedFactor:1};
  }
  function clipMove(b,from,to){
    const p=b?.stratagem?.plans.find(p=>p.type==='fire'&&p.status==='active');if(!p||from===to)return to;
    const left=p.left,right=left+RULES.fireLength;
    if(from<left&&to>=left)return left-1;if(from>right&&to<=right)return right+1;return to;
  }
  function normalAttackAllowed(b,side,id){
    const s=b?.stratagem;if(!s)return true;
    return !s.reservations.some(r=>r.side===side&&r.unit===id&&r.round===s.round)&&!s.spent.some(r=>r.side===side&&r.unit===id);
  }
  function markMainAttack(b,side,id){
    const s=b?.stratagem;if(!s)return true;if(s.phase!=='acting'||!normalAttackAllowed(b,side,id)||!alive(row(b,side,id)))return false;
    s.spent.push({side,unit:id,round:s.round,kind:'normal',planId:''});return true;
  }
  function afterMove(b,side,moving,from,api={}){
    const s=b?.stratagem;if(!s||s.phase!=='acting')return [];pruneDead(b,api);
    for(const p of s.plans)if(!api.forcedMove&&p.type==='weiyan'&&p.side===side&&p.unit===moving.id&&p.round===s.round&&p.status==='prepared'&&(side==='player'?moving.pos<from:moving.pos>from))p.retreated=true;
    const triggered=[];
    for(const p of s.plans){
      if(!api.forcedMove&&p.type==='machao'&&p.side===side&&p.unit===moving.id&&p.round===s.round&&p.status==='prepared'&&(side==='player'?moving.pos>from:moving.pos<from))p.preparedAdvance=true;
      if(!api.forcedMove&&p.type==='zhaoyun'&&p.side===side&&p.target===moving.id&&p.readyRound===s.round&&p.status==='ready'&&!p.effectApplied){
        const cover=row(b,side,p.unit);
        if(alive(cover)&&s.orders[side][p.unit].command==='hold'&&s.orders[side][moving.id].command==='fallback'&&Math.abs(cover.pos-from)<=300&&(side==='player'?moving.pos<from:moving.pos>from)){p.effectApplied=true;p.status='triggered';if(!s.spent.some(x=>x.side===side&&x.unit===moving.id)&&normalAttackAllowed(b,side,moving.id))s.spent.push({side,unit:moving.id,round:s.round,kind:'rescue',planId:p.id});emit(b,'rescue',p,'赵云接应撤军：'+unitName(moving.id,api)+'实际后退 '+Math.abs(moving.pos-from)+'；接应范围300，最多1.5倍后退速度，被保护队本轮主攻击已消耗。',api);}
      }
      if(!api.forcedMove&&p.type==='machao'&&p.side===side&&p.unit===moving.id&&p.readyRound===s.round&&p.status==='ready'&&!p.effectApplied){
        const foe=opposite(side),target=row(b,foe,p.target),advanced=side==='player'?moving.pos>from:moving.pos<from;
        if(!advanced||!alive(target)||s.orders[side][moving.id].command!=='advance'||Math.abs(moving.pos-target.pos)>moving.stats.range)continue;
        if(s.orders[foe][target.id].command==='hold'){invalidate(b,p,'目标坚守，完全抵消冲阵',api);continue;}
        if(!normalAttackAllowed(b,side,moving.id)){invalidate(b,p,'响应轮骑兵主攻击已用于其他准备',api);continue;}
        p.effectApplied=true;p.status='triggered';s.spent.push({side,unit:moving.id,round:s.round,kind:'charge',planId:p.id});
        const origin=target.pos,amount=Math.floor(Math.min(target.stats.speed/2,200)*(typeof HeroSystem!=='undefined'?HeroSystem.movementSpeed(target.stats)/target.stats.speed:1)),to=clipMove(b,origin,Math.max(0,Math.min(b.length,origin+(side==='player'?amount:-amount))));target.pos=to;
        emit(b,'charge',p,'马超冲阵：'+unitName(target.id,api)+'被推退 '+Math.abs(to-origin)+'，位置 '+origin+' → '+to+'；骑兵本轮主攻击已消耗，没有额外伤害'+(to===origin?'，边界或火区挡住推退':'')+'。',api);
        if(to!==origin)triggered.push({kind:'forcedMove',side:foe,unit:target.id,from:origin,to,planId:p.id,sourceSide:side,sourceUnit:moving.id});
      }
    }
    const plans=s.plans.filter(p=>p.type==='huangzhong'&&p.side!==side&&p.readyRound===s.round&&p.status==='ready').sort((a,z)=>(typeof HeroSystem!=='undefined'?HeroSystem.actionSpeed(row(b,z.side,z.unit)?.stats||{speed:0}):row(b,z.side,z.unit)?.stats.speed||0)-(typeof HeroSystem!=='undefined'?HeroSystem.actionSpeed(row(b,a.side,a.unit)?.stats||{speed:0}):row(b,a.side,a.unit)?.stats.speed||0)||(a.side===z.side?0:a.side==='enemy'?-1:1)||a.unit.localeCompare(z.unit));
    for(const p of plans){const archer=row(b,p.side,p.unit);if(!alive(archer)||!alive(moving)||s.spent.some(x=>x.side===p.side&&x.unit===p.unit)||Math.abs(from-archer.pos)<=archer.stats.range||Math.abs(moving.pos-archer.pos)>archer.stats.range||moving.pos===from)continue;
      p.status='triggered';s.spent.push({side:p.side,unit:p.unit,round:s.round,kind:'trigger',planId:p.id});triggered.push({kind:'readyShot',side:p.side,unit:p.unit,target:moving.id,planId:p.id});
      emit(b,'trigger',p,'黄忠预备射击：'+unitName(moving.id,api)+'实际进入射程；弓队本回合主攻击已使用。',api);
    }
    return triggered;
  }
  function endRound(b,api={}){
    const s=b?.stratagem;if(!s)return {ok:true,reason:''};if(s.phase!=='acting'||s.round!==b.round)return {ok:false,reason:'计谋回合状态不一致'};
    pruneDead(b,api);
    for(const p of s.plans){
      if(p.type==='weiyan'&&p.status==='prepared'&&p.round===s.round&&!p.retreated)invalidate(b,p,'准备轮没有实际后退',api);
      if(p.type==='machao'&&p.status==='prepared'&&p.round===s.round&&!p.preparedAdvance)invalidate(b,p,'准备轮没有实际前进',api);
      if(['ready','active'].includes(p.status)&&p.readyRound===s.round){p.status='expired';p.reason=p.type==='fire'?'火区一轮后熄灭':p.type==='huangzhong'?'没有敌队实际进入射程，不能补普通射击':p.type==='weiyan'?'诱追本轮结束':p.type==='zhaoyun'?'本轮没有发生符合条件的实际后退':'本轮没有实际推进接触目标，冲阵未触发';emit(b,'expire',p,kind(p.type).name+'结束：'+p.reason+'。',api);}
    }
    s.phase='planning';s.round=b.round+1;s.spent=[];s.orders=null;return {ok:true,reason:''};
  }
  function view(b,viewer='player',api={}){
    const s=b?.stratagem;if(!s||!sides.includes(viewer))return {enabled:false,reason:'此战斗沿原规则结束，计谋未启用',preparations:[],plans:[],events:[],actions:[]};
    const visible=s.plans.map(p=>publicPlan(b,p,viewer,api));
    return {enabled:true,side:viewer,round:s.round,phase:s.phase,points:{...s.points},cp:s.points[viewer],submittedThisRound:s.submitted[viewer]===s.round,identityUsed:s.identityUsed[viewer],identities:Object.fromEntries(sides.map(side=>[side,{...(identities[s.identities[side]]||identities.ordinary)}])),identity:{...(identities[s.identities[viewer]]||identities.ordinary)},actions:definitions.filter(d=>!identityTypes.includes(d.type)||d.type===s.identities[viewer]).map(copy),preparations:visible.filter(p=>['prepared','ready','active'].includes(p.status)),plans:visible,reservedMainAttacks:[...s.reservations,...s.spent.filter(r=>['rescue','charge'].includes(r.kind))].filter(r=>r.side===viewer&&r.round===s.round).map(r=>{const p=s.plans.find(p=>p.id===r.planId);return {...r,type:p.type,status:p.status};}),events:s.events.filter(e=>e.visibleTo.includes(viewer)).map(e=>({id:e.id,round:e.round,type:e.type,side:e.side,unit:e.unit,planId:e.planId,text:e.text})),options:options(b,viewer,'fire',api)};
  }
  function valid(b,api={}){
    try{
      const s=b.stratagem;if(s===undefined)return true;
      const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
      const pair=o=>exact(o,sides),catalog=units(api),known=(side,id)=>unitId(id)&&!!catalog[id]&&!!row(b,side,id),bounded=(n,max)=>integer(n)&&n<=max;
      if(!exact(s,['version','round','phase','leaders','identities','points','submitted','identityUsed','seq','plans','reservations','spent','orders','events'])||![1,RULES.version].includes(s.version)||!['planning','acting'].includes(s.phase)||!bounded(s.round,31)||s.round<1||s.round!==b.round+(s.phase==='planning'?1:0)||!sides.every(side=>Array.isArray(rows(b,side)))||!pair(s.leaders)||!pair(s.identities)||!pair(s.points)||!pair(s.submitted)||!pair(s.identityUsed))return false;
      for(const side of sides){const l=s.leaders[side],snapshot=side==='player'?b.generalSnapshot:b.enemyGeneralSnapshot;if(side==='player'&&snapshot?.encounterIdentity!==undefined||!exact(l,['id','wildLine'])||typeof l.id!=='string'||l.id.length>100||typeof l.wildLine!=='string'||l.wildLine.length>40||l.id!==(snapshot?.id||'')||l.wildLine!==(snapshot?.wildLine||'')||s.identities[side]!==savedIdentity(snapshot,s.version)||!bounded(s.points[side],RULES.points)||!bounded(s.submitted[side],s.round)||typeof s.identityUsed[side]!=='boolean')return false;}
      if(!bounded(s.seq,RULES.maxPlans)||!Array.isArray(s.plans)||s.plans.length!==s.seq||!Array.isArray(s.reservations)||s.reservations.length>12||!Array.isArray(s.spent)||s.spent.length>24||!Array.isArray(s.events)||s.events.length>RULES.maxEvents)return false;
      const keys=new Set(),turns=new Set(),expectedReservations=[];
      for(let n=0;n<s.plans.length;n++){
        const p=s.plans[n],a=canonical(p.action),d=kind(p.type);if(!exact(p,['id','key','action','side','type','unit','target','planId','left','round','readyRound','status','public','revealedTo','reason','sourcePos','retreated','baitValue','targetValue','originalTarget','originalCaptured','chased',...(['zhaoyun','machao'].includes(p.type)?['effectApplied']:[]),...(p.type==='machao'?['preparedAdvance']:[])])||p.id!=='stratagem_'+(n+1)||typeof p.key!=='string'||!p.key.length||p.key.length>1024||keys.has(p.key)||!sides.includes(p.side)||!a||JSON.stringify(a)!==JSON.stringify(p.action)||a.type!==p.type||!d||!integer(p.round)||p.round<1||p.round>s.round||turns.has(p.side+':'+p.round)||!['prepared','ready','active','triggered','cancelled','expired','resolved'].includes(p.status)||typeof p.public!=='boolean'||!Array.isArray(p.revealedTo)||p.revealedTo.length>1||p.revealedTo.some(side=>side!==opposite(p.side))||typeof p.reason!=='string'||p.reason.length>200||typeof p.retreated!=='boolean'||typeof p.originalCaptured!=='boolean'||typeof p.chased!=='boolean'||typeof p.originalTarget!=='string'||p.originalTarget.length>40)return false;
        keys.add(p.key);turns.add(p.side+':'+p.round);const preparing=preparingTypes.includes(p.type);
        if(p.unit!==(a.unit||'')||p.target!==(a.target||'')||p.planId!==(a.planId||'')||p.left!==(a.left??null)||p.readyRound!==p.round+(preparing?1:0)||p.readyRound>30||preparing&&!known(p.side,p.unit)||!preparing&&p.unit!==''||preparing&&!Number.isFinite(p.sourcePos)||!preparing&&p.sourcePos!==null||!preparing&&p.status!=='resolved'||p.status==='active'&&p.type!=='fire'||p.status==='triggered'&&!['huangzhong','zhaoyun','machao'].includes(p.type))return false;
        if(p.sourcePos!==null&&(p.sourcePos<0||p.sourcePos>b.length))return false;
        const shouldPublic=!preparing||p.readyRound<s.round||p.readyRound===s.round&&s.phase==='acting';if(p.public!==shouldPublic||p.status==='prepared'&&p.readyRound<s.round||['ready','active'].includes(p.status)&&(s.phase!=='acting'||p.readyRound!==s.round)||p.status==='resolved'&&preparing)return false;
        if(identityTypes.includes(p.type)&&s.identities[p.side]!==p.type)return false;
        if(s.version===1&&['zhaoyun','machao'].includes(p.type))return false;
        if(['zhaoyun','machao'].includes(p.type)){
          if(typeof p.effectApplied!=='boolean'||p.effectApplied!==(p.status==='triggered')||p.effectApplied&&(!p.public||p.readyRound>s.round))return false;
          if(p.type==='zhaoyun'&&(p.unit!=='cavalry'||!known(p.side,p.target)||p.target===p.unit))return false;
          if(p.type==='machao'&&(!['cavalry','heavy'].includes(p.unit)||!known(opposite(p.side),p.target)||!RULES.melee.includes(p.target)||typeof p.preparedAdvance!=='boolean'||['ready','triggered','expired'].includes(p.status)&&!p.preparedAdvance))return false;
          if(p.effectApplied&&s.phase==='acting'&&p.readyRound===s.round){
            const budgetUnit=p.type==='zhaoyun'?p.target:p.unit,paid=s.spent.some(x=>x.side===p.side&&x.unit===budgetUnit&&x.planId===p.id&&x.kind===(p.type==='zhaoyun'?'rescue':'charge'));
            if(!paid&&!(p.type==='zhaoyun'&&s.reservations.some(x=>x.side===p.side&&x.unit===budgetUnit&&x.round===s.round)))return false;
          }
        }
        if(p.type==='huangzhong'&&p.unit!=='archer')return false;
        if(p.type==='weiyan'){
          if(!['spear','cavalry'].includes(p.unit)||!known(opposite(p.side),p.target)||!RULES.melee.includes(p.target)||!integer(p.baitValue)||!integer(p.targetValue)||p.baitValue<1||p.targetValue<1||p.baitValue<Math.ceil(p.targetValue/3))return false;
          for(const [side,id,value]of [[p.side,p.unit,p.baitValue],[opposite(p.side),p.target,p.targetValue]]){const cost=Object.values(catalog[id].cost).reduce((sum,n)=>sum+n,0);if(value%cost!==0||value/cost>row(b,side,id).initial)return false;}
          if(p.chased&&(!p.retreated||!p.originalCaptured||!p.public))return false;
        }else if(p.baitValue!==null||p.targetValue!==null||p.retreated||p.originalCaptured||p.originalTarget!==''||p.chased)return false;
        if(p.type==='fire'&&(!Number.isSafeInteger(p.left)||p.left<1||p.left+RULES.fireLength>b.length-1)||p.type!=='fire'&&p.left!==null)return false;
        if(preparing){expectedReservations.push({side:p.side,unit:p.unit,round:p.round,planId:p.id});if(p.type==='huangzhong')expectedReservations.push({side:p.side,unit:p.unit,round:p.readyRound,planId:p.id});}
        if(p.type==='watch'||p.type==='xushu'){const target=s.plans.find(x=>x.id===p.planId);if(!target||target.side===p.side||Number(target.id.slice(10))>=n+1||p.type==='watch'&&(target.type!=='huangzhong'||target.readyRound!==p.round)||p.type==='xushu'&&!targetTypes.includes(target.type))return false;}
      }
      for(const p of s.plans){const revealed=s.plans.filter(x=>x.type==='xushu'&&x.planId===p.id).map(x=>x.side);if(JSON.stringify(p.revealedTo)!==JSON.stringify(revealed))return false;}
      if(JSON.stringify(expectedReservations)!==JSON.stringify(s.reservations)||s.plans.filter(p=>p.type==='fire'&&undecided(p)).length>1)return false;
      for(const side of sides){const owned=s.plans.filter(p=>p.side===side),identitiesUsed=owned.filter(p=>identityTypes.includes(p.type));if(s.points[side]!==RULES.points-owned.reduce((sum,p)=>sum+kind(p.type).cost,0)||identitiesUsed.length>1||s.identityUsed[side]!==!!identitiesUsed.length||s.submitted[side]!==Math.max(0,...owned.map(p=>p.round)))return false;}
      const spent=new Set();for(const attack of s.spent){if(!exact(attack,['side','unit','round','kind','planId'])||!sides.includes(attack.side)||!known(attack.side,attack.unit)||attack.round!==s.round||!['normal','trigger','charge','rescue'].includes(attack.kind)||spent.has(attack.side+':'+attack.unit))return false;spent.add(attack.side+':'+attack.unit);if(attack.kind==='trigger'){const p=s.plans.find(p=>p.id===attack.planId);if(!p||p.type!=='huangzhong'||p.status!=='triggered'||p.side!==attack.side||p.unit!==attack.unit||p.readyRound!==s.round)return false;}else if(attack.kind==='rescue'){const p=s.plans.find(p=>p.id===attack.planId);if(!p||p.type!=='zhaoyun'||!p.effectApplied||p.status!=='triggered'||p.side!==attack.side||p.target!==attack.unit||p.readyRound!==s.round||s.reservations.some(r=>r.side===attack.side&&r.unit===attack.unit&&r.round===s.round))return false;}else if(attack.kind==='charge'){const p=s.plans.find(p=>p.id===attack.planId);if(!p||p.type!=='machao'||!p.effectApplied||p.status!=='triggered'||p.side!==attack.side||p.unit!==attack.unit||p.readyRound!==s.round||s.reservations.some(r=>r.side===attack.side&&r.unit===attack.unit&&r.round===s.round))return false;}else if(attack.planId!==''||s.reservations.some(r=>r.side===attack.side&&r.unit===attack.unit&&r.round===s.round))return false;}
      if(s.phase==='planning'&&(s.orders!==null||s.spent.length))return false;
      if(s.phase==='acting'){if(!pair(s.orders))return false;for(const side of sides){const normalized=normalizeOrders(b,side,s.orders[side]);if(!normalized||JSON.stringify(normalized)!==JSON.stringify(s.orders[side]))return false;}}
      let lastEvent=0;for(const e of s.events){if(!exact(e,['id','round','type','side','unit','planId','text','visibleTo'])||!integer(e.id)||e.id<=lastEvent||!integer(e.round)||e.round<1||e.round>s.round||!['submit','watch','reveal','revealDetail','cancel','public','fire','trigger','chase','rescue','charge','expire'].includes(e.type)||!sides.includes(e.side)||typeof e.text!=='string'||e.text.length>500||!Array.isArray(e.visibleTo)||e.visibleTo.length<1||e.visibleTo.length>2||new Set(e.visibleTo).size!==e.visibleTo.length||e.visibleTo.some(side=>!sides.includes(side))||!s.plans.some(p=>p.id===e.planId&&p.side===e.side&&p.unit===e.unit)||e.type==='revealDetail'&&(e.visibleTo.length!==1||e.visibleTo[0]!==e.side))return false;lastEvent=e.id;}
      return true;
    }catch{return false;}
  }
  return {RULES,actions:definitions.map(copy),identities:copy(identities),create,identity,quote,submit,beginRound,preparationOrder,movementOverride,clipMove,afterMove,normalAttackAllowed,markMainAttack,endRound,cancel,pruneDead,view,valid};
})();
