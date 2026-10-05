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

// Deterministic SVG terrain uses the existing map types and never consumes game RNG.
function landscapeSeed(x,y){return (Math.imul(x+97,73856093)^Math.imul(y+131,19349663))>>>0;}
function landscapeTree(x,y,size=1){return `<g transform="translate(${x} ${y}) scale(${size})"><ellipse cx="0" cy="11" rx="10" ry="4" fill="#16291c" opacity=".35"/><path d="M-2 1L-1 13 2 13 3 0" fill="#64543d"/><path d="M0-18L-12 0-7-1-15 9 14 9 8-1 12 0Z" fill="#283e2a"/><path d="M0-18L0 9 14 9 8-1 12 0Z" fill="#42553a"/><path d="M0-11L-7 1M0-2L-9 7" stroke="#71805b" stroke-width="1.2" opacity=".65"/></g>`;}
function landscapeRoof(x,y,scale=1){return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-18 4L1-6 21 4 1 15Z" fill="#344036"/><path d="M-14 5v16L2 30 17 21V6" fill="#a19672"/><path d="M2 12v18L17 21V6" fill="#6d725a"/><path d="M-24 4L0-14 25 4 2 18Z" fill="#454d42" stroke="#c0ae7d" stroke-width="1.2"/><path d="M0-14L2 18 25 4" fill="#66705a"/><path d="M-16 5L0-6 17 5M-9 10L1 3 12 9" stroke="#879075" stroke-width="1"/><path d="M-6 13v12h7V16" fill="#393d2f"/></g>`;}
function worldRoadArt(t){
  const stops=['field','home','wood','camp','mine','pass','home','fort',...Game.nodes.filter(n=>n.chapter).map(n=>n.id)],lines=[];
  for(let i=1;i<stops.length;i++){
    const a=stops[i-1]==='home'?Game.home:Game.landmarks[stops[i-1]],b=stops[i]==='home'?Game.home:Game.landmarks[stops[i]];
    if(!a||!b||Math.max(a.x,b.x)+1<t.x||Math.min(a.x,b.x)>t.x+1||Math.max(a.y,b.y)+1<t.y||Math.min(a.y,b.y)>t.y+1)continue;
    lines.push(`<path d="M${(a.x+.5-t.x)*100} ${(a.y+.5-t.y)*100}L${(b.x+.5-t.x)*100} ${(b.y+.5-t.y)*100}" fill="none" stroke="#c0ad7d" stroke-width="7" opacity=".64"/><path d="M${(a.x+.5-t.x)*100} ${(a.y+.5-t.y)*100}L${(b.x+.5-t.x)*100} ${(b.y+.5-t.y)*100}" fill="none" stroke="#70674d" stroke-width="1.2" stroke-dasharray="4 4" opacity=".8"/>`);
  }
  return lines.join('');
}
function terrainScene(t){
  const seed=landscapeSeed(t.x,t.y),type=t.type,colors={plain:'#6d7853',grass:'#778354',forest:'#4a5e3f',mountain:'#686f5f',hill:'#8d8260',lake:'#496f70',swamp:'#596b51',home:'#85815a',camp:'#7b7950',fort:'#78765a'},ground=colors[type]||'#73815a';
  let detail='<path d="M-10 28Q35 8 108 31M-8 71Q48 50 110 69" fill="none" stroke="#bdba91" stroke-width="1" opacity=".22"/>';
  if(type==='forest')for(let i=0;i<7;i++)detail+=landscapeTree(10+(seed+i*31)%79,28+(seed+i*23)%57,.65+(i%3)*.12);
  else if(type==='mountain')detail+='<path d="M-8 83L32 9 62 59 83 18 114 86Z" fill="#3f5148"/><path d="M32 9L31 72 62 59Z" fill="#838a75"/><path d="M32 9L22 29 33 25 44 32Z" fill="#c1bfa1"/><path d="M83 18L70 48 93 43Z" fill="#a5a98d"/><path d="M31 72L51 51 62 59 85 90" fill="none" stroke="#2b3c35" stroke-width="2"/><path d="M5 91L38 83 73 93 107 84" fill="none" stroke="#929779" stroke-width="3"/>';
  else if(type==='hill')detail+='<path d="M-8 62Q24 12 66 58Q86 27 110 52V102H-8Z" fill="#a2966f"/><path d="M-8 75Q34 45 72 73Q95 55 111 67" fill="none" stroke="#d0bc89" stroke-width="4" opacity=".6"/><path d="M7 92L24 84 42 94 67 82" fill="none" stroke="#6d7353" stroke-width="2"/>';
  else if(type==='lake')detail='<path d="M0 0H100V100H0Z" fill="#416569"/><path d="M-10 18Q18 8 46 18T112 18M-10 44Q18 34 46 44T112 44M-10 70Q18 60 46 70T112 70M-10 94Q18 84 46 94T112 94" fill="none" stroke="#8ca8a0" stroke-width="2" opacity=".6"/>';
  else if(type==='swamp')detail+='<path d="M-5 61Q24 30 55 52T108 60L100 93Q50 73 0 96Z" fill="#3b5c52"/><path d="M10 76Q27 64 43 73T82 75" fill="none" stroke="#9aac87" stroke-width="2"/><path d="M20 72V37M18 48L10 41M21 55L29 45M69 79V36M68 49L61 41M70 60L81 45" stroke="#b1ae77" stroke-width="2"/>';
  else if(type==='grass'||type==='plain')detail+='<path d="M5 77L20 65M19 87L34 75M52 50L65 39M72 81L86 69" stroke="#c2ba7e" stroke-width="2" opacity=".55"/><path d="M7 48L29 39M66 19L89 11M44 96L65 86" stroke="#4e633f" stroke-width="2" opacity=".7"/>';
  const road=worldRoadArt(t);
  if(t.id==='home')detail=landscapeRoof(48,43,1.55)+'<path d="M8 60L47 83 93 58V83L48 105 8 83Z" fill="#706b50" stroke="#b8ab7d" stroke-width="2"/>'+landscapeRoof(49,28,.8);
  else if(!t.wild&&t.id!=='home'){
    const pass=t.id.includes('pass')||t.terrain==='mountain',fort=t.terrain==='fort';
    detail=(pass?'<path d="M-7 96L18 10 45 60 70 17 107 94Z" fill="#49584a"/>':'')+(fort||pass?'<path d="M15 49L48 30 86 49V77L49 98 15 78Z" fill="#8d9279"/><path d="M15 49L49 68 86 49M49 68V98" fill="none" stroke="#c7c2a0" stroke-width="2"/><path d="M15 41V54M27 35V48M39 28V41M62 33V46M75 40V53M86 47V59" stroke="#aeb195" stroke-width="7"/><path d="M39 90V74Q48 58 58 75V92" fill="#2a342c"/>':landscapeRoof(47,50,1.3))+landscapeRoof(49,25,.75)+'<path d="M73 27V3L89 10 73 16" fill="#a66f44" stroke="#d2ba84" stroke-width="1.3"/>';
  }
  return `<svg class="terrain-scene" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="100" fill="${ground}"/><path d="M0 0H100V100Z" fill="#d4c894" opacity=".08"/>${road}${detail}<path d="M0 99H100M99 0V100" stroke="#18251b" opacity=".2"/></svg>`;
}
