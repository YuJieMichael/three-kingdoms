const SiegeRTNavigation=(()=>{
  const size=40,finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  function build(map,gateOpen){return {map,gateOpen,cols:Math.ceil(map.width/size),rows:Math.ceil(map.height/size),obstacles:gateOpen?map.walls:[...map.walls,map.gate]};}
  function free(n,p,r=12){return finite(p)&&p.x>=r&&p.y>=r&&p.x<=n.map.width-r&&p.y<=n.map.height-r&&!n.obstacles.some(o=>p.x>o.x-r&&p.x<o.x+o.w+r&&p.y>o.y-r&&p.y<o.y+o.h+r);}
  function clear(n,a,b,r=0){if(!finite(a)||!finite(b))return false;const d=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(d/8));for(let i=0;i<=steps;i++)if(!free(n,{x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},r))return false;return true;}
  function move(n,b,d){if(!finite(b)||!finite(d))return {x:b.x,y:b.y};let p={x:b.x,y:b.y};const steps=Math.max(1,Math.ceil(Math.hypot(d.x,d.y)/6));for(let i=0;i<steps;i++){const q={x:p.x+d.x/steps,y:p.y+d.y/steps};if(free(n,q,b.r||12))p=q;else{const x={x:q.x,y:p.y},y={x:p.x,y:q.y};if(free(n,x,b.r||12))p=x;if(free(n,y,b.r||12))p=y;}}return p;}
  function path(n,a,b){
    if(!free(n,a)||!free(n,b))return null;if(!n.gateOpen&&(a.x<1130&&b.x>1220||b.x<1130&&a.x>1220))return null;if(clear(n,a,b,12))return [{x:b.x,y:b.y}];
    const idx=p=>Math.floor(p.y/size)*n.cols+Math.floor(p.x/size),point=i=>({x:(i%n.cols+.5)*size,y:(Math.floor(i/n.cols)+.5)*size});
    const start=idx(a),end=idx(b),open=[start],cost=new Map([[start,0]]),prev=new Map(),closed=new Set();
    while(open.length){let at=0;for(let i=1;i<open.length;i++)if(cost.get(open[i])+Math.hypot(point(open[i]).x-b.x,point(open[i]).y-b.y)/size<cost.get(open[at])+Math.hypot(point(open[at]).x-b.x,point(open[at]).y-b.y)/size)at=i;
      const id=open.splice(at,1)[0];if(id===end){const out=[{x:b.x,y:b.y}];let v=id;while(v!==start){out.unshift(point(v));v=prev.get(v);}return out;}closed.add(id);const p=point(id);
      for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const col=id%n.cols+dx,row=Math.floor(id/n.cols)+dy,j=row*n.cols+col;if(col<0||row<0||col>=n.cols||row>=n.rows||closed.has(j)||!clear(n,p,point(j),12))continue;const g=cost.get(id)+1;if(!cost.has(j)||g<cost.get(j)){cost.set(j,g);prev.set(j,id);if(!open.includes(j))open.push(j);}}
    }return null;
  }
  function slots(c,f,ids){return ids.map((id,i)=>{const x=-(Math.floor(i/6))*27,y=((i%6)-2.5)*27;return {id,x:c.x+x*Math.cos(f)-y*Math.sin(f),y:c.y+x*Math.sin(f)+y*Math.cos(f)};});}
  return {build,path,move,slots,clear,free};
})();
