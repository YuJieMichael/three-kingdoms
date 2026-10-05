'use strict';
// Shared play submits intent to game-api; local saves remain separate.
const OnlineClient=(()=>{
 const CONFIG_KEY='three-kingdoms.online-config.v1',SDK_URL='https://esm.sh/@supabase/supabase-js@2.117.2';
 let config=null,sdk=null,user=null,mode='local',revision=0,privateRevision=0,world=null,lastError='',lastCode='',busy=false,queue=[],failedCommand=null,pollTimer=null,serverOffset=0,privateCandidate=null,privateConflict=null,localBattleAuto=false,installed=false;
 try{config=window.ThreeKingdomsOnlineConfig||JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');}catch{}
 const clone=value=>JSON.parse(JSON.stringify(value));
 const commandId=()=>crypto.randomUUID().replaceAll('-','');
 function notify(){document.dispatchEvent(new CustomEvent('online-state'));}
 function errorMessage(error){return error?.message||'云端连接失败，请稍后重试';}
 function validateConfig(value){
  let url;try{url=new URL(value.url);}catch{return '请输入有效的 Supabase 项目地址';}
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))return '项目地址需使用 HTTPS';
  if(value.realm&&!/^[a-z0-9_-]{1,40}$/.test(value.realm))return '世界编号只接受小写字母、数字、下划线或短横线';const key=String(value.publishableKey||value.anonKey||'').trim();if(!key)return '请输入项目 publishable key';
  if(key.startsWith('sb_secret_'))return '这里仅接收 publishable key，不能使用 secret key';
  if(key.startsWith('eyJ')){try{const payload=JSON.parse(atob(key.split('.')[1].replaceAll('-','+').replaceAll('_','/')));if(payload.role!=='anon')return '旧式密钥必须为 anon，不能使用服务端密钥';}catch{return '密钥格式无效';}}
  else if(!key.startsWith('sb_publishable_'))return '请输入 publishable key 或旧式 anon key';
  if(value.apiUrl){let api;try{api=new URL(value.apiUrl);}catch{return '游戏 API 地址无效';}if(api.origin!==url.origin)return '游戏 API 必须属于同一 Supabase 项目';}
  return '';
 }
 async function configure(value){const error=validateConfig(value);if(error)return error;if(mode==='shared')return '请先返回单机进度，再更换云端连接';if(sdk)await sdk.auth.signOut();config={url:new URL(value.url).origin,publishableKey:String(value.publishableKey||value.anonKey).trim(),realm:String(value.realm||'china-1'),...(value.apiUrl?{apiUrl:value.apiUrl}:{})};localStorage.setItem(CONFIG_KEY,JSON.stringify(config));sdk=null;user=null;lastError='';notify();return null;}
 async function client(){
  if(!config)throw new Error('云端服务尚未配置');const validation=validateConfig(config);if(validation)throw new Error(validation);
  if(!sdk){const module=await import(SDK_URL);sdk=module.createClient(config.url,config.publishableKey||config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'three-kingdoms-auth-'+new URL(config.url).hostname}});sdk.auth.onAuthStateChange((event,session)=>{user=session?.user||null;if(!user&&mode==='shared'){localBattleAuto=false;lastError='登录已失效，请重新登录后继续共享世界';}notify();});}
  return sdk;
 }
 async function sessionToken(){const c=await client();let {data,error}=await c.auth.getSession();if(error)throw error;let session=data.session;if(!session)throw new Error('请先登录游戏账号');if((session.expires_at||0)*1000<Date.now()+60000){const refreshed=await c.auth.refreshSession();if(refreshed.error)throw refreshed.error;session=refreshed.data.session;}const checked=await c.auth.getUser(session.access_token);if(checked.error||!checked.data.user)throw checked.error||new Error('登录验证失败');user=checked.data.user;return session.access_token;}
 async function auth(kind,email,password){const c=await client();const result=kind==='register'?await c.auth.signUp({email,password}):await c.auth.signInWithPassword({email,password});if(result.error)throw result.error;user=result.data.user;if(result.data.session)await sessionToken();notify();return {confirmation:!result.data.session};}
 async function boot(){install();if(config){try{const c=await client(),{data}=await c.auth.getSession();if(data.session)await sessionToken();}catch(error){lastError=errorMessage(error);}notify();}}
 async function request(body){
  const token=await sessionToken(),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);let response;try{response=await fetch(config.apiUrl||config.url+'/functions/v1/game-api',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey||config.anonKey,Authorization:'Bearer '+token},body:JSON.stringify({realm:config.realm||'china-1',...body}),signal:controller.signal});}finally{clearTimeout(timeout);}
  let data;try{data=await response.json();}catch{throw new Error('游戏服务没有返回有效数据');}
  if(!response.ok||!data.ok){const error=new Error(data.error?.message||'云端请求失败');error.code=data.error?.code;error.status=response.status;throw error;}
  if(data.serverTime)serverOffset=data.serverTime-Date.now();return data;
 }
 function apply(data,enter=false){if(!enter&&data.revision!==undefined&&data.revision<revision)return;if(data.state){const error=enter?Game.enterOnlineSession(data.state):Game.applyOnlineSnapshot(data.state);if(error)throw new Error(error);}revision=data.revision??revision;lastCode='';if(data.world)world=data.world;lastError='';notify();document.dispatchEvent(new CustomEvent('online-snapshot',{detail:data}));}
 async function openShared(create=false){
  if(busy)throw new Error('请等待当前云端操作完成');busy=true;notify();
  try{let data=await request(create?{op:'create-realm',commandId:commandId(),expectedRevision:0,type:'create-realm',args:[]}:{op:'state'});if(!data.world)data=await request({op:'state'});apply(data,mode!=='shared');mode='shared';failedCommand=null;localBattleAuto=false;startPolling();notify();return data;}catch(error){lastError=errorMessage(error);throw error;}finally{busy=false;notify();}
 }
 async function leaveShared(){if(failedCommand)throw new Error('上一条指令结果尚未确认，请先用同一编号重试，再返回单机');if(busy||queue.length)throw new Error('请等待当前操作完成');stopPolling();const error=await Game.leaveOnlineSession();if(error)throw new Error(error);mode='local';world=null;revision=0;failedCommand=null;localBattleAuto=false;lastError='';notify();document.dispatchEvent(new CustomEvent('online-snapshot'));}
 async function logout(){if(mode==='shared')await leaveShared();const c=await client(),result=await c.auth.signOut();if(result.error)throw result.error;user=null;notify();}
 function enqueue(type,args,sourceCity=Game.currentCityId?.()){
  if(mode!=='shared')return '请先进入共享世界';if(!user)return '请重新登录后操作';if(failedCommand)return '上一条指令尚未确认，请先重试或刷新云端进度';
  queue.push({op:'command',commandId:commandId(),type,args:clone(args),sourceCity});notify();if(!busy)void drain();return null;
 }
 async function drain(){
  if(busy||!queue.length)return;busy=true;notify();
  try{while(queue.length){const next=queue[0];next.expectedRevision=revision;try{const data=await request(next);queue.shift();if(data.replayed&&data.revision<revision)apply(await request({op:'state'}));else apply(data);document.dispatchEvent(new CustomEvent('online-command',{detail:{type:next.type,args:next.args,result:data.result}}));}catch(error){queue=[];lastError=errorMessage(error);lastCode=error.code||'';if(!error.status||error.status>=500)failedCommand=clone(next);else failedCommand=null;document.dispatchEvent(new CustomEvent('online-error',{detail:{message:lastError,code:error.code,uncertain:!!failedCommand}}));break;}}}finally{busy=false;notify();}
 }
 async function retry(){if(!failedCommand||busy)return;busy=true;notify();try{const data=await request(failedCommand);if(data.replayed&&data.revision<revision)apply(await request({op:'state'}));else apply(data);failedCommand=null;document.dispatchEvent(new CustomEvent('online-command',{detail:{type:'retry',result:data.result}}));}catch(error){lastError=errorMessage(error);if(error.status&&error.status<500)failedCommand=null;throw error;}finally{busy=false;notify();}}
 async function refresh(){if(mode!=='shared'||busy||queue.length)return;busy=true;notify();try{const data=await request({op:'state'});apply(data);}catch(error){lastError=errorMessage(error);throw error;}finally{busy=false;notify();}}
 function startPolling(){stopPolling();pollTimer=setInterval(()=>{if(document.visibilityState==='hidden'||mode!=='shared'||busy||queue.length||failedCommand)return;void refresh().catch(()=>{});},15000);}
 function stopPolling(){if(pollTimer)clearInterval(pollTimer);pollTimer=null;}
 async function readPrivate(){const data=await request({op:'private-load'});privateRevision=data.revision;privateCandidate=data.state?clone(data.state):null;notify();return data;}
 async function savePrivate(){if(mode==='shared')throw new Error('请先返回单机进度，再保存私人云档');if(!Game.saveSessionInfo().writable)throw new Error(Game.saveSessionInfo().reason);const local=clone(Game.state);try{const data=await request({op:'private-save',commandId:commandId(),expectedRevision:privateRevision,type:'private-save',args:[],state:local});privateRevision=data.revision;privateConflict=null;notify();return data;}catch(error){if(error.status===409){privateConflict={local,revision:privateRevision,message:errorMessage(error)};notify();}throw error;}}
 function importPrivate(){if(mode==='shared')return '请先返回单机';if(!privateCandidate)return '没有可恢复的私人云档';if(!Game.saveSessionInfo().writable)return Game.saveSessionInfo().reason;try{Game.importSave(clone(privateCandidate));privateCandidate=null;privateConflict=null;notify();document.dispatchEvent(new CustomEvent('online-snapshot'));return null;}catch(error){return errorMessage(error);}}
 function clearConflict(){privateConflict=null;notify();}
 function wrap(object,name,type=name,shape='normal'){if(typeof object?.[name]!=='function')return;const original=object[name];object[name]=function(...args){if(mode!=='shared')return original.apply(this,args);const error=enqueue(type,args);return shape==='object'?{error,pending:!error}:error;};}
 function install(){
  if(installed)return;installed=true;const localGeneralBusy=Game.generalBusy;if(typeof localGeneralBusy==='function')Game.generalBusy=id=>localGeneralBusy(id)||(mode==='shared'&&!!world?.marches?.some(m=>m.source===user?.id&&m.general===id&&m.status!=='done'));
  const actions='queueBuilding cancelBuild demolish developPlot setPlotTemplate applyPlotTemplate pausePlotTemplate setAutoUpgrade setAutoResearch setAutomationSettings readAutomationNotices relocateBuilding upgrade train dismissTroops research scout dispatchScout refreshInn recruit trade buyItem useItem claimStarterGift claimReadyMissions claimTrialGems setStorage buildDefense setGovernor setTax executeCivicOrder dispatch startBattle battleRound setBattleOrder setBattleOrders setTactic recall dismissBattle claimMission acceptDaily abandonDaily claimDaily donateEpic exchangeCopper claimDailyMilestone claimReadyDaily selectExpedition recallGarrison abandonWild requestCityDefense setAutoCityDefense startCityDefense cityDefenseRound endDefenseDrill recruitAllCaptives recruitCaptives releaseCaptives completeFirstBattleGuide switchCity enterOwnedCity foundCity sendTransport redeployArmy recallLogistics trainGeneralSkill'.split(' ');
  for(const name of actions)wrap(Game,name);wrap(Game,'useSpeedup','useSpeedup','object');
  for(const name of ['allocate','reset','drill','gift','equip','unequip','forge','enhance','salvage','expand'])wrap(HeroSystem,name,'hero.'+name);
  for(const name of ['discover','buyPortrait','recruit','reward','release'])wrap(HeroSystem.wild,name,'wild.'+name);
  for(const name of ['assign','promote','salary','startGather','collectGather','cancelGather'])wrap(HeritageSystem,name,'heritage.'+name);
  wrap(WarOrders,'exchange','war.exchange');wrap(OnboardingSystem,'claim','onboarding.claim');wrap(OnboardingSystem,'claimAvailable','onboarding.claimAvailable');wrap(OnboardingSystem,'openItem','onboarding.openItem');wrap(OnboardingSystem,'hide','onboarding.hide');
  for(const name of ['reset','importSave','restoreSaveBackup','takeOverSaveSession','setSpeed','grantTestSupplies']){const original=Game[name];if(typeof original!=='function')continue;Game[name]=function(...args){if(mode==='shared'){const message='共享世界由服务器管理；请返回单机后使用此功能';if(name==='importSave')throw new Error(message);return message;}return original.apply(this,args);};}
 }
 return {boot,configure,auth,logout,openShared,leaveShared,enqueue,refresh,retry,readPrivate,savePrivate,importPrivate,clearConflict,install,now:()=>Date.now()+serverOffset,setBattleAuto:value=>{localBattleAuto=!!value;notify();},battleAuto:()=>localBattleAuto,status:()=>({configured:!!config,config:config?{url:config.url,realm:config.realm||'china-1'}:null,user:user?{id:user.id,email:user.email}:null,mode,revision,privateRevision,world,lastError,lastCode,busy:busy||queue.length>0,uncertain:!!failedCommand,privateCandidate,privateConflict}),pending:()=>mode==='shared'&&(busy||queue.length>0),shared:()=>mode==='shared'};
})();
