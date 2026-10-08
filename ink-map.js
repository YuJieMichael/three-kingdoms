'use strict';
// One coordinate-anchored painting. No terrain sprites or per-cell island bases.
const InkMapArt={paper:'#e9e2cc',ink:'#334943',water:'#88a5a5',forest:'#809782',earth:'#b3ae8d'};
function inkMapRandom(seed,salt){return ((Math.imul(seed^Math.imul(salt+1,2654435761),1597334677)>>>0)%10000)/10000;}
function inkMapWash(cx,cy,rx,ry,seed){
  const points=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,r=.86+inkMapRandom(seed,i)*.25;return {x:cx+Math.cos(a)*rx*r,y:cy+Math.sin(a)*ry*r};});
  const mid=(a,b)=>`${((a.x+b.x)/2).toFixed(1)} ${((a.y+b.y)/2).toFixed(1)}`;
  let path='M'+mid(points[7],points[0]);
  for(let i=0;i<8;i++)path+=`Q${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mid(points[i],points[(i+1)%8])}`;
  return path+'Z';
}
function inkMapBridge(ax,ay,bx,by,width){
  const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy),nx=-dy/length*width,ny=dx/length*width;
  return `M${ax+nx} ${ay+ny}Q${(ax+bx)/2+nx*.7} ${(ay+by)/2+ny*.7} ${bx+nx} ${by+ny}L${bx-nx} ${by-ny}Q${(ax+bx)/2-nx*.7} ${(ay+by)/2-ny*.7} ${ax-nx} ${ay-ny}Z`;
}
function inkMapPine(x,y,height,seed){
  const lean=(inkMapRandom(seed,8)-.5)*9,branches=[],foliage=[];
  for(let i=0;i<7;i++){
    const y0=-height+i*height*.115,width=height*(.08+i*.036),r=inkMapRandom(seed,i),drift=(r-.5)*height*.025;
    branches.push(`<path d="M${lean*(1-i/8)} ${y0}q${-width*.46} ${height*.045} ${-width} ${height*(.025+r*.04)}m${width} ${-height*(.025+r*.04)}q${width*.48} ${height*.02} ${width*.9} ${height*.018}" stroke-width="${.6+height*.009}"/>`);
    for(const side of [-1,1]){
      const fx=side*width*.72,fy=y0+height*.035+drift;
      foliage.push(`<path d="M${fx-side*width*.3} ${fy+2}q${side*width*.2} -4 ${side*width*.31} -1q${side*width*.1} -2 ${side*width*.22} 1q${side*width*.11} 0 ${side*width*.23} 3" stroke-width="${1+height*.022}" opacity="${.50+r*.30}"/><path d="M${fx} ${fy-2}l${side*3} -2m${side*2} 3 ${side*3} -2" stroke-width=".65"/>`);
    }
  }
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="#405e4d" stroke-linecap="round" opacity="${(.56+inkMapRandom(seed,9)*.28).toFixed(2)}"><g class="ink-pine-body"><path d="M0 4Q${-lean*.4} ${-height*.3} ${lean} ${-height}" stroke="#4c584a" stroke-width="1.1"/>${branches.join('')}${foliage.join('')}</g></g>`;
}
function inkMapMountain(x,y,height,seed){
  const lean=(inkMapRandom(seed,2)-.5)*26,w=40+inkMapRandom(seed,3)*19,peak=lean-8,marks=[];
  const silhouette=`M${-w-25} 19Q${-w} 6 ${-w*.72} ${-height*.38}L${-w*.48} ${-height*.43}Q${-w*.38} ${-height*.6} ${peak-14} ${-height*.75}L${peak-7} ${-height*.83}L${peak} ${-height}L${peak+7} ${-height*.91}L${peak+17} ${-height*.89}Q${w*.45} ${-height*.51} ${w*.58} ${-height*.36}L${w*.75} ${-height*.28}Q${w+7} 5 ${w+30} 22Q0 36 ${-w-25} 19Z`;
  for(let i=0;i<9;i++){
    const mx=peak-17+i*5,my=-height*.75+i*height*.07,len=height*(.12+inkMapRandom(seed,i+20)*.22);
    marks.push(`<path d="M${mx} ${my}l${-5-inkMapRandom(seed,i)*5} ${len*.35} 4 ${len*.2} -8 ${len*.35}" opacity="${.22+inkMapRandom(seed,i+5)*.18}"/>`);
  }
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="ink-mountain-body"><path d="${silhouette}" transform="translate(19 -8) scale(.86 .92)" fill="#84988f" opacity=".25"/><path d="${silhouette}" fill="url(#ink-mountain-wash)"/><path d="${silhouette.split('Q0 36')[0]}" fill="none" stroke="#52685f" stroke-opacity=".5" stroke-width="1" stroke-linejoin="round"/><path d="M${peak} ${-height}Q${peak-4} ${-height*.67} ${peak+8} ${-height*.43}L${peak+3} ${-height*.21}" fill="none" stroke="#405b53" stroke-opacity=".43" stroke-width="1.5"/><g fill="none" stroke="#4e665b" stroke-width=".8">${marks.join('')}</g><ellipse cx="4" cy="22" rx="${w+34}" ry="19" fill="url(#ink-foot-mist)"/>${inkMapPine(-w*.62,10,17,seed+5)}${inkMapPine(w*.64,17,13,seed+9)}</g></g>`;
}
function inkWorldSiteArt(tile){
  if(tile.hidden||tile.wild)return '';
  const city=tile.id==='home'||tile.type==='fort'||Game.isCity(tile),owned=tile.id==='home'||!!S().conquered[tile.id],flag=owned?'#4c7770':tile.faction==='yellow_turban'?'#aa8a3f':'#a6654d';
  const cityBody='<path d="M11 44L45 32 79 44V64L46 79 11 65Z" fill="#d8cfb3" stroke="#606957"/><path d="M11 44L46 58 79 44M46 58V78" fill="none" stroke="#7b7b66"/><path d="M15 41v8m13-14v8m12-13v8m14-7v8m13-4v8m10-3v8" stroke="#687264" stroke-width="4"/><path d="M36 75V62q9-14 19 0v13" fill="#53665c"/><path d="M29 30h33v22H29Z" fill="#d9d0b4"/><path d="M21 32Q34 28 44 17Q57 28 69 31L62 36H29Z" fill="#566c60"/><path d="M20 32Q43 35 69 31M35 41h5m10 0h5" fill="none" stroke="#384e47"/>';
  const campBody='<path d="M19 58L46 31 72 57H19Z" fill="#c3b899" stroke="#6f7460"/><path d="M46 33v25m-8 0 8-18 9 18" fill="#667360" stroke="#737864"/><path d="M16 61q29 7 60-2M26 65l-7 6m43-6 9 5" fill="none" stroke="#7c8069" stroke-width="1"/>';
  return `<svg class="ink-site-art" viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="47" cy="76" rx="36" ry="8" fill="#899680" opacity=".15"/>${city?cityBody:campBody}<path d="M78 17v35" stroke="#596756" stroke-width="1.5"/><path d="M79 17q10-5 17 1l-4 13q-7-6-13-2Z" fill="${flag}" opacity=".9"/><path d="M79 18l11 1" stroke="#f1dfb6" stroke-width=".8"/></svg>`;
}
function inkWorldGroundSVG(start,span,read){
  const originX=start.x*100,originY=start.y*100,size=span*100,washes={lake:[],swamp:[],forest:[],hill:[],grass:[]},waterLines=[],ridges=[],details=[],mist=[];
  const group=t=>t?.type==='lake'?'lake':t?.type==='swamp'?'swamp':t?.type==='forest'?'forest':['mountain','hill'].includes(t?.type)?'hill':t?.type==='grass'?'grass':null;
  // A two-cell border stabilizes brushwork and connections when the viewport is panned.
  for(let y=start.y-2;y<=start.y+span+1;y++)for(let x=start.x-2;x<=start.x+span+1;x++){
    const t=read(x,y);if(!t)continue;
    const seed=worldLandscapeSeed(x,y),cx=x*100+50,cy=y*100+56,g=group(t),r=n=>inkMapRandom(seed,n);
    if(g){
      const rx=g==='hill'?83:g==='forest'?71:g==='grass'?90:53,ry=g==='hill'?49:g==='forest'?52:g==='grass'?61:39;
      washes[g].push(inkMapWash(cx+(r(1)-.5)*10,cy,rx,ry,seed));
      for(const [dx,dy] of [[1,0],[0,1],[1,1]])if(group(read(x+dx,y+dy))===g&&(dx!==dy||g==='lake'||g==='swamp'))washes[g].push(inkMapBridge(cx,cy,cx+dx*100,cy+dy*100,dx===dy?12:g==='lake'||g==='swamp'?29:39));
    }
    if(t.type==='mountain'){
      for(const [dx,dy] of [[1,0],[0,1]])if(['mountain','hill'].includes(read(x+dx,y+dy)?.type)){
        ridges.push(`<path d="M${cx} ${cy-24}Q${cx+dx*40-dy*21} ${cy+dy*40-31} ${cx+dx*100} ${cy+dy*100-22}" fill="none" stroke="#799083" stroke-width="24" stroke-linecap="round" opacity=".18"/>`);
      }
      details.push({y:cy,html:inkMapMountain(cx+(r(4)-.5)*12,cy+15,63+r(5)*43,seed)});
    }else if(t.type==='hill'){
      const h=17+r(6)*23;
      details.push({y:cy,html:`<path d="M${cx-65} ${cy+13}Q${cx-18} ${cy-h-28} ${cx+61} ${cy+13}Q${cx+12} ${cy+29} ${cx-65} ${cy+13}Z" fill="#96a78b" opacity=".23"/><path d="M${cx-62} ${cy+10}Q${cx-6} ${cy-h} ${cx+58} ${cy+9}" fill="none" stroke="#6c8067" stroke-width="1.2" opacity=".5"/>${inkMapPine(cx-15,cy+4,15,seed)}`});
    }else if(t.type==='forest'){
      for(let i=0;i<5;i++)details.push({y:cy-15+r(i+30)*47,html:inkMapPine(cx-42+r(i+10)*85,cy-15+r(i+30)*47,22+r(i+40)*28,seed+i*17)});
    }else if(t.type==='lake'||t.type==='swamp'){
      for(let i=0;i<3;i++){
        const wx=cx-36+r(i+51)*16,wy=cy-18+i*16,len=36+r(i+54)*23;
        waterLines.push(`<path d="M${wx} ${wy}q${len*.24} -3 ${len*.5} 0t${len*.5} 0" fill="none" stroke="#657f83" stroke-width=".8" opacity=".42"/>`);
      }
      if(t.type==='swamp')for(let i=0;i<3;i++){
        const bx=cx-27+r(i+62)*54,by=cy+11+r(i+68)*15;
        details.push({y:by,html:`<path d="M${bx} ${by}q-3-9 0-18m0 12-7-6m7 10 6-9" stroke="#798569" fill="none" stroke-width="1"/>`});
      }
    }else if(t.wild){
      const gx=cx-26+r(71)*51,gy=cy-8+r(72)*24;
      details.push({y:gy,html:`<path d="M${gx} ${gy}l3-5 2 5m12 7 2-4 2 3" fill="none" stroke="#8b9574" stroke-width=".7" opacity=".55"/>`});
    }
    if(t.type==='mountain'||t.type==='hill')mist.push(`<ellipse cx="${cx}" cy="${cy+36}" rx="75" ry="12" fill="#eeead9" opacity=".28"/>`);
  }
  const roads=[],stops=['field','home','wood','camp','mine','pass','home','fort'].map(id=>id==='home'?Game.home:Game.landmarkVisible(id)?Game.getNode(id):null);
  for(let i=1;i<stops.length;i++){
    const a=stops[i-1],b=stops[i];if(!a||!b)continue;
    const ax=(a.x+.5)*100,ay=(a.y+.5)*100,bx=(b.x+.5)*100,by=(b.y+.5)*100,dx=bx-ax,dy=by-ay,seed=worldLandscapeSeed(a.x+b.x,a.y+b.y),bend=(inkMapRandom(seed,1)-.5)*Math.min(75,Math.hypot(dx,dy)*.18);
    roads.push(`<path d="M${ax} ${ay}C${ax+dx*.32-dy*.06} ${ay+dy*.32+bend} ${ax+dx*.68+dy*.04} ${ay+dy*.68-bend} ${bx} ${by}"/>`);
  }
  details.sort((a,b)=>a.y-b.y);
  const region=(id,fill,opacity,blur)=>`<g fill="${fill}" opacity="${opacity}" ${blur?'filter="url(#ink-wash-soft)"':''}><path d="${washes[id].join('')}"/></g>`;
  return `<svg class="web-world-ground ink-world-ground" viewBox="${originX} ${originY} ${size} ${size}" preserveAspectRatio="none" aria-hidden="true"><defs>
    <filter id="ink-wash-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="ink-paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <pattern id="ink-paper" width="180" height="180" patternUnits="userSpaceOnUse"><rect width="180" height="180" filter="url(#ink-paper-grain)" opacity=".1"/></pattern>
    <linearGradient id="ink-mountain-wash" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#4d6c63" stop-opacity=".75"/><stop offset=".58" stop-color="#7d978b" stop-opacity=".62"/><stop offset="1" stop-color="#b9c4ab" stop-opacity=".1"/></linearGradient>
    <radialGradient id="ink-foot-mist"><stop stop-color="#e8e5d1" stop-opacity=".9"/><stop offset="1" stop-color="#e8e5d1" stop-opacity="0"/></radialGradient>
    </defs><rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="${InkMapArt.paper}"/>
    ${region('grass','#9cac89','.22',true)}${region('hill','#91a28a','.25',true)}${region('forest','#7e9880','.27',true)}${region('swamp','#8b9f8f','.35',true)}${region('lake','#8eaeb0','.54',true)}
    <g fill="none" stroke="#aca180" stroke-width="2.2" stroke-dasharray="2 6" stroke-linecap="round" opacity=".52">${roads.join('')}</g>
    ${ridges.join('')}${waterLines.join('')}${details.map(d=>d.html).join('')}<g filter="url(#ink-wash-soft)">${mist.join('')}</g>
    <rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="url(#ink-paper)" style="mix-blend-mode:multiply"/>
    </svg>`;
}
webWorldGroundSVG=inkWorldGroundSVG;
webTerrainArt=inkWorldSiteArt;
function installInkMapUI(){
 let watched=null;
 const fit=element=>{
   const rect=element.getBoundingClientRect(),axis=24,aspect=Math.max(.85,Math.min(1.8,(rect.width-axis)/Math.max(1,rect.height-axis)));
   element.style.setProperty('--ink-aspect',aspect.toFixed(3));
 };
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(entries=>entries.forEach(entry=>fit(entry.target))):null;
 const refresh=()=>{
   const map=document.querySelector('.ink-map');if(map!==watched){observer?.disconnect();watched=map;if(map)observer?.observe(map);}
   if(map)fit(map);
 };
 const originalRender=render;
 render=function(...args){const result=originalRender(...args);refresh();return result;};
 refresh();
}
