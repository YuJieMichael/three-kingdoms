'use strict';
// Original PVE chapter; all armies, loot, rewards and production bonuses are trial values.
const ChapterData={
  title:'第二章 · 平定北境',
  nodes:[
    {id:'north_road',name:'北原驿道',terrain:'grass',x:34,y:19,level:5,chapter:2,requires:'fort',desc:'古渡以北商路断绝。先清除步弓混编的路匪，重新打通粮道。',army:{shield:90,spear:110,archer:100,cavalry:25},loot:{food:1800,wood:1000,iron:700,gold:1600},reward:'粮道恢复 · 粮食产量 +10%',bonus:{food:.1},time:36},
    {id:'north_granary',name:'北原粮仓',terrain:'camp',x:30,y:16,level:5,chapter:2,requires:'north_road',desc:'夺回粮仓前须控制北原驿道。敌军弓兵众多，准备前排护卫与运输部队。',army:{shield:120,spear:90,archer:150,cavalry:30},loot:{food:3200,wood:1200,stone:700,gold:2000},reward:'夺回军粮 · 木材产量 +10%',bonus:{wood:.1},time:40},
    {id:'north_ford',name:'寒川渡口',terrain:'lake',x:35,y:12,level:6,chapter:2,requires:'north_granary',desc:'粮仓供给稳固后才能进军渡口。枪兵守住桥头，骑兵巡逻两岸。',army:{spear:160,shield:110,archer:130,cavalry:60},loot:{food:2200,wood:1800,iron:1100,gold:2400},reward:'控制渡口 · 石料产量 +10%',bonus:{stone:.1},time:44},
    {id:'north_camp',name:'朔风骑营',terrain:'camp',x:39,y:10,level:6,chapter:2,requires:'north_ford',desc:'渡河后遭遇敌军骑营。用长枪兵抵挡冲阵，注意弓兵与运输队安全。',army:{cavalry:130,heavy:25,spear:110,archer:100},loot:{food:2600,wood:1300,iron:2000,gold:3000},reward:'拔除骑营 · 铁锭产量 +10%',bonus:{iron:.1},time:48},
    {id:'north_pass',name:'玄石关',terrain:'mountain',x:35,y:7,level:7,chapter:2,requires:'north_camp',desc:'北境大营的门户，由刀盾兵与床弩联合封锁。先侦察，再选择射程与兵种搭配。',army:{shield:220,spear:150,archer:170,ballista:20},loot:{food:3000,stone:2600,iron:2400,gold:4000},reward:'攻克关隘 · 北境大营开放',time:54},
    {id:'north_keep',name:'北境大营',terrain:'camp',x:40,y:5,level:8,chapter:2,requires:'north_pass',desc:'北境叛军的最终据点。混编重兵与远程器械守营，准备充足兵力与运输能力再发动决战。',army:{shield:260,spear:200,archer:220,cavalry:100,heavy:35,ballista:30},loot:{food:4500,wood:3000,stone:3000,iron:3000,gold:6000},reward:'平定北境 · 第二章完成',time:60}
  ],
  rewards:[
    {resources:12000,gold:40000,jewels:{pearl:3},items:{speed_train_1h:1}},
    {resources:16000,gold:50000,jewels:{pearl:5},items:{speed_build_1h:1}},
    {resources:20000,gold:60000,jewels:{coral:3},items:{speed_research_1h:1}},
    {resources:24000,gold:75000,jewels:{coral:5},items:{speed_train_3h:1}},
    {resources:30000,gold:100000,jewels:{glass:5},items:{speed_build_3h:1}},
    {resources:40000,gold:150000,jewels:{amber:5},items:{speed_train_3h:2,speed_research_3h:1}}
  ],
  blocked(s,id){const n=this.nodes.find(n=>n.id===id);if(!n)return null;if(!s.conquered.fort)return '先占领古渡县城，开启第二章';if(!s.conquered[n.requires])return '先占领'+this.nodes.find(row=>row.id===n.requires).name;return null;},
  progress(s){return {unlocked:!!s.conquered.fort,conquered:this.nodes.filter(n=>s.conquered[n.id]).length,claimed:this.nodes.filter(n=>s.missionClaims.includes('chapter2_'+n.id)).length,next:this.nodes.find(n=>!s.conquered[n.id])||null};},
  extendMissions(missions){this.nodes.forEach((n,i)=>{const r=this.rewards[i];missions.push({id:'chapter2_'+n.id,node:n.id,chapter:2,stage:this.title,title:n.name+' · 平定',desc:'占领'+n.name+'，掠夺胜利不算通关',route:'world',check:s=>!this.blocked(s,n.id)&&!!s.conquered[n.id],reward:{food:r.resources,wood:r.resources,stone:r.resources,iron:r.resources,gold:r.gold},jewels:r.jewels,items:r.items});});}
};
