'use strict';
// Presentation coordinates only; logical sites, resource fields and world targets stay unchanged.
function scenePoint(column,row){return {x:550+(column-row)*82,y:145+(column+row)*43};}
// Presentation-only inset leaves a continuous lane between buildings and the perimeter.
function sceneCityPoint(column,row){
  const depth=column+row,difference=column-row,nearPalace=depth>=6&&depth<=8&&Math.abs(difference)<=2;
  return {x:550+difference*76+(nearPalace?Math.sign(difference)*30:0),y:185+depth*34+(depth<5?-20:depth>5?16:0)+(nearPalace?28:depth===9?10:0)};
}
const sceneCityGate={x:305,y:490};
function sceneCityBoundary(level=0,front=false){
  const stone=level>0,h=stone?30:17,parts=[];
  const corners=[{x:60,y:350},{x:550,y:95},{x:1040,y:350},{x:550,y:630}];
  const edges=front?[[corners[0],corners[3]],[corners[3],corners[2]]]:[[corners[0],corners[1]],[corners[1],corners[2]]];
  edges.forEach(([a,b],edge)=>{
    const dx=b.x-a.x,slope=(b.y-a.y)/dx,length=Math.abs(dx),origin=dx>0?a:b;
    const gate=front&&edge===0;
    const spans=gate?[[0,200],[290,length]]:[[0,length]];
    const face=stone?(edge===0?'#9c927b':'#817e6c'):'#79674c';
    const blocks=spans.map(([start,end])=>{
      if(!stone){
        const stakes=[];for(let x=start;x<end;x+=13)stakes.push(`<path d="M${x} 0V-${h}l3-4 3 4V0" fill="#8c7654" stroke="#594d39" stroke-width="1"/>`);
        return `${stakes.join('')}<path d="M${start} -6H${end}M${start} -13H${end}" stroke="#ae9568" stroke-width="3"/>`;
      }
      const merlons=[];for(let x=start+2;x<end-12;x+=24)merlons.push(`<path d="M${x} -${h}v-7h13v7" fill="#b8ae91" stroke="#6f6a59" stroke-width="1"/><path d="M${x+1} -${h+7}h11" stroke="#ded3b4" stroke-width="1.5"/>`);
      return `<path d="M${start} 5H${end}" stroke="#494c37" stroke-width="11" opacity=".25"/><path d="M${start} 0V-${h}H${end}V0Z" fill="${face}" stroke="#706c58"/><path d="M${start} 0V-${h}H${end}V0Z" fill="url(#scene-wall-brick)" opacity=".5"/><path d="M${start} -${h}H${end}" stroke="#d3c7a6" stroke-width="5"/><path d="M${start} -3H${end}" stroke="#656653" stroke-width="5"/>${merlons.join('')}`;
    }).join('');
    parts.push(`<g transform="matrix(1 ${slope} 0 1 ${origin.x} ${origin.y})">${blocks}</g>`);
  });
  if(front&&stone){
    const [x,y,w,h]=WebArt.city.regions.gateway;
    parts.push(`<svg x="235" y="380" width="154" height="138" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMax meet"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><image href="${WebArt.city.texture}" width="${WebArt.city.size[0]}" height="${WebArt.city.size[1]}"/></svg></svg>`);
  }else if(front){
    // The gate foundation follows the same front-left wall line, with a real opening.
    parts.push(`<g transform="matrix(1 ${280/490} 0 1 260 ${350+200*280/490})"><path d="M-7 2H98V-65H-7Z" fill="${stone?'#a69b7e':'#876949'}" stroke="#645b46" stroke-width="2"/><path d="M-7 2H98V-65H-7Z" fill="url(#scene-wall-brick)" opacity="${stone?'.4':'0'}"/><path d="M24 2V-29Q45-58 67-29V2" fill="#3d392b" stroke="#cfbea0" stroke-width="5"/><path d="M29 2V-28Q45-49 62-28V2" fill="#6a4932"/><path d="M45 -41V2M34 -29V1M56 -29V1" stroke="#342c24" stroke-width="2"/><path d="M-4 -64V-83H95V-64" fill="#804f35" stroke="#473c2b" stroke-width="2"/><path d="M4 -66V-79H21V-66M32 -66V-79H50V-66M61 -66V-79H79V-66" fill="#332d27" stroke="#bd9060"/><path d="M-17 -83Q10-85 45-102Q73-85 108-83L97-72H-5Z" fill="#5b615c" stroke="#333c37" stroke-width="2"/><path d="M-12 -82L45-95L103-82M-7 -78H99" fill="none" stroke="#acafa0" stroke-width="2"/><path d="M-7 -61H98" stroke="#d6c9a7" stroke-width="4"/></g>`);
  }
  return `<svg class="scene-ground scene-city-boundary ${front?'scene-wall-front':'scene-wall-back'}" viewBox="0 0 1100 660" aria-hidden="true"><defs><pattern id="scene-wall-brick-${front?'front':'back'}" width="30" height="12" patternUnits="userSpaceOnUse"><path d="M0 0H30M0 6H30M8 0V6M23 6V12" stroke="#514f42" stroke-width=".7"/><path d="M0 1H30" stroke="#eee0bc" stroke-width=".6"/></pattern></defs>${parts.join('').replaceAll('url(#scene-wall-brick)',`url(#scene-wall-brick-${front?'front':'back'})`)}</svg>`;
}
function sceneDiamond(x,y,width=156,height=76){return `${x},${y-height/2} ${x+width/2},${y} ${x},${y+height/2} ${x-width/2},${y}`;}
function sceneGroundSVG(rows=6,fields=false){
  if(fields)return sceneFieldLandscape(rows);
  const roads=[];
  // Open sites are uninterrupted soil or grass. Roads are city streets, not plot borders.
  if(!fields){
    roads.push('<path d="M0 660L305 490 550 355 785 250"/><path d="M300 250L550 355 790 465"/>');
  }
  const stageHeight=fields?390+rows*43:660;
  return `<svg class="scene-ground" viewBox="0 0 1100 ${stageHeight}" aria-hidden="true"><polygon points="60,350 550,95 1040,350 550,630" fill="#c6ba92" opacity=".18"/><g fill="none" stroke="#d2c3a1" stroke-width="15" stroke-linecap="round" stroke-linejoin="round">${roads.join('')}</g><g fill="none" stroke="#8d8164" stroke-width="1" opacity=".35">${roads.join('')}</g></svg>`;
}
function scenePosition(point,width=160,height=146,stageHeight=660){return `left:${(point.x/11).toFixed(3)}%;top:${((point.y-height+22)*100/stageHeight).toFixed(3)}%;width:${(width/11).toFixed(3)}%;height:${(height*100/stageHeight).toFixed(3)}%;--scene-depth:${Math.round(point.y)};`;}
function sceneCaption(point,name,level,stageHeight=660,yieldText='',options={}){
  return `<span class="scene-name-tag ${options.city?'scene-city-caption':''} ${options.hall?'scene-hall-caption':''}" aria-hidden="true" style="left:${point.x/11}%;top:${(point.y+12)*100/stageHeight}%">${esc(name)}<em>${level}</em>${options.queue?`<span class="scene-caption-queue"> · ${clock(options.queue.end)}</span>`:''}${yieldText?`<small>${esc(yieldText)}</small>`:''}</span>`;
}
function sceneFocusButton(){return btn(document.body.classList.contains('scene-focus')?'返回常规':'全景','sceneFocus','','small secondary');}
function webCityScene(){
  const s=S(),hallPoints=s.cityLayout.map((id,i)=>(id==='hall'||id==='reserved')?{column:i%6,row:Math.floor(i/6)}:null).filter(Boolean);
  const wallSite=s.cityLayout.indexOf('wall'),wallLevel=wallSite<0?0:s.cityLevels[wallSite];
  const hallCenter=hallPoints.length?sceneCityPoint(hallPoints.reduce((n,p)=>n+p.column,0)/hallPoints.length,hallPoints.reduce((n,p)=>n+p.row,0)/hallPoints.length):null;
  const captions=[];
  const sites=s.cityLayout.map((id,i)=>{
    if(id==='reserved')return '';
    const b=id?Game.buildings[id]:null,q=s.buildQueue.find(q=>q.site===i),lv=s.cityLevels[i],isWall=id==='wall',p=isWall?sceneCityGate:id==='hall'&&hallCenter?hallCenter:sceneCityPoint(i%6,Math.floor(i/6)),isHall=id==='hall';
    if(isHall)captions.push(sceneCaption({x:p.x,y:p.y+86},b.name,lv,660,'',{city:true,hall:true,queue:q}));
    const caption=b&&!isHall?`<span class="scene-name-tag scene-city-caption scene-inline-caption" aria-hidden="true">${esc(b.name)}<em>${lv}</em>${q?`<span class="scene-caption-queue"> · ${clock(q.end)}</span>`:''}</span>`:'';
    const art=b&&!isWall?`<span class="scene-contact-shadow" aria-hidden="true"></span><span class="city-building-art">${webCityBuildingArt(id,lv)}</span>`:'';
    return `<button class="city-grid-tile scene-site ${b?'built-city':'empty-city'} ${isHall?'scene-hall':''} ${isWall?'scene-wall-control':''} ${q?'working':''}" style="${scenePosition(isHall?{x:p.x,y:p.y+64}:p,isHall?328:isWall?130:b?118:120,isHall?280:isWall?130:b?106:50)}" data-action="${b?'building':'citySlot'}" data-id="${b?'site:'+i:i}" title="${b?b.name+' · '+lv+'级'+(q?' · 营造中':''):'空地 · 点击建造'}" aria-label="${isWall?'城门处 · ':''}城内 ${Math.floor(i/6)+1}行${i%6+1}列 ${b?b.name+' '+lv+'级'+(q?'，营造中':''):'空地，可建造'}">${art}${b?`<strong>${b.name}<em>${lv}</em></strong>`:''}${caption}${q?sceneConstructionMark():''}${q&&!b?`<small class="scene-construction">营造 · ${clock(q.end)}</small>`:''}</button>`;
  }).join('');
  const plaza=hallCenter?`<svg class="scene-ground scene-courtyard" viewBox="0 0 1100 660" aria-hidden="true"><defs><pattern id="scene-courtyard-stone" width="32" height="18" patternUnits="userSpaceOnUse"><rect width="32" height="18" fill="#c5bea5"/><path d="M0 0H32M0 9H32M8 0V9M24 9V18" stroke="#a49d87" stroke-width=".6"/><path d="M0 1H32" stroke="#e6ddc4" stroke-width=".6"/></pattern></defs><polygon points="${sceneDiamond(hallCenter.x,hallCenter.y+4,338,180)}" fill="#716e53" opacity=".25"/><polygon points="${sceneDiamond(hallCenter.x,hallCenter.y,328,172)}" fill="url(#scene-courtyard-stone)" stroke="#a49a7a" stroke-width="2"/><polygon points="${sceneDiamond(hallCenter.x,hallCenter.y,316,160)}" fill="none" stroke="#e9dec1" stroke-width="2"/></svg>`:'';
  return `<section class="city-grid-board manual-city scene-board"><div class="outskirts-banner"><span class="outskirts-title">${esc(activeCityMeta().name)} · 城坊</span><span class="label">点击建筑办理城务 · 点击空地建设</span>${sceneFocusButton()}</div><div class="scene-scroll"><div class="city-grid scene-stage">${sceneGroundSVG()}${sceneCityBoundary(wallLevel)}${plaza}${sites}${captions.join('')}${sceneCityBoundary(wallLevel,true)}</div></div><p class="outskirts-note">${wallLevel>0?'城门处办理城墙升级与城防':'尚未修筑城墙 · 木栅仅为城坊边界'} · 官府院落占四格 <span class="scene-touch-hint">· 横向滑动查看城坊</span></p></section>`;
}
function sceneFieldPoint(index,rows){const p=scenePoint(index%6,Math.floor(index/6));return {x:p.x+(rows-6)*41,y:p.y+50};}
function webOutskirtsScene(){
  const s=S(),unlocked=Game.unlockedPlots(),rows=Math.max(3,Math.ceil(unlocked/6)),stageHeight=390+rows*43,template=s.plotTemplate?.id?Game.plotTemplateQuote(s.plotTemplate.id,s.plotTemplate.mode):null;
  const fresh=sceneObservePlotCapacity(Game.currentCityId(),unlocked),emptyCount=s.plots.slice(0,unlocked).filter((p,index)=>!p.type&&!Game.plotJob(index)).length;
  const sites=s.plots.slice(0,unlocked).map((p,index)=>{
    const job=Game.plotJob(index),point=sceneFieldPoint(index,Math.ceil(unlocked/6)),name=p.type?Game.buildings[p.type].name:job?'营造中的'+Game.buildings[job.id].name:'可建造空地',target=template?.targets[index],hint=target?'样板：'+Game.buildings[target].name:'';
    const isFresh=!p.type&&!job&&fresh&&index>=fresh.start&&index<fresh.end;
    const outputText=p.type?' · '+Game.resources[Game.plotTypes[p.type].resource].name+' +'+Math.round(Game.plotYield(p)*60)+'/时':'';
    const caption=p.type?`<span class="scene-name-tag scene-field-caption scene-field-inline" aria-hidden="true">${name}<em>${p.level}</em><span class="scene-field-production">${Game.resources[Game.plotTypes[p.type].resource].name} +${Math.round(Game.plotYield(p)*60)}/时</span></span>`:'';
    return `<button class="plot-tile scene-site ${p.type?'built-field '+p.type:'empty-land'} ${job?'working':''} ${isFresh?'scene-new-plot':''}" style="${scenePosition(point,p.type?148:120,p.type?126:64,stageHeight)}" data-action="plot" data-id="${index}" title="${isFresh?'新开放 · ':''}${index+1}号田地 · ${name}${outputText}${hint?' · '+hint:''}" aria-label="${isFresh?'新开放 · ':''}${index+1}号地块 ${name}${p.type?' '+p.level+'级':''}${outputText}">${p.type?`<span class="web-resource-art">${sceneResourceArt(p.type)}</span><strong>${name}<em>${p.level}</em></strong><small class="scene-field-yield">${Game.resources[Game.plotTypes[p.type].resource].name} +${Math.round(Game.plotYield(p)*60)}/时</small><span class="scene-field-tier" aria-hidden="true">${{farm:'粮',lumber:'木',quarry:'石',mine:'铁'}[p.type]} ${p.level}</span>${caption}`:(!job?sceneEmptyPlotMarker(index,isFresh):'')}${job?sceneConstructionMark():''}${job&&!p.type?`<small class="scene-construction">营造 · ${clock(job.end)}</small>`:''}</button>`;
  }).join('');
  return `<section class="outskirts-board scene-board"><div class="outskirts-banner"><span class="outskirts-title">${esc(activeCityMeta().name)} · 城外田庄</span><span class="label">已开放 ${unlocked} 块 · 粮／木／石／铁自由搭配</span>${sceneFocusButton()}</div><div class="scene-style-bar">${sceneEmptyPlotControls(emptyCount)}${sceneStyleChooser()}</div><div class="scene-scroll"><div class="plot-grid scene-stage scene-fields ${sceneShowEmpty()?'show-empty-plots':''}" data-field-style="${sceneFieldStyle}" style="--scene-height:${stageHeight}">${sceneGroundSVG(rows,true)}${sceneFieldRoads(s.plots.slice(0,unlocked),Math.ceil(unlocked/6),stageHeight)}${sites}</div></div>${unlocked<Game.PLOT_COUNT?`<button class="scene-expansion" data-action="plot" data-id="${unlocked}"><span class="scene-expansion-icon">拓</span><span><strong>待开垦区域</strong><small>官府 ${Math.floor((unlocked-12)/3)+2} 级再开放 3 块田地 · 尚有 ${Game.PLOT_COUNT-unlocked} 块</small></span><span aria-hidden="true">›</span></button>`:''}<div class="outskirts-note">${SceneStyles[sceneFieldStyle].description} 点击资源田查看产量与升级收益 · 查看空地可显示建设位置 <span class="scene-touch-hint">· 横向滑动查看田庄</span></div></section>`;
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
