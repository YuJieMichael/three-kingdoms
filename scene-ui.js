'use strict';
// Presentation coordinates only; logical sites, resource fields and world targets stay unchanged.
function scenePoint(column,row){return {x:550+(column-row)*82,y:145+(column+row)*43};}
function sceneDiamond(x,y,width=156,height=76){return `${x},${y-height/2} ${x+width/2},${y} ${x},${y+height/2} ${x-width/2},${y}`;}
function sceneGroundSVG(rows=6,fields=false){
  const roads=[],plots=[];
  for(let row=0;row<rows;row++)for(let col=0;col<6;col++){
    const p=scenePoint(col,row),tone=(col+row)%3;
    plots.push(`<polygon points="${sceneDiamond(p.x,p.y)}" fill="${fields?['#8b9361','#929867','#858e5c'][tone]:['#b0a280','#bcad89','#a99f80'][tone]}" stroke="${fields?'#697644':'#8a805f'}" stroke-width="1"/>`);
  }
  for(let i=0;i<=6;i++){
    const a=scenePoint(i-.5,-.5),b=scenePoint(i-.5,rows-.5);
    roads.push(`<path d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`);
  }
  for(let i=0;i<=rows;i++){
    const a=scenePoint(-.5,i-.5),b=scenePoint(5.5,i-.5);
    roads.push(`<path d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`);
  }
  const stageHeight=fields?390+rows*43:720;
  return `<svg class="scene-ground" viewBox="0 0 1100 ${stageHeight}" aria-hidden="true"><defs><pattern id="scene-soil" width="360" height="360" patternUnits="userSpaceOnUse"><image href="${WebArt.city.ground.texture}" width="360" height="360"/></pattern></defs><rect width="1100" height="720" fill="${fields?'#768450':'#8b9368'}"/><rect width="1100" height="720" fill="url(#scene-soil)" opacity="${fields?'.22':'.4'}"/><ellipse cx="550" cy="340" rx="500" ry="295" fill="${fields?'#8c9861':'#8b946c'}" opacity=".27"/>${plots.join('')}<g fill="none" stroke="${fields?'#b9ad7b':'#d2c3a1'}" stroke-width="${fields?'7':'12'}" stroke-linecap="round">${roads.join('')}</g><g fill="none" stroke="${fields?'#d1c18c':'#8d8164'}" stroke-width="1" opacity=".55">${roads.join('')}</g>${!fields?`<path d="M58 374L550 632 1042 374" fill="none" stroke="#4b5642" stroke-width="18"/><path d="M58 360L550 618 1042 360" fill="none" stroke="#a09e7f" stroke-width="16"/><path d="M58 352L550 610 1042 352" fill="none" stroke="#d2c8a3" stroke-width="4"/>`:''}</svg>`;
}
function scenePosition(point,width=160,height=146,stageHeight=720){return `left:${(point.x/11).toFixed(3)}%;top:${((point.y-height+22)*100/stageHeight).toFixed(3)}%;width:${(width/11).toFixed(3)}%;height:${(height*100/stageHeight).toFixed(3)}%;--scene-depth:${Math.round(point.y)};`;}
function sceneCaption(point,name,level,stageHeight=720,yieldText=''){
  return `<span class="scene-name-tag" aria-hidden="true" style="left:${point.x/11}%;top:${(point.y+12)*100/stageHeight}%">${esc(name)}<em>${level}</em>${yieldText?`<small>${esc(yieldText)}</small>`:''}</span>`;
}
function sceneFocusButton(){return btn(document.body.classList.contains('scene-focus')?'返回常规':'全景','sceneFocus','','small secondary');}
function webCityScene(){
  const s=S(),hallPoints=s.cityLayout.map((id,i)=>(id==='hall'||id==='reserved')?scenePoint(i%6,Math.floor(i/6)):null).filter(Boolean);
  const hallCenter=hallPoints.length?{x:hallPoints.reduce((n,p)=>n+p.x,0)/hallPoints.length,y:hallPoints.reduce((n,p)=>n+p.y,0)/hallPoints.length}:null;
  const captions=[];
  const sites=s.cityLayout.map((id,i)=>{
    if(id==='reserved')return '';
    const b=id?Game.buildings[id]:null,q=s.buildQueue.find(q=>q.site===i),lv=s.cityLevels[i],p=id==='hall'&&hallCenter?hallCenter:scenePoint(i%6,Math.floor(i/6)),isHall=id==='hall';
    if(b)captions.push(sceneCaption(p,b.name,lv));
    const art=b?`<span class="city-building-art">${webCityBuildingArt(id,lv)}</span>`:'<span class="scene-build-marker" aria-hidden="true">＋</span>';
    return `<button class="city-grid-tile scene-site ${b?'built-city':'empty-city'} ${isHall?'scene-hall':''} ${q?'working':''}" style="${scenePosition(p,isHall?235:b?138:120,isHall?183:b?120:50)}" data-action="${b?'building':'citySlot'}" data-id="${b?'site:'+i:i}" title="${b?b.name+' · '+lv+'级':'空地 · 点击建造'}" aria-label="城内 ${Math.floor(i/6)+1}行${i%6+1}列 ${b?b.name+' '+lv+'级':'空地，可建造'}">${art}${b?`<strong>${b.name}<em>${lv}</em></strong>`:'<strong class="scene-empty-caption">建造</strong>'}${q?`<small class="scene-construction">营造 · ${clock(q.end)}</small>`:''}</button>`;
  }).join('');
  const plaza=hallCenter?`<svg class="scene-ground scene-courtyard" viewBox="0 0 1100 720" aria-hidden="true"><polygon points="${sceneDiamond(hallCenter.x,hallCenter.y,316,160)}" fill="#c4b995" stroke="#746e52" stroke-width="3"/><polygon points="${sceneDiamond(hallCenter.x,hallCenter.y,276,138)}" fill="none" stroke="#e2d4ae" stroke-width="2"/></svg>`:'';
  return `<section class="city-grid-board manual-city scene-board"><div class="outskirts-banner"><span class="outskirts-title">${esc(activeCityMeta().name)} · 城坊</span><span class="label">点击建筑办理城务 · 点击空地建设</span>${sceneFocusButton()}</div><div class="scene-scroll"><div class="city-grid scene-stage">${sceneGroundSVG()}${plaza}${sites}${captions.join('')}<span class="scene-place-label scene-south-gate">南门</span></div></div><p class="outskirts-note">官府院落占四格 · 民房、军营、仓库可重复建设 <span class="scene-touch-hint">· 横向滑动查看城坊</span></p></section>`;
}
function sceneResourceParcel(type){
  const crops=type==='farm'?Array.from({length:6},(_,i)=>`<path d="M${20+i*10} ${55-i*5}l52 26" stroke="${i%2?'#c5b366':'#67753b'}" stroke-width="5"/>`).join(''):'';
  return `<svg class="scene-resource-parcel" viewBox="0 0 160 86" aria-hidden="true"><polygon points="80,3 156,43 80,83 4,43" fill="${{farm:'#9b9457',lumber:'#6f8050',quarry:'#a39f8d',mine:'#8b8b79'}[type]||'#a49a74'}" stroke="#686e49"/>${crops}</svg>`;
}
function webOutskirtsScene(){
  const s=S(),unlocked=Game.unlockedPlots(),rows=Math.max(3,Math.ceil(unlocked/6)),stageHeight=390+rows*43,template=s.plotTemplate?.id?Game.plotTemplateQuote(s.plotTemplate.id,s.plotTemplate.mode):null;
  const captions=[];
  const sites=s.plots.slice(0,unlocked).map((p,index)=>{
    const job=Game.plotJob(index),point=scenePoint(index%6,Math.floor(index/6)),name=p.type?Game.buildings[p.type].name:'可建造空地',target=template?.targets[index],hint=target?'样板：'+Game.buildings[target].name:'';
    if(p.type)captions.push(sceneCaption(point,name,p.level,stageHeight,Game.resources[Game.plotTypes[p.type].resource].name+' +'+Math.round(Game.plotYield(p)*60)+'/时'));
    return `<button class="plot-tile scene-site ${p.type?'built-field '+p.type:'empty-land'} ${job?'working':''}" style="${scenePosition(point,p.type?148:120,p.type?126:50,stageHeight)}" data-action="plot" data-id="${index}" title="${index+1}号田地 · ${name}${hint?' · '+hint:''}" aria-label="${index+1}号地块 ${name}${p.type?' '+p.level+'级':''}">${p.type?`${sceneResourceParcel(p.type)}<span class="web-resource-art">${buildingIcon(p.type,'web-resource-sprite')}</span><strong>${name}<em>${p.level}</em></strong><small class="scene-field-yield">${Game.resources[Game.plotTypes[p.type].resource].name} +${Math.round(Game.plotYield(p)*60)}/时</small>`:'<span class="scene-build-marker" aria-hidden="true">＋</span><strong class="scene-empty-caption">建造</strong>'}${job?`<small class="scene-construction">营造 · ${clock(job.end)}</small>`:''}</button>`;
  }).join('');
  return `<section class="outskirts-board scene-board"><div class="outskirts-banner"><span class="outskirts-title">${esc(activeCityMeta().name)} · 城外田庄</span><span class="label">已开放 ${unlocked} 块 · 粮／木／石／铁自由搭配</span>${sceneFocusButton()}</div><div class="scene-scroll"><div class="plot-grid scene-stage scene-fields" style="--scene-height:${stageHeight}">${sceneGroundSVG(rows,true)}${sites}${captions.join('')}</div></div>${unlocked<Game.PLOT_COUNT?`<button class="scene-expansion" data-action="plot" data-id="${unlocked}"><span class="scene-expansion-icon">拓</span><span><strong>待开垦区域</strong><small>官府 ${Math.floor((unlocked-12)/3)+2} 级再开放 3 块田地 · 尚有 ${Game.PLOT_COUNT-unlocked} 块</small></span><span aria-hidden="true">›</span></button>`:''}<div class="outskirts-note">点击资源田查看产量与升级收益 <span class="scene-touch-hint">· 横向滑动查看田庄</span></div></section>`;
}
document.addEventListener('click',event=>{
  if(event.target.closest('[data-action="sceneFocus"]')){
    document.body.classList.toggle('scene-focus');render();
    const main=document.getElementById('main');if(main)main.scrollTop=0;
  }
});
function webWorldGroundSVG(start,span,read){
  const patches=[],water=[],roads=[],colors={plain:'#a0a371',grass:'#87995f',forest:'#5d784d',mountain:'#8c927c',hill:'#aca37a',lake:'#759f9e',swamp:'#708e78',camp:'#b1a17a',fort:'#b3a780'};
  // Paint a border too, so panning does not change the appearance of an existing coordinate.
  for(let row=-1;row<=span;row++)for(let col=-1;col<=span;col++){
    const t=read(start.x+col,start.y+row);if(!t)continue;
    const seed=landscapeSeed(t.x,t.y),x=col*100,y=row*100;
    patches.push(`<path d="M${x-18} ${y+12}Q${x+36} ${y-19} ${x+92} ${y+7}Q${x+129} ${y+47} ${x+102} ${y+101}Q${x+52} ${y+122} ${x-8} ${y+98}Z" fill="${colors[t.type]||colors.plain}"/>`);
    if(t.type==='lake'||t.type==='swamp'){
      water.push(`<ellipse cx="${x+50}" cy="${y+55}" rx="45" ry="32" fill="${t.type==='lake'?'#719c9c':'#5f887b'}" opacity=".65"/><path d="M${x+13} ${y+57}q20-6 40 0t34 0M${x+23} ${y+72}q18-5 42 0" fill="none" stroke="#c1d3ba" stroke-width="1.3" opacity=".45"/>`);
      for(const [dx,dy] of [[1,0],[0,1]]){const next=read(t.x+dx,t.y+dy);if(next&&['lake','swamp'].includes(next.type))water.push(`<path d="M${x+50} ${y+55}Q${x+50+dx*55-dy*12} ${y+55+dy*48+dx*12} ${x+50+dx*100} ${y+55+dy*100}" stroke="#749c93" stroke-width="30" stroke-linecap="round" fill="none"/>`);}
    }
    if(t.type==='plain'||t.type==='grass')for(let n=0;n<3;n++){
      const tx=x+12+(seed+n*27)%75,ty=y+20+((seed>>>8)+n*33)%66;
      water.push(`<path d="M${tx} ${ty}l2-5 2 5m3 1 2-4" stroke="#556e3d" stroke-width="1.2" opacity=".45" fill="none"/>`);
    }
  }
  const targets=['field','home','wood','camp','mine','pass','home','fort'].map(id=>id==='home'?Game.home:Game.landmarkVisible(id)?Game.getNode(id):null);
  for(let i=1;i<targets.length;i++){
    const a=targets[i-1],b=targets[i];if(!a||!b)continue;
    roads.push(`<path d="M${(a.x-start.x+.5)*100} ${(a.y-start.y+.5)*100}L${(b.x-start.x+.5)*100} ${(b.y-start.y+.5)*100}"/>`);
  }
  return `<svg class="web-world-ground" viewBox="0 0 ${span*100} ${span*100}" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="web-ground-blend"><feGaussianBlur stdDeviation="13"/></filter><pattern id="web-ground-texture" x="${-start.x*100}" y="${-start.y*100}" width="300" height="300" patternUnits="userSpaceOnUse"><image href="${WebArt.city.ground.texture}" width="300" height="300"/></pattern></defs><rect width="100%" height="100%" fill="#939e6d"/><g filter="url(#web-ground-blend)">${patches.join('')}</g><rect width="100%" height="100%" fill="url(#web-ground-texture)" opacity=".19"/>${water.join('')}<g fill="none" stroke="#d3c39b" stroke-width="4" opacity=".7">${roads.join('')}</g><g fill="none" stroke="#908463" stroke-width=".7" opacity=".7">${roads.join('')}</g></svg>`;
}
