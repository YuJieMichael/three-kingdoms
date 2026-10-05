const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
function settings(g,change={}){const a=g.state.automation;return {researchFocus:a.researchFocus,researchPriority:a.researchPriority,reserve:{...a.reserve},notify:a.notify,...change};}
function campus(g){city(g,{academy:3,smith:1});g.state.plots[0]={type:'farm',level:1};g.state.plots[1]={type:'lumber',level:1};for(const k of Object.keys(g.resources))g.state.res[k]=100000;}
test('legacy settings migrate without rewriting progress; malformed settings are rejected',()=>{
 const {Game:g}=loadGame();const old=JSON.parse(JSON.stringify(g.state));delete old.automation;g.importSave(old);assert.equal(g.state.automation.researchFocus,'balanced');assert.equal(g.state.automation.notices.length,0);
 const snapshot=JSON.stringify(g.state);for(const update of [{researchFocus:'bad'},{researchPriority:'missing'},{reserve:{...g.state.automation.reserve,gold:-1}},{reserve:{...g.state.automation.reserve,food:1.5}},{reserve:{food:0}},{notify:'true'}])assert.ok(g.setAutomationSettings(settings(g,update)));assert.equal(JSON.stringify(g.state),snapshot);
});
test('economic and military priorities alter choice before level ordering',()=>{
 for(const [focus,expected] of [['economy','plant'],['military','training']]){const {Game:g}=loadGame();campus(g);g.state.tech.scouting=10;g.setAutomationSettings(settings(g,{researchFocus:focus}));g.setAutoResearch(true);assert.equal(g.state.researchQueue.id,expected);}
});
test('explicit technology priority wins and falls back if unaffordable',()=>{
 const {Game:g}=loadGame();campus(g);g.setAutomationSettings(settings(g,{researchPriority:'researching'}));g.setAutoResearch(true);assert.equal(g.state.researchQueue.id,'researching');
 const {Game:h}=loadGame();campus(h);h.state.res.food=0;h.setAutomationSettings(settings(h,{researchPriority:'plant'}));h.setAutoResearch(true);assert.equal(h.state.researchQueue.id,'logging');
});
test('research waits at reserves then resumes once settings permit payment',()=>{
 const {Game:g}=loadGame();city(g,{academy:1});g.state.res.food=5000;g.state.res.gold=10000;g.setAutomationSettings(settings(g,{reserve:{...g.state.automation.reserve,food:1000}}));g.setAutoResearch(true);assert.equal(g.state.researchQueue,null);assert.match(g.autoResearchStatus(),/保留额度/);
 g.setAutomationSettings(settings(g,{reserve:{...g.state.automation.reserve,food:0}}));assert.equal(g.state.researchQueue.id,'researching');assert.equal(g.state.res.food,0);assert.equal(g.state.res.gold,6600);
});
test('automatic building respects every payment reserve; manual research can spend retained stock',()=>{
 const {Game:g}=loadGame();campus(g);city(g,{house:1});const reserve=Object.fromEntries(Object.keys(g.resources).map(k=>[k,100000]));g.setAutomationSettings(settings(g,{reserve}));g.setAutoUpgrade(true);g.setAutoResearch(true);assert.equal(g.state.buildQueue.length,0);assert.equal(g.state.researchQueue,null);
 assert.equal(g.research('plant'),null);assert.equal(g.state.res.food,99500);assert.equal(g.state.res.gold,99000);assert.equal(g.state.autoResearch,true);
});
test('settings and active queue survive reload without a duplicate payment',()=>{
 const {Game:g}=loadGame();campus(g);g.setAutomationSettings(settings(g,{researchFocus:'military',researchPriority:'researching',reserve:{...g.state.automation.reserve,food:1000,gold:2000}}));g.setAutoResearch(true);const a=JSON.stringify(g.state.automation),q=JSON.stringify(g.state.researchQueue),stock=JSON.stringify(g.state.res);g.save();g.init();assert.equal(JSON.stringify(g.state.automation),a);assert.equal(JSON.stringify(g.state.researchQueue),q);assert.equal(JSON.stringify(g.state.res),stock);
});
test('research completion creates one persistent unread notice; reading is independent of queue settlement',()=>{
 const e=loadGame(),g=e.Game;campus(g);g.research('plant');e.advance(g.state.researchQueue.end-e.now()+1);assert.equal(g.automation.unread(g.state),1);assert.match(g.state.automation.notices[0].text,/种植技术/);g.tick();g.tick();assert.equal(g.state.automation.notices.length,1);
 g.readAutomationNotices();g.save();g.init();assert.equal(g.automation.unread(g.state),0);assert.equal(g.state.automation.notices.length,1);assert.equal(g.state.tech.plant,1);
});
test('offline completion records existing queue and disabled notices stay silent',()=>{
 const e=loadGame(),g=e.Game;campus(g);g.research('plant');e.offline(3*86400000);assert.equal(g.state.automation.notices.length,1);g.setAutomationSettings(settings(g,{notify:false}));g.research('logging');e.advance(g.state.researchQueue.end-e.now()+1);assert.equal(g.state.automation.notices.length,1);assert.equal(g.validSave(g.state),true);
});
test('notice storage is bounded and imported malformed histories fail validation',()=>{
 const {Game:g}=loadGame();for(let i=0;i<50;i++)g.automation.record(g.state,'research',{id:'plant',level:1},Date.now()+i);assert.equal(g.state.automation.notices.length,30);assert.equal(g.state.automation.notices[0].id,50);assert.equal(g.validSave(g.state),true);
 for(const history of [[null],[{id:1,kind:'research',text:'x',at:9000000000000000,read:false}],[{id:1,kind:'hack',text:'x',at:1,read:false}],[{id:1,kind:'research',text:'x',at:-1,read:false}],[{id:1,kind:'research',text:'x',at:1,read:'yes'}]]){const save=JSON.parse(JSON.stringify(g.state));save.automation.notices=history;assert.equal(g.validSave(save),false);}
});
