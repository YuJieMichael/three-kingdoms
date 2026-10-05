'use strict';
function automationNoticeHTML(){return S().automation.notices.map(n=>`<li class="${n.read?'is-read':''}"><span>${esc(n.text)}</span><time datetime="${new Date(n.at).toISOString()}">${new Date(n.at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time>${n.read?'':'<small>未读</small>'}</li>`).join('')||'<li class="hint">暂无完成记录。建造、训练、研究与城防完成后会记录在这里。</li>';}
function automationModal(){
  const a=S().automation;
  showModal('挂机助手',`<p class="sub">配置研究顺序与资源保留额度；开启自动升级／研究后按设置运行。</p><div class="automation-status"><p data-auto-upgrade-status role="status">${esc(Game.autoUpgradeStatus())}</p><p data-auto-research-status role="status">${esc(Game.autoResearchStatus())}</p></div><form id="automation-settings" class="automation-settings"><fieldset><legend>研究优先级</legend><label for="automation-focus">发展方向</label><select id="automation-focus">${[['balanced','均衡：优先低等级'],['economy','优先生产与建设'],['military','优先军队与战斗']].map(([id,name])=>`<option value="${id}" ${a.researchFocus===id?'selected':''}>${name}</option>`).join('')}</select><label for="automation-priority">优先科技</label><select id="automation-priority"><option value="">按发展方向选择</option>${Object.entries(Game.manual.technology).map(([id,t])=>`<option value="${id}" ${a.researchPriority===id?'selected':''}>${esc(t.name)}</option>`).join('')}</select><p class="hint">优先科技满足前置且资源够时先研究；否则寻找其他可开工科技。同方向按等级从低到高。</p></fieldset><fieldset><legend>资源保留</legend><p class="hint">自动开工后不能低于以下额度。手动操作可使用保留资源；已开工项目继续完成。建设与研究同时开启时建设先付款。</p><div class="automation-reserves">${Object.entries(Game.resources).map(([id,r])=>`<label for="reserve-${id}">${r.name}<input id="reserve-${id}" data-reserve="${id}" type="number" min="0" max="1000000000" step="1" inputmode="numeric" value="${a.reserve[id]}"></label>`).join('')}</div></fieldset><label class="automation-notify"><input id="automation-notify" type="checkbox" ${a.notify?'checked':''}>记录完成提示</label><p class="hint">保留最近 30 条，离线完成也会记录；关闭后不新增记录。</p><button type="button" class="btn block" data-action="automationSave">保存设置</button><p id="automation-save-feedback" role="status" aria-live="polite"></p></form><div class="automation-toggles">${btn(S().autoUpgrade?'暂停自动升级':'开启自动升级','automationUpgrade','','secondary')}${btn(S().autoResearch?'暂停自动研究':'开启自动研究','automationResearch','','secondary')}</div><div class="divider"></div><div class="section-title"><h3>完成记录 <span data-automation-unread>${Game.automation.unread(S())}</span> 条未读</h3>${btn('全部已读','automationRead','','small secondary')}</div><ul class="automation-notices" data-automation-notices>${automationNoticeHTML()}</ul>`,btn('关闭','close','','secondary'));
  // Leave context null: queue completions must not replace a partially edited form.
}
function refreshAutomationUI(){
  document.querySelectorAll('[data-automation-unread]').forEach(el=>el.textContent=Game.automation.unread(S()));
  const list=document.querySelector('[data-automation-notices]');if(list){const html=automationNoticeHTML();if(list.innerHTML!==html)list.innerHTML=html;}
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action;
  if(action==='automationOpen')automationModal();
  if(action==='automationSave'){
    const reserve={};for(const input of document.querySelectorAll('[data-reserve]')){const raw=input.value.trim();reserve[input.dataset.reserve]=raw===''?NaN:Number(raw);}
    const error=Game.setAutomationSettings({researchFocus:document.getElementById('automation-focus').value,researchPriority:document.getElementById('automation-priority').value,reserve,notify:document.getElementById('automation-notify').checked});
    document.getElementById('automation-save-feedback').textContent=error||'设置已保存';if(error)toast(error);refreshAutomationUI();
  }
  if(action==='automationRead'){Game.readAutomationNotices();refreshAutomationUI();}
  if(action==='automationUpgrade'||action==='automationResearch'){
    const upgrade=action==='automationUpgrade',enabled=!(upgrade?S().autoUpgrade:S().autoResearch);
    const error=upgrade?Game.setAutoUpgrade(enabled):Game.setAutoResearch(enabled);if(error)toast(error);
    else el.textContent=(enabled?'暂停':'开启')+(upgrade?'自动升级':'自动研究');
  }
});
