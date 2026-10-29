/* Original synthesized cues; no downloaded media or third-party audio. */
const SiegeRTAudio=(()=>{
  let context=null,muted=false,active=0;const seen=new WeakSet();
  try{muted=typeof localStorage!=='undefined'&&localStorage.getItem('siege-rt-muted')==='1';}catch{}
  function cues(events,silent=muted){if(silent)return [];const out=[],local=new Set();for(const e of events){if(local.has(e)||!['swing','hit','death','charge','gate_open','skill','result'].includes(e.type))continue;local.add(e);out.push({event:e,freq:({swing:170,hit:90,death:60,charge:240,gate_open:45,skill:360,result:520})[e.type],duration:e.type==='gate_open'?.45:.09});if(out.length===8)break;}return out;}
  function unlock(){try{if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)context=new Audio();}context?.resume().catch(()=>{});}catch{}}
  function play(events){if(!context||context.state!=='running'||muted)return;for(const cue of cues(events)){if(seen.has(cue.event)||active>=8)continue;seen.add(cue.event);try{const o=context.createOscillator(),g=context.createGain(),now=context.currentTime;o.type='triangle';o.frequency.setValueAtTime(cue.freq,now);o.frequency.exponentialRampToValueAtTime(Math.max(25,cue.freq*.45),now+cue.duration);g.gain.setValueAtTime(.035,now);g.gain.exponentialRampToValueAtTime(.001,now+cue.duration);o.connect(g);g.connect(context.destination);active++;o.onended=()=>{active--;o.disconnect();g.disconnect();};o.start(now);o.stop(now+cue.duration);}catch{}}}
  function toggle(){muted=!muted;try{localStorage.setItem('siege-rt-muted',muted?'1':'0');}catch{}return muted;}
  return {unlock,play,cues,toggle,isMuted:()=>muted};
})();
