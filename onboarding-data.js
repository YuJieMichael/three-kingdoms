'use strict';
// Prototype rewards: earned once by hall level, separate from recurring supplies.
const OnboardingData={
  archerTarget:30,
  // 开局选州（design/quick-specs/progression-rework-2026-10-18.md §1）。加成为试玩值；选州不改变出生位置。
  provinces:[
    {id:'jizhou',name:'冀州',desc:'粮食产量 +10%',production:{food:1.1}},
    {id:'jingzhou',name:'荆州',desc:'木材产量 +10%',production:{wood:1.1}},
    {id:'yizhou',name:'益州',desc:'石料产量 +10%',production:{stone:1.1}},
    {id:'yangzhou',name:'扬州',desc:'铁锭产量 +10%',production:{iron:1.1}},
    {id:'bingzhou',name:'并州',desc:'轻骑、铁骑训练时间 −15%',train:{cavalry:0.85}},
    {id:'liangzhou',name:'凉州',desc:'骑兵行军速度 +10%',march:{cavalry:1.1}},
    {id:'xuzhou',name:'徐州',desc:'枪兵、盾兵、弓兵训练时间 −10%',train:{infantry:0.9}},
    {id:'yuzhou',name:'豫州',desc:'黄金税收 +10%',production:{gold:1.1}}
  ],
  founding:{ruler:[2,6],banner:[1,1],city:[2,6],defaults:{ruler:'青溪城主',banner:'青',city:'青溪城'}},
  // Prototype hall pacing before governor, construction technology and game speed.
  // The first two levels retain the reference rules used by the archer route.
  hallSeconds:[1800,3995,9000,18000,36000,72000,126000,198000,288000,396000],
  // Hall 2 is 8 minutes so the second starter supply arrives early (design/balance/opening-pace-2026-10-08.md).
  hallBuildSeconds(level,referenceSeconds){return level===2?480:level<=2?referenceSeconds:this.hallSeconds[level-1]??referenceSeconds;},
  jewels:{min:2,max:5,weights:{pearl:40,coral:25,glass:15,amber:8,agate:5,crystal:3,jadeite:2,jade:1,nightPearl:1}},
  // v0.37.0: gifts 5–10 give half their former resources; 1–4 fund the archer opening and stay (design/quick-specs/pacing-rework-2026-10-19.md §3).
  gifts:[
    {level:1,title:'开府建衙',resources:{food:8000,wood:8000,stone:8000,iron:8000,gold:10000},items:{speed_build_15m:6,speed_build_1h:2,population:2}},
    {level:2,title:'筹备弓营',resources:{food:26000,wood:92000,stone:76000,iron:76000,gold:20000},items:{speed_build_1h:12,speed_build_3h:2,speed_research_1h:8,speed_research_3h:2,speed_train_1h:3,population:3}},
    {level:3,title:'步弓协同',resources:{food:80000,wood:80000,stone:120000,iron:80000,gold:30000},items:{speed_build_3h:2,speed_research_3h:3,speed_train_1h:4,population:2}},
    {level:4,title:'整军经略',resources:{food:120000,wood:120000,stone:180000,iron:120000,gold:40000},items:{speed_build_3h:1,speed_research_3h:4,speed_train_3h:3}},
    // Pearl 10 and coral 5 match the jewels needed for the 公士 noble rank, which 伍长 now requires.
    {level:5,title:'百工兴盛',resources:{food:90000,wood:90000,stone:135000,iron:90000,gold:30000},items:{speed_build_8h:2,speed_research_8h:2,speed_train_3h:4,starterJewelBox:1},jewels:{pearl:10,coral:5}},
    {level:6,title:'将才初成',resources:{food:130000,wood:130000,stone:195000,iron:130000,gold:45000},items:{speed_build_8h:2,speed_build_3h:1,speed_research_8h:3,speed_train_8h:2,starterJewelBox:1,starterEquipmentBasic:1}},
    {level:7,title:'城坚兵锐',resources:{food:180000,wood:180000,stone:270000,iron:180000,gold:60000},items:{speed_build_8h:5,speed_research_8h:4,speed_train_8h:3,starterJewelBox:1}},
    {level:8,title:'良将精装',resources:{food:240000,wood:240000,stone:360000,iron:240000,gold:80000},items:{speed_build_8h:8,speed_research_8h:5,speed_train_8h:4,starterJewelBox:1,starterEquipmentFine:1}},
    {level:9,title:'进军州县',resources:{food:310000,wood:310000,stone:465000,iron:310000,gold:100000},items:{speed_build_15_30h:1,speed_build_8h:11,speed_build_15m:1,speed_research_8h:6,speed_train_8h:5,starterJewelBox:2,blueprint:2}},
    {level:10,title:'经略一方',resources:{food:400000,wood:400000,stone:600000,iron:400000,gold:135000},items:{speed_build_15_30h:4,speed_research_15_30h:2,speed_train_15_30h:2,starterJewelBox:2,starterEquipmentFine:1,blueprint:2}}
  ]
};
ManualData.shop.push(
  {id:'starterJewelBox',name:'珠宝盒',category:'珍宝',effect:'jewelBox',rewardOnly:true,price:0,seconds:0,desc:'打开后随机获得一种珠宝 2–5 枚，数量等概率。种类概率可在开盒界面查看；可用于晋升或史诗进献。'},
  {id:'starterEquipmentBasic',name:'普通装备盒',category:'装备',effect:'equipmentBox',tier:1,rewardOnly:true,price:0,seconds:0,desc:'选择兵器、铠甲、头盔或佩饰，获得一件普通装备；将领 1 级可穿戴。装备库满时保留盒子。'},
  {id:'starterEquipmentFine',name:'精良装备盒',category:'装备',effect:'equipmentBox',tier:2,rewardOnly:true,price:0,seconds:0,desc:'选择兵器、铠甲、头盔或佩饰，获得一件精良装备；将领 5 级可穿戴。装备库满时保留盒子。'}
);
