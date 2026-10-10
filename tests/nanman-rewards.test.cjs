const {test}=require('node:test'),assert=require('node:assert/strict');const {nanReady,clear,beginNan,plain}=require('./helpers/nanman.cjs');
test('alternating campaign settlements preserve two first-clear boxes and independently halve repeats',()=>{
 const e=nanReady(),G=e.Game;const a=clear(e,'nanman',true);assert.deepEqual([a.prestige,a.xp,a.box],[1800,320,1]);assert.equal(G.validSave(G.state),true);
 const y=clear(e,'yellow_turban'),n=clear(e,'nanman',true);assert.deepEqual([y.prestige,y.xp,y.box],[500,80,0]);assert.deepEqual([n.prestige,n.xp,n.box],[900,160,0]);
 assert.equal(G.state.inventory.yellowEquipmentBox,1);assert.equal(G.state.inventory.barbarianEquipmentBox,1);assert.equal(G.state.battlefields.daily.yellow_turban.count,2);assert.equal(G.state.battlefields.daily.nanman.count,2);assert.equal(G.validSave(G.state),true);
 const before=JSON.stringify(G.state);G.battlefieldRound();assert.equal(JSON.stringify(G.state),before);e.advance(86400000);const ny=clear(e,'yellow_turban'),nn=clear(e,'nanman');assert.deepEqual([ny.box,nn.box],[1,1]);assert.deepEqual([nn.prestige,nn.xp],[1200,200]);assert.equal(G.validSave(G.state),true);
 beginNan(e);const s=plain({p:G.state.prestige,box:G.state.inventory.barbarianEquipmentBox,daily:G.state.battlefields.daily});assert.equal(G.abandonBattlefield(G.state.battlefields.run.id),null);assert.deepEqual(plain({p:G.state.prestige,box:G.state.inventory.barbarianEquipmentBox,daily:G.state.battlefields.daily}),s);
});
test('mask claim keeps a full warehouse eligibility and grants only one permanent item',()=>{
 const e=nanReady(),G=e.Game,H=e.evaluate('HeroSystem');beginNan(e);for(const id of ['n1','n2']){assert.equal(G.enterBattlefieldNode(id),null);const b=G.state.battlefields.run.battle;for(let i=0;i<30&&!b.finished;i++)G.battlefieldRound();assert.equal(b.result.won,true);}
 while(G.state.equipment.length<G.state.equipmentCapacity)H.addEquipment(G.state,'weapon',1);assert.ok(G.claimBattlefieldRelic('mask'));assert.equal(G.state.battlefields.relics.mask.claimed,false);assert.equal(H.salvage(G.state.equipment[0].id),null);assert.equal(G.claimBattlefieldRelic('mask'),null);assert.ok(G.claimBattlefieldRelic('mask'));assert.equal(G.state.equipment.filter(x=>x.relic==='mask').length,1);assert.equal(G.validSave(G.state),true);
});
