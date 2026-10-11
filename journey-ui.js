'use strict';
function journeyModal(){
  const v=JourneySystem.view(Game),tracked=S().journey.tracked;
  showModal('征程',`<p class="hint">阶段长期保留；奖励仍在原任务领取。</p><div class="journey-list">${v.steps.map(r=>`<article class="journey-card ${v.current.id===r.id?'is-current':''}"><div class="section-title"><h3>${r.complete?'✓':'○'} ${esc(r.title)}</h3>${v.current.id===r.id?'<span class="badge">当前</span>':''}</div><p class="hint">${esc(r.status)}</p><div class="guide-actions">${btn('前往','journeyGo',r.action,'small')}${btn(tracked===r.id?'已追踪':'追踪','journeyTrack',r.id,'small secondary',tracked===r.id)}</div></article>`).join('')}</div>`,btn('自动推荐','journeyTrack','','secondary',!tracked)+btn('关闭','close','','secondary'));
  manualModalContext=journeyModal;
}
function journeyGo(id){
  if(id==='build'){guideGo();return;}
  if(id==='yellow'){battlefieldModal();return;}
  if(id==='hero'){heroCodexModal();return;}
  if(id==='cities'){citySwitchListModal();return;}
  if(id==='jiangling'){if(!Game.landmarkVisible('named_jiangling')){namedCityOverviewModal();return;}worldNodeModal('named_jiangling');}
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;if(el.dataset.action==='journeyOpen')journeyModal();if(el.dataset.action==='journeyGo')journeyGo(el.dataset.id);if(el.dataset.action==='journeyTrack'&&actResult(Game.setJourneyTarget(el.dataset.id),'追踪目标已更新')){journeyModal();render();}});
