'use strict';
let webMapTactical=false;
let worldView={...Game.home},mapDrag=null,suppressMapClick=false;
function cityBuildingArt(id){
  if(HistoricalArt.buildings.ids.includes(id))return buildingIcon(id);
  const ground='<path d="M5 43L45 20 87 43 47 67Z" fill="#959b7c"/><path d="M5 43v4l42 24 40-24v-4L47 67Z" fill="#687c61"/>';
  const art={
    hall:roof(45,30,.78)+roof(45,18,.6,'#465e47'),
    house:roof(45,33,.64,'#4d6650'),
    barracks:roof(45,34,.7,'#696d49')+'<path d="M22 22V7m45 31V15" stroke="#bdb08c" stroke-width="2"/><path d="M22 7l14 4-14 5m45-1l14 4-14 5" fill="#bc8b5e"/>',
    wall:'<path d="M14 33l32-18 30 17v27L45 72 14 55Z" fill="#9ea68e"/><path d="M14 33l31 18 31-19M45 51v20" fill="none" stroke="#687c69" stroke-width="2"/><path d="M14 25v9m9-5v9m9-5v9m9-5v9m12-5v9m9-15v9m9-15v9" stroke="#c3c5a6" stroke-width="6"/><path d="M34 65V52q5-9 10-1v20" fill="#3b5847"/>',
    empty:'<path d="M15 43l28 16m-4-29l27 16" stroke="#b8bb94" stroke-width="7"/><path d="M15 43l28 16m-4-29l27 16" stroke="#77896e" stroke-dasharray="2 4" stroke-width="1"/><path d="M55 55l3-9m7 5l-2-5" stroke="#bec590" stroke-width="2"/>'
  };
  return `<svg viewBox="0 0 92 77" aria-hidden="true">${ground}${art[id||'empty']||classicBuildingDetails(id)}</svg>`;
}
function cityScene(){return manualCityScene();}
function citySlotModal(index){manualCitySlotModal(index);}
const worldSpan=()=>window.matchMedia('(max-width:760px)').matches?6:9;
window.matchMedia('(max-width:760px)').addEventListener?.('change',()=>{if(document.querySelector('.screen-world'))render();});
const worldBounds=()=>{const span=worldSpan(),half=Math.floor(span/2);return {x:Math.max(0,Math.min(Game.WORLD_SIZE-span,worldView.x-half)),y:Math.max(0,Math.min(Game.WORLD_SIZE-span,worldView.y-half))};};
function terrainArt(type,tile){
  return tile?terrainScene(tile):terrainIcon(type);
}
function legacyTerrainArt(type){
  const arts={
    forest:'<path d="M19 5L7 24h6L4 37h30L25 24h6Z" fill="#234d35"/><path d="M36 16L27 31h5l-7 10h22l-7-10h5Z" fill="#386448"/>',
    mountain:'<path d="M5 37L20 10l13 19 7-12 14 23Z" fill="#5b7168"/><path d="M20 10l-5 9 6-2 6 5Z" fill="#c8cbb2"/>',
    hill:'<path d="M1 38q15-30 33 0m-7 0q12-22 27 1" fill="#728463"/><path d="M4 40h49" stroke="#c2c099" stroke-width="2"/>',
    lake:'<path d="M3 24q11-8 23 0t27 0M4 32q11-8 23 0t25 0M8 40q9-5 19 0t20 0" fill="none" stroke="#c2d3b8" stroke-width="2"/>',
    swamp:'<path d="M3 35q10-5 21 0t28 0" fill="none" stroke="#aabfa5" stroke-width="2"/><path d="M14 30v-12m0 6l-5-5m5 7l6-5m20 11V14m0 10l-6-5m6 9l6-5" stroke="#3d6246" stroke-width="2"/>',
    grass:'<path d="M11 34l-2-11m2 7l6-7m10 15l-1-16m1 10l5-5m11 7l-2-12m2 8l5-6" stroke="#4a7042" stroke-width="3"/>',
    plain:'<path d="M7 35h9m5-8h10m6 10h12m-21 6h8" stroke="#c0c79d" stroke-width="2"/>',
    home:'<path d="M7 27L28 9l21 18H7Z" fill="#dbc18a"/><path d="M12 28h32v19H12Z" fill="#9b956d"/><path d="M23 47V34h10v13" fill="#405c45"/>',
    camp:'<path d="M5 44l23-28 23 28H5Z" fill="#bfa27a"/><path d="M28 20v24m0-28V4m0 0l16 5-16 4" stroke="#574f39" stroke-width="2"/><path d="M21 44l7-13 7 13Z" fill="#5c654a"/>',
    fort:'<path d="M7 19v28h42V19h-7v7h-7v-7h-7v7h-7v-7h-7" fill="#b5b58c"/><path d="M23 47V35q5-8 10 0v12" fill="#4a6148"/>'
  };
  return `<svg viewBox="0 0 56 56" aria-hidden="true">${arts[type]||arts.plain}</svg>`;
}
function worldLandscapeSeed(x,y){return (Math.imul(x+97,73856093)^Math.imul(y+131,19349663))>>>0;}
function worldLandscapeTree(x,y,size){
  return `<g transform="translate(${x} ${y}) scale(${size})"><ellipse cx="0" cy="10" rx="10" ry="4" fill="#26372a" opacity=".3"/><path d="M-1 0V12" stroke="#766448" stroke-width="3"/><path d="M0-17L-11 0-6-1-13 8H13L7-1 11 0Z" fill="#344f3b"/><path d="M0-17V8H13L7-1 11 0Z" fill="#587154"/><path d="M-5-2L0-9 6-1" fill="none" stroke="#a1af7d" opacity=".35"/></g>`;
}
function worldCityFlagArt(t,owned){
  const x=t.x*100,y=t.y*100,home=t.id==='home',color=owned?'#63a6a0':t.faction==='yellow_turban'?'#d6b74f':'#a56959',letter=owned?'青':t.namedCity?NamedCityData.definition(t)?.tierName[0]||'城':t.faction==='yellow_turban'?'黄':'城';
  return `<g class="world-city-art ${owned?'city-allied':t.openCity?'city-yellow':'city-enemy'}" transform="translate(${x} ${y})"><ellipse cx="49" cy="77" rx="37" ry="14" fill="#28362b" opacity=".4"/><path d="M15 45L48 28 84 46V74L49 91 15 74Z" fill="#a5a089" stroke="#575f51" stroke-width="2"/><path d="M15 45L49 63 84 46M49 63V90" fill="none" stroke="#d3c7a4" stroke-width="2"/><path d="M15 40V52M27 33V46M39 27V39M62 31V44M74 38V51M84 43V55" stroke="#beb7a0" stroke-width="7"/><path d="M38 86V68Q47 55 57 69V87" fill="#39423b"/><path d="M32 39L49 24 66 39 49 48Z" fill="${home?'#476457':'#596055'}" stroke="#d5c293" stroke-width="1.5"/><path d="M36 40V52L49 60 62 52V41" fill="#c2b69a"/><path d="M31 39L49 21 68 39 49 49Z" fill="#566557"/><path d="M72 8V43" stroke="#dacb9b" stroke-width="2"/><path d="M73 9Q84 5 94 12L92 30Q83 23 73 27Z" fill="${color}" stroke="#ddcca3" stroke-width="1"/><text x="83" y="21" fill="#f5e6bd" font-size="10" font-weight="700" text-anchor="middle">${letter}</text></g>`;
}
function worldLandscapeSVG(start,span,read){
  const originX=start.x*100,originY=start.y*100,size=span*100,terrainColors={forest:'#53694c',mountain:'#7a8170',hill:'#aea07d',lake:'#547780',swamp:'#637662',grass:'#89916a'},regions=Object.fromEntries(Object.keys(terrainColors).map(type=>[type,[]])),details=[],sites=[];
  // Include a one-cell border so shores and vegetation do not change at the
  // viewport edge. All positions remain in the original world coordinate space.
  for(let y=start.y-1;y<=start.y+span;y++)for(let x=start.x-1;x<=start.x+span;x++){
    const t=read(x,y);if(!t)continue;
    const px=x*100,py=y*100,seed=worldLandscapeSeed(x,y),type=t.type;
    if(regions[type])regions[type].push(`M${px} ${py}h100v100h-100Z`);
    if(type==='forest'){
      for(let i=0;i<5;i++)details.push(worldLandscapeTree(px+12+(seed+i*29)%79,py+27+(seed+i*19)%64,.8+(i%3)*.12));
    }else if(type==='mountain'){
      const peakX=px+24+seed%38,peakY=py+9+(seed>>>5)%20;
      details.push(`<path d="M${px-10} ${py+98}L${peakX} ${peakY}L${px+110} ${py+98}Z" fill="#566456" opacity=".83"/><path d="M${peakX} ${peakY}L${peakX+8} ${py+96}L${px+110} ${py+98}Z" fill="#a7aa91" opacity=".78"/><path d="M${peakX} ${peakY}l-11 22 13-5 12 9Z" fill="#d1cbb2" opacity=".85"/><path d="M${px+2} ${py+90}Q${px+51} ${py+74} ${px+102} ${py+95}" fill="none" stroke="#57694e" stroke-width="4" opacity=".5"/>`);
    }else if(type==='hill'){
      const bend=py+35+seed%29;
      details.push(`<path d="M${px-10} ${py+78}Q${px+46} ${bend} ${px+110} ${py+77}" fill="none" stroke="#d0bf94" stroke-width="5" opacity=".6"/><path d="M${px-10} ${py+87}Q${px+46} ${bend+21} ${px+110} ${py+89}" fill="none" stroke="#8b886b" stroke-width="2" opacity=".65"/>`);
    }else if(type==='lake'){
      for(let i=0;i<3;i++)details.push(`<path d="M${px-6} ${py+23+i*26}Q${px+24} ${py+15+i*26} ${px+53} ${py+23+i*26}T${px+108} ${py+23+i*26}" fill="none" stroke="#a3b9ae" stroke-width="1.6" opacity=".48"/>`);
    }else if(type==='swamp'){
      details.push(`<path d="M${px-5} ${py+68}Q${px+35} ${py+46} ${px+105} ${py+71}" fill="none" stroke="#486e64" stroke-width="16" opacity=".55"/><path d="M${px+24} ${py+68}v-21m0 8-6-7m6 13 7-9M${px+76} ${py+83}V59m0 9-6-7m6 13 7-9" fill="none" stroke="#c1b583" stroke-width="2" opacity=".75"/>`);
    }else if(t.wild){
      const tuftX=px+10+seed%66,tuftY=py+30+(seed>>>5)%50;
      details.push(`<path d="M${tuftX} ${tuftY}l3-9 3 8m17 11 4-10 3 9" fill="none" stroke="#516748" stroke-width="2" opacity=".5"/>`);
    }
    if(t.id==='home'||(!t.wild&&t.terrain==='fort'))sites.push(worldCityFlagArt(t,t.id==='home'||!!S().conquered[t.id]));
    else if(!t.wild){
      details.push(`<g transform="translate(${px+50} ${py+48})"><path d="M-19 10L0-7 22 9H-19Z" fill="#586452" stroke="#c5b487" stroke-width="1.5"/><path d="M-15 10v19H17V10" fill="#b1a17d"/><path d="M-4 29V16H6v13" fill="#4d5444"/><path d="M25 3V-18m1 1 15 5-15 5" fill="${S().conquered[t.id]?'#63a6a0':'#918e76'}" stroke="#c7b78a" stroke-width="1.5"/></g>`);
    }
  }
  const contours=[];
  for(let row=Math.floor(start.y/2)-1;row<=Math.ceil((start.y+span)/2);row++){
    let path='';
    for(let column=start.x-1;column<=start.x+span+1;column++){
      const px=column*100,py=row*200+35*Math.sin(column*.55+row*.8);
      path+=(path?'L':'M')+px+' '+py.toFixed(1)+' ';
    }
    contours.push(`<path d="${path}" fill="none" stroke="#c3bd91" stroke-width="1.5" opacity=".18"/>`);
  }
  const roads=[],stops=['field','home','wood','camp','mine','pass','home','fort',...Game.nodes.filter(n=>n.chapter).map(n=>n.id)].filter(id=>id==='home'||Game.landmarkVisible(id));
  for(let index=1;index<stops.length;index++){
    const a=stops[index-1]==='home'?Game.home:Game.getNode(stops[index-1]),b=stops[index]==='home'?Game.home:Game.getNode(stops[index]);
    if(!a||!b)continue;
    roads.push(`<path d="M${(a.x+.5)*100} ${(a.y+.5)*100}L${(b.x+.5)*100} ${(b.y+.5)*100}" fill="none" stroke="#cab58a" stroke-width="6" opacity=".62"/><path d="M${(a.x+.5)*100} ${(a.y+.5)*100}L${(b.x+.5)*100} ${(b.y+.5)*100}" fill="none" stroke="#796e54" stroke-width="1.2" stroke-dasharray="5 7" opacity=".65"/>`);
  }
  return `<svg class="world-landscape" style="grid-column:2 / span ${span};grid-row:2 / span ${span}" viewBox="${originX} ${originY} ${size} ${size}" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="world-region-blend" x="${originX-100}" y="${originY-100}" width="${size+200}" height="${size+200}" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="6"/></filter></defs><rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="#7b8462"/>${Object.entries(regions).map(([type,paths])=>`<path d="${paths.join('')}" fill="${terrainColors[type]}" filter="url(#world-region-blend)"/>`).join('')}${contours.join('')}${details.join('')}${roads.join('')}${sites.join('')}</svg>`;
}
function worldMap(){
  const start=worldBounds(),span=worldSpan(),tiles=new Map(),marches=new Set(Game.allExpeditions().map(e=>e.node));
  const read=(x,y)=>{
    if(x<0||y<0||x>=Game.WORLD_SIZE||y>=Game.WORLD_SIZE)return null;
    const key=x+':'+y;if(tiles.has(key))return tiles.get(key);
    const source=Game.getWorldTile(x,y),hidden=!source.wild&&source.id!=='home'&&!Game.landmarkVisible(source.id),tile=hidden?{...source,name:'未发现据点',type:'plain',terrain:'plain',level:0,wild:true,openCity:false,hidden:true}:source;
    tiles.set(key,tile);return tile;
  };
  return `<section class="world-grid-board"><div class="map-toolbar"><span class="outskirts-title">青溪天下 · 山河舆图</span><span class="label">${start.x}–${start.x+span-1} / ${start.y}–${start.y+span-1}</span>${btn(layoutNavIcon('world')+'大地图','worldAtlas','','small world-atlas-open')}${sceneFocusButton()}</div><div class="world-grid continuous-map illustrated-map ink-map ${webMapTactical?'tactical-map':''}" style="--map-span:${span}" aria-label="世界地图，拖动可移动视野">${webWorldGroundSVG(start,span,read)}<span class="axis-corner" style="grid-column:1;grid-row:1">Y/X</span>${Array.from({length:span},(_,i)=>`<span class="map-axis" style="grid-column:${i+2};grid-row:1">${start.x+i}</span>`).join('')}${Array.from({length:span},(_,dy)=>`<span class="map-axis" style="grid-column:1;grid-row:${dy+2}">${start.y+dy}</span>${Array.from({length:span},(_,dx)=>{
    const t=read(start.x+dx,start.y+dy),hidden=!!t.hidden,owned=S().conquered[t.id],job=marches.has(t.id),city=t.id==='home'||(!t.wild&&t.terrain==='fort');
    return `<button class="world-cell ${t.type} ${city?'world-city-cell':''} ${t.openCity?'yellow-city-tile':''} ${t.id===selectedNode?'selected':''} ${owned?'owned':''} ${job?'march-target':''}" style="grid-column:${dx+2};grid-row:${dy+2}" ${hidden?'disabled':''} data-action="worldTile" data-id="${t.id}" data-x="${t.x}" data-y="${t.y}" aria-label="${esc(t.name)} 坐标 ${t.x},${t.y} ${t.level}级${t.namedCity?' 名城':t.faction==='yellow_turban'?' 黄巾城市':''}${owned?' 已占领':''}">${webTerrainArt(t)}${t.wild&&!hidden?`<span class="world-wild-mark res-${Game.terrainTypes[t.type]?.resource||'food'}" aria-hidden="true"><i>${({food:'粮',wood:'木',stone:'石',iron:'铁'})[Game.terrainTypes[t.type]?.resource]||'粮'}</i>${t.level}</span>`:''}${t.wild?'<span class="world-tile-caption">'+esc(Game.terrainTypes[t.type]?.name||t.name)+' · '+t.level+'级</span>':''}<span class="world-cell-level">${hidden?'未发现':t.id==='home'?'主城':t.level+'级'}</span>${!t.wild?'<span class="world-site-name">'+esc(t.id==='home'?(S().ruler||'主城'):t.name)+'</span>':''}${owned?'<span class="world-owned">✓</span>':!t.wild&&t.id!=='home'&&!city?'<span class="world-landmark">◆</span>':''}${job?'<span class="world-march">⚑</span>':''}</button>`;
  }).join('')}`).join('')}</div><div class="map-controls"><div class="map-pad">${btn('←','mapPan','-4:0','small secondary')}${btn('↑','mapPan','0:-4','small secondary')}${btn('↓','mapPan','0:4','small secondary')}${btn('→','mapPan','4:0','small secondary')}</div>${btn(webMapTactical?'收起战术标注':'战术标注','webMapTactical','','small secondary')}${btn('回到本城','mapHome','','small secondary')}</div>${webWildRefreshHTML()}</section>`;
}
function yellowCityLinksHTML(){
  const cities=Game.nodes.filter(n=>n.faction==='yellow_turban').map(n=>Game.getNode(n.id));if(!cities.length)return '';
  return `<section class="yellow-city-links" aria-label="黄巾城市"><div class="section-title"><h3>黄巾城市</h3><span class="label">独立攻城 · 无需史诗解锁</span></div><div class="yellow-city-choices">${cities.map(n=>{const owned=!!S().conquered[n.id],town=S().towns[n.id];return `<button class="yellow-city-choice ${owned?'is-owned':''} ${selectedNode===n.id?'is-selected':''}" data-action="mapLandmark" data-id="${n.id}" aria-label="${esc(n.name)} ${n.level}级 ${owned?'已占领':'民心 '+(town?.morale??100)}"><strong>${esc(n.name)}</strong><span>${n.level} 级 · ${owned?'已占领':'民心 '+(town?.morale??100)}</span><small>(${n.x}, ${n.y})</small></button>`;}).join('')}</div><p class="hint">占领胜利缴获资源与黄金；每胜民心下降 35，低于 0 才归属。</p></section>`;
}
function worldBattleReceiptHTML(){
  const r=S().reports[0];if(!r)return '';
  const n=Game.getNode(r.node),name=n?.name||r.node,b=S().battle,receipt=r.resourceReceipt,received=receipt?Object.values(receipt.base.received).reduce((a,n)=>a+n,0)+Object.values(receipt.bonus.received).reduce((a,n)=>a+n,0):null;
  return `<section class="world-battle-receipt notice" aria-label="最近战斗结果"><div><strong>${esc(name)} · ${r.won?'胜利':'失利'} · 已结算</strong><p class="hint">永久损失 ${Game.totalArmy(r.lost)} 人 · ${r.woundedInHospital?'伤兵入营':'旧伤兵归队'} ${Game.totalArmy(r.wounded)} 人${received===null?'':' · 实际入库 '+num(received)}${r.stationed?' · 战后安排：驻扎':Game.allExpeditions().some(e=>e.node===r.node&&e.phase==='return')?' · 部队正在返城':' · 返城安排已完成'}</p></div><div class="guide-actions">${btn('查看完整战报','classicNav','reports','small secondary')}${r.wildGeneral?.status==='portrait_required'?btn('未购画像 · 查看购买','wildPortraitAsk',r.wildGeneral.line,'small secondary'):''}${r.wildGeneral?.status==='captured'&&S().wildGenerals.captives.some(c=>c.id===r.wildGeneral.id)?btn('俘将管理 · 招降','wildGenerals','','small'):''}</div>${b?.finished&&b.node===r.node?`<details><summary>查看最后回合战况</summary>${combatRoundSummaryHTML(b)}</details>`:''}</section>`;
}
function worldIntelSummaryHTML(n){
  if(Game.cityMeta?.(n.id)||S().conquered[n.id]&&Game.isCity(n))return '<span class="world-intel-status">己方城池 · 驻军详情见城市</span>';
  const intel=Game.intel(n.id),precision=intel?.public?'exact':intel?.precision||(intel?.exact?'exact':intel?'bands':'unknown'),labels={exact:'精确侦察',bands:'数量区间',types:'仅知兵种',unknown:'未侦察'},blocked=n.chapter===3&&!ChapterData.unlocked(S(),3);
  return `<span class="world-intel-status">情报：${intel?.public?'章节守军公开':labels[precision]||'未侦察'}</span>${intel?.public?'':btn(blocked?'第三章尚未开启':'侦察','scoutPlan',n.id,'small secondary',S().army.scout<1||blocked)}`;
}
function worldWildLeadSummaryHTML(n){
  const lead=S().wildGenerals?.rumors.find(r=>r.node===n.id&&r.status==='active');if(!lead||typeof HeroSystem==='undefined')return '';
  const definition=HeroSystem.wild.definitions.find(d=>d.line===lead.line);if(!definition)return '';
  const owned=HeroSystem.wild.portraitOwned(S(),lead.line);
  return `<section class="world-wild-summary notice"><strong>在野将领 · ${esc(definition.name)}</strong><p class="hint">${owned?'已持有画像 · 歼灭守军且招贤馆有空位可俘获':'尚未购买画像 · 胜利仍无法俘获'}</p>${owned?btn('线索与招降要求','wildGenerals','','small secondary'):btn('购买对应画像','wildPortraitAsk',lead.line,'small secondary')}</section>`;
}
function worldPage(){
  if(S().battle&&!S().battle.finished)return battlePage();
  const n=cityViewNode(Game.getNode(Game.landmarkVisible(selectedNode)?selectedNode:'field')||Game.getNode('field')),taskNodes=Game.nodes.filter(t=>!t.openCity),namedCount=taskNodes.filter(t=>S().conquered[t.id]).length,yellowCities=Game.nodes.filter(t=>t.faction==='yellow_turban'),cityCount=yellowCities.filter(t=>S().conquered[t.id]).length,wildCount=Object.keys(S().realm?.wildOwners||{}).length;
  const friendly=Game.cityMeta?.(n.id)||S().conquered[n.id]&&Game.isCity(n);
  const targetBody=n.orderRoute?`<p class="coordinate-tag">军令战场 · ${esc(WarOrders.routes[n.orderRoute].name)} · 第 ${n.orderTier} 阶${n.encounter?'战术遭遇':''}</p>${namedCityDetailsHTML(n)}${classicTargetActions(n)}`:`<p class="coordinate-tag">(${n.x}, ${n.y}) · 距${esc(activeCityMeta().name)} ${Math.hypot(n.x-(Game.currentHome?.()||Game.home).x,n.y-(Game.currentHome?.()||Game.home).y).toFixed(1)} 格</p><div class="world-target-intel">${worldIntelSummaryHTML(n)}</div>${worldWildLeadSummaryHTML(n)}${cityStrategyHTML(n)}${namedCityDetailsHTML(n)}${classicTargetActions(n)}${cityMapActionsHTML(n)}<details class="world-target-details" data-ui-disclosure="target-intel-${n.id}"><summary>${friendly?'城池与地块详情':'守军与地块详情'}</summary><div><p class="hint">${esc(n.desc)}</p>${wildGeneralNodeHTML(n)}${friendly?'':enemyIntelHTML(n)}</div></details>`;
  return `<section class="world-command-page"><div class="page-head world-command-heading"><h2>青溪天下</h2><span class="label">64×64 · 拖动地图</span></div>${expeditionStrip()}
    <div class="layout world-layout"><div class="world-map-main">${worldMap()}</div><aside class="panel node-panel world-target-panel" aria-label="当前地图目标"><div class="section-title"><h3>${esc(n.name)}</h3><span class="badge">${n.orderRoute?'战役军令':(n.namedCity?NamedCityData.definition(n).tierName+' · ':n.faction==='yellow_turban'?'黄巾城 · ':'')+n.level+' 级'}</span></div>${targetBody}</aside></div>
    <div class="world-map-support world-command-support">${worldBattleReceiptHTML()}<details class="world-tool-details" data-ui-disclosure="map-atlas"><summary>地图工具 · 总览、坐标与图例</summary><section class="world-navigation"><div><canvas id="world-minimap" width="192" height="192" aria-label="64乘64世界总览，点击定位"></canvas><p class="label" style="text-align:center;margin-top:6px">总览 · 点击定位</p></div><div class="world-jump"><label class="label">坐标跳转 · 0–63</label><div class="coordinate-row"><label>X <input id="map-x" type="number" min="0" max="63" value="${worldView.x}"></label><label>Y <input id="map-y" type="number" min="0" max="63" value="${worldView.y}"></label>${btn('前往','mapJump','','small')}</div><div class="map-legend">${Object.entries(Game.terrainTypes).map(([type,cfg])=>`<span><i style="background:${cfg.color}"></i>${cfg.name}</span>`).join('')}</div></div></section><p class="hint map-help">官道连接已发现据点 · 青旗为我方，黄旗为黄巾城。未来任务据点随进度发现。</p></details><details class="world-tool-details" data-ui-disclosure="map-landmarks"><summary>任务据点 · 已探索及当前目标</summary><section class="landmark-links"><div>${taskNodes.filter(t=>Game.landmarkVisible(t.id)).map(t=>btn(t.name,'mapLandmark',t.id,'small secondary')).join('')}</div></section></details>${yellowCities.length?`<details class="world-tool-details" data-ui-disclosure="map-yellow-cities"><summary>黄巾城市 · 已占领 ${cityCount}/${yellowCities.length}</summary>${yellowCityLinksHTML()}</details>`:''}<details class="world-tool-details world-progress-details" data-ui-disclosure="map-progress"><summary>领地与章节 · 查看进度与奖励</summary>${btn('名城与行政辖区','namedCities','','small secondary')}<div><div class="world-territory-counts"><span class="badge">野地 ${wildCount} · 关隘 ${namedCount}/${taskNodes.length}</span></div>${chapterWorldBanner()}${epicWorldBanner()}</div></details></div></section>`;
}
function drawWorldMiniMap(){
  const canvas=document.getElementById('world-minimap');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const cell=canvas.width/Game.WORLD_SIZE;
  for(let y=0;y<Game.WORLD_SIZE;y++)for(let x=0;x<Game.WORLD_SIZE;x++){
    const t=Game.getWorldTile(x,y),hidden=!t.wild&&t.id!=='home'&&!Game.landmarkVisible(t.id);ctx.fillStyle=hidden?Game.terrainTypes.plain.color:t.id==='home'?'#e1c17b':S().conquered[t.id]?'#bddd98':t.openCity?'#d2ad4d':Game.terrainTypes[t.type]?.color||'#b09772';ctx.fillRect(x*cell,y*cell,cell,cell);
  }
  const start=worldBounds();ctx.strokeStyle='#f3e3b5';ctx.lineWidth=1.5;ctx.strokeRect(start.x*cell,start.y*cell,worldSpan()*cell,worldSpan()*cell);
  const n=Game.getNode(selectedNode);if(n&&!n.orderRoute&&Number.isFinite(n.x)&&Number.isFinite(n.y)){ctx.fillStyle='#f2d286';ctx.fillRect(n.x*cell-1,n.y*cell-1,cell+2,cell+2);}
}
document.addEventListener('toggle',event=>{if(event.target?.dataset?.uiDisclosure==='map-atlas'&&event.target.open)drawWorldMiniMap();},{capture:true});
function worldNodeModal(id){if(!Game.landmarkVisible(id)){toast('据点尚未发现，请先完成当前任务据点');return;}const n=cityViewNode(Game.getNode(id));if(!n)return;if(n.orderRoute){showModal(n.name+' · 战役军令',`<p class="coordinate-tag">军令战场 · ${esc(WarOrders.routes[n.orderRoute].name)} · 第 ${n.orderTier} 阶</p>${namedCityDetailsHTML(n)}${classicTargetActions(n)}`,btn('返回地图','close','','secondary'));return;}showModal(n.name+' · '+n.level+' 级',`<p class="coordinate-tag">坐标 (${n.x}, ${n.y})</p><p class="hint">${n.desc}</p>${wildGeneralNodeHTML(n)}${Game.cityMeta(n.id)||S().conquered[n.id]&&Game.isCity(n)?'':enemyIntelHTML(n)}${cityStrategyHTML(n)}${campaignNodeDetails(n)}${cityMapActionsHTML(n)}`,btn('返回地图','close','','secondary'));}
function centerWorld(x,y,select=true){
  if(!Number.isFinite(x)||!Number.isFinite(y))return;
  worldView={x:Math.max(0,Math.min(63,x)),y:Math.max(0,Math.min(63,y))};
  const tile=Game.getWorldTile(worldView.x,worldView.y);if(select&&tile&&tile.id!=='home'){if(Game.landmarkVisible(tile.id))selectedNode=tile.id;else toast('这里的任务据点尚未发现，请先完成当前据点');}
  render();if(select)document.querySelector('.world-grid-board')?.scrollIntoView({block:'start',behavior:'smooth'});
}
document.addEventListener('click',event=>{
  if(event.target.closest('#world-minimap')){const rect=event.target.getBoundingClientRect();centerWorld(Math.min(63,Math.floor((event.clientX-rect.left)/rect.width*64)),Math.min(63,Math.floor((event.clientY-rect.top)/rect.height*64)));return;}
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action,id=el.dataset.id;
  if(action==='citySlot')citySlotModal(Number(id));
  if(action==='cityMove'){const [index,building]=id.split(':');if(actResult(Game.relocateBuilding(building,Number(index)),'建筑位置已调整'))modal.close();}
  if(action==='worldTile'){if(!Game.landmarkVisible(id)){toast('据点尚未发现');return;}if(id==='home'){page='city';cityArea='inner';render();document.getElementById('main').scrollTop=0;}else{selectedNode=id;render();if(window.matchMedia('(max-width:760px)').matches)document.querySelector('.node-panel')?.scrollIntoView({block:'start',behavior:'smooth'});}}
  if(action==='mapPan'){const [dx,dy]=id.split(':').map(Number);centerWorld(worldView.x+dx,worldView.y+dy,false);}
  if(action==='mapHome'){const home=Game.currentHome?.()||Game.home;centerWorld(home.x,home.y,false);}
  if(action==='mapLandmark'){if(!Game.landmarkVisible(id)){toast('据点尚未发现');return;}const n=Game.getNode(id);if(!n)return;if(n.orderRoute){selectedNode=n.id;render();return;}centerWorld(n.x,n.y);}
  if(action==='mapJump'){const x=Number(document.getElementById('map-x').value),y=Number(document.getElementById('map-y').value);if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>63||y>63){toast('坐标请输入 0–63 的整数');return;}centerWorld(x,y);}
});
document.addEventListener('pointerdown',event=>{
  const grid=event.target.closest('.world-grid');if(!grid||event.button>0)return;
  const cell=grid.querySelector('.world-cell')?.getBoundingClientRect(),fallback=grid.getBoundingClientRect().width/(worldSpan()+.4);
  mapDrag={grid,pointer:event.pointerId,x:event.clientX,y:event.clientY,start:{...worldView},moved:false,cellX:cell?.width||fallback,cellY:cell?.height||fallback};
});
document.addEventListener('pointermove',event=>{
  if(!mapDrag||event.pointerId!==mapDrag.pointer)return;
  if(Math.hypot(event.clientX-mapDrag.x,event.clientY-mapDrag.y)>10){if(!mapDrag.moved)mapDrag.grid.setPointerCapture(event.pointerId);mapDrag.moved=true;mapDrag.grid.classList.add('dragging');}
});
document.addEventListener('pointerup',event=>{
  if(!mapDrag||event.pointerId!==mapDrag.pointer)return;
  const drag=mapDrag;mapDrag=null;drag.grid.classList.remove('dragging');
  if(drag.moved){suppressMapClick=true;centerWorld(drag.start.x-Math.round((event.clientX-drag.x)/drag.cellX),drag.start.y-Math.round((event.clientY-drag.y)/drag.cellY),false);setTimeout(()=>suppressMapClick=false,300);}
});
document.addEventListener('pointercancel',()=>{mapDrag?.grid.classList.remove('dragging');mapDrag=null;});
document.addEventListener('click',event=>{if(suppressMapClick){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
