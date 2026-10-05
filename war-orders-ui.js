'use strict';
const orderSelections={};
function warOrderRewardHTML(n){const first=n.orderTier>S().warOrders.cleared[n.orderRoute];return `<p class="notice">${first?'首次通关 · 双倍军功':'已通关 · 重复讨伐'}：胜利军功 +${WarOrders.points(n,first)}。${first?'再次讨伐本阶获得 '+WarOrders.points(n)+' 军功。':''}<br>讨伐不增加领地；军功自动保存，资源仍受幸存部队负重与仓储限制。</p>`;}
function warOrderIntelHTML(n){return `<section class="war-order-intel" aria-label="军令敌军预览"><p class="hint">${esc(n.desc)}</p><h4>守军阵容</h4><div class="enemy-list">${Object.entries(n.army).map(([id,count])=>`<div class="enemy-row"><span>${Game.units[id].name}</span><strong>${num(count)}</strong></div>`).join('')}</div>${siegeIntelHTML(n)}${warOrderRewardHTML(n)}</section>`;}
function warOrderClockText(route){const s=S(),w=s.warOrders;if(!WarOrders.unlocked(s))return '路线未开放 · 平定北境大营后开启';if(w.nextAt[route]>Date.now())return '整军剩余 '+duration(Math.max(0,Math.ceil((w.nextAt[route]-Date.now())/1000)));if(Game.allExpeditions().some(e=>WarOrders.getNode(e.node)?.orderRoute===route))return '本路线部队正在出征或返城';return '整军已完成 · 已获胜 '+w.wins[route]+' 次';}
function warOrdersModal(){
  taskTab='orders';const s=S(),w=s.warOrders,unlocked=WarOrders.unlocked(s);
  const cards=Object.entries(WarOrders.routes).map(([route,spec])=>{
    const max=WarOrders.maxTier(s,route),tier=Math.min(max,orderSelections[route]||max),n=Game.getNode(`order_${route}_${tier}`),reason=Game.attackBlocked(n.id,'occupy');
    return `<article class="quest-card"><div class="quest-heading"><h3>${spec.name}</h3><span class="badge">已通关 ${w.cleared[route]} / 10</span></div><label for="order-tier-${route}">选择难度<select id="order-tier-${route}" data-order-tier="${route}" aria-label="${spec.name}难度">${Array.from({length:max},(_,i)=>`<option value="${i+1}" ${tier===i+1?'selected':''}>第 ${i+1} 阶 · ${w.cleared[route]>=i+1?'可重打':'下一目标'}</option>`).join('')}</select></label>${warOrderIntelHTML(n)}<p class="hint" data-order-clock="${route}">${esc(warOrderClockText(route))}</p>${btn(reason||'配兵讨伐第 '+tier+' 阶','campaignDispatch',n.id+':occupy','block',!!reason)}</article>`;
  }).join('');
  showModal('任务册 · 战役军令',`${taskTabs()}<div class="quest-summary"><strong>军功 ${num(w.merit)}</strong><span>三路通关 ${Object.values(w.cleared).reduce((a,b)=>a+b,0)} / 30</span></div><p class="notice">${unlocked?'北境已平定，军令开放。':'先占领北境大营，开放三路军令。'}每条路线按顺序开放 10 阶，可重复已通关难度；首次通关军功双倍，第 5、10 阶有精锐敌将。胜败结束后各路线整军 10 分钟；战损、行军粮食与返城规则沿用。</p><p class="hint">可按敌军组成选择步弓、枪骑与攻城器械，先补充战损再继续。军功没有每日清零或过期。</p><div class="quest-actions">${btn('军功兑换','warOrderShop','','secondary',!unlocked)}${btn('查看章节征程','taskTab','chapter','secondary')}${btn('配兵与训练','dailyGo','army','secondary')}</div>${cards}`,btn('关闭','close','','secondary'));
  manualModalContext=warOrdersModal;
}
function warOrderExchangeModal(){
  const w=S().warOrders;
  showModal('战役军令 · 军功兑换',`<div class="quest-summary"><strong>可用军功 ${num(w.merit)}</strong><span>累计获得 ${num(w.earned)} · 已用 ${num(w.spent)}</span></div><p class="notice">每次兑换 1 件，按下列价格扣除军功，物品进入背包。盒子需要自行开启；满装备库时盒子保留。军功通过军令胜利获得。</p>${WarOrders.offers.map(o=>{const item=Game.manual.shop.find(i=>i.id===o.id);return `<article class="quest-card"><div class="quest-heading"><h3>${esc(item.name)} ×1</h3><span class="badge">${o.cost} 军功</span></div><p class="hint">${esc(item.desc)}</p>${btn('兑换 · '+o.cost+' 军功','warOrderExchange',o.id,'small',w.merit<o.cost||!WarOrders.unlocked(S()))}</article>`;}).join('')}`,btn('返回军令','taskTab','orders','secondary')+btn('查看背包','manualInventory'));
  manualModalContext=warOrderExchangeModal;
}
function refreshWarOrdersUI(){for(const el of document.querySelectorAll('[data-order-clock]'))el.textContent=warOrderClockText(el.dataset.orderClock);}
document.addEventListener('change',event=>{const route=event.target.dataset.orderTier;if(route&&Object.hasOwn(WarOrders.routes,route)){orderSelections[route]=Number(event.target.value);const scroll=modal.scrollTop;warOrdersModal();modal.scrollTop=scroll;}});
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;if(el.dataset.action==='warOrderShop')warOrderExchangeModal();if(el.dataset.action==='warOrderExchange'){const error=WarOrders.exchange(el.dataset.id);warOrderExchangeModal();actResult(error,'兑换物品已进入背包');}});
