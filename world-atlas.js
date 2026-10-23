'use strict';
// A read-only overview. Coordinates and visibility come from the existing world API.
const WorldAtlasColors={plain:'#a9bb87',grass:'#9ab476',forest:'#5d825d',mountain:'#798779',hill:'#b0aa79',lake:'#609b9d',swamp:'#7a9d78',camp:'#c1b18b',fort:'#c1b18b'};
let worldAtlasView=null;
function worldAtlasRead(x,y){
  const tile=Game.getWorldTile(x,y);
  return !tile.wild&&tile.id!=='home'&&!Game.landmarkVisible(tile.id)?{x,y,type:'plain',hidden:true}:tile;
}
function worldAtlasModal(){
  const size=Game.WORLD_SIZE,home=Game.currentHome?.()||Game.home;
  const known=Game.nodes.map(n=>Game.getNode(n.id)).filter(n=>n&&!n.orderRoute&&Game.landmarkVisible(n.id)&&Number.isInteger(n.x)&&Number.isInteger(n.y)&&n.x>=0&&n.y>=0&&n.x<size&&n.y<size);
  worldAtlasView={cursor:{...worldView},tiles:[],size};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)worldAtlasView.tiles.push(worldAtlasRead(x,y));
  showModal(`大地图 · ${size}×${size} 试玩战区`,
    `<section class="world-atlas"><p class="world-atlas-help">六个试玩分区沿用现有坐标。点击定位；方向键移动，Enter 查看。框线为当前视野，未发现据点不标出；金线为所选目标的实际进军路线。</p>
    <div class="world-atlas-layout"><div class="world-atlas-chart"><div class="world-atlas-axis"><span>0</span><span>X → ${size-1}</span></div><canvas id="world-atlas-canvas" width="768" height="768" tabindex="0" role="button" aria-label="全世界地图，方向键选择坐标，Enter 查看详细地图"></canvas><div class="world-atlas-axis"><span>Y ↓ ${size-1}</span><output id="world-atlas-hover">当前视野中心：${worldView.x}, ${worldView.y}</output></div></div>
    <aside class="world-atlas-tools"><div class="world-atlas-key"><span><i class="atlas-home"></i>本城</span><span><i class="atlas-owned"></i>己方领地</span><span><i class="atlas-city"></i>敌方城关</span><span><i class="atlas-site"></i>军令目标</span></div>
    <label class="world-atlas-heading">坐标定位 · 0–${size-1}</label><div class="world-atlas-coordinate"><label>X<input id="world-atlas-x" type="number" min="0" max="${size-1}" step="1" value="${worldView.x}"></label><label>Y<input id="world-atlas-y" type="number" min="0" max="${size-1}" step="1" value="${worldView.y}"></label></div>${btn('查看此处','worldAtlasGo','','block')}${btn('定位本城','worldAtlasGo',`${home.x}:${home.y}`,'secondary block')}
    <h3 class="world-atlas-heading">已发现据点</h3><div class="world-atlas-sites">${known.map(n=>btn(`${esc(n.name)} <small>${n.x}, ${n.y}</small>`,'worldAtlasGo',`${n.x}:${n.y}`,'secondary')).join('')||'<p class="hint">完成任务后逐步发现。</p>'}</div></aside></div></section>`,btn('返回详细地图','close','','secondary'));
  worldAtlasPaint();
}
function worldAtlasPaint(){
  const canvas=document.getElementById('world-atlas-canvas'),view=worldAtlasView;
  if(!canvas||!view)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const size=view.size,cell=canvas.width/size,base=document.createElement('canvas');base.width=base.height=size;
  const wash=base.getContext('2d');if(!wash)return;
  view.tiles.forEach(t=>{wash.fillStyle=WorldAtlasColors[t.type]||WorldAtlasColors.plain;wash.fillRect(t.x,t.y,1,1);});
  ctx.fillStyle='#a9bb87';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=.85;ctx.drawImage(base,0,0,canvas.width,canvas.height);ctx.globalAlpha=1;
  if(typeof WorldSandboxRegions!=='undefined')for(const r of WorldSandboxRegions){
    ctx.strokeStyle='#d9dec080';ctx.lineWidth=1;ctx.setLineDash([4,8]);ctx.strokeRect(r.x*cell,r.y*cell,r.w*cell,r.h*cell);ctx.setLineDash([]);
    const x=(r.x+r.w/2)*cell,y=(r.y+r.h/2)*cell;ctx.textAlign='center';ctx.font='25px "Songti SC","SimSun",serif';ctx.strokeStyle='#d8dfbd90';ctx.lineWidth=4;ctx.strokeText(r.name,x,y);ctx.fillStyle='#35584488';ctx.fillText(r.name,x,y);
  }
  const routes=typeof Game.sandboxRoutes==='function'&&Game.landmarkVisible(selectedNode)?Game.sandboxRoutes(selectedNode,{archer:1}).filter(r=>r.available):[];
  const selected=typeof sandboxSelectedRouteId==='function'?sandboxSelectedRouteId(selectedNode):'direct',route=routes.find(r=>r.id===selected)||routes[0];
  if(route?.path?.length){ctx.beginPath();route.path.forEach((p,i)=>{const x=(p.x+.5)*cell,y=(p.y+.5)*cell;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.strokeStyle='#e9cb81';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#9e6e2d';ctx.lineWidth=1.5;ctx.stroke();}
  for(const march of Game.marchPaths?.()||[]){
    const points=march.points?.length>1?march.points:[march.from,march.to];ctx.beginPath();points.forEach((p,i)=>{const x=(p.x+.5)*cell,y=(p.y+.5)*cell;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});
    ctx.strokeStyle=march.phase==='return'?'#a8e2d5':'#fff0ba';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc((march.position.x+.5)*cell,(march.position.y+.5)*cell,4,0,Math.PI*2);ctx.fillStyle=march.phase==='return'?'#2d8b7b':'#e2bd63';ctx.fill();ctx.strokeStyle='#244f40';ctx.lineWidth=1;ctx.stroke();
  }
  const taskNodes=new Set((Game.sandboxTasks?.()||[]).filter(t=>!['completed','claimed'].includes(t.status)).map(t=>t.node));
  // Sparse brush marks keep the overview readable at a very different scale from the local map.
  view.tiles.forEach(t=>{
    const x=(t.x+.5)*cell,y=(t.y+.5)*cell;
    if(t.type==='mountain'){
      ctx.beginPath();ctx.moveTo(x-4,y+3);ctx.lineTo(x,y-4);ctx.lineTo(x+4,y+3);ctx.strokeStyle='#576f65a0';ctx.lineWidth=1;ctx.stroke();
    }else if(t.type==='forest'&&(t.x+t.y)%3===0){
      ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x-2,y+1);ctx.lineTo(x+2,y+1);ctx.closePath();ctx.fillStyle='#42695480';ctx.fill();
    }else if(t.type==='lake'||t.type==='swamp'){
      ctx.beginPath();ctx.moveTo(x-4,y);ctx.quadraticCurveTo(x,y-2,x+4,y);ctx.strokeStyle='#678d9290';ctx.lineWidth=.9;ctx.stroke();
    }
    if(t.hidden)return;
    const home=Game.currentHome?.()||Game.home,isHome=t.x===home.x&&t.y===home.y;
    const owned=!!S().conquered[t.id]||!!Game.cityMeta?.(t.id);
    if(!isHome&&!owned&&t.wild)return;
    const siteType=typeof worldSandboxSiteType==='function'&&!t.wild?worldSandboxSiteType(t):'',city=t.id==='home'||!t.wild&&t.terrain==='fort'||['关隘','渡口'].includes(siteType);
    if(taskNodes.has(t.id)){ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.strokeStyle='#e9d58c';ctx.lineWidth=2;ctx.stroke();}
    ctx.fillStyle=isHome?'#246b63':owned?'#3d8c7e':t.faction==='yellow_turban'?'#b7963e':city?'#ad5844':'#735c43';ctx.strokeStyle='#fff3d3';ctx.lineWidth=1.3;
    ctx.beginPath();const r=isHome?8:city?5:3.5;
    if(city||isHome){ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();}else ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();ctx.stroke();
    if(isHome||t.id===selectedNode){const label=isHome?'本城':t.name;ctx.font='16px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.strokeStyle='#e9e9d5';ctx.lineWidth=4;ctx.strokeText(label,x,y+24);ctx.fillStyle='#2a5244';ctx.fillText(label,x,y+24);}
  });
  const start=worldBounds();ctx.strokeStyle='#7b5836';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.strokeRect(start.x*cell,start.y*cell,worldSpan()*cell,worldSpan()*cell);ctx.setLineDash([]);
  const cursor=view.cursor;ctx.strokeStyle='#a84930';ctx.lineWidth=1.5;ctx.strokeRect(cursor.x*cell,cursor.y*cell,cell,cell);
}
function worldAtlasCursor(x,y,announce=false){
  if(!worldAtlasView)return;
  const size=worldAtlasView.size;
  worldAtlasView.cursor={x:Math.max(0,Math.min(size-1,x)),y:Math.max(0,Math.min(size-1,y))};
  const p=worldAtlasView.cursor,t=worldAtlasView.tiles[p.y*size+p.x],out=document.getElementById('world-atlas-hover');
  if(out)out.textContent=`${p.x}, ${p.y} · ${t.hidden?'未发现据点':t.name||Game.terrainTypes[t.type]?.name||'野地'}`;
  if(announce){
    document.getElementById('world-atlas-x').value=p.x;document.getElementById('world-atlas-y').value=p.y;
    document.getElementById('world-atlas-canvas').setAttribute('aria-label',`世界地图光标 ${out?.textContent}，Enter 查看详细地图`);
    worldAtlasPaint();
  }
}
function worldAtlasGo(x,y){
  const size=Game.WORLD_SIZE;
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=size||y>=size){toast(`坐标请输入 0–${size-1} 的整数`);return;}
  const t=worldAtlasRead(x,y);
  if(t.hidden){toast('这里的任务据点尚未发现，请先完成当前任务');return;}
  modal.close();page='world';if(t.id!=='home')selectedNode=t.id;centerWorld(x,y,false);
  document.querySelector('.world-grid-board')?.scrollIntoView({block:'start'});
}
document.addEventListener('click',event=>{
  const canvas=event.target.closest('#world-atlas-canvas');
  if(canvas){const rect=canvas.getBoundingClientRect(),size=Game.WORLD_SIZE;worldAtlasGo(Math.min(size-1,Math.max(0,Math.floor((event.clientX-rect.left)/rect.width*size))),Math.min(size-1,Math.max(0,Math.floor((event.clientY-rect.top)/rect.height*size))));return;}
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  if(button.dataset.action==='worldAtlas')worldAtlasModal();
  if(button.dataset.action==='worldAtlasGo'){
    const p=button.dataset.id?button.dataset.id.split(':').map(Number):[Number(document.getElementById('world-atlas-x').value),Number(document.getElementById('world-atlas-y').value)];
    worldAtlasGo(...p);
  }
});
document.addEventListener('pointermove',event=>{
  const canvas=event.target.closest('#world-atlas-canvas');if(!canvas)return;
  const rect=canvas.getBoundingClientRect(),size=Game.WORLD_SIZE;
  worldAtlasCursor(Math.floor((event.clientX-rect.left)/rect.width*size),Math.floor((event.clientY-rect.top)/rect.height*size));
});
document.addEventListener('keydown',event=>{
  if(event.target.id!=='world-atlas-canvas'||!worldAtlasView)return;
  const p=worldAtlasView.cursor,moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(moves[event.key]){event.preventDefault();const [dx,dy]=moves[event.key];worldAtlasCursor(p.x+dx,p.y+dy,true);}
  if(event.key==='Enter'||event.key===' '){event.preventDefault();worldAtlasGo(p.x,p.y);}
});
document.addEventListener('close',event=>{if(event.target.id==='modal')worldAtlasView=null;},{capture:true});
