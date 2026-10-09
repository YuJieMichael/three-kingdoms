'use strict';
// Read-only planning. Actions still go through the ordinary confirmation screens.
const GrowthGuide=(()=>{
  function resources(game,cost){const rates=game.rates(),missing=Object.entries(cost||{}).filter(([id,n])=>game.state.res[id]<n).map(([id,n])=>({id,amount:Math.ceil(n-game.state.res[id]),blocked:n>game.capacity(id)||rates[id]<=0,seconds:rates[id]>0?Math.ceil((n-game.state.res[id])/rates[id]*60):null}));return {missing,seconds:missing.some(x=>x.blocked)?null:Math.max(0,...missing.map(x=>x.seconds))};}
  function held(game,id){const s=game.state;return s.army[id]+[...game.allExpeditions(),...Object.values(s.garrisons)].reduce((n,e)=>n+(e.army[id]||0),0);}
  // The first battle is won on a landmark; the militia warm-up raid on a wild tile does not count.
  function landmarkVictory(s){return Object.keys(s.raided||{}).some(id=>!id.startsWith('wild_'));}
  function archerComplete(game){const s=game.state;return held(game,'archer')>=OnboardingData.archerTarget||(s.activityMetrics.train_archer||0)>=OnboardingData.archerTarget||s.missionClaims.includes('army_archer');}
  function governorAdvice(game){
    const s=game.state,id=s.governor,points=HeroSystem.remaining(s,id);if(points<1)return null;
    const g=game.general(id),base=game.generals.find(h=>h.id===id),plain=(base?.pol||0)+HeroSystem.bonus(s,id).pol,multiplier=plain?g.pol/plain:1;
    const before=1+s.tech.construction*.1+g.pol/100,after=before+points*multiplier/100;
    return {id,name:g.name,points,pol:g.pol,nextPol:g.pol+points*multiplier,reduction:(1-before/after)*100};
  }
  function model(game){
    const s=game.state,gift=OnboardingSystem.available(s)[0];
    if(gift)return {kind:'gift',id:gift.level,title:'领取新手补给 · 第 '+gift.level+' 阶',reason:'官府等级已达标，领取这一阶新手补给的资源和道具'+(gift.level===1?'；领取后任务「奉诏立城」即可完成。':'，为下一段成长备齐补给。')};
    const phase=archerComplete(game)?s.onboarding.firstBattle==='active'?'battle':'hall':'archer';
    const seen=new Set();
    // A brand-new city first gets one farm: an immediate, visible source of food before the archer route.
    if(!s.plots.slice(0,game.unlockedPlots()).some((p,i)=>p.type||game.plotJob(i))){const step=resolve('building','farm',1);if(step?.kind==='building')return {...step,title:'开垦第一块农田',reason:'城外有空地可以开垦。先建一块农田，建成后每小时稳定产出粮食，供养百姓与士兵。'};if(step)return step;}
    function resolve(kind,id,target,trail=[]){
      const current=kind==='tech'?s.tech[id]:game.requirementLevel(id);if(current>=target)return null;
      const key=kind+':'+id+':'+target;if(seen.has(key))return {kind:'blocked',title:'检查成长条件',reason:'前置条件发生循环，请查看任务与建筑详情。'};seen.add(key);
      const level=current+1,name=kind==='tech'?game.manual.technology[id].name:game.buildings[id].name;
      const pending=kind==='tech'?s.researchQueue:s.buildQueue.find(q=>q.id===id&&q.level>current);
      if(pending&&(kind!=='tech'||pending.id===id))return {kind:'queue',id,queueKind:kind==='tech'?'research':'build',queue:pending,title:name+' → '+pending.level+' 级正在进行',reason:trail.length?'这是当前成长目标所需的前置。':'等待完成后自动显示下一目标。'};
      const conditions=kind==='tech'?ReferenceRules.researchConditions[id]?.[level]||[]:game.buildingConditions(id,level);
      for(const r of conditions){if(r.kind==='item'){if((s.inventory[r.id]||0)<r.level)return {kind:'item',id:r.id,title:'准备 '+game.manual.shop.find(i=>i.id===r.id).name,reason:name+' '+level+' 级需要该道具，可查看商城或已解锁礼包。'};}else{const next=resolve(r.kind==='tech'?'tech':'building',r.id,r.level,[name,...trail]);if(next)return next;}}
      if(kind==='tech'&&s.researchQueue)return {kind:'queue',id:s.researchQueue.id,queueKind:'research',queue:s.researchQueue,title:'书院正在研究其他科技',reason:'等待当前研究完成，再继续弓兵路线。'};
      if(kind==='building'&&s.buildQueue.length>=game.buildLimit()){const q=[...s.buildQueue].sort((a,b)=>a.end-b.end)[0];return {kind:'queue',id:q.id,queueKind:'build',queue:q,title:'建造队正在忙碌',reason:'工程完成后即可继续当前目标，也可选择使用建造加速。'};}
      const plot=Object.hasOwn(game.plotTypes,id)?s.plots.reduce((best,p,i)=>p.type===id&&(best<0||p.level>s.plots[best].level)?i:best,-1):-1;
      const index=Object.hasOwn(game.plotTypes,id)?plot>=0?plot:s.plots.findIndex((p,i)=>!p.type&&!game.plotJob(i)&&i<game.unlockedPlots()):s.cityLayout.reduce((best,x,i)=>x===id&&(best<0||s.cityLevels[i]>s.cityLevels[best])?i:best,-1);
      const site=kind==='tech'?-1:index>=0?index:s.cityLayout.indexOf(null);
      if(kind==='building'&&site<0)return {kind:'blocked',title:'需要可建设的空地',reason:'请整理城内建筑或升级官府开放更多资源田。'};
      const cost=kind==='tech'?game.researchCost(id):Object.hasOwn(game.plotTypes,id)?game.plotCost(site,id):game.buildRecord(id,level).cost;
      const shortage=resources(game,cost);
      if(shortage.missing.length&&shortage.seconds===null&&id!=='market'&&id!=='warehouse'){
        if(s.buildings.market<1){const market=resolve('building','market',1,[name,...trail]);if(market)return {...market,reason:name+'的物资缺口暂时不能靠当前仓储与产出补齐，先建设市场及其前置，再用黄金补给。'};}
        const missing=shortage.missing.find(x=>x.id!=='gold'&&game.tradeQuote(x.id,true).limit>0);
        if(missing)return {kind:'trade',id:missing.id,amount:missing.amount,title:'购买'+game.resources[missing.id].name+'补足成长材料',reason:'目标为'+name+' '+level+' 级。市场买入允许暂时超仓，消耗黄金；先核对数量与价格再确认。'};
      }
      return {kind,id,level,site,cost,title:(kind==='tech'?'研究':current?'升级':'建设')+name+'至 '+level+' 级',reason:trail.length?'为了'+trail.join(' → ')+'，先完成这项前置。':'民房与资源产业支持弓兵所需的人口、材料和科技。'};
    }
    function train(id,target,reason){
      const count=Math.max(0,target-s.army[id]),pending=s.trainQueue.filter(q=>q.id===id),queued=pending.reduce((n,q)=>n+q.count,0);
      if(!count)return null;
      if(queued>=count){const q=pending.at(-1);return {kind:'queue',id,queueKind:'train',queue:q,title:game.units[id].name+'正在训练',reason:'完成训练后继续当前成长目标。'};}
      const needed=count-queued,people=needed*(game.units[id].people||1);
      if(game.freePopulation()<people){if(game.maxPop()*s.morale/100-game.workers()<people){const goal=resolve('building','house',Math.min(10,s.buildings.house+1));if(goal)return goal;return {kind:'population',title:'安抚百姓，提高可用人口',reason:'当前民心对应的人口上限不足，先到官府祈福或赈灾。',people};}return {kind:'population',title:'补足训练'+game.units[id].name+'的空闲人口',reason:'典民令可补充居民；也可等待人口增长。每名'+game.units[id].name+'消耗 '+(game.units[id].people||1)+' 人口。',people};}
      if(s.trainQueue.length>=game.trainingLimit()){const q=s.trainQueue[0];return {kind:'queue',id:q.id,queueKind:'train',queue:q,title:'训练队列已满',reason:'先完成当前训练，再继续补充兵力。'};}
      const cost=game.trainCost(id,needed),shortage=resources(game,cost);
      if(shortage.missing.length&&shortage.seconds===null){if(s.buildings.market<1){const goal=resolve('building','market',1);if(goal)return goal;}const missing=shortage.missing.find(x=>x.id!=='gold'&&game.tradeQuote(x.id,true).limit>0);if(missing)return {kind:'trade',id:missing.id,amount:missing.amount,title:'补足训练'+game.units[id].name+'的材料',reason:'市场买入允许暂时超仓，先核对黄金与购买数量再确认。'};}
      return {kind:'train',id,count:needed,cost,title:'训练 '+needed+' 名'+game.units[id].name,reason};
    }
    function firstBattle(){
      const target='field',n=game.getNode(target),battle=s.battle,expeditions=game.allExpeditions();
      if(s.cityDefense.battle)return {kind:'defense',title:'先完成当前守城战或演练',reason:'守城部队与出征战斗不能同时指挥。完成迎敌，或结束演练，再继续首战路线。'};
      // A deployed army must be handled before asking for replacement troops.
      if(battle&&!battle.finished){const row=battle.player.find(r=>r.id==='archer'&&r.hp>0),nearest=row?Math.min(...battle.enemy.filter(r=>r.hp>0).map(r=>Math.abs(r.pos-row.pos))):Infinity,inRange=!!row&&nearest<=row.stats.range;return {kind:'battle',id:battle.node,title:!row?'完成当前战斗，返城后整备弓兵':inRange?'敌军已进入射程，指挥弓兵射击':'向前接敌，让弓兵进入射程',reason:!row?'当前战场没有可指挥的弓兵。指挥剩余部队推进下一回合，结束战斗后查看损失并补兵。':inRange?'可将弓兵改为「坚守」保持距离；敌军退出射程时再「向前」。下好指令后点击下一回合。':'在战场选择弓箭兵的「向前」，观察最近敌军距离与射程，再推进下一回合。枪兵可保护前排，弓兵仍是主力。',inRange,command:battle.orders.archer?.command};}
      const expedition=expeditions.find(e=>e.node===target)||expeditions[0];
      if(expedition){const returning=expedition.phase==='return',arrived=expedition.phase==='march'&&expedition.end<=Date.now();return {kind:returning?'battleReturn':arrived?'battleArrival':'battleMarch',id:expedition.node,expedition,title:returning?(battle?.result?.won?'查看首胜收获，等待部队返城':'部队返城，准备补兵再战'):arrived?'部队已抵达，进入战斗':'部队正在行军',reason:returning?'基础战利品已在战斗结算时入库，以战报的实际入库和仓储损失为准；幸存部队正在返城，伤兵需在伤兵营付金治疗，永久损失需要重新训练。':arrived?'进入战斗后先检查弓兵的射程与指令，再逐回合推进。':'行军期间可查看出征队伍，必要时通过原确认界面召回。',end:expedition.end};}
      const returningGarrison=Object.entries(s.garrisons).find(([,g])=>g.phase==='return');if(returningGarrison)return {kind:'garrison',id:returningGarrison[0],end:returningGarrison[1].end,title:'等待驻军返城，完成整备',reason:'驻将与幸存部队正在返城。等队伍回到城内，再检查弓兵人数与首胜收获。'};
      const away=Object.entries(s.garrisons).find(([,g])=>g.army.archer>0);
      if(s.army.archer<OnboardingData.archerTarget&&away)return {kind:'garrison',id:away[0],title:'召回弓兵，整备首战部队',reason:'弓兵正在驻守或返城，不必重复征兵。召回保留领地归属，待返城后再出征。'};
      const restore=train('archer',OnboardingData.archerTarget,landmarkVictory(s)?'补回永久损失，恢复 30 名弓兵。幸存部队返城，伤兵需在伤兵营付金治疗，不需要重复训练。':'弓兵已解锁，补齐 30 人再战。先用「向前」进入射程，再按距离选择「坚守」。');if(restore)return restore;
      if(landmarkVictory(s)){const promotion=HeritageSystem.promotionQuote(s,'office');return {kind:'firstBattleComplete',id:target,title:'首战闭环完成，查看收获与官职晋升',reason:'首胜会获得珍珠，晋升伍长需先达到公士，另需声望 1000 与珍珠 1 枚；公士的黄金与珠宝条件可在官爵页查看。可先领取首胜任务、查看官爵；条件不足时继续官府成长。',promotionReady:!!promotion?.next&&!promotion.reason};}
      const drill=resolve('building','drill',1);if(drill)return drill;
      const scouting=resolve('tech','scouting',1);if(scouting)return {...scouting,reason:'出征前先探明敌情。研究侦察 1 级后，训练一名斥候；'+scouting.reason};
      if(!game.intel(target)){
        const mission=s.scoutQueue.find(m=>m.node===target);
        if(mission)return {kind:'scoutMarch',id:target,end:mission.end,title:mission.phase==='out'?'斥候正在前往河畔荒田':'侦察未获情报，等待幸存斥候返城',reason:mission.phase==='out'?'抵达后获得报告，先查看兵种与情报有效期。当前已有队伍，不必重复训练或派遣。':'返城后查看失败原因，增加斥候或提高侦察科技，再确认重新派遣。'};
        const scout=train('scout',1,'斥候需实际派往目标，抵达后取得情报；不承担弓兵输出。');if(scout)return scout;
        return {kind:'scout',id:target,cost:game.scoutQuote(target,1)?.cost,title:'侦察河畔荒田，查看敌军情报',reason:'打开河畔荒田，核对用时、耗粮与预计损失，再派遣斥候。一名斥候配侦察 1 级可获兵种情报；更多斥候和更高科技可提高精度。'};
      }
      const free=s.generals.filter(id=>!HeritageSystem.roleOf(s,id)&&!game.generalBusy(id));
      if(!free.length){const stationed=Object.entries(s.garrisons)[0];return stationed?{kind:'garrison',id:stationed[0],title:'召回驻将，准备首战主将',reason:'当前没有空闲主将。驻将不能出征，先查看驻军并确认召回；已在返城的驻将需要等待。'}:{kind:'roles',title:'安排一位空闲出征主将',reason:'城守、城内主将与军师需留守。到城内任职调整职位，保留城守，并让一位将领空闲。'};}
      if(s.cooldowns[target]>Date.now())return {kind:'battleCooldown',id:target,end:s.cooldowns[target],title:'河畔荒田正在恢复',reason:'等待据点恢复后再战；期间可以补兵或发展城池。'};
      if(s.tactics.archer.command!=='advance')return {kind:'tactics',id:'archer',title:'设置弓兵向前，进入射程再坚守',reason:'出征战术中为弓箭兵选择「向前」。战场内可随时改令；「坚守」适合敌军已在射程内时保持距离。不会替你修改保存的战术。'};
      return {kind:'dispatch',id:target,general:free[0],count:OnboardingData.archerTarget,cost:{food:Math.ceil(OnboardingData.archerTarget*1.2+n.time*2)},title:'选择主将与弓兵，确认河畔荒田首战',reason:'查看情报后先掠夺练习：选空闲主将与 30 弓兵，斥候留城。已有枪兵可少量保护前排；确认人数、行军粮食和实际入库预览后开始行军。'};
    }
    function campaign(){
      if(s.cityDefense.battle||s.battle&&!s.battle.finished||game.allExpeditions().length){const goal=firstBattle();return {...goal,title:goal.title.replaceAll('首胜','战斗').replaceAll('首战','当前作战')};}
      const reward=game.missions.find(m=>m.chapter&&game.missionReady(m));if(reward)return {kind:'campaignReward',id:reward.id,chapter:reward.chapter,title:'领取'+reward.title+'通关补给',reason:'已占领据点，领取一次性资源、珍宝和援军，再准备下一关。奖励预览和领取状态保留。'};
      let id,chapter=1;
      if(!s.conquered.camp)id='camp';
      else if(!s.conquered.fort){
        if(!game.countyUnlocked()){const groups=game.progression.groups(s),group=groups.find(g=>g.progress<1);return {kind:'epic',id:group.id,title:'开放县城 · '+group.name,reason:group.detail+'。四项史诗完成后才能攻打古渡县城；捐献士兵会离队，请保留出征主力。',progress:Math.min(100,Math.floor(group.progress*100)),route:'epic',shortages:group.id==='resources'?Object.keys(game.progression.resourceDonations).filter(key=>s.epic.resources[key]<100000).map(key=>({id:key,amount:Math.max(0,100000-s.res[key])})):[]};}
        id='fort';
      }else{chapter=ChapterData.completed(s,2)?3:2;id=ChapterData.progress(s,chapter).next?.id;}
      if(!id){
        const route=Object.keys(game.warOrders.routes).find(r=>s.warOrders.cleared[r]<10);
        if(route){const tier=s.warOrders.cleared[route]+1;return {kind:'orders',id:'order_'+route+'_'+tier,route,tier,title:'军令进阶 · '+game.warOrders.routes[route].name+'第 '+tier+' 阶',reason:'河洛已平定，继续三路军令。查看守军组成与攻城要求，补充永久损失、调整配兵；首通双倍军功可兑换加速、珠宝和装备。'};}
        const challenge=game.warOrders.challenges.find(c=>!s.warOrders.challenges.completed[c.id]);if(challenge)return {kind:'orders',id:challenge.id,route:challenge.route,title:'战术挑战 · '+challenge.name,reason:challenge.condition+'首次达标奖励军功 '+challenge.bonus+'；普通胜利保留基础收益。'};
        return {kind:'orders',id:'repeat',title:'军令循环 · 选择补给与战术目标',reason:'三路十阶与全部战术挑战已达成。按军功兑换需求选择复战路线；培养将领、强化装备，并留意补兵资源与耗粮。'};
      }
      if(!game.landmarkVisible(id))id=game.nextLandmark()?.id||id;
      const n=game.getNode(id),archers=chapter===1?(id==='fort'?300:n.level<=1?60:n.level===2?100:160):chapter===2?910:1650,front=chapter===1?(id==='fort'?60:id==='pass'||id==='mine'?30:0):chapter===2?325:525,technology=chapter===1?(id==='fort'?3:n.level<=1?1:2):5;
      for(const [tech,level]of [['combat',technology],['shooting',technology],...(front?[['protection',technology]]:[])]){const goal=resolve('tech',tech,level);if(goal)return {...goal,reason:'准备'+n.name+'：提升弓兵输出与前排防护；'+goal.reason};}
      for(const [unit,count]of [['archer',archers],...(front?[['shield',front]]:[]),...(n.fortification?[['ram',5]]:[])]){
        if(s.army[unit]<count){const away=Object.entries(s.garrisons).find(([,g])=>g.army[unit]>0);if(away)return {kind:'garrison',id:away[0],title:'查看外驻'+game.units[unit].name+'，准备'+n.name,reason:'该兵种已有部队在外驻守；可先收获采集并召回，或保留驻军另行练兵。不要将驻军误当成损失。'};}
        if(s.army[unit]>=count)continue;
        for(const [building,level]of Object.entries(game.units[unit].requires.buildings)){const goal=resolve('building',building,level);if(goal)return goal;}
        for(const [tech,level]of Object.entries(game.units[unit].requires.tech)){const goal=resolve('tech',tech,level);if(goal)return goal;}
        const goal=train(unit,count,'准备'+n.name+'：建议驻城'+game.units[unit].name+' '+count+' 名，当前 '+s.army[unit]+' 名。这是配兵准备参考，胜负还取决于指令、科技、将领和战场。');if(goal)return goal;
      }
      return {kind:'campaign',id,chapter,title:'占领'+n.name+'，推进'+(chapter===1?'第一章':ChapterData.chapterTitle(chapter)),reason:n.desc+'查看敌军、配兵与预计战利品，再自行确认占领；掠夺不推进章节。'+(n.fortification?'必须破城并歼敌，器械需要前排保护。':'弓兵为主力，按敌军组成安排前排。'),army:{archer:archers,...(front?{shield:front}:{})}};
    }
    // Resource fields produce in proportion to population / required workers; staff them before more upgrades.
    function staffing(){
      const workers=game.workers(),people=Math.floor(s.population);
      if(workers<=people||s.population>=game.maxPop()||!(s.inventory.population>0))return null;
      return {kind:'population',item:true,people:workers-people,title:'使用典民令，补足资源田劳动人口',reason:'资源田共需 '+workers+' 名劳动人口，城中只有 '+people+' 人，所有资源田只按 '+Math.floor(people/workers*100)+'% 的效率生产。用典民令补充居民，升级资源田才会真正涨产量。'};
    }
    // A short militia raid on the nearest level-1 wild tile breaks up the opening run of construction steps.
    function warmupTarget(){
      const h=game.home;let best=null;
      for(let r=1;r<=5&&!best;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const t=game.getNode('wild_'+(h.x+dx)+'_'+(h.y+dy));if(t?.wild&&t.level===1&&!game.attackBlocked(t.id,'raid')&&(!best||t.time<best.time))best=t;}
      return best;
    }
    function warmup(){
      const battle=s.battle,expedition=game.allExpeditions().find(e=>e.node.startsWith('wild_'));
      if(battle&&!battle.finished)return {kind:'battle',id:battle.node,warmup:true,title:'指挥义兵推进下一回合',reason:'义兵人多但单兵较弱，保持「向前」压上即可。下好指令后点击下一回合，直到战斗结束。'};
      if(expedition){const returning=expedition.phase==='return',arrived=expedition.phase==='march'&&expedition.end<=Date.now();return {kind:returning?'battleReturn':arrived?'battleArrival':'battleMarch',id:expedition.node,expedition,end:expedition.end,warmup:true,title:returning?'练兵出征结束，义兵正在返城':arrived?'义兵已抵达野地，进入战斗':'义兵正在行军',reason:returning?'掠夺所得已在战斗结算时入库，可查看战报。返城只需片刻，回城后继续建设。':arrived?'进入战斗后逐回合推进，义兵保持「向前」。':'行军需要一点时间，可以先查看行军，或继续等待抵达。'};}
      if(Object.keys(s.raided).some(id=>id.startsWith('wild_')))return null;
      const target=warmupTarget();if(!target)return null;
      const goal=train('militia',30,'义兵是军营 1 级就能招的民兵。先招 30 名，到城外掠夺一块 1 级野地练练手，顺便带回一些物资。');if(goal)return goal;
      const general=s.generals.find(id=>!HeritageSystem.roleOf(s,id)&&!game.generalBusy(id));if(!general)return null;
      return {kind:'dispatch',id:target.id,general,count:30,army:{militia:30},warmup:true,title:'派 30 名义兵掠夺 '+target.name,reason:'这块 1 级野地守军很少，30 名义兵足以取胜。确认主将、人数和行军粮食后出发；掠夺不占领，打完部队自动返城。'};
    }
    if(phase==='battle')return {...firstBattle(),phase};
    if(phase==='hall'){if(s.buildings.hall<10){const staff=staffing();if(staff)return {...staff,phase};const goal=resolve('building','hall',s.buildings.hall+1);if(goal)return {...goal,phase,reason:'弓兵已经成队。推进官府 '+(s.buildings.hall+1)+' 级，解锁下一阶补给；'+goal.reason};}return {...campaign(),phase:'campaign'};}
    const staff=staffing();if(staff)return staff;
    for(const [id,level]of [['house',2],['farm',1],['lumber',2],['quarry',2],['mine',3],['hall',2],['drill',1],['barracks',1]]){const goal=resolve('building',id,level);if(goal)return goal;}
    const drill=warmup();if(drill)return drill;
    for(const [id,level]of [['barracks',4],['academy',4]]){const goal=resolve('building',id,level);if(goal)return goal;}
    for(const [id,level]of [['training',4],['shooting',1]]){const goal=resolve('tech',id,level);if(goal)return goal;}
    return train('archer',OnboardingData.archerTarget,'义兵可临时补充兵力；弓箭兵是这条成长路线的远程主力，仍需步兵保护。');
  }
  function key(game){const m=model(game);return JSON.stringify([m.kind,m.phase,m.id,m.level,m.site,m.count,m.queue?.end,m.end,m.inRange,m.command,m.promotionReady,m.cost&&game.canPay(m.cost),m.people]);}
  return {resources,held,archerComplete,landmarkVictory,governorAdvice,model,key};
})();
