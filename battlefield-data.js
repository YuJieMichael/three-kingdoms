'use strict';
const BattlefieldData=(()=>{
  const MAIN_IDS=Array.from({length:9},(_,i)=>'m'+(i+1)),SIDE_IDS=Array.from({length:6},(_,i)=>'s'+(i+1));
  const rows=[
    ['m1','村落解围',1,{militia:100},'乡民困在村口，义军已封住退路。','击退围村黄巾，打开粮道。','村民得救，引路人指出了粮道。','村落仍被围困，补充租兵后再来。'],
    ['m2','粮道争夺',1,{militia:80,spear:40},'粮车停在岔路，黄巾守住了桥头。','清除桥头守军，查明粮仓位置。','夺得粮道，寻踪罗盘的线索已解锁。','粮车未能通过，守军仍控制桥头。'],
    ['m3','张梁营寨',1,{spear:100,archer:50},'张梁据粮设营：有粮在手，营寨便不会失守！','击败张梁；粮仓支线可切断敌方供给。','人公将军败退，西华通道已经打开。','张梁守住营寨，可先夺粮再战。'],
    ['m4','西华破围',2,{shield:100,archer:60},'官军被截在西华，盾阵挡住了前路。','攻破包围阵线，向汝南推进。','西华解围，官军接应你前往汝南。','盾阵未破，调整前排与弓兵后重试。'],
    ['m5','汝南攻营',2,{spear:100,cavalry:60},'汝南营地的枪骑两阵交错相护。','突破营地，找到张宝主阵。','外围营地已破，张宝现出主阵。','枪骑仍守住营门，补租后再战。'],
    ['m6','张宝决战',2,{shield:120,archer:80},'张宝列盾护弓：你能破得了我的阵势吗？','击败张宝；军械库可提高本轮攻击。','地公将军败退，广宗战线开放。','张宝阵势未乱，可先解放军械库。'],
    ['m7','广宗外围',3,{spear:120,archer:90},'广宗烽火连天，外围守军阻住援军。','清除广宗外围守军。','外围通道打通，军队抵达巨鹿。','外围仍有守军，可支援皇甫嵩再来。'],
    ['m8','巨鹿破阵',3,{shield:140,cavalry:80},'巨鹿骑兵冲出，盾阵掩护着张角。','破开巨鹿防线，准备最终决战。','张角营门已开，最终决战就在前方。','巨鹿防线仍在，调整兵种再破阵。'],
    ['m9','张角决战',3,{shield:160,archer:100,cavalry:60},'张角高举法杖：苍天已死，黄天当立！','击败张角，完成整轮黄巾战役。','张角败走，黄巾战役通关，统一结算。','决战失利；祭坛情报可削弱敌方防御。'],
    ['s1','救援失散官军',1,{militia:80},'散兵被困山谷，发来求援火号。','击退围兵，获得本轮500人补租额度。','官军得救，本轮补租池增加500人。','官军仍在苦战，救援未能完成。'],
    ['s2','夺回粮仓',1,{spear:60,archer:30},'粮仓藏在岔路之后，守军封住了入口。','夺回粮仓，解除张梁攻击优势。','敌方供给被切断，张梁攻击优势解除。','粮仓尚在敌手，张梁仍有粮草供给。'],
    ['s3','解放军械库',2,{shield:80,archer:40},'工匠被困军械库，尚有器械可用。','解放工匠，本轮攻击+8%，终战守军−5%。','器械送抵军中，攻击+8%；敌军粮道受阻，终战守军−5%。','军械库仍被占据，器械无法运出。'],
    ['s4','解放医药营',2,{},'医官愿随军救治伤者，只待你护送。','护送医官，取得200人救治额度。','医官随军，本轮可救治最多200人。','护送未完成，医官仍在营中等待。'],
    ['s5','支援皇甫嵩',3,{spear:100,cavalry:40},'皇甫嵩牵制敌骑，请你攻击其侧翼。','解围后获得本轮500人补租额度。','皇甫嵩派来援军，本轮补租池增加500人。','侧翼仍有敌骑，援军暂时不能到来。'],
    ['s6','潜入祭坛',3,{shield:90,archer:50},'祭坛守军严密，需正面夺取军情。','攻破祭坛，解除张角防御优势。','祭坛军情到手，张角防御优势解除。','祭坛仍在运作，张角防御优势保留。']
  ];
  const nodes=rows.map(([id,name,arc,army,intro,objective,victory,defeat])=>({id,name,arc,army,intro,objective,victory,defeat,kind:id[0]==='m'?'main':'side',requires:id[0]==='m'?(id==='m1'?[]:['m'+(Number(id.slice(1))-1)]):arc===1?[]:['m'+((arc-1)*3)],dialogue:id==='s4'}));
  const nanRows=[
    ['n1','边寨解围',1,{militia:140,spear:60},'边寨烽火燃起，乡民困在寨门之外。','击退围寨守军，打通林地入口。','边寨解围，向导指出林间伏兵。','边寨仍被围困，可先救援向导再战。'],
    ['n2','林间伏击',1,{spear:100,archer:80},'林叶摇动，伏兵从两侧封住山路。','破开伏击，取得易容面具的线索。','伏兵退去，易容面具领取资格解锁。','林间伏兵未散，调整前排掩护弓兵。'],
    ['n3','祝融营寨',1,{spear:120,archer:100},'祝融率弓阵守营，密道藏在树影之间。','攻破祝融营寨；探明密道可解除弓兵攻击优势。','祝融退守深山，渡口通道开放。','营寨未破，可先探明密道削弱弓阵。'],
    ['n4','渡口争夺',2,{shield:120,archer:80},'渡口盾阵护住船桥，箭雨封锁水岸。','夺取渡口，为后续部队开路。','船桥得保，军队抵达藤甲前营。','渡口仍被封锁，补租后调整阵形。'],
    ['n5','藤甲前营',2,{shield:160,spear:80},'藤甲兵列阵林边，枪兵守在两翼。','突破藤甲前营，接近统领营地。','前营已破，藤甲统领现出主阵。','前营仍在抵抗，可先截断藤油。'],
    ['n6','藤甲统领',2,{shield:180,archer:80},'藤甲统领依油护甲，盾阵遮蔽后排。','击败藤甲统领；截断藤油可解除防御优势。','藤甲阵散，山口战线开放。','藤甲未破，可先截断藤油再战。'],
    ['n7','山口合围',3,{spear:140,cavalry:80},'山口枪骑交错，阻住官军归路。','击退山口守军，逼近蛮营。','山口得通，蛮营哨卡就在前方。','山口未通，可先解救被困援军。'],
    ['n8','蛮营哨卡',3,{shield:160,archer:100},'哨卡灯火密布，孟获军阵藏在寨后。','夺取哨卡，准备最终决战。','哨卡已破，孟获主阵开放。','哨卡守军仍在，补租后再次进攻。'],
    ['n9','孟获决战',3,{shield:180,archer:110,cavalry:70},'孟获列阵寨前，要与你决一胜负。','击败孟获完成本轮；军情可解除防御优势。','孟获退兵，边境暂安，战役统一结算。','决战失利，可先截获军情削弱防御。'],
    ['b1','救援向导',1,{militia:100,spear:40},'引路乡民被围，举火请求救援。','击退围兵，补租池增加500人。','向导获救，本轮补租池增加500人。','向导仍被困住，救援尚未完成。'],
    ['b2','探明密道',1,{spear:90,archer:50},'密道守卫扼守岔路，罗盘可找到侧翼。','取得密道情报，解除祝融弓兵攻击优势。','密道已探明，祝融弓兵攻击优势解除。','密道仍在敌手，可用罗盘寻找隐藏入口。'],
    ['b3','截断藤油',2,{shield:100,spear:60},'油车沿山道送入藤甲营，守军紧随。','拦截油车，解除藤甲防御优势，终战守军−5%。','藤油供应断绝，藤甲防御优势解除，终战守军−5%。','油车仍在通行，藤甲防御优势保留。'],
    ['b4','护送药师',2,{},'药师愿随军救治，需有人护送过渡口。','护送药师，取得200人救治额度。','药师安全抵达，取得200人救治额度。','药师仍在等待，本轮尚无救治额度。'],
    ['b5','解救被困援军',3,{spear:120,cavalry:50},'援军困在山谷，旗号遥遥可见。','击退围兵，补租池增加500人。','援军脱困，本轮补租池增加500人。','围兵仍在，援军暂时无法接应。'],
    ['b6','截获军情',3,{shield:100,archer:70},'来使先问山路，守卫以归林作答。','取得军情，解除孟获防御优势；面具可减少守军。','军情到手，孟获防御优势解除。','军情未得，可补租后正面重试。']
  ];
  const nanNodes=nanRows.map(([id,name,arc,army,intro,objective,victory,defeat])=>({id,name,arc,army,intro,objective,victory,defeat,kind:id[0]==='n'?'main':'side',requires:id[0]==='n'?(id==='n1'?[]:['n'+(Number(id.slice(1))-1)]):arc===1?[]:['n'+((arc-1)*3)],dialogue:id==='b4'}));
  // New stories reuse the established rental-army gradient, never the old node IDs.
  function historicalNodes(mainPrefix,sidePrefix,story,baseline){
    return story.map(([name,intro,objective,victory],i)=>{const source=baseline[i],id=(i<9?mainPrefix:sidePrefix)+(i<9?i+1:i-8),arc=source.arc;return {id,name,arc,army:{...source.army},intro,objective,victory,defeat:name+'仍有守军，补租后可重试，也可先取支线支援。',kind:i<9?'main':'side',requires:i<9?(i===0?[]:[mainPrefix+i]):arc===1?[]:[mainPrefix+((arc-1)*3)],dialogue:i===12};});
  }
  const eunuchNodes=historicalNodes('t','u',[
    ['京师救民','宫中政变传到街市，百姓被乱军截住。','击退街市乱军，沿粮道进入京师。','街市得安，勤王军找到宫门前路。'],
    ['粮道清障','粮车停在宫道，盾兵守住辎重。','清开宫道，查明张让近卫的位置。','宫道已通，近卫营阵形显露。'],
    ['宫门近卫','近卫据粮列阵，阻住勤王军。','击败近卫；夺回粮仓可解除攻击优势。','近卫败退，勤王军进入禁苑外围。'],
    ['禁苑外围','禁苑盾阵护住弓手，乱军仍在交战。','突破外围军阵，接应禁苑内的百姓。','外围守军退去，洛桥方向开放。'],
    ['洛桥争夺','洛桥两端互相呼应，枪骑扼住归路。','清除桥头军阵，打通皇城撤离路线。','洛桥已通，宫道督军现出主阵。'],
    ['宫道督军','督军列盾护弓，军械库仍被扣押。','击败督军；支线军械可使本轮攻击增加。','宫道督军败退，北宫道路开放。'],
    ['北宫接应','勤王军被截在北宫，援军传来旗号。','击退北宫守军，接应失散的勤王军。','北宫军阵已散，河宫哨阵就在前方。'],
    ['河宫哨阵','河宫骑兵保护内侍，哨阵封住出口。','击退哨阵，追上张让率领的近卫。','河宫哨阵退去，张让已无退路。'],
    ['张让决战','张让率最后近卫列阵，宫中乱局将定。','击败张让完成本轮；取密诏可削弱防御。','张让近卫败退，京师乱局暂定，统一结算。'],
    ['救援勤王军','勤王军散兵被困街巷，请你从侧面接应。','击退围兵，本轮补租池增加500人。','勤王军得救，本轮补租池增加500人。'],
    ['夺回内仓','内仓仍向宫门近卫供粮，守卫封住巷口。','夺回内仓情报，解除近卫攻击优势。','内仓得保，宫门近卫攻击优势解除。'],
    ['接应军械匠','军械匠被困禁苑，愿把器械送入军中。','本轮攻击+8%，终战守军−5%。','军械入军，本轮攻击+8%，终战守军−5%。'],
    ['护送太医','太医背着药囊等待接应，愿救治勤王伤者。','护送太医，获得200人救治额度。','太医随军，本轮获得200人救治额度。'],
    ['解围北军','北军被围在河宫侧道，发来接应旗号。','解围北军，本轮补租池增加500人。','北军得救，本轮补租池增加500人。'],
    ['取得密诏','宫中来使藏有密诏；先问宫门，守卫以归营作答。','取得近卫军情，解除张让防御优势。','密诏入手，张让防御优势解除。']
  ],nodes);
  const dongNodes=historicalNodes('d','e',[
    ['曹阳牵制','联军前锋抵达曹阳，西凉军阻住辎重。','击退西凉前阵，接通联军前锋。','曹阳军阵已散，汜水战线开放。'],
    ['汜水接战','汜水守军列枪护弓，骑阵从侧翼逼近。','突破汜水军阵，查明华雄营位。','汜水守军败退，华雄主阵显露。'],
    ['华雄营阵','华雄据营设伏，弓兵守住两翼。','击败华雄；查探骑阵可解除弓兵攻击优势。','华雄营阵溃散，联军向荥阳推进。'],
    ['荥阳对峙','荥阳前线盾阵紧密，弓手护住补给。','击退荥阳军阵，掩护联军继续推进。','荥阳前线得通，虎牢骑阵进入视野。'],
    ['虎牢骑阵','虎牢前的枪盾部队护住骑兵集结。','破开外围军阵，逼近吕布主阵。','外围骑阵退去，吕布前来接战。'],
    ['吕布接战','吕布军阵借辎重固守，弓盾交错。','击退吕布军阵；夺军械可解除防御优势。','吕布军阵退去，洛阳外围道路开放。'],
    ['洛阳外营','洛阳外营枪骑并进，试图截断联军。','击退外营，接应勤王援军。','洛阳外营败退，西凉后阵显露。'],
    ['西凉后阵','西凉盾兵护弓，董卓退兵的旗号将起。','击退后阵，抢在退兵前完成最后接战。','后阵已散，董卓主阵就在前方。'],
    ['董卓决战','董卓率西凉主阵接战，欲保住最后营地。','击败董卓完成本轮；营图可削弱防御。','董卓军阵败退，联军得胜，本轮统一结算。'],
    ['救援联军前锋','联军前锋被困山道，旗号仍在抵抗。','救出前锋，本轮补租池增加500人。','前锋脱困，本轮补租池增加500人。'],
    ['查探骑阵','侦骑传来敌阵动向，哨兵堵住小道。','取得骑阵情报，解除华雄弓兵攻击优势。','骑阵情报到手，华雄弓兵攻击优势解除。'],
    ['夺回军械','军械辎重停在荥阳，盾兵护住工匠。','本轮攻击+8%，解除吕布防御优势，终战守军−5%。','军械得保，本轮攻击+8%，吕布防御优势解除，终战守军−5%。'],
    ['护送联军医官','医官正在等待联军护送，可收治伤者。','护送医官，获得200人救治额度。','医官抵达，本轮获得200人救治额度。'],
    ['接应勤王援军','勤王援军被西凉骑兵截在侧道。','解围援军，本轮补租池增加500人。','援军抵达，本轮补租池增加500人。'],
    ['夺得西凉营图','西凉传令使携带营图；先问营门，哨兵以归营作答。','取得营图，解除董卓主阵防御优势。','西凉营图到手，董卓防御优势解除。']
  ],nanNodes);
  const campaigns={
    yellow_turban:{id:'yellow_turban',name:'黄巾之乱',arcs:['张梁：断粮救民','张宝：破围夺营','张角：广宗决战'],mainIds:MAIN_IDS,sideIds:SIDE_IDS,finalNode:'m9',minLevel:5,boxItem:'yellowEquipmentBox',setId:'yellow_turban',tier:2,baseReward:{prestige:1000,xp:160},sideReward:{prestige:100,xp:16},pool:3000,limit:800,prefix:'yellow',rescue:['s1','s5'],medical:'s4',attackSide:'s3',supplySide:'s3',discover:'s2',relicNode:'m2',relic:'compass',infiltration:'s6',answer:'rise'},
    nanman:{id:'nanman',name:'南蛮入侵',arcs:['林地：边寨接战','藤甲：渡口破阵','蛮营：孟获决战'],mainIds:nanNodes.filter(n=>n.kind==='main').map(n=>n.id),sideIds:nanNodes.filter(n=>n.kind==='side').map(n=>n.id),finalNode:'n9',minLevel:10,boxItem:'barbarianEquipmentBox',setId:'nanman',tier:3,baseReward:{prestige:1200,xp:200},sideReward:{prestige:100,xp:20},pool:3000,limit:800,prefix:'nanman',rescue:['b1','b5'],medical:'b4',attackSide:null,supplySide:'b3',discover:'b2',relicNode:'n2',relic:'mask',infiltration:'b6',answer:'forest'}
  };
  for(const [id,name,ns,minLevel,baseReward,boxItem,setId,tier,arcs,boss] of [
    ['ten_eunuchs','十常侍之乱',eunuchNodes,15,{prestige:1400,xp:240},'yellowEquipmentBox','yellow_turban',2,['京师：断粮救民','禁苑：接应勤王','河宫：平定乱局'],'张让'],
    ['dongzhuo','讨伐董卓',dongNodes,20,{prestige:1600,xp:280},'barbarianEquipmentBox','nanman',3,['汜水：联军接战','虎牢：截械破阵','洛阳：西凉决战'],'董卓']
  ]){const mainIds=ns.filter(n=>n.kind==='main').map(n=>n.id),sideIds=ns.filter(n=>n.kind==='side').map(n=>n.id);campaigns[id]={id,name,arcs,boss,mainIds,sideIds,finalNode:mainIds[8],minLevel,boxItem,setId,tier,boxNote:'复用'+(setId==='yellow_turban'?'黄巾':'蛮族')+'套装箱，品质与随机七部位不变',baseReward,sideReward:{prestige:100,xp:20},pool:3000,limit:800,prefix:id,rescue:[sideIds[0],sideIds[4]],medical:sideIds[3],attackSide:sideIds[2],supplySide:sideIds[2],discover:sideIds[1],relicNode:null,relic:null,infiltration:sideIds[5],answer:'return',support:id==='ten_eunuchs'?[{node:mainIds[2],side:sideIds[1],stat:'attack',factor:1.05},{node:mainIds[8],side:sideIds[5],stat:'defense',factor:1.1}]:[{node:mainIds[2],side:sideIds[1],stat:'archerAttack',factor:1.08},{node:mainIds[5],side:sideIds[2],stat:'defense',factor:1.12},{node:mainIds[8],side:sideIds[5],stat:'defense',factor:1.1}]};}
  const nodeLists={yellow_turban:nodes,nanman:nanNodes,ten_eunuchs:eunuchNodes,dongzhuo:dongNodes};
  nodes.find(n=>n.id==='s6').intro='口令先说黄天，守卫答当立；祭坛仍需攻下。';
  const clone=x=>JSON.parse(JSON.stringify(x)),list=id=>Object.hasOwn(nodeLists,id)?nodeLists[id]:null;
  function config(id='yellow_turban'){return Object.hasOwn(campaigns,id)?clone(campaigns[id]):null;}
  function catalog(){return Object.values(campaigns).map(c=>({id:c.id,name:c.name,minLevel:c.minLevel,boxItem:c.boxItem}));}
  function validCompleted(done,campaign='yellow_turban'){const ns=list(campaign);return !!ns&&Array.isArray(done)&&new Set(done).size===done.length&&done.every(id=>ns.some(n=>n.id===id))&&done.every(id=>ns.find(n=>n.id===id).requires.every(dep=>done.includes(dep)));}
  function get(id,campaign='yellow_turban'){const n=list(campaign)?.find(n=>n.id===id);return n?clone(n):null;}
  function available(done,campaign='yellow_turban'){return validCompleted(done,campaign)?list(campaign).filter(n=>!done.includes(n.id)&&n.requires.every(id=>done.includes(id))).map(n=>n.id):null;}
  function reward(done,campaign='yellow_turban'){if(!validCompleted(done,campaign))return null;const c=campaigns[campaign],side=done.filter(id=>c.sideIds.includes(id)).length;return {prestige:c.baseReward.prestige+side*c.sideReward.prestige,xp:c.baseReward.xp+side*c.sideReward.xp};}
  const difficulties={simple:{id:'simple',name:'简单',limit:800,pool:3000,guards:1,rewards:1},normal:{id:'normal',name:'普通',limit:1200,pool:4500,guards:1.75,rewards:1.25},hard:{id:'hard',name:'困难',limit:2000,pool:7500,guards:3,rewards:1.5}};
  const difficulty=id=>Object.hasOwn(difficulties,id)?clone(difficulties[id]):null;
  function enemySnapshot(campaign,d='simple'){const c=config(campaign),v=difficulty(d);return c&&v?Object.fromEntries([...c.mainIds,...c.sideIds].map(id=>[id,Object.fromEntries(Object.entries(get(id,campaign).army).map(([unit,n])=>[unit,Math.max(1,Math.floor(n*v.guards))]))])):null;}
  function rewardSnapshot(campaign,d='simple'){const c=config(campaign),v=difficulty(d);return c&&v?{base:{prestige:Math.floor(c.baseReward.prestige*v.rewards),xp:Math.floor(c.baseReward.xp*v.rewards)},side:{prestige:Math.floor(c.sideReward.prestige*v.rewards),xp:Math.floor(c.sideReward.xp*v.rewards)}}:null;}
  function scaledReward(done,campaign,d='simple'){const r=reward(done,campaign),v=difficulty(d);return r&&v?{prestige:Math.floor(r.prestige*v.rewards),xp:Math.floor(r.xp*v.rewards)}:null;}
  return {difficulty,difficulties:()=>Object.keys(difficulties).map(difficulty),enemySnapshot,rewardSnapshot,scaledReward,CONFIG_VERSION:1,MAIN_IDS:Object.freeze(MAIN_IDS),SIDE_IDS:Object.freeze(SIDE_IDS),config,catalog,get,available,reward,validCompleted};
})();
