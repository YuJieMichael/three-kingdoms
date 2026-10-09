'use strict';
// Administrative hierarchy and all armies/bonuses are this game's PVE parameters.
// Existing chapter sites remain chapter sites; these cities do not enter that sequence.
const NamedCityData=(()=>{
  const tiers=Object.freeze({county:{name:'县城',plotMax:12,goldFactor:1.1,hall:3,population:500,plots:6,reward:5000,jewels:{jadeite:2}},prefecture:{name:'郡城',plotMax:15,goldFactor:1.2,hall:5,population:1000,plots:9,reward:10000,jewels:{jadeite:3,jade:1}},province:{name:'州城',plotMax:18,goldFactor:1.3,hall:7,population:1500,plots:12,reward:20000,jewels:{jade:3,nightPearl:1}},capital:{name:'都城',plotMax:18,goldFactor:1.4,hall:8,population:2000,plots:12,reward:30000,jewels:{jade:4,nightPearl:2}}});
  const definitions=[
    {id:'fort',name:'古渡县城',tier:'county',district:'北原郡 · 古渡县',parent:'named_beiyuan',strategy:'granary',children:[]},
    {id:'yellow_qingshi',name:'青石黄巾城',tier:'county',district:'中原外围 · 青石县',parent:null,strategy:'granary',children:[]},
    {id:'yellow_baisha',name:'白沙黄巾城',tier:'county',district:'中原外围 · 白沙县',parent:null,strategy:'mine',children:[]},
    {id:'yellow_chigang',name:'赤岗黄巾城',tier:'county',district:'中原外围 · 赤岗县',parent:null,strategy:'pass',children:[]},
    {id:'named_hanchuan',name:'寒川县城',tier:'county',district:'北原郡 · 寒川县',parent:'named_beiyuan',strategy:'mine',children:[],discover:'fort'},
    {id:'named_luoshui',name:'洛水县城',tier:'county',district:'河洛郡 · 洛水县',parent:'named_heluo',strategy:'granary',children:[],discoverChapter:2},
    {id:'named_baishi',name:'白石县城',tier:'county',district:'河洛郡 · 白石县',parent:'named_heluo',strategy:'pass',children:[],discoverChapter:2},
    {id:'named_beiyuan',name:'北原郡城',tier:'prefecture',district:'中原州 · 北原郡',parent:'named_zhongyuan',strategy:'granary',children:['fort','named_hanchuan']},
    {id:'named_heluo',name:'河洛郡城',tier:'prefecture',district:'中原州 · 河洛郡',parent:'named_zhongyuan',strategy:'mine',children:['named_luoshui','named_baishi']},
    {id:'named_zhongyuan',name:'中原州城',tier:'province',district:'中原州',parent:'named_luoyang',strategy:'balanced',children:['named_beiyuan','named_heluo']},
    {id:'named_luoyang',name:'洛阳都城',tier:'capital',district:'京畿 · 洛阳',parent:null,strategy:'balanced',children:['named_zhongyuan'],requiresChapter:3},
    // Garrisoned by famous generals (named-garrison.js); found once chapter 2 is complete.
    {id:'named_xiaopei',name:'小沛',tier:'county',district:'徐州 · 沛国 · 小沛',parent:null,strategy:'pass',children:[],discoverChapter:2,garrison:true},
    {id:'named_wancheng',name:'宛城',tier:'county',district:'荆州 · 南阳郡 · 宛县',parent:null,strategy:'mine',children:[],discoverChapter:2,garrison:true},
    {id:'named_xiapi',name:'下邳',tier:'prefecture',district:'徐州 · 下邳国',parent:null,strategy:'granary',children:[],discoverChapter:2,garrison:true},
    {id:'named_beihai',name:'北海',tier:'prefecture',district:'青州 · 北海国',parent:null,strategy:'balanced',children:[],discoverChapter:2,garrison:true}
  ].map(d=>Object.freeze({...d,tierName:tiers[d.tier].name,plotMax:tiers[d.tier].plotMax,goldFactor:tiers[d.tier].goldFactor,children:Object.freeze(d.children),development:Object.freeze({hall:tiers[d.tier].hall,morale:70,population:tiers[d.tier].population,plots:tiers[d.tier].plots,reward:Object.freeze({food:tiers[d.tier].reward,wood:tiers[d.tier].reward,stone:tiers[d.tier].reward,iron:tiers[d.tier].reward,gold:tiers[d.tier].reward/2}),jewels:Object.freeze({...tiers[d.tier].jewels})})}));
  const byId=new Map(definitions.map(d=>[d.id,d]));
  function nodeId(value){if(typeof value==='string')return value.replace(/^city_/,'');if(!value||typeof value!=='object'||value.capital===true)return '';return typeof value.node==='string'?value.node:typeof value.id==='string'?value.id.replace(/^city_/,''):'';}
  function definition(value){return byId.get(nodeId(value))||null;}
  const node=(id,x,y,level,population,army,loot,time,fortification)=>{const d=byId.get(id);return Object.freeze({id,name:d.name,namedCity:true,openCity:true,terrain:'fort',faction:'local_warlord',x,y,level,population,army:Object.freeze(army),loot:Object.freeze(loot),time,...(fortification?{fortification:Object.freeze(fortification)}:{}),desc:d.district+'的'+d.tierName+'。占领须连续攻城降低民心至零以下；先控制指定辖区，再建立独立城市与补给线。',reward:'本城资源田最高 '+d.plotMax+' 级 · 黄金税收 +'+Math.round((d.goldFactor-1)*100)+'%'});};
  const garrisoned=(n,general)=>Object.freeze({...n,desc:byId.get(n.id).district+'的'+byId.get(n.id).tierName+'，由'+general+'镇守。'+general+'忠诚 30 以上时攻城胜利只能围困、不能占领；攻城、断粮道、劝降与离间把忠诚压到 30 以下，再赢一次即可占城并俘获'+general+'。'+(byId.get(n.id).tier==='prefecture'?'郡城须先占领三分之一的名城。':'')});
  const nodes=Object.freeze([
    node('named_hanchuan',28,20,5,500,{shield:100,spear:100,archer:110,cavalry:30},{food:2200,wood:1800,stone:1800,iron:1800,gold:1500},38),
    node('named_luoshui',46,22,6,600,{shield:130,spear:140,archer:150,cavalry:45},{food:3200,wood:2300,stone:2300,iron:2300,gold:2000},44),
    node('named_baishi',51,20,6,600,{shield:150,spear:160,archer:140,cavalry:40,ballista:8},{food:2700,wood:2700,stone:3500,iron:2700,gold:2200},48),
    node('named_beiyuan',29,10,8,1000,{shield:260,spear:260,archer:300,cavalry:70,ballista:18},{food:6000,wood:4500,stone:4500,iron:4500,gold:4000},58,{name:'北原郡城门',hp:24000,protection:1.4,tower:500,range:1100}),
    node('named_heluo',49,26,8,1000,{shield:280,spear:250,archer:320,cavalry:80,ballista:22},{food:5000,wood:6000,stone:6000,iron:6000,gold:4500},62,{name:'河洛郡城门',hp:28000,protection:1.45,tower:600,range:1200}),
    node('named_zhongyuan',39,16,9,1500,{shield:420,spear:380,archer:450,cavalry:130,heavy:40,ballista:35},{food:9000,wood:9000,stone:9000,iron:9000,gold:7000},74,{name:'中原州重墙',hp:42000,protection:1.6,tower:900,range:1300}),
    node('named_luoyang',58,18,10,2000,{shield:600,spear:500,archer:650,cavalry:200,heavy:70,ballista:50,catapult:12},{food:14000,wood:14000,stone:14000,iron:14000,gold:10000},90,{name:'洛阳都城门墙',hp:60000,protection:1.75,tower:1200,range:1400}),
    // Famous-general garrisons: armies near the original game's scale; walls need rams and catapults.
    garrisoned(node('named_xiaopei',42,45,8,1500,{shield:3000,spear:4500,archer:3500,cavalry:1500},{food:20000,wood:16000,stone:16000,iron:16000,gold:12000},60,{name:'小沛城门',hp:120000,protection:1.6,tower:2000,range:1300,engineWall:true}),'张飞'),
    garrisoned(node('named_wancheng',20,46,8,1500,{shield:4500,spear:3000,archer:3000,cavalry:1000,ballista:60},{food:16000,wood:16000,stone:22000,iron:20000,gold:12000},62,{name:'宛城城门',hp:140000,protection:1.7,tower:1800,range:1300,engineWall:true}),'典韦'),
    garrisoned(node('named_xiapi',50,50,10,3000,{shield:7000,spear:7000,archer:8000,cavalry:6000,heavy:1500,ballista:150,catapult:40},{food:40000,wood:32000,stone:32000,iron:32000,gold:30000},80,{name:'下邳城门墙',hp:300000,protection:1.9,tower:3600,range:1400,engineWall:true}),'吕布'),
    garrisoned(node('named_beihai',57,37,9,2500,{shield:6000,spear:6000,archer:9000,cavalry:3000,ballista:200},{food:32000,wood:28000,stone:28000,iron:28000,gold:24000},76,{name:'北海城门墙',hp:250000,protection:1.8,tower:4000,range:1500,engineWall:true}),'太史慈')
  ]);
  return Object.freeze({tiers,definitions:Object.freeze(definitions),nodes,nodeId,definition});
})();
