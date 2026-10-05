'use strict';
// Read-only planning. Actions still go through the ordinary confirmation screens.
const GrowthGuide=(()=>{
  function resources(game,cost){const rates=game.rates(),missing=Object.entries(cost||{}).filter(([id,n])=>game.state.res[id]<n).map(([id,n])=>({id,amount:Math.ceil(n-game.state.res[id]),blocked:n>game.capacity(id)||rates[id]<=0,seconds:rates[id]>0?Math.ceil((n-game.state.res[id])/rates[id]*60):null}));return {missing,seconds:missing.some(x=>x.blocked)?null:Math.max(0,...missing.map(x=>x.seconds))};}
  function held(game,id){const s=game.state;return s.army[id]+[...game.allExpeditions(),...Object.values(s.garrisons)].reduce((n,e)=>n+(e.army[id]||0),0);}
  function archerComplete(game){const s=game.state;return held(game,'archer')>=OnboardingData.archerTarget||(s.activityMetrics.train_archer||0)>=OnboardingData.archerTarget||s.missionClaims.includes('army_archer');}
  function model(game){
    const s=game.state,gift=OnboardingSystem.available(s)[0];
    if(gift)return {kind:'gift',id:gift.level,title:'领取第 '+gift.level+' 阶 · '+gift.title,reason:'官府等级已达标，领取资源和道具，为下一段成长备齐补给。'};
    const phase=archerComplete(game)?'hall':'archer';
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
      return {kind,id,level,site,cost,title:(current?'升级':'建设')+name+'至 '+level+' 级',reason:trail.length?'为了'+trail.join(' → ')+'，先完成这项前置。':'民房与资源产业支持弓兵所需的人口、材料和科技。'};
    }
    if(phase==='hall'){if(s.buildings.hall<10){const goal=resolve('building','hall',s.buildings.hall+1);if(goal)return {...goal,phase,reason:'弓兵已经成队。推进官府 '+(s.buildings.hall+1)+' 级，解锁下一阶补给；'+goal.reason};}return {kind:'complete',phase,title:'十阶成长达成，继续经略州县',reason:'弓兵负责远程输出，步兵保护前排。继续科技、将领、装备与章节征战。'};}
    for(const [id,level]of [['house',2],['farm',1],['lumber',2],['quarry',2],['mine',3],['hall',2],['barracks',4],['academy',4]]){const goal=resolve('building',id,level);if(goal)return goal;}
    for(const [id,level]of [['training',4],['shooting',1]]){const goal=resolve('tech',id,level);if(goal)return goal;}
    const count=OnboardingData.archerTarget-held(game,'archer'),pending=s.trainQueue.filter(q=>q.id==='archer');
    if(pending.reduce((n,q)=>n+q.count,0)>=count){const q=pending.at(-1);return {kind:'queue',id:'archer',queueKind:'train',queue:q,title:'首支弓兵部队正在训练',reason:'完成后即可搭配步兵，准备侦察与出征。'};}
    const needed=Math.max(1,count-pending.reduce((n,q)=>n+q.count,0)),people=needed*game.units.archer.people;
    if(game.freePopulation()<people){if(game.maxPop()*s.morale/100-game.workers()<people){const goal=resolve('building','house',Math.min(10,s.buildings.house+1));if(goal)return goal;return {kind:'population',title:'安抚百姓，提高可用人口',reason:'当前民心对应的人口上限不足，先到官府祈福或赈灾。',people};}return {kind:'population',title:'补足训练弓兵的空闲人口',reason:'典民令可补充居民；资源田工人会占用人口，训练每名弓箭兵消耗 2 人。',people};}
    if(s.trainQueue.length>=game.trainingLimit()){const q=s.trainQueue[0];return {kind:'queue',id:q.id,queueKind:'train',queue:q,title:'训练队列已满',reason:'先完成一批训练，再准备弓兵。'};}
    return {kind:'train',id:'archer',count:needed,cost:game.trainCost('archer',needed),title:'训练首支 '+OnboardingData.archerTarget+' 人弓兵队',reason:'义兵可临时补充兵力；弓箭兵是这条成长路线的远程主力，仍需步兵保护。'};
  }
  function key(game){const m=model(game);return JSON.stringify([m.kind,m.id,m.level,m.site,m.count,m.queue?.end,m.cost&&game.canPay(m.cost),m.people]);}
  return {resources,held,archerComplete,model,key};
})();
