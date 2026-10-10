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
  const clone=x=>JSON.parse(JSON.stringify(x));
  const validCompleted=done=>Array.isArray(done)&&new Set(done).size===done.length&&done.every(id=>nodes.some(n=>n.id===id))&&done.every(id=>nodes.find(n=>n.id===id).requires.every(dep=>done.includes(dep)));
  function get(id){const n=nodes.find(n=>n.id===id);return n?clone(n):null;}
  function available(done){return validCompleted(done)?nodes.filter(n=>!done.includes(n.id)&&n.requires.every(id=>done.includes(id))).map(n=>n.id):null;}
  function reward(done){if(!validCompleted(done))return null;const side=done.filter(id=>SIDE_IDS.includes(id)).length;return {prestige:1000+side*100,xp:160+side*16};}
  return {CONFIG_VERSION:1,MAIN_IDS:Object.freeze(MAIN_IDS),SIDE_IDS:Object.freeze(SIDE_IDS),get,available,reward,validCompleted};
})();
