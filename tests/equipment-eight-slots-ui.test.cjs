const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('./helpers/game.cjs');
function ui(){const e=loadGame();e.evaluate(`
 globalThis.heroListeners=[];document.addEventListener=(type,fn)=>heroListeners.push(fn);
 function S(){return Game.state;}function num(n){return String(n);}function esc(n){return String(n);}function costs(){return '';}function clock(){return '';}
 function generalPortrait(){return '';}function artSprite(){return '';}const HistoricalArt={icons:{ids:['weapons','order','blueprint','scroll','cavalry']}};
 function cityHeroHome(id){return Game.heroCity(id);}function activeCityMeta(){return Game.cityMeta(Game.currentCityId());}function cityName(){return '青溪城';}function heroSalaryHTML(){return '';}
 const modalBody={querySelectorAll:()=>[],querySelector:()=>null};let modalHTML='',modalTitle='';function showModal(title,body,footer){modalTitle=title;modalHTML=body+(footer||'');}
 const modal={close(){}};let page='heroes';function render(){}function toast(){}function actResult(error){return !error;}function btn(text,action,id='',style='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+text+'</button>';}
 `);e.evaluate(fs.readFileSync(path.join(__dirname,'../hero-ui.js'),'utf8'));return e;}
function click(e,action,id=''){e.evaluate(`heroListeners[0]({target:{closest:()=>({dataset:{action:${JSON.stringify(action)},id:${JSON.stringify(id)}},disabled:false})}})`);}
test('hero detail exposes all eight exclusive slots and old accessories retain their attributes',()=>{
 const e=ui(),G=e.Game,H=e.evaluate('HeroSystem');H.gift();H.equip(G.state.equipment.find(x=>x.slot==='accessory').id,'lin');e.evaluate("heroDetailModal('lin')");const html=e.evaluate('modalHTML');
 assert.equal((html.match(/data-action="heroPickEquipment"/g)||[]).length,8);assert.match(html,/坐骑/);assert.match(html,/奇物/);assert.match(html,/内政 \+6/);assert.match(html,/旧制佩饰/);
});
test('mount detail renders speed and separate effects, and omits attribute refining',()=>{
 const e=ui(),H=e.evaluate('HeroSystem'),horse=H.addEquipment(e.Game.state,'mount',1);e.evaluate(`heroEquipmentModal(${horse.id})`);const html=e.evaluate('modalHTML');assert.match(html,/速度.*6/);assert.match(html,/行军.*6%/);assert.match(html,/先手.*3%/);assert.match(html,/骑兵.*6%/);assert.doesNotMatch(html,/基础属性的 15%|data-action="heroRefine"/);
});
test('forge lists seven ordinary parts but only four legacy legendary parts',()=>{
 const e=ui();e.evaluate("Game.state.legendQuest={stage:'done',startAt:0,gathered:true,raids:3,county:true,forgeEnd:0,forgeSlot:''};heroForgeModal()");const html=e.evaluate('modalHTML');assert.equal((html.match(/data-action="heroCraft"/g)||[]).length,21);assert.equal((html.match(/data-action="heroLegend"/g)||[]).length,4);assert.doesNotMatch(html,/data-id="mount\|/);
});
test('mount purchase requires the visible price confirmation and a real successful transaction',()=>{
 const e=ui(),G=e.Game;G.state.res.gold=5000;click(e,'heroBuyMountAsk');assert.match(e.evaluate('modalHTML'),/5000/);assert.equal(G.state.equipment.length,0);click(e,'heroBuyMount');assert.equal(G.state.equipment.length,1);assert.equal(G.state.res.gold,0);
 const before=e.evaluate('modalHTML');click(e,'heroBuyMount');assert.equal(G.state.equipment.length,1);assert.equal(e.evaluate('modalHTML'),before);
});
