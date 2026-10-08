'use strict';
// Prototype rewards: earned once by hall level, separate from recurring supplies.
const OnboardingData={
  archerTarget:30,
  // Prototype hall pacing before governor, construction technology and game speed.
  // The first two levels retain the reference rules used by the archer route.
  hallSeconds:[1800,3995,9000,18000,36000,72000,126000,198000,288000,396000],
  hallBuildSeconds(level,referenceSeconds){return level<=2?referenceSeconds:this.hallSeconds[level-1]??referenceSeconds;},
  jewels:{min:2,max:5,weights:{pearl:40,coral:25,glass:15,amber:8,agate:5,crystal:3,jadeite:2,jade:1,nightPearl:1}},
  gifts:[
    {level:1,title:'奉诏立城',resources:{food:40000,wood:40000,stone:40000,iron:40000,gold:10000},items:{speed_build_15m:6,speed_build_1h:2,population:2}},
    {level:2,title:'筹备弓营',resources:{food:60000,wood:60000,stone:90000,iron:60000,gold:20000},items:{speed_build_1h:12,speed_build_3h:2,speed_research_1h:8,speed_research_3h:2,speed_train_1h:3,population:3}},
    {level:3,title:'步弓协同',resources:{food:80000,wood:80000,stone:120000,iron:80000,gold:30000},items:{speed_build_3h:2,speed_research_3h:3,speed_train_1h:4,population:2}},
    {level:4,title:'整军经略',resources:{food:120000,wood:120000,stone:180000,iron:120000,gold:40000},items:{speed_build_3h:1,speed_research_3h:4,speed_train_3h:3}},
    // Pearl 10 and coral 5 match the jewels needed for the 公士 noble rank, which 伍长 now requires.
    {level:5,title:'百工兴盛',resources:{food:180000,wood:180000,stone:270000,iron:180000,gold:60000},items:{speed_build_8h:2,speed_research_8h:2,speed_train_3h:4,starterJewelBox:1},jewels:{pearl:10,coral:5}},
    {level:6,title:'将才初成',resources:{food:260000,wood:260000,stone:390000,iron:260000,gold:90000},items:{speed_build_8h:2,speed_build_3h:1,speed_research_8h:3,speed_train_8h:2,starterJewelBox:1,starterEquipmentBasic:1}},
    {level:7,title:'城坚兵锐',resources:{food:360000,wood:360000,stone:540000,iron:360000,gold:120000},items:{speed_build_8h:5,speed_research_8h:4,speed_train_8h:3,starterJewelBox:1}},
    {level:8,title:'良将精装',resources:{food:480000,wood:480000,stone:720000,iron:480000,gold:160000},items:{speed_build_8h:8,speed_research_8h:5,speed_train_8h:4,starterJewelBox:1,starterEquipmentFine:1}},
    {level:9,title:'进军州县',resources:{food:620000,wood:620000,stone:930000,iron:620000,gold:200000},items:{speed_build_15_30h:1,speed_build_8h:11,speed_build_15m:1,speed_research_8h:6,speed_train_8h:5,starterJewelBox:2,blueprint:2}},
    {level:10,title:'经略一方',resources:{food:800000,wood:800000,stone:1200000,iron:800000,gold:270000},items:{speed_build_15_30h:4,speed_research_15_30h:2,speed_train_15_30h:2,starterJewelBox:2,starterEquipmentFine:1,blueprint:2}}
  ]
};
ManualData.shop.push(
  {id:'starterJewelBox',name:'珠宝盒',category:'珍宝',effect:'jewelBox',rewardOnly:true,price:0,seconds:0,desc:'打开后随机获得一种珠宝 2–5 枚，数量等概率。种类概率可在开盒界面查看；可用于晋升或史诗进献。'},
  {id:'starterEquipmentBasic',name:'普通装备盒',category:'装备',effect:'equipmentBox',tier:1,rewardOnly:true,price:0,seconds:0,desc:'选择兵器、铠甲、头盔或佩饰，获得一件普通装备；将领 1 级可穿戴。装备库满时保留盒子。'},
  {id:'starterEquipmentFine',name:'精良装备盒',category:'装备',effect:'equipmentBox',tier:2,rewardOnly:true,price:0,seconds:0,desc:'选择兵器、铠甲、头盔或佩饰，获得一件精良装备；将领 5 级可穿戴。装备库满时保留盒子。'}
);
