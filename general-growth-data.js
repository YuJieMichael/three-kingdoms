'use strict';
// Skill values and costs are this game's trial rules, not a historical attribute table.
const GeneralGrowthData={
  // Levels 6-10 (late game): each counts 1.5x and level 10 adds one more step; they cost jadeite and jade.
  maxLevel:10,
  heroLevels:[0,1,3,5,8,12,15,18,22,26,30],
  steps:level=>Math.min(level,5)+1.5*Math.max(0,level-5)+(level>=10?1:0),
  routes:[
    {id:'cavalry',name:'骑军统领',description:'每级轻骑兵、铁骑兵与斥候攻击 +6%，仅由这三种兵组成的编队行军速度 +5%。',units:['cavalry','heavy','scout'],attack:.06,march:.05,gate:0,stats:{}},
    {id:'archer',name:'弓军统领',description:'每级弓箭手与床弩攻击 +8%。',units:['archer','ballista'],attack:.08,march:0,gate:0,stats:{}},
    {id:'siege',name:'攻城统领',description:'每级冲车、投石车攻击 +6%，器械攻城门伤害 +8%。',units:['ram','catapult'],attack:.06,march:0,gate:.08,stats:{}},
    {id:'politics',name:'治城谋略',description:'每级内政 +4、智谋 +3、统率 +2，加快新安排的建设与研究。',units:[],attack:0,march:0,gate:0,stats:{pol:4,wis:3,lead:2}}
  ],
  cost:level=>level<=5?{merit:20*level,gold:4000*level*level,jewels:{pearl:Math.ceil(level/2),...(level>=3?{coral:Math.floor(level/3)}:{})}}:{merit:30*level,gold:6000*level*level,jewels:{jadeite:level-4,...(level>=8?{jade:level-7}:{})}}
};
