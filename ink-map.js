'use strict';
// Phones (coarse pointer) redraw the whole map on every pan; lighter filters keep that fast on mobile Safari.
const INK_MAP_LITE=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
// One coordinate-anchored painting. No terrain sprites or per-cell island bases.
const InkMapArt={paper:'#a2af79',ink:'#284f43',water:'#4c9490',forest:'#527e57',earth:'#b5af7c'};
function inkMapRandom(seed,salt){return ((Math.imul(seed^Math.imul(salt+1,2654435761),1597334677)>>>0)%10000)/10000;}
function inkMapWash(cx,cy,rx,ry,seed){
  const points=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,r=.86+inkMapRandom(seed,i)*.25;return {x:cx+Math.cos(a)*rx*r,y:cy+Math.sin(a)*ry*r};});
  const mid=(a,b)=>`${((a.x+b.x)/2).toFixed(1)} ${((a.y+b.y)/2).toFixed(1)}`;
  let path='M'+mid(points[7],points[0]);
  for(let i=0;i<8;i++)path+=`Q${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mid(points[i],points[(i+1)%8])}`;
  return path+'Z';
}
function inkMapCircle(x,y,r){return `M${(x-r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2*r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2*r).toFixed(1)} 0Z`;}
// Several jittered discs per cell; the goo filter melts neighbours into one organic region with no grid seams.
function inkMapBlob(cx,cy,base,seed){
  const r=n=>inkMapRandom(seed,n);let d=inkMapCircle(cx+(r(81)-.5)*34,cy+(r(82)-.5)*30,base*(.88+r(83)*.28));
  for(let i=0;i<3;i++){const a=r(84+i)*Math.PI*2,dist=base*(.35+r(88+i)*.45);d+=inkMapCircle(cx+Math.cos(a)*dist,cy+Math.sin(a)*dist*.8,base*(.38+r(92+i)*.3));}
  return d;
}
function inkMapBridge(ax,ay,bx,by,width){
  const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy),nx=-dy/length*width,ny=dx/length*width;
  return `M${ax+nx} ${ay+ny}Q${(ax+bx)/2+nx*.7} ${(ay+by)/2+ny*.7} ${bx+nx} ${by+ny}L${bx-nx} ${by-ny}Q${(ax+bx)/2-nx*.7} ${(ay+by)/2-ny*.7} ${ax-nx} ${ay-ny}Z`;
}
// Trace the union of real lake cells first, then round a shared, world-anchored coastline.
// There are no per-cell pond discs: adjacent water is one surface, including holes and narrow channels.
function inkMapWaterOutline(cells){
  if(!cells.length)return '';
  const key=(x,y)=>x+':'+y,wet=new Set(cells.map(p=>key(p.x,p.y))),edges=[],outgoing=new Map();
  const add=(ax,ay,bx,by,dir)=>{const e={ax,ay,bx,by,dir,used:false};edges.push(e);const k=key(ax,ay);if(!outgoing.has(k))outgoing.set(k,[]);outgoing.get(k).push(e);};
  for(const {x,y} of cells){
    if(!wet.has(key(x,y-1)))add(x,y,x+1,y,0);
    if(!wet.has(key(x+1,y)))add(x+1,y,x+1,y+1,1);
    if(!wet.has(key(x,y+1)))add(x+1,y+1,x,y+1,2);
    if(!wet.has(key(x-1,y)))add(x,y+1,x,y,3);
  }
  const vertex=(x,y)=>{const seed=worldLandscapeSeed(x,y);return {x:x*100+(inkMapRandom(seed,111)-.5)*26,y:y*100+(inkMapRandom(seed,112)-.5)*24};};
  const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2}),fmt=p=>p.x.toFixed(1)+' '+p.y.toFixed(1),paths=[];
  for(const first of edges){
    if(first.used)continue;
    const loop=[];let edge=first;
    while(edge&&!edge.used){
      edge.used=true;const a=vertex(edge.ax,edge.ay),b=vertex(edge.bx,edge.by),seed=worldLandscapeSeed(Math.min(edge.ax,edge.bx),Math.min(edge.ay,edge.by));
      // One asymmetric inlet per world edge breaks long 2×2 pool sides. Most displacement
      // goes into the lake; the shallow outward shoulder cannot cover a neighbouring tile centre.
      const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
      const bay=8+Math.pow(inkMapRandom(seed,114),2)*36,shoulder=-4-inkMapRandom(seed,115)*7,firstBay=inkMapRandom(seed,116)>.5;
      const bend=(u,offset)=>({x:a.x+dx*u+nx*offset,y:a.y+dy*u+ny*offset});
      loop.push(a,bend(.34+inkMapRandom(seed,117)*.08,firstBay?bay:shoulder),bend(.66+inkMapRandom(seed,118)*.08,firstBay?shoulder:bay));
      if(edge.bx===first.ax&&edge.by===first.ay)break;
      const next=(outgoing.get(key(edge.bx,edge.by))||[]).filter(e=>!e.used),rank=e=>({1:0,0:1,3:2,2:3})[(e.dir-edge.dir+4)%4];
      next.sort((a,b)=>rank(a)-rank(b));edge=next[0];
    }
    if(loop.length<4)continue;
    let d='M'+fmt(midpoint(loop.at(-1),loop[0]));
    for(let i=0;i<loop.length;i++)d+='Q'+fmt(loop[i])+' '+fmt(midpoint(loop[i],loop[(i+1)%loop.length]));
    paths.push(d+'Z');
  }
  return paths.join('');
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
  if(typeof PaintedArt!=='undefined'){
    const kind=typeof worldSandboxSiteType==='function'?worldSandboxSiteType(tile):'',city=tile.id==='home'||tile.type==='fort'||Game.isCity(tile);
    if(kind==='渡口')return '<svg class="ink-site-art sandbox-ford-art" viewBox="0 0 100 100" aria-hidden="true"><path d="M6 67Q48 54 95 66M9 75Q53 64 91 77" fill="none" stroke="#d8ebcf" stroke-width="2"/><path d="M8 44L70 29 93 38 30 54Z" fill="#ac9567" stroke="#625b40" stroke-width="2"/><path d="M13 45V72m16-22v19m39-39v22m18-17v22" stroke="#655b3d" stroke-width="4"/><path d="M38 72q17 15 36-2l-3-5-34 1Z" fill="#855a34" stroke="#e4c78d" stroke-width="1.4"/><path d="M58 64V42l17 19Z" fill="#e4d4b1" stroke="#775e3d" stroke-width="1"/></svg>';
    const tier=typeof NamedCityData!=='undefined'?NamedCityData.definition(tile)?.tier:'',id=tile.id==='home'?'capital':kind==='关隘'?'pass':tier==='capital'||tier==='province'?'capital':tier==='prefecture'?'commandery':city?'county':'yellow-camp';
    const resource={field:'farm',forest:'lumber',mountain:'mine'}[tile.terrain],src=!city&&kind!=='关隘'&&resource?PaintedArt.src('buildings',resource):PaintedArt.src('map',id);
    return `<img class="painted-site sandbox-site-${city||kind==='关隘'?id:resource||'camp'}" src="${src}" alt="" decoding="async" draggable="false">`;
  }
  const city=tile.id==='home'||tile.type==='fort'||Game.isCity(tile),owned=tile.id==='home'||!!S().conquered[tile.id],flag=owned?'#4c7770':tile.faction==='yellow_turban'?'#aa8a3f':'#a6654d';
  const cityBody='<path d="M11 44L45 32 79 44V64L46 79 11 65Z" fill="#d8cfb3" stroke="#606957"/><path d="M11 44L46 58 79 44M46 58V78" fill="none" stroke="#7b7b66"/><path d="M15 41v8m13-14v8m12-13v8m14-7v8m13-4v8m10-3v8" stroke="#687264" stroke-width="4"/><path d="M36 75V62q9-14 19 0v13" fill="#53665c"/><path d="M29 30h33v22H29Z" fill="#d9d0b4"/><path d="M21 32Q34 28 44 17Q57 28 69 31L62 36H29Z" fill="#566c60"/><path d="M20 32Q43 35 69 31M35 41h5m10 0h5" fill="none" stroke="#384e47"/>';
  const campBody='<path d="M19 58L46 31 72 57H19Z" fill="#c3b899" stroke="#6f7460"/><path d="M46 33v25m-8 0 8-18 9 18" fill="#667360" stroke="#737864"/><path d="M16 61q29 7 60-2M26 65l-7 6m43-6 9 5" fill="none" stroke="#7c8069" stroke-width="1"/>';
  return `<svg class="ink-site-art" viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="47" cy="76" rx="36" ry="8" fill="#899680" opacity=".15"/>${city?cityBody:campBody}<path d="M78 17v35" stroke="#596756" stroke-width="1.5"/><path d="M79 17q10-5 17 1l-4 13q-7-6-13-2Z" fill="${flag}" opacity=".9"/><path d="M79 18l11 1" stroke="#f1dfb6" stroke-width=".8"/></svg>`;
}
function inkWorldGroundSVG(start,span,read){
  const P=typeof PaintedArt!=='undefined'?PaintedArt:null;
  const originX=start.x*100,originY=start.y*100,size=span*100,washes={swamp:[],forest:[],hill:[],grass:[]},lakes=[],waterLines=[],swampLines=[],ridges=[],details=[],mist=[];
  const territory=[],ownedTile=t=>t&&(t.id==='home'||!!S().conquered?.[t.id]||!!S().garrisons?.[t.id]);
  const group=t=>t?.type==='lake'?'lake':t?.type==='swamp'?'swamp':t?.type==='forest'?'forest':['mountain','hill'].includes(t?.type)?'hill':t?.type==='grass'?'grass':null;
  // A two-cell border stabilizes brushwork and connections when the viewport is panned.
  for(let y=start.y-2;y<=start.y+span+1;y++)for(let x=start.x-2;x<=start.x+span+1;x++){
    const t=read(x,y);if(!t)continue;
    const seed=worldLandscapeSeed(x,y),cx=x*100+50,cy=y*100+56,g=group(t),r=n=>inkMapRandom(seed,n);
    if(ownedTile(t))territory.push(inkMapCircle(cx,cy-6,74));
    if(g==='lake')lakes.push({x,y});else if(g)washes[g].push(inkMapBlob(cx,cy,g==='grass'?62:g==='hill'?60:g==='forest'?58:50,seed));
    if(t.type==='mountain'){
      for(const [dx,dy] of [[1,0],[0,1]])if(['mountain','hill'].includes(read(x+dx,y+dy)?.type)){
        ridges.push(`<path d="M${cx} ${cy-24}Q${cx+dx*40-dy*21} ${cy+dy*40-31} ${cx+dx*100} ${cy+dy*100-22}" fill="none" stroke="#799083" stroke-width="24" stroke-linecap="round" opacity=".18"/>`);
      }
      const mx=cx+(r(4)-.5)*36,my=cy+15+(r(7)-.5)*18;details.push({y:my,html:P?P.mapImage(r(13)>.5?'mountain-a':'mountain-b',cx+(r(4)-.5)*12,cy+46,102+r(5)*15,'class="sandbox-map-sprite"'):inkMapMountain(mx,my,58+r(5)*48,seed)});
      if(!P&&r(8)>.55){const sx=cx+(r(9)>.5?1:-1)*(30+r(10)*14),sy=cy+30+r(11)*10;details.push({y:sy,html:P?P.mapImage('mountain-b',sx,sy+14,60+r(12)*24):inkMapMountain(sx,sy,30+r(12)*20,seed+3)});}
    }else if(t.type==='hill'){
      const h=17+r(6)*23;
      if(P)details.push({y:cy+14,html:P.mapImage('hill',cx+(r(6)-.5)*8,cy+40,92+r(7)*10,'class="sandbox-map-sprite"')});else details.push({y:cy,html:`<path d="M${cx-65} ${cy+13}Q${cx-18} ${cy-h-28} ${cx+61} ${cy+13}Q${cx+12} ${cy+29} ${cx-65} ${cy+13}Z" fill="#96a78b" opacity=".23"/><path d="M${cx-62} ${cy+10}Q${cx-6} ${cy-h} ${cx+58} ${cy+9}" fill="none" stroke="#6c8067" stroke-width="1.2" opacity=".5"/>${inkMapPine(cx-15,cy+4,15,seed)}`});
    }else if(t.type==='forest'){
      if(P)details.push({y:cy+20,html:P.mapImage(r(28)>.5?'forest-a':'forest-b',cx+(r(26)-.5)*12,cy+44,106+r(25)*13,'class="sandbox-map-sprite"')});
      else{const n=4+Math.floor(r(29)*4);for(let i=0;i<n;i++){const tx=cx-50+r(i+10)*100,ty=cy-38+r(i+30)*82;details.push({y:ty,html:inkMapPine(tx,ty,20+r(i+40)*30,seed+i*17)});}}
    }else if(t.type==='lake'||t.type==='swamp'){
      for(let i=0;i<(t.type==='lake'?1:2);i++){
        const wx=cx-24+r(i+51)*21,wy=cy-24+r(i+52)*32+i*16,len=22+r(i+54)*24;
        const line=`<path d="M${wx.toFixed(1)} ${wy.toFixed(1)}q${(len*.24).toFixed(1)} -1.5 ${(len*.5).toFixed(1)} 0t${(len*.5).toFixed(1)} 0" fill="none" stroke="${t.type==='lake'?'#d3e5c5':'#647f79'}" stroke-width=".7" opacity="${P?'.17':'.38'}"/>`;
        if(t.type==='lake'){if(r(56)>.38)waterLines.push(line);}else swampLines.push(line);
      }
      if(t.type==='swamp'&&P)details.push({y:cy+20,html:P.mapImage('reeds',cx+(r(62)-.5)*8,cy+36,72+r(63)*10)});
      else if(t.type==='swamp')for(let i=0;i<3;i++){
        const bx=cx-27+r(i+62)*54,by=cy+11+r(i+68)*15;
        details.push({y:by,html:`<path d="M${bx} ${by}q-3-9 0-18m0 12-7-6m7 10 6-9" stroke="#798569" fill="none" stroke-width="1"/>`});
      }
    }else if(!P&&t.wild&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>read(x+dx,y+dy)?.type==='forest')&&r(73)>.35){
      const toward=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>read(x+dx,y+dy)?.type==='forest');
      for(let i=0;i<2;i++){const tx=cx+toward[0]*(28+r(74+i)*18)+(r(76+i)-.5)*40,ty=cy+toward[1]*(24+r(78+i)*16)+(r(80+i)-.5)*30;details.push({y:ty,html:P?P.mapImage('pine',tx,ty+10,22+r(70+i)*10):inkMapPine(tx,ty,14+r(70+i)*12,seed+40+i)});}
    }else if(t.wild&&(!P||!P.sandbox?.map?.grass)){
      const gx=cx-26+r(71)*51,gy=cy-8+r(72)*24;
      details.push({y:gy,html:`<path d="M${gx} ${gy}l3-5 2 5m12 7 2-4 2 3" fill="none" stroke="#8b9574" stroke-width=".7" opacity=".55"/>`});
    }
    if(t.type==='mountain'||t.type==='hill')mist.push(`<ellipse cx="${cx}" cy="${cy+36}" rx="75" ry="12" fill="#eeead9" opacity=".28"/>`);
  }
  // Route previews and moving armies are drawn from their real rule paths above the ground.
  // The painting deliberately adds no decorative roads that could be mistaken for traversable routes.
  details.sort((a,b)=>a.y-b.y);
  const box=`x="${originX-60}" y="${originY-60}" width="${size+120}" height="${size+120}"`;
  const waterPath=inkMapWaterOutline(lakes),waterRect=`x="${originX-60}" y="${originY-60}" width="${size+120}" height="${size+120}"`;
  const region=(id,fill,opacity,pattern)=>washes[id].length?`<g opacity="${opacity}" filter="url(#ink-goo)"><path fill="${fill}" d="${washes[id].join('')}"/></g>${pattern&&P?`<g opacity=".9" filter="url(#ink-goo)"><path fill="url(#painted-${id})" d="${washes[id].join('')}"/></g>`:''}`:'';
  const shore=id=>washes[id].length?`<g opacity=".28" filter="url(#ink-shore)"><path fill="#4f6d6e" d="${washes[id].join('')}"/></g>`:'';
  return `<svg class="web-world-ground ink-world-ground" viewBox="${originX} ${originY} ${size} ${size}" preserveAspectRatio="none" aria-hidden="true"><defs>
    ${P?`<pattern id="painted-lake" x="0" y="0" width="560" height="560" patternUnits="userSpaceOnUse"><image href="${P.src('map','lake')}" width="560" height="560"/></pattern><pattern id="painted-grass" x="0" y="0" width="768" height="768" patternUnits="userSpaceOnUse"><image href="${P.src('map','grass')}" width="768" height="768"/></pattern>`:''}
    <radialGradient id="ink-meadow-light"><stop stop-color="#d6d99b" stop-opacity=".55"/><stop offset="1" stop-color="#d6d99b" stop-opacity="0"/></radialGradient>
    <radialGradient id="ink-meadow-shade"><stop stop-color="#355f40" stop-opacity=".35"/><stop offset="1" stop-color="#355f40" stop-opacity="0"/></radialGradient>
    <pattern id="ink-meadows" x="0" y="0" width="900" height="760" patternUnits="userSpaceOnUse"><ellipse cx="160" cy="230" rx="220" ry="170" fill="url(#ink-meadow-light)"/><ellipse cx="630" cy="540" rx="290" ry="180" fill="url(#ink-meadow-shade)"/><ellipse cx="820" cy="80" rx="160" ry="140" fill="url(#ink-meadow-light)"/></pattern>
    ${waterPath?`<filter id="ink-water-soft" filterUnits="userSpaceOnUse" ${box}><feGaussianBlur stdDeviation="${INK_MAP_LITE?1.2:1.8}"/></filter>
    <filter id="ink-water-bank" filterUnits="userSpaceOnUse" ${box}><feMorphology operator="dilate" radius="5"/><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="ink-water-depth" filterUnits="userSpaceOnUse" ${box}><feMorphology operator="erode" radius="${INK_MAP_LITE?11:14}"/><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="ink-water-edge" filterUnits="userSpaceOnUse" ${box}><feMorphology in="SourceGraphic" operator="erode" radius="1.6" result="inside"/><feComposite in="SourceGraphic" in2="inside" operator="out"/><feGaussianBlur stdDeviation=".9"/></filter>
    <mask id="ink-water-mask" maskUnits="userSpaceOnUse" ${box}><path d="${waterPath}" fill="#fff" fill-rule="evenodd" filter="url(#ink-water-soft)"/></mask>`:''}
    <filter id="ink-wash-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="ink-goo" filterUnits="userSpaceOnUse" ${box}><feGaussianBlur in="SourceGraphic" stdDeviation="${INK_MAP_LITE?10:16}" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="g"/><feGaussianBlur in="g" stdDeviation="5"/></filter>
    <filter id="ink-sand" filterUnits="userSpaceOnUse" ${box}><feGaussianBlur in="SourceGraphic" stdDeviation="${INK_MAP_LITE?10:16}" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="g"/><feMorphology in="g" operator="dilate" radius="7" result="d"/><feGaussianBlur in="d" stdDeviation="4"/></filter>
    <filter id="ink-shore" filterUnits="userSpaceOnUse" ${box}><feGaussianBlur in="SourceGraphic" stdDeviation="${INK_MAP_LITE?10:16}" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="g"/><feMorphology in="g" operator="erode" radius="1.4" result="e"/><feComposite in="g" in2="e" operator="out" result="ring"/><feGaussianBlur in="ring" stdDeviation="1.1"/></filter>
    ${INK_MAP_LITE?'':'<filter id="ink-paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>'}
    <pattern id="ink-paper" width="180" height="180" patternUnits="userSpaceOnUse">${INK_MAP_LITE?'':'<rect width="180" height="180" filter="url(#ink-paper-grain)" opacity=".1"/>'}</pattern>
    <linearGradient id="ink-mountain-wash" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#4d6c63" stop-opacity=".75"/><stop offset=".58" stop-color="#7d978b" stop-opacity=".62"/><stop offset="1" stop-color="#b9c4ab" stop-opacity=".1"/></linearGradient>
    <radialGradient id="ink-foot-mist"><stop stop-color="#e8e5d1" stop-opacity=".9"/><stop offset="1" stop-color="#e8e5d1" stop-opacity="0"/></radialGradient>
    </defs><rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="${InkMapArt.paper}"/>${P?`<rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="url(#painted-grass)" opacity=".88"/>`:''}<rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="url(#ink-meadows)" opacity=".34"/>
    ${region('grass','#a0bd77',P?'.12':'.3')}${region('hill','#b7a36a','.3')}${region('forest','#3f7147','.38')}${region('swamp','#628b6c',P?'.3':'.38')}${P?'':shore('swamp')}
    ${waterPath?`<g class="sandbox-water"><path d="${waterPath}" fill="#c8bb86" fill-rule="evenodd" opacity=".7" filter="url(#ink-water-bank)"/><g mask="url(#ink-water-mask)"><rect ${waterRect} fill="#8eb7a0"/>${P?`<rect ${waterRect} fill="url(#painted-lake)" opacity=".72"/>`:''}<path d="${waterPath}" fill="#164f5a" fill-rule="evenodd" opacity="${P?'.24':'.46'}" filter="url(#ink-water-depth)"/><path d="${waterPath}" fill="#e2e6ba" fill-rule="evenodd" opacity=".5" filter="url(#ink-water-edge)"/>${waterLines.join('')}</g></g>`:''}
    ${territory.length?`<g opacity=".1" filter="url(#ink-goo)"><path fill="#4daba0" d="${territory.join('')}"/></g><g opacity=".85" filter="url(#ink-shore)"><path fill="#1b7167" d="${territory.join('')}"/></g>`:''}${ridges.join('')}${swampLines.join('')}${details.map(d=>d.html).join('')}<g filter="url(#ink-wash-soft)">${mist.join('')}</g>
    <rect x="${originX}" y="${originY}" width="${size}" height="${size}" fill="url(#ink-paper)" opacity=".35" style="mix-blend-mode:multiply"/>
    </svg>`;
}
// v0.35.2: the ground's SVG filters re-ran on every frame of a map drag (about 30–50 ms a frame at 2× pixel density).
// Each view is drawn once into an image instead, so a drag only moves pixels; the live SVG stays until the image is ready.
const InkGround={images:new Map(),urls:new Map(),loading:null,sources:'',last:''};
function inkGroundImageSources(){return typeof PaintedArt==='undefined'?[]:[...new Set([...Object.keys(PaintedArt.map),...Object.keys(PaintedArt.sandbox?.map||{}),'lake','grass'].map(id=>PaintedArt.src('map',id)))];}
// Pure: the standalone SVG an <img> can draw. An SVG image may not load other files, so every image is inlined, and the
// page CSS the ground relied on is copied in. Returns null while an image is still missing.
function inkGroundStandalone(svg,images,aspect){
  let missing=false;
  const out=svg.replace(/<image href="([^"]+)"/g,(match,src)=>{if(src.startsWith('data:'))return match;const data=images.get(src);if(!data){missing=true;return match;}return `<image href="${data}"`;});
  if(missing||!out.startsWith('<svg '))return null;
  return out.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace('<defs>',`<defs><style>.ink-mountain-body,.ink-pine-body{transform:scaleY(${aspect});transform-origin:50% 100%;transform-box:fill-box}.sandbox-map-sprite{transform:scaleY(${aspect});transform-origin:50% 100%;transform-box:fill-box}.ink-mountain-body .ink-pine-body{transform:none}</style>`);
}
function inkGroundPreload(){
  const sources=inkGroundImageSources(),key=sources.join('|');
  if(InkGround.loading&&InkGround.sources===key)return InkGround.loading;
  InkGround.sources=key;
  if(typeof fetch!=='function'||typeof FileReader!=='function'||typeof Blob!=='function'||typeof URL?.createObjectURL!=='function')return InkGround.loading=Promise.resolve(false);
  const read=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  return InkGround.loading=Promise.all(sources.filter(src=>!InkGround.images.has(src)).map(src=>fetch(src).then(r=>r.ok?r.blob():Promise.reject(new Error(src))).then(read).then(data=>InkGround.images.set(src,data)))).then(()=>true,()=>false);
}
function inkGroundSwap(map){
  const svg=map?.querySelector('svg.ink-world-ground');if(!svg||!InkGround.last)return;
  const aspect=map.style.getPropertyValue('--ink-aspect')||'1',key=InkGround.last+'|'+aspect;
  let url=InkGround.urls.get(key);
  if(!url){
    const doc=inkGroundStandalone(InkGround.last,InkGround.images,aspect);
    if(!doc){inkGroundPreload().then(ok=>{if(ok&&svg.isConnected&&inkGroundStandalone(InkGround.last,InkGround.images,aspect))inkGroundSwap(map);});return;}
    url=URL.createObjectURL(new Blob([doc],{type:'image/svg+xml'}));InkGround.urls.set(key,url);
    if(InkGround.urls.size>8){const [oldKey,oldUrl]=InkGround.urls.entries().next().value;URL.revokeObjectURL(oldUrl);InkGround.urls.delete(oldKey);}
  }
  // Chrome redraws an SVG <img> from vectors (filters included) whenever it moves, so the image is painted once into a canvas.
  const img=new Image();img.decoding='async';img.src=url;
  (img.decode?img.decode():new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;})).then(()=>{
    if(!svg.isConnected)return;
    const rect=svg.getBoundingClientRect(),scale=Math.min(3,Math.max(1,globalThis.devicePixelRatio||1)),canvas=document.createElement('canvas'),context=canvas.getContext?.('2d');
    if(!context||rect.width<1||rect.height<1)return;
    canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale);
    context.drawImage(img,0,0,canvas.width,canvas.height);
    canvas.className='web-world-ground ink-world-ground ink-ground-image';canvas.setAttribute('aria-hidden','true');
    svg.replaceWith(canvas);
  },()=>{});
}
webWorldGroundSVG=(...args)=>InkGround.last=inkWorldGroundSVG(...args);
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
   if(map){fit(map);inkGroundSwap(map);}
 };
 const originalRender=render;
 render=function(...args){const result=originalRender(...args);refresh();return result;};
 // Panning replaces only the map board (centerWorld), without a full render.
 const originalCenter=centerWorld;
 centerWorld=function(...args){const result=originalCenter(...args);refresh();return result;};
 refresh();
 inkGroundPreload().then(ok=>{if(ok)refresh();});
}
