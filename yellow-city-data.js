'use strict';
// Independent PVE cities. Guard counts, loot and baseline march times are trial values.
// City morale, militia, defense, carry limits and ownership use the ordinary city rules.
const YellowCityData={
  nodes:[
    {id:'yellow_qingshi',name:'青石黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:26,y:31,level:2,population:200,desc:'黄巾占据青石小城，枪盾护卫弓兵。先侦察、备好前排与运输队；占领战胜利可缴获资源和黄金，连续三胜使民心降至零以下后易主。',army:{shield:12,spear:20,archer:18},loot:{food:800,wood:800,stone:800,iron:800,gold:500},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:18},
    {id:'yellow_baisha',name:'白沙黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:41,y:38,level:3,population:300,desc:'白沙城守军步弓混编，少量骑兵巡守外围。携带长枪兵保护弓阵，再配运输队带回战利品；占领战每胜降低 35 民心，降至零以下后易主。',army:{shield:25,spear:32,archer:28,cavalry:8},loot:{food:1500,wood:1500,stone:1500,iron:1500,gold:1200},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:26},
    {id:'yellow_chigang',name:'赤岗黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:21,y:20,level:4,population:400,desc:'赤岗城的枪盾与弓兵阵列较厚，城防会消耗进攻兵力。整备混编部队与运输队后再攻城；占领战每胜降低 35 民心，降至零以下后易主。',army:{shield:42,spear:40,archer:42,cavalry:12},loot:{food:2500,wood:2500,stone:2500,iron:2500,gold:2500},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:34}
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
