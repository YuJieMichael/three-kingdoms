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
  chapterThreeTitle:'第三章 · 河洛攻城',
  chapterThreeNodes:[
    {id:'luo_outpost',name:'洛水前哨',terrain:'camp',x:43,y:9,level:8,chapter:3,requires:'north_keep',desc:'北境平定后南下河洛。孟衡率枪兵守住前哨；先在野外交锋，领取盟军试作冲车。',commander:{name:'孟衡',title:'前哨守将',attack:1.08,defense:1.06,order:'advance'},army:{shield:180,spear:220,archer:180,cavalry:70},loot:{food:4000,wood:4000,iron:2500,gold:6000},reward:'前哨肃清 · 盟军支援 5 辆试作冲车',time:60},
    {id:'luo_gate',name:'河洛东门',terrain:'mountain',x:46,y:12,level:8,chapter:3,requires:'luo_outpost',desc:'石峤坚守城门，步军依托门墙。冲车推进至门前可迅速破门；破门前守军不会出城。',commander:{name:'石峤',title:'东门守将',attack:1,defense:1.18,order:'hold'},fortification:{name:'包铁城门',hp:18000,protection:1.5,tower:700,range:1100},army:{shield:240,spear:220,archer:200,ballista:12},loot:{food:5000,wood:4000,stone:3500,gold:8000},reward:'攻破东门 · 盟军支援 2 辆投石车',time:66},
    {id:'luo_cavalry',name:'赤垒外营',terrain:'camp',x:49,y:15,level:9,chapter:3,requires:'luo_gate',desc:'韩骁带骑兵主动迎战，外围木栅虽弱但骑兵冲击凌厉。枪兵护住器械，避免弓兵先行接敌。',commander:{name:'韩骁',title:'突骑统领',attack:1.2,defense:1.03,order:'advance'},fortification:{name:'外营木栅',hp:10000,protection:1.2,tower:300,range:800},army:{cavalry:180,heavy:40,spear:170,archer:140},loot:{food:5500,wood:4500,iron:4000,gold:9000},reward:'击退突骑 · 战线补给',time:70},
    {id:'luo_wall',name:'白石城垣',terrain:'mountain',x:51,y:11,level:9,chapter:3,requires:'luo_cavalry',desc:'严岑以弓弩据守厚墙。投石车能在远处轰击城垣，冲车需要护卫靠近。破墙后箭楼停止射击。',commander:{name:'严岑',title:'弩阵都督',attack:1.12,defense:1.18,order:'hold'},fortification:{name:'白石重墙',hp:30000,protection:1.65,tower:1000,range:1400},army:{shield:280,spear:180,archer:260,ballista:30},loot:{food:6000,wood:5000,stone:5000,iron:4500,gold:12000},reward:'攻克城垣 · 河洛内城开放',time:76},
    {id:'luo_citadel',name:'河洛内城',terrain:'camp',x:54,y:8,level:10,chapter:3,requires:'luo_wall',desc:'邵靖收拢混编精锐据守内城。必须破坏城防并清空守军；只歼敌而未破城仍不能占领。',commander:{name:'邵靖',title:'河洛主将',attack:1.18,defense:1.25,order:'hold'},fortification:{name:'内城门墙',hp:42000,protection:1.7,tower:1200,range:1400},army:{shield:330,spear:250,archer:300,cavalry:130,heavy:40,ballista:35},loot:{food:8000,wood:6500,stone:6500,iron:6500,gold:18000},reward:'平定河洛 · 第三章完成',time:84}
  ],
  chapterThreeRewards:[
    {resources:45000,gold:160000,jewels:{pearl:12},items:{speed_train_3h:2},army:{ram:5}},
    {resources:50000,gold:180000,jewels:{coral:10},items:{speed_research_3h:2},army:{catapult:2}},
    {resources:55000,gold:200000,jewels:{glass:10},items:{speed_train_3h:2}},
    {resources:65000,gold:230000,jewels:{amber:10},items:{speed_build_3h:2}},
    {resources:80000,gold:300000,jewels:{jade:5,nightPearl:1},items:{speed_train_3h:3,speed_research_3h:2}}
  ],
  allNodes(){return [...this.nodes,...this.chapterThreeNodes];},
  chapterNodes(chapter=2){return chapter===3?this.chapterThreeNodes:this.nodes;},
  chapterTitle(chapter=2){return chapter===3?this.chapterThreeTitle:this.title;},
  completed(s,chapter=2){return this.chapterNodes(chapter).every(n=>!!s.conquered[n.id]);},
  unlocked(s,chapter=2){return !!s.conquered.fort&&(chapter!==3||this.completed(s,2));},
  blocked(s,id){const n=this.allNodes().find(n=>n.id===id);if(!n)return null;if(!s.conquered.fort)return '先占领古渡县城，开启第二章';if(n.chapter===3&&!this.unlocked(s,3))return '先完成第二章六关（含北境大营），开启第三章';if(!s.conquered[n.requires])return '先占领'+this.allNodes().find(row=>row.id===n.requires).name;return null;},
  progress(s,chapter=2){const nodes=this.chapterNodes(chapter);return {unlocked:this.unlocked(s,chapter),conquered:nodes.filter(n=>s.conquered[n.id]).length,claimed:nodes.filter(n=>s.missionClaims.includes('chapter'+chapter+'_'+n.id)).length,next:nodes.find(n=>!s.conquered[n.id])||null};},
  extendMissions(missions){[2,3].forEach(chapter=>this.chapterNodes(chapter).forEach((n,i)=>{const r=(chapter===3?this.chapterThreeRewards:this.rewards)[i];missions.push({id:'chapter'+chapter+'_'+n.id,node:n.id,chapter,stage:this.chapterTitle(chapter),title:n.name+' · 平定',desc:'占领'+n.name+'，掠夺胜利不算通关',route:'world',check:s=>!this.blocked(s,n.id)&&!!s.conquered[n.id],reward:{food:r.resources,wood:r.resources,stone:r.resources,iron:r.resources,gold:r.gold},jewels:r.jewels,items:r.items,army:r.army});}));}
};
// v0.34.34: late battles were too easy in the 4-day playtest, so garrisons are raised by a fixed factor (not tied to player strength). Higher factors starve the unaccelerated campaign of food (design/balance/late-battle-difficulty-2026-10-08.md).
ChapterData.armyScale={2:1.3,3:1.5};
for(const n of ChapterData.allNodes())for(const id of Object.keys(n.army))n.army[id]=Math.round(n.army[id]*ChapterData.armyScale[n.chapter]);
