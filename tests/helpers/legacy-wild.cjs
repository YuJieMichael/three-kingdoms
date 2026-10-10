// Existing-save fixture: the previous roster already had leads before being retired.
// This does not bypass new-game inquiries or expose a product-only test switch.
function seedLegacyWild(e){
 const g=e.Game,w=e.evaluate?e.evaluate('HeroSystem.wild'):e.HeroSystem.wild,s=g.state;
 for(const d of w.definitions.filter(d=>d.retired)){
  if(s.wildGenerals.rumors.some(r=>r.line===d.line))continue;
  const occupied=new Set(s.wildGenerals.rumors.map(r=>r.node));let chosen=null,score=Infinity;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
   const n=g.getWorldTile(x,y);if(!n?.wild||n.level!==d.fieldLevel||occupied.has(n.id)||s.conquered[n.id]||!Object.values(n.army).some(v=>v>0))continue;
   const distance=Math.hypot(x-d.anchor.x,y-d.anchor.y);if(distance<score){chosen=n;score=distance;}
  }
  if(!chosen)throw new Error('No legacy field for '+d.line);
  s.wildGenerals.rumors.push({line:d.line,id:'local_'+(1000000000000000+(++s.wildGenerals.seq)),node:chosen.id,at:e.now(),status:'active'});
 }
 return e;
}
module.exports={seedLegacyWild};
