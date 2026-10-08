'use strict';
// A fixed, read-only art sample. No engine, account, saves or gameplay timers are loaded.
function previewAtlas(texture,region,size){
  const [x,y,w,h]=region;
  return `<svg class="web-atlas-art" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><image href="${texture}" width="${size[0]}" height="${size[1]}"/></svg></svg>`;
}
const previewResourceIds=['farm','lumber','quarry','mine'];
const previewNames={farm:'农田',lumber:'伐木场',quarry:'采石场',mine:'铁矿'};
const previewPlots=Array(36).fill(null);
[[0,'farm'],[5,'mine'],[7,'farm'],[10,'quarry'],[14,'lumber'],[16,'mine'],[19,'farm'],[21,'lumber'],[24,'quarry'],[28,'farm'],[30,'lumber'],[35,'mine']].forEach(([i,type])=>{previewPlots[i]=type;});
const previewStyle=new URLSearchParams(location.search).get('style')||'heritage';
const previewEntries=Object.entries(SceneStyles).filter(([id])=>!previewStyle||previewStyle===id);
if(previewStyle&&Object.hasOwn(SceneStyles,previewStyle))document.body.classList.add('single');
document.getElementById('choices').innerHTML=(previewEntries.length?previewEntries:Object.entries(SceneStyles)).map(([id,s])=>{
  const sites=previewPlots.map((type,i)=>{
    if(!type)return '';
    const p=id==='heritage'?sceneFieldPoint(i,6):scenePoint(i%6,Math.floor(i/6)),n=previewResourceIds.indexOf(type);
    const caption=[0,5,14,24].includes(i)?`<span class="scene-name-tag" style="left:${p.x/11}%;top:${(p.y+12)*100/648}%">${previewNames[type]}</span>`:'';
    const art=id==='heritage'?scenePaintedResourceArt(type):`<span class="web-resource-sprite" style="background-image:url('assets/realistic/buildings.png');background-size:500% 400%;background-position:${n/4*100}% 0"></span>`;
    return `<div class="scene-site built-field ${type}" style="${scenePosition(p,148,126,648)}"><span class="web-resource-art">${art}</span></div>${caption}`;
  }).join('');
  return `<article class="choice"><header><h2><b>${s.letter}</b>${s.name}</h2><p>${s.description}</p></header><div class="scene-board"><div class="scene-stage scene-fields preview-scene" data-field-style="${id}" style="--scene-height:648">${sceneFieldLandscape(6,id)}${id==='heritage'?sceneFieldRoads(previewPlots.map(type=>({type})),6,648):''}${sites}</div></div><footer>独立资源建筑 · 空地保持自然地面 · <a href="./?v=0.34.16">进入游戏</a> · 旧稿：<a href="?style=central">中原</a> / <a href="?style=river">江南</a> / <a href="?style=ink">水墨</a></footer></article>`;
}).join('');
const previewCityIds=['house','beacon','house','academy','inn','drill','house','warehouse','smith','tavern','embassy','barracks','house','house','hall','reserved','barracks','barracks','wall','house','reserved','reserved','house','warehouse','house','house','house','market','house','stable','house','house','house','post','house','house'];
document.getElementById('city-stage').innerHTML=sceneGroundSVG()+sceneCityBoundary(6)+previewCityIds.map((id,i)=>{
  if(['hall','reserved','wall'].includes(id))return '';
  const p=sceneCityPoint(i%6,Math.floor(i/6)),single=WebArt.city.sprites.find(x=>x.id===id),source=single?WebArt.city.sources.find(x=>x.texture===single.texture):WebArt.city;
  return `<div class="scene-site built-city" style="${scenePosition(p,118,106)}"><span class="scene-contact-shadow"></span><span class="city-building-art">${previewAtlas(source.texture,single?.region||WebArt.city.regions[id],source.size)}</span></div>`;
}).join('')+`<svg class="scene-ground scene-courtyard" viewBox="0 0 1100 660" aria-hidden="true"><polygon points="${sceneDiamond(550,355,328,172)}" fill="#c5bea5" stroke="#e9dec1" stroke-width="3"/></svg><div class="scene-site scene-hall built-city" style="${scenePosition({x:550,y:419},328,280)}"><span class="scene-contact-shadow"></span><span class="city-building-art">${previewAtlas(WebArt.city.tiers.hall[1].texture,WebArt.city.tiers.hall[1].region,[1536,1024])}</span></div><span class="scene-name-tag scene-city-caption scene-hall-caption" style="left:50%;top:${453/660*100}%">官府<em>6</em></span>${sceneCityBoundary(6,true)}<span class="scene-name-tag scene-city-caption" style="left:${sceneCityGate.x/11}%;top:${(sceneCityGate.y+18)/660*100}%;z-index:701">城墙<em>6</em></span>`;
if(previewStyle==='city'){
  document.body.classList.add('city-only');
  document.title='山河策 · 城坊围城预览';
  document.querySelector('body>header h1').textContent='城坊 · 围城与城门';
  document.querySelector('body>header p').textContent='完整城墙、城门与城内道路。固定满城样本，不读取账号或玩家存档。';
}
