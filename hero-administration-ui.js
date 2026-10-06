'use strict';
let heroAdministrationDraft=null;
function heroAdministrationApi(){return {currentCityId:()=>Game.currentCityId(),generalBusy:id=>Game.generalBusy(id)};}
function heroAdministrationProfile(id){
  const p=typeof HeroAdministration==='undefined'?null:HeroAdministration.profile(S(),Game.general(id),heroAdministrationApi());
  return p&&typeof Game.domesticStrategyAvailable==='function'&&!Game.domesticStrategyAvailable()?{...p,active:false,transportFoodFactor:1,unavailable:true,reason:'当前共享世界暂未开放名将内政职责'}:p;
}
function heroAdministrationCostHTML(cost){return `<p class="administration-cost">${Object.entries(cost||{}).map(([id,n])=>`${esc(Game.resources[id]?.name||id)} <strong>${num(n)}</strong>`).join(' · ')}</p>`;}
function heroAdministrationHTML(id){
  const p=heroAdministrationProfile(id);if(!p?.id)return '';
  const state=S(),prepared=state.heroAdministration?.prepared,ready=p.id==='pangtong'?(p.unavailable?{ready:false,reason:p.reason}:HeroAdministration.defensePrepared(state,Game.general(id),Game.currentCityId(),heroAdministrationApi())):null;
  return `<section class="hero-administration" aria-label="名将内政职责"><div class="section-title"><h3>${esc(p.name)} · ${esc(p.title)}</h3><span class="badge">${p.unavailable?'共享世界暂未开放':p.active?'本城职责生效':'需任本城城守'}</span></div><p>${esc(p.description)}</p><p class="hint">${esc(p.condition)}</p>${p.reason?`<p class="hint">${esc(p.reason)}</p>`:''}${p.id==='pangtong'?`${prepared?`<p class="administration-prepared">本城已有一份备防 · 城门耐久 +20%${ready.ready?'，用于下一次正式守城':`；${esc(ready.reason)}`}</p>`:''}${heroAdministrationCostHTML(HeroAdministration.COST)}${btn(prepared?'查看已筹备城防':'预览筹备城防','heroAdministrationAsk',id,'small secondary')}`:''}</section>`;
}
function cityAdministrationHTML(){
  const state=S(),id=state.governor,p=id?heroAdministrationProfile(id):null,prepared=state.heroAdministration?.prepared;
  if(!p?.id&&!prepared)return '';
  const current=p?.id?heroAdministrationHTML(id):'';
  if(!prepared||p?.id==='pangtong'&&p.hero===prepared.hero)return current;
  const creator=Game.general(prepared.hero);
  return current+`<section class="hero-administration" aria-label="本城备防"><div class="section-title"><h3>本城备防</h3><span class="badge">已筹备一次</span></div><p>城门耐久 +20%，仅用于下一次正式守城。</p><p class="hint">需要${esc(creator.name)}留在本城并重新担任城守；演练不消耗，备防随本城保存。</p>${btn('查看筹备条件','heroAdministrationAsk',prepared.hero,'small secondary')}</section>`;
}
function heroAdministrationQuote(id){return typeof Game.heroAdministrationQuote==='function'?Game.heroAdministrationQuote(id):HeroAdministration.prepareQuote(S(),Game.general(id),Game.currentCityId(),Date.now(),heroAdministrationApi());}
function heroAdministrationReview(id){
  const g=Game.general(id),q=heroAdministrationQuote(id),prepared=S().heroAdministration?.prepared,writable=Game.saveSessionInfo?.().writable!==false;
  heroAdministrationDraft={hero:id,city:Game.currentCityId(),key:q.key};
  showModal('筹备城防 · '+esc(g.name),`<p class="sub">本城：${esc(Game.cityMeta()?.name||'当前城池')} · 官府4级、城墙2级</p><p>${esc(q.description)}</p>${heroAdministrationCostHTML(q.cost)}<p class="hint">${esc(q.condition)}</p>${prepared?'<p class="administration-prepared">本城已经筹备一份，不能重复投入或叠加。只有原筹备者留城任城守时可用于下一次正式守城。</p>':''}${q.reason?`<p class="notice">${esc(q.reason)}</p>`:''}${!writable?'<p class="hint">本页为只读，可以查看条件，不能支付筹备资源。</p>':''}`,btn('关闭','close','','secondary')+(!prepared?btn('支付并筹备一次','heroAdministrationPrepare','','',!q.ok||!writable):''));
}
function handleHeroAdministrationAction(action,id){
  if(action==='heroAdministrationAsk'){heroAdministrationReview(id);return true;}
  if(action!=='heroAdministrationPrepare')return false;
  const draft=heroAdministrationDraft;
  if(!draft||draft.city!==Game.currentCityId()){toast('城池已切换，请重新查看筹备条件');return true;}
  if(Game.saveSessionInfo?.().writable===false){toast('本页为只读，不能支付筹备资源');return true;}
  if(typeof Game.prepareHeroAdministration!=='function'){toast('当前模式暂未接入城防筹备');return true;}
  const result=Game.prepareHeroAdministration(draft.hero,draft.key),reason=typeof result==='string'?result:result?.ok===false?result.reason:'';
  if(reason){toast(reason);heroAdministrationReview(draft.hero);return true;}
  heroAdministrationDraft=null;modal.close();render();toast('本城已筹备一次城防，正式守城开始时生效');return true;
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el&&!el.disabled)handleHeroAdministrationAction(el.dataset.action,el.dataset.id);});
