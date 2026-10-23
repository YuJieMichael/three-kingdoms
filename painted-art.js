'use strict';
// Hand-painted building and map art (design/art/building-prompts-style1.md). AVIF files under assets/painted/.
const PaintedArt={
  version:'1',
  buildings:['hall','house','academy','inn','market','warehouse','drill','barracks','tavern','embassy','smith','workshop','stable','post','beacon','wall','farm','lumber','quarry','mine'],
  // AVIF everywhere it decodes; browsers without AVIF (iOS 15 and older) switch once to the PNG copies beside each file
  format:'avif',
  probe:'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAE1pUHJhdmlmbWlhZm1pZjEAAAFebWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAAOcGl0bQAAAAAAAQAAADhpaW5mAAAAAAACAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAFWluZmUCAAABAAIAAEV4aWYAAAAAGmlyZWYAAAAAAAAADmNkc2MAAgABAAEAAACBaXBycAAAAGBpcGNvAAAAE2NvbHJuY2x4AAIAAgAGgAAAAAxjbGxpAMsAQAAAABRpc3BlAAAAAAAAAAIAAAACAAAACWlyb3QAAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABlpcG1hAAAAAAAAAAEAAQaBAgMFhoQAAAAsaWxvYwAAAABEAAACAAEAAAABAAAB3AAAACUAAgAAAAEAAAGOAAAATgAAAAFtZGF0AAAAAAAAAIMAAAAGRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAqADAAQAAAABAAAAAgAAAAASAAoMAAAAAAZ//AgQEDQgMhMQAZIACCCCIAC2Gz4MVF27KT4w',
  // Original sandbox sprites keep their alpha in WebP. The town set retains its AVIF/PNG fallback.
  sandbox:{version:'1',map:{
    'mountain-a':{file:'mountain.webp',aspect:463/510},'mountain-b':{file:'mountain.webp',aspect:463/510},
    'forest-a':{file:'forest.webp',aspect:405/500},'forest-b':{file:'forest.webp',aspect:405/500},
    pass:{file:'pass.webp',aspect:424/512},county:{file:'county.webp',aspect:371/509},
    commandery:{file:'commandery.webp',aspect:417/512},capital:{file:'capital.webp',aspect:445/512}
  }},
  src(kind,id){const file=kind==='map'&&this.sandbox.map[id]?.file;return file?`assets/sandbox/${file}?v=${this.sandbox.version}`:`assets/painted/${kind}/${id}.${this.format}?v=${this.version}`;},
  detect(onFallback){if(typeof Image==='undefined')return;const img=new Image();const fail=()=>{if(this.format==='png')return;this.format='png';onFallback?.();};img.onload=()=>{if(!(img.width>0))fail();};img.onerror=fail;img.src=this.probe;},
  // height/width of each trimmed map sprite, so they keep their proportions on the world map
  map:{'mountain-a':1.113,'mountain-b':.823,hill:.922,'forest-a':.893,'forest-b':.815,pine:.924,reeds:.815,county:.794,commandery:.786,'yellow-camp':.828},
  mapImage(id,x,y,width,extra=''){const h=width*(this.sandbox.map[id]?.aspect||this.map[id]||1);return `<image href="${this.src('map',id)}" x="${(x-width/2).toFixed(1)}" y="${(y-h).toFixed(1)}" width="${width.toFixed(1)}" height="${h.toFixed(1)}" preserveAspectRatio="xMidYMax meet" ${extra}/>`;},
  has(id){return this.buildings.includes(id);},
  img(id,classes=''){const name=Game.buildings[id]?.name||'';return `<img class="painted-building ${classes}" src="${this.src('buildings',id)}" alt="${name}" decoding="async" draggable="false">`;}
};
const paintedOriginalCityArt=webCityBuildingArt;
webCityBuildingArt=function(id,level){return PaintedArt.has(id)?PaintedArt.img(id):paintedOriginalCityArt(id,level);};
const paintedOriginalResourceArt=sceneResourceArt;
sceneResourceArt=function(type,style){return PaintedArt.has(type)?PaintedArt.img(type,'web-resource-sprite painted-resource'):paintedOriginalResourceArt(type,style);};
const paintedOriginalIcon=buildingIcon;
buildingIcon=function(id,classes=''){return PaintedArt.has(id)?PaintedArt.img(id,classes):paintedOriginalIcon(id,classes);};
PaintedArt.detect(()=>{if(typeof render==='function')render();});
