'use strict';
// Durations requested for this prototype; prices are trial values, not historical prices.
const SpeedupData={
  kinds:{build:'建造',research:'研究',train:'练兵'},
  tiers:[
    {id:'15m',label:'15 分钟',seconds:900,price:5},
    {id:'1h',label:'1 小时',seconds:3600,price:15},
    {id:'3h',label:'3 小时',seconds:10800,price:35},
    {id:'8h',label:'8 小时',seconds:28800,price:80},
    {id:'15_30h',label:'随机 15–30 小时',minHours:15,maxHours:30,price:180},
    {id:'30pct',label:'剩余时间 30%',ratio:.3,price:120}
  ]
};
for(const [kind,name] of Object.entries(SpeedupData.kinds)){
  for(const tier of SpeedupData.tiers){
    ManualData.shop.push({id:'speed_'+kind+'_'+tier.id,name:name+'加速 · '+tier.label,category:name+'加速',effect:'speedup',queueKind:kind,speedup:{...tier},seconds:0,price:tier.price,trialPrice:true,trialEffect:true,
      desc:'选择一项'+name+'任务，'+(tier.ratio?'缩短剩余工作时间的 30%。':tier.minHours?'使用时随机缩短 15–30 小时（整小时）。':'缩短 '+tier.label+'。')+(kind==='build'?'城内建筑与城外资源田均可使用。':kind==='train'?'支持正在练兵或等待开训的批次，后续批次同步提前。':'适用于当前正在研究的科技。')+'超出剩余工作时间的部分不保留。'});
  }
}
ManualData.buildings.wall.requires={hall:2};
