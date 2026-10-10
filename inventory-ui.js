'use strict';
// Inventory filters and selection belong to the view, not the saved game state.
let bagCategory='全部',bagPage=0,bagSelected='';
const BAG_PAGE_SIZE=24;
const BAG_CATEGORIES=['全部','资源补给','加速','内政','军事','将领','装备','珍宝','其他'];
function bagEntries(){
 const items=Game.manual.shop.map(item=>({key:'item:'+item.id,kind:'item',id:item.id,name:item.name,count:S().inventory[item.id]||0,category:item.effect==='jewelBox'?'珍宝':item.effect==='gold'?'资源补给':item.effect==='speedup'?'加速':['内政','军事','将领','装备'].includes(item.category)?item.category:'其他',item}));
 const jewels=Object.entries(Game.progression.jewels).map(([id,jewel])=>({key:'jewel:'+id,kind:'jewel',id,name:jewel.name,count:S().jewels[id]||0,category:'珍宝',jewel}));
 const equipment=S().equipment.map(e=>({key:'equipment:'+e.id,kind:'equipment',id:e.id,name:HeroSystem.itemName(e),count:1,category:'装备',equipment:e}));
 return [...items,...jewels,...equipment,...webBundleEntries()].filter(entry=>entry.count>0);
}
function bagIcon(entry,classes='bag-icon'){
 if(entry.kind==='equipment')return heroEquipmentIcon(entry.equipment).replace('item-art','item-art '+classes);
 if(entry.kind==='jewel')return artSprite('icons',HistoricalArt.icons.ids.indexOf('gems'),entry.name,'item-art '+classes);
 return itemIcon(entry.item,'item-art '+classes);
}
function bagChoice(label,action,id,active){return `<button class="btn small secondary ${active?'active-order':''}" data-action="${action}" data-id="${esc(id)}" aria-pressed="${active}">${label}</button>`;}
function bagQuantity(n){return n>=10000?(n/10000).toFixed(1).replace(/\.0$/,'')+'万':num(n);}
function bagTile(entry){
 const rare=entry.kind==='equipment'?entry.equipment.tier:entry.kind==='item'&&entry.item.effect&&entry.item.price>=Game.manual.battleDrops.rarePrice?3:1;
 const status=entry.kind==='equipment'?(entry.equipment.hero?'已穿戴':entry.equipment.enhance?'+'+entry.equipment.enhance:''):entry.kind==='item'&&!entry.item.effect?'未开放':'';
 return `<button class="bag-slot bag-owned bag-quality-${rare} ${bagSelected===entry.key?'bag-selected':''}" data-action="bagSelect" data-id="${esc(entry.key)}" aria-pressed="${bagSelected===entry.key}" aria-label="${esc(entry.name)}，数量 ${num(entry.count)}${status?'，'+status:''}" title="${esc(entry.name)} · ${num(entry.count)} 件"><span class="bag-count">×${bagQuantity(entry.count)}</span>${bagIcon(entry)}<span class="bag-name">${esc(entry.name)}</span><span class="bag-purpose">${entry.kind==='equipment'?HeroSystem.slots[entry.equipment.slot]:entry.kind==='jewel'?'晋爵 / 招降':entry.item.effect==='speedup'?'缩短队列时间':entry.item.effect==='gold'?'兑换黄金':entry.category}</span>${status?`<span class="bag-status">${status}</span>`:''}</button>`;
}
function bagDetailHTML(entry){
 if(entry?.kind==='bundle')return webBundleDetailHTML(entry);
 if(!entry)return '<section class="bag-detail bag-detail-empty"><p class="hint">此分类暂无物品，获得后会显示在格子里。</p></section>';
 const head=`<div class="bag-detail-head">${bagIcon(entry,'bag-detail-icon')}<span class="label">${entry.category}</span><h3>${esc(entry.name)}${entry.kind==='equipment'&&entry.equipment.enhance?' +'+entry.equipment.enhance:''}</h3><p class="bag-detail-count">持有 <strong>${num(entry.count)}</strong> ${entry.kind==='equipment'?'件':'个'}</p></div>`;
 let body='';
 if(entry.kind==='jewel'){
  body=`<p class="hint">可用于爵位晋升，也可进献给黄巾史诗。进献与晋升共用当前数量。</p><p class="hint">获取：战斗奖励、野地采集${entry.id==='pearl'?'、铜钱黑市':''}。进献每次需要 10 枚，兑换声望 ${num(entry.jewel.prestige)} 与史诗凭证 ${entry.jewel.points}。</p><div class="bag-detail-actions">${btn('查看晋爵条件','taskTab','honors','secondary block')}${btn('史诗进献','taskTab','epic','block')}</div>`;
 }else if(entry.kind==='equipment'){
  const e=entry.equipment;
  body=`<p class="hint">${HeroSystem.qualities[e.tier]} · ${HeroSystem.slots[e.slot]} · 需要将领 Lv.${HeroSystem.requiredLevel(e)}</p><p class="notice">${heroStatsHTML(HeroSystem.stats(e))}</p><p class="hint">${e.hero?'穿戴者：'+esc(Game.general(e.hero).name):'未穿戴'} · 强化 +${e.enhance}/10</p><div class="bag-detail-actions">${btn('装备管理','heroEquipment',String(e.id),'block')}${btn('打开装备库','heroTab','equipment','secondary block')}</div>`;
 }else{
  const x=entry.item,usable=!!x.effect&&entry.count>0;
  const label=['jewelBox','equipmentBox'].includes(x.effect)?'开启盒子':x.effect==='speedup'?'选择加速任务':x.effect==='equipmentMaterial'?'用于装备强化':x.effect==='gold'?'兑换黄金':'使用道具';
  body=`<p class="hint">${esc(x.desc)}</p><p class="bag-detail-source hint">${x.rewardOnly?'获取：官府成长礼包、战役军令的军功兑换。':x.effect?'获取：商城购买、战斗'+(x.price>=Game.manual.battleDrops.rarePrice?'稀有':'胜利')+'掉落。':'该宝物对应的系统尚未开放，暂不能使用或购买。'}</p>${x.effect==='heroReset'?'<p class="hint">每 10 级消耗 1 枚洗髓丹（向上取整），选择将领后确认使用。</p>':''}${x.effect==='blueprint'?'<p class="notice">建筑升至 10 级时自动扣除图纸。</p>':''}${x.effect==='equipmentMaterial'?'<p class="hint">在装备详情中选择强化，会按需求扣除宝珠。</p>':''}<div class="bag-detail-actions">${x.effect==='blueprint'?btn('前往城内建设','dailyGo','inner','block'):btn(x.effect?label:'未开放','manualUsePlan',x.id,'block',!usable)}${x.effect&&!x.rewardOnly?btn('前往商城购买','bagShop',x.id,'secondary block'):''}</div>`;
 }
 return `<section class="bag-detail" aria-label="所选物品详情">${head}${body}</section>`;
}
function inventoryGridModal(){
 const categoryScroll=modalBody.querySelector('.bag-categories')?.scrollLeft||0;
 const all=bagEntries(),filtered=all.filter(e=>bagCategory==='全部'||e.category===bagCategory),pages=Math.max(1,Math.ceil(filtered.length/BAG_PAGE_SIZE));
 bagPage=Math.min(Math.max(0,bagPage),pages-1);
 const visible=filtered.slice(bagPage*BAG_PAGE_SIZE,(bagPage+1)*BAG_PAGE_SIZE);
 if(!visible.some(e=>e.key===bagSelected))bagSelected=visible[0]?.key||'';
 const selected=visible.find(e=>e.key===bagSelected),focused=document.activeElement?.dataset.action==='bagSelect'?document.activeElement.dataset.id:null;
 const categories=`<nav class="bag-categories" aria-label="背包物品分类">${BAG_CATEGORIES.map(category=>{const group=all.filter(e=>category==='全部'||e.category===category);return bagChoice(category+' <span class="bag-category-count">'+group.length+'</span>','bagCategory',category,bagCategory===category);}).join('')}</nav>`;
 const placeholders='';
 showModal('背包',`<div class="bag-summary"><span>已持有 ${all.length} 种物品</span><span>装备 ${S().equipment.length}/${S().equipmentCapacity} 件</span></div>${categories}<div class="bag-tools"><span class="label">${bagCategory} · ${filtered.length} 格</span></div><div class="bag-layout"><div class="bag-main">${!visible.length?'<p class="bag-empty-message">这一分类暂无物品，获得后会自动显示。</p>':''}<div class="bag-grid" role="group" aria-label="背包物品格子">${visible.map(bagTile).join('')}${placeholders}</div><div class="bag-pagination">${btn('上一页','bagPage',String(bagPage-1),'small secondary',bagPage===0)}<span class="label">${bagPage+1} / ${pages}</span>${btn('下一页','bagPage',String(bagPage+1),'small secondary',bagPage+1>=pages)}</div><p class="bag-legend hint">金框：稀有 · 点击格子查看详情</p></div>${bagDetailHTML(selected)}</div>`,btn('关闭','close','','secondary'));
 modal.classList.add('bag-dialog');manualModalContext=manualInventoryModal;
 modalBody.querySelector('.bag-categories').scrollLeft=categoryScroll;
 if(focused){const target=[...modalBody.querySelectorAll('[data-action="bagSelect"]')].find(e=>e.dataset.id===focused);target?.focus({preventScroll:true});}
}
function bagItemDetailModal(key){const entry=bagEntries().find(e=>e.key===key);if(!entry){inventoryGridModal();return;}showModal('物品详情',bagDetailHTML(entry),btn('返回背包','manualInventory','','secondary'));manualModalContext=()=>bagItemDetailModal(key);}
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;if(!a.startsWith('bag'))return;
 const scroll=modal.scrollTop;
 if(a==='bagCategory'){bagCategory=id;bagPage=0;bagSelected='';inventoryGridModal();modal.scrollTop=0;}
 if(a==='bagPage'){bagPage=Number(id);bagSelected='';inventoryGridModal();modal.scrollTop=scroll;}
 if(a==='bagSelect'){bagSelected=id;if(window.matchMedia('(max-width:650px)').matches){bagItemDetailModal(id);modal.scrollTop=0;}else{inventoryGridModal();modal.scrollTop=scroll;}}
 if(a==='bagShop'){const item=Game.manual.shop.find(x=>x.id===id);if(item){shopCategory=item.category;page='shop';modal.close();render();}}
});
