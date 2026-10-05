'use strict';
// Every sprite retains the generated atlas's original pixels and alpha channel.
const HistoricalArt={
  troops:{cols:4,rows:3,ids:['worker','militia','scout','spear','shield','archer','cavalry','heavy','wagon','ballista','ram','catapult']},
  generals:{cols:3,rows:3,ids:['lin','su','yan']},
  buildings:{cols:5,rows:4,ids:['farm','lumber','quarry','mine','house','academy','inn','market','warehouse','drill','barracks','tavern','embassy','smith','workshop','stable','post','beacon','hall','wall']},
  icons:{cols:4,rows:4,ids:['food','wood','stone','iron','gold','gems','scroll','order','medicine','blueprint','bridle','letter','gift','grain','weapons','crate']},
  terrain:{cols:4,rows:3,ids:['forest','mountain','hill','lake','swamp','grass','plain','home','camp','fort','farm','pass']}
};
function artSprite(sheet,index,label,classes=''){
  const cfg=HistoricalArt[sheet],safe=String(label).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const col=index%cfg.cols,row=Math.floor(index/cfg.cols);
  return `<span class="asset-sprite art-${sheet} ${classes}" role="img" aria-label="${safe}" style="background-image:url('assets/realistic/${sheet}.png');background-size:${cfg.cols*100}% ${cfg.rows*100}%;background-position:${col/(cfg.cols-1)*100}% ${row/(cfg.rows-1)*100}%"></span>`;
}
function troopPortrait(id,classes=''){const i=HistoricalArt.troops.ids.indexOf(id);return i<0?'':artSprite('troops',i,Game.units[id].name,classes);}
function generalPortrait(g,classes=''){
  const fixed=HistoricalArt.generals.ids.indexOf(g.id);
  // Stable across reloads and recruitment; looking at a card never changes its face.
  const hash=Array.from(String(g.id)).reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,0);
  return artSprite('generals',fixed>=0?fixed:3+hash%6,g.name,classes);
}
function buildingIcon(id,classes=''){const i=HistoricalArt.buildings.ids.indexOf(id);return i<0?'':artSprite('buildings',i,Game.buildings[id].name,classes);}
function resourceIcon(id,classes='icon-mini'){const i=HistoricalArt.icons.ids.indexOf(id);return i<0?'':artSprite('icons',i,Game.resources[id]?.name||(id==='gems'?'元宝':id),classes);}
function terrainIcon(type){const i=HistoricalArt.terrain.ids.indexOf(type);return artSprite('terrain',i<0?6:i,Game.terrainTypes[type]?.name||'城池','terrain-image');}
function itemIcon(item,classes='item-art'){
  const byId={heal:'scroll',labor:'order',population:'order',peace:'letter',blueprint:'blueprint',politics:'scroll',valor:'weapons',wisdom:'scroll',tiger:'order',recruit:'letter',drum:'order',drum7:'order',formation:'blueprint',formation7:'blueprint',flag:'order',rename:'letter',banner:'order',fire:'medicine',treasure:'blueprint',tradeContract:'crate',refine:'medicine',resetHero:'medicine',life:'medicine',horseCharm:'bridle',horseNeedle:'bridle',pearl:'gems',protectPearl:'gems',drillGem:'gems',drillGemAdvanced:'gems',powder:'stone',rack:'weapons',rackAdvanced:'weapons',tactic:'letter'};
  const key=(item.effect==='gold'?'gold':byId[item.id])||({建造加速:'blueprint',研究加速:'scroll',练兵加速:'order',内政:'letter',军事:'order',将领:'scroll',宝物:'gift',装备:'weapons',社交:'letter'}[item.category])||'gift';
  return artSprite('icons',HistoricalArt.icons.ids.indexOf(key),item.name,classes);
}
