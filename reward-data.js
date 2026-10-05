'use strict';
// Prototype economy, missions and prisoner rules requested for this game.
const RewardData = {
  goldBricks:[
    {id:'goldBrick',name:'金砖',price:50,gold:50000},
    {id:'goldBrickLarge',name:'大金砖',price:180,gold:200000}
  ],
  captives:{baseChance:.3,perLevel:.02,maxChance:.5,minRatio:.03,maxRatio:.08,escortRatio:.25,maxPerBattle:300,maxCapacity:5000,food:50,goldRatio:.5,minGold:20,units:['militia','spear','shield','archer','cavalry','heavy']},
  extendMissions(missions){
    // Stable old IDs keep earlier claims collected; improved rewards apply to unclaimed missions.
    for(const m of missions)m.reward=Object.fromEntries(Object.entries(m.reward).map(([id,n])=>[id,Math.round(n*(id==='gold'?2:1.5))]));
    const supply=(n,g)=>({food:n,wood:n,stone:n,iron:n,gold:g});
    const add=(id,stage,title,desc,route,check,reward,items={})=>missions.push({id,stage,title,desc,route,check,reward,items});
    const levels=(s,id)=>s.plots.some(p=>p.type===id&&p.level>=3);
    const held=(s,id)=>s.army[id]+[s.expedition,...s.expeditions,...Object.values(s.garrisons)].filter(Boolean).reduce((n,e)=>n+(e.army[id]||0),0);
    const metric=(s,id)=>s.activityMetrics[id]||0;
    for(const [id,name] of [['academy','书院'],['market','市场'],['inn','客栈'],['tavern','招贤馆'],['smith','铁匠铺'],['workshop','工匠作坊'],['stable','马厩'],['beacon','烽火台'],['wall','城墙']])
      add('develop_'+id,'城池经营',name+'落成','完成 1 座 1 级'+name,'inner',s=>s.buildings[id]>=1,supply(8000,18000));
    for(const level of [3,4,5,7])add('hall_'+level,'城池经营','官府扩建 · '+level+'级','官府达到 '+level+' 级','inner',s=>s.buildings.hall>=level,supply(level*6000,level*20000),{'speed_build_1h':1});
    add('warehouse3','城池经营','储备军资','仓库达到 3 级','inner',s=>s.buildings.warehouse>=3,supply(18000,30000));
    add('population300','城池经营','人丁兴旺','当前人口达到 300，或累计训练 100 名士兵','inner',s=>s.population>=300||s.stats.trained>=100,supply(12000,24000));
    add('fields8','城池经营','田野成片','完成 8 块任意资源田','outer',s=>s.plots.filter(p=>p.type).length>=8,supply(20000,30000));
    for(const [id,name] of [['farm','农田'],['lumber','伐木场'],['quarry','采石场'],['mine','铁矿']])add('field3_'+id,'城池经营',name+'精耕','任意'+name+'达到 3 级','outer',s=>levels(s,id),supply(12000,20000));
    add('firstCivic','城池经营','施政安民','累计执行 1 次官府安抚或征收指令','civic',s=>metric(s,'civic')>=1,supply(8000,20000));
    add('trade10000','城池经营','商路初通','累计在市场买卖 10,000 份资源','market',s=>metric(s,'trade')>=10000,supply(10000,25000));
    const technology=Object.keys(ManualData.technology);
    add('researchFirst','书院研习','初习技术','任意科技达到 1 级','research',s=>technology.some(id=>s.tech[id]>=1),supply(10000,30000),{'speed_research_15m':2});
    for(const [id,name] of [['plant','种植技术'],['logging','砍伐技术'],['mining','挖掘技术'],['smelting','冶炼技术'],['combat','战斗技巧'],['shooting','抛射技巧'],['construction','建筑技术']])
      add('study_'+id,'书院研习',name+'入门',name+'达到 1 级','research',s=>s.tech[id]>=1,supply(8000,20000));
    add('researchTotal10','书院研习','百工争鸣','科技等级总和达到 10','research',s=>technology.reduce((n,id)=>n+s.tech[id],0)>=10,supply(24000,60000),{'speed_research_1h':2});
    add('researchTotal25','书院研习','经略有成','科技等级总和达到 25','research',s=>technology.reduce((n,id)=>n+s.tech[id],0)>=25,supply(40000,100000),{'speed_research_3h':1});
    for(const [id,name,count] of [['spear','长枪兵',30],['shield','刀盾兵',30],['archer','弓箭兵',30],['cavalry','轻骑兵',20],['scout','斥候',5],['wagon','辎重车',5]])
      add('army_'+id,'整军出征',name+'成队','拥有 '+count+' 名'+name+'（驻城、出征和驻军均计入）','army',s=>held(s,id)>=count,supply(10000,24000),{'speed_train_15m':1});
    for(const count of [100,300,1000])add('trained_'+count,'整军出征','练兵里程 · '+count,'累计完成训练 '+count+' 名士兵','army',s=>s.stats.trained>=count,supply(Math.min(40000,count*80),count*180),{'speed_train_1h':1});
    add('scouted3','征战里程','知己知彼','累计完成 3 次侦察','world',s=>metric(s,'scout')>=3,supply(8000,20000));
    add('claimWild','征战里程','开拓疆土','占领任意 1 块网格野地','world',s=>Object.keys(s.landClaims).length>=1,supply(15000,40000));
    for(const [id,name] of [['wood','青竹林'],['pass','白石隘口'],['mine','赤铁山']])add('conquest_'+id,'征战里程','攻取'+name,'掠夺或占领'+name+'并获胜','world',s=>!!(s.raided[id]||s.conquered[id]),supply(12000,30000));
    for(const count of [25,50,100])add('victories_'+count,'征战里程','百战功勋 · '+count,'累计赢得 '+count+' 场战斗','world',s=>s.stats.victories>=count,supply(count*1000,count*4000),{'goldBrick':1});
    add('captureFirst','征战里程','收容降卒','战斗胜利后累计获得 1 名俘虏','world',s=>metric(s,'capture')>=1,supply(10000,30000));
    add('recruitCaptives10','征战里程','化敌为友','累计招降 10 名俘虏','captives',s=>metric(s,'captive_recruit')>=10,supply(15000,40000));
  }
};
for(const brick of RewardData.goldBricks)ManualData.shop.push({...brick,category:'黄金补给',effect:'gold',seconds:0,trialPrice:true,trialEffect:true,desc:'使用后获得 '+brick.gold.toLocaleString('zh-CN')+' 黄金，可暂时超过官府黄金容量。'});
