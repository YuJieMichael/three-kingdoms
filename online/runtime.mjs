import {createGameRuntime,runtimeHash} from '../supabase/functions/_shared/game-runtime.mjs';
export {createGameRuntime,runtimeHash};
export const copy=value=>JSON.parse(JSON.stringify(value));
export class GameError extends Error {constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
export const gameActions=new Set(['queueBuilding','cancelBuild','demolish','developPlot','setPlotTemplate','applyPlotTemplate','pausePlotTemplate','setAutoUpgrade','setAutoResearch','setAutomationSettings','readAutomationNotices','relocateBuilding','upgrade','train','dismissTroops','research','scout','dispatchScout','refreshInn','recruit','trade','buyItem','useItem','useSpeedup','claimStarterGift','claimReadyMissions','claimTrialGems','setStorage','buildDefense','setGovernor','setTax','executeCivicOrder','dispatch','startBattle','battleRound','setBattleOrder','setBattleOrders','setTactic','recall','dismissBattle','claimMission','acceptDaily','abandonDaily','claimDaily','donateEpic','exchangeCopper','claimDailyMilestone','claimReadyDaily','selectExpedition','recallGarrison','abandonWild','requestCityDefense','setAutoCityDefense','startCityDefense','cityDefenseRound','endDefenseDrill','recruitAllCaptives','recruitCaptives','releaseCaptives','completeFirstBattleGuide','switchCity','enterOwnedCity','foundCity','sendTransport','redeployArmy','recallLogistics','trainGeneralSkill']);
const namespaces={wild:{target:'HeroSystem',nested:'wild',actions:new Set(['discover','buyPortrait','recruit','reward','release'])},hero:{target:'HeroSystem',actions:new Set(['allocate','reset','drill','gift','equip','unequip','forge','enhance','salvage','expand'])},heritage:{target:'HeritageSystem',actions:new Set(['assign','promote','salary','startGather','collectGather','cancelGather'])},war:{target:'WarOrders',actions:new Set(['exchange'])},onboarding:{target:'OnboardingSystem',actions:new Set(['claim','claimAvailable','openItem','hide'])}};
export function validateInput(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new GameError('BAD_INPUT','请求格式无效');
 if(typeof input.commandId!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(input.commandId))throw new GameError('BAD_COMMAND_ID','操作编号无效');
 if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0)throw new GameError('BAD_REVISION','进度版本无效');
 if(typeof input.type!=='string'||!Array.isArray(input.args)||input.args.length>8||JSON.stringify(input.args).length>50000)throw new GameError('BAD_COMMAND','操作参数无效');
 return input;
}
export function scopedRuntime(snapshot,now,marches=[],actor=null,sourceCity=null,random){
 const runtime=createGameRuntime({snapshot,now,random}),g=runtime.Game;
 g.setExternalGeneralBusy(marches.filter(m=>m.source===actor&&m.status!=='done').map(m=>m.general));
 // Allied troops live in server escrow, outside the city's native army arrays.
 // Charge their stationary upkeep from the persisted city timestamp exactly once.
 for(const id of new Set(marches.filter(m=>m.source===actor&&m.kind==='aid'&&m.status==='stationed').map(m=>m.sourceCity||'capital'))){
  if(!g.state.realm.cities[id])continue;g.switchCity(id);
  const from=snapshot?.realm?.cities?.[id]?.data?.last??snapshot?.last??now;
  const cost=marches.filter(m=>m.source===actor&&m.kind==='aid'&&m.status==='stationed'&&(m.sourceCity||'capital')===id).reduce((sum,m)=>sum+g.upkeep(m.army)*2*Math.max(0,now-Math.max(from,m.arrive))/60000,0);
  g.state.res.food=Math.max(0,g.state.res.food-Math.ceil(cost));g.save();
 }
 if(sourceCity!==null){if(typeof sourceCity!=='string'||!g.state.realm.cities[sourceCity])throw new GameError('CITY_NOT_OWNED','出发城市不属于你');g.switchCity(sourceCity);}
 return runtime;
}
export function executeGame(snapshot,input,now,random,runtime=null){
 validateInput(input);runtime=runtime||scopedRuntime(snapshot,now,[],null,input.sourceCity||'capital',random);runtime.Game.tick(now,true);
 let result;
 if(gameActions.has(input.type)&&typeof runtime.Game[input.type]==='function')result=runtime.Game[input.type](...copy(input.args));
 else {
  const [namespace,action,...rest]=input.type.split('.'),definition=namespaces[namespace];
  if(rest.length||!definition?.actions.has(action))throw new GameError('COMMAND_NOT_ALLOWED','服务器不支持此操作');
  const object=definition.nested?runtime[definition.target][definition.nested]:runtime[definition.target];
  if(typeof object[action]!=='function')throw new GameError('COMMAND_NOT_AVAILABLE','此操作尚未接入服务器');
  result=object[action](...copy(input.args));
 }
 if(typeof result==='string'&&result)throw new GameError('GAME_RULE',result);
 if(result?.error)throw new GameError('GAME_RULE',result.error);
 runtime.Game.save();if(!runtime.Game.validSave(runtime.Game.state))throw new GameError('INVALID_RESULT','操作产生无效状态',500);
 return {state:copy(runtime.Game.state),result:result??null,runtime};
}
export function seededRandom(seed){let value=seed>>>0;return ()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);}
export function fingerprint(value){return JSON.stringify(value);}
