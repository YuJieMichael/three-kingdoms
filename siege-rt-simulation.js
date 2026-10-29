const SiegeRTSimulation=(()=>{
  const D=SiegeRTData,clone=x=>JSON.parse(JSON.stringify(x));
  function create({mode='drill',generalSnapshot={},seed=1}={}){
    const units=[];const attack=D.multiplier(generalSnapshot.valor),health=D.multiplier(generalSnapshot.leadership);
    function add(id,team,kind,x,y,hp,speed,damage,interval,range){units.push({id,team,kind,x,y,hp,maxHP:hp,speed,attack:damage,interval,range,r:kind==='hero'?17:11,facing:team==='player'?0:Math.PI,ready:0,home:{x,y}});}
    add('hero','player','hero',300,800,1200,180,50*attack,17,75);
    for(let i=0;i<24;i++)add('p'+i,'player','shield',180-(i%4)*27,730+Math.floor(i/4)*27,160*health,110,16,30,28);
    for(let i=0;i<12;i++)add('o'+i,'enemy','melee',750+(i%3)*36,680+Math.floor(i/3)*65,130,90,14,36,28);
    for(let t=0;t<2;t++)for(let i=0;i<4;i++)add('a'+t+i,'enemy','archer',990+(i%2)*30, D.map.towers[t].y+Math.floor(i/2)*30,90,0,12,60,350);
    for(let i=0;i<16;i++)add('c'+i,'enemy','melee',1700+(i%4)*45,690+Math.floor(i/4)*65,130,90,14,36,28);
    return {version:1,mode,seed:seed>>>0,tick:0,units,projectiles:[],gate:{hp:4000,maxHP:4000},capture:0,result:null,input:{x:0,y:0,aim:0,attack:false},squad:{order:'follow',target:null,facing:0,chargeReady:0,chargeUntil:0,chargeHits:[]},hero:{skillReady:0,dodgeReady:0,dodgeUntil:0,immuneUntil:0,dodgeX:0,dodgeY:0},nextProjectile:0,tutorial:{}};
  }
  return {create,clone};
})();
