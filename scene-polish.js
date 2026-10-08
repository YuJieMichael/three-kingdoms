'use strict';
// Appearance only: kept outside player saves and authoritative game state.
const SceneStyles={
  central:{letter:'A',name:'中原田庄',description:'暖土、远山与田间小路，接近经典页游。',soil:'#aaa278',light:'#d8cca0',mountain:'#7e8c6a',deep:'#617054',water:'#8baca0'},
  river:{letter:'B',name:'江南水乡',description:'青绿草地、河岸与薄雾，清爽柔和。',soil:'#a9bca0',light:'#d5e0c3',mountain:'#729c90',deep:'#426e66',water:'#91bab7'},
  ink:{letter:'C',name:'青绿山水',description:'宣纸底色、淡墨与青绿山峦，偏国风画卷。',soil:'#d6d2b7',light:'#ebe6ce',mountain:'#8ba99c',deep:'#54786e',water:'#b1c9c0'}
};
let sceneFieldStyle='central';
try{const saved=localStorage.getItem('shanhe-scene-style');if(Object.hasOwn(SceneStyles,saved))sceneFieldStyle=saved;}catch{/* Private browsing can still use session appearance. */}
function sceneStyleChooser(){
  return `<div class="scene-style-chooser" role="group" aria-label="城外景观风格">${Object.entries(SceneStyles).map(([id,s])=>`<button type="button" data-scene-style="${id}" aria-pressed="${id===sceneFieldStyle}" title="${s.description}"><span aria-hidden="true">${s.letter}</span>${s.name}</button>`).join('')}</div>`;
}
function sceneLandscapeTree(x,y,scale,color,ink=false){
  if(!ink){const atlas=WebArt.city.environment,[rx,ry,w,h]=atlas.regions.tree;return `<svg x="${x-36*scale}" y="${y-58*scale}" width="${72*scale}" height="${58*scale}" viewBox="${rx} ${ry} ${w} ${h}" preserveAspectRatio="xMidYMax meet" opacity=".72"><image href="${atlas.texture}" width="1536" height="1024"/></svg>`;}
  const branches=Array.from({length:7},(_,i)=>{const y0=-51+i*6,w=5+i*2.5;return `<path d="M0 ${y0}q${-w/2} 3 ${-w} 5m${w} -5q${w/2} 3 ${w} 4" stroke-width="1"/><path d="M${-w} ${y0+4}q3-3 6-1m${w-7} 0q3-3 7-1" stroke-width="3" opacity=".6"/>`;}).join('');
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-linecap="round"><ellipse cy="5" rx="22" ry="4" fill="${color}" stroke="none" opacity=".08"/><path d="M0 5q-4-26 0-57" stroke-width="1.5"/>${branches}</g>`;
}
function sceneLandscapeMountain(x,y,height,s,ink){
  const w=ink?70:125;
  const shape=ink?`M${-w} 0Q-46-12-33 ${-height*.48}L-22 ${-height*.52}Q-13 ${-height*.86} 0 ${-height}L10 ${-height*.9}Q27 ${-height*.74} 40 ${-height*.32}Q58-6 ${w} 0Z`:`M${-w} 0Q-91-8-57 ${-height*.66}Q-31 ${-height*1.05} 0 ${-height*.78}Q30 ${-height} 58 ${-height*.48}Q92-8 ${w} 0Z`;
  return `<g transform="translate(${x} ${y})"><path d="${shape}" fill="${s.mountain}" opacity=".28"/><path d="${shape}" fill="none" stroke="${s.deep}" stroke-width=".8" opacity=".15"/>${ink?`<path d="M0 ${-height}q-10 ${height*.3} 6 ${height*.53}l-8 ${height*.21}m-24 ${-height*.26}l-7 12 2 12m49-10-8 16 2 8" fill="none" stroke="${s.deep}" opacity=".23" stroke-width="1.3"/>`:''}</g>`;
}
function sceneFieldLandscape(rows=3,style=sceneFieldStyle){
  const s=SceneStyles[style]||SceneStyles.central,h=390+rows*43,id='field-landscape-'+style;
  const river=style!=='central',ink=style==='ink';
  const trees=[[30,185,1],[44,277,.8],[1028,252,.9],[1057,335,1.3],[100, h-32,1.1],[981,h-18,1.2]];
  const grains=Array.from({length:30},(_,i)=>{const x=35+(i*197)%1020,y=115+(i*47)%(h-155);return `<path d="M${x} ${y}l2-5 2 4m4 1 2-3"/>`;}).join('');
  return `<svg class="scene-ground scene-landscape" viewBox="0 0 1100 ${h}" preserveAspectRatio="none" aria-hidden="true"><defs>
    <linearGradient id="${id}-earth" x2=".2" y2="1"><stop stop-color="${s.light}"/><stop offset=".45" stop-color="${s.soil}"/><stop offset="1" stop-color="${s.soil}"/></linearGradient>
    <linearGradient id="${id}-fade" x2="0" y2="1"><stop stop-color="${s.light}" stop-opacity=".85"/><stop offset="1" stop-color="${s.light}" stop-opacity="0"/></linearGradient>
    <pattern id="${id}-paper" width="47" height="37" patternUnits="userSpaceOnUse"><path d="M2 9h4M24 28h3M37 6h2" stroke="#615e46" stroke-width=".6" opacity=".13"/><circle cx="11" cy="21" r=".7" fill="#fff9de" opacity=".3"/></pattern>
  </defs><rect width="1100" height="${h}" fill="url(#${id}-earth)"/>
  ${Array.from({length:ink?13:8},(_,i)=>sceneLandscapeMountain(ink?i*95:i*157,92+(i%3)*7,ink?47+(i*29)%64:28+(i*19)%37,s,ink)).join('')}
  <path d="M0 108Q93 67 183 106T397 92T629 107T829 98T1100 110V146H0Z" fill="${s.deep}" opacity=".1"/>
  <rect y="64" width="1100" height="115" fill="url(#${id}-fade)"/>
  ${river?`<path d="M1100 126Q999 181 1060 287T997 ${h-63}Q910 ${h-21} 816 ${h}H1100Z" fill="${s.water}"/><path d="M1098 129Q993 181 1054 287T990 ${h-65}Q906 ${h-27} 816 ${h}" fill="none" stroke="${s.light}" stroke-width="9" opacity=".8"/><g fill="none" stroke="#eaf1dc" opacity=".5"><path d="M1067 262h27m-64 161h42M924 ${h-27}h55"/></g>`:`<path d="M0 ${h-9}Q110 ${h-80} 254 ${h-38}T626 ${h-14}T1100 ${h-47}V${h}H0Z" fill="#8c9861" opacity=".25"/>`}
  <path d="M95 105Q343 154 549 379Q674 514 855 ${h}" fill="none" stroke="${ink?'#c8bca0':'#dfd0a8'}" stroke-width="12" opacity=".7"/>
  <path d="M95 105Q343 154 549 379Q674 514 855 ${h}" fill="none" stroke="#9b8e6c" stroke-width="1" opacity=".35"/>
  <path d="M60 405Q268 284 475 237T986 114" fill="none" stroke="${ink?'#c8bca0':'#dfd0a8'}" stroke-width="7" opacity=".5"/>
  <rect width="1100" height="${h}" fill="url(#${id}-paper)"/><g fill="none" stroke="${s.deep}" stroke-width="1" opacity=".15">${grains}</g>
  ${trees.map(([x,y,k])=>sceneLandscapeTree(x,y,k,s.deep,ink)).join('')}
  </svg>`;
}
function sceneConstructionMark(){return '<span class="scene-work-mark" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 15L13 5M10 4l3-2 5 5-3 2M3 14l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>';}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-scene-style]');if(!button)return;
  const id=button.dataset.sceneStyle;if(!Object.hasOwn(SceneStyles,id))return;
  sceneFieldStyle=id;try{localStorage.setItem('shanhe-scene-style',id);}catch{/* Session fallback. */}
  if(typeof render==='function')render();
  document.querySelector(`[data-scene-style="${id}"]`)?.focus({preventScroll:true});
});
