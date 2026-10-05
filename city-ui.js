'use strict';
let cityTransferDraft=null,cityFoundDraft=null;
function activeCityMeta(){return Game.cityMeta?Game.cityMeta():{id:'home',node:'home',name:'青溪城',x:Game.home.x,y:Game.home.y,capital:true};}
function cityName(id){if(id==='transit')return '城际在途';return (Game.cityMeta?Game.cityMeta(id):null)?.name||id||activeCityMeta().name;}
function cityViewNode(n){const c=n&&Game.cityMeta?.(n.id);return c?{...n,name:c.name,level:Game.citySummary(c.id)?.buildings.hall||1,wild:false,type:'fort',terrain:'fort',ownCity:c.id,desc:'治下城市，资源、驻军、建筑与城守分别管理。'}:n;}
function cityHeroHome(id){return Game.heroCity?Game.heroCity(id):activeCityMeta().id;}
function cityQueueCount(city,kind){const q=city.queues?.[kind]??city[kind+'Queue'];return Array.isArray(q)?q.length:typeof q==='number'?q:q?1:0;}
function citySwitchButtonHTML(){const c=activeCityMeta();return `<button class="city-switch-toggle" data-action="citySwitchList" aria-label="切换城市，当前${esc(c.name)}">${esc(c.name)} <span aria-hidden="true">⌄</span></button>`;}
function citySwitchListModal(){
  const current=activeCityMeta(),cities=Game.cityList?Game.cityList():[current];
  showModal('治下城市',`<p class="sub">切换查看各城的资源、建筑、军队和建造队。其他城市继续生产与施工。</p><div class="city-switch-grid">${cities.map(c=>`<article class="city-summary-card ${c.id===current.id?'is-current':''}"><div class="section-title"><h3>${esc(c.name)}</h3><span class="badge">${c.id===current.id?'当前城市':c.capital?'主城':'分城'}</span></div><p class="coordinate-tag">(${c.x}, ${c.y}) · 官府 ${c.buildings?.hall??c.hall??'—'} 级</p><p class="hint">城守 ${c.governor?esc(Game.general(c.governor).name):'尚未任命'} · 驻军 ${num(Game.totalArmy(c.army||{}))} 人<br>建造 ${cityQueueCount(c,'build')} 项 · 训练 ${cityQueueCount(c,'train')} 项</p><div class="city-summary-stock">${Object.entries(c.res||{}).map(([id,n])=>`<span>${Game.resources[id]?.name||id} <strong>${num(n)}</strong></span>`).join('')}</div><div class="guide-actions">${btn(c.id===current.id?'当前城市':'进入城市','citySwitchConfirm',c.id,'small',c.id===current.id)}${btn('城池详情','citySummary',c.id,'small secondary')}</div></article>`).join('')}</div>`,btn('运输与调遣记录','cityLogistics','','secondary')+btn('关闭','close','','secondary'));
}
function citySummaryModal(id=activeCityMeta().id){
  const c=Game.citySummary?Game.citySummary(id):Game.cityMeta(id);if(!c){toast('城市不存在');return;}
  showModal(esc(c.name)+' · 城池详情',`<p class="coordinate-tag">(${c.x}, ${c.y}) · ${c.capital?'青溪主城':'治下分城'}</p><div class="city-detail-stats"><span>官府 <strong>${c.buildings?.hall??c.hall??'—'} 级</strong></span><span>驻军 <strong>${num(Game.totalArmy(c.army||{}))} 人</strong></span><span>人口 <strong>${num(c.population||0)}</strong></span><span>城守 <strong>${c.governor?esc(Game.general(c.governor).name):'尚未任命'}</strong></span></div><div class="city-summary-stock">${Object.entries(c.res||{}).map(([key,value])=>`<span>${Game.resources[key]?.name||key} <strong>${num(value)}</strong></span>`).join('')}</div><p class="hint">各城资源与驻军分别管理。运输和调遣按出发时的城市记录结算，切城不会改变目的地。</p><div class="guide-actions">${btn('进入城内','citySwitchConfirm',c.id)}${btn('地图定位','cityMapView',c.id,'secondary')}${btn('向此城运输','cityTransport',c.id,'secondary',c.id===activeCityMeta().id)}${btn('向此城调遣','cityRedeploy',c.id,'secondary',c.id===activeCityMeta().id)}</div>`,btn('全部城市','citySwitchList','','secondary')+btn('关闭','close','','secondary'));
}
function cityMapActionsHTML(n){
  if(Game.cityMeta?.(n.id)||S().conquered[n.id]&&Game.isCity(n))return `<div class="guide-actions city-map-actions">${btn('进入城市建设','cityEnterOwned',n.id,'small')}${btn('运输资源至此城','cityTransportNode',n.id,'small secondary')}${btn('调遣部队至此城','cityRedeployNode',n.id,'small secondary')}</div>`;
  return n.wild&&n.type==='plain'&&Game.foundCityQuote?btn('在此建城','cityFoundAsk',n.id,'small secondary block'):'';
}
function cityFoundAsk(node){
  const n=Game.getNode(node);if(!n)return;cityFoundDraft={node,name:'新城',source:activeCityMeta().id,key:''};
  showModal('平地建城 · '+esc(n.name),`<p class="coordinate-tag">坐标 (${n.x}, ${n.y})</p><label for="city-found-name" class="label">新城名称</label><input id="city-found-name" type="text" maxlength="12" value="新城" autocomplete="off"><div id="city-found-quote" aria-live="polite"></div>`,btn('取消','close','','secondary')+btn('确认建城','cityFoundConfirm'));
  updateCityFoundQuote();
}
function updateCityFoundQuote(){
  const input=document.getElementById('city-found-name'),target=document.getElementById('city-found-quote');if(!input||!target||!cityFoundDraft)return;
  cityFoundDraft.name=input.value.trim();const q=Game.foundCityQuote(cityFoundDraft.node,cityFoundDraft.name);cityFoundDraft.key=q.key;
  target.innerHTML=`${q.cost?costs(q.cost):''}<p class="hint">新城拥有独立资源、城坊、资源田和驻军。建城消耗按预览执行，原野地与任务数据由规则检查。</p>${q.reason?`<p class="notice">${esc(q.reason)}</p>`:''}`;
  const button=modalBody.querySelector('[data-action="cityFoundConfirm"]');if(button)button.disabled=!!q.reason;
}
function cityTransferModal(kind='transport',destination=''){
  const source=activeCityMeta(),cities=Game.cityList().filter(c=>c.id!==source.id);if(!cities.length){showModal('运输与调遣','<p class="notice">至少拥有两座城市后可进行城际运输与调遣。</p>',btn('关闭','close'));return;}
  const chosen=cities.find(c=>c.id===destination||c.node===destination)?.id||cities[0].id;cityTransferDraft={kind,source:source.id,destination:chosen,key:''};
  const heroes=S().generals.filter(id=>cityHeroHome(id)===source.id&&!Game.generalBusy(id)&&!HeritageSystem.roleOf(S(),id));
  showModal(kind==='transport'?'城际资源运输':'部队与将领调遣',`<p class="sub">出发城：${esc(source.name)} · (${source.x}, ${source.y})</p><label class="label" for="city-transfer-destination">目的城市</label><select id="city-transfer-destination">${cities.map(c=>`<option value="${esc(c.id)}" ${c.id===chosen?'selected':''}>${esc(c.name)} · (${c.x}, ${c.y})</option>`).join('')}</select><label class="label" for="city-transfer-general">随行将领</label><select id="city-transfer-general"><option value="">不派将领</option>${heroes.map(id=>`<option value="${esc(id)}">${esc(Game.general(id).name)} · Lv.${Game.general(id).level}</option>`).join('')}</select>${kind==='transport'?`<h3 class="ledger-heading">运送资源</h3><div class="city-transfer-inputs">${Object.entries(Game.resources).map(([id,r])=>`<label>${r.name}<small>本城 ${num(S().res[id])}</small><input type="number" min="0" max="${Math.floor(S().res[id])}" step="1" value="0" inputmode="numeric" data-city-cargo="${id}" aria-label="运送${r.name}"></label>`).join('')}</div>`:''}<h3 class="ledger-heading">${kind==='transport'?'运输与护送部队':'调遣部队'}</h3><div class="city-transfer-inputs">${Object.entries(Game.units).filter(([id])=>S().army[id]>0).map(([id,u])=>`<label>${u.name}<small>本城 ${num(S().army[id])} 人</small><input type="number" min="0" max="${S().army[id]}" step="1" value="0" inputmode="numeric" data-city-army="${id}" aria-label="派遣${u.name}"></label>`).join('')||'<p class="hint">本城没有可派遣士兵。</p>'}</div><div id="city-transfer-quote" aria-live="polite"></div><p class="hint">资源运输抵达后自动入库，运输兵按规则返城；调遣抵达后归目的城管理。派出前检查兵力、负重、行军粮与将领状态。</p>`,btn('取消','close','','secondary')+btn('预览并确认','cityTransferReview'));
  updateCityTransferQuote();
}
function cityTransferForm(){
  const army=Object.fromEntries(Object.keys(Game.units).map(id=>[id,0])),cargo=Object.fromEntries(Object.keys(Game.resources).map(id=>[id,0]));
  for(const input of document.querySelectorAll('[data-city-army],[data-city-cargo]')){const key=input.dataset.cityArmy||input.dataset.cityCargo,map=input.dataset.cityArmy?army:cargo,max=input.dataset.cityArmy?S().army[key]:S().res[key],value=Math.max(0,Math.min(Math.floor(max),Math.floor(Number(input.value)||0)));input.value=value;map[key]=value;}
  return {army,cargo,general:document.getElementById('city-transfer-general').value,destination:document.getElementById('city-transfer-destination').value};
}
function cityTransferQuote(form){return cityTransferDraft.kind==='transport'?Game.transportQuote(form.destination,form.army,form.cargo,form.general):Game.redeployQuote(form.destination,form.army,form.general);}
function cityTransferQuoteHTML(q){const selected=Game.totalArmy(q.army||{});return `<div class="notice city-logistics-quote"><strong>${esc(cityName(q.sourceCity||cityTransferDraft.source))} → ${esc(cityName(q.destinationCity||cityTransferDraft.destination))}</strong>${selected?`<p>去程 ${duration(q.seconds||0)} · 距离 ${Number(q.distance||0).toFixed(1)} 格 · 行军粮 ${num(q.foodCost||0)}</p>${q.carry!==undefined?`<p>部队负重 ${num(q.carry)}</p>`:''}`:'<p>选好部队后显示行军时间、耗粮与负重。</p>'}${q.reason?`<p>${esc(q.reason)}</p>`:''}</div>`;}
function updateCityTransferQuote(){const target=document.getElementById('city-transfer-quote');if(!target||!cityTransferDraft)return;const form=cityTransferForm(),q=cityTransferQuote(form);cityTransferDraft.destination=form.destination;target.innerHTML=cityTransferQuoteHTML(q);const button=modalBody.querySelector('[data-action="cityTransferReview"]');if(button)button.disabled=!!q.reason;}
function cityTransferReview(){
  if(cityTransferDraft.source!==activeCityMeta().id){toast('出发城已改变，请重新准备');return;}
  const form=cityTransferForm(),q=cityTransferQuote(form);if(q.reason){toast(q.reason);return;}cityTransferDraft={...cityTransferDraft,...form,key:q.key};
  const army=Object.entries(form.army).filter(([,n])=>n>0).map(([id,n])=>`${Game.units[id].name} ${num(n)}`).join(' · ');
  showModal('确认'+(cityTransferDraft.kind==='transport'?'运输':'调遣'),`${cityTransferQuoteHTML(q)}<p class="hint">随行将领：${form.general?esc(Game.general(form.general).name):'无'}<br>${army||'无随行士兵'}</p>${cityTransferDraft.kind==='transport'?'<h4>运送资源</h4>'+cityCargoHTML(form.cargo):''}<p class="hint">确认后扣除出发城的部队、运送资源和行军粮。切城不影响已出发队伍，抵达后自动处理。</p>`,btn('重新配队','cityTransferBack','','secondary')+btn('确认出发','cityTransferSend'));
}
function cityCargoHTML(cargo){const entries=Object.entries(cargo||{}).filter(([,n])=>n>0);return entries.length?'<div class="loot city-cargo" aria-label="装载资源">'+entries.map(([id,n])=>`<span>${resourceIcon(id)}${Game.resources[id].name} ${num(n)}</span>`).join('')+'</div>':'';}
function cityLogisticsHTML(){
  const rows=Game.logisticsList?Game.logisticsList():[];
  return `<section class="panel city-logistics-panel"><div class="section-title"><h3>城际运输与调遣</h3><span class="badge">在途 ${rows.length} 支</span></div><div class="guide-actions">${btn('运送资源','cityTransport','','small secondary')}${btn('调遣部队','cityRedeploy','','small secondary')}</div>${rows.length?`<div class="army-deployment-grid">${rows.map(r=>`<article class="army-deployment-card"><div class="quest-heading"><h4>${r.phase==='return'?'返回 '+esc(cityName(r.sourceCity||r.source)):esc(cityName(r.sourceCity||r.source))+' → '+esc(cityName(r.destinationCity||r.destination))}</h4><span class="badge">${r.phase==='return'?'返城':r.kind==='redeploy'||r.type==='redeploy'?'部队调遣':'资源运输'}</span></div><p class="hint">${r.general?'将领 '+esc(Game.general(r.general).name)+' · ':''}${num(Game.totalArmy(r.army||{}))} 人</p>${r.delivered&&!r.cancelled?'<p class="hint">资源已送达入库，运输队空载返城。</p>':r.cargo?cityCargoHTML(r.cargo):''}${r.cancelled?'<p class="hint">已召回，未送达资源随队返回出发城。</p>':''}${armyDeploymentTimingHTML({...r,kind:'logistics',phase:r.phase==='return'?'return':'march'})}<div class="guide-actions">${btn('查看目的城','citySummary',r.destinationCity||r.destination,'small secondary')}${r.phase!=='return'?btn('召回','cityLogisticsRecallAsk',r.id,'small secondary'):''}</div></article>`).join('')}</div>`:'<p class="empty">暂无城际运输或调遣队伍。</p>'}</section>`;
}
function cityLogisticsModal(){showModal('城际运输与调遣',cityLogisticsHTML(),btn('关闭','close','','secondary'));manualModalContext=cityLogisticsModal;}
document.addEventListener('input',event=>{if(event.target.id==='city-found-name')updateCityFoundQuote();if(event.target.matches('[data-city-army],[data-city-cargo]'))updateCityTransferQuote();});
document.addEventListener('change',event=>{if(['city-transfer-general','city-transfer-destination'].includes(event.target.id))updateCityTransferQuote();});
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action,id=el.dataset.id;
  if(action==='citySwitchList')citySwitchListModal();
  if(action==='citySummary')citySummaryModal(id);
  if(action==='citySwitchConfirm'||action==='cityEnterOwned'){const owned=action==='cityEnterOwned'?Game.cityMeta(id):null,error=action==='cityEnterOwned'?(owned?Game.switchCity(owned.id):Game.enterOwnedCity(id)):Game.switchCity(id);if(actResult(error,'已切换城市')){modal.close();manualModalContext=null;page='city';cityArea='inner';render();document.getElementById('main').scrollTop=0;}}
  if(action==='cityMapView'){const c=Game.cityMeta(id);modal.close();page='world';selectedNode=c.node||'home';centerWorld(c.x,c.y,false);}
  if(action==='cityFoundAsk')cityFoundAsk(id);
  if(action==='cityFoundConfirm'&&cityFoundDraft){if(cityFoundDraft.source!==activeCityMeta().id){toast('出发城已改变，请重新预览');return;}if(actResult(Game.foundCity(cityFoundDraft.node,cityFoundDraft.name,cityFoundDraft.key),'新城已建立')){modal.close();render();}}
  if(action==='cityTransport'||action==='cityRedeploy')cityTransferModal(action==='cityTransport'?'transport':'redeploy',id);
  if(action==='cityTransportNode'||action==='cityRedeployNode'){const target=Game.cityList().find(c=>c.node===id||c.id===id);if(target)cityTransferModal(action==='cityTransportNode'?'transport':'redeploy',target.id);else toast('请先进入此城市，完成城池接管');}
  if(action==='cityTransferReview')cityTransferReview();
  if(action==='cityTransferBack'&&cityTransferDraft){const draft=cityTransferDraft;cityTransferModal(draft.kind,draft.destination);for(const input of modalBody.querySelectorAll('[data-city-army],[data-city-cargo]')){const map=input.dataset.cityArmy?draft.army:draft.cargo,key=input.dataset.cityArmy||input.dataset.cityCargo;input.value=map?.[key]||0;}const general=document.getElementById('city-transfer-general');if(general)general.value=draft.general||'';updateCityTransferQuote();}
  if(action==='cityTransferSend'&&cityTransferDraft){const d=cityTransferDraft;if(d.source!==activeCityMeta().id){toast('出发城已改变，请重新预览');return;}const error=d.kind==='transport'?Game.sendTransport(d.destination,d.army,d.cargo,d.general,d.key):Game.redeployArmy(d.destination,d.army,d.general,d.key);if(actResult(error,'队伍已出发，可在军队页查看行进时间'))modal.close();}
  if(action==='cityLogistics')cityLogisticsModal();
  if(action==='cityLogisticsRecallAsk'){showModal('召回城际队伍','<p class="hint">队伍按规则折返出发城，返程期间仍占用士兵与将领。运送资源按召回结果处理。</p>',btn('继续行军','close','','secondary')+btn('确认召回','cityLogisticsRecall',id));}
  if(action==='cityLogisticsRecall'){if(actResult(Game.recallLogistics(id),'队伍正在折返出发城'))cityLogisticsModal();}
});
