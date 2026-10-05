'use strict';
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
function worldMap(){
  const start=worldBounds(),span=worldSpan();
  return `<section class="world-grid-board"><div class="map-toolbar"><span class="outskirts-title">青溪天下 · 行军舆图</span><span class="label">${start.x}–${start.x+span-1} / ${start.y}–${start.y+span-1}</span></div><div class="world-grid" style="--map-span:${span}" aria-label="世界地图，拖动可移动视野"><span class="axis-corner">Y/X</span>${Array.from({length:span},(_,i)=>`<span class="map-axis">${start.x+i}</span>`).join('')}${Array.from({length:span},(_,dy)=>`<span class="map-axis">${start.y+dy}</span>${Array.from({length:span},(_,dx)=>{
    const source=Game.getWorldTile(start.x+dx,start.y+dy),hidden=!source.wild&&source.id!=='home'&&!Game.landmarkVisible(source.id),t=hidden?{...source,name:'未发现据点',type:'plain',terrain:'plain',level:0,wild:true}:source,owned=S().conquered[t.id],job=Game.allExpeditions().some(e=>e.node===t.id);
    return `<button class="world-cell ${t.type} ${t.id===selectedNode?'selected':''} ${owned?'owned':''} ${job?'march-target':''}" ${hidden?'disabled':''} data-action="worldTile" data-id="${t.id}" data-x="${t.x}" data-y="${t.y}" aria-label="${t.name} 坐标 ${t.x},${t.y} ${t.level}级${owned?' 已占领':''}">${terrainArt(t.type,t)}<span class="world-cell-level">${hidden?'未发现':t.id==='home'?'主城':t.level+'级'}</span>${!t.wild&&t.id!=='home'?'<span class="world-site-name">'+esc(t.name)+'</span>':''}${owned?'<span class="world-owned">✓</span>':!t.wild&&t.id!=='home'?'<span class="world-landmark">◆</span>':''}${job?'<span class="world-march">⚑</span>':''}</button>`;
  }).join('')}`).join('')}</div><div class="map-controls"><div class="map-pad">${btn('←','mapPan','-4:0','small secondary')}${btn('↑','mapPan','0:-4','small secondary')}${btn('↓','mapPan','0:4','small secondary')}${btn('→','mapPan','4:0','small secondary')}</div>${btn('回到主城','mapHome','','small secondary')}</div><p class="hint map-help">官道连接城池关隘 · 拖动移动视野，点选地块侦察与出征</p></section>`;
}
function worldBattleReceiptHTML(){
  const r=S().reports[0];if(!r)return '';
  const n=Game.getNode(r.node),name=n?.name||r.node,b=S().battle,receipt=r.resourceReceipt,received=receipt?Object.values(receipt.base.received).reduce((a,n)=>a+n,0)+Object.values(receipt.bonus.received).reduce((a,n)=>a+n,0):null;
  return `<section class="world-battle-receipt notice" aria-label="最近战斗结果"><div><strong>${esc(name)} · ${r.won?'胜利':'失利'} · 已结算</strong><p class="hint">永久损失 ${Game.totalArmy(r.lost)} 人 · 伤兵 ${Game.totalArmy(r.wounded)} 人${received===null?'':' · 实际入库 '+num(received)}${r.stationed?' · 战后安排：驻扎':Game.allExpeditions().some(e=>e.node===r.node&&e.phase==='return')?' · 部队正在返城':' · 返城安排已完成'}</p></div><div class="guide-actions">${btn('查看完整战报','classicNav','reports','small secondary')}${r.wildGeneral?.status==='portrait_required'?btn('未购画像 · 查看购买','wildPortraitAsk',r.wildGeneral.line,'small secondary'):''}${r.wildGeneral?.status==='captured'&&S().wildGenerals.captives.some(c=>c.id===r.wildGeneral.id)?btn('俘将管理 · 招降','wildGenerals','','small'):''}</div>${b?.finished&&b.node===r.node?`<details><summary>查看最后回合战况</summary>${combatRoundSummaryHTML(b)}</details>`:''}</section>`;
}
function worldPage(){
  if(S().battle&&!S().battle.finished)return battlePage();
  const n=Game.getNode(Game.landmarkVisible(selectedNode)?selectedNode:'field')||Game.getNode('field'),owned=!!S().conquered[n.id],cd=S().cooldowns[n.id]>Date.now(),namedCount=Game.nodes.filter(n=>S().conquered[n.id]).length,wildCount=Object.keys(S().conquered).filter(id=>id.startsWith('wild_')).length;
  return `<div class="page-head"><div><h2>青溪天下</h2><p class="sub">64×64 大地图 · 4,096 格山河，寻找下一块领地。</p></div><span class="badge">野地 ${wildCount} · 关隘 ${namedCount}/${Game.nodes.length}</span></div>${expeditionStrip()}${worldBattleReceiptHTML()}<div class="layout world-layout"><div>${worldMap()}<details class="world-progress-details"><summary>章节与史诗进度 · 查看目标与奖励</summary><div>${chapterWorldBanner()}${epicWorldBanner()}</div></details><section class="world-navigation"><div><canvas id="world-minimap" width="192" height="192" aria-label="64乘64世界总览，点击定位"></canvas><p class="label" style="text-align:center;margin-top:6px">总览 · 点击定位</p></div><div class="world-jump"><label class="label">坐标跳转 · 0–63</label><div class="coordinate-row"><label>X <input id="map-x" type="number" min="0" max="63" value="${n.x}"></label><label>Y <input id="map-y" type="number" min="0" max="63" value="${n.y}"></label>${btn('前往','mapJump','','small')}</div><div class="map-legend">${Object.entries(Game.terrainTypes).map(([type,cfg])=>`<span><i style="background:${cfg.color}"></i>${cfg.name}</span>`).join('')}</div></div></section><section class="landmark-links"><span class="label">任务据点 · 已探索及当前目标</span><div>${Game.nodes.filter(t=>Game.landmarkVisible(t.id)).map(t=>btn(t.name,'mapLandmark',t.id,'small secondary')).join('')}</div></section></div><section class="panel node-panel"><div class="section-title"><h3>${n.name}</h3><span class="badge">${n.level} 级</span></div><p class="coordinate-tag">坐标 (${n.x}, ${n.y}) · 距主城 ${Math.hypot(n.x-Game.home.x,n.y-Game.home.y).toFixed(1)} 格</p><p class="hint">${n.desc}</p><div class="divider"></div>${wildGeneralNodeHTML(n)}${classicTargetActions(n)}<div class="divider"></div>${enemyIntelHTML(n)}</section></div>`;
}
function drawWorldMiniMap(){
  const canvas=document.getElementById('world-minimap');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const cell=canvas.width/Game.WORLD_SIZE;
  for(let y=0;y<Game.WORLD_SIZE;y++)for(let x=0;x<Game.WORLD_SIZE;x++){
    const t=Game.getWorldTile(x,y);ctx.fillStyle=t.id==='home'?'#e1c17b':S().conquered[t.id]?'#bddd98':Game.terrainTypes[t.type]?.color||'#b09772';ctx.fillRect(x*cell,y*cell,cell,cell);
  }
  const start=worldBounds();ctx.strokeStyle='#f3e3b5';ctx.lineWidth=1.5;ctx.strokeRect(start.x*cell,start.y*cell,worldSpan()*cell,worldSpan()*cell);
  const n=Game.getNode(selectedNode);if(n){ctx.fillStyle='#f2d286';ctx.fillRect(n.x*cell-1,n.y*cell-1,cell+2,cell+2);}
}
function worldNodeModal(id){if(!Game.landmarkVisible(id)){toast('据点尚未发现，请先完成当前任务据点');return;}const n=Game.getNode(id);if(!n)return;showModal(n.name+' · '+n.level+' 级',`<p class="coordinate-tag">坐标 (${n.x}, ${n.y})</p><p class="hint">${n.desc}</p>${wildGeneralNodeHTML(n)}${enemyIntelHTML(n)}${campaignNodeDetails(n)}`,btn('返回地图','close','','secondary'));}
function centerWorld(x,y,select=true){
  worldView={x:Math.max(0,Math.min(63,x)),y:Math.max(0,Math.min(63,y))};
  const tile=Game.getWorldTile(worldView.x,worldView.y);if(select&&tile&&tile.id!=='home'){if(Game.landmarkVisible(tile.id))selectedNode=tile.id;else toast('这里的任务据点尚未发现，请先完成当前据点');}
  render();
}
document.addEventListener('click',event=>{
  if(event.target.closest('#world-minimap')){const rect=event.target.getBoundingClientRect();centerWorld(Math.min(63,Math.floor((event.clientX-rect.left)/rect.width*64)),Math.min(63,Math.floor((event.clientY-rect.top)/rect.height*64)));return;}
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action,id=el.dataset.id;
  if(action==='citySlot')citySlotModal(Number(id));
  if(action==='cityMove'){const [index,building]=id.split(':');if(actResult(Game.relocateBuilding(building,Number(index)),'建筑位置已调整'))modal.close();}
  if(action==='worldTile'){if(!Game.landmarkVisible(id)){toast('据点尚未发现');return;}if(id==='home'){page='city';cityArea='inner';render();document.getElementById('main').scrollTop=0;}else{selectedNode=id;render();if(window.matchMedia('(max-width:760px)').matches)document.querySelector('.node-panel')?.scrollIntoView({block:'start',behavior:'smooth'});}}
  if(action==='mapPan'){const [dx,dy]=id.split(':').map(Number);centerWorld(worldView.x+dx,worldView.y+dy,false);}
  if(action==='mapHome')centerWorld(Game.home.x,Game.home.y,false);
  if(action==='mapLandmark'){if(!Game.landmarkVisible(id)){toast('据点尚未发现');return;}const n=Game.getNode(id);centerWorld(n.x,n.y);}
  if(action==='mapJump'){const x=Number(document.getElementById('map-x').value),y=Number(document.getElementById('map-y').value);if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>63||y>63){toast('坐标请输入 0–63 的整数');return;}centerWorld(x,y);}
});
document.addEventListener('pointerdown',event=>{
  const grid=event.target.closest('.world-grid');if(!grid||event.button>0)return;
  mapDrag={grid,pointer:event.pointerId,x:event.clientX,y:event.clientY,start:{...worldView},moved:false,cell:grid.getBoundingClientRect().width/(worldSpan()+.4)};
});
document.addEventListener('pointermove',event=>{
  if(!mapDrag||event.pointerId!==mapDrag.pointer)return;
  if(Math.hypot(event.clientX-mapDrag.x,event.clientY-mapDrag.y)>10){if(!mapDrag.moved)mapDrag.grid.setPointerCapture(event.pointerId);mapDrag.moved=true;mapDrag.grid.classList.add('dragging');}
});
document.addEventListener('pointerup',event=>{
  if(!mapDrag||event.pointerId!==mapDrag.pointer)return;
  const drag=mapDrag;mapDrag=null;drag.grid.classList.remove('dragging');
  if(drag.moved){suppressMapClick=true;centerWorld(drag.start.x-Math.round((event.clientX-drag.x)/drag.cell),drag.start.y-Math.round((event.clientY-drag.y)/drag.cell),false);setTimeout(()=>suppressMapClick=false,300);}
});
document.addEventListener('pointercancel',()=>{mapDrag?.grid.classList.remove('dragging');mapDrag=null;});
document.addEventListener('click',event=>{if(suppressMapClick){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
