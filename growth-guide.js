'use strict';
// Read-only planning. Actions still go through the ordinary confirmation screens.
const GrowthGuide=(()=>{
  function resources(game,cost){const rates=game.rates(),missing=Object.entries(cost||{}).filter(([id,n])=>game.state.res[id]<n).map(([id,n])=>({id,amount:Math.ceil(n-game.state.res[id]),blocked:n>game.capacity(id)||rates[id]<=0,seconds:rates[id]>0?Math.ceil((n-game.state.res[id])/rates[id]*60):null}));return {missing,seconds:missing.some(x=>x.blocked)?null:Math.max(0,...missing.map(x=>x.seconds))};}
  function held(game,id){const s=game.state;return s.army[id]+[...game.allExpeditions(),...Object.values(s.garrisons)].reduce((n,e)=>n+(e.army[id]||0),0);}
  function archerComplete(game){const s=game.state;return held(game,'archer')>=OnboardingData.archerTarget||(s.activityMetrics.train_archer||0)>=OnboardingData.archerTarget||s.missionClaims.includes('army_archer');}
  function model(game){
    const s=game.state,gift=OnboardingSystem.available(s)[0];
    if(gift)return {kind:'gift',id:gift.level,title:'领取第 '+gift.level+' 阶 · '+gift.title,reason:'官府等级已达标，领取资源和道具，为下一段成长备齐补给。'};
    const phase=archerComplete(game)?s.onboarding.firstBattle==='active'?'battle':'hall':'archer';
    const seen=new Set();
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
      if(expedition){const returning=expedition.phase==='return',arrived=expedition.phase==='march'&&expedition.end<=Date.now();return {kind:returning?'battleReturn':arrived?'battleArrival':'battleMarch',id:expedition.node,expedition,title:returning?(battle?.result?.won?'查看首胜收获，等待部队返城':'部队返城，准备补兵再战'):arrived?'部队已抵达，进入战斗':'部队正在行军',reason:returning?'基础战利品已在战斗结算时入库，以战报的实际入库和仓储损失为准；伤兵已计入返城部队，永久损失需要重新训练。':arrived?'进入战斗后先检查弓兵的射程与指令，再逐回合推进。':'行军期间可查看出征队伍，必要时通过原确认界面召回。',end:expedition.end};}
      const returningGarrison=Object.entries(s.garrisons).find(([,g])=>g.phase==='return');if(returningGarrison)return {kind:'garrison',id:returningGarrison[0],end:returningGarrison[1].end,title:'等待驻军返城，完成整备',reason:'驻将与幸存部队正在返城。等队伍回到城内，再检查弓兵人数与首胜收获。'};
      const away=Object.entries(s.garrisons).find(([,g])=>g.army.archer>0);
      if(s.army.archer<OnboardingData.archerTarget&&away)return {kind:'garrison',id:away[0],title:'召回弓兵，整备首战部队',reason:'弓兵正在驻守或返城，不必重复征兵。召回保留领地归属，待返城后再出征。'};
      const restore=train('archer',OnboardingData.archerTarget,s.stats.victories?'补回永久损失，恢复 30 名弓兵。伤兵会随部队返城，不需要重复训练。':'弓兵已解锁，补齐 30 人再战。先用「向前」进入射程，再按距离选择「坚守」。');if(restore)return restore;
      if(s.stats.victories>0){const promotion=HeritageSystem.promotionQuote(s,'office');return {kind:'firstBattleComplete',id:target,title:'首战闭环完成，查看收获与官职晋升',reason:'首胜会获得珍珠，晋升伍长需声望 1000 与珍珠 1 枚，确认后消耗珍珠。可先领取首胜任务、查看官爵；条件不足时继续官府成长。',promotionReady:!!promotion?.next&&!promotion.reason};}
      const drill=resolve('building','drill',1);if(drill)return drill;
      const scouting=resolve('tech','scouting',1);if(scouting)return {...scouting,reason:'出征前先探明敌情。研究侦察 1 级后，训练一名斥候；'+scouting.reason};
      if(!s.scouted[target]){const scout=train('scout',1,'斥候用于查看敌军数量区间，留在城内执行侦察，不承担弓兵输出。');if(scout)return scout;return {kind:'scout',id:target,cost:{food:10},title:'侦察河畔荒田，查看敌军情报',reason:'打开河畔荒田，点击斥候侦察，再查看守军兵种与数量区间。侦察 1 级不会显示精确数量。'};}
      const free=s.generals.filter(id=>!HeritageSystem.roleOf(s,id)&&!game.generalBusy(id));
      if(!free.length){const stationed=Object.entries(s.garrisons)[0];return stationed?{kind:'garrison',id:stationed[0],title:'召回驻将，准备首战主将',reason:'当前没有空闲主将。驻将不能出征，先查看驻军并确认召回；已在返城的驻将需要等待。'}:{kind:'roles',title:'安排一位空闲出征主将',reason:'城守、城内主将与军师需留守。到城内任职调整职位，保留城守，并让一位将领空闲。'};}
      if(s.cooldowns[target]>Date.now())return {kind:'battleCooldown',id:target,end:s.cooldowns[target],title:'河畔荒田正在恢复',reason:'等待据点恢复后再战；期间可以补兵或发展城池。'};
      if(s.tactics.archer.command!=='advance')return {kind:'tactics',id:'archer',title:'设置弓兵向前，进入射程再坚守',reason:'出征战术中为弓箭兵选择「向前」。战场内可随时改令；「坚守」适合敌军已在射程内时保持距离。不会替你修改保存的战术。'};
      return {kind:'dispatch',id:target,general:free[0],count:OnboardingData.archerTarget,cost:{food:Math.ceil(OnboardingData.archerTarget*1.2+n.time*2)},title:'选择主将与弓兵，确认河畔荒田首战',reason:'查看情报后先掠夺练习：选空闲主将与 30 弓兵，斥候留城。已有枪兵可少量保护前排；确认人数、行军粮食和实际入库预览后开始行军。'};
    }
    if(phase==='battle')return {...firstBattle(),phase};
    if(phase==='hall'){if(s.buildings.hall<10){const goal=resolve('building','hall',s.buildings.hall+1);if(goal)return {...goal,phase,reason:'弓兵已经成队。推进官府 '+(s.buildings.hall+1)+' 级，解锁下一阶补给；'+goal.reason};}return {kind:'complete',phase,title:'十阶成长达成，继续经略州县',reason:'弓兵负责远程输出，步兵保护前排。继续科技、将领、装备与章节征战。'};}
    for(const [id,level]of [['house',2],['farm',1],['lumber',2],['quarry',2],['mine',3],['hall',2],['barracks',4],['academy',4]]){const goal=resolve('building',id,level);if(goal)return goal;}
    for(const [id,level]of [['training',4],['shooting',1]]){const goal=resolve('tech',id,level);if(goal)return goal;}
    return train('archer',OnboardingData.archerTarget,'义兵可临时补充兵力；弓箭兵是这条成长路线的远程主力，仍需步兵保护。');
  }
  function key(game){const m=model(game);return JSON.stringify([m.kind,m.phase,m.id,m.level,m.site,m.count,m.queue?.end,m.end,m.inRange,m.command,m.promotionReady,m.cost&&game.canPay(m.cost),m.people]);}
  return {resources,held,archerComplete,model,key};
})();
