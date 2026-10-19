'use strict';
let selectedChapter=2;
function chapterWorldBanner(){const chapter=ChapterData.unlocked(S(),4)?4:ChapterData.unlocked(S(),3)?3:2,p=ChapterData.progress(S(),chapter),nodes=ChapterData.chapterNodes(chapter);return `<section class="epic-world-banner"><div><strong>${ChapterData.chapterTitle(chapter)}</strong><span>${!p.unlocked?'攻破黄巾营寨后开启':p.conquered===nodes.length?'本章已平定':`已平定 ${p.conquered} / ${nodes.length} · 下一关 ${p.next.name}`}</span></div>${btn('章节路线','taskTab','chapter','small secondary')}${S().conquered.north_keep?btn('战役军令','taskTab','orders','small secondary'):''}</section>`;}
function chapterUnlockNoticeHTML(){const p=ChapterData.progress(S(),2);return `<p class="notice chapter-unlock-notice">${ChapterData.unlocked(S(),3)?'第二章已完成，第三章已开启，可切换河洛攻城。':`第三章将在第二章六关全部平定后开启（已平定 ${p.conquered} / ${ChapterData.nodes.length}）。掠夺不算通关，领取奖励不影响开启。`}</p>`;}
function chapterMissionModal(){
  taskTab='chapter';if(selectedChapter===4&&!ChapterData.unlocked(S(),4))selectedChapter=3;if(selectedChapter===3&&!ChapterData.unlocked(S(),3))selectedChapter=2;const chapter=selectedChapter,p=ChapterData.progress(S(),chapter),missions=Game.missions.filter(m=>m.chapter===chapter);
  showModal('任务册 · '+ChapterData.chapterTitle(chapter),`${taskTabs()}<div class="quest-actions">${[2,3,4].map(c=>btn(ChapterData.chapterTitle(c)+(c>2&&!ChapterData.unlocked(S(),c)?' · 未开放':''),'chapterSelect',String(c),'small secondary',c===chapter||(c===3&&!ChapterData.unlocked(S(),3)))).join('')}</div>${chapter===2?chapterUnlockNoticeHTML():''}<div class="quest-summary"><strong>平定 ${p.conquered} / ${missions.length}</strong><span>奖励已领取 ${p.claimed} / ${missions.length}</span></div><p class="notice">${!p.unlocked?chapter===3?'先完成第二章六关并攻取北原城，开启河洛战线。':'攻破黄巾营寨（第一章通关），开启北境战线。':p.conquered===missions.length?'本章已全部平定；未领取的通关补给仍可领取。':'按路线依次完成每关的章节任务，前一关完成后开放下一关。'}每关任务不同：占领、搜集、侦察、守城、运送、采集或兵种目标。各关一次性补给可暂时超仓；战利品受部队负重限制，入库允许爆仓。敌军与奖励为试玩数值。</p><p class="hint">只显示已探索据点和当前可推进的一关，后续据点随占领进度出现。</p>${missions.filter(m=>Game.landmarkVisible(m.node)).map((m,i)=>{const n=Game.getNode(m.node),done=Game.missionClaimed(m.id),ready=Game.missionReady(m),locked=ChapterData.blocked(S(),n.id),owned=Game.chapterTaskDone?Game.chapterTaskDone(n.id):!!S().conquered[n.id];return `<article class="quest-card ${ready?'quest-ready':done?'quest-claimed':''}"><div class="quest-heading"><h3>${taskIcon('world')}${i+1}. ${n.name}</h3><span class="badge">${done?'奖励已领取':ready?'可领奖':locked?'未开放':owned?'已平定':'可进军'} · ${n.level} 级</span></div>${locked?`<p class="notice">${esc(locked)}</p>`:''}${chapterTaskHTML(n.id)}<details class="compact-details" data-ui-disclosure="chapter-${m.id}"><summary>情报与奖励</summary><p class="hint">${n.desc}</p><p class="hint">${n.reward} · 坐标 (${n.x}, ${n.y})</p><p class="hint">${Object.entries(n.army).map(([id,count])=>Game.units[id].name+' ×'+num(count)).join(' · ')}</p>${lootHtml(m.reward)}${heritageJewelHTML(m.jewels)}${missionItemHTML(m.items)}${m.army?`<p class="hint">盟军试作援军：${Object.entries(m.army).map(([id,n])=>Game.units[id].name+' ×'+n).join(' · ')}；领奖后加入城内，生产仍需原科技。</p>`:''}<p class="hint">声望 +300</p></details><div class="quest-actions">${btn('据点','chapterGo',n.id,'small secondary')}${done?'':btn('领奖','mission',m.id,'small',!ready)}</div></article>`;}).join('')}`,btn('关闭','close','','secondary'));
  manualModalContext=classicMissionModal;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='chapterDeliver'){if(actResult(Game.deliverChapterTask(el.dataset.id),'已运送，可以出征')){render();if(modal.open)chapterMissionModal();}return;}
  if(el.dataset.action==='chapterSelect'){
    const chapter=Number(el.dataset.id);if(![2,3].includes(chapter))return;
    if(chapter===3&&!ChapterData.unlocked(S(),3)){toast('先完成第二章六关，开启第三章');return;}if(chapter===4&&!ChapterData.unlocked(S(),4)){toast(ChapterData.completed(S(),3)?'先完成黄巾之乱四项史诗，开启第四章':'先完成第三章，开启第四章');return;}
    selectedChapter=chapter;chapterMissionModal();return;
  }
  if(el.dataset.action!=='chapterGo')return;
  const n=Game.getNode(el.dataset.id);if(!n)return;
  if(!Game.landmarkVisible(n.id)){toast('请先完成当前任务据点');return;}
  if(S().battle&&!S().battle.finished){toast('请先结束当前出征战斗');return;}
  if(S().battle?.finished)Game.dismissBattle();modal.close();page='world';selectedNode=n.id;worldView={x:n.x,y:n.y};render();
});
// v0.35.3: the stage's own task, its progress and (for delivery stages) the delivery button.
function chapterTaskHTML(id){
  const v=Game.chapterTask?.(id);if(!v)return '';const safe=typeof esc==='function'?esc:value=>String(value).replace(/[&<>"']/g,'');
  const cost=v.cost?Object.entries(v.cost).map(([k,n])=>Game.resources[k].name+' '+num(n)).join('、'):'';
  return `<div class="chapter-task ${v.done?'is-done':''}"><span class="chapter-task-type">${safe(v.type)}</span>${v.hall?`<span class="chapter-task-hall ${(S().buildings.hall||0)>=v.hall?'is-ready':''}">建议官府 ${v.hall} 级</span>`:''}<p>${safe(v.text)}</p>${v.done?'<p class="hint">✓ 任务已完成</p>':v.progress?`<p class="hint">进度：${safe(v.progress)}</p>`:''}${v.deliver?btn('运送 '+cost,'chapterDeliver',id,'small',!!ChapterTasks.deliverQuote(S(),id).reason):''}</div>`;
}
