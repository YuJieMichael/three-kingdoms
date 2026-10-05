'use strict';
let selectedChapter=2;
function chapterWorldBanner(){const chapter=ChapterData.unlocked(S(),3)?3:2,p=ChapterData.progress(S(),chapter),nodes=ChapterData.chapterNodes(chapter);return `<section class="epic-world-banner"><div><strong>${ChapterData.chapterTitle(chapter)}</strong><span>${!p.unlocked?'占领古渡县城后开启':p.conquered===nodes.length?'本章已平定':`已平定 ${p.conquered} / ${nodes.length} · 下一关 ${p.next.name}`}</span></div>${btn('章节路线','taskTab','chapter','small secondary')}${S().conquered.north_keep?btn('战役军令','taskTab','orders','small secondary'):''}</section>`;}
function chapterUnlockNoticeHTML(){const p=ChapterData.progress(S(),2);return `<p class="notice chapter-unlock-notice">${ChapterData.unlocked(S(),3)?'第二章已完成，第三章已开启，可切换河洛攻城。':`第三章将在第二章六关全部平定后开启（已平定 ${p.conquered} / ${ChapterData.nodes.length}）。掠夺不算通关，领取奖励不影响开启。`}</p>`;}
function chapterMissionModal(){
  taskTab='chapter';if(selectedChapter===3&&!ChapterData.unlocked(S(),3))selectedChapter=2;const chapter=selectedChapter,p=ChapterData.progress(S(),chapter),missions=Game.missions.filter(m=>m.chapter===chapter);
  showModal('任务册 · '+ChapterData.chapterTitle(chapter),`${taskTabs()}<div class="quest-actions">${[2,3].map(c=>btn(ChapterData.chapterTitle(c)+(c===3&&!ChapterData.unlocked(S(),3)?' · 未开放':''),'chapterSelect',String(c),'small secondary',c===chapter||(c===3&&!ChapterData.unlocked(S(),3)))).join('')}</div>${chapter===2?chapterUnlockNoticeHTML():''}<div class="quest-summary"><strong>平定 ${p.conquered} / ${missions.length}</strong><span>奖励已领取 ${p.claimed} / ${missions.length}</span></div><p class="notice">${!p.unlocked?chapter===3?'先完成第二章六关并平定北境大营，开启河洛战线。':'先完成黄巾史诗并占领古渡县城，开启北境战线。':p.conquered===missions.length?'本章已全部平定；未领取的通关补给仍可领取。':'按路线依次占领据点，前一关占领后开放下一关。'}掠夺获得战利品，占领才推进章节。各关一次性补给可暂时超仓；战利品仍受负重与仓储限制。敌军与奖励为试玩数值。</p>${missions.map((m,i)=>{const n=Game.getNode(m.node),done=Game.missionClaimed(m.id),ready=Game.missionReady(m),locked=ChapterData.blocked(S(),n.id),owned=!!S().conquered[n.id];return `<article class="quest-card ${ready?'quest-ready':done?'quest-claimed':''}"><div class="quest-heading"><h3>${i+1}. ${n.name}</h3><span class="badge">${done?'奖励已领取':ready?'可领奖':locked?'未开放':owned?'已平定':'可进军'} · ${n.level} 级</span></div><p class="hint">${n.desc}</p><p class="hint">${locked||n.reward} · 坐标 (${n.x}, ${n.y})</p><details><summary>敌军与一次性通关补给</summary><p class="hint">${Object.entries(n.army).map(([id,count])=>Game.units[id].name+' ×'+num(count)).join(' · ')}</p>${lootHtml(m.reward)}${heritageJewelHTML(m.jewels)}${missionItemHTML(m.items)}${m.army?`<p class="hint">盟军试作援军：${Object.entries(m.army).map(([id,n])=>Game.units[id].name+' ×'+n).join(' · ')}；领取通关奖励后加入城内，生产仍需原科技。</p>`:''}<p class="hint">声望 +300</p></details><div class="quest-actions">${btn('查看据点','chapterGo',n.id,'small secondary')}${done?'':btn('领取通关奖励','mission',m.id,'small',!ready)}</div></article>`;}).join('')}`,btn('关闭','close','','secondary'));
  manualModalContext=classicMissionModal;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='chapterSelect'){
    const chapter=Number(el.dataset.id);if(![2,3].includes(chapter))return;
    if(chapter===3&&!ChapterData.unlocked(S(),3)){toast('先完成第二章六关，开启第三章');return;}
    selectedChapter=chapter;chapterMissionModal();return;
  }
  if(el.dataset.action!=='chapterGo')return;
  const n=Game.getNode(el.dataset.id);if(!n)return;
  if(n.chapter===3&&!ChapterData.unlocked(S(),3)){toast(ChapterData.blocked(S(),n.id));return;}
  if(S().battle&&!S().battle.finished){toast('请先结束当前出征战斗');return;}
  if(S().battle?.finished)Game.dismissBattle();modal.close();page='world';selectedNode=n.id;worldView={x:n.x,y:n.y};render();
});
