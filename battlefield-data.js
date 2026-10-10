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
    ['s3','解放军械库',2,{shield:80,archer:40},'工匠被困军械库，尚有器械可用。','解放工匠，使本轮攻击提高8%。','器械送抵军中，本轮攻击提高8%。','军械库仍被占据，器械无法运出。'],
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
    ['b3','截断藤油',2,{shield:100,spear:60},'油车沿山道送入藤甲营，守军紧随。','拦截油车，解除藤甲统领防御优势。','藤油供应断绝，藤甲防御优势解除。','油车仍在通行，藤甲防御优势保留。'],
    ['b4','护送药师',2,{},'药师愿随军救治，需有人护送过渡口。','护送药师，取得200人救治额度。','药师安全抵达，取得200人救治额度。','药师仍在等待，本轮尚无救治额度。'],
    ['b5','解救被困援军',3,{spear:120,cavalry:50},'援军困在山谷，旗号遥遥可见。','击退围兵，补租池增加500人。','援军脱困，本轮补租池增加500人。','围兵仍在，援军暂时无法接应。'],
    ['b6','截获军情',3,{shield:100,archer:70},'来使先问山路，守卫以归林作答。','取得军情，解除孟获防御优势；面具可减少守军。','军情到手，孟获防御优势解除。','军情未得，可补租后正面重试。']
  ];
  const nanNodes=nanRows.map(([id,name,arc,army,intro,objective,victory,defeat])=>({id,name,arc,army,intro,objective,victory,defeat,kind:id[0]==='n'?'main':'side',requires:id[0]==='n'?(id==='n1'?[]:['n'+(Number(id.slice(1))-1)]):arc===1?[]:['n'+((arc-1)*3)],dialogue:id==='b4'}));
  const campaigns={
    yellow_turban:{id:'yellow_turban',name:'黄巾之乱',arcs:['张梁：断粮救民','张宝：破围夺营','张角：广宗决战'],mainIds:MAIN_IDS,sideIds:SIDE_IDS,finalNode:'m9',minLevel:5,boxItem:'yellowEquipmentBox',setId:'yellow_turban',tier:2,baseReward:{prestige:1000,xp:160},sideReward:{prestige:100,xp:16},pool:3000,limit:800,prefix:'yellow',rescue:['s1','s5'],medical:'s4',attackSide:'s3',discover:'s2',relicNode:'m2',relic:'compass',infiltration:'s6',answer:'rise'},
    nanman:{id:'nanman',name:'南蛮入侵',arcs:['林地：边寨接战','藤甲：渡口破阵','蛮营：孟获决战'],mainIds:nanNodes.filter(n=>n.kind==='main').map(n=>n.id),sideIds:nanNodes.filter(n=>n.kind==='side').map(n=>n.id),finalNode:'n9',minLevel:10,boxItem:'barbarianEquipmentBox',setId:'nanman',tier:3,baseReward:{prestige:1200,xp:200},sideReward:{prestige:100,xp:20},pool:3000,limit:800,prefix:'nanman',rescue:['b1','b5'],medical:'b4',attackSide:null,discover:'b2',relicNode:'n2',relic:'mask',infiltration:'b6',answer:'forest'}
  };
  nodes.find(n=>n.id==='s6').intro='口令先说黄天，守卫答当立；祭坛仍需攻下。';
  const clone=x=>JSON.parse(JSON.stringify(x)),list=id=>id==='yellow_turban'?nodes:id==='nanman'?nanNodes:null;
  function config(id='yellow_turban'){return Object.hasOwn(campaigns,id)?clone(campaigns[id]):null;}
  function catalog(){return Object.values(campaigns).map(c=>({id:c.id,name:c.name,minLevel:c.minLevel,boxItem:c.boxItem}));}
  function validCompleted(done,campaign='yellow_turban'){const ns=list(campaign);return !!ns&&Array.isArray(done)&&new Set(done).size===done.length&&done.every(id=>ns.some(n=>n.id===id))&&done.every(id=>ns.find(n=>n.id===id).requires.every(dep=>done.includes(dep)));}
  function get(id,campaign='yellow_turban'){const n=list(campaign)?.find(n=>n.id===id);return n?clone(n):null;}
  function available(done,campaign='yellow_turban'){return validCompleted(done,campaign)?list(campaign).filter(n=>!done.includes(n.id)&&n.requires.every(id=>done.includes(id))).map(n=>n.id):null;}
  function reward(done,campaign='yellow_turban'){if(!validCompleted(done,campaign))return null;const c=campaigns[campaign],side=done.filter(id=>c.sideIds.includes(id)).length;return {prestige:c.baseReward.prestige+side*c.sideReward.prestige,xp:c.baseReward.xp+side*c.sideReward.xp};}
  return {CONFIG_VERSION:1,MAIN_IDS:Object.freeze(MAIN_IDS),SIDE_IDS:Object.freeze(SIDE_IDS),config,catalog,get,available,reward,validCompleted};
})();
