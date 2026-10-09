'use strict';
// Independent PVE cities. Guard counts, loot and baseline march times are trial values.
// City morale, militia, defense, carry limits and ownership use the ordinary city rules.
const YellowCityData={
  nodes:[
    {id:'yellow_qingshi',name:'青石黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:26,y:31,level:2,population:200,desc:'黄巾占据青石小城，枪盾护卫弓兵。先侦察、备好前排与运输队；占领战胜利可缴获资源和黄金，连续三胜使民心降至零以下后易主。',army:{shield:12,spear:20,archer:18},loot:{food:800,wood:800,stone:800,iron:800,gold:1500},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:18},
    {id:'yellow_baisha',name:'白沙黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:41,y:38,level:3,population:300,desc:'白沙城守军步弓混编，少量骑兵巡守外围。携带长枪兵保护弓阵，再配运输队带回战利品；占领战每胜降低 35 民心，降至零以下后易主。',army:{shield:25,spear:32,archer:28,cavalry:8},loot:{food:1500,wood:1500,stone:1500,iron:1500,gold:3000},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:26},
    {id:'yellow_chigang',name:'赤岗黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:21,y:20,level:4,population:400,desc:'赤岗城的枪盾与弓兵阵列较厚，城防会消耗进攻兵力。整备混编部队与运输队后再攻城；占领战每胜降低 35 民心，降至零以下后易主。',army:{shield:42,spear:40,archer:42,cavalry:12},loot:{food:2500,wood:2500,stone:2500,iron:2500,gold:5000},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:34},
    {id:'yellow_liulin',name:'柳林黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:37,y:40,level:2,population:200,desc:'柳林小城守备松散，适合初次攻城练手。占领战胜利可缴获资源与黄金；黄金每小时刷新一次。',army:{shield:14,spear:18,archer:20},loot:{food:900,wood:900,stone:900,iron:900,gold:1500},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:20},
    {id:'yellow_heishan',name:'黑山黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:24,y:40,level:3,population:300,desc:'黑山城依山设寨，弓兵居高。携带盾兵与长枪掩护弓阵；黄金每小时刷新一次。',army:{shield:28,spear:30,archer:32,cavalry:6},loot:{food:1600,wood:1600,stone:1600,iron:1600,gold:3000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:28},
    {id:'yellow_yuntai',name:'云台黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:44,y:24,level:5,population:500,desc:'云台城为黄巾渠帅驻地，枪盾厚重、骑兵游走。需完整混编与充足运输队；黄金每小时刷新一次。',army:{shield:60,spear:58,archer:56,cavalry:20},loot:{food:3500,wood:3500,stone:3500,iron:3500,gold:8000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:40},
    {id:'yellow_tieling',name:'铁岭黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:48,y:42,level:5,population:500,desc:'铁岭城囤积兵甲，器械守城。准备攻城器械与前排；黄金每小时刷新一次。',army:{shield:66,spear:52,archer:60,cavalry:16},loot:{food:3200,wood:3200,stone:3600,iron:4000,gold:8000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:44},
    {id:'yellow_huangsha',name:'黄沙黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:14,y:28,level:6,population:600,desc:'黄沙城是黄巾大营，守军最多、城防最坚。需要高级将领与大批混编部队；黄金每小时刷新一次。',army:{shield:90,spear:84,archer:86,cavalry:30},loot:{food:5000,wood:5000,stone:5000,iron:5000,gold:12000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:52}
  ],
  allNodes(){return [...this.nodes,...(typeof NamedCityData==='undefined'?[]:NamedCityData.nodes)];},
  createSites(legacy,namedSites=[],existing={}){
    const occupied=new Set(['32,32']),inBounds=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<64&&y<64;
    for(const site of namedSites)if(inBounds(site?.x,site?.y))occupied.add(site.x+','+site.y);
    // Preserve saved sites when appending cities to old worlds. New sites must
    // also avoid player-built cities and any already reserved open-city cells.
    for(const site of Object.values(existing||{}))if(inBounds(site?.x,site?.y))occupied.add(site.x+','+site.y);
    for(const city of Object.values(legacy?.realm?.cities||{}))if(inBounds(city?.x,city?.y))occupied.add(city.x+','+city.y);
    // Read whole JSON string tokens, including object keys, so a report sentence
    // mentioning a coordinate cannot accidentally reserve unrelated map cells.
    const serialized=JSON.stringify(legacy||{})||'';
    for(const token of serialized.matchAll(/"(?:\\.|[^"\\])*"/g)){
      const match=/^wild_(\d{1,2})_(\d{1,2})$/.exec(JSON.parse(token[0]));
      if(match){const x=Number(match[1]),y=Number(match[2]);if(inBounds(x,y))occupied.add(x+','+y);}
    }
    const sites={...existing};
    for(const node of this.allNodes()){
      if(Object.hasOwn(sites,node.id))continue;
      let nearest=null,distance=Infinity;
      // Iterating y then x gives deterministic tie breaking without sorting.
      for(let y=0;y<64;y++)for(let x=0;x<64;x++){
        if(occupied.has(x+','+y))continue;
        const squared=(x-node.x)**2+(y-node.y)**2;
        if(squared<distance){nearest={x,y};distance=squared;}
      }
      if(!nearest)return null;
      sites[node.id]=nearest;occupied.add(nearest.x+','+nearest.y);
    }
    return sites;
  }
};
// v0.34.34: yellow-turban garrisons were 50–290 men; raised five-fold so taking a city needs a real army.
YellowCityData.armyScale=5;
for(const n of YellowCityData.nodes)for(const id of Object.keys(n.army))n.army[id]=Math.round(n.army[id]*YellowCityData.armyScale);
