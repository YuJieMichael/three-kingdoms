const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs'),plain=x=>JSON.parse(JSON.stringify(x));
const data=()=>loadGame().evaluate('BattlefieldData');
test('nanman main route opens branches after bosses and cannot import yellow nodes',()=>{
 const d=data();assert.deepEqual(plain(d.available([],'nanman')),['n1','b1','b2']);
 assert.deepEqual(plain(d.available(['n1','n2','n3'],'nanman')),['n4','b1','b2','b3','b4']);
 assert.ok(d.available(['n1','n2','n3','n4','n5','n6'],'nanman').includes('b6'));
 for(const done of [['m1'],['n2'],['n1','n1']])assert.equal(d.available(done,'nanman'),null);
 assert.equal(d.available([],'fake'),null);
});
test('nanman full clear counts each optional contribution exactly once',()=>{
 const d=data(),main=Array.from({length:9},(_,i)=>'n'+(i+1)),side=Array.from({length:6},(_,i)=>'b'+(i+1));
 assert.deepEqual(plain(d.reward(main,'nanman')),{prestige:1200,xp:200});
 assert.deepEqual(plain(d.reward([...main,...side],'nanman')),{prestige:1800,xp:320});
 assert.equal(d.reward([...main,'b1','b1'],'nanman'),null);
});
test('campaign projections cannot change later battle or rental rules',()=>{
 const d=data();assert.equal(typeof d.catalog,'function');assert.equal(d.catalog().length,2);
 const c=d.config('nanman');c.pool=999;assert.equal(d.config('nanman').pool,3000);
 const n=d.get('n3','nanman');assert.ok(n);n.army.archer=999;assert.equal(d.get('n3','nanman').army.archer,100);
 for(const id of [...d.config('nanman').mainIds,...d.config('nanman').sideIds])for(const key of ['intro','objective','victory','defeat'])assert.ok(d.get(id,'nanman')[key].length>5);
});
