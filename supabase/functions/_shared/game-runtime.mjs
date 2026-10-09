// Generated from the browser's actual data modules and engine. Rebuild with node scripts/build-online-runtime.cjs.
export const runtimeHash="00af8d513492c2a4f2104457da543876107e6975e018683e0d31172d14f7f754";
export const runtimeSources=["manual-data.js","speedup-data.js","reference-rules.js","reward-data.js","progression.js","onboarding-data.js","onboarding-system.js","governance-system.js","hero-system.js","heritage-data.js","heritage-system.js","npc-data.js","war-care.js","npc-defense.js","chapter-data.js","siege-data.js","war-orders.js","automation-system.js","named-city-data.js","named-city-system.js","yellow-city-data.js","plot-template-data.js","city-system.js","city-strategy.js","general-growth-data.js","general-growth-system.js","scout-system.js","battle-stratagems.js","tactical-lessons.js","regional-front.js","supply-lines.js","hero-administration.js","battle-review.js","wild-fields.js","web-edition.js","engine.js"];
export function createGameRuntime({snapshot=null,now=globalThis.Date.now(),random=()=>globalThis.Math.random(),externalBusy=[]}={}) {
 const GAME_SERVER_RUNTIME=true;
 const navigator=undefined,module=undefined,document={addEventListener(){}};
 const Date=class extends globalThis.Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
 const Math=Object.create(globalThis.Math);Math.random=random;
 const values=new Map(snapshot===null?[]:[['sanguo-city-v2',JSON.stringify(snapshot)]]);
 const localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const crypto={randomUUID:()=> 'server-runtime'};

// SOURCE: manual-data.js
'use strict';
// Public handbook numeric tables. Unknown timings, prices, research costs and NPC populations are marked trial.
const ManualData = {
  "version": 1,
  "civic": {
    "cooldownSeconds": 900,
    "minimumCostPopulation": 100,
    "comfort": {
      "relief": {"name":"赈灾","resource":"food","costMultiplier":1,"morale":5,"unrest":-15},
      "blessing": {"name":"祈福","resource":"gold","costMultiplier":1,"morale":25,"unrest":-5},
      "immigration": {"name":"增丁","resource":"food","costMultiplier":2,"populationFraction":0.1,"minimumIncrease":20},
      "sacrifice": {"name":"祭天"}
    },
    "levyMultipliers": {"food":5,"wood":3,"stone":3,"iron":2,"gold":2},
    "trialCost": true,
    "trialLevyCooldown": true
  },
  "source": {
    "civic": "https://web.4399.com/rxsg/yxzl_06_993847.html",
    "civicCooldown": "https://web.4399.com/rxsg/wjgl_14_1042.html",
    "buildings": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html",
    "city": "https://web.4399.com/rxsg/yxzy/xszn/a1204085.html",
    "units": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
    "tech": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
    "wild": "https://activity.ledu.com/gamehelp/help_3.html",
    "shop": "https://web.4399.com/rxsg/yxjp_03_22954.html",
    "npc": "https://web.4399.com/rxsg/wjgl_08_19485.html"
  },
  "buildings": {
    "farm": {
      "name": "农田",
      "icon": "田",
      "tag": "粮食生产",
      "desc": "提供粮食，供应建设、研究及军队。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 50,
            "wood": 300,
            "stone": 200,
            "iron": 150
          },
          "seconds": 60,
          "confirmedTime": true,
          "workers": 10,
          "capacity": 10000,
          "output": 100
        },
        {
          "level": 2,
          "cost": {
            "food": 100,
            "wood": 600,
            "stone": 400,
            "iron": 300
          },
          "seconds": 135,
          "confirmedTime": true,
          "workers": 30,
          "capacity": 30000,
          "output": 300
        },
        {
          "level": 3,
          "cost": {
            "food": 200,
            "wood": 1200,
            "stone": 800,
            "iron": 600
          },
          "seconds": 305,
          "confirmedTime": true,
          "workers": 60,
          "capacity": 60000,
          "output": 600
        },
        {
          "level": 4,
          "cost": {
            "food": 400,
            "wood": 2400,
            "stone": 1600,
            "iron": 1200
          },
          "seconds": 655,
          "confirmedTime": true,
          "workers": 100,
          "capacity": 100000,
          "output": 1000
        },
        {
          "level": 5,
          "cost": {
            "food": 800,
            "wood": 4800,
            "stone": 3200,
            "iron": 2400
          },
          "seconds": 1370,
          "confirmedTime": true,
          "workers": 150,
          "capacity": 150000,
          "output": 1500
        },
        {
          "level": 6,
          "cost": {
            "food": 1600,
            "wood": 9600,
            "stone": 6400,
            "iron": 4800
          },
          "seconds": 2775,
          "confirmedTime": true,
          "workers": 210,
          "capacity": 210000,
          "output": 2100
        },
        {
          "level": 7,
          "cost": {
            "food": 3200,
            "wood": 19200,
            "stone": 12800,
            "iron": 9600
          },
          "seconds": 5440,
          "confirmedTime": true,
          "workers": 280,
          "capacity": 280000,
          "output": 2800
        },
        {
          "level": 8,
          "cost": {
            "food": 6400,
            "wood": 38400,
            "stone": 25600,
            "iron": 19200
          },
          "seconds": 10310,
          "confirmedTime": true,
          "workers": 360,
          "capacity": 360000,
          "output": 3600
        },
        {
          "level": 9,
          "cost": {
            "food": 12800,
            "wood": 76800,
            "stone": 51200,
            "iron": 38400
          },
          "seconds": 18870,
          "confirmedTime": true,
          "workers": 450,
          "capacity": 450000,
          "output": 4500
        },
        {
          "level": 10,
          "cost": {
            "food": 25600,
            "wood": 153600,
            "stone": 102400,
            "iron": 76800
          },
          "seconds": 33300,
          "confirmedTime": true,
          "workers": 550,
          "capacity": 550000,
          "output": 5500
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "lumber": {
      "name": "伐木场",
      "icon": "木",
      "tag": "木材生产",
      "desc": "提供木材，用于建筑和军备。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 100,
            "wood": 100,
            "stone": 250,
            "iron": 300
          },
          "seconds": 90,
          "confirmedTime": true,
          "workers": 15,
          "capacity": 10000,
          "output": 100
        },
        {
          "level": 2,
          "cost": {
            "food": 200,
            "wood": 200,
            "stone": 500,
            "iron": 600
          },
          "seconds": 205,
          "confirmedTime": true,
          "workers": 45,
          "capacity": 30000,
          "output": 300
        },
        {
          "level": 3,
          "cost": {
            "food": 400,
            "wood": 400,
            "stone": 1000,
            "iron": 1200
          },
          "seconds": 455,
          "confirmedTime": true,
          "workers": 90,
          "capacity": 60000,
          "output": 600
        },
        {
          "level": 4,
          "cost": {
            "food": 800,
            "wood": 800,
            "stone": 2000,
            "iron": 2400
          },
          "seconds": 985,
          "confirmedTime": true,
          "workers": 150,
          "capacity": 100000,
          "output": 1000
        },
        {
          "level": 5,
          "cost": {
            "food": 1600,
            "wood": 1600,
            "stone": 4000,
            "iron": 4800
          },
          "seconds": 2055,
          "confirmedTime": true,
          "workers": 225,
          "capacity": 150000,
          "output": 1500
        },
        {
          "level": 6,
          "cost": {
            "food": 3200,
            "wood": 3200,
            "stone": 8000,
            "iron": 9600
          },
          "seconds": 4165,
          "confirmedTime": true,
          "workers": 315,
          "capacity": 210000,
          "output": 2100
        },
        {
          "level": 7,
          "cost": {
            "food": 6400,
            "wood": 6400,
            "stone": 16000,
            "iron": 19200
          },
          "seconds": 8160,
          "confirmedTime": true,
          "workers": 420,
          "capacity": 280000,
          "output": 2800
        },
        {
          "level": 8,
          "cost": {
            "food": 12800,
            "wood": 12800,
            "stone": 32000,
            "iron": 38400
          },
          "seconds": 15465,
          "confirmedTime": true,
          "workers": 540,
          "capacity": 360000,
          "output": 3600
        },
        {
          "level": 9,
          "cost": {
            "food": 25600,
            "wood": 25600,
            "stone": 64000,
            "iron": 76800
          },
          "seconds": 28300,
          "confirmedTime": true,
          "workers": 675,
          "capacity": 450000,
          "output": 4500
        },
        {
          "level": 10,
          "cost": {
            "food": 51200,
            "wood": 51200,
            "stone": 128000,
            "iron": 153600
          },
          "seconds": 49955,
          "confirmedTime": true,
          "workers": 825,
          "capacity": 550000,
          "output": 5500
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "quarry": {
      "name": "采石场",
      "icon": "石",
      "tag": "石料生产",
      "desc": "提供石料，用于建筑和器械。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 180,
            "wood": 500,
            "stone": 150,
            "iron": 400
          },
          "seconds": 120,
          "confirmedTime": true,
          "workers": 20,
          "capacity": 10000,
          "output": 100
        },
        {
          "level": 2,
          "cost": {
            "food": 360,
            "wood": 1000,
            "stone": 300,
            "iron": 800
          },
          "seconds": 275,
          "confirmedTime": true,
          "workers": 60,
          "capacity": 30000,
          "output": 300
        },
        {
          "level": 3,
          "cost": {
            "food": 720,
            "wood": 2000,
            "stone": 600,
            "iron": 1600
          },
          "seconds": 610,
          "confirmedTime": true,
          "workers": 120,
          "capacity": 60000,
          "output": 600
        },
        {
          "level": 4,
          "cost": {
            "food": 1440,
            "wood": 4000,
            "stone": 1200,
            "iron": 3200
          },
          "seconds": 1310,
          "confirmedTime": true,
          "workers": 200,
          "capacity": 100000,
          "output": 1000
        },
        {
          "level": 5,
          "cost": {
            "food": 2880,
            "wood": 8000,
            "stone": 2400,
            "iron": 6400
          },
          "seconds": 2740,
          "confirmedTime": true,
          "workers": 300,
          "capacity": 150000,
          "output": 1500
        },
        {
          "level": 6,
          "cost": {
            "food": 5760,
            "wood": 16000,
            "stone": 4800,
            "iron": 12800
          },
          "seconds": 5550,
          "confirmedTime": true,
          "workers": 420,
          "capacity": 210000,
          "output": 2100
        },
        {
          "level": 7,
          "cost": {
            "food": 11520,
            "wood": 32000,
            "stone": 9600,
            "iron": 25600
          },
          "seconds": 10880,
          "confirmedTime": true,
          "workers": 560,
          "capacity": 280000,
          "output": 2800
        },
        {
          "level": 8,
          "cost": {
            "food": 23040,
            "wood": 64000,
            "stone": 19200,
            "iron": 51200
          },
          "seconds": 20620,
          "confirmedTime": true,
          "workers": 720,
          "capacity": 360000,
          "output": 3600
        },
        {
          "level": 9,
          "cost": {
            "food": 46080,
            "wood": 128000,
            "stone": 38400,
            "iron": 102400
          },
          "seconds": 37735,
          "confirmedTime": true,
          "workers": 900,
          "capacity": 450000,
          "output": 4500
        },
        {
          "level": 10,
          "cost": {
            "food": 92160,
            "wood": 256000,
            "stone": 76800,
            "iron": 204800
          },
          "seconds": 66605,
          "confirmedTime": true,
          "workers": 1100,
          "capacity": 550000,
          "output": 5500
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "mine": {
      "name": "铁矿",
      "icon": "铁",
      "tag": "铁锭生产",
      "desc": "提供铁锭，用于武器与护甲。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 210,
            "wood": 600,
            "stone": 500,
            "iron": 200
          },
          "seconds": 180,
          "confirmedTime": true,
          "workers": 30,
          "capacity": 10000,
          "output": 100
        },
        {
          "level": 2,
          "cost": {
            "food": 420,
            "wood": 1200,
            "stone": 1000,
            "iron": 400
          },
          "seconds": 410,
          "confirmedTime": true,
          "workers": 90,
          "capacity": 30000,
          "output": 300
        },
        {
          "level": 3,
          "cost": {
            "food": 840,
            "wood": 2400,
            "stone": 2000,
            "iron": 800
          },
          "seconds": 915,
          "confirmedTime": true,
          "workers": 180,
          "capacity": 60000,
          "output": 600
        },
        {
          "level": 4,
          "cost": {
            "food": 1680,
            "wood": 4800,
            "stone": 4000,
            "iron": 1600
          },
          "seconds": 1970,
          "confirmedTime": true,
          "workers": 300,
          "capacity": 100000,
          "output": 1000
        },
        {
          "level": 5,
          "cost": {
            "food": 3360,
            "wood": 9600,
            "stone": 8000,
            "iron": 3200
          },
          "seconds": 4110,
          "confirmedTime": true,
          "workers": 450,
          "capacity": 150000,
          "output": 1500
        },
        {
          "level": 6,
          "cost": {
            "food": 6720,
            "wood": 19200,
            "stone": 16000,
            "iron": 6400
          },
          "seconds": 8330,
          "confirmedTime": true,
          "workers": 630,
          "capacity": 210000,
          "output": 2100
        },
        {
          "level": 7,
          "cost": {
            "food": 13440,
            "wood": 38400,
            "stone": 32000,
            "iron": 12800
          },
          "seconds": 16320,
          "confirmedTime": true,
          "workers": 840,
          "capacity": 280000,
          "output": 2800
        },
        {
          "level": 8,
          "cost": {
            "food": 26880,
            "wood": 76800,
            "stone": 64000,
            "iron": 25600
          },
          "seconds": 30930,
          "confirmedTime": true,
          "workers": 1080,
          "capacity": 360000,
          "output": 3600
        },
        {
          "level": 9,
          "cost": {
            "food": 53760,
            "wood": 153600,
            "stone": 128000,
            "iron": 51200
          },
          "seconds": 56605,
          "confirmedTime": true,
          "workers": 1350,
          "capacity": 450000,
          "output": 4500
        },
        {
          "level": 10,
          "cost": {
            "food": 107520,
            "wood": 307200,
            "stone": 256000,
            "iron": 102400
          },
          "seconds": 99905,
          "confirmedTime": true,
          "workers": 1650,
          "capacity": 550000,
          "output": 5500
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "house": {
      "name": "民房",
      "icon": "居",
      "tag": "人口住宅",
      "desc": "提高城池可容纳的平民人口，可建多座。",
      "max": 10,
      "repeat": true,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 100,
            "wood": 500,
            "stone": 100,
            "iron": 50
          },
          "seconds": 150,
          "confirmedTime": true,
          "population": 100
        },
        {
          "level": 2,
          "cost": {
            "food": 200,
            "wood": 1000,
            "stone": 200,
            "iron": 100
          },
          "seconds": 335,
          "confirmedTime": true,
          "population": 300
        },
        {
          "level": 3,
          "cost": {
            "food": 400,
            "wood": 2000,
            "stone": 400,
            "iron": 200
          },
          "seconds": 725,
          "confirmedTime": true,
          "population": 600
        },
        {
          "level": 4,
          "cost": {
            "food": 800,
            "wood": 4000,
            "stone": 800,
            "iron": 400
          },
          "seconds": 1530,
          "confirmedTime": true,
          "population": 1000
        },
        {
          "level": 5,
          "cost": {
            "food": 1600,
            "wood": 8000,
            "stone": 1600,
            "iron": 800
          },
          "seconds": 3170,
          "confirmedTime": true,
          "population": 1500
        },
        {
          "level": 6,
          "cost": {
            "food": 3200,
            "wood": 16000,
            "stone": 3200,
            "iron": 1600
          },
          "seconds": 6405,
          "confirmedTime": true,
          "population": 2100
        },
        {
          "level": 7,
          "cost": {
            "food": 6400,
            "wood": 32000,
            "stone": 6400,
            "iron": 3200
          },
          "seconds": 12620,
          "confirmedTime": true,
          "population": 2800
        },
        {
          "level": 8,
          "cost": {
            "food": 12800,
            "wood": 64000,
            "stone": 12800,
            "iron": 6400
          },
          "seconds": 24230,
          "confirmedTime": true,
          "population": 3600
        },
        {
          "level": 9,
          "cost": {
            "food": 25600,
            "wood": 128000,
            "stone": 25600,
            "iron": 12800
          },
          "seconds": 45310,
          "confirmedTime": true,
          "population": 4500
        },
        {
          "level": 10,
          "cost": {
            "food": 51200,
            "wood": 256000,
            "stone": 51200,
            "iron": 25600
          },
          "seconds": 82460,
          "confirmedTime": true,
          "population": 5500
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "academy": {
      "name": "书院",
      "icon": "研",
      "tag": "科技研究",
      "desc": "研究科技，每座城池只设一所书院，同时研究一项。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 120,
            "wood": 2500,
            "stone": 1500,
            "iron": 200
          },
          "seconds": 600,
          "confirmedTime": false
        },
        {
          "level": 2,
          "cost": {
            "food": 240,
            "wood": 5000,
            "stone": 3000,
            "iron": 400
          },
          "seconds": 1200,
          "confirmedTime": false
        },
        {
          "level": 3,
          "cost": {
            "food": 480,
            "wood": 10000,
            "stone": 6000,
            "iron": 800
          },
          "seconds": 2400,
          "confirmedTime": false
        },
        {
          "level": 4,
          "cost": {
            "food": 960,
            "wood": 20000,
            "stone": 12000,
            "iron": 1600
          },
          "seconds": 4800,
          "confirmedTime": false
        },
        {
          "level": 5,
          "cost": {
            "food": 1920,
            "wood": 40000,
            "stone": 24000,
            "iron": 3200
          },
          "seconds": 9600,
          "confirmedTime": false
        },
        {
          "level": 6,
          "cost": {
            "food": 3840,
            "wood": 80000,
            "stone": 48000,
            "iron": 6400
          },
          "seconds": 19200,
          "confirmedTime": false
        },
        {
          "level": 7,
          "cost": {
            "food": 7680,
            "wood": 160000,
            "stone": 96000,
            "iron": 12800
          },
          "seconds": 38400,
          "confirmedTime": false
        },
        {
          "level": 8,
          "cost": {
            "food": 15360,
            "wood": 320000,
            "stone": 192000,
            "iron": 25600
          },
          "seconds": 76800,
          "confirmedTime": false
        },
        {
          "level": 9,
          "cost": {
            "food": 30720,
            "wood": 640000,
            "stone": 384000,
            "iron": 51200
          },
          "seconds": 153600,
          "confirmedTime": false
        },
        {
          "level": 10,
          "cost": {
            "food": 61440,
            "wood": 1280000,
            "stone": 768000,
            "iron": 102400
          },
          "seconds": 307200,
          "confirmedTime": false
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "inn": {
      "name": "客栈",
      "icon": "栈",
      "tag": "招募将领",
      "desc": "展示可招募将领，等级决定候选席位。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 300,
            "wood": 2000,
            "stone": 1000,
            "iron": 400
          },
          "seconds": 480,
          "confirmedTime": true,
          "limit": 1
        },
        {
          "level": 2,
          "cost": {
            "food": 600,
            "wood": 4000,
            "stone": 2000,
            "iron": 800
          },
          "seconds": 1065,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "food": 1200,
            "wood": 8000,
            "stone": 4000,
            "iron": 1600
          },
          "seconds": 2310,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 4,
          "cost": {
            "food": 2400,
            "wood": 16000,
            "stone": 8000,
            "iron": 3200
          },
          "seconds": 4900,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 5,
          "cost": {
            "food": 4800,
            "wood": 32000,
            "stone": 16000,
            "iron": 6400
          },
          "seconds": 10150,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 6,
          "cost": {
            "food": 9600,
            "wood": 64000,
            "stone": 32000,
            "iron": 12800
          },
          "seconds": 20500,
          "confirmedTime": true,
          "limit": 6
        },
        {
          "level": 7,
          "cost": {
            "food": 19200,
            "wood": 128000,
            "stone": 64000,
            "iron": 25600
          },
          "seconds": 40380,
          "confirmedTime": true,
          "limit": 7
        },
        {
          "level": 8,
          "cost": {
            "food": 38400,
            "wood": 256000,
            "stone": 128000,
            "iron": 51200
          },
          "seconds": 77530,
          "confirmedTime": true,
          "limit": 8
        },
        {
          "level": 9,
          "cost": {
            "food": 76800,
            "wood": 512000,
            "stone": 256000,
            "iron": 102400
          },
          "seconds": 144985,
          "confirmedTime": true,
          "limit": 9
        },
        {
          "level": 10,
          "cost": {
            "food": 153600,
            "wood": 1024000,
            "stone": 512000,
            "iron": 204800
          },
          "seconds": 263870,
          "confirmedTime": true,
          "limit": 10
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "market": {
      "name": "市场",
      "icon": "市",
      "tag": "资源交易",
      "desc": "买卖资源，等级决定商队数。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 1000,
            "wood": 1000,
            "stone": 1000,
            "iron": 1000
          },
          "seconds": 1500,
          "confirmedTime": true,
          "limit": 1
        },
        {
          "level": 2,
          "cost": {
            "food": 2000,
            "wood": 2000,
            "stone": 2000,
            "iron": 2000
          },
          "seconds": 3330,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "food": 4000,
            "wood": 4000,
            "stone": 4000,
            "iron": 4000
          },
          "seconds": 7225,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 4,
          "cost": {
            "food": 8000,
            "wood": 8000,
            "stone": 8000,
            "iron": 8000
          },
          "seconds": 15320,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 5,
          "cost": {
            "food": 16000,
            "wood": 16000,
            "stone": 16000,
            "iron": 16000
          },
          "seconds": 31710,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 6,
          "cost": {
            "food": 32000,
            "wood": 32000,
            "stone": 32000,
            "iron": 32000
          },
          "seconds": 64055,
          "confirmedTime": true,
          "limit": 6
        },
        {
          "level": 7,
          "cost": {
            "food": 64000,
            "wood": 64000,
            "stone": 64000,
            "iron": 64000
          },
          "seconds": 126190,
          "confirmedTime": true,
          "limit": 7
        },
        {
          "level": 8,
          "cost": {
            "food": 128000,
            "wood": 128000,
            "stone": 128000,
            "iron": 128000
          },
          "seconds": 242285,
          "confirmedTime": true,
          "limit": 8
        },
        {
          "level": 9,
          "cost": {
            "food": 256000,
            "wood": 256000,
            "stone": 256000,
            "iron": 256000
          },
          "seconds": 453075,
          "confirmedTime": true,
          "limit": 9
        },
        {
          "level": 10,
          "cost": {
            "food": 512000,
            "wood": 512000,
            "stone": 512000,
            "iron": 512000
          },
          "seconds": 824595,
          "confirmedTime": true,
          "limit": 10
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "warehouse": {
      "name": "仓库",
      "icon": "仓",
      "tag": "储存保护",
      "desc": "增加储量并保护四种资源，黄金不在保护范围。",
      "max": 10,
      "repeat": true,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 100,
            "wood": 1800,
            "stone": 1000,
            "iron": 300
          },
          "seconds": 1200,
          "confirmedTime": true,
          "capacity": 10000
        },
        {
          "level": 2,
          "cost": {
            "food": 200,
            "wood": 3600,
            "stone": 2000,
            "iron": 600
          },
          "seconds": 2665,
          "confirmedTime": true,
          "capacity": 30000
        },
        {
          "level": 3,
          "cost": {
            "food": 400,
            "wood": 7200,
            "stone": 4000,
            "iron": 1200
          },
          "seconds": 5780,
          "confirmedTime": true,
          "capacity": 60000
        },
        {
          "level": 4,
          "cost": {
            "food": 800,
            "wood": 14400,
            "stone": 8000,
            "iron": 2400
          },
          "seconds": 12255,
          "confirmedTime": true,
          "capacity": 100000
        },
        {
          "level": 5,
          "cost": {
            "food": 1600,
            "wood": 28800,
            "stone": 16000,
            "iron": 4800
          },
          "seconds": 25370,
          "confirmedTime": true,
          "capacity": 150000
        },
        {
          "level": 6,
          "cost": {
            "food": 3200,
            "wood": 57600,
            "stone": 32000,
            "iron": 9600
          },
          "seconds": 51245,
          "confirmedTime": true,
          "capacity": 210000
        },
        {
          "level": 7,
          "cost": {
            "food": 6400,
            "wood": 115200,
            "stone": 64000,
            "iron": 19200
          },
          "seconds": 100955,
          "confirmedTime": true,
          "capacity": 280000
        },
        {
          "level": 8,
          "cost": {
            "food": 12800,
            "wood": 230400,
            "stone": 128000,
            "iron": 38400
          },
          "seconds": 193830,
          "confirmedTime": true,
          "capacity": 360000
        },
        {
          "level": 9,
          "cost": {
            "food": 25600,
            "wood": 460800,
            "stone": 256000,
            "iron": 76800
          },
          "seconds": 362460,
          "confirmedTime": true,
          "capacity": 450000
        },
        {
          "level": 10,
          "cost": {
            "food": 51200,
            "wood": 921600,
            "stone": 512000,
            "iron": 153600
          },
          "seconds": 659680,
          "confirmedTime": true,
          "capacity": 550000
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "drill": {
      "name": "校场",
      "icon": "校",
      "tag": "出征指挥",
      "desc": "设置战术、查看外出部队，等级决定出征队伍名额。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 100,
            "wood": 600,
            "stone": 2000,
            "iron": 150
          },
          "seconds": 300,
          "confirmedTime": true,
          "limit": 1
        },
        {
          "level": 2,
          "cost": {
            "food": 200,
            "wood": 1200,
            "stone": 4000,
            "iron": 300
          },
          "seconds": 665,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "food": 400,
            "wood": 2400,
            "stone": 8000,
            "iron": 600
          },
          "seconds": 1445,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 4,
          "cost": {
            "food": 800,
            "wood": 4800,
            "stone": 16000,
            "iron": 1200
          },
          "seconds": 3065,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 5,
          "cost": {
            "food": 1600,
            "wood": 9600,
            "stone": 32000,
            "iron": 2400
          },
          "seconds": 6340,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 6,
          "cost": {
            "food": 3200,
            "wood": 19200,
            "stone": 64000,
            "iron": 4800
          },
          "seconds": 12810,
          "confirmedTime": true,
          "limit": 6
        },
        {
          "level": 7,
          "cost": {
            "food": 6400,
            "wood": 38400,
            "stone": 128000,
            "iron": 9600
          },
          "seconds": 25240,
          "confirmedTime": true,
          "limit": 7
        },
        {
          "level": 8,
          "cost": {
            "food": 12800,
            "wood": 76800,
            "stone": 256000,
            "iron": 19200
          },
          "seconds": 48455,
          "confirmedTime": true,
          "limit": 8
        },
        {
          "level": 9,
          "cost": {
            "food": 25600,
            "wood": 153600,
            "stone": 512000,
            "iron": 38400
          },
          "seconds": 90615,
          "confirmedTime": true,
          "limit": 9
        },
        {
          "level": 10,
          "cost": {
            "food": 51200,
            "wood": 307200,
            "stone": 1024000,
            "iron": 76800
          },
          "seconds": 164920,
          "confirmedTime": true,
          "limit": 10
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "barracks": {
      "name": "军营",
      "icon": "营",
      "tag": "征募士兵",
      "desc": "训练和解散军队，等级决定训练队列及可招募兵种。",
      "max": 10,
      "repeat": true,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 250,
            "wood": 1200,
            "stone": 1500,
            "iron": 500
          },
          "seconds": 600,
          "confirmedTime": true,
          "limit": 1
        },
        {
          "level": 2,
          "cost": {
            "food": 500,
            "wood": 2400,
            "stone": 3000,
            "iron": 1000
          },
          "seconds": 1330,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "food": 1000,
            "wood": 4800,
            "stone": 6000,
            "iron": 2000
          },
          "seconds": 2890,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 4,
          "cost": {
            "food": 2000,
            "wood": 9600,
            "stone": 12000,
            "iron": 4000
          },
          "seconds": 6130,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 5,
          "cost": {
            "food": 4000,
            "wood": 19200,
            "stone": 24000,
            "iron": 8000
          },
          "seconds": 12685,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 6,
          "cost": {
            "food": 8000,
            "wood": 38400,
            "stone": 48000,
            "iron": 16000
          },
          "seconds": 25625,
          "confirmedTime": true,
          "limit": 6
        },
        {
          "level": 7,
          "cost": {
            "food": 16000,
            "wood": 76800,
            "stone": 96000,
            "iron": 32000
          },
          "seconds": 50475,
          "confirmedTime": true,
          "limit": 7
        },
        {
          "level": 8,
          "cost": {
            "food": 32000,
            "wood": 153600,
            "stone": 192000,
            "iron": 64000
          },
          "seconds": 96915,
          "confirmedTime": true,
          "limit": 8
        },
        {
          "level": 9,
          "cost": {
            "food": 64000,
            "wood": 307200,
            "stone": 384000,
            "iron": 128000
          },
          "seconds": 181230,
          "confirmedTime": true,
          "limit": 9
        },
        {
          "level": 10,
          "cost": {
            "food": 128000,
            "wood": 614400,
            "stone": 768000,
            "iron": 256000
          },
          "seconds": 329840,
          "confirmedTime": true,
          "limit": 10
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "tavern": {
      "name": "招贤馆",
      "icon": "贤",
      "tag": "将领房间",
      "desc": "提供将领房间，招募前需要空闲房间。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 400,
            "wood": 2500,
            "stone": 1200,
            "iron": 700
          },
          "seconds": 720,
          "confirmedTime": true,
          "limit": 1
        },
        {
          "level": 2,
          "cost": {
            "food": 800,
            "wood": 5000,
            "stone": 2400,
            "iron": 1400
          },
          "seconds": 1600,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "food": 1600,
            "wood": 10000,
            "stone": 4800,
            "iron": 2800
          },
          "seconds": 3470,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 4,
          "cost": {
            "food": 3200,
            "wood": 20000,
            "stone": 9600,
            "iron": 5600
          },
          "seconds": 7355,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 5,
          "cost": {
            "food": 6400,
            "wood": 40000,
            "stone": 19200,
            "iron": 11200
          },
          "seconds": 15220,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 6,
          "cost": {
            "food": 12800,
            "wood": 80000,
            "stone": 38400,
            "iron": 22400
          },
          "seconds": 30745,
          "confirmedTime": true,
          "limit": 6
        },
        {
          "level": 7,
          "cost": {
            "food": 25600,
            "wood": 160000,
            "stone": 76800,
            "iron": 44800
          },
          "seconds": 60570,
          "confirmedTime": true,
          "limit": 7
        },
        {
          "level": 8,
          "cost": {
            "food": 51200,
            "wood": 320000,
            "stone": 153600,
            "iron": 89600
          },
          "seconds": 116295,
          "confirmedTime": true,
          "limit": 8
        },
        {
          "level": 9,
          "cost": {
            "food": 102400,
            "wood": 640000,
            "stone": 307200,
            "iron": 179200
          },
          "seconds": 217475,
          "confirmedTime": true,
          "limit": 9
        },
        {
          "level": 10,
          "cost": {
            "food": 204800,
            "wood": 1280000,
            "stone": 614400,
            "iron": 358400
          },
          "seconds": 395805,
          "confirmedTime": true,
          "limit": 10
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "embassy": {
      "name": "鸿胪寺",
      "icon": "盟",
      "tag": "联盟接待",
      "desc": "一级可加入联盟，二级可创建联盟；单机模式查看接待规则。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 200,
            "wood": 2000,
            "stone": 500,
            "iron": 300
          },
          "seconds": 1440,
          "confirmedTime": true,
          "limit": 1
        },
        {
          "level": 2,
          "cost": {
            "food": 400,
            "wood": 4000,
            "stone": 1000,
            "iron": 600
          },
          "seconds": 3195,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "food": 800,
            "wood": 8000,
            "stone": 2000,
            "iron": 1200
          },
          "seconds": 6935,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 4,
          "cost": {
            "food": 1600,
            "wood": 16000,
            "stone": 4000,
            "iron": 2400
          },
          "seconds": 14705,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 5,
          "cost": {
            "food": 3200,
            "wood": 32000,
            "stone": 8000,
            "iron": 4800
          },
          "seconds": 30445,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 6,
          "cost": {
            "food": 6400,
            "wood": 64000,
            "stone": 16000,
            "iron": 9600
          },
          "seconds": 61495,
          "confirmedTime": true,
          "limit": 6
        },
        {
          "level": 7,
          "cost": {
            "food": 12800,
            "wood": 128000,
            "stone": 32000,
            "iron": 19200
          },
          "seconds": 121145,
          "confirmedTime": true,
          "limit": 7
        },
        {
          "level": 8,
          "cost": {
            "food": 25600,
            "wood": 256000,
            "stone": 64000,
            "iron": 38400
          },
          "seconds": 232595,
          "confirmedTime": true,
          "limit": 8
        },
        {
          "level": 9,
          "cost": {
            "food": 51200,
            "wood": 512000,
            "stone": 128000,
            "iron": 76800
          },
          "seconds": 434955,
          "confirmedTime": true,
          "limit": 9
        },
        {
          "level": 10,
          "cost": {
            "food": 102400,
            "wood": 1024000,
            "stone": 256000,
            "iron": 153600
          },
          "seconds": 791615,
          "confirmedTime": true,
          "limit": 10
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "smith": {
      "name": "铁匠铺",
      "icon": "锻",
      "tag": "武器设施",
      "desc": "军事武器设施，配合兵种与科技发展。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 125,
            "wood": 1000,
            "stone": 600,
            "iron": 1200
          },
          "seconds": 360,
          "confirmedTime": true
        },
        {
          "level": 2,
          "cost": {
            "food": 250,
            "wood": 2000,
            "stone": 1200,
            "iron": 2400
          },
          "seconds": 800,
          "confirmedTime": true
        },
        {
          "level": 3,
          "cost": {
            "food": 500,
            "wood": 4000,
            "stone": 2400,
            "iron": 4800
          },
          "seconds": 1735,
          "confirmedTime": true
        },
        {
          "level": 4,
          "cost": {
            "food": 1000,
            "wood": 8000,
            "stone": 4800,
            "iron": 9600
          },
          "seconds": 3675,
          "confirmedTime": true
        },
        {
          "level": 5,
          "cost": {
            "food": 2000,
            "wood": 16000,
            "stone": 9600,
            "iron": 19200
          },
          "seconds": 7610,
          "confirmedTime": true
        },
        {
          "level": 6,
          "cost": {
            "food": 4000,
            "wood": 32000,
            "stone": 19200,
            "iron": 38400
          },
          "seconds": 15375,
          "confirmedTime": true
        },
        {
          "level": 7,
          "cost": {
            "food": 8000,
            "wood": 64000,
            "stone": 38400,
            "iron": 76800
          },
          "seconds": 30285,
          "confirmedTime": true
        },
        {
          "level": 8,
          "cost": {
            "food": 16000,
            "wood": 128000,
            "stone": 76800,
            "iron": 153600
          },
          "seconds": 58150,
          "confirmedTime": true
        },
        {
          "level": 9,
          "cost": {
            "food": 32000,
            "wood": 256000,
            "stone": 153600,
            "iron": 307200
          },
          "seconds": 108740,
          "confirmedTime": true
        },
        {
          "level": 10,
          "cost": {
            "food": 64000,
            "wood": 512000,
            "stone": 307200,
            "iron": 614400
          },
          "seconds": 197905,
          "confirmedTime": true
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "workshop": {
      "name": "工匠作坊",
      "icon": "械",
      "tag": "军用器械",
      "desc": "攻城器械制造设施。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 150,
            "wood": 1500,
            "stone": 500,
            "iron": 1500
          },
          "seconds": 1080,
          "confirmedTime": true
        },
        {
          "level": 2,
          "cost": {
            "food": 300,
            "wood": 3000,
            "stone": 1000,
            "iron": 3000
          },
          "seconds": 2400,
          "confirmedTime": true
        },
        {
          "level": 3,
          "cost": {
            "food": 600,
            "wood": 6000,
            "stone": 2000,
            "iron": 6000
          },
          "seconds": 5205,
          "confirmedTime": true
        },
        {
          "level": 4,
          "cost": {
            "food": 1200,
            "wood": 12000,
            "stone": 4000,
            "iron": 12000
          },
          "seconds": 11030,
          "confirmedTime": true
        },
        {
          "level": 5,
          "cost": {
            "food": 2400,
            "wood": 24000,
            "stone": 8000,
            "iron": 24000
          },
          "seconds": 22830,
          "confirmedTime": true
        },
        {
          "level": 6,
          "cost": {
            "food": 4800,
            "wood": 48000,
            "stone": 16000,
            "iron": 48000
          },
          "seconds": 46120,
          "confirmedTime": true
        },
        {
          "level": 7,
          "cost": {
            "food": 9600,
            "wood": 96000,
            "stone": 32000,
            "iron": 96000
          },
          "seconds": 90855,
          "confirmedTime": true
        },
        {
          "level": 8,
          "cost": {
            "food": 19200,
            "wood": 192000,
            "stone": 64000,
            "iron": 192000
          },
          "seconds": 174445,
          "confirmedTime": true
        },
        {
          "level": 9,
          "cost": {
            "food": 38400,
            "wood": 384000,
            "stone": 128000,
            "iron": 384000
          },
          "seconds": 326215,
          "confirmedTime": true
        },
        {
          "level": 10,
          "cost": {
            "food": 76800,
            "wood": 768000,
            "stone": 256000,
            "iron": 768000
          },
          "seconds": 593710,
          "confirmedTime": true
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "stable": {
      "name": "马厩",
      "icon": "马",
      "tag": "骑兵设施",
      "desc": "训练骑兵所需的马匹设施。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "wood": 2000,
            "stone": 800,
            "iron": 1000,
            "food": 1200
          },
          "seconds": 540,
          "confirmedTime": true
        },
        {
          "level": 2,
          "cost": {
            "wood": 4000,
            "stone": 1600,
            "iron": 2000,
            "food": 2400
          },
          "seconds": 1200,
          "confirmedTime": true
        },
        {
          "level": 3,
          "cost": {
            "wood": 8000,
            "stone": 3200,
            "iron": 4000,
            "food": 4800
          },
          "seconds": 2600,
          "confirmedTime": true
        },
        {
          "level": 4,
          "cost": {
            "wood": 16000,
            "stone": 6400,
            "iron": 8000,
            "food": 9600
          },
          "seconds": 5515,
          "confirmedTime": true
        },
        {
          "level": 5,
          "cost": {
            "wood": 32000,
            "stone": 12800,
            "iron": 16000,
            "food": 19200
          },
          "seconds": 11415,
          "confirmedTime": true
        },
        {
          "level": 6,
          "cost": {
            "wood": 64000,
            "stone": 25600,
            "iron": 32000,
            "food": 38400
          },
          "seconds": 23060,
          "confirmedTime": true
        },
        {
          "level": 7,
          "cost": {
            "wood": 128000,
            "stone": 51200,
            "iron": 64000,
            "food": 76800
          },
          "seconds": 45430,
          "confirmedTime": true
        },
        {
          "level": 8,
          "cost": {
            "wood": 256000,
            "stone": 102400,
            "iron": 128000,
            "food": 153600
          },
          "seconds": 87225,
          "confirmedTime": true
        },
        {
          "level": 9,
          "cost": {
            "wood": 512000,
            "stone": 204800,
            "iron": 256000,
            "food": 307200
          },
          "seconds": 163105,
          "confirmedTime": true
        },
        {
          "level": 10,
          "cost": {
            "wood": 1024000,
            "stone": 409600,
            "iron": 512000,
            "food": 614400
          },
          "seconds": 296855,
          "confirmedTime": true
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "post": {
      "name": "驿站",
      "icon": "驿",
      "tag": "友城行军",
      "desc": "加快自己与盟友城池之间的运输，不加快攻打敌军。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "wood": 5000,
            "stone": 4500,
            "iron": 500,
            "food": 1500
          },
          "seconds": 3600,
          "confirmedTime": true,
          "limit": 1.5
        },
        {
          "level": 2,
          "cost": {
            "wood": 10000,
            "stone": 9000,
            "iron": 1000,
            "food": 3000
          },
          "seconds": 7990,
          "confirmedTime": true,
          "limit": 2
        },
        {
          "level": 3,
          "cost": {
            "wood": 20000,
            "stone": 18000,
            "iron": 2000,
            "food": 6000
          },
          "seconds": 17345,
          "confirmedTime": true,
          "limit": 2.5
        },
        {
          "level": 4,
          "cost": {
            "wood": 40000,
            "stone": 36000,
            "iron": 4000,
            "food": 12000
          },
          "seconds": 36765,
          "confirmedTime": true,
          "limit": 3
        },
        {
          "level": 5,
          "cost": {
            "wood": 80000,
            "stone": 72000,
            "iron": 8000,
            "food": 24000
          },
          "seconds": 76105,
          "confirmedTime": true,
          "limit": 3.5
        },
        {
          "level": 6,
          "cost": {
            "wood": 160000,
            "stone": 144000,
            "iron": 16000,
            "food": 48000
          },
          "seconds": 153735,
          "confirmedTime": true,
          "limit": 4
        },
        {
          "level": 7,
          "cost": {
            "wood": 320000,
            "stone": 288000,
            "iron": 32000,
            "food": 96000
          },
          "seconds": 302860,
          "confirmedTime": true,
          "limit": 4.5
        },
        {
          "level": 8,
          "cost": {
            "wood": 640000,
            "stone": 576000,
            "iron": 64000,
            "food": 192000
          },
          "seconds": 581485,
          "confirmedTime": true,
          "limit": 5
        },
        {
          "level": 9,
          "cost": {
            "wood": 1280000,
            "stone": 1152000,
            "iron": 128000,
            "food": 384000
          },
          "seconds": 1087380,
          "confirmedTime": true,
          "limit": 5.5
        },
        {
          "level": 10,
          "cost": {
            "wood": 2560000,
            "stone": 2304000,
            "iron": 256000,
            "food": 768000
          },
          "seconds": 1979035,
          "confirmedTime": true,
          "limit": 6
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "beacon": {
      "name": "烽火台",
      "icon": "烽",
      "tag": "预警情报",
      "desc": "用于来袭预警和情报；当前单机没有玩家来袭。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "wood": 1000,
            "stone": 3000,
            "iron": 300,
            "food": 150
          },
          "seconds": 900,
          "confirmedTime": true
        },
        {
          "level": 2,
          "cost": {
            "wood": 2000,
            "stone": 6000,
            "iron": 600,
            "food": 300
          },
          "seconds": 2000,
          "confirmedTime": true
        },
        {
          "level": 3,
          "cost": {
            "wood": 4000,
            "stone": 12000,
            "iron": 1200,
            "food": 600
          },
          "seconds": 4335,
          "confirmedTime": true
        },
        {
          "level": 4,
          "cost": {
            "wood": 8000,
            "stone": 24000,
            "iron": 2400,
            "food": 1200
          },
          "seconds": 9190,
          "confirmedTime": true
        },
        {
          "level": 5,
          "cost": {
            "wood": 16000,
            "stone": 48000,
            "iron": 4800,
            "food": 2400
          },
          "seconds": 19025,
          "confirmedTime": true
        },
        {
          "level": 6,
          "cost": {
            "wood": 32000,
            "stone": 96000,
            "iron": 9600,
            "food": 4800
          },
          "seconds": 38435,
          "confirmedTime": true
        },
        {
          "level": 7,
          "cost": {
            "wood": 64000,
            "stone": 192000,
            "iron": 19200,
            "food": 9600
          },
          "seconds": 75715,
          "confirmedTime": true
        },
        {
          "level": 8,
          "cost": {
            "wood": 128000,
            "stone": 384000,
            "iron": 38400,
            "food": 19200
          },
          "seconds": 145370,
          "confirmedTime": true
        },
        {
          "level": 9,
          "cost": {
            "wood": 256000,
            "stone": 768000,
            "iron": 76800,
            "food": 38400
          },
          "seconds": 271845,
          "confirmedTime": true
        },
        {
          "level": 10,
          "cost": {
            "wood": 512000,
            "stone": 1536000,
            "iron": 153600,
            "food": 76800
          },
          "seconds": 494760,
          "confirmedTime": true
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "hall": {
      "name": "官府",
      "icon": "府",
      "tag": "城务管理",
      "desc": "管理税率与民心，扩展城外空地及附属野地名额。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "food": 0,
            "wood": 0,
            "stone": 0,
            "iron": 0
          },
          "seconds": 0,
          "confirmedTime": false,
          "capacity": 1000000
        },
        {
          "level": 2,
          "cost": {
            "food": 400,
            "wood": 6000,
            "stone": 5000,
            "iron": 200
          },
          "seconds": 1800,
          "confirmedTime": true,
          "capacity": 3000000
        },
        {
          "level": 3,
          "cost": {
            "food": 800,
            "wood": 12000,
            "stone": 10000,
            "iron": 400
          },
          "seconds": 3995,
          "confirmedTime": true,
          "capacity": 6000000
        },
        {
          "level": 4,
          "cost": {
            "food": 1600,
            "wood": 24000,
            "stone": 20000,
            "iron": 800
          },
          "seconds": 8670,
          "confirmedTime": true,
          "capacity": 10000000
        },
        {
          "level": 5,
          "cost": {
            "food": 3200,
            "wood": 48000,
            "stone": 40000,
            "iron": 1600
          },
          "seconds": 18385,
          "confirmedTime": true,
          "capacity": 15000000
        },
        {
          "level": 6,
          "cost": {
            "food": 6400,
            "wood": 96000,
            "stone": 80000,
            "iron": 3200
          },
          "seconds": 38055,
          "confirmedTime": true,
          "capacity": 21000000
        },
        {
          "level": 7,
          "cost": {
            "food": 12800,
            "wood": 192000,
            "stone": 160000,
            "iron": 6400
          },
          "seconds": 76870,
          "confirmedTime": true,
          "capacity": 28000000
        },
        {
          "level": 8,
          "cost": {
            "food": 25600,
            "wood": 384000,
            "stone": 320000,
            "iron": 12800
          },
          "seconds": 151430,
          "confirmedTime": true,
          "capacity": 36000000
        },
        {
          "level": 9,
          "cost": {
            "food": 51200,
            "wood": 768000,
            "stone": 640000,
            "iron": 25600
          },
          "seconds": 290745,
          "confirmedTime": true,
          "capacity": 45000000
        },
        {
          "level": 10,
          "cost": {
            "food": 102400,
            "wood": 1536000,
            "stone": 1280000,
            "iron": 51200
          },
          "seconds": 543690,
          "confirmedTime": true,
          "capacity": 55000000
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    },
    "wall": {
      "name": "城墙",
      "icon": "垣",
      "tag": "城防屏障",
      "desc": "庇护守军并建造城防，效果用于本城防守。",
      "max": 10,
      "repeat": false,
      "rows": [
        {
          "level": 1,
          "cost": {
            "wood": 1500,
            "stone": 10000,
            "iron": 500,
            "food": 3000
          },
          "seconds": 2400,
          "confirmedTime": true
        },
        {
          "level": 2,
          "cost": {
            "wood": 3000,
            "stone": 20000,
            "iron": 1000,
            "food": 6000
          },
          "seconds": 5330,
          "confirmedTime": true
        },
        {
          "level": 3,
          "cost": {
            "wood": 6000,
            "stone": 40000,
            "iron": 2000,
            "food": 12000
          },
          "seconds": 11560,
          "confirmedTime": true
        },
        {
          "level": 4,
          "cost": {
            "wood": 12000,
            "stone": 80000,
            "iron": 4000,
            "food": 24000
          },
          "seconds": 24510,
          "confirmedTime": true
        },
        {
          "level": 5,
          "cost": {
            "wood": 24000,
            "stone": 160000,
            "iron": 8000,
            "food": 48000
          },
          "seconds": 50740,
          "confirmedTime": true
        },
        {
          "level": 6,
          "cost": {
            "wood": 48000,
            "stone": 320000,
            "iron": 16000,
            "food": 96000
          },
          "seconds": 102490,
          "confirmedTime": true
        },
        {
          "level": 7,
          "cost": {
            "wood": 96000,
            "stone": 640000,
            "iron": 32000,
            "food": 192000
          },
          "seconds": 201905,
          "confirmedTime": true
        },
        {
          "level": 8,
          "cost": {
            "wood": 192000,
            "stone": 1280000,
            "iron": 64000,
            "food": 384000
          },
          "seconds": 387660,
          "confirmedTime": true
        },
        {
          "level": 9,
          "cost": {
            "wood": 384000,
            "stone": 2560000,
            "iron": 128000,
            "food": 768000
          },
          "seconds": 724920,
          "confirmedTime": true
        },
        {
          "level": 10,
          "cost": {
            "wood": 768000,
            "stone": 5120000,
            "iron": 256000,
            "food": 1536000
          },
          "seconds": 1319355,
          "confirmedTime": true
        }
      ],
      "source": "https://web.4399.com/rxsg/yxzy/xszn/a1204083.html"
    }
  },
  "units": {
    "worker": {
      "name": "民夫",
      "short": "民",
      "role": "物资运输",
      "cost": {
        "food": 50,
        "wood": 150,
        "iron": 10
      },
      "requires": {
        "buildings": {
          "barracks": 1
        },
        "tech": {}
      },
      "time": 15,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "infantry",
      "hp": 100,
      "atk": 5,
      "def": 10,
      "range": 10,
      "speed": 180,
      "carry": 200,
      "upkeep": 2
    },
    "militia": {
      "name": "义兵",
      "short": "义",
      "role": "低成本征募",
      "cost": {
        "food": 80,
        "wood": 100,
        "iron": 50
      },
      "requires": {
        "buildings": {
          "barracks": 1
        },
        "tech": {}
      },
      "time": 20,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "infantry",
      "hp": 200,
      "atk": 50,
      "def": 50,
      "range": 20,
      "speed": 200,
      "carry": 20,
      "upkeep": 3
    },
    "scout": {
      "name": "斥候",
      "short": "斥",
      "role": "侦察情报",
      "cost": {
        "food": 120,
        "wood": 200,
        "iron": 150
      },
      "requires": {
        "buildings": {
          "barracks": 2
        },
        "tech": {
          "scouting": 1
        }
      },
      "time": 60,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "cavalry",
      "hp": 100,
      "atk": 20,
      "def": 20,
      "range": 20,
      "speed": 3000,
      "carry": 5,
      "upkeep": 5
    },
    "spear": {
      "name": "长枪兵",
      "short": "枪",
      "role": "克制骑兵",
      "cost": {
        "food": 150,
        "wood": 500,
        "iron": 100
      },
      "requires": {
        "buildings": {
          "barracks": 2
        },
        "tech": {
          "combat": 1
        }
      },
      "time": 90,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "infantry",
      "hp": 300,
      "atk": 150,
      "def": 150,
      "range": 50,
      "speed": 300,
      "carry": 40,
      "upkeep": 6
    },
    "shield": {
      "name": "刀盾兵",
      "short": "盾",
      "role": "抵御箭矢",
      "cost": {
        "food": 200,
        "wood": 150,
        "iron": 400
      },
      "requires": {
        "buildings": {
          "barracks": 3
        },
        "tech": {
          "protection": 1
        }
      },
      "time": 120,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "infantry",
      "hp": 350,
      "atk": 100,
      "def": 250,
      "range": 30,
      "speed": 275,
      "carry": 30,
      "upkeep": 7
    },
    "archer": {
      "name": "弓箭兵",
      "short": "弓",
      "role": "远程输出",
      "cost": {
        "food": 300,
        "wood": 350,
        "iron": 300
      },
      "requires": {
        "buildings": {
          "barracks": 4
        },
        "tech": {
          "shooting": 1
        }
      },
      "time": 180,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "infantry",
      "hp": 250,
      "atk": 120,
      "def": 50,
      "range": 1200,
      "speed": 250,
      "carry": 25,
      "upkeep": 9
    },
    "cavalry": {
      "name": "轻骑兵",
      "short": "骑",
      "role": "快速机动",
      "cost": {
        "food": 1000,
        "wood": 600,
        "iron": 500
      },
      "requires": {
        "buildings": {
          "barracks": 5,
          "stable": 1
        },
        "tech": {
          "riding": 1
        }
      },
      "time": 300,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "cavalry",
      "hp": 500,
      "atk": 250,
      "def": 180,
      "range": 100,
      "speed": 1000,
      "carry": 100,
      "upkeep": 18
    },
    "heavy": {
      "name": "铁骑兵",
      "short": "铁",
      "role": "重装冲锋",
      "cost": {
        "food": 2000,
        "wood": 500,
        "iron": 2500
      },
      "requires": {
        "buildings": {
          "barracks": 7,
          "stable": 1
        },
        "tech": {
          "protection": 5,
          "riding": 5
        }
      },
      "time": 600,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "cavalry",
      "hp": 1000,
      "atk": 350,
      "def": 350,
      "range": 80,
      "speed": 750,
      "carry": 80,
      "upkeep": 35
    },
    "wagon": {
      "name": "辎重车",
      "short": "辎",
      "role": "大宗运输",
      "cost": {
        "food": 600,
        "wood": 1500,
        "iron": 350
      },
      "requires": {
        "buildings": {
          "barracks": 6,
          "workshop": 1
        },
        "tech": {
          "manufacture": 3,
          "load": 1
        }
      },
      "time": 300,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "machine",
      "hp": 700,
      "atk": 10,
      "def": 60,
      "range": 10,
      "speed": 150,
      "carry": 5000,
      "upkeep": 10
    },
    "ballista": {
      "name": "床弩",
      "short": "弩",
      "role": "远程器械",
      "cost": {
        "food": 2500,
        "wood": 3000,
        "iron": 1800
      },
      "requires": {
        "buildings": {
          "barracks": 9,
          "workshop": 1
        },
        "tech": {
          "manufacture": 5,
          "shooting": 6
        }
      },
      "time": 900,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "machine",
      "hp": 320,
      "atk": 450,
      "def": 160,
      "range": 1400,
      "speed": 100,
      "carry": 35,
      "upkeep": 50
    },
    "ram": {
      "name": "冲车",
      "short": "冲",
      "role": "破坏城防",
      "cost": {
        "food": 4000,
        "wood": 6000,
        "iron": 1500
      },
      "requires": {
        "buildings": {
          "barracks": 9,
          "workshop": 1
        },
        "tech": {
          "manufacture": 7,
          "protection": 8
        }
      },
      "time": 1500,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "machine",
      "hp": 5000,
      "atk": 250,
      "def": 160,
      "range": 600,
      "speed": 120,
      "carry": 45,
      "upkeep": 100
    },
    "catapult": {
      "name": "投石车",
      "short": "投",
      "role": "攻城投射",
      "cost": {
        "food": 5000,
        "wood": 5000,
        "stone": 8000,
        "iron": 1200
      },
      "requires": {
        "buildings": {
          "barracks": 10,
          "workshop": 1
        },
        "tech": {
          "manufacture": 10,
          "shooting": 10
        }
      },
      "time": 2400,
      "trialTime": true,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html",
      "kind": "machine",
      "hp": 480,
      "atk": 600,
      "def": 200,
      "range": 1500,
      "speed": 80,
      "carry": 75,
      "upkeep": 250
    }
  },
  "technology": {
    "plant": {
      "name": "种植技术",
      "desc": "粮食产量每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "logging": {
      "name": "砍伐技术",
      "desc": "木材产量每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "mining": {
      "name": "挖掘技术",
      "desc": "石料产量每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "smelting": {
      "name": "冶炼技术",
      "desc": "铁锭产量每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "manufacture": {
      "name": "制造技术",
      "desc": "器械生产速度每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "leadership": {
      "name": "统帅能力",
      "desc": "有效统治人口及带兵数量每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "scouting": {
      "name": "侦察技巧",
      "desc": "提高侦察情报的详细程度。",
      "effect": 0,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "training": {
      "name": "练兵技巧",
      "desc": "士兵训练速度每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "combat": {
      "name": "战斗技巧",
      "desc": "军队攻击每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "protection": {
      "name": "防护技巧",
      "desc": "军队防御每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "load": {
      "name": "负重技术",
      "desc": "军队负重每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "march": {
      "name": "行军技巧",
      "desc": "步兵速度每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "riding": {
      "name": "驾驭技巧",
      "desc": "骑兵和器械速度每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "shooting": {
      "name": "抛射技巧",
      "desc": "远程射程每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "storage": {
      "name": "储存技术",
      "desc": "资源田和仓库容量每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "supply": {
      "name": "补给技巧",
      "desc": "军队生命每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "construction": {
      "name": "建筑技术",
      "desc": "建筑和城防建造速度每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "fortification": {
      "name": "城防技术",
      "desc": "城墙和城防耐久每级 +10%。",
      "effect": 0.1,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "repair": {
      "name": "维修技术",
      "desc": "城防修复率每级 +5%。",
      "effect": 0.05,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    },
    "plunder": {
      "name": "掠夺技巧",
      "desc": "削弱敌方仓库保护，每级 3%。",
      "effect": 0.03,
      "max": 10,
      "source": "https://web.4399.com/rxsg/yxzy/gsjj/a1204116.html",
      "trialCost": true
    }
  },
  "defenses": {
    "trap": {
      "name": "陷阱",
      "hp": 0,
      "atk": 0,
      "def": 0,
      "range": 2000,
      "wall": 1,
      "cost": {
        "food": 50,
        "wood": 500,
        "stone": 100,
        "iron": 50
      },
      "oneUse": true
    },
    "abatis": {
      "name": "拒马",
      "hp": 1000,
      "atk": 0,
      "def": 180,
      "range": 800,
      "wall": 2,
      "cost": {
        "food": 100,
        "wood": 1200,
        "iron": 150
      }
    },
    "tower": {
      "name": "箭塔",
      "hp": 2000,
      "atk": 300,
      "def": 360,
      "range": 1300,
      "wall": 3,
      "tech": {
        "shooting": 3
      },
      "cost": {
        "food": 200,
        "wood": 2000,
        "stone": 1000,
        "iron": 500
      }
    },
    "logs": {
      "name": "滚木",
      "hp": 0,
      "atk": 500,
      "def": 0,
      "range": 500,
      "wall": 5,
      "tech": {
        "manufacture": 4
      },
      "cost": {
        "food": 300,
        "wood": 6000
      },
      "oneUse": true
    },
    "rocks": {
      "name": "擂石",
      "hp": 0,
      "atk": 800,
      "def": 0,
      "range": 250,
      "wall": 7,
      "tech": {
        "manufacture": 6
      },
      "cost": {
        "food": 600,
        "stone": 8000
      },
      "oneUse": true
    }
  },
  "shop": [
    {
      "id": "labor",
      "name": "徭役令",
      "category": "内政",
      "desc": "增加 3 个建造队列，持续 3 天；重复使用延长时间。",
      "price": 50,
      "effect": "labor",
      "seconds": 259200,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "population",
      "name": "典民令",
      "category": "内政",
      "desc": "补充相当于人口上限 20% 的居民，至少 100 人；不超过人口上限。",
      "price": 20,
      "effect": "population",
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "peace",
      "name": "安民告示",
      "category": "内政",
      "desc": "民心恢复到 100，民怨清零；同城冷却 3 天。",
      "price": 50,
      "effect": "peace",
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "blueprint",
      "name": "建筑图纸",
      "category": "内政",
      "desc": "用于超过 10 级的资源建筑。普通城池本版最高 10 级。",
      "price": 40,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "heal",
      "name": "青囊书",
      "category": "军事",
      "desc": "战斗损失中额外 30% 可作为伤兵，持续 24 小时。",
      "price": 30,
      "effect": "heal",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "politics",
      "name": "文曲星符",
      "category": "将领",
      "desc": "选定将领内政 +25%，持续 24 小时。",
      "price": 20,
      "effect": "politics",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "valor",
      "name": "武曲星符",
      "category": "将领",
      "desc": "选定将领勇武 +25%，持续 24 小时。",
      "price": 20,
      "effect": "valor",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "wisdom",
      "name": "智多星符",
      "category": "将领",
      "desc": "选定将领智谋 +25%，持续 24 小时。",
      "price": 20,
      "effect": "wisdom",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "tiger",
      "name": "虎符",
      "category": "将领",
      "desc": "选定将领有效带兵、统治人数 +50%，持续 24 小时。",
      "price": 30,
      "effect": "tiger",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "recruit",
      "name": "招贤榜",
      "category": "将领",
      "desc": "立即更换本城客栈候选将领。",
      "price": 10,
      "effect": "recruit",
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "drum",
      "name": "陷阵战鼓",
      "category": "军事",
      "desc": "军队攻击 +10%，持续 24 小时。",
      "price": 20,
      "effect": "drum",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "formation",
      "name": "八卦阵图",
      "category": "军事",
      "desc": "军队防御 +10%，持续 24 小时。",
      "price": 20,
      "effect": "formation",
      "seconds": 86400,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "drum7",
      "name": "高级陷阵战鼓",
      "category": "军事",
      "desc": "军队攻击 +10%，持续 7 天。",
      "price": 100,
      "effect": "drum",
      "seconds": 604800,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "formation7",
      "name": "高级八卦阵图",
      "category": "军事",
      "desc": "军队防御 +10%，持续 7 天。",
      "price": 100,
      "effect": "formation",
      "seconds": 604800,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "flag",
      "name": "军旗",
      "category": "军事",
      "desc": "下一次出征的人数上限提高 25%。",
      "price": 20,
      "effect": "flag",
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "rename",
      "name": "名帖",
      "category": "内政",
      "desc": "更改君主称呼，消耗一张。",
      "price": 10,
      "effect": "rename",
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "banner",
      "name": "旌旗",
      "category": "内政",
      "desc": "更改主城旗号，消耗一面。",
      "price": 10,
      "effect": "banner",
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "truce",
      "name": "免战牌",
      "category": "军事",
      "desc": "免战 12 小时，冷却 6 小时；只影响玩家之间的战争。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "move",
      "name": "迁城令",
      "category": "内政",
      "desc": "迁往其他平地，在外部队存在时不可使用。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "moveAdvanced",
      "name": "高级迁城令",
      "category": "内政",
      "desc": "迁往指定平地；迁城后 24 小时限制出征。",
      "price": 100,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "tradeContract",
      "name": "商队契约",
      "category": "内政",
      "desc": "定时运输，持续 3 天，仍占用市场商队。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "fire",
      "name": "猛火油罐",
      "category": "军事",
      "desc": "将领下一次占领战胜利时破坏一座普通建筑，24 小时内有效。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "treasure",
      "name": "藏宝图",
      "category": "宝物",
      "desc": "标记宝藏位置。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "challenge",
      "name": "请战书",
      "category": "军事",
      "desc": "重置剧情战场参战次数，恢复 5 次机会。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "warOrder",
      "name": "军令状",
      "category": "军事",
      "desc": "战场荣誉获取变为 3 倍，持续 24 小时。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "pardon",
      "name": "赦免文书",
      "category": "军事",
      "desc": "将负数战场荣誉恢复至 0。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "reinforce",
      "name": "援军令",
      "category": "军事",
      "desc": "在剧情战场临时补充军队，战后未损失援军离开。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "crusade",
      "name": "讨伐令",
      "category": "军事",
      "desc": "用于开启 11 级以上剧情战场。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "pigeon",
      "name": "信鸽",
      "category": "军事",
      "desc": "用于剧情战场内侦察其他据点。",
      "price": 5,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "noble",
      "name": "推恩令",
      "category": "内政",
      "desc": "爵位暂升最多 2 级，持续 3 天，有爵位上限。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "nobleAdvanced",
      "name": "高级推恩令",
      "category": "内政",
      "desc": "爵位暂升最多 5 级，持续 10 天，有爵位门槛及上限。",
      "price": 100,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "commission",
      "name": "委托文书",
      "category": "内政",
      "desc": "用于发布匿名委托任务。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "patrol",
      "name": "巡查令",
      "category": "将领",
      "desc": "将领历练名额增加 3 个，持续 3 天。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "soul",
      "name": "聚魂幡",
      "category": "将领",
      "desc": "将武魂碎片转为对应武魂。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "incense",
      "name": "引魂香",
      "category": "将领",
      "desc": "由画像获得武魂碎片，有机会直接获得武魂。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "talent",
      "name": "求贤诏",
      "category": "将领",
      "desc": "结交名将位置增加 3 个，持续 7 天。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "edict",
      "name": "讨逆圣旨",
      "category": "军事",
      "desc": "不经宣战进入玩家战争状态，持续 8 小时。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "refine",
      "name": "炼化鼎",
      "category": "装备",
      "desc": "用于套装炼化。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "oath",
      "name": "誓师文书",
      "category": "军事",
      "desc": "将不足 100 的逐鹿中原积分恢复到 100。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "resetHero",
      "name": "洗髓丹",
      "category": "将领",
      "desc": "重置将领分配属性点；每高 10 级增加消耗。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "tactic",
      "name": "锦囊",
      "category": "军事",
      "desc": "用于施放计谋。",
      "price": 5,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "voice",
      "name": "传音符",
      "category": "社交",
      "desc": "世界发言消耗 1 个，联盟群信消耗 2 个。",
      "price": 1,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "alliance",
      "name": "盟主令",
      "category": "社交",
      "desc": "将联盟成员上限提高到 100。",
      "price": 100,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "rack",
      "name": "武器架",
      "category": "装备",
      "desc": "永久增加 5 格装备容量，最高 500 格。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "rackAdvanced",
      "name": "高级武器架",
      "category": "装备",
      "desc": "永久增加 50 格装备容量，最高 500 格。",
      "price": 80,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "pearl",
      "name": "强化宝珠",
      "category": "装备",
      "desc": "用于强化装备。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "powder",
      "name": "化石粉",
      "category": "装备",
      "desc": "移除镶嵌宝珠并恢复凹槽。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "craft",
      "name": "巧手符",
      "category": "装备",
      "desc": "提高材料合成成功率。",
      "price": 10,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "smithCharm",
      "name": "天工符",
      "category": "装备",
      "desc": "提高装备强化成功率。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "protectPearl",
      "name": "乾坤宝珠",
      "category": "装备",
      "desc": "装备强化失败时保护装备。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "drillGem",
      "name": "金刚钻",
      "category": "装备",
      "desc": "为装备开启镶嵌孔。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "drillGemAdvanced",
      "name": "高级金刚钻",
      "category": "装备",
      "desc": "为装备开启更多镶嵌孔。",
      "price": 50,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "horseCharm",
      "name": "伯乐符",
      "category": "装备",
      "desc": "提高坐骑强化成功率。",
      "price": 20,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "horseNeedle",
      "name": "师皇针",
      "category": "装备",
      "desc": "坐骑强化失败时保护坐骑。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    },
    {
      "id": "life",
      "name": "护命金丹",
      "category": "将领",
      "desc": "重伤治疗时恢复将领全部体力。",
      "price": 30,
      "effect": null,
      "seconds": 0,
      "trialPrice": true,
      "source": "https://web.4399.com/rxsg/yxjp_03_22954.html"
    }
  ],
  "npcNames": {
    "militia": "流民",
    "spear": "匪兵",
    "shield": "强盗",
    "archer": "山贼",
    "cavalry": "马贼"
  },
  "wildTroopSamples": [
    0,
    50,
    100,
    200,
    500,
    1000,
    2000,
    4000,
    8000,
    20000,
    40000
  ],
  "wildTrial": true,
  "battleDrops": {
    "trial": true,
    "itemChanceBase": 0.35,
    "itemChancePerLevel": 0.025,
    "itemChanceMax": 0.6,
    "resourceChanceBase": 0.5,
    "resourceChancePerLevel": 0.02,
    "resourceChanceMax": 0.7,
    "secondItemMinLevel": 5,
    "secondItemChance": 0.15,
    "commonWeight": 10,
    "rarePrice": 100,
    "rareWeightBase": 1,
    "rareWeightPerLevel": 0.4,
    "resourceBase": 200,
    "resourcePerLevelSquared": 150,
    "secondResourceChance": 0.3
  }
};


// SOURCE: speedup-data.js
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


// SOURCE: reference-rules.js
'use strict';
// Numeric rules transcribed from the user-provided local configuration files.
// Package contains later-version and single-player changes; see REFERENCE-NOTES.md.
const ReferenceRules={
  "version": 1,
  "buildingConditions": {
    "farm": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "lumber": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "quarry": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "mine": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "house": {
      "1": [],
      "2": [],
      "3": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "hall",
          "level": 3
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "hall",
          "level": 4
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "hall",
          "level": 5
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "hall",
          "level": 6
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "hall",
          "level": 7
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "hall",
          "level": 8
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "hall",
          "level": 9
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "hall": {
      "1": [],
      "2": [],
      "3": [
        {
          "kind": "building",
          "id": "wall",
          "level": 1
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "wall",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "wall",
          "level": 3
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "wall",
          "level": 4
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "wall",
          "level": 5
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "wall",
          "level": 6
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "wall",
          "level": 7
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "wall",
          "level": 8
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "academy": {
      "1": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "drill": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "barracks": {
      "1": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "drill",
          "level": 1
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "inn": {
      "1": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "house",
          "level": 2
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "tavern": {
      "1": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "inn",
          "level": 1
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "embassy": {
      "1": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "hall",
          "level": 2
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "market": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "smith": {
      "1": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "workshop": {
      "1": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "stable": {
      "1": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "warehouse": {
      "1": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "post": {
      "1": [
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        },
        {
          "kind": "tech",
          "id": "riding",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 2
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "3": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 3
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "4": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 4
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "5": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "6": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 6
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "7": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 7
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "8": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 8
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "9": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 9
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "10": [
        {
          "kind": "tech",
          "id": "riding",
          "level": 10
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "beacon": {
      "1": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    },
    "wall": {
      "1": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        },
        {
          "kind": "item",
          "id": "blueprint",
          "level": 1
        }
      ]
    }
  },
  "researchConditions": {
    "plant": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "farm",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "farm",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "farm",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "farm",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "farm",
          "level": 5
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "farm",
          "level": 6
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "farm",
          "level": 7
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "farm",
          "level": 8
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "farm",
          "level": 9
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "farm",
          "level": 10
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ]
    },
    "logging": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "lumber",
          "level": 10
        }
      ]
    },
    "mining": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 1
        },
        {
          "kind": "tech",
          "id": "logging",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "quarry",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "quarry",
          "level": 10
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ]
    },
    "smelting": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 1
        },
        {
          "kind": "tech",
          "id": "mining",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "mine",
          "level": 2
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "building",
          "id": "mine",
          "level": 10
        }
      ]
    },
    "manufacture": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 1
        },
        {
          "kind": "tech",
          "id": "smelting",
          "level": 2
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        },
        {
          "kind": "building",
          "id": "workshop",
          "level": 10
        }
      ]
    },
    "leadership": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 1
        },
        {
          "kind": "tech",
          "id": "training",
          "level": 7
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        },
        {
          "kind": "building",
          "id": "tavern",
          "level": 10
        }
      ]
    },
    "scouting": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ]
    },
    "training": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        },
        {
          "kind": "building",
          "id": "smith",
          "level": 10
        }
      ]
    },
    "combat": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        },
        {
          "kind": "tech",
          "id": "training",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ]
    },
    "protection": {
      "1": [
        {
          "kind": "tech",
          "id": "training",
          "level": 2
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ]
    },
    "load": {
      "1": [
        {
          "kind": "tech",
          "id": "training",
          "level": 2
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ]
    },
    "march": {
      "1": [
        {
          "kind": "tech",
          "id": "training",
          "level": 3
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ]
    },
    "riding": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "tech",
          "id": "training",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        },
        {
          "kind": "building",
          "id": "stable",
          "level": 10
        }
      ]
    },
    "shooting": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        },
        {
          "kind": "tech",
          "id": "training",
          "level": 4
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ]
    },
    "storage": {
      "1": [
        {
          "kind": "tech",
          "id": "logging",
          "level": 3
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        },
        {
          "kind": "building",
          "id": "warehouse",
          "level": 10
        }
      ]
    },
    "supply": {
      "1": [
        {
          "kind": "tech",
          "id": "load",
          "level": 3
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ]
    },
    "construction": {
      "1": [
        {
          "kind": "tech",
          "id": "logging",
          "level": 5
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 2
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ]
    },
    "fortification": {
      "1": [
        {
          "kind": "tech",
          "id": "construction",
          "level": 3
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ]
    },
    "repair": {
      "1": [
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 4
        },
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ]
    },
    "plunder": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        },
        {
          "kind": "tech",
          "id": "training",
          "level": 8
        },
        {
          "kind": "tech",
          "id": "scouting",
          "level": 5
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ]
    },
    "researching": {
      "1": [
        {
          "kind": "building",
          "id": "academy",
          "level": 1
        }
      ],
      "2": [
        {
          "kind": "building",
          "id": "academy",
          "level": 2
        }
      ],
      "3": [
        {
          "kind": "building",
          "id": "academy",
          "level": 3
        }
      ],
      "4": [
        {
          "kind": "building",
          "id": "academy",
          "level": 4
        }
      ],
      "5": [
        {
          "kind": "building",
          "id": "academy",
          "level": 5
        }
      ],
      "6": [
        {
          "kind": "building",
          "id": "academy",
          "level": 6
        }
      ],
      "7": [
        {
          "kind": "building",
          "id": "academy",
          "level": 7
        }
      ],
      "8": [
        {
          "kind": "building",
          "id": "academy",
          "level": 8
        }
      ],
      "9": [
        {
          "kind": "building",
          "id": "academy",
          "level": 9
        }
      ],
      "10": [
        {
          "kind": "building",
          "id": "academy",
          "level": 10
        }
      ]
    }
  },
  "buildingRows": {
    "farm": {
      "1": {
        "cost": {
          "food": 50,
          "wood": 300,
          "stone": 200,
          "iron": 150
        },
        "seconds": 60,
        "workers": 10,
        "output": 100,
        "capacity": 10000
      },
      "2": {
        "cost": {
          "food": 105,
          "wood": 625,
          "stone": 415,
          "iron": 310
        },
        "seconds": 135,
        "workers": 30,
        "output": 300,
        "capacity": 30000
      },
      "3": {
        "cost": {
          "food": 215,
          "wood": 1275,
          "stone": 850,
          "iron": 640
        },
        "seconds": 305,
        "workers": 60,
        "output": 600,
        "capacity": 60000
      },
      "4": {
        "cost": {
          "food": 435,
          "wood": 2585,
          "stone": 1730,
          "iron": 1300
        },
        "seconds": 655,
        "workers": 100,
        "output": 1000,
        "capacity": 100000
      },
      "5": {
        "cost": {
          "food": 875,
          "wood": 5170,
          "stone": 3465,
          "iron": 2610
        },
        "seconds": 1370,
        "workers": 150,
        "output": 1500,
        "capacity": 150000
      },
      "6": {
        "cost": {
          "food": 1740,
          "wood": 10205,
          "stone": 6855,
          "iron": 5180
        },
        "seconds": 2775,
        "workers": 210,
        "output": 2100,
        "capacity": 210000
      },
      "7": {
        "cost": {
          "food": 3425,
          "wood": 19905,
          "stone": 13410,
          "iron": 10165
        },
        "seconds": 5440,
        "workers": 280,
        "output": 2800,
        "capacity": 280000
      },
      "8": {
        "cost": {
          "food": 6665,
          "wood": 38315,
          "stone": 25910,
          "iron": 19710
        },
        "seconds": 10310,
        "workers": 360,
        "output": 3600,
        "capacity": 360000
      },
      "9": {
        "cost": {
          "food": 12820,
          "wood": 72800,
          "stone": 49435,
          "iron": 37760
        },
        "seconds": 18870,
        "workers": 450,
        "output": 4500,
        "capacity": 450000
      },
      "10": {
        "cost": {
          "food": 24380,
          "wood": 136500,
          "stone": 93130,
          "iron": 71480
        },
        "seconds": 33300,
        "workers": 550,
        "output": 5500,
        "capacity": 550000
      }
    },
    "lumber": {
      "1": {
        "cost": {
          "food": 100,
          "wood": 100,
          "stone": 250,
          "iron": 300
        },
        "seconds": 90,
        "workers": 10,
        "output": 100,
        "capacity": 10000
      },
      "2": {
        "cost": {
          "food": 210,
          "wood": 210,
          "stone": 520,
          "iron": 625
        },
        "seconds": 205,
        "workers": 30,
        "output": 300,
        "capacity": 30000
      },
      "3": {
        "cost": {
          "food": 425,
          "wood": 425,
          "stone": 1065,
          "iron": 1280
        },
        "seconds": 455,
        "workers": 60,
        "output": 600,
        "capacity": 60000
      },
      "4": {
        "cost": {
          "food": 870,
          "wood": 860,
          "stone": 2160,
          "iron": 2600
        },
        "seconds": 985,
        "workers": 100,
        "output": 1000,
        "capacity": 100000
      },
      "5": {
        "cost": {
          "food": 1750,
          "wood": 1725,
          "stone": 4330,
          "iron": 5220
        },
        "seconds": 2055,
        "workers": 150,
        "output": 1500,
        "capacity": 150000
      },
      "6": {
        "cost": {
          "food": 3480,
          "wood": 3400,
          "stone": 8570,
          "iron": 10360
        },
        "seconds": 4165,
        "workers": 210,
        "output": 2100,
        "capacity": 210000
      },
      "7": {
        "cost": {
          "food": 6845,
          "wood": 6635,
          "stone": 16765,
          "iron": 20330
        },
        "seconds": 8160,
        "workers": 280,
        "output": 2800,
        "capacity": 280000
      },
      "8": {
        "cost": {
          "food": 13325,
          "wood": 12770,
          "stone": 32385,
          "iron": 39415
        },
        "seconds": 15465,
        "workers": 360,
        "output": 3600,
        "capacity": 360000
      },
      "9": {
        "cost": {
          "food": 25635,
          "wood": 24265,
          "stone": 61790,
          "iron": 75520
        },
        "seconds": 28300,
        "workers": 450,
        "output": 4500,
        "capacity": 450000
      },
      "10": {
        "cost": {
          "food": 48760,
          "wood": 45500,
          "stone": 116415,
          "iron": 142960
        },
        "seconds": 49955,
        "workers": 550,
        "output": 5500,
        "capacity": 550000
      }
    },
    "quarry": {
      "1": {
        "cost": {
          "food": 180,
          "wood": 500,
          "stone": 150,
          "iron": 400
        },
        "seconds": 120,
        "workers": 20,
        "output": 100,
        "capacity": 10000
      },
      "2": {
        "cost": {
          "food": 375,
          "wood": 1040,
          "stone": 310,
          "iron": 830
        },
        "seconds": 275,
        "workers": 60,
        "output": 300,
        "capacity": 30000
      },
      "3": {
        "cost": {
          "food": 770,
          "wood": 2125,
          "stone": 640,
          "iron": 1705
        },
        "seconds": 610,
        "workers": 120,
        "output": 600,
        "capacity": 60000
      },
      "4": {
        "cost": {
          "food": 1565,
          "wood": 4305,
          "stone": 1295,
          "iron": 3465
        },
        "seconds": 1310,
        "workers": 200,
        "output": 1000,
        "capacity": 100000
      },
      "5": {
        "cost": {
          "food": 3145,
          "wood": 8615,
          "stone": 2595,
          "iron": 6960
        },
        "seconds": 2740,
        "workers": 300,
        "output": 1500,
        "capacity": 150000
      },
      "6": {
        "cost": {
          "food": 6265,
          "wood": 17010,
          "stone": 5140,
          "iron": 13815
        },
        "seconds": 5550,
        "workers": 420,
        "output": 2100,
        "capacity": 210000
      },
      "7": {
        "cost": {
          "food": 12325,
          "wood": 33175,
          "stone": 10060,
          "iron": 27105
        },
        "seconds": 10880,
        "workers": 560,
        "output": 2800,
        "capacity": 280000
      },
      "8": {
        "cost": {
          "food": 23985,
          "wood": 63860,
          "stone": 19430,
          "iron": 52555
        },
        "seconds": 20620,
        "workers": 720,
        "output": 3600,
        "capacity": 360000
      },
      "9": {
        "cost": {
          "food": 46145,
          "wood": 121335,
          "stone": 37075,
          "iron": 100695
        },
        "seconds": 37735,
        "workers": 900,
        "output": 4500,
        "capacity": 450000
      },
      "10": {
        "cost": {
          "food": 87770,
          "wood": 227500,
          "stone": 69850,
          "iron": 190615
        },
        "seconds": 66605,
        "workers": 1100,
        "output": 5500,
        "capacity": 550000
      }
    },
    "mine": {
      "1": {
        "cost": {
          "food": 210,
          "wood": 600,
          "stone": 500,
          "iron": 200
        },
        "seconds": 180,
        "workers": 25,
        "output": 100,
        "capacity": 10000
      },
      "2": {
        "cost": {
          "food": 435,
          "wood": 1245,
          "stone": 1040,
          "iron": 415
        },
        "seconds": 410,
        "workers": 75,
        "output": 300,
        "capacity": 30000
      },
      "3": {
        "cost": {
          "food": 895,
          "wood": 2550,
          "stone": 2130,
          "iron": 855
        },
        "seconds": 915,
        "workers": 150,
        "output": 600,
        "capacity": 60000
      },
      "4": {
        "cost": {
          "food": 1825,
          "wood": 5170,
          "stone": 4320,
          "iron": 1735
        },
        "seconds": 1970,
        "workers": 250,
        "output": 1000,
        "capacity": 100000
      },
      "5": {
        "cost": {
          "food": 3670,
          "wood": 10335,
          "stone": 8655,
          "iron": 3480
        },
        "seconds": 4110,
        "workers": 375,
        "output": 1500,
        "capacity": 150000
      },
      "6": {
        "cost": {
          "food": 7305,
          "wood": 20415,
          "stone": 17140,
          "iron": 6905
        },
        "seconds": 8330,
        "workers": 525,
        "output": 2100,
        "capacity": 210000
      },
      "7": {
        "cost": {
          "food": 14380,
          "wood": 39810,
          "stone": 33525,
          "iron": 13550
        },
        "seconds": 16320,
        "workers": 700,
        "output": 2800,
        "capacity": 280000
      },
      "8": {
        "cost": {
          "food": 27985,
          "wood": 76630,
          "stone": 64770,
          "iron": 26275
        },
        "seconds": 30930,
        "workers": 900,
        "output": 3600,
        "capacity": 360000
      },
      "9": {
        "cost": {
          "food": 53840,
          "wood": 145600,
          "stone": 123585,
          "iron": 50345
        },
        "seconds": 56605,
        "workers": 1125,
        "output": 4500,
        "capacity": 450000
      },
      "10": {
        "cost": {
          "food": 102400,
          "wood": 273000,
          "stone": 232830,
          "iron": 95305
        },
        "seconds": 99905,
        "workers": 1375,
        "output": 5500,
        "capacity": 550000
      }
    },
    "house": {
      "1": {
        "cost": {
          "food": 100,
          "wood": 500,
          "stone": 125,
          "iron": 100
        },
        "seconds": 150,
        "workers": 0,
        "population": 100
      },
      "2": {
        "cost": {
          "food": 210,
          "wood": 1040,
          "stone": 260,
          "iron": 210
        },
        "seconds": 335,
        "workers": 0,
        "population": 300
      },
      "3": {
        "cost": {
          "food": 425,
          "wood": 2125,
          "stone": 530,
          "iron": 425
        },
        "seconds": 725,
        "workers": 0,
        "population": 600
      },
      "4": {
        "cost": {
          "food": 870,
          "wood": 4305,
          "stone": 1080,
          "iron": 865
        },
        "seconds": 1530,
        "workers": 0,
        "population": 1000
      },
      "5": {
        "cost": {
          "food": 1750,
          "wood": 8615,
          "stone": 2165,
          "iron": 1740
        },
        "seconds": 3170,
        "workers": 0,
        "population": 1500
      },
      "6": {
        "cost": {
          "food": 3480,
          "wood": 17010,
          "stone": 4285,
          "iron": 3455
        },
        "seconds": 6405,
        "workers": 0,
        "population": 2100
      },
      "7": {
        "cost": {
          "food": 6845,
          "wood": 33175,
          "stone": 8380,
          "iron": 6775
        },
        "seconds": 12620,
        "workers": 0,
        "population": 2800
      },
      "8": {
        "cost": {
          "food": 13325,
          "wood": 63860,
          "stone": 16195,
          "iron": 13140
        },
        "seconds": 24230,
        "workers": 0,
        "population": 3600
      },
      "9": {
        "cost": {
          "food": 25635,
          "wood": 121335,
          "stone": 30895,
          "iron": 25175
        },
        "seconds": 45310,
        "workers": 0,
        "population": 4500
      },
      "10": {
        "cost": {
          "food": 48760,
          "wood": 227500,
          "stone": 58210,
          "iron": 47655
        },
        "seconds": 82460,
        "workers": 0,
        "population": 5500
      }
    },
    "hall": {
      "1": {
        "cost": {
          "food": 1250,
          "wood": 3000,
          "stone": 2500,
          "iron": 1000
        },
        "seconds": 1800,
        "workers": 10
      },
      "2": {
        "cost": {
          "food": 2600,
          "wood": 6225,
          "stone": 5190,
          "iron": 2075
        },
        "seconds": 3995,
        "workers": 30
      },
      "3": {
        "cost": {
          "food": 5340,
          "wood": 12760,
          "stone": 10650,
          "iron": 4265
        },
        "seconds": 8670,
        "workers": 60
      },
      "4": {
        "cost": {
          "food": 10860,
          "wood": 25840,
          "stone": 21600,
          "iron": 8665
        },
        "seconds": 18385,
        "workers": 100
      },
      "5": {
        "cost": {
          "food": 21855,
          "wood": 51685,
          "stone": 43280,
          "iron": 17400
        },
        "seconds": 38055,
        "workers": 150
      },
      "6": {
        "cost": {
          "food": 43490,
          "wood": 102075,
          "stone": 85700,
          "iron": 34535
        },
        "seconds": 76870,
        "workers": 210
      },
      "7": {
        "cost": {
          "food": 85595,
          "wood": 199045,
          "stone": 167625,
          "iron": 67760
        },
        "seconds": 151430,
        "workers": 280
      },
      "8": {
        "cost": {
          "food": 166565,
          "wood": 383160,
          "stone": 323855,
          "iron": 131385
        },
        "seconds": 290745,
        "workers": 360
      },
      "9": {
        "cost": {
          "food": 320465,
          "wood": 728005,
          "stone": 617915,
          "iron": 251735
        },
        "seconds": 543690,
        "workers": 450
      },
      "10": {
        "cost": {
          "food": 609530,
          "wood": 1365010,
          "stone": 1164155,
          "iron": 476535
        },
        "seconds": 989515,
        "workers": 550
      }
    },
    "academy": {
      "1": {
        "cost": {
          "food": 120,
          "wood": 2500,
          "stone": 1500,
          "iron": 200
        },
        "seconds": 960,
        "workers": 9
      },
      "2": {
        "cost": {
          "food": 250,
          "wood": 5190,
          "stone": 3115,
          "iron": 415
        },
        "seconds": 2130,
        "workers": 27
      },
      "3": {
        "cost": {
          "food": 515,
          "wood": 10635,
          "stone": 6390,
          "iron": 855
        },
        "seconds": 4625,
        "workers": 54
      },
      "4": {
        "cost": {
          "food": 1045,
          "wood": 21535,
          "stone": 12960,
          "iron": 1735
        },
        "seconds": 9805,
        "workers": 90
      },
      "5": {
        "cost": {
          "food": 2100,
          "wood": 43070,
          "stone": 25970,
          "iron": 3480
        },
        "seconds": 20295,
        "workers": 135
      },
      "6": {
        "cost": {
          "food": 4175,
          "wood": 85060,
          "stone": 51420,
          "iron": 6905
        },
        "seconds": 40995,
        "workers": 189
      },
      "7": {
        "cost": {
          "food": 8215,
          "wood": 165870,
          "stone": 100575,
          "iron": 13550
        },
        "seconds": 80760,
        "workers": 252
      },
      "8": {
        "cost": {
          "food": 15990,
          "wood": 319300,
          "stone": 194315,
          "iron": 26275
        },
        "seconds": 155065,
        "workers": 324
      },
      "9": {
        "cost": {
          "food": 30765,
          "wood": 606670,
          "stone": 370750,
          "iron": 50345
        },
        "seconds": 289970,
        "workers": 405
      },
      "10": {
        "cost": {
          "food": 58515,
          "wood": 1137510,
          "stone": 698495,
          "iron": 95305
        },
        "seconds": 527740,
        "workers": 495
      }
    },
    "drill": {
      "1": {
        "cost": {
          "food": 100,
          "wood": 600,
          "stone": 2000,
          "iron": 150
        },
        "seconds": 300,
        "workers": 2
      },
      "2": {
        "cost": {
          "food": 210,
          "wood": 1245,
          "stone": 4150,
          "iron": 310
        },
        "seconds": 665,
        "workers": 6
      },
      "3": {
        "cost": {
          "food": 425,
          "wood": 2550,
          "stone": 8520,
          "iron": 640
        },
        "seconds": 1445,
        "workers": 12
      },
      "4": {
        "cost": {
          "food": 870,
          "wood": 5170,
          "stone": 17280,
          "iron": 1300
        },
        "seconds": 3065,
        "workers": 20
      },
      "5": {
        "cost": {
          "food": 1750,
          "wood": 10335,
          "stone": 34625,
          "iron": 2610
        },
        "seconds": 6340,
        "workers": 30
      },
      "6": {
        "cost": {
          "food": 3480,
          "wood": 20415,
          "stone": 68560,
          "iron": 5180
        },
        "seconds": 12810,
        "workers": 42
      },
      "7": {
        "cost": {
          "food": 6845,
          "wood": 39810,
          "stone": 134100,
          "iron": 10165
        },
        "seconds": 25240,
        "workers": 56
      },
      "8": {
        "cost": {
          "food": 13325,
          "wood": 76630,
          "stone": 259085,
          "iron": 19710
        },
        "seconds": 48455,
        "workers": 72
      },
      "9": {
        "cost": {
          "food": 25635,
          "wood": 145600,
          "stone": 494335,
          "iron": 37760
        },
        "seconds": 90615,
        "workers": 90
      },
      "10": {
        "cost": {
          "food": 48760,
          "wood": 273000,
          "stone": 931325,
          "iron": 71480
        },
        "seconds": 164920,
        "workers": 110
      }
    },
    "barracks": {
      "1": {
        "cost": {
          "food": 800,
          "wood": 1200,
          "stone": 1500,
          "iron": 1000
        },
        "seconds": 600,
        "workers": 4
      },
      "2": {
        "cost": {
          "food": 1660,
          "wood": 2490,
          "stone": 3115,
          "iron": 2075
        },
        "seconds": 1330,
        "workers": 12
      },
      "3": {
        "cost": {
          "food": 3420,
          "wood": 5105,
          "stone": 6390,
          "iron": 4265
        },
        "seconds": 2890,
        "workers": 24
      },
      "4": {
        "cost": {
          "food": 6950,
          "wood": 10335,
          "stone": 12960,
          "iron": 8665
        },
        "seconds": 6130,
        "workers": 40
      },
      "5": {
        "cost": {
          "food": 13985,
          "wood": 20675,
          "stone": 25970,
          "iron": 17400
        },
        "seconds": 12685,
        "workers": 60
      },
      "6": {
        "cost": {
          "food": 27835,
          "wood": 40830,
          "stone": 51420,
          "iron": 34535
        },
        "seconds": 25625,
        "workers": 84
      },
      "7": {
        "cost": {
          "food": 54780,
          "wood": 79620,
          "stone": 100575,
          "iron": 67760
        },
        "seconds": 50475,
        "workers": 112
      },
      "8": {
        "cost": {
          "food": 106600,
          "wood": 153265,
          "stone": 194315,
          "iron": 131385
        },
        "seconds": 96915,
        "workers": 144
      },
      "9": {
        "cost": {
          "food": 205100,
          "wood": 291200,
          "stone": 370750,
          "iron": 251735
        },
        "seconds": 181230,
        "workers": 180
      },
      "10": {
        "cost": {
          "food": 390100,
          "wood": 546005,
          "stone": 698495,
          "iron": 476535
        },
        "seconds": 329840,
        "workers": 220
      }
    },
    "inn": {
      "1": {
        "cost": {
          "food": 300,
          "wood": 2000,
          "stone": 1000,
          "iron": 400
        },
        "seconds": 480,
        "workers": 3
      },
      "2": {
        "cost": {
          "food": 625,
          "wood": 4150,
          "stone": 2075,
          "iron": 830
        },
        "seconds": 1065,
        "workers": 9
      },
      "3": {
        "cost": {
          "food": 1280,
          "wood": 8510,
          "stone": 4260,
          "iron": 1705
        },
        "seconds": 2310,
        "workers": 18
      },
      "4": {
        "cost": {
          "food": 2605,
          "wood": 17230,
          "stone": 8640,
          "iron": 3465
        },
        "seconds": 4900,
        "workers": 30
      },
      "5": {
        "cost": {
          "food": 5245,
          "wood": 34455,
          "stone": 17315,
          "iron": 6960
        },
        "seconds": 10150,
        "workers": 45
      },
      "6": {
        "cost": {
          "food": 10440,
          "wood": 68050,
          "stone": 34280,
          "iron": 13815
        },
        "seconds": 20500,
        "workers": 63
      },
      "7": {
        "cost": {
          "food": 20540,
          "wood": 132695,
          "stone": 67050,
          "iron": 27105
        },
        "seconds": 40380,
        "workers": 84
      },
      "8": {
        "cost": {
          "food": 39975,
          "wood": 255440,
          "stone": 129540,
          "iron": 52555
        },
        "seconds": 77530,
        "workers": 108
      },
      "9": {
        "cost": {
          "food": 76910,
          "wood": 485335,
          "stone": 247165,
          "iron": 100695
        },
        "seconds": 144985,
        "workers": 135
      },
      "10": {
        "cost": {
          "food": 146285,
          "wood": 910005,
          "stone": 465660,
          "iron": 190615
        },
        "seconds": 263870,
        "workers": 165
      }
    },
    "tavern": {
      "1": {
        "cost": {
          "food": 400,
          "wood": 2500,
          "stone": 1200,
          "iron": 700
        },
        "seconds": 720,
        "workers": 5
      },
      "2": {
        "cost": {
          "food": 830,
          "wood": 5190,
          "stone": 2490,
          "iron": 1455
        },
        "seconds": 1600,
        "workers": 15
      },
      "3": {
        "cost": {
          "food": 1710,
          "wood": 10635,
          "stone": 5110,
          "iron": 2985
        },
        "seconds": 3470,
        "workers": 30
      },
      "4": {
        "cost": {
          "food": 3475,
          "wood": 21535,
          "stone": 10365,
          "iron": 6065
        },
        "seconds": 7355,
        "workers": 50
      },
      "5": {
        "cost": {
          "food": 6995,
          "wood": 43070,
          "stone": 20775,
          "iron": 12180
        },
        "seconds": 15220,
        "workers": 75
      },
      "6": {
        "cost": {
          "food": 13915,
          "wood": 85060,
          "stone": 41135,
          "iron": 24175
        },
        "seconds": 30745,
        "workers": 105
      },
      "7": {
        "cost": {
          "food": 27390,
          "wood": 165870,
          "stone": 80460,
          "iron": 47430
        },
        "seconds": 60570,
        "workers": 140
      },
      "8": {
        "cost": {
          "food": 53300,
          "wood": 319300,
          "stone": 155450,
          "iron": 91970
        },
        "seconds": 116295,
        "workers": 180
      },
      "9": {
        "cost": {
          "food": 102550,
          "wood": 606670,
          "stone": 296600,
          "iron": 176215
        },
        "seconds": 217475,
        "workers": 225
      },
      "10": {
        "cost": {
          "food": 195050,
          "wood": 1137510,
          "stone": 558795,
          "iron": 333575
        },
        "seconds": 395805,
        "workers": 275
      }
    },
    "embassy": {
      "1": {
        "cost": {
          "food": 250,
          "wood": 2000,
          "stone": 500,
          "iron": 300
        },
        "seconds": 1440,
        "workers": 7
      },
      "2": {
        "cost": {
          "food": 520,
          "wood": 4150,
          "stone": 1040,
          "iron": 625
        },
        "seconds": 3195,
        "workers": 21
      },
      "3": {
        "cost": {
          "food": 1070,
          "wood": 8510,
          "stone": 2130,
          "iron": 1280
        },
        "seconds": 6935,
        "workers": 42
      },
      "4": {
        "cost": {
          "food": 2170,
          "wood": 17230,
          "stone": 4320,
          "iron": 2600
        },
        "seconds": 14705,
        "workers": 70
      },
      "5": {
        "cost": {
          "food": 4370,
          "wood": 34455,
          "stone": 8655,
          "iron": 5220
        },
        "seconds": 30445,
        "workers": 105
      },
      "6": {
        "cost": {
          "food": 8700,
          "wood": 68050,
          "stone": 17140,
          "iron": 10360
        },
        "seconds": 61495,
        "workers": 147
      },
      "7": {
        "cost": {
          "food": 17120,
          "wood": 132695,
          "stone": 33525,
          "iron": 20330
        },
        "seconds": 121145,
        "workers": 196
      },
      "8": {
        "cost": {
          "food": 33315,
          "wood": 255440,
          "stone": 64770,
          "iron": 39415
        },
        "seconds": 232595,
        "workers": 252
      },
      "9": {
        "cost": {
          "food": 64095,
          "wood": 485335,
          "stone": 123585,
          "iron": 75520
        },
        "seconds": 434955,
        "workers": 315
      },
      "10": {
        "cost": {
          "food": 121905,
          "wood": 910005,
          "stone": 232830,
          "iron": 142960
        },
        "seconds": 791615,
        "workers": 385
      }
    },
    "market": {
      "1": {
        "cost": {
          "food": 1000,
          "wood": 1000,
          "stone": 1000,
          "iron": 1000
        },
        "seconds": 1500,
        "workers": 6
      },
      "2": {
        "cost": {
          "food": 2080,
          "wood": 2075,
          "stone": 2075,
          "iron": 2075
        },
        "seconds": 3330,
        "workers": 18
      },
      "3": {
        "cost": {
          "food": 4270,
          "wood": 4255,
          "stone": 4260,
          "iron": 4265
        },
        "seconds": 7225,
        "workers": 36
      },
      "4": {
        "cost": {
          "food": 8690,
          "wood": 8615,
          "stone": 8640,
          "iron": 8665
        },
        "seconds": 15320,
        "workers": 60
      },
      "5": {
        "cost": {
          "food": 17485,
          "wood": 17230,
          "stone": 17315,
          "iron": 17400
        },
        "seconds": 31710,
        "workers": 90
      },
      "6": {
        "cost": {
          "food": 34795,
          "wood": 34025,
          "stone": 34280,
          "iron": 34535
        },
        "seconds": 64055,
        "workers": 126
      },
      "7": {
        "cost": {
          "food": 68475,
          "wood": 66350,
          "stone": 67050,
          "iron": 67760
        },
        "seconds": 126190,
        "workers": 168
      },
      "8": {
        "cost": {
          "food": 133250,
          "wood": 127720,
          "stone": 129540,
          "iron": 131385
        },
        "seconds": 242285,
        "workers": 216
      },
      "9": {
        "cost": {
          "food": 256375,
          "wood": 242670,
          "stone": 247165,
          "iron": 251735
        },
        "seconds": 453075,
        "workers": 270
      },
      "10": {
        "cost": {
          "food": 487625,
          "wood": 455005,
          "stone": 465660,
          "iron": 476535
        },
        "seconds": 824595,
        "workers": 330
      }
    },
    "smith": {
      "1": {
        "cost": {
          "food": 350,
          "wood": 1000,
          "stone": 600,
          "iron": 1200
        },
        "seconds": 360,
        "workers": 2
      },
      "2": {
        "cost": {
          "food": 725,
          "wood": 2075,
          "stone": 1245,
          "iron": 2490
        },
        "seconds": 800,
        "workers": 6
      },
      "3": {
        "cost": {
          "food": 1495,
          "wood": 4255,
          "stone": 2555,
          "iron": 5120
        },
        "seconds": 1735,
        "workers": 12
      },
      "4": {
        "cost": {
          "food": 3040,
          "wood": 8615,
          "stone": 5185,
          "iron": 10395
        },
        "seconds": 3675,
        "workers": 20
      },
      "5": {
        "cost": {
          "food": 6120,
          "wood": 17230,
          "stone": 10390,
          "iron": 20880
        },
        "seconds": 7610,
        "workers": 30
      },
      "6": {
        "cost": {
          "food": 12180,
          "wood": 34025,
          "stone": 20570,
          "iron": 41445
        },
        "seconds": 15375,
        "workers": 42
      },
      "7": {
        "cost": {
          "food": 23965,
          "wood": 66350,
          "stone": 40230,
          "iron": 81310
        },
        "seconds": 30285,
        "workers": 56
      },
      "8": {
        "cost": {
          "food": 46640,
          "wood": 127720,
          "stone": 77725,
          "iron": 157665
        },
        "seconds": 58150,
        "workers": 72
      },
      "9": {
        "cost": {
          "food": 89730,
          "wood": 242670,
          "stone": 148300,
          "iron": 302080
        },
        "seconds": 108740,
        "workers": 90
      },
      "10": {
        "cost": {
          "food": 170670,
          "wood": 455005,
          "stone": 279395,
          "iron": 571840
        },
        "seconds": 197905,
        "workers": 110
      }
    },
    "workshop": {
      "1": {
        "cost": {
          "food": 450,
          "wood": 1500,
          "stone": 500,
          "iron": 1500
        },
        "seconds": 1080,
        "workers": 4
      },
      "2": {
        "cost": {
          "food": 935,
          "wood": 3115,
          "stone": 1040,
          "iron": 3115
        },
        "seconds": 2400,
        "workers": 12
      },
      "3": {
        "cost": {
          "food": 1925,
          "wood": 6380,
          "stone": 2130,
          "iron": 6400
        },
        "seconds": 5205,
        "workers": 24
      },
      "4": {
        "cost": {
          "food": 3910,
          "wood": 12920,
          "stone": 4320,
          "iron": 12995
        },
        "seconds": 11030,
        "workers": 40
      },
      "5": {
        "cost": {
          "food": 7870,
          "wood": 25840,
          "stone": 8655,
          "iron": 26100
        },
        "seconds": 22830,
        "workers": 60
      },
      "6": {
        "cost": {
          "food": 15655,
          "wood": 51035,
          "stone": 17140,
          "iron": 51805
        },
        "seconds": 46120,
        "workers": 84
      },
      "7": {
        "cost": {
          "food": 30815,
          "wood": 99520,
          "stone": 33525,
          "iron": 101640
        },
        "seconds": 90855,
        "workers": 112
      },
      "8": {
        "cost": {
          "food": 59965,
          "wood": 191580,
          "stone": 64770,
          "iron": 197080
        },
        "seconds": 174445,
        "workers": 144
      },
      "9": {
        "cost": {
          "food": 115370,
          "wood": 364000,
          "stone": 123585,
          "iron": 377600
        },
        "seconds": 326215,
        "workers": 180
      },
      "10": {
        "cost": {
          "food": 219430,
          "wood": 682505,
          "stone": 232830,
          "iron": 714800
        },
        "seconds": 593710,
        "workers": 220
      }
    },
    "stable": {
      "1": {
        "cost": {
          "food": 1200,
          "wood": 2000,
          "stone": 800,
          "iron": 1000
        },
        "seconds": 540,
        "workers": 3
      },
      "2": {
        "cost": {
          "food": 2495,
          "wood": 4150,
          "stone": 1660,
          "iron": 2075
        },
        "seconds": 1200,
        "workers": 9
      },
      "3": {
        "cost": {
          "food": 5125,
          "wood": 8510,
          "stone": 3410,
          "iron": 4265
        },
        "seconds": 2600,
        "workers": 18
      },
      "4": {
        "cost": {
          "food": 10430,
          "wood": 17230,
          "stone": 6910,
          "iron": 8665
        },
        "seconds": 5515,
        "workers": 30
      },
      "5": {
        "cost": {
          "food": 20980,
          "wood": 34455,
          "stone": 13850,
          "iron": 17400
        },
        "seconds": 11415,
        "workers": 45
      },
      "6": {
        "cost": {
          "food": 41750,
          "wood": 68050,
          "stone": 27425,
          "iron": 34535
        },
        "seconds": 23060,
        "workers": 63
      },
      "7": {
        "cost": {
          "food": 82170,
          "wood": 132695,
          "stone": 53640,
          "iron": 67760
        },
        "seconds": 45430,
        "workers": 84
      },
      "8": {
        "cost": {
          "food": 159900,
          "wood": 255440,
          "stone": 103635,
          "iron": 131385
        },
        "seconds": 87225,
        "workers": 108
      },
      "9": {
        "cost": {
          "food": 307650,
          "wood": 485335,
          "stone": 197735,
          "iron": 251735
        },
        "seconds": 163105,
        "workers": 135
      },
      "10": {
        "cost": {
          "food": 585150,
          "wood": 910005,
          "stone": 372530,
          "iron": 476535
        },
        "seconds": 296855,
        "workers": 165
      }
    },
    "warehouse": {
      "1": {
        "cost": {
          "food": 100,
          "wood": 1500,
          "stone": 1000,
          "iron": 500
        },
        "seconds": 1200,
        "workers": 1
      },
      "2": {
        "cost": {
          "food": 210,
          "wood": 3115,
          "stone": 2075,
          "iron": 1040
        },
        "seconds": 2665,
        "workers": 3
      },
      "3": {
        "cost": {
          "food": 425,
          "wood": 6380,
          "stone": 4260,
          "iron": 2135
        },
        "seconds": 5780,
        "workers": 6
      },
      "4": {
        "cost": {
          "food": 870,
          "wood": 12920,
          "stone": 8640,
          "iron": 4330
        },
        "seconds": 12255,
        "workers": 10
      },
      "5": {
        "cost": {
          "food": 1750,
          "wood": 25840,
          "stone": 17315,
          "iron": 8700
        },
        "seconds": 25370,
        "workers": 15
      },
      "6": {
        "cost": {
          "food": 3480,
          "wood": 51035,
          "stone": 34280,
          "iron": 17270
        },
        "seconds": 51245,
        "workers": 21
      },
      "7": {
        "cost": {
          "food": 6845,
          "wood": 99520,
          "stone": 67050,
          "iron": 33880
        },
        "seconds": 100955,
        "workers": 28
      },
      "8": {
        "cost": {
          "food": 13325,
          "wood": 191580,
          "stone": 129540,
          "iron": 65695
        },
        "seconds": 193830,
        "workers": 36
      },
      "9": {
        "cost": {
          "food": 25635,
          "wood": 364000,
          "stone": 247165,
          "iron": 125865
        },
        "seconds": 362460,
        "workers": 45
      },
      "10": {
        "cost": {
          "food": 48760,
          "wood": 682505,
          "stone": 465660,
          "iron": 238265
        },
        "seconds": 659680,
        "workers": 55
      }
    },
    "post": {
      "1": {
        "cost": {
          "food": 1500,
          "wood": 5000,
          "stone": 4500,
          "iron": 500
        },
        "seconds": 3600,
        "workers": 5
      },
      "2": {
        "cost": {
          "food": 3115,
          "wood": 10375,
          "stone": 9340,
          "iron": 1040
        },
        "seconds": 7990,
        "workers": 15
      },
      "3": {
        "cost": {
          "food": 6410,
          "wood": 21270,
          "stone": 19170,
          "iron": 2135
        },
        "seconds": 17345,
        "workers": 30
      },
      "4": {
        "cost": {
          "food": 13035,
          "wood": 43070,
          "stone": 38875,
          "iron": 4330
        },
        "seconds": 36765,
        "workers": 50
      },
      "5": {
        "cost": {
          "food": 26225,
          "wood": 86140,
          "stone": 77910,
          "iron": 8700
        },
        "seconds": 76105,
        "workers": 75
      },
      "6": {
        "cost": {
          "food": 52190,
          "wood": 170125,
          "stone": 154260,
          "iron": 17270
        },
        "seconds": 153735,
        "workers": 105
      },
      "7": {
        "cost": {
          "food": 102710,
          "wood": 331740,
          "stone": 301730,
          "iron": 33880
        },
        "seconds": 302860,
        "workers": 140
      },
      "8": {
        "cost": {
          "food": 199875,
          "wood": 638600,
          "stone": 582940,
          "iron": 65695
        },
        "seconds": 581485,
        "workers": 180
      },
      "9": {
        "cost": {
          "food": 384560,
          "wood": 1213340,
          "stone": 1112250,
          "iron": 125865
        },
        "seconds": 1087380,
        "workers": 225
      },
      "10": {
        "cost": {
          "food": 731435,
          "wood": 2275015,
          "stone": 2095480,
          "iron": 238265
        },
        "seconds": 1979035,
        "workers": 275
      }
    },
    "beacon": {
      "1": {
        "cost": {
          "food": 150,
          "wood": 1000,
          "stone": 3000,
          "iron": 300
        },
        "seconds": 900,
        "workers": 1
      },
      "2": {
        "cost": {
          "food": 310,
          "wood": 2075,
          "stone": 6230,
          "iron": 625
        },
        "seconds": 2000,
        "workers": 3
      },
      "3": {
        "cost": {
          "food": 640,
          "wood": 4255,
          "stone": 12780,
          "iron": 1280
        },
        "seconds": 4335,
        "workers": 6
      },
      "4": {
        "cost": {
          "food": 1305,
          "wood": 8615,
          "stone": 25920,
          "iron": 2600
        },
        "seconds": 9190,
        "workers": 10
      },
      "5": {
        "cost": {
          "food": 2625,
          "wood": 17230,
          "stone": 51940,
          "iron": 5220
        },
        "seconds": 19025,
        "workers": 15
      },
      "6": {
        "cost": {
          "food": 5220,
          "wood": 34025,
          "stone": 102840,
          "iron": 10360
        },
        "seconds": 38435,
        "workers": 21
      },
      "7": {
        "cost": {
          "food": 10270,
          "wood": 66350,
          "stone": 201155,
          "iron": 20330
        },
        "seconds": 75715,
        "workers": 28
      },
      "8": {
        "cost": {
          "food": 19990,
          "wood": 127720,
          "stone": 388625,
          "iron": 39415
        },
        "seconds": 145370,
        "workers": 36
      },
      "9": {
        "cost": {
          "food": 38455,
          "wood": 242670,
          "stone": 741500,
          "iron": 75520
        },
        "seconds": 271845,
        "workers": 45
      },
      "10": {
        "cost": {
          "food": 73145,
          "wood": 455005,
          "stone": 1396985,
          "iron": 142960
        },
        "seconds": 494760,
        "workers": 55
      }
    },
    "wall": {
      "1": {
        "cost": {
          "food": 2500,
          "wood": 1800,
          "stone": 10000,
          "iron": 1500
        },
        "seconds": 2400,
        "workers": 8
      },
      "2": {
        "cost": {
          "food": 5195,
          "wood": 3735,
          "stone": 20760,
          "iron": 3115
        },
        "seconds": 5330,
        "workers": 24
      },
      "3": {
        "cost": {
          "food": 10680,
          "wood": 7655,
          "stone": 42600,
          "iron": 6400
        },
        "seconds": 11560,
        "workers": 48
      },
      "4": {
        "cost": {
          "food": 21725,
          "wood": 15505,
          "stone": 86390,
          "iron": 12995
        },
        "seconds": 24510,
        "workers": 80
      },
      "5": {
        "cost": {
          "food": 43710,
          "wood": 31010,
          "stone": 173130,
          "iron": 26100
        },
        "seconds": 50740,
        "workers": 120
      },
      "6": {
        "cost": {
          "food": 86985,
          "wood": 61245,
          "stone": 342795,
          "iron": 51805
        },
        "seconds": 102490,
        "workers": 168
      },
      "7": {
        "cost": {
          "food": 171185,
          "wood": 119425,
          "stone": 670510,
          "iron": 101640
        },
        "seconds": 201905,
        "workers": 224
      },
      "8": {
        "cost": {
          "food": 333125,
          "wood": 229895,
          "stone": 1295425,
          "iron": 197080
        },
        "seconds": 387660,
        "workers": 288
      },
      "9": {
        "cost": {
          "food": 640935,
          "wood": 436805,
          "stone": 2471665,
          "iron": 377600
        },
        "seconds": 724920,
        "workers": 360
      },
      "10": {
        "cost": {
          "food": 1219055,
          "wood": 819005,
          "stone": 4656620,
          "iron": 714800
        },
        "seconds": 1319355,
        "workers": 440
      }
    }
  },
  "researchRows": {
    "plant": {
      "1": {
        "cost": {
          "food": 500,
          "gold": 1000
        },
        "seconds": 800
      },
      "2": {
        "cost": {
          "food": 1040,
          "gold": 2220
        },
        "seconds": 1765
      },
      "3": {
        "cost": {
          "food": 2135,
          "gold": 4860
        },
        "seconds": 3810
      },
      "4": {
        "cost": {
          "food": 4345,
          "gold": 10500
        },
        "seconds": 8060
      },
      "5": {
        "cost": {
          "food": 8740,
          "gold": 22370
        },
        "seconds": 16680
      },
      "6": {
        "cost": {
          "food": 17395,
          "gold": 46975
        },
        "seconds": 33780
      },
      "7": {
        "cost": {
          "food": 34235,
          "gold": 97235
        },
        "seconds": 66885
      },
      "8": {
        "cost": {
          "food": 66625,
          "gold": 198360
        },
        "seconds": 129420
      },
      "9": {
        "cost": {
          "food": 128185,
          "gold": 398700
        },
        "seconds": 244605
      },
      "10": {
        "cost": {
          "food": 243810,
          "gold": 789425
        },
        "seconds": 451295
      }
    },
    "logging": {
      "1": {
        "cost": {
          "wood": 500,
          "iron": 100,
          "gold": 1200
        },
        "seconds": 1000
      },
      "2": {
        "cost": {
          "wood": 1040,
          "iron": 210,
          "gold": 2665
        },
        "seconds": 2205
      },
      "3": {
        "cost": {
          "wood": 2125,
          "iron": 425,
          "gold": 5835
        },
        "seconds": 4765
      },
      "4": {
        "cost": {
          "wood": 4305,
          "iron": 865,
          "gold": 12600
        },
        "seconds": 10075
      },
      "5": {
        "cost": {
          "wood": 8615,
          "iron": 1740,
          "gold": 26840
        },
        "seconds": 20850
      },
      "6": {
        "cost": {
          "wood": 17010,
          "iron": 3455,
          "gold": 56370
        },
        "seconds": 42225
      },
      "7": {
        "cost": {
          "wood": 33175,
          "iron": 6775,
          "gold": 116680
        },
        "seconds": 83605
      },
      "8": {
        "cost": {
          "wood": 63860,
          "iron": 13140,
          "gold": 238030
        },
        "seconds": 161775
      },
      "9": {
        "cost": {
          "wood": 121335,
          "iron": 25175,
          "gold": 478440
        },
        "seconds": 305755
      },
      "10": {
        "cost": {
          "wood": 227500,
          "iron": 47655,
          "gold": 947310
        },
        "seconds": 564120
      }
    },
    "mining": {
      "1": {
        "cost": {
          "stone": 500,
          "iron": 200,
          "gold": 1500
        },
        "seconds": 1200
      },
      "2": {
        "cost": {
          "stone": 1040,
          "iron": 415,
          "gold": 3330
        },
        "seconds": 2645
      },
      "3": {
        "cost": {
          "stone": 2130,
          "iron": 855,
          "gold": 7295
        },
        "seconds": 5715
      },
      "4": {
        "cost": {
          "stone": 4320,
          "iron": 1735,
          "gold": 15750
        },
        "seconds": 12090
      },
      "5": {
        "cost": {
          "stone": 8655,
          "iron": 3480,
          "gold": 33550
        },
        "seconds": 25020
      },
      "6": {
        "cost": {
          "stone": 17140,
          "iron": 6905,
          "gold": 70460
        },
        "seconds": 50670
      },
      "7": {
        "cost": {
          "stone": 33525,
          "iron": 13550,
          "gold": 145850
        },
        "seconds": 100325
      },
      "8": {
        "cost": {
          "stone": 64770,
          "iron": 26275,
          "gold": 297535
        },
        "seconds": 194130
      },
      "9": {
        "cost": {
          "stone": 123585,
          "iron": 50345,
          "gold": 598050
        },
        "seconds": 366910
      },
      "10": {
        "cost": {
          "stone": 232830,
          "iron": 95305,
          "gold": 1184140
        },
        "seconds": 676945
      }
    },
    "smelting": {
      "1": {
        "cost": {
          "iron": 800,
          "gold": 2000
        },
        "seconds": 1400
      },
      "2": {
        "cost": {
          "iron": 1660,
          "gold": 4440
        },
        "seconds": 3085
      },
      "3": {
        "cost": {
          "iron": 3415,
          "gold": 9725
        },
        "seconds": 6670
      },
      "4": {
        "cost": {
          "iron": 6930,
          "gold": 21005
        },
        "seconds": 14105
      },
      "5": {
        "cost": {
          "iron": 13920,
          "gold": 44735
        },
        "seconds": 29190
      },
      "6": {
        "cost": {
          "iron": 27630,
          "gold": 93945
        },
        "seconds": 59115
      },
      "7": {
        "cost": {
          "iron": 54210,
          "gold": 194470
        },
        "seconds": 117045
      },
      "8": {
        "cost": {
          "iron": 105110,
          "gold": 396715
        },
        "seconds": 226485
      },
      "9": {
        "cost": {
          "iron": 201390,
          "gold": 797400
        },
        "seconds": 428060
      },
      "10": {
        "cost": {
          "iron": 381225,
          "gold": 1578850
        },
        "seconds": 789770
      }
    },
    "manufacture": {
      "1": {
        "cost": {
          "wood": 500,
          "iron": 500,
          "gold": 5000
        },
        "seconds": 1800
      },
      "2": {
        "cost": {
          "wood": 1040,
          "iron": 1040,
          "gold": 11100
        },
        "seconds": 3970
      },
      "3": {
        "cost": {
          "wood": 2125,
          "iron": 2135,
          "gold": 24310
        },
        "seconds": 8575
      },
      "4": {
        "cost": {
          "wood": 4305,
          "iron": 4330,
          "gold": 52505
        },
        "seconds": 18130
      },
      "5": {
        "cost": {
          "wood": 8615,
          "iron": 8700,
          "gold": 111840
        },
        "seconds": 37535
      },
      "6": {
        "cost": {
          "wood": 17010,
          "iron": 17270,
          "gold": 234865
        },
        "seconds": 76005
      },
      "7": {
        "cost": {
          "wood": 33175,
          "iron": 33880,
          "gold": 486170
        },
        "seconds": 150490
      },
      "8": {
        "cost": {
          "wood": 63860,
          "iron": 65695,
          "gold": 991790
        },
        "seconds": 291195
      },
      "9": {
        "cost": {
          "wood": 121335,
          "iron": 125865,
          "gold": 1993500
        },
        "seconds": 550360
      },
      "10": {
        "cost": {
          "wood": 227500,
          "iron": 238265,
          "gold": 3947130
        },
        "seconds": 1015420
      }
    },
    "leadership": {
      "1": {
        "cost": {
          "gold": 10000
        },
        "seconds": 3600
      },
      "2": {
        "cost": {
          "gold": 22200
        },
        "seconds": 7940
      },
      "3": {
        "cost": {
          "gold": 48620
        },
        "seconds": 17145
      },
      "4": {
        "cost": {
          "gold": 105015
        },
        "seconds": 36265
      },
      "5": {
        "cost": {
          "gold": 223680
        },
        "seconds": 75065
      },
      "6": {
        "cost": {
          "gold": 469730
        },
        "seconds": 152010
      },
      "7": {
        "cost": {
          "gold": 972345
        },
        "seconds": 300980
      },
      "8": {
        "cost": {
          "gold": 1983580
        },
        "seconds": 582395
      },
      "9": {
        "cost": {
          "gold": 3987000
        },
        "seconds": 1100725
      },
      "10": {
        "cost": {
          "gold": 7894260
        },
        "seconds": 2030835
      }
    },
    "scouting": {
      "1": {
        "cost": {
          "food": 300,
          "gold": 2000
        },
        "seconds": 600
      },
      "2": {
        "cost": {
          "food": 625,
          "gold": 4440
        },
        "seconds": 1325
      },
      "3": {
        "cost": {
          "food": 1280,
          "gold": 9725
        },
        "seconds": 2860
      },
      "4": {
        "cost": {
          "food": 2605,
          "gold": 21005
        },
        "seconds": 6045
      },
      "5": {
        "cost": {
          "food": 5245,
          "gold": 44735
        },
        "seconds": 12510
      },
      "6": {
        "cost": {
          "food": 10440,
          "gold": 93945
        },
        "seconds": 25335
      },
      "7": {
        "cost": {
          "food": 20540,
          "gold": 194470
        },
        "seconds": 50165
      },
      "8": {
        "cost": {
          "food": 39975,
          "gold": 396715
        },
        "seconds": 97065
      },
      "9": {
        "cost": {
          "food": 76910,
          "gold": 797400
        },
        "seconds": 183455
      },
      "10": {
        "cost": {
          "food": 146285,
          "gold": 1578850
        },
        "seconds": 338475
      }
    },
    "training": {
      "1": {
        "cost": {
          "food": 600,
          "wood": 100,
          "stone": 100,
          "iron": 150,
          "gold": 2500
        },
        "seconds": 1800
      },
      "2": {
        "cost": {
          "food": 1245,
          "wood": 210,
          "stone": 210,
          "iron": 310,
          "gold": 5550
        },
        "seconds": 3970
      },
      "3": {
        "cost": {
          "food": 2565,
          "wood": 425,
          "stone": 425,
          "iron": 640,
          "gold": 12155
        },
        "seconds": 8575
      },
      "4": {
        "cost": {
          "food": 5215,
          "wood": 860,
          "stone": 865,
          "iron": 1300,
          "gold": 26255
        },
        "seconds": 18130
      },
      "5": {
        "cost": {
          "food": 10490,
          "wood": 1725,
          "stone": 1730,
          "iron": 2610,
          "gold": 55920
        },
        "seconds": 37535
      },
      "6": {
        "cost": {
          "food": 20875,
          "wood": 3400,
          "stone": 3430,
          "iron": 5180,
          "gold": 117435
        },
        "seconds": 76005
      },
      "7": {
        "cost": {
          "food": 41085,
          "wood": 6635,
          "stone": 6705,
          "iron": 10165,
          "gold": 243085
        },
        "seconds": 150490
      },
      "8": {
        "cost": {
          "food": 79950,
          "wood": 12770,
          "stone": 12955,
          "iron": 19710,
          "gold": 495895
        },
        "seconds": 291195
      },
      "9": {
        "cost": {
          "food": 153825,
          "wood": 24265,
          "stone": 24715,
          "iron": 37760,
          "gold": 996750
        },
        "seconds": 550360
      },
      "10": {
        "cost": {
          "food": 292575,
          "wood": 45500,
          "stone": 46565,
          "iron": 71480,
          "gold": 1973565
        },
        "seconds": 1015420
      }
    },
    "combat": {
      "1": {
        "cost": {
          "food": 800,
          "wood": 120,
          "iron": 200,
          "gold": 3000
        },
        "seconds": 2400
      },
      "2": {
        "cost": {
          "food": 1660,
          "wood": 250,
          "iron": 415,
          "gold": 6660
        },
        "seconds": 5290
      },
      "3": {
        "cost": {
          "food": 3420,
          "wood": 510,
          "iron": 855,
          "gold": 14585
        },
        "seconds": 11430
      },
      "4": {
        "cost": {
          "food": 6950,
          "wood": 1035,
          "iron": 1735,
          "gold": 31505
        },
        "seconds": 24175
      },
      "5": {
        "cost": {
          "food": 13985,
          "wood": 2065,
          "iron": 3480,
          "gold": 67105
        },
        "seconds": 50045
      },
      "6": {
        "cost": {
          "food": 27835,
          "wood": 4085,
          "iron": 6905,
          "gold": 140920
        },
        "seconds": 101340
      },
      "7": {
        "cost": {
          "food": 54780,
          "wood": 7960,
          "iron": 13550,
          "gold": 291705
        },
        "seconds": 200650
      },
      "8": {
        "cost": {
          "food": 106600,
          "wood": 15325,
          "iron": 26275,
          "gold": 595075
        },
        "seconds": 388265
      },
      "9": {
        "cost": {
          "food": 205100,
          "wood": 29120,
          "iron": 50345,
          "gold": 1196100
        },
        "seconds": 733815
      },
      "10": {
        "cost": {
          "food": 390100,
          "wood": 54600,
          "iron": 95305,
          "gold": 2368280
        },
        "seconds": 1353890
      }
    },
    "protection": {
      "1": {
        "cost": {
          "food": 700,
          "wood": 150,
          "iron": 300,
          "gold": 3500
        },
        "seconds": 3000
      },
      "2": {
        "cost": {
          "food": 1455,
          "wood": 310,
          "iron": 625,
          "gold": 7770
        },
        "seconds": 6615
      },
      "3": {
        "cost": {
          "food": 2990,
          "wood": 640,
          "iron": 1280,
          "gold": 17015
        },
        "seconds": 14290
      },
      "4": {
        "cost": {
          "food": 6085,
          "wood": 1290,
          "iron": 2600,
          "gold": 36755
        },
        "seconds": 30220
      },
      "5": {
        "cost": {
          "food": 12240,
          "wood": 2585,
          "iron": 5220,
          "gold": 78290
        },
        "seconds": 62555
      },
      "6": {
        "cost": {
          "food": 24355,
          "wood": 5105,
          "iron": 10360,
          "gold": 164405
        },
        "seconds": 126675
      },
      "7": {
        "cost": {
          "food": 47930,
          "wood": 9950,
          "iron": 20330,
          "gold": 340320
        },
        "seconds": 250815
      },
      "8": {
        "cost": {
          "food": 93275,
          "wood": 19160,
          "iron": 39415,
          "gold": 694255
        },
        "seconds": 485330
      },
      "9": {
        "cost": {
          "food": 179460,
          "wood": 36400,
          "iron": 75520,
          "gold": 1395450
        },
        "seconds": 917270
      },
      "10": {
        "cost": {
          "food": 341335,
          "wood": 68250,
          "iron": 142960,
          "gold": 2762990
        },
        "seconds": 1692365
      }
    },
    "load": {
      "1": {
        "cost": {
          "food": 500,
          "stone": 200,
          "gold": 3000
        },
        "seconds": 3200
      },
      "2": {
        "cost": {
          "food": 1040,
          "stone": 415,
          "gold": 6660
        },
        "seconds": 7055
      },
      "3": {
        "cost": {
          "food": 2135,
          "stone": 850,
          "gold": 14585
        },
        "seconds": 15240
      },
      "4": {
        "cost": {
          "food": 4345,
          "stone": 1730,
          "gold": 31505
        },
        "seconds": 32235
      },
      "5": {
        "cost": {
          "food": 8740,
          "stone": 3465,
          "gold": 67105
        },
        "seconds": 66725
      },
      "6": {
        "cost": {
          "food": 17395,
          "stone": 6855,
          "gold": 140920
        },
        "seconds": 135120
      },
      "7": {
        "cost": {
          "food": 34235,
          "stone": 13410,
          "gold": 291705
        },
        "seconds": 267535
      },
      "8": {
        "cost": {
          "food": 66625,
          "stone": 25910,
          "gold": 595075
        },
        "seconds": 517685
      },
      "9": {
        "cost": {
          "food": 128185,
          "stone": 49435,
          "gold": 1196100
        },
        "seconds": 978420
      },
      "10": {
        "cost": {
          "food": 243810,
          "stone": 93130,
          "gold": 2368280
        },
        "seconds": 1805190
      }
    },
    "march": {
      "1": {
        "cost": {
          "food": 600,
          "gold": 3000
        },
        "seconds": 3600
      },
      "2": {
        "cost": {
          "food": 1245,
          "gold": 6660
        },
        "seconds": 7940
      },
      "3": {
        "cost": {
          "food": 2565,
          "gold": 14585
        },
        "seconds": 17145
      },
      "4": {
        "cost": {
          "food": 5215,
          "gold": 31505
        },
        "seconds": 36265
      },
      "5": {
        "cost": {
          "food": 10490,
          "gold": 67105
        },
        "seconds": 75065
      },
      "6": {
        "cost": {
          "food": 20875,
          "gold": 140920
        },
        "seconds": 152010
      },
      "7": {
        "cost": {
          "food": 41085,
          "gold": 291705
        },
        "seconds": 300980
      },
      "8": {
        "cost": {
          "food": 79950,
          "gold": 595075
        },
        "seconds": 582395
      },
      "9": {
        "cost": {
          "food": 153825,
          "gold": 1196100
        },
        "seconds": 1100725
      },
      "10": {
        "cost": {
          "food": 292575,
          "gold": 2368280
        },
        "seconds": 2030835
      }
    },
    "riding": {
      "1": {
        "cost": {
          "food": 1000,
          "gold": 4000
        },
        "seconds": 4000
      },
      "2": {
        "cost": {
          "food": 2080,
          "gold": 8880
        },
        "seconds": 8820
      },
      "3": {
        "cost": {
          "food": 4270,
          "gold": 19445
        },
        "seconds": 19050
      },
      "4": {
        "cost": {
          "food": 8690,
          "gold": 42005
        },
        "seconds": 40295
      },
      "5": {
        "cost": {
          "food": 17485,
          "gold": 89475
        },
        "seconds": 83405
      },
      "6": {
        "cost": {
          "food": 34795,
          "gold": 187895
        },
        "seconds": 168900
      },
      "7": {
        "cost": {
          "food": 68475,
          "gold": 388940
        },
        "seconds": 334420
      },
      "8": {
        "cost": {
          "food": 133250,
          "gold": 793435
        },
        "seconds": 647105
      },
      "9": {
        "cost": {
          "food": 256375,
          "gold": 1594800
        },
        "seconds": 1223025
      },
      "10": {
        "cost": {
          "food": 487625,
          "gold": 3157705
        },
        "seconds": 2256485
      }
    },
    "shooting": {
      "1": {
        "cost": {
          "wood": 800,
          "stone": 500,
          "iron": 600,
          "gold": 5000
        },
        "seconds": 4800
      },
      "2": {
        "cost": {
          "wood": 1660,
          "stone": 1040,
          "iron": 1245,
          "gold": 11100
        },
        "seconds": 10585
      },
      "3": {
        "cost": {
          "wood": 3405,
          "stone": 2130,
          "iron": 2560,
          "gold": 24310
        },
        "seconds": 22860
      },
      "4": {
        "cost": {
          "wood": 6890,
          "stone": 4320,
          "iron": 5200,
          "gold": 52505
        },
        "seconds": 48350
      },
      "5": {
        "cost": {
          "wood": 13780,
          "stone": 8655,
          "iron": 10440,
          "gold": 111840
        },
        "seconds": 100090
      },
      "6": {
        "cost": {
          "wood": 27220,
          "stone": 17140,
          "iron": 20720,
          "gold": 234865
        },
        "seconds": 202680
      },
      "7": {
        "cost": {
          "wood": 53080,
          "stone": 33525,
          "iron": 40655,
          "gold": 486170
        },
        "seconds": 401305
      },
      "8": {
        "cost": {
          "wood": 102175,
          "stone": 64770,
          "iron": 78830,
          "gold": 991790
        },
        "seconds": 776525
      },
      "9": {
        "cost": {
          "wood": 194135,
          "stone": 123585,
          "iron": 151040,
          "gold": 1993500
        },
        "seconds": 1467630
      },
      "10": {
        "cost": {
          "wood": 364000,
          "stone": 232830,
          "iron": 285920,
          "gold": 3947130
        },
        "seconds": 2707780
      }
    },
    "storage": {
      "1": {
        "cost": {
          "wood": 1200,
          "stone": 1000,
          "iron": 800,
          "gold": 2000
        },
        "seconds": 1800
      },
      "2": {
        "cost": {
          "wood": 2490,
          "stone": 2075,
          "iron": 1660,
          "gold": 4440
        },
        "seconds": 3970
      },
      "3": {
        "cost": {
          "wood": 5105,
          "stone": 4260,
          "iron": 3415,
          "gold": 9725
        },
        "seconds": 8575
      },
      "4": {
        "cost": {
          "wood": 10335,
          "stone": 8640,
          "iron": 6930,
          "gold": 21005
        },
        "seconds": 18130
      },
      "5": {
        "cost": {
          "wood": 20675,
          "stone": 17315,
          "iron": 13920,
          "gold": 44735
        },
        "seconds": 37535
      },
      "6": {
        "cost": {
          "wood": 40830,
          "stone": 34280,
          "iron": 27630,
          "gold": 93945
        },
        "seconds": 76005
      },
      "7": {
        "cost": {
          "wood": 79620,
          "stone": 67050,
          "iron": 54210,
          "gold": 194470
        },
        "seconds": 150490
      },
      "8": {
        "cost": {
          "wood": 153265,
          "stone": 129540,
          "iron": 105110,
          "gold": 396715
        },
        "seconds": 291195
      },
      "9": {
        "cost": {
          "wood": 291200,
          "stone": 247165,
          "iron": 201390,
          "gold": 797400
        },
        "seconds": 550360
      },
      "10": {
        "cost": {
          "wood": 546005,
          "stone": 465660,
          "iron": 381225,
          "gold": 1578850
        },
        "seconds": 1015420
      }
    },
    "supply": {
      "1": {
        "cost": {
          "food": 1500,
          "gold": 3600
        },
        "seconds": 3600
      },
      "2": {
        "cost": {
          "food": 3115,
          "gold": 7990
        },
        "seconds": 7940
      },
      "3": {
        "cost": {
          "food": 6410,
          "gold": 17500
        },
        "seconds": 17145
      },
      "4": {
        "cost": {
          "food": 13035,
          "gold": 37805
        },
        "seconds": 36265
      },
      "5": {
        "cost": {
          "food": 26225,
          "gold": 80525
        },
        "seconds": 75065
      },
      "6": {
        "cost": {
          "food": 52190,
          "gold": 169105
        },
        "seconds": 152010
      },
      "7": {
        "cost": {
          "food": 102710,
          "gold": 350045
        },
        "seconds": 300980
      },
      "8": {
        "cost": {
          "food": 199875,
          "gold": 714090
        },
        "seconds": 582395
      },
      "9": {
        "cost": {
          "food": 384560,
          "gold": 1435320
        },
        "seconds": 1100725
      },
      "10": {
        "cost": {
          "food": 731435,
          "gold": 2841935
        },
        "seconds": 2030835
      }
    },
    "construction": {
      "1": {
        "cost": {
          "wood": 2000,
          "stone": 2000,
          "iron": 2000,
          "gold": 5000
        },
        "seconds": 3600
      },
      "2": {
        "cost": {
          "wood": 4150,
          "stone": 4150,
          "iron": 4155,
          "gold": 11100
        },
        "seconds": 7940
      },
      "3": {
        "cost": {
          "wood": 8510,
          "stone": 8520,
          "iron": 8530,
          "gold": 24310
        },
        "seconds": 17145
      },
      "4": {
        "cost": {
          "wood": 17230,
          "stone": 17280,
          "iron": 17330,
          "gold": 52505
        },
        "seconds": 36265
      },
      "5": {
        "cost": {
          "wood": 34455,
          "stone": 34625,
          "iron": 34795,
          "gold": 111840
        },
        "seconds": 75065
      },
      "6": {
        "cost": {
          "wood": 68050,
          "stone": 68560,
          "iron": 69070,
          "gold": 234865
        },
        "seconds": 152010
      },
      "7": {
        "cost": {
          "wood": 132695,
          "stone": 134100,
          "iron": 135520,
          "gold": 486170
        },
        "seconds": 300980
      },
      "8": {
        "cost": {
          "wood": 255440,
          "stone": 259085,
          "iron": 262770,
          "gold": 991790
        },
        "seconds": 582395
      },
      "9": {
        "cost": {
          "wood": 485335,
          "stone": 494335,
          "iron": 503470,
          "gold": 1993500
        },
        "seconds": 1100725
      },
      "10": {
        "cost": {
          "wood": 910005,
          "stone": 931325,
          "iron": 953070,
          "gold": 3947130
        },
        "seconds": 2030835
      }
    },
    "fortification": {
      "1": {
        "cost": {
          "wood": 2500,
          "stone": 3000,
          "iron": 1500,
          "gold": 6000
        },
        "seconds": 4200
      },
      "2": {
        "cost": {
          "wood": 5190,
          "stone": 6230,
          "iron": 3115,
          "gold": 13320
        },
        "seconds": 9260
      },
      "3": {
        "cost": {
          "wood": 10635,
          "stone": 12780,
          "iron": 6400,
          "gold": 29170
        },
        "seconds": 20005
      },
      "4": {
        "cost": {
          "wood": 21535,
          "stone": 25920,
          "iron": 12995,
          "gold": 63010
        },
        "seconds": 42310
      },
      "5": {
        "cost": {
          "wood": 43070,
          "stone": 51940,
          "iron": 26100,
          "gold": 134210
        },
        "seconds": 87575
      },
      "6": {
        "cost": {
          "wood": 85060,
          "stone": 102840,
          "iron": 51805,
          "gold": 281840
        },
        "seconds": 177345
      },
      "7": {
        "cost": {
          "wood": 165870,
          "stone": 201155,
          "iron": 101640,
          "gold": 583405
        },
        "seconds": 351140
      },
      "8": {
        "cost": {
          "wood": 319300,
          "stone": 388625,
          "iron": 197080,
          "gold": 1190150
        },
        "seconds": 679460
      },
      "9": {
        "cost": {
          "wood": 606670,
          "stone": 741500,
          "iron": 377600,
          "gold": 2392200
        },
        "seconds": 1284180
      },
      "10": {
        "cost": {
          "wood": 1137510,
          "stone": 1396985,
          "iron": 714800,
          "gold": 4736555
        },
        "seconds": 2369310
      }
    },
    "repair": {
      "1": {
        "cost": {
          "wood": 600,
          "stone": 700,
          "iron": 800,
          "gold": 5500
        },
        "seconds": 4800
      },
      "2": {
        "cost": {
          "wood": 1245,
          "stone": 1455,
          "iron": 1660,
          "gold": 12210
        },
        "seconds": 10585
      },
      "3": {
        "cost": {
          "wood": 2550,
          "stone": 2980,
          "iron": 3415,
          "gold": 26740
        },
        "seconds": 22860
      },
      "4": {
        "cost": {
          "wood": 5170,
          "stone": 6045,
          "iron": 6930,
          "gold": 57760
        },
        "seconds": 48350
      },
      "5": {
        "cost": {
          "wood": 10335,
          "stone": 12120,
          "iron": 13920,
          "gold": 123025
        },
        "seconds": 100090
      },
      "6": {
        "cost": {
          "wood": 20415,
          "stone": 23995,
          "iron": 27630,
          "gold": 258350
        },
        "seconds": 202680
      },
      "7": {
        "cost": {
          "wood": 39810,
          "stone": 46935,
          "iron": 54210,
          "gold": 534790
        },
        "seconds": 401305
      },
      "8": {
        "cost": {
          "wood": 76630,
          "stone": 90680,
          "iron": 105110,
          "gold": 1090970
        },
        "seconds": 776525
      },
      "9": {
        "cost": {
          "wood": 145600,
          "stone": 173015,
          "iron": 201390,
          "gold": 2192850
        },
        "seconds": 1467630
      },
      "10": {
        "cost": {
          "wood": 273000,
          "stone": 325965,
          "iron": 381225,
          "gold": 4341845
        },
        "seconds": 2707780
      }
    },
    "plunder": {
      "1": {
        "cost": {
          "food": 5000,
          "iron": 2000,
          "gold": 10000
        },
        "seconds": 7200
      },
      "2": {
        "cost": {
          "food": 10390,
          "iron": 4155,
          "gold": 22200
        },
        "seconds": 15875
      },
      "3": {
        "cost": {
          "food": 21360,
          "iron": 8530,
          "gold": 48620
        },
        "seconds": 34290
      },
      "4": {
        "cost": {
          "food": 43450,
          "iron": 17330,
          "gold": 105015
        },
        "seconds": 72530
      },
      "5": {
        "cost": {
          "food": 87420,
          "iron": 34795,
          "gold": 223680
        },
        "seconds": 150135
      },
      "6": {
        "cost": {
          "food": 173970,
          "iron": 69070,
          "gold": 469730
        },
        "seconds": 304020
      },
      "7": {
        "cost": {
          "food": 342370,
          "iron": 135520,
          "gold": 972345
        },
        "seconds": 601955
      },
      "8": {
        "cost": {
          "food": 666250,
          "iron": 262770,
          "gold": 1983580
        },
        "seconds": 1164790
      },
      "9": {
        "cost": {
          "food": 1281870,
          "iron": 503470,
          "gold": 3987000
        },
        "seconds": 2201450
      },
      "10": {
        "cost": {
          "food": 2438115,
          "iron": 953070,
          "gold": 7894260
        },
        "seconds": 4061675
      }
    },
    "researching": {
      "1": {
        "cost": {
          "food": 5000,
          "gold": 3400
        },
        "seconds": 1200
      },
      "2": {
        "cost": {
          "food": 8883,
          "gold": 7106
        },
        "seconds": 2498
      },
      "3": {
        "cost": {
          "food": 18234,
          "gold": 14586
        },
        "seconds": 5469
      },
      "4": {
        "cost": {
          "food": 36748,
          "gold": 29397
        },
        "seconds": 11023
      },
      "5": {
        "cost": {
          "food": 72688,
          "gold": 58149
        },
        "seconds": 21804
      },
      "6": {
        "cost": {
          "food": 140919,
          "gold": 112731
        },
        "seconds": 42270
      },
      "7": {
        "cost": {
          "food": 243072,
          "gold": 194451
        },
        "seconds": 80204
      },
      "8": {
        "cost": {
          "food": 396698,
          "gold": 317347
        },
        "seconds": 148744
      },
      "9": {
        "cost": {
          "food": 697364,
          "gold": 537868
        },
        "seconds": 269077
      },
      "10": {
        "cost": {
          "food": 984083,
          "gold": 757232
        },
        "seconds": 385181
      }
    }
  },
  "units": {
    "worker": {
      "hp": 100,
      "atk": 5,
      "def": 10,
      "range": 10,
      "speed": 180,
      "carry": 200,
      "people": 1,
      "upkeep": 1,
      "sourceTime": 1,
      "cost": {
        "food": 50,
        "wood": 150,
        "iron": 10
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ]
    },
    "militia": {
      "hp": 200,
      "atk": 50,
      "def": 50,
      "range": 20,
      "speed": 200,
      "carry": 20,
      "people": 1,
      "upkeep": 1,
      "sourceTime": 1,
      "cost": {
        "food": 80,
        "wood": 100,
        "iron": 50
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 1
        }
      ]
    },
    "scout": {
      "hp": 100,
      "atk": 20,
      "def": 20,
      "range": 20,
      "speed": 3000,
      "carry": 5,
      "people": 1,
      "upkeep": 1,
      "sourceTime": 1,
      "cost": {
        "food": 120,
        "wood": 200,
        "iron": 150
      },
      "requires": [
        {
          "kind": "tech",
          "id": "scouting",
          "level": 1
        },
        {
          "kind": "building",
          "id": "barracks",
          "level": 2
        }
      ]
    },
    "spear": {
      "hp": 300,
      "atk": 150,
      "def": 150,
      "range": 50,
      "speed": 300,
      "carry": 40,
      "people": 1,
      "upkeep": 1,
      "sourceTime": 1,
      "cost": {
        "food": 150,
        "wood": 500,
        "iron": 100
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 2
        },
        {
          "kind": "tech",
          "id": "combat",
          "level": 1
        }
      ]
    },
    "shield": {
      "hp": 350,
      "atk": 100,
      "def": 250,
      "range": 30,
      "speed": 275,
      "carry": 30,
      "people": 1,
      "upkeep": 1,
      "sourceTime": 2,
      "cost": {
        "food": 200,
        "wood": 150,
        "iron": 400
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 3
        },
        {
          "kind": "tech",
          "id": "protection",
          "level": 1
        }
      ]
    },
    "archer": {
      "hp": 250,
      "atk": 120,
      "def": 50,
      "range": 1200,
      "speed": 250,
      "carry": 25,
      "people": 2,
      "upkeep": 1,
      "sourceTime": 3,
      "cost": {
        "food": 300,
        "wood": 350,
        "iron": 300
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 4
        },
        {
          "kind": "tech",
          "id": "shooting",
          "level": 1
        }
      ]
    },
    "wagon": {
      "hp": 700,
      "atk": 10,
      "def": 60,
      "range": 10,
      "speed": 150,
      "carry": 5000,
      "people": 4,
      "upkeep": 1,
      "sourceTime": 9,
      "cost": {
        "food": 600,
        "wood": 1500,
        "iron": 350
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 6
        },
        {
          "kind": "tech",
          "id": "load",
          "level": 1
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 3
        }
      ]
    },
    "cavalry": {
      "hp": 500,
      "atk": 250,
      "def": 180,
      "range": 80,
      "speed": 1000,
      "carry": 100,
      "people": 3,
      "upkeep": 1,
      "sourceTime": 4,
      "cost": {
        "food": 1000,
        "wood": 600,
        "iron": 500
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 5
        },
        {
          "kind": "tech",
          "id": "riding",
          "level": 1
        }
      ]
    },
    "heavy": {
      "hp": 1000,
      "atk": 350,
      "def": 350,
      "range": 70,
      "speed": 600,
      "carry": 80,
      "people": 6,
      "upkeep": 3,
      "sourceTime": 14,
      "cost": {
        "food": 2000,
        "wood": 500,
        "iron": 2500
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 7
        },
        {
          "kind": "tech",
          "id": "riding",
          "level": 5
        },
        {
          "kind": "tech",
          "id": "protection",
          "level": 5
        }
      ]
    },
    "ballista": {
      "hp": 450,
      "atk": 420,
      "def": 160,
      "range": 1400,
      "speed": 120,
      "carry": 35,
      "people": 5,
      "upkeep": 5,
      "sourceTime": 29,
      "cost": {
        "food": 2500,
        "wood": 3000,
        "iron": 1800
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 8
        },
        {
          "kind": "tech",
          "id": "shooting",
          "level": 6
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 5
        }
      ]
    },
    "ram": {
      "hp": 5000,
      "atk": 250,
      "def": 600,
      "range": 50,
      "speed": 160,
      "carry": 45,
      "people": 10,
      "upkeep": 10,
      "sourceTime": 43,
      "cost": {
        "food": 4000,
        "wood": 6000,
        "iron": 1500
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 9
        },
        {
          "kind": "tech",
          "id": "protection",
          "level": 8
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 7
        }
      ]
    },
    "catapult": {
      "hp": 900,
      "atk": 600,
      "def": 200,
      "range": 1600,
      "speed": 100,
      "carry": 75,
      "people": 8,
      "upkeep": 2,
      "sourceTime": 58,
      "cost": {
        "food": 5000,
        "wood": 5000,
        "stone": 8000,
        "iron": 1200
      },
      "requires": [
        {
          "kind": "building",
          "id": "barracks",
          "level": 10
        },
        {
          "kind": "tech",
          "id": "shooting",
          "level": 10
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 10
        }
      ]
    }
  },
  "defenses": {
    "trap": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "range": 2000,
      "time": 60,
      "area": 1,
      "cost": {
        "food": 50,
        "wood": 500,
        "stone": 100,
        "iron": 50
      },
      "requires": [
        {
          "kind": "building",
          "id": "wall",
          "level": 1
        }
      ]
    },
    "abatis": {
      "hp": 950,
      "atk": 0,
      "def": 180,
      "range": 800,
      "time": 120,
      "area": 2,
      "cost": {
        "food": 100,
        "wood": 1200,
        "iron": 150
      },
      "requires": [
        {
          "kind": "building",
          "id": "wall",
          "level": 2
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 1
        }
      ]
    },
    "tower": {
      "hp": 1800,
      "atk": 300,
      "def": 300,
      "range": 1250,
      "time": 180,
      "area": 3,
      "cost": {
        "food": 200,
        "wood": 2000,
        "stone": 1000,
        "iron": 500
      },
      "requires": [
        {
          "kind": "building",
          "id": "wall",
          "level": 3
        },
        {
          "kind": "tech",
          "id": "shooting",
          "level": 3
        }
      ]
    },
    "logs": {
      "hp": 0,
      "atk": 500,
      "def": 0,
      "range": 500,
      "time": 360,
      "area": 4,
      "cost": {
        "food": 300,
        "wood": 6000
      },
      "requires": [
        {
          "kind": "building",
          "id": "wall",
          "level": 5
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 4
        }
      ]
    },
    "rocks": {
      "hp": 0,
      "atk": 800,
      "def": 0,
      "range": 250,
      "time": 600,
      "area": 5,
      "cost": {
        "food": 600,
        "stone": 8000
      },
      "requires": [
        {
          "kind": "building",
          "id": "wall",
          "level": 7
        },
        {
          "kind": "tech",
          "id": "manufacture",
          "level": 6
        }
      ]
    }
  },
  "fieldBudget": {
    "1": 1000,
    "2": 2000,
    "3": 5000,
    "4": 10000,
    "5": 20000,
    "6": 50000,
    "7": 100000,
    "8": 200000,
    "9": 500000,
    "10": 1000000
  },
  "wallRows": [
    {
      "level": 1,
      "life": 1000000,
      "range_add": 3,
      "area": 10000,
      "dp": 1000,
      "dp_add": 10
    },
    {
      "level": 2,
      "life": 2000000,
      "range_add": 6,
      "area": 20000,
      "dp": 1200,
      "dp_add": 20
    },
    {
      "level": 3,
      "life": 3000000,
      "range_add": 9,
      "area": 30000,
      "dp": 1400,
      "dp_add": 30
    },
    {
      "level": 4,
      "life": 4000000,
      "range_add": 12,
      "area": 40000,
      "dp": 1700,
      "dp_add": 40
    },
    {
      "level": 5,
      "life": 5000000,
      "range_add": 15,
      "area": 50000,
      "dp": 2000,
      "dp_add": 50
    },
    {
      "level": 6,
      "life": 6000000,
      "range_add": 18,
      "area": 60000,
      "dp": 2400,
      "dp_add": 60
    },
    {
      "level": 7,
      "life": 7000000,
      "range_add": 21,
      "area": 70000,
      "dp": 2800,
      "dp_add": 70
    },
    {
      "level": 8,
      "life": 8000000,
      "range_add": 24,
      "area": 80000,
      "dp": 3300,
      "dp_add": 80
    },
    {
      "level": 9,
      "life": 9000000,
      "range_add": 27,
      "area": 90000,
      "dp": 3800,
      "dp_add": 90
    },
    {
      "level": 10,
      "life": 10000000,
      "range_add": 30,
      "area": 100000,
      "dp": 4500,
      "dp_add": 100
    }
  ],
  "npcValues": {
    "militia": 31,
    "spear": 90,
    "shield": 135,
    "archer": 140,
    "cavalry": 285
  }
};
for(const [id,levels] of Object.entries(ReferenceRules.buildingRows))for(const [level,row] of Object.entries(levels))Object.assign(ManualData.buildings[id].rows[level-1],row,{confirmedTime:true,reference:true});
for(const [id,row] of Object.entries(ReferenceRules.units)){const unit=ManualData.units[id];Object.assign(unit,{hp:row.hp,atk:row.atk,def:row.def,range:row.range,speed:row.speed,carry:row.carry,people:row.people,upkeep:row.upkeep,cost:row.cost});unit.requires={buildings:{},tech:{}};for(const req of row.requires)unit.requires[req.kind==='building'?'buildings':'tech'][req.id]=req.level;}
ManualData.technology.supply.name='医疗技巧';
for(const id of ['plant','logging','mining','smelting']){ManualData.technology[id].effect=.1;ManualData.technology[id].desc=({plant:'粮食',logging:'木材',mining:'石料',smelting:'铁锭'})[id]+'产量每级 +10%。';}
ManualData.technology.researching={name:'研究技巧',desc:'每级缩短新研究的基础工期 3%。',effect:.03,max:10};
ManualData.technology.repair.desc='正式守城结束后，每级恢复 5% 受损持久城防。';
for(const [id,rows] of Object.entries(ReferenceRules.researchRows))Object.assign(ManualData.technology[id],{rows,trialCost:false,reference:true});
const referenceBlueprint=ManualData.shop.find(i=>i.id==='blueprint');Object.assign(referenceBlueprint,{effect:'blueprint',desc:'建筑与资源田升至 10 级时消耗 1 张。开始建设时自动扣除，不能直接使用。'});

for(const [id,row] of Object.entries(ReferenceRules.defenses)){const defense=ManualData.defenses[id];Object.assign(defense,row);defense.wall=row.requires.find(r=>r.id==='wall')?.level||1;defense.tech=Object.fromEntries(row.requires.filter(r=>r.kind==='tech').map(r=>[r.id,r.level]));}


// SOURCE: reward-data.js
'use strict';
// Prototype economy, missions and prisoner rules requested for this game.
const RewardData = {
  dailyBrickLimit:10,
  testSupplyAmount:1000000,
  constructionStoneFactor:1.5,
  // Growth tasks complement the ten hall gifts. Early prerequisites no longer
  // each pay another full development budget; later hall rewards fund trade.
  missionTuning:{opening:{gold:.15,resources:.04},hall:{gold:1,resources:1},advanced:{gold:.8,resources:1}},
  goldBricks:[
    {id:'goldBrick',name:'金砖',price:50,gold:50000},
    {id:'goldBrickLarge',name:'大金砖',price:180,gold:200000}
  ],
  captives:{baseChance:.3,perLevel:.02,maxChance:.5,minRatio:.03,maxRatio:.08,escortRatio:.25,maxPerBattle:300,maxCapacity:5000,food:50,goldRatio:.5,minGold:20,units:['militia','spear','shield','archer','cavalry','heavy']},
  extendMissions(missions){
    // Stable old IDs keep earlier claims collected; retuned rewards apply to unclaimed missions.
    for(const m of missions)m.reward=Object.fromEntries(Object.entries(m.reward).map(([id,n])=>[id,Math.round(n*(id==='gold'?2:1.5))]));
    const supply=(n,g)=>({food:n,wood:n,stone:n,iron:n,gold:g});
    const add=(id,stage,title,desc,route,check,reward,items={})=>missions.push({id,stage,title,desc,route,check,reward,items});
    const levels=(s,id)=>s.plots.some(p=>p.type===id&&p.level>=3);
    const held=(s,id)=>s.army[id]+[s.expedition,...s.expeditions,...Object.values(s.garrisons)].filter(Boolean).reduce((n,e)=>n+(e.army[id]||0),0);
    const metric=(s,id)=>s.activityMetrics[id]||0;
    for(const [id,name] of [['academy','书院'],['market','市场'],['inn','客栈'],['tavern','招贤馆'],['smith','铁匠铺'],['workshop','工匠作坊'],['stable','马厩'],['beacon','烽火台'],['wall','城墙']])
      add('develop_'+id,'城池经营',name+'落成','完成 1 座 1 级'+name,'inner',s=>s.buildings[id]>=1,supply(8000,18000));
    for(const level of [3,4,5,7])add('hall_'+level,'城池经营','官府扩建 · '+level+'级','官府达到 '+level+' 级','inner',s=>s.buildings.hall>=level,supply(level*6000,level*20000),{'speed_build_1h':1});
    add('warehouse3','城池经营','储备军资','仓库达到 3 级','inner',s=>s.buildings.warehouse>=3,supply(18000,30000));
    add('population300','城池经营','人丁兴旺','当前人口达到 300，或累计训练 100 名士兵','inner',s=>s.population>=300||s.stats.trained>=100,supply(12000,24000));
    add('fields8','城池经营','田野成片','完成 8 块任意资源田','outer',s=>s.plots.filter(p=>p.type).length>=8,supply(20000,30000));
    for(const [id,name] of [['farm','农田'],['lumber','伐木场'],['quarry','采石场'],['mine','铁矿']])add('field3_'+id,'城池经营',name+'精耕','任意'+name+'达到 3 级','outer',s=>levels(s,id),supply(12000,20000));
    add('firstCivic','城池经营','施政安民','累计执行 1 次官府安抚或征收指令','civic',s=>metric(s,'civic')>=1,supply(8000,20000));
    add('trade10000','城池经营','商路初通','累计在市场买卖 10,000 份资源','market',s=>metric(s,'trade')>=10000,supply(10000,25000));
    const technology=Object.keys(ManualData.technology);
    add('researchFirst','书院研习','初习技术','任意科技达到 1 级','research',s=>technology.some(id=>s.tech[id]>=1),supply(10000,30000),{'speed_research_15m':2});
    for(const [id,name] of [['plant','种植技术'],['logging','砍伐技术'],['mining','挖掘技术'],['smelting','冶炼技术'],['combat','战斗技巧'],['shooting','抛射技巧'],['construction','建筑技术']])
      add('study_'+id,'书院研习',name+'入门',name+'达到 1 级','research',s=>s.tech[id]>=1,supply(8000,20000));
    add('researchTotal10','书院研习','百工争鸣','科技等级总和达到 10','research',s=>technology.reduce((n,id)=>n+s.tech[id],0)>=10,supply(24000,60000),{'speed_research_1h':2});
    add('researchTotal25','书院研习','经略有成','科技等级总和达到 25','research',s=>technology.reduce((n,id)=>n+s.tech[id],0)>=25,supply(40000,100000),{'speed_research_3h':1});
    for(const [id,name,count] of [['spear','长枪兵',30],['shield','刀盾兵',30],['archer','弓箭兵',30],['cavalry','轻骑兵',20],['scout','斥候',5],['wagon','辎重车',5]])
      add('army_'+id,'整军出征',name+'成队','拥有 '+count+' 名'+name+'（驻城、出征和驻军均计入）','army',s=>held(s,id)>=count,supply(10000,24000),{'speed_train_15m':1});
    for(const count of [100,300,1000])add('trained_'+count,'整军出征','练兵里程 · '+count,'累计完成训练 '+count+' 名士兵','army',s=>s.stats.trained>=count,supply(Math.min(40000,count*80),count*180),{'speed_train_1h':1});
    add('scouted3','征战里程','知己知彼','累计完成 3 次侦察','world',s=>metric(s,'scout')>=3,supply(8000,20000));
    add('claimWild','征战里程','开拓疆土','占领任意 1 块网格野地','world',s=>Object.keys(s.landClaims).length>=1,supply(15000,40000));
    for(const [id,name] of [['wood','青竹林'],['pass','白石隘口'],['mine','赤铁山']])add('conquest_'+id,'征战里程','攻取'+name,'掠夺或占领'+name+'并获胜','world',s=>!!(s.raided[id]||s.conquered[id]),supply(12000,30000));
    for(const count of [25,50,100])add('victories_'+count,'征战里程','百战功勋 · '+count,'累计赢得 '+count+' 场战斗','world',s=>s.stats.victories>=count,supply(count*1000,count*4000),{'goldBrick':1});
    add('captureFirst','征战里程','收容降卒','战斗胜利后累计获得 1 名俘虏','world',s=>metric(s,'capture')>=1,supply(10000,30000));
    add('recruitCaptives10','征战里程','化敌为友','累计招降 10 名俘虏','captives',s=>metric(s,'captive_recruit')>=10,supply(15000,40000));
    // Longer development routes: each goal uses a mechanic already playable in PVE.
    for(const [id,name] of [['house','民房'],['barracks','军营'],['drill','校场'],['academy','书院'],['warehouse','仓库'],['market','市场'],['inn','客栈'],['stable','马厩'],['workshop','工匠作坊'],['wall','城墙']])
      for(const level of [3,5,8])add('expand_'+id+'_'+level,'城池经营',name+'扩建 · '+level+'级','任意'+name+'达到 '+level+' 级','inner',s=>s.buildings[id]>=level,supply(level*8000,level*24000),{['speed_build_'+(level>=8?'3h':'1h')]:1});
    for(const [id,name] of [['farm','农田'],['lumber','伐木场'],['quarry','采石场'],['mine','铁矿']])
      for(const level of [2,5])add('develop_field_'+id+'_'+level,'城池经营',name+'升级 · '+level+'级','任意'+name+'达到 '+level+' 级','outer',s=>s.plots.some(p=>p.type===id&&p.level>=level),supply(level*6000,level*16000));
    for(const level of [6,8,10])add('hall_'+level,'城池经营','州县经略 · 官府'+level+'级','官府达到 '+level+' 级','inner',s=>s.buildings.hall>=level,supply(level*10000,level*30000),{speed_build_3h:1});
    for(const count of [12,20,39])add('fields_'+count,'城池经营','阡陌纵横 · '+count+'块','完成 '+count+' 块任意资源田','outer',s=>s.plots.filter(p=>p.type).length>=count,supply(count*2000,count*5000));
    for(const count of [50,200])add('defenses_'+count,'城池经营','城防工事 · '+count,'拥有 '+count+' 件已建成的城防工事','defense',s=>Object.values(s.defenses).reduce((n,v)=>n+v,0)>=count,supply(count*200,count*600));
    const introductory=new Set(['plant','logging','mining','smelting','combat','shooting','construction']);
    for(const id of technology.filter(id=>!introductory.has(id))){const name=ManualData.technology[id].name;
      add('study_'+id,'书院研习',name+'入门',name+'达到 1 级','research',s=>s.tech[id]>=1,supply(10000,25000),{speed_research_15m:1});
    }
    for(const id of ['plant','logging','mining','smelting','combat','protection','shooting','training'])
      for(const level of [3,5]){const name=ManualData.technology[id].name;add('specialize_'+id+'_'+level,'书院研习',name+'专精 · '+level+'级',name+'达到 '+level+' 级','research',s=>s.tech[id]>=level,supply(level*10000,level*30000),{speed_research_1h:1});}
    for(const count of [50,100])add('researchTotal'+count,'书院研习','群贤论道 · '+count,'科技等级总和达到 '+count,'research',s=>technology.reduce((n,id)=>n+s.tech[id],0)>=count,supply(count*1200,count*3000),{speed_research_3h:1});
    for(const [id,count] of [['worker',50],['militia',100],['heavy',20],['ballista',5],['ram',5],['catapult',5]]){const name=ManualData.units[id].name;
      add('army_'+id,'整军出征',name+'成队','拥有 '+count+' 名'+name+'（驻城、出征和驻军均计入）','army',s=>held(s,id)>=count,supply(20000,50000),{speed_train_1h:1});
    }
    add('formation_front','整军出征','坚阵护军','拥有长枪兵与刀盾兵合计 100 名','army',s=>held(s,'spear')+held(s,'shield')>=100,supply(24000,60000));
    add('formation_archer','整军出征','百弓齐发','拥有 100 名弓箭兵','army',s=>held(s,'archer')>=100,supply(24000,60000));
    add('formation_cavalry','整军出征','骑阵成军','拥有轻骑兵与铁骑兵合计 50 名','army',s=>held(s,'cavalry')+held(s,'heavy')>=50,supply(30000,75000));
    add('formation_mixed','整军出征','步弓骑协同','同时拥有长枪兵、刀盾兵、弓箭兵、轻骑兵各 20 名','army',s=>['spear','shield','archer','cavalry'].every(id=>held(s,id)>=20),supply(32000,80000),{speed_train_1h:2});
    for(const count of [2000,5000,10000])add('trained_'+count,'整军出征','大军操练 · '+count,'累计完成训练 '+count+' 名士兵','army',s=>s.stats.trained>=count,supply(Math.floor(count*20),count*60),{speed_train_3h:1});
    add('generalLevel5','整军出征','将才初显','任意帐下将领达到 5 级','heroes',s=>s.generals.some(id=>s.generalLevels[id]>=5),supply(30000,80000));
    for(const count of [200,500])add('victories_'+count,'征战里程','千军破阵 · '+count,'累计赢得 '+count+' 场战斗','world',s=>s.stats.victories>=count,supply(count*400,count*1500),{goldBrickLarge:1});
    for(const count of [10,50,200])add('captured_'+count,'征战里程','收容降卒 · '+count,'累计在战斗中获得 '+count+' 名俘虏','world',s=>metric(s,'capture')>=count,supply(count*400+10000,count*1000+20000));
    for(const count of [50,200])add('captiveRecruit_'+count,'征战里程','降卒归心 · '+count,'累计招降 '+count+' 名俘虏','captives',s=>metric(s,'captive_recruit')>=count,supply(count*400,count*1200));
    // Refreshed wild tiles take new levels; only the battle metric or a claim counts for them.
    for(const level of [3,5,8])add('victoryLevel_'+level,'征战里程','攻坚克敌 · '+level+'级','战胜任意 '+level+' 级或更高等级的野地／据点','world',s=>metric(s,'win_level_'+level)>0||Object.keys(s.raided).some(id=>Math.max(s.landClaims[id]?.level||0,id.startsWith('wild_')?0:Game.getNode(id)?.level||0)>=level),supply(level*14000,level*40000),{speed_train_1h:1});
    for(const count of [3,5])add('wildClaims_'+count,'征战里程','据土守疆 · '+count,'同时拥有 '+count+' 块网格野地','world',s=>Object.keys(s.landClaims).length>=count,supply(count*15000,count*40000));
    for(const count of [10,30])add('scouted_'+count,'征战里程','斥候经略 · '+count,'累计完成 '+count+' 次侦察','world',s=>metric(s,'scout')>=count,supply(count*1000,count*3000));
    add('countyAccess','征战里程','进军县城','完成黄巾史诗，开启县城攻打；旧档保留权限也可完成','epic',s=>Progression.countyUnlocked(s),supply(60000,180000),{speed_train_3h:1});
    add('raidStone50000','征战里程','缴石筑城','累计通过掠夺实际入库 50,000 石料','world',s=>metric(s,'raid_stone')>=50000,supply(40000,100000));
    // Every growth reward includes stone; construction receives extra building material.
    for(const m of missions){
      const base=Math.max(m.reward.stone||0,m.reward.food||0,m.reward.wood||0,m.reward.iron||0);
      m.reward.stone=Math.ceil(base*(['立城补给','城池经营'].includes(m.stage)?this.constructionStoneFactor:1));
      const economy=['立城补给','城池经营','书院研习','整军出征'].includes(m.stage);
      if(economy){
        const hall=/^hall_(\d+)$/.test(m.id),advanced=/^expand_.+_(5|8)$/.test(m.id)||/^specialize_.+_5$/.test(m.id)||/^researchTotal(25|50|100)$/.test(m.id)||/^trained_(1000|2000|5000|10000)$/.test(m.id)||['formation_front','formation_archer','formation_cavalry','formation_mixed'].includes(m.id),rule=this.missionTuning[hall?'hall':advanced?'advanced':'opening'];
        m.reward=Object.fromEntries(Object.entries(m.reward).map(([id,n])=>[id,Math.round(n*(id==='gold'?rule.gold:rule.resources))]));
        // Put the final hall's trade budget before construction rather than
        // awarding money only after the expensive project has been paid for.
        if(m.id==='hall_8'){m.reward.gold+=300000;m.desc+='；备齐后续官府工程的市场采购资金';}
        if(m.id==='hall_10')m.reward.gold=0;
      }
    }
  }
};
for(const brick of RewardData.goldBricks)ManualData.shop.push({...brick,category:'黄金补给',effect:'gold',seconds:0,trialPrice:true,trialEffect:true,desc:'使用后获得 '+brick.gold.toLocaleString('zh-CN')+' 黄金，可暂时超过官府黄金容量。'});


// SOURCE: progression.js
'use strict';
// Source rules and prototype thresholds are documented in RULES.md.
const Progression = (() => {
  const DAY=86400000, REFILL=7200000, SERVER_OFFSET=8*3600000;
  // China server day starts at 05:00, independent of the device time zone.
  const period=now=>Math.floor((now+SERVER_OFFSET-5*3600000)/DAY)*DAY-SERVER_OFFSET+5*3600000;
  const jewels={pearl:{name:'珍珠',prestige:1000,points:1},coral:{name:'珊瑚',prestige:1200,points:1},glass:{name:'琉璃',prestige:1500,points:1},amber:{name:'琥珀',prestige:2000,points:2},agate:{name:'玛瑙',prestige:2500,points:2},crystal:{name:'水晶',prestige:3000,points:2},jadeite:{name:'翡翠',prestige:3500,points:3},jade:{name:'玉石',prestige:4000,points:4},nightPearl:{name:'夜明珠',prestige:5000,points:5}};
  const resourceDonations={food:{amount:100000,prestige:1000},wood:{amount:100000,prestige:1500},stone:{amount:100000,prestige:2000},iron:{amount:100000,prestige:2500},gold:{amount:100000,prestige:3000}};
  const troopDonations={militia:{amount:2000,prestige:2000,points:1},spear:{amount:1500,prestige:2000,points:2},shield:{amount:1200,prestige:2000,points:2},archer:{amount:1000,prestige:3000,points:2},cavalry:{amount:750,prestige:3500,points:3},heavy:{amount:500,prestige:4500,points:4},ballista:{amount:300,prestige:5000,points:5},ram:{amount:200,prestige:5500,points:6},catapult:{amount:100,prestige:6000,points:8}};
  const targets={kills:1500,troops:2,treasures:2}; // Personal PVE completion totals: trial values.
  const BOARD_SIZE=24, ACCEPT_LIMIT=12;
  const fixedMetrics=['build','research','civic','item','victory','field_build','comfort','levy','occupy','city_build','research_production','research_military','wild_victory','siege_victory','win_level_3','win_level_5'];
  const metricIds=[...new Set(['build','field_build','train','train_archer','train_cavalry','research','victory','kill','occupy','raid_food','raid_wood','raid_stone','raid_iron','raid_gold','scout','civic','comfort','levy','item','defense','trade','capture','captive_recruit',...Object.keys(ManualData.units).map(id=>'train_'+id),'city_build','research_production','research_military','wild_victory','siege_victory','win_level_3','win_level_5','win_level_8','trade_buy','trade_sell'])];
  const researchGroups={production:['plant','logging','mining','smelting'],military:['combat','protection','shooting','training','march','riding','load','leadership','manufacture','fortification','repair','plunder','supply','scouting']};
  const researchMetric=id=>Object.entries(researchGroups).find(([,ids])=>ids.includes(id))?.[0];
  const milestones=[{count:3,resources:10000,gold:25000,items:{speed_build_15m:2}},{count:6,resources:20000,gold:50000,items:{speed_research_1h:1}},{count:10,resources:35000,gold:80000,items:{goldBrick:1,speed_train_1h:1}}];
  const templates=[
    {id:'build',title:'修整城坊',desc:'接取后完成建筑或资源田建设／升级',metric:'build',amount:2,route:'inner'},
    {id:'train',title:'乡勇集结',desc:'接取后完成士兵训练',metric:'train',amount:30,route:'army'},
    {id:'research',title:'研习兵法',desc:'接取后完成科技研究',metric:'research',amount:1,route:'research'},
    {id:'victory',title:'扫荡贼寇',desc:'接取后赢得野地或据点战斗',metric:'victory',amount:1,route:'world'},
    {id:'raid',title:'缴获军粮',desc:'接取后通过掠夺实际收入仓库的粮食',metric:'raid_food',amount:500,route:'world'},
    {id:'scout',title:'探明敌情',desc:'接取后成功侦察目标',metric:'scout',amount:2,route:'world'},
    {id:'civic',title:'安定民生',desc:'接取后执行安抚或征收指令',metric:'civic',amount:1,route:'civic'},
    {id:'item',title:'整备军资',desc:'接取后成功使用宝物',metric:'item',amount:1,route:'inventory'},
    ...['food','wood','stone','iron','gold'].map(resource=>({id:'donate_'+resource,title:({food:'支援军粮',wood:'征集木料',stone:'修城石料',iron:'军械铁料',gold:'犒赏军士'})[resource],desc:'交付现有物资，接取前积攒的库存也可使用',resource,amount:2000,route:'stock'}))
  ];
  templates.push(
    {id:'fields',title:'拓展资源田',desc:'接取后完成城外资源田建设或升级',metric:'field_build',amount:2,route:'outer'},
    {id:'kills',title:'击破敌阵',desc:'接取后在获胜战斗中击败敌军',metric:'kill',amount:30,route:'world'},
    {id:'occupy',title:'拓土守疆',desc:'接取后首次占领一个野地、据点或县城',metric:'occupy',amount:1,route:'world'},
    {id:'comfort',title:'抚恤百姓',desc:'接取后执行一次赈灾、祈福或增丁',metric:'comfort',amount:1,route:'civic'},
    {id:'levy',title:'征集军资',desc:'接取后执行一次资源或黄金征收',metric:'levy',amount:1,route:'civic'},
    {id:'defense',title:'修筑防线',desc:'接取后完成城防工事建设',metric:'defense',amount:3,route:'defense'},
    {id:'trade',title:'往来商旅',desc:'接取后在市场买卖资源',metric:'trade',amount:2000,route:'market'},
    {id:'capture',title:'俘获降卒',desc:'接取后在获胜战斗中获得俘虏',metric:'capture',amount:3,route:'world'},
    {id:'recruitCaptives',title:'收编降卒',desc:'接取后从俘虏营招降士兵',metric:'captive_recruit',amount:3,route:'captives'},
    {id:'archers',title:'弓阵集训',desc:'接取后完成弓箭兵训练',metric:'train_archer',amount:15,route:'army'},
    {id:'cavalry',title:'骑兵集训',desc:'接取后完成轻骑兵训练',metric:'train_cavalry',amount:10,route:'army'},
    ...['wood','stone','iron'].map(resource=>({id:'raid_'+resource,title:({wood:'夺取木料',stone:'缴获石料',iron:'夺取铁料'})[resource],desc:'接取后通过掠夺实际收入仓库的'+({wood:'木材',stone:'石料',iron:'铁锭'})[resource],metric:'raid_'+resource,amount:500,route:'world'}))
  );
  templates.push(
    ...[['militia',30],['spear',20],['shield',20],['heavy',10],['worker',20],['wagon',5],['ballista',3],['ram',3],['catapult',3]].map(([unit,amount])=>({id:'train_'+unit,title:ManualData.units[unit].name+'操练',desc:'接取后完成'+ManualData.units[unit].name+'训练',metric:'train_'+unit,unit,amount,route:'army'})),
    {id:'wildVictory',title:'肃清乡野',desc:'接取后赢得网格野地战斗',metric:'wild_victory',worldType:'wild',amount:1,route:'world'},
    {id:'siegeVictory',title:'城下立功',desc:'接取后赢得县城掠夺或占领战斗',metric:'siege_victory',worldType:'siege',amount:1,route:'world'},
    {id:'highVictory3',title:'攻克强敌',desc:'接取后战胜 3 级或更高等级目标',metric:'win_level_3',worldType:'combat',minLevel:3,amount:1,route:'world'},
    {id:'highVictory5',title:'破阵夺旗',desc:'接取后战胜 5 级或更高等级目标',metric:'win_level_5',worldType:'combat',minLevel:5,amount:1,route:'world'},
    {id:'cityBuild',title:'修缮城内',desc:'接取后完成城内建筑建设或升级',metric:'city_build',amount:2,route:'inner'},
    {id:'productionResearch',title:'农工技艺',desc:'接取后完成种植、砍伐、挖掘或冶炼科技研究',metric:'research_production',researchGroup:'production',amount:1,route:'research'},
    {id:'militaryResearch',title:'军备研习',desc:'接取后完成军事类科技研究',metric:'research_military',researchGroup:'military',amount:1,route:'research'},
    {id:'tradeBuy',title:'采购军需',desc:'接取后在市场用黄金购买资源',metric:'trade_buy',market:true,amount:2000,route:'market'},
    {id:'tradeSell',title:'调剂库存',desc:'接取后在市场卖出资源换黄金',metric:'trade_sell',market:true,amount:2000,route:'market'}
  );
  function tier(s){return s.prestige>=32000?4:s.prestige>=8000?3:s.prestige>=1000?2:1;}
  function unlocked(s,t){
    if(t.unit){const req=ManualData.units[t.unit].requires;return Object.entries(req.buildings).every(([id,n])=>s.buildings[id]>=n)&&Object.entries(req.tech).every(([id,n])=>s.tech[id]>=n);}
    if(t.researchGroup)return s.buildings.academy>=1&&researchGroups[t.researchGroup].some(id=>s.tech[id]<10);
    if(t.market)return s.buildings.market>=1;
    if(t.worldType){if(s.buildings.drill<1||s.buildings.barracks<1)return false;if(t.worldType==='siege')return countyUnlocked(s);return !t.minLevel||s.stats.victories>=t.minLevel;}
    if(['victory','raid','kills','occupy','capture'].includes(t.id)||t.id.startsWith('raid_'))return s.buildings.drill>=1&&s.buildings.barracks>=1;
    if(t.id==='train')return s.buildings.barracks>=1;
    if(t.id==='research')return s.buildings.academy>=1;
    if(t.id==='scout')return s.army.scout>0;
    if(t.id==='defense')return s.buildings.wall>=1;
    if(t.id==='trade')return s.buildings.market>=1;
    if(t.id==='recruitCaptives')return Object.values(s.captives||{}).some(n=>n>0);
    if(['archers','cavalry'].includes(t.id)){const req=ManualData.units[t.id==='archers'?'archer':'cavalry'].requires;return Object.entries(req.buildings).every(([id,n])=>s.buildings[id]>=n)&&Object.entries(req.tech).every(([id,n])=>s.tech[id]>=n);}
    return true;
  }
  function makeTask(s,index){const d=s.daily,level=tier(s),seed=Math.floor(d.start/DAY),pool=templates.filter(t=>unlocked(s,t)),unique=pool.filter(t=>!d.tasks.some(x=>x.template===t.id)),choices=unique.length?unique:pool,template=choices[((seed+index*7)%choices.length+choices.length)%choices.length];return {uid:d.start+'_'+index,template:template.id,target:template.amount*(fixedMetrics.includes(template.metric)?1:level),progress:0,status:'available',acceptedAt:0,tier:level};}
  function freshDaily(s,now){s.daily={start:period(now),refillAt:period(now),serial:0,tasks:[],claimed:0,exchangeClaims:[],milestoneClaims:[],brickPurchases:Object.fromEntries(RewardData.goldBricks.map(b=>[b.id,0])),rulesVersion:3};for(let i=0;i<BOARD_SIZE;i++)s.daily.tasks.push(makeTask(s,s.daily.serial++));}
  function init(s,now=Date.now()){
    if(s.activityMetrics===undefined)s.activityMetrics=Object.fromEntries(metricIds.map(id=>[id,0]));
    else if(s.activityMetrics&&typeof s.activityMetrics==='object')for(const id of metricIds)if(s.activityMetrics[id]===undefined)s.activityMetrics[id]=0;
    if(s.daily&&s.daily.milestoneClaims===undefined)s.daily.milestoneClaims=[];
    if(s.daily&&s.daily.brickPurchases===undefined)s.daily.brickPurchases=Object.fromEntries(RewardData.goldBricks.map(b=>[b.id,0]));
    if(s.daily&&(s.daily.rulesVersion===undefined||s.daily.rulesVersion<3)){s.daily.rulesVersion=3;while(s.daily.tasks.filter(t=>t.status==='available').length<BOARD_SIZE)s.daily.tasks.push(makeTask(s,s.daily.serial++));}
    if(s.progressionSchema===1)return;
    // One-time estimate preserves existing development; no old rewards are reissued.
    s.prestige=Math.floor((s.cityLevels||[]).reduce((n,l)=>n+l*l*50,0)+(s.plots||[]).reduce((n,p)=>n+p.level*p.level*50,0)+Object.values(s.tech||{}).reduce((n,l)=>n+l*l*100,0)+(s.stats?.trained||0)/5+(s.stats?.victories||0)*100+(s.missionClaims||[]).length*300);
    s.copper=0;s.jewels=Object.fromEntries(Object.keys(jewels).map(id=>[id,0]));
    s.epic={kills:0,killRewards:0,resources:Object.fromEntries(Object.keys(resourceDonations).map(id=>[id,0])),troops:0,treasures:0,legacyAccess:!!(s.conquered?.fort||s.raided?.fort||s.battle?.node==='fort'||[s.expedition,...(s.expeditions||[])].some(e=>e?.node==='fort'))};
    s.progressionSchema=1;freshDaily(s,now);
  }
  function ensureDaily(s,now=Date.now()){
    if(period(now)>s.daily.start)freshDaily(s,now);
    if(now<s.daily.start)return;
    const d=s.daily,steps=Math.max(0,Math.floor((now-d.refillAt)/REFILL));d.refillAt+=steps*REFILL;
    const count=Math.min(steps,BOARD_SIZE-d.tasks.filter(t=>t.status==='available').length);
    for(let i=0;i<count;i++)d.tasks.push(makeTask(s,d.serial++));
  }
  const definition=t=>templates.find(x=>x.id===t.template);
  const taskReady=(s,t)=>t.status==='accepted'&&(definition(t).resource?s.res[definition(t).resource]>=t.target:t.progress>=t.target);
  function record(s,metric,amount=1,at=Date.now()){
    if(metricIds.includes(metric))s.activityMetrics[metric]+=amount;
    ensureDaily(s,at);if(at<s.daily.start)return;
    for(const t of s.daily.tasks)if(t.status==='accepted'&&at>=t.acceptedAt&&definition(t).metric===metric)t.progress=Math.min(t.target,t.progress+amount);
  }
  function reward(t){const def=definition(t),combat=['victory','kill','occupy','capture','wild_victory','siege_victory','win_level_3','win_level_5'].includes(def.metric)||def.metric?.startsWith('raid_'),level=t.tier,amount=(combat?10000:def.resource?6000:8000)*level;
    const stone=Math.ceil(amount*(['build','field_build','city_build'].includes(def.metric)?RewardData.constructionStoneFactor:1));
    return {prestige:300*level,copper:40*level,gold:(combat?20000:12000)*level,resources:{food:amount,wood:amount,stone,iron:amount}};
  }
  function taskItem(s,t){const items=ManualData.shop.filter(i=>i.effect&&!i.rewardOnly),index=Number(t.uid.split('_')[1]);return items[((Math.floor(s.daily.start/DAY)+index)%items.length+items.length)%items.length];}
  function accept(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||t.status!=='available')return '该任务已刷新或已接取';
    if(s.daily.tasks.filter(t=>t.status==='accepted').length>=ACCEPT_LIMIT)return '最多同时接取 '+ACCEPT_LIMIT+' 项任务';
    t.status='accepted';t.acceptedAt=now;return null;
  }
  function abandon(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||t.status!=='accepted')return '任务已刷新或未接取';
    s.daily.tasks=s.daily.tasks.filter(task=>task!==t);return null;
  }
  function claim(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||!taskReady(s,t))return '任务尚未完成或已经刷新';
    const def=definition(t),r=reward(t);if(def.resource)s.res[def.resource]-=t.target;
    s.prestige+=r.prestige;s.copper+=r.copper;s.res.gold+=r.gold;
    for(const [id,n] of Object.entries(r.resources))s.res[id]+=n;
    const item=taskItem(s,t);s.inventory[item.id]=(s.inventory[item.id]||0)+1;
    s.daily.claimed++;s.daily.tasks=s.daily.tasks.filter(task=>task!==t);return null;
  }
  function claimMilestone(s,count,now=Date.now()){ensureDaily(s,now);const m=milestones.find(m=>m.count===count);if(!m)return '奖励不存在';if(s.daily.milestoneClaims.includes(count))return '今日奖励已领取';if(s.daily.claimed<count)return '今日完成任务数量不足';
    for(const id of ['food','wood','stone','iron'])s.res[id]+=m.resources;s.res.gold+=m.gold;
    for(const [id,n] of Object.entries(m.items))s.inventory[id]=(s.inventory[id]||0)+n;s.daily.milestoneClaims.push(count);return null;
  }
  function claimReady(s,now=Date.now()){ensureDaily(s,now);let count=0;for(const t of [...s.daily.tasks])if(taskReady(s,t)){const error=claim(s,t.uid,now);if(!error)count++;}return count?null:'暂无已完成的每日任务';}
  const groups=s=>[
    {id:'kills',name:'讨伐黄巾',progress:Math.min(1,s.epic.kills/targets.kills),detail:'掠夺野地或地图据点胜利可缴获黄巾头巾；县城、黄巾城等城池掠夺不计头巾。已缴获 '+s.epic.kills+' / '+targets.kills+' 件头巾'},
    {id:'resources',name:'捐献军资',progress:Object.values(s.epic.resources).reduce((n,v)=>n+v,0)/500000,detail:'五种物资各捐献 100,000，合计 500,000'},
    {id:'troops',name:'王于兴师',progress:Math.min(1,s.epic.troops/targets.troops),detail:'勤王诏 '+s.epic.troops+' / '+targets.troops+' · 捐献士兵后离开你的军队'},
    {id:'treasures',name:'进献珍宝',progress:Math.min(1,s.epic.treasures/targets.treasures),detail:'贡品录 '+s.epic.treasures+' / '+targets.treasures+' · 珍宝由战斗掉落／铜钱兑换获得'}
  ];
  const countyUnlocked=s=>s.epic.legacyAccess||groups(s).every(g=>g.progress>=1);
  function donationQuote(s,kind,id){
    let cost=0,prestige=0,points=0,reason='';
    if(kind==='resource'&&resourceDonations[id]){const d=resourceDonations[id];cost=d.amount;prestige=d.prestige;if(s.epic.resources[id]>=d.amount)reason='该物资已完成捐献';else if(s.res[id]<cost)reason='库存不足 '+cost;}
    else if(kind==='troop'&&troopDonations[id]){const d=troopDonations[id];cost=d.amount;prestige=d.prestige;points=d.points;if(s.epic.troops>=targets.troops)reason='王于兴师已完成';else if(s.army[id]<cost)reason='驻城兵力不足 '+cost;}
    else if(kind==='jewel'&&jewels[id]){cost=10;prestige=jewels[id].prestige;points=jewels[id].points;if(s.epic.treasures>=targets.treasures)reason='进献珍宝已完成';else if(s.jewels[id]<cost)reason='珍宝不足 10 枚';}
    else reason='捐献项目不存在';
    return {kind,id,cost,prestige,points,reason};
  }
  function donate(s,kind,id){const q=donationQuote(s,kind,id);if(q.reason)return q.reason;
    if(kind==='resource'){s.res[id]-=q.cost;s.epic.resources[id]+=q.cost;}
    if(kind==='troop'){s.army[id]-=q.cost;s.epic.troops+=q.points;}
    if(kind==='jewel'){s.jewels[id]-=q.cost;s.epic.treasures+=q.points;}
    s.prestige+=q.prestige;return null;
  }
  function battle(s,n,b,won,received){
    const before=s.prestige,kills=b.enemy.reduce((sum,r)=>sum+r.initial-Math.ceil(r.hp/r.stats.hp),0),loss=b.player.reduce((sum,r)=>sum+r.initial-Math.ceil(r.hp/r.stats.hp),0);
    s.prestige=Math.max(0,s.prestige+(won?100*n.level+Math.floor(kills/5):-Math.max(20,Math.floor(loss/5))));
    const jewelDrops={};if(won){record(s,'victory');record(s,'kill',kills);if(n.wild)record(s,'wild_victory');if(n.terrain==='fort')record(s,'siege_victory');for(const level of [3,5,8])if(n.level>=level)record(s,'win_level_'+level);if(b.mode==='raid'){for(const [id,count] of Object.entries(received))record(s,'raid_'+id,count);if(!n.terrain||n.terrain!=='fort'){s.epic.kills=Math.min(targets.kills,s.epic.kills+kills);const batches=Math.floor(s.epic.kills/500);s.prestige+=(batches-s.epic.killRewards)*500;s.epic.killRewards=batches;}}
      // Prototype drops: a low-tier pearl every win, plus a rarer jewel at higher levels.
      jewelDrops.pearl=1;if(Math.random()<Math.min(.5,n.level*.05)){const choices=Object.keys(jewels).slice(1,Math.min(9,n.level+2));jewelDrops[choices[Math.floor(Math.random()*choices.length)]]=1;}
      for(const [id,count] of Object.entries(jewelDrops))s.jewels[id]+=count;
    }
    return {prestigeDelta:s.prestige-before,jewelDrops};
  }
  function exchangeOffers(s){const available=ManualData.shop.filter(i=>i.effect&&!i.rewardOnly),seed=Math.floor(s.daily.start/DAY);return [{id:'pearl',name:'珍珠 ×1',cost:40},...Array.from({length:3},(_,i)=>{const item=available[(seed+i*5)%available.length];return {id:item.id,name:item.name+' ×1',cost:Math.max(20,Math.ceil(item.price/5))};})];}
  function exchange(s,id,now=Date.now()){
    ensureDaily(s,now);const offer=exchangeOffers(s).find(x=>x.id===id);if(!offer)return '商品已刷新';
    if(s.buildings.inn<1)return '需要 1 级客栈';if(s.daily.exchangeClaims.filter(x=>x===id).length>=(id==='pearl'?10:1))return '今日兑换次数已用完';if(s.copper<offer.cost)return '铜钱不足';
    s.copper-=offer.cost;if(id==='pearl')s.jewels.pearl++;else s.inventory[id]=(s.inventory[id]||0)+1;s.daily.exchangeClaims.push(id);return null;
  }
  function valid(s){
    const int=n=>Number.isSafeInteger(n)&&n>=0,object=o=>o&&typeof o==='object'&&!Array.isArray(o);
    if(s.progressionSchema!==1||!int(s.prestige)||!int(s.copper)||!object(s.jewels)||Object.keys(s.jewels).length!==Object.keys(jewels).length||!Object.keys(jewels).every(id=>int(s.jewels[id])))return false;
    if(!object(s.activityMetrics)||Object.keys(s.activityMetrics).length!==metricIds.length||!metricIds.every(id=>int(s.activityMetrics[id])))return false;
    const e=s.epic;if(!object(e)||!int(e.kills)||e.kills>targets.kills||e.killRewards!==Math.floor(e.kills/500)||!int(e.troops)||!int(e.treasures)||typeof e.legacyAccess!=='boolean'||!object(e.resources)||Object.keys(e.resources).length!==5||!Object.keys(resourceDonations).every(id=>[0,100000].includes(e.resources[id])))return false;
    if(!object(s.daily)||!object(s.daily.brickPurchases)||Object.keys(s.daily.brickPurchases).length!==RewardData.goldBricks.length||!RewardData.goldBricks.every(b=>int(s.daily.brickPurchases[b.id])&&s.daily.brickPurchases[b.id]<=RewardData.dailyBrickLimit))return false;
    const d=s.daily;if(!object(d)||d.rulesVersion!==3||!Array.isArray(d.milestoneClaims)||new Set(d.milestoneClaims).size!==d.milestoneClaims.length||!d.milestoneClaims.every(n=>milestones.some(m=>m.count===n)&&n<=d.claimed)||!int(d.start)||period(d.start)!==d.start||!int(d.refillAt)||d.refillAt<d.start||d.refillAt>=d.start+DAY||!int(d.serial)||d.serial>1000||!int(d.claimed)||d.claimed>1000||!Array.isArray(d.exchangeClaims)||d.exchangeClaims.length>10+ManualData.shop.filter(i=>i.effect).length||!d.exchangeClaims.every(id=>id==='pearl'||ManualData.shop.some(i=>i.id===id&&i.effect))||d.exchangeClaims.some(id=>d.exchangeClaims.filter(v=>v===id).length>(id==='pearl'?10:1))||!Array.isArray(d.tasks)||d.tasks.length>BOARD_SIZE+ACCEPT_LIMIT||new Set(d.tasks.map(t=>t.uid)).size!==d.tasks.length)return false;
    if(d.tasks.filter(t=>t.status==='available').length>BOARD_SIZE||d.tasks.filter(t=>t.status==='accepted').length>ACCEPT_LIMIT)return false;
    return d.tasks.every(t=>object(t)&&typeof t.uid==='string'&&/^\d+_\d+$/.test(t.uid)&&t.uid.startsWith(d.start+'_')&&definition(t)&&int(t.target)&&t.target>0&&int(t.progress)&&t.progress<=t.target&&['available','accepted'].includes(t.status)&&int(t.acceptedAt)&&(t.status==='available'?t.acceptedAt===0:t.acceptedAt>=d.start&&t.acceptedAt<d.start+DAY)&&[1,2,3,4].includes(t.tier)&&t.target===definition(t).amount*(fixedMetrics.includes(definition(t).metric)?1:t.tier));
  }
  return {researchMetric,DAY,REFILL,BOARD_SIZE,ACCEPT_LIMIT,milestones,period,jewels,resourceDonations,troopDonations,targets,templates,init,ensureDaily,record,definition,taskReady,reward,taskItem,accept,abandon,claim,claimMilestone,claimReady,groups,countyUnlocked,donationQuote,donate,battle,exchangeOffers,exchange,valid,tier};
})();


// SOURCE: onboarding-data.js
'use strict';
// Prototype rewards: earned once by hall level, separate from recurring supplies.
const OnboardingData={
  archerTarget:30,
  // Prototype hall pacing before governor, construction technology and game speed.
  // The first two levels retain the reference rules used by the archer route.
  hallSeconds:[1800,3995,9000,18000,36000,72000,126000,198000,288000,396000],
  // Hall 2 is 8 minutes so the second starter supply arrives early (design/balance/opening-pace-2026-10-08.md).
  hallBuildSeconds(level,referenceSeconds){return level===2?480:level<=2?referenceSeconds:this.hallSeconds[level-1]??referenceSeconds;},
  jewels:{min:2,max:5,weights:{pearl:40,coral:25,glass:15,amber:8,agate:5,crystal:3,jadeite:2,jade:1,nightPearl:1}},
  gifts:[
    {level:1,title:'开府建衙',resources:{food:8000,wood:8000,stone:8000,iron:8000,gold:10000},items:{speed_build_15m:6,speed_build_1h:2,population:2}},
    {level:2,title:'筹备弓营',resources:{food:76000,wood:92000,stone:106000,iron:76000,gold:20000},items:{speed_build_1h:12,speed_build_3h:2,speed_research_1h:8,speed_research_3h:2,speed_train_1h:3,population:3}},
    {level:3,title:'步弓协同',resources:{food:80000,wood:80000,stone:120000,iron:80000,gold:30000},items:{speed_build_3h:2,speed_research_3h:3,speed_train_1h:4,population:2}},
    {level:4,title:'整军经略',resources:{food:120000,wood:120000,stone:180000,iron:120000,gold:40000},items:{speed_build_3h:1,speed_research_3h:4,speed_train_3h:3}},
    // Pearl 10 and coral 5 match the jewels needed for the 公士 noble rank, which 伍长 now requires.
    {level:5,title:'百工兴盛',resources:{food:180000,wood:180000,stone:270000,iron:180000,gold:60000},items:{speed_build_8h:2,speed_research_8h:2,speed_train_3h:4,starterJewelBox:1},jewels:{pearl:10,coral:5}},
    {level:6,title:'将才初成',resources:{food:260000,wood:260000,stone:390000,iron:260000,gold:90000},items:{speed_build_8h:2,speed_build_3h:1,speed_research_8h:3,speed_train_8h:2,starterJewelBox:1,starterEquipmentBasic:1}},
    {level:7,title:'城坚兵锐',resources:{food:360000,wood:360000,stone:540000,iron:360000,gold:120000},items:{speed_build_8h:5,speed_research_8h:4,speed_train_8h:3,starterJewelBox:1}},
    {level:8,title:'良将精装',resources:{food:480000,wood:480000,stone:720000,iron:480000,gold:160000},items:{speed_build_8h:8,speed_research_8h:5,speed_train_8h:4,starterJewelBox:1,starterEquipmentFine:1}},
    {level:9,title:'进军州县',resources:{food:620000,wood:620000,stone:930000,iron:620000,gold:200000},items:{speed_build_15_30h:1,speed_build_8h:11,speed_build_15m:1,speed_research_8h:6,speed_train_8h:5,starterJewelBox:2,blueprint:2}},
    {level:10,title:'经略一方',resources:{food:800000,wood:800000,stone:1200000,iron:800000,gold:270000},items:{speed_build_15_30h:4,speed_research_15_30h:2,speed_train_15_30h:2,starterJewelBox:2,starterEquipmentFine:1,blueprint:2}}
  ]
};
ManualData.shop.push(
  {id:'starterJewelBox',name:'珠宝盒',category:'珍宝',effect:'jewelBox',rewardOnly:true,price:0,seconds:0,desc:'打开后随机获得一种珠宝 2–5 枚，数量等概率。种类概率可在开盒界面查看；可用于晋升或史诗进献。'},
  {id:'starterEquipmentBasic',name:'普通装备盒',category:'装备',effect:'equipmentBox',tier:1,rewardOnly:true,price:0,seconds:0,desc:'选择兵器、铠甲、头盔或佩饰，获得一件普通装备；将领 1 级可穿戴。装备库满时保留盒子。'},
  {id:'starterEquipmentFine',name:'精良装备盒',category:'装备',effect:'equipmentBox',tier:2,rewardOnly:true,price:0,seconds:0,desc:'选择兵器、铠甲、头盔或佩饰，获得一件精良装备；将领 5 级可穿戴。装备库满时保留盒子。'}
);


// SOURCE: onboarding-system.js
'use strict';
const OnboardingSystem=(()=>{
  const hallLevel=s=>Math.max(s.buildings.hall,...Object.values(s.realm?.cities||{}).map(c=>c.id===s.realm.activeCity?s.buildings.hall:c.data?.buildings?.hall||0));
  function init(s){if(s.onboarding===undefined)s.onboarding={schema:1,claims:[],hidden:false,lastOpen:null};if(s.onboarding.firstBattle===undefined)s.onboarding.firstBattle=s.stats.victories>0?'complete':'active';if(s.onboarding.jewelClaims===undefined)s.onboarding.jewelClaims=[];}
  function valid(s){const o=s.onboarding;if(!o||o.schema!==1||!['active','complete'].includes(o.firstBattle)||typeof o.hidden!=='boolean'||!Array.isArray(o.claims)||new Set(o.claims).size!==o.claims.length||!o.claims.every(n=>Number.isInteger(n)&&n>=1&&n<=10&&n<=hallLevel(s)))return false;const paid=o.jewelClaims;if(paid!==undefined&&(!Array.isArray(paid)||new Set(paid).size!==paid.length||!paid.every(n=>o.claims.includes(n)&&OnboardingData.gifts.some(g=>g.level===n&&g.jewels))))return false;const r=o.lastOpen;return r===null||!!r&&typeof r==='object'&&(r.kind==='jewel'&&Progression.jewels[r.id]&&Number.isInteger(r.count)&&r.count>=2&&r.count<=5||r.kind==='equipment'&&Number.isSafeInteger(r.id)&&r.id>0&&r.id<=s.equipmentSeq);}
  function completeFirstBattle(s){if(s.onboarding.firstBattle==='complete')return null;if(!Object.keys(s.raided||{}).some(id=>!id.startsWith('wild_')))return '请先完成一次据点出征胜利';if(Game.allExpeditions().length||Object.values(s.garrisons).some(g=>g.phase==='return'))return '请等待出征部队返城';if(s.army.archer<OnboardingData.archerTarget)return '请先将城内弓箭手补至 '+OnboardingData.archerTarget+' 人';s.onboarding.firstBattle='complete';return null;}
  function quote(s,level){const gift=OnboardingData.gifts.find(x=>x.level===level);if(!gift)return null;const resources={...gift.resources};if(level===1)for(const id of Object.keys(resources))resources[id]=Math.max(0,resources[id]-(s.starterGiftVersion>=2?gift.resources[id]:s.starterGiftVersion===1?20000:0));return {...gift,resources,items:{...gift.items},jewels:{...gift.jewels},claimed:s.onboarding.claims.includes(level),unlocked:hallLevel(s)>=level};}
  function available(s){return OnboardingData.gifts.filter(g=>hallLevel(s)>=g.level&&!s.onboarding.claims.includes(g.level));}
  function award(s,q){for(const [id,n]of Object.entries(q.resources))s.res[id]+=n;for(const [id,n]of Object.entries(q.items))s.inventory[id]=(s.inventory[id]||0)+n;for(const [id,n]of Object.entries(q.jewels))s.jewels[id]+=n;if(Object.keys(q.jewels).length)s.onboarding.jewelClaims.push(q.level);if(q.level===1){s.starterGiftVersion=2;s.starterGiftClaimed=true;}s.onboarding.claims.push(q.level);}
  function claim(level){Game.tick(Date.now(),false);const s=Game.state,q=quote(s,level);if(!q)return '请选择 1–10 阶礼包';if(q.claimed)return '这一阶礼包已领取';if(!q.unlocked)return '需要官府 '+level+' 级';award(s,q);Game.save();return null;}
  function claimAvailable(){Game.tick(Date.now(),false);const s=Game.state,ready=available(s).map(g=>quote(s,g.level));if(!ready.length)return '当前没有可领取的礼包';for(const q of ready)award(s,q);Game.save();return null;}
  function openItem(id,slot){const s=Game.state,item=ManualData.shop.find(x=>x.id===id);if(!(s.inventory[id]>0))return '没有可开启的盒子';if(item?.effect==='jewelBox'){const spec=OnboardingData.jewels;let roll=Math.random()*Object.values(spec.weights).reduce((a,b)=>a+b,0),jewel=Object.keys(spec.weights).at(-1);for(const [key,w]of Object.entries(spec.weights)){roll-=w;if(roll<0){jewel=key;break;}}const count=spec.min+Math.floor(Math.random()*(spec.max-spec.min+1));s.jewels[jewel]+=count;s.onboarding.lastOpen={kind:'jewel',id:jewel,count};}else if(item?.effect==='equipmentBox'){if(!Object.hasOwn(HeroSystem.slots,slot))return '请选择装备部位';if(s.equipment.length>=s.equipmentCapacity)return '装备库已满，盒子已保留，请先整理装备';const e=HeroSystem.addEquipment(s,slot,item.tier);s.onboarding.lastOpen={kind:'equipment',id:e.id};}else return '请选择珠宝盒或装备盒';s.inventory[id]--;Progression.record(s,'item');Game.save();return null;}
  function hide(hidden){Game.state.onboarding.hidden=!!hidden;Game.save();}
  return {init,valid,quote,available,claim,claimAvailable,openItem,hide,completeFirstBattle};
})();


// SOURCE: governance-system.js
'use strict';
// Original-rule structure; costs, grace periods and event values are trial parameters.
const GovernanceSystem=(()=>{
 const HOUR=3600000,DAY=24*HOUR,object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0,time=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER,clone=x=>JSON.parse(JSON.stringify(x));
 const protectedHeroes=new Set(['lin','su']);
 const events=[{id:'drought',name:'旱情',bad:true,resource:'food'},{id:'fire',name:'库房失火',bad:true,resource:'wood'},{id:'harvest',name:'丰收',bad:false,resource:'food'},{id:'donation',name:'商旅献资',bad:false,resource:'gold'}];
 const record=(ledger,entry)=>{ledger.log.unshift(entry);ledger.log=ledger.log.slice(0,40);};
 function initCity(s,now=Date.now()){
  if(s.governance===undefined)s.governance={version:1,last:now,crisisSince:0,starvedSince:0,eventsEnabled:false,autoRelief:false,nextEvent:0,eventSeq:0,wardUntil:0,blessingUntil:0,log:[]};
 }
 function init(s,now=Date.now()){
  initCity(s,now);
  if(s.heroService===undefined)s.heroService={version:1,lastPay:now,owed:{},pending:[],captives:[],seq:0,log:[]};
 }
 function validCity(s){const c=s.governance;return object(c)&&c.version===1&&['last','crisisSince','starvedSince','nextEvent','wardUntil','blessingUntil'].every(k=>time(c[k]))&&int(c.eventSeq)&&typeof c.eventsEnabled==='boolean'&&typeof c.autoRelief==='boolean'&&Array.isArray(c.log)&&c.log.length<=40&&c.log.every(r=>object(r)&&time(r.at)&&typeof r.text==='string'&&r.text.length<=500);}
 function valid(s){
  const h=s.heroService;return validCity(s)&&object(h)&&h.version===1&&time(h.lastPay)&&int(h.seq)&&h.seq<=1000000&&object(h.owed)&&Object.entries(h.owed).every(([id,n])=>s.generals.includes(id)&&int(n))&&Array.isArray(h.pending)&&new Set(h.pending).size===h.pending.length&&h.pending.every(id=>s.generals.includes(id)&&s.heroLoyalty[id]===0)&&Array.isArray(h.captives)&&h.captives.length<=100&&new Set(h.captives.map(c=>c.id)).size===h.captives.length&&h.captives.every(c=>object(c)&&/^local_\d+$/.test(c.id)&&!s.generals.includes(c.id)&&object(c.hero)&&c.hero.id===c.id&&typeof c.hero.name==='string'&&c.hero.name.length<=20&&['atk','def','pol','wis','lead','level','price'].every(k=>Number.isFinite(c.hero[k])&&c.hero[k]>=0)&&int(c.level)&&c.level>=1&&c.level<=10000&&Number.isFinite(c.xp)&&c.xp>=0&&time(c.at)&&typeof c.previousOwner==='string'&&typeof c.originCity==='string')&&Array.isArray(h.log)&&h.log.length<=40&&h.log.every(r=>object(r)&&time(r.at)&&typeof r.text==='string'&&r.text.length<=500);
 }
 const moraleTarget=s=>Math.max(0,100-s.tax-s.unrest);
 const wage=(s,id)=>20*(s.generalLevels[id]||1);
 const scopes=s=>Object.values(s.realm?.cities||{});
 const scopeData=(s,c)=>c.id===s.realm.activeCity?s:c.data;
 const heroBase=(s,id)=>s.customGenerals.find(g=>g.id===id)||Game.generals.find(g=>g.id===id);
 function removeHero(s,id,{reason='忠诚耗尽，下野离城',at=Date.now(),busy=false}={}){
  if(!s.generals.includes(id)||protectedHeroes.has(id)||busy)return false;
  s.generals=s.generals.filter(x=>x!==id);
  for(const k of ['heroLoyalty','heroPoints','heroDrills','heroSkills'])if(s[k])delete s[k][id];
  delete s.heroService.owed[id];s.heroService.pending=s.heroService.pending.filter(x=>x!==id);
  for(const e of s.equipment||[])if(e.hero===id)e.hero='';
  for(const c of scopes(s)){const d=scopeData(s,c);if(d.heroAdministration?.prepared?.hero===id)d.heroAdministration.prepared=null;if(d.governor===id)d.governor=null;for(const role of Object.keys(d.cityRoles||{}))if(d.cityRoles[role]===id)d.cityRoles[role]='';for(const [key,buff]of Object.entries(d.buffs||{}))if(buff.general===id)delete d.buffs[key];}
  if(s.governor===id)s.governor=null;for(const role of Object.keys(s.cityRoles||{}))if(s.cityRoles[role]===id)s.cityRoles[role]='';
  delete s.realm.heroLocations[id];s.wildGenerals.recruited=s.wildGenerals.recruited.filter(x=>x!==id);const rumor=s.wildGenerals.rumors.find(r=>r.id===id);if(rumor)rumor.status='released';
  // Retain custom hero archives and levels for old reports. Current ownership is generals[].
  record(s.heroService,{at,id,text:(heroBase(s,id)?.name||id)+' · '+reason});return true;
 }
 function tickHeroes(s,now,api={}){
  init(s,now);const h=s.heroService,from=Math.max(h.lastPay,api.capStart??now-8*HOUR),steps=Math.max(0,Math.floor((now-from)/HOUR));
  if(steps){for(let step=0;step<steps;step++){const at=from+(step+1)*HOUR;for(const id of [...s.generals]){
   const location=s.realm.heroLocations[id],city=s.realm.cities[location]||s.realm.cities.capital,d=scopeData(s,city),due=wage(s,id)+(h.owed[id]||0);
   if(d.res.gold>=due){d.res.gold-=due;delete h.owed[id];record(h,{at,id,text:(heroBase(s,id)?.name||id)+'领取薪俸 '+due+' 黄金'});}
   else{h.owed[id]=due;s.heroLoyalty[id]=Math.max(protectedHeroes.has(id)?20:0,s.heroLoyalty[id]-5);record(h,{at,id,text:(heroBase(s,id)?.name||id)+'欠饷 '+due+' 黄金，忠诚降至 '+s.heroLoyalty[id]});}
  }}h.lastPay=from+steps*HOUR;}
  for(const c of [...h.captives])if(now-c.at>=DAY){h.captives=h.captives.filter(x=>x.id!==c.id);record(h,{at:now,id:c.id,text:c.hero.name+'未在24小时内招降，已逃离俘将营'});}
  for(const c of [...s.wildGenerals.captives])if(now-c.at>=DAY){s.wildGenerals.captives=s.wildGenerals.captives.filter(x=>x.id!==c.id);const r=s.wildGenerals.rumors.find(r=>r.id===c.id);if(r)r.status='released';record(h,{at:now,id:c.id,text:c.hero.name+'未在24小时内招降，已逃离俘将营'});}
  for(const id of [...s.generals])if(!protectedHeroes.has(id)&&s.heroLoyalty[id]===0){if(api.busy?.(id)){if(!h.pending.includes(id))h.pending.push(id);}else removeHero(s,id,{at:now});}
  h.pending=h.pending.filter(id=>s.generals.includes(id)&&s.heroLoyalty[id]===0);
 }
 function salaryQuote(s,id='all'){
  const ids=id==='all'?s.generals:[id].filter(x=>s.generals.includes(x)),rows=ids.map(id=>({id,name:heroBase(s,id)?.name||id,wage:wage(s,id),owed:s.heroService.owed[id]||0,loyalty:s.heroLoyalty[id],city:s.realm.heroLocations[id]}));
  const cost=rows.reduce((n,r)=>n+r.owed,0),reason=!rows.length?'将领不存在':!cost?'没有待补发薪俸':s.res.gold<cost?'本城黄金不足':'';return {rows,cost,reason,key:rows.map(r=>r.id+':'+r.owed).join('|')};
 }
 function payArrears(s,id,key,now){const q=salaryQuote(s,id);if(q.key!==key)return '欠饷已变化，请重新查看';if(q.reason)return q.reason;s.res.gold-=q.cost;for(const r of q.rows){delete s.heroService.owed[r.id];s.heroLoyalty[r.id]=Math.min(100,s.heroLoyalty[r.id]+10);}s.heroService.pending=s.heroService.pending.filter(id=>s.heroLoyalty[id]===0);record(s.heroService,{at:now,text:'补发 '+q.cost+' 黄金薪俸，相关将领忠诚 +10'});return null;}
 function captureDefeated(loser,winner,id,now,{busyIds=[]}={}){
  init(loser,now);init(winner,now);const base=heroBase(loser,id),loyalty=loser.heroLoyalty[id]??80;
  if(!base||!loser.generals.includes(id)||protectedHeroes.has(id)||busyIds.includes(id)||loyalty>=50)return {id,name:base?.name||id,status:'returned',loyalty};
  const used=winner.generals.length+winner.wildGenerals.captives.length+winner.heroService.captives.length,room=Game.heroCapacity?.(winner)??winner.buildings.tavern;
  const status=used<room&&winner.customGenerals.length+winner.heroService.captives.length<100&&winner.heroService.seq<1000000?'captured':'released';
  const level=loser.generalLevels[id],xp=loser.generalXp[id],line=base.wildLine||'',originCity=loser.realm.heroLocations[id]||'capital';
  if(!removeHero(loser,id,{reason:status==='captured'?'城破被俘':'城破，下野离城',at:now}))return {id,name:base.name,status:'returned',loyalty};
  let captiveId=null;if(status==='captured'){
   do{captiveId='local_'+(2000000000000000+(++winner.heroService.seq));}while(winner.customGenerals.some(g=>g.id===captiveId)||winner.innCandidates.some(g=>g.id===captiveId)||winner.heroService.captives.some(c=>c.id===captiveId));
   const hero={...clone(base),wis:base.wis??base.def,lead:base.lead??level*10,id:captiveId,level,price:level*6000,origin:'battle',sourceHero:id};
   winner.heroService.captives.push({id:captiveId,hero,level,xp,at:now,previousOwner:loser.ruler,originCity});record(winner.heroService,{at:now,id:captiveId,text:'城破俘获 '+base.name+'，24小时内可招降'});
  }
  return {id,captiveId,name:base.name,line,status,loyalty};
 }
 function captiveQuote(s,id,method='gold'){
  const c=s.heroService.captives.find(c=>c.id===id);if(!c||!['gold','jewels'].includes(method))return null;const noble=Math.min(21,Math.floor((c.level-1)/3)),cost=method==='gold'?{gold:c.level*6000,jewels:{}}:{gold:0,jewels:{pearl:Math.ceil(c.level/2)}};
  const reason=s.honors.noble<noble?'需要爵位 '+HeritageData.nobles[noble].name:s.generals.length+s.wildGenerals.captives.length+s.heroService.captives.length>(Game.heroCapacity?.(s)??s.buildings.tavern)?'招贤馆名额不足':s.customGenerals.length>=100?'将领档案已满':s.res.gold<cost.gold||Object.entries(cost.jewels).some(([k,n])=>(s.jewels[k]||0)<n)?'黄金或珍宝不足':'';
  return {id,name:c.hero.name,cost,noble,reason,key:[id,c.at,method,s.honors.noble].join('|'),expiresAt:c.at+DAY};
 }
 function recruitCaptive(s,id,method,key,now){const q=captiveQuote(s,id,method);if(!q||q.key!==key)return '俘将条件已变化';if(q.reason)return q.reason;const c=s.heroService.captives.find(c=>c.id===id);if(now-c.at>=DAY)return '俘将已逃离';s.res.gold-=q.cost.gold;for(const [k,n]of Object.entries(q.cost.jewels))s.jewels[k]-=n;s.customGenerals.push(clone(c.hero));s.generals.push(id);s.generalLevels[id]=c.level;s.generalXp[id]=c.xp;s.heroLoyalty[id]=40;s.realm.heroLocations[id]=s.realm.activeCity;s.heroService.captives=s.heroService.captives.filter(c=>c.id!==id);HeroSystem.init(s);record(s.heroService,{at:now,id,text:c.hero.name+'已归顺，忠诚40'});return null;}
 function nextEvent(s){return events[s.governance.eventSeq%events.length];}
 function setPolicy(s,kind,enabled,now){if(!['eventsEnabled','autoRelief'].includes(kind)||typeof enabled!=='boolean')return '请选择内政策略';s.governance[kind]=enabled;if(kind==='eventsEnabled')s.governance.nextEvent=enabled?now+4*HOUR:0;return null;}
 function sacrificeQuote(s,now){const population=Math.max(100,Math.ceil(s.population)),cost={food:population,gold:population},reason=s.civicCooldowns.comfort>now?'安抚冷却中':s.res.food<cost.food||s.res.gold<cost.gold?'祭天所需粮食或黄金不足':'';return {id:'sacrifice',name:'祭天',kind:'comfort',cost,reward:{},effects:{morale:0,unrest:0,population:0},cooldownEnd:s.civicCooldowns.comfort,reason,enabled:!reason};}
 function sacrifice(s,now){const q=sacrificeQuote(s,now);if(q.reason)return q.reason;for(const [k,n]of Object.entries(q.cost))s.res[k]-=n;s.governance.wardUntil=now+8*HOUR;s.governance.blessingUntil=now+8*HOUR;s.civicCooldowns.comfort=now+900000;record(s.governance,{at:now,text:'祭天完成：8小时内免除下一次天灾，下一次天赐收益翻倍'});return null;}
 function tickCity(s,now,api={}){
  const g=s.governance;if(!g||now<=g.last)return;g.last=now;
  if(g.autoRelief&&(s.morale<40||s.unrest>=40)&&s.civicCooldowns.comfort<=now){const cost=Math.max(100,Math.ceil(s.population));if(s.res.gold>=cost){s.res.gold-=cost;s.morale=Math.min(100,s.morale+25);s.unrest=Math.max(0,s.unrest-15);s.civicCooldowns.comfort=now+900000;record(g,{at:now,text:'自动祈福：消耗 '+cost+' 黄金，民心+25、民怨-15'});}}
  const unrestDanger=s.morale<20||s.unrest>=60;
  if(!unrestDanger)g.crisisSince=0;else if(!g.crisisSince)g.crisisSince=now;else if(now-g.crisisSince>=HOUR){const lost=Math.ceil(s.population*.05);s.population=Math.max(0,s.population-lost);for(const k of ['wood','stone','iron','gold'])s.res[k]*=.95;s.unrest=Math.min(100,s.unrest+5);g.crisisSince=now;record(g,{at:now,text:'内乱：流失人口 '+lost+'，木石铁金各损失5%；请降低税率或安抚'});}
  const starving=s.res.food<=0&&Object.values(s.army).some(n=>n>0);
  if(!starving)g.starvedSince=0;else if(!g.starvedSince)g.starvedSince=now;else if(now-g.starvedSince>=HOUR){let lost=0;for(const [id,n]of Object.entries(s.army)){const amount=n?Math.max(1,Math.floor(n*.01)):0;s.army[id]-=amount;lost+=amount;}g.starvedSince=now;record(g,{at:now,text:'断粮超过1小时：本城驻军逃散 '+lost+' 人；在途部队按出发快照保留，请补粮'});}
  if(g.eventsEnabled&&g.nextEvent&&g.nextEvent<=now){let count=0;while(g.nextEvent<=now&&count++<2){const at=g.nextEvent,e=nextEvent(s);if(e.bad&&g.wardUntil>=at){g.wardUntil=0;record(g,{at,text:'祭天庇护免除了 '+e.name});}else if(e.bad){const amount=Math.floor(s.res[e.resource]*.05);s.res[e.resource]-=amount;s.unrest=Math.min(100,s.unrest+10);record(g,{at,text:e.name+'：'+Game.resources[e.resource].name+'损失 '+amount+'，民怨+10'});}else{const amount=Math.max(500,Math.floor(s.population*5))*(g.blessingUntil>=at?2:1);s.res[e.resource]+=amount;if(g.blessingUntil>=at)g.blessingUntil=0;record(g,{at,text:'天赐 '+e.name+'：'+Game.resources[e.resource].name+' +'+amount+'，允许爆仓'});}g.eventSeq++;g.nextEvent+=4*HOUR;}}
 }
 function status(s,now){const g=s.governance,q=salaryQuote(s);return {moraleTarget:moraleTarget(s),warnings:[...(g.crisisSince?['民心/民怨危险：'+Math.max(0,Math.ceil((g.crisisSince+HOUR-now)/60000))+'分钟后可能内乱']:[]),...(g.starvedSince?['断粮：'+Math.max(0,Math.ceil((g.starvedSince+HOUR-now)/60000))+'分钟后本城驻军逃散']:[])],nextEvent:g.eventsEnabled?{...nextEvent(s),at:g.nextEvent}:null,wages:q.rows.reduce((n,r)=>n+r.wage,0),owed:q.cost};}
 return {HOUR,DAY,events,init,initCity,valid,validCity,moraleTarget,wage,tickHeroes,tickCity,status,salaryQuote,payArrears,removeHero,captureDefeated,captiveQuote,recruitCaptive,setPolicy,sacrificeQuote,sacrifice};
})();


// SOURCE: hero-system.js
'use strict';
// General cultivation and equipment numbers are prototype rules, not historical tables.
const HeroSystem=(()=>{
  const attrs={atk:'勇武',def:'统御',pol:'内政',wis:'智谋',lead:'统率'};
  // Free points only raise these three; 统御 and 统率 grow from level and equipment.
  const allocatable=['atk','pol','wis'];
  const slots={weapon:'兵器',armor:'铠甲',helmet:'头盔',accessory:'佩饰'};
  const qualities=['','普通','精良','珍稀'];
  const names={weapon:['','精铁长枪','百炼战刃','龙纹战戟'],armor:['','皮甲','锁子甲','玄铁战甲'],helmet:['','铁盔','明光盔','狮纹金盔'],accessory:['','竹简','青玉佩','龙凤玉印']};
  const bases={weapon:{atk:8,lead:2},armor:{def:8,lead:2},helmet:{def:3,wis:5},accessory:{pol:6,wis:4}};
  const zero=()=>Object.fromEntries(Object.keys(attrs).map(k=>[k,0]));
  // Prototype: defeated wild generals are held first, then recruited manually.
  // Fixed leads and attributes make repeated inquiries unable to reroll rewards.
  const wild=(()=>{
    const definitions=[
      {line:'wanderer',name:'陈岚',title:'山林游侠',historical:false,fieldLevel:1,anchor:{x:28,y:34},level:2,atk:68,def:56,pol:48,wis:52,bonus:'cavalry',portraitPrice:10,noble:0,gold:6000,jewels:{pearl:1}},
      {line:'warrior',name:'魏延',title:'在野骁将',historical:true,fieldLevel:3,anchor:{x:21,y:30},level:4,atk:84,def:76,pol:48,wis:58,bonus:'spear',portraitPrice:30,noble:1,gold:25000,jewels:{pearl:2,coral:2}},
      {line:'strategist',name:'徐庶',title:'在野谋士',historical:true,fieldLevel:5,anchor:{x:11,y:34},level:6,atk:58,def:68,pol:88,wis:92,bonus:'shield',portraitPrice:50,noble:2,gold:60000,jewels:{coral:2,glass:3}},
      {line:'zhaoyun',name:'赵云',title:'常山骁骑',historical:true,region:'河北',minInn:2,fieldLevel:4,anchor:{x:32,y:16},level:5,atk:92,def:88,pol:52,wis:70,bonus:'cavalry',portraitPrice:60,noble:1,gold:80000,jewels:{pearl:3,coral:3}},
      {line:'huangzhong',name:'黄忠',title:'荆襄神射',historical:true,region:'荆州',minInn:2,fieldLevel:5,anchor:{x:32,y:53},level:6,atk:94,def:80,pol:48,wis:66,bonus:'archer',portraitPrice:70,noble:2,gold:100000,jewels:{coral:4,glass:2}},
      {line:'ganning',name:'甘宁',title:'江东猛将',historical:true,region:'江东',minInn:3,fieldLevel:6,anchor:{x:54,y:43},level:7,atk:90,def:82,pol:42,wis:64,bonus:'cavalry',portraitPrice:85,noble:3,gold:140000,jewels:{coral:4,glass:4}},
      {line:'zhangliao',name:'张辽',title:'雁门雄将',historical:true,region:'并州',minInn:3,fieldLevel:6,anchor:{x:12,y:17},level:7,atk:91,def:92,pol:62,wis:78,bonus:'spear',portraitPrice:85,noble:3,gold:140000,jewels:{coral:4,glass:4}},
      {line:'machao',name:'马超',title:'西凉铁骑',historical:true,region:'西凉',minInn:3,fieldLevel:7,anchor:{x:3,y:24},level:8,atk:98,def:87,pol:40,wis:62,bonus:'cavalry',portraitPrice:100,noble:4,gold:180000,jewels:{glass:5,jade:2}},
      {line:'xunyu',name:'荀彧',title:'颍川王佐',historical:true,region:'中原',minInn:4,fieldLevel:7,anchor:{x:8,y:10},level:8,atk:44,def:68,pol:99,wis:96,bonus:'shield',portraitPrice:100,noble:4,gold:180000,jewels:{glass:5,jade:2}},
      {line:'pangtong',name:'庞统',title:'荆襄凤雏',historical:true,region:'南境',minInn:4,fieldLevel:8,anchor:{x:15,y:62},level:9,atk:48,def:65,pol:92,wis:100,bonus:'catapult',portraitPrice:120,noble:5,gold:240000,jewels:{jade:4,agate:2}},
      {line:'zhouyu',name:'周瑜',title:'江东都督',historical:true,region:'东南',minInn:5,fieldLevel:9,anchor:{x:61,y:61},level:10,atk:82,def:88,pol:89,wis:99,bonus:'archer',portraitPrice:150,noble:6,gold:320000,jewels:{jade:5,agate:3}},
      {line:'guanyu',name:'关羽',title:'河东武圣',historical:true,region:'北境',minInn:5,fieldLevel:10,anchor:{x:0,y:0},level:12,atk:105,def:100,pol:66,wis:74,bonus:'cavalry',portraitPrice:180,noble:7,gold:400000,jewels:{agate:5,crystal:3}}
    ];
    const ID_BASE=1000000000000000,MAX_SEQ=1000000;
    const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),integer=n=>Number.isSafeInteger(n)&&n>=0;
    const definition=line=>definitions.find(d=>d.line===line);
    function initWild(s){
      if(s.wildGenerals===undefined)s.wildGenerals={version:1,seq:0,rumors:[],captives:[],recruited:[],portraits:[]};
      if(object(s.wildGenerals)&&s.wildGenerals.portraits===undefined)s.wildGenerals.portraits=[];
      if(s.heroLoyalty===undefined)s.heroLoyalty={};
      if(object(s.heroLoyalty))for(const id of s.generals)if(s.heroLoyalty[id]===undefined)s.heroLoyalty[id]=80;
    }
    const heldCaptives=s=>(s.wildGenerals?.captives?.length||0)+(s.heroService?.captives?.length||0);
    const roomUsed=s=>s.generals.length+heldCaptives(s);
    const roomCapacity=s=>Game.heroCapacity?.(s)??s.buildings.tavern;
    function unlockReason(s,d){return !d.minInn?'':s.buildings.inn<d.minInn?'需要 '+d.minInn+' 级客栈':s.honors.noble<d.noble?'需要爵位 '+HeritageData.nobles[d.noble].name:'';}
    function codex(s){return definitions.map(d=>{const r=s.wildGenerals?.rumors?.find(r=>r.line===d.line),reason=unlockReason(s,d);return {...d,region:d.region||'近郊',locked:!!reason,reason,status:r?.status||'undiscovered',portraitOwned:portraitOwned(s,d.line),node:r?.node||null,heroId:r?.id||null};});}
    const loyalty=(s,id)=>s.heroLoyalty?.[id]??s.wildGenerals?.captives?.find(c=>c.id===id)?.loyalty??80;
    const portraitOwned=(s,line)=>!!s.wildGenerals?.portraits?.includes(line);
    const hero=(d,id,node)=>({id,name:d.name,title:d.title,type:'将',level:d.level,atk:d.atk,def:d.def,pol:d.pol,wis:d.wis,lead:d.level*10,price:d.gold,bonus:d.bonus,desc:d.historical?'在野历史将领，数值与招降条件为本作试玩设定。':'山林中的游侠，清剿其驻守野地后可手动招降。',origin:'wild',wildLine:d.line,sourceNode:node});
    function validId(id,s){const seq=s.wildGenerals?.seq;if(!integer(seq)||typeof id!=='string'||!/^local_\d+$/.test(id))return false;const n=Number(id.slice(6));return Number.isSafeInteger(n)&&n>ID_BASE&&n<=ID_BASE+seq;}
    function nodeValid(id,s){const m=/^wild_(\d{1,2})_(\d{1,2})$/.exec(id||'');return !!m&&Number(m[1])<64&&Number(m[2])<64&&id==='wild_'+Number(m[1])+'_'+Number(m[2])&&!!Game.getNode(id,s)?.wild;}
    function validWild(s){
      const w=s.wildGenerals;if(!object(w)||w.version!==1||!integer(w.seq)||w.seq>MAX_SEQ||!Array.isArray(w.rumors)||w.rumors.length>definitions.length||!Array.isArray(w.captives)||w.captives.length>definitions.length||!Array.isArray(w.recruited)||w.recruited.length>definitions.length||!Array.isArray(w.portraits)||w.portraits.length>definitions.length||!w.portraits.every(line=>!!definition(line))||new Set(w.portraits).size!==w.portraits.length||!object(s.heroLoyalty))return false;
      if(!s.generals.every(id=>Number.isInteger(s.heroLoyalty[id])&&s.heroLoyalty[id]>=0&&s.heroLoyalty[id]<=100)||!Object.keys(s.heroLoyalty).every(id=>s.generals.includes(id)))return false;
      if(!w.rumors.every(r=>object(r)&&definition(r.line)&&validId(r.id,s)&&nodeValid(r.node,s)&&integer(r.at)&&['active','captive','recruited','released'].includes(r.status)))return false;
      if(new Set(w.rumors.map(r=>r.line)).size!==w.rumors.length||new Set(w.rumors.map(r=>r.id)).size!==w.rumors.length||new Set(w.rumors.filter(r=>r.status==='active').map(r=>r.node)).size!==w.rumors.filter(r=>r.status==='active').length)return false;
      if(!w.captives.every(c=>{const d=definition(c?.line),r=w.rumors.find(r=>r.id===c?.id),expected=d&&hero(d,c.id,c.node);return object(c)&&!!d&&!!r&&r.line===c.line&&r.node===c.node&&r.status==='captive'&&integer(c.at)&&c.loyalty===40&&object(c.hero)&&Object.entries(expected).every(([k,v])=>c.hero[k]===v)&&!s.generals.includes(c.id)&&!s.customGenerals.some(g=>g.id===c.id);} ))return false;
      if(new Set(w.captives.map(c=>c.id)).size!==w.captives.length||s.customGenerals.length+w.captives.length>100||new Set(w.recruited).size!==w.recruited.length)return false;
      if(!w.recruited.every(id=>s.generals.includes(id)&&s.customGenerals.some(g=>g.id===id&&g.origin==='wild')&&w.rumors.some(r=>r.id===id&&r.status==='recruited')))return false;
      return w.rumors.every(r=>r.status==='captive'?w.captives.some(c=>c.id===r.id):r.status==='recruited'?w.recruited.includes(r.id):!w.captives.some(c=>c.id===r.id)&&!w.recruited.includes(r.id)&&!s.generals.includes(r.id));
    }
    function validReceipt(r,s){if(r===undefined||r===null)return true;return object(r)&&definition(r.line)?.name===r.name&&validId(r.id,s)&&nodeValid(r.node,s)&&['captured','released','portrait_required'].includes(r.status)&&r.loyalty===(r.status==='captured'?40:0)&&typeof r.reason==='string'&&r.reason.length<=100;}
    function location(s,d){
      const occupied=new Set(s.wildGenerals.rumors.filter(r=>r.status!=='released').map(r=>r.node));
      const available=n=>n?.wild&&n.level===d.fieldLevel&&!s.conquered[n.id]&&!occupied.has(n.id)&&Object.values(n.army).some(v=>v>0);
      const preferred=Game.getWorldTile(d.anchor.x,d.anchor.y);if(available(preferred))return preferred;
      let best=null,score=Infinity;for(let y=0;y<Game.WORLD_SIZE;y++)for(let x=0;x<Game.WORLD_SIZE;x++){const n=Game.getWorldTile(x,y);if(!available(n))continue;const next=Math.hypot(x-d.anchor.x,y-d.anchor.y);if(next<score){best=n;score=next;}}return best;
    }
    function liveWild(){const error=Game.saveBlockReason();if(error)return {error};Game.tick(Date.now(),false);init(Game.state);return {s:Game.state};}
    const persist=()=>Game.save()?null:Game.saveBlockReason()||'保存失败，请保留当前页面';
    function discover(){
      const live=liveWild();if(live.error)return live.error;const s=live.s,w=s.wildGenerals;if(s.buildings.inn<1)return '请先建造 1 级客栈';
      let changed=false;for(const d of definitions){const previous=w.rumors.find(r=>r.line===d.line);if(unlockReason(s,d))continue;if(s.customGenerals.some(g=>s.generals.includes(g.id)&&g.name===d.name))continue;
        if(previous&&previous.status==='active'&&s.conquered[previous.node]){const next=location(s,d);if(next){previous.node=next.id;previous.at=Date.now();changed=true;}continue;}
        if(previous&&previous.status!=='released')continue;const n=location(s,d);if(!n)continue;
        const used=new Set([...s.generals,...s.innCandidates.map(g=>g.id),...w.rumors.map(r=>r.id)]);let id;while(w.seq<MAX_SEQ){const next='local_'+(ID_BASE+(++w.seq));if(!used.has(next)){id=next;break;}}if(!id)return changed?(persist()||'线索序号已达上限'):'线索序号已达上限';
        const r={line:d.line,id,node:n.id,at:Date.now(),status:'active'};if(previous)w.rumors.splice(w.rumors.indexOf(previous),1,r);else w.rumors.push(r);changed=true;
      }
      return changed?persist():w.rumors.length?null:'暂时没有可用野地，请先整理领地';
    }
    function portraitQuote(s,line){
      const d=definition(line);if(!d)return null;const r=s.wildGenerals?.rumors?.find(r=>r.line===line),owned=portraitOwned(s,line);
      const reason=!r?'请先在客栈打听这名将领的线索':r.status==='recruited'?'这名将领已经归顺':owned?'已永久拥有这名将领的画像':r.status==='captive'?'这名将领已被俘获，无需补买画像':s.gems<d.portraitPrice?'元宝不足':'';
      return {line,name:d.name,price:d.portraitPrice,owned,reason,key:[line,d.portraitPrice,r?.id||'',r?.status||'',owned].join('|')};
    }
    function buyPortrait(line,key){
      const live=liveWild();if(live.error)return live.error;const s=live.s,q=portraitQuote(s,line);if(!q||typeof key!=='string'||q.key!==key)return '画像报价或线索已变化，请重新查看';if(q.reason)return q.reason;
      s.gems-=q.price;s.wildGenerals.portraits.push(line);return persist();
    }
    function settle(s,n,b,won,at=Date.now()){
      if(!won||!n?.wild||b.finished||!['raid','occupy'].includes(b.mode)||!b.enemy.length||b.enemy.some(r=>r.hp>0))return null;
      const w=s.wildGenerals,r=w.rumors.find(r=>r.node===n.id&&r.status==='active');if(!r)return null;const d=definition(r.line);
      if(!portraitOwned(s,r.line))return {line:r.line,id:r.id,name:d.name,node:n.id,status:'portrait_required',loyalty:0,reason:'尚未拥有 '+d.name+' 画像，请先在客栈购买后再出征俘获'};
      const reason=s.customGenerals.some(g=>s.generals.includes(g.id)&&g.name===d.name)?'这名将领已在帐下':roomUsed(s)>=roomCapacity(s)?'招贤馆位置已满':s.customGenerals.length+w.captives.length>=100?'将领总量已达上限':'';
      if(reason){r.status='released';return {line:r.line,id:r.id,name:d.name,node:n.id,status:'released',loyalty:0,reason};}
      r.status='captive';w.captives.push({id:r.id,line:r.line,node:n.id,at,loyalty:40,hero:hero(d,r.id,n.id)});
      return {line:r.line,id:r.id,name:d.name,node:n.id,status:'captured',loyalty:40,reason:'等待手动招降'};
    }
    const payment=(d,method)=>method==='gold'?{gold:d.gold,jewels:{}}:method==='jewels'?{gold:0,jewels:{...d.jewels}}:null;
    function fundsReason(s,cost){if(s.res.gold<cost.gold)return '黄金不足';for(const [id,n]of Object.entries(cost.jewels))if((s.jewels[id]||0)<n)return Progression.jewels[id].name+'不足';return '';}
    function recruitQuote(s,id,method='gold'){
      const c=s.wildGenerals?.captives.find(c=>c.id===id),d=c&&definition(c.line),cost=d&&payment(d,method);if(!c||!cost)return null;
      const reason=(s.honors.noble<d.noble?'需要爵位 '+HeritageData.nobles[d.noble].name:'')||(roomUsed(s)>roomCapacity(s)?'招贤馆名额不足，请扩建或释放俘将':'')||(s.customGenerals.length>=100?'将领总量已达上限':'')||fundsReason(s,cost);
      return {id,name:c.hero.name,method,cost,noble:d.noble,nobleName:HeritageData.nobles[d.noble].name,loyalty:c.loyalty,reason,key:[id,method,s.honors.noble,roomUsed(s),roomCapacity(s),s.customGenerals.length].join('|')};
    }
    function recruit(id,method,key){
      const live=liveWild();if(live.error)return live.error;const s=live.s,q=recruitQuote(s,id,method);if(!q||typeof key!=='string'||q.key!==key)return '招降条件已变化，请重新查看俘将';if(q.reason)return q.reason;
      const w=s.wildGenerals,c=w.captives.find(c=>c.id===id);s.res.gold-=q.cost.gold;for(const [j,n]of Object.entries(q.cost.jewels))s.jewels[j]-=n;
      s.customGenerals.push({...c.hero});s.generals.push(id);s.generalLevels[id]=c.hero.level;s.generalXp[id]=0;s.heroLoyalty[id]=c.loyalty;w.captives=w.captives.filter(c=>c.id!==id);w.rumors.find(r=>r.id===id).status='recruited';w.recruited.push(id);init(s);return persist();
    }
    function rewardQuote(s,id,method='gold'){
      if(!s.generals.includes(id)||!['gold','jewels'].includes(method))return null;const current=loyalty(s,id),raise=Math.min(10,100-current),cost=method==='gold'?{gold:2000,jewels:{}}:{gold:0,jewels:{pearl:1}};
      const reason=!raise?'忠诚已达 100':Game.generalBusy(id)?'将领在外，请返城后奖励':fundsReason(s,cost);
      return {id,name:Game.general(id).name,method,current,next:current+raise,raise,cost,reason,key:[id,method,current,!!Game.generalBusy(id)].join('|')};
    }
    function reward(id,method,key){const live=liveWild();if(live.error)return live.error;const s=live.s,q=rewardQuote(s,id,method);if(!q||typeof key!=='string'||q.key!==key)return '奖励条件已变化，请重新查看将领';if(q.reason)return q.reason;s.res.gold-=q.cost.gold;for(const [j,n]of Object.entries(q.cost.jewels))s.jewels[j]-=n;s.heroLoyalty[id]=q.next;return persist();}
    function releaseQuote(s,id){const c=s.wildGenerals?.captives.find(c=>c.id===id);return c?{id,name:c.hero.name,key:[id,c.line,c.at].join('|')}:null;}
    function release(id,key){const live=liveWild();if(live.error)return live.error;const s=live.s,q=releaseQuote(s,id);if(!q||typeof key!=='string'||q.key!==key)return '俘将状态已变化，请重新查看';s.wildGenerals.captives=s.wildGenerals.captives.filter(c=>c.id!==id);s.wildGenerals.rumors.find(r=>r.id===id).status='released';return persist();}
    return {definitions,init:initWild,valid:validWild,validReceipt,heldCaptives,roomUsed,roomCapacity,unlockReason,codex,loyalty,portraitOwned,portraitQuote,buyPortrait,discover,settle,recruitQuote,recruit,rewardQuote,reward,releaseQuote,release};
  })();
  function init(s){
    if(!s||!Array.isArray(s.generals))return;
    if(s.heroPoints===undefined)s.heroPoints={};
    if(s.heroDrills===undefined)s.heroDrills={};
    if(s.equipment===undefined)s.equipment=[];
    if(s.equipmentCapacity===undefined)s.equipmentCapacity=50;
    if(s.equipmentSeq===undefined)s.equipmentSeq=0;
    if(s.heroGiftClaimed===undefined)s.heroGiftClaimed=false;
    wild.init(s);
    if(s.heroPoints&&typeof s.heroPoints==='object')for(const id of s.generals)if(s.heroPoints[id]===undefined)s.heroPoints[id]=zero();
  }
  const totalPoints=(s,id)=>Math.max(0,((s.generalLevels[id]||1)-1)*3);
  const remaining=(s,id)=>totalPoints(s,id)-Object.values(s.heroPoints[id]||zero()).reduce((a,b)=>a+b,0);
  const itemName=e=>names[e.slot]?.[e.tier]||'未知装备';
  const requiredLevel=e=>[0,1,5,10][e.tier];
  function stats(e){return Object.fromEntries(Object.entries(bases[e.slot]).map(([id,n])=>[id,Math.round(n*[0,1,2,4][e.tier]*(1+e.enhance*.15))]));}
  function bonus(s,id){const out={...zero(),...(s.heroPoints?.[id]||{})};for(const e of s.equipment||[])if(e.hero===id)for(const [k,n] of Object.entries(stats(e)))out[k]+=n;return out;}
  function validEquipment(e,s){return !!e&&typeof e==='object'&&!Array.isArray(e)&&Number.isSafeInteger(e.id)&&e.id>0&&e.id<=s.equipmentSeq&&Object.hasOwn(slots,e.slot)&&[1,2,3].includes(e.tier)&&Number.isInteger(e.enhance)&&e.enhance>=0&&e.enhance<=10&&(e.hero===''||s.generals.includes(e.hero)&&s.generalLevels[e.hero]>=requiredLevel(e));}
  function valid(s){
    const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
    if(!wild.valid(s))return false;
    if(!obj(s.heroPoints)||!obj(s.heroDrills)||!Array.isArray(s.equipment)||!int(s.equipmentSeq)||!Number.isInteger(s.equipmentCapacity)||s.equipmentCapacity<50||s.equipmentCapacity>500||s.equipment.length>s.equipmentCapacity||typeof s.heroGiftClaimed!=='boolean')return false;
    if(!Object.keys(s.heroPoints).every(id=>s.generals.includes(id))||!s.generals.every(id=>obj(s.heroPoints[id])&&Object.keys(s.heroPoints[id]).length===5&&Object.keys(attrs).every(k=>int(s.heroPoints[id][k]))&&remaining(s,id)>=0))return false;
    if(!Object.entries(s.heroDrills).every(([id,d])=>s.generals.includes(id)&&obj(d)&&int(d.day)&&int(d.count)&&d.count<=3))return false;
    if(!s.equipment.every(e=>validEquipment(e,s))||new Set(s.equipment.map(e=>e.id)).size!==s.equipment.length)return false;
    const worn=s.equipment.filter(e=>e.hero).map(e=>e.hero+':'+e.slot);return new Set(worn).size===worn.length;
  }
  // Construction rewards depend on the completed level, not duration or game speed.
  const constructionXp=level=>level*10;
  function addXp(s,id,xp){s.generalXp[id]=(s.generalXp[id]||0)+xp;while(s.generalLevels[id]<10000&&s.generalXp[id]>=s.generalLevels[id]*80){s.generalXp[id]-=s.generalLevels[id]*80;s.generalLevels[id]++;}init(s);}
  function addEquipment(s,slot,tier){const e={id:++s.equipmentSeq,slot,tier,enhance:0,hero:''};s.equipment.push(e);return e;}
  function drops(s,level){
    const result={equipmentDrops:[],equipmentDiscarded:0};
    if(Math.random()>=Math.min(.55,.25+level*.03))return result;
    if(s.equipment.length>=s.equipmentCapacity){result.equipmentDiscarded=1;return result;}
    const r=Math.random(),tier=level>=8&&r<.15?3:level>=3&&r<.45?2:1;
    result.equipmentDrops.push({...addEquipment(s,Object.keys(slots)[Math.floor(Math.random()*4)],tier)});return result;
  }
  const live=()=>{Game.tick();init(Game.state);return Game.state;};
  const busy=id=>!Game.state.generals.includes(id)?'请选择已招募将领':Game.generalBusy(id)?'将领出征或驻守中，请返城后调整':null;
  const save=()=>{Game.save();return null;};
  function allocate(id,points){const s=live(),error=busy(id);if(error)return error;if(!points||Object.keys(points).length!==5||!Object.keys(attrs).every(k=>Number.isSafeInteger(points[k])&&points[k]>=0))return '加点格式不正确';if(Object.keys(attrs).some(k=>!allocatable.includes(k)&&points[k]>0))return '统御与统率不能加点';const sum=Object.values(points).reduce((a,b)=>a+b,0);if(sum<1||sum>remaining(s,id))return '可分配属性点不足';for(const k of Object.keys(attrs))s.heroPoints[id][k]+=points[k];return save();}
  function reset(id){const s=live(),error=busy(id);if(error)return error;const used=totalPoints(s,id)-remaining(s,id),count=Math.ceil(s.generalLevels[id]/10);if(!used)return '这位将领没有已分配属性点';if((s.inventory.resetHero||0)<count)return '需要洗髓丹 ×'+count;s.inventory.resetHero-=count;s.heroPoints[id]=zero();Progression.record(s,'item',count);return save();}
  function drillQuote(s,id){const day=Progression.period(Date.now()),d=s.heroDrills[id],used=d?.day===day?d.count:0;return {used,cost:1000*(s.generalLevels[id]||1),xp:80};}
  function drill(id){const s=live(),error=busy(id);if(error)return error;if(s.buildings.drill<1)return '请先建造校场';if(s.generalLevels[id]>=10000)return '将领已达最高等级';const q=drillQuote(s,id);if(q.used>=3)return '今日已操练 3 次，北京时间 05:00 重置';if(s.res.gold<q.cost)return '黄金不足';s.res.gold-=q.cost;s.heroDrills[id]={day:Progression.period(Date.now()),count:q.used+1};addXp(s,id,q.xp);return save();}
  function gift(){const s=live();if(s.heroGiftClaimed)return '将领装备礼包已领取';if(s.equipment.length+8>s.equipmentCapacity)return '需要 8 格装备空间';for(let i=0;i<2;i++)for(const slot of Object.keys(slots))addEquipment(s,slot,1);s.inventory.pearl=(s.inventory.pearl||0)+5;s.inventory.resetHero=(s.inventory.resetHero||0)+2;s.heroGiftClaimed=true;return save();}
  function equip(eid,id){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';const error=busy(id)||(e.hero&&busy(e.hero));if(error)return error;if(s.generalLevels[id]<requiredLevel(e))return '需要将领 '+requiredLevel(e)+' 级';for(const old of s.equipment)if(old.hero===id&&old.slot===e.slot)old.hero='';e.hero=id;return save();}
  function unequip(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e?.hero)return '装备未穿戴';const error=busy(e.hero);if(error)return error;e.hero='';return save();}
  function forgeQuote(slot,tier){if(!Object.hasOwn(slots,slot)||![1,2,3].includes(tier))return null;const factor=[0,1,4,12][tier];return {smith:[0,1,3,6][tier],cost:{wood:1000*factor,stone:800*factor,iron:2000*factor,gold:3000*factor}};}
  function forge(slot,tier){const s=live(),q=forgeQuote(slot,tier);if(!q)return '请选择装备';if(s.buildings.smith<q.smith)return '需要 '+q.smith+' 级铁匠铺';if(s.equipment.length>=s.equipmentCapacity)return '装备库已满';if(!Game.canPay(q.cost))return '打造材料不足';for(const [id,n] of Object.entries(q.cost))s.res[id]-=n;addEquipment(s,slot,tier);return save();}
  function enhanceQuote(e){return {gold:1000*e.tier*(e.enhance+1),pearls:Math.ceil((e.enhance+1)/3)};}
  function enhance(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.hero&&busy(e.hero))return busy(e.hero);if(s.buildings.smith<1)return '请先建造铁匠铺';if(e.enhance>=10)return '强化已达 +10';const q=enhanceQuote(e);if(s.res.gold<q.gold||(s.inventory.pearl||0)<q.pearls)return '黄金或强化宝珠不足';s.res.gold-=q.gold;s.inventory.pearl-=q.pearls;e.enhance++;Progression.record(s,'item',q.pearls);return save();}
  function salvage(eid){const s=live(),e=s.equipment.find(e=>e.id===eid);if(!e)return '装备不存在';if(e.hero)return '请先卸下装备';s.equipment=s.equipment.filter(x=>x.id!==eid);s.inventory.pearl=(s.inventory.pearl||0)+e.tier+Math.floor(e.enhance/3);return save();}
  function expand(item){const s=live();if(!['rack','rackAdvanced'].includes(item)||(s.inventory[item]||0)<1)return '没有武器架';if(s.equipmentCapacity>=500)return '装备容量已达 500 格';s.equipmentCapacity=Math.min(500,s.equipmentCapacity+(item==='rack'?5:50));s.inventory[item]--;Progression.record(s,'item');return save();}
  for(const [id,effect] of Object.entries({resetHero:'heroReset',rack:'equipmentRack',rackAdvanced:'equipmentRack',pearl:'equipmentMaterial'}))ManualData.shop.find(x=>x.id===id).effect=effect;
  return {attrs,allocatable,slots,qualities,names,wild,init,valid,validEquipment,totalPoints,remaining,itemName,requiredLevel,stats,bonus,constructionXp,addXp,addEquipment,drops,allocate,reset,drillQuote,drill,gift,equip,unequip,forgeQuote,forge,enhanceQuote,enhance,salvage,expand};
})();


// SOURCE: heritage-data.js
'use strict';
// Numeric rules from the supplied package; rank/territory prerequisites are game adaptations. See REFERENCE-NOTES.md.
const HeritageData={
  "version": 1,
  "offices": [
    {
      "id": 0,
      "name": "平民",
      "salary": 0
    },
    {
      "id": 1,
      "name": "伍长",
      "salary": 1000,
      "promotion": {
        "taskId": 206,
        "prestige": 1000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 1
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 1,
        "rankTrial": true
      }
    },
    {
      "id": 2,
      "name": "什长",
      "salary": 2000,
      "promotion": {
        "taskId": 207,
        "prestige": 2000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 2
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 2,
        "rankTrial": true
      }
    },
    {
      "id": 3,
      "name": "里魁",
      "salary": 5000,
      "promotion": {
        "taskId": 208,
        "prestige": 4000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 3
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 3,
        "rankTrial": true
      }
    },
    {
      "id": 4,
      "name": "亭长",
      "salary": 10000,
      "promotion": {
        "taskId": 209,
        "prestige": 8000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 4
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 4,
        "rankTrial": true
      }
    },
    {
      "id": 5,
      "name": "啬夫",
      "salary": 20000,
      "promotion": {
        "taskId": 210,
        "prestige": 16000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 5
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 5,
        "rankTrial": true
      }
    },
    {
      "id": 6,
      "name": "县长",
      "salary": 30000,
      "promotion": {
        "taskId": 211,
        "prestige": 32000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 6
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 6,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 7,
      "name": "县令",
      "salary": 40000,
      "promotion": {
        "taskId": 212,
        "prestige": 64000,
        "office": 0,
        "hall": 0,
        "gold": 0,
        "jewels": {
          "pearl": 7
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 7,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 8,
      "name": "督邮",
      "salary": 50000,
      "promotion": {
        "taskId": 216,
        "prestige": 0,
        "office": 0,
        "hall": 2,
        "gold": 10000,
        "jewels": {
          "pearl": 8
        },
        "trial": false,
        "jewelTrial": true,
        "noble": 9,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 9,
      "name": "太守",
      "salary": 60000,
      "promotion": {
        "taskId": 217,
        "prestige": 0,
        "office": 0,
        "hall": 4,
        "gold": 20000,
        "jewels": {
          "pearl": 5
        },
        "trial": false,
        "noble": 11,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 10,
      "name": "别驾",
      "salary": 70000,
      "promotion": {
        "taskId": 218,
        "prestige": 0,
        "office": 0,
        "hall": 6,
        "gold": 30000,
        "jewels": {
          "coral": 5
        },
        "trial": false,
        "noble": 13,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 11,
      "name": "刺史",
      "salary": 80000,
      "promotion": {
        "taskId": 219,
        "prestige": 0,
        "office": 0,
        "hall": 8,
        "gold": 40000,
        "jewels": {
          "glass": 5
        },
        "trial": false,
        "noble": 15,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 12,
      "name": "州牧",
      "salary": 100000,
      "promotion": {
        "taskId": 220,
        "prestige": 0,
        "office": 0,
        "hall": 10,
        "gold": 50000,
        "jewels": {
          "amber": 5
        },
        "trial": false,
        "noble": 17,
        "rankTrial": true,
        "county": true
      }
    },
    {
      "id": 13,
      "name": "丞相",
      "salary": 150000,
      "promotion": {
        "taskId": null,
        "prestige": 2000000,
        "office": 12,
        "hall": 10,
        "gold": 200000,
        "jewels": {
          "jade": 5,
          "nightPearl": 1
        },
        "county": true,
        "trial": true,
        "jewelTrial": true,
        "noble": 20,
        "rankTrial": true
      }
    },
    {
      "id": 14,
      "name": "皇帝",
      "salary": 200000,
      "promotion": {
        "taskId": null,
        "prestige": 5000000,
        "office": 13,
        "hall": 10,
        "gold": 500000,
        "jewels": {
          "jade": 10,
          "nightPearl": 5
        },
        "county": true,
        "trial": true,
        "jewelTrial": true,
        "noble": 21,
        "rankTrial": true
      }
    }
  ],
  "nobles": [
    {
      "id": 0,
      "name": "平民",
      "city_count": 1,
      "salary": 0
    },
    {
      "id": 1,
      "name": "公士",
      "city_count": 2,
      "salary": 1000,
      "promotion": {
        "taskId": 221,
        "prestige": 1000,
        "office": 0,
        "hall": 0,
        "gold": 20000,
        "jewels": {
          "pearl": 10,
          "coral": 5
        },
        "trial": false,
        "rankTrial": true
      }
    },
    {
      "id": 2,
      "name": "上造",
      "city_count": 3,
      "salary": 4000,
      "promotion": {
        "taskId": 222,
        "prestige": 2000,
        "office": 1,
        "hall": 0,
        "gold": 40000,
        "jewels": {
          "coral": 10,
          "glass": 5
        },
        "trial": false,
        "rankTrial": true
      }
    },
    {
      "id": 3,
      "name": "簪袅",
      "city_count": 4,
      "salary": 9000,
      "promotion": {
        "taskId": 223,
        "prestige": 4000,
        "office": 2,
        "hall": 0,
        "gold": 60000,
        "jewels": {
          "glass": 10,
          "amber": 5
        },
        "trial": false,
        "rankTrial": true
      }
    },
    {
      "id": 4,
      "name": "不更",
      "city_count": 5,
      "salary": 16000,
      "promotion": {
        "taskId": 224,
        "prestige": 8000,
        "office": 3,
        "hall": 0,
        "gold": 80000,
        "jewels": {
          "amber": 10,
          "agate": 5
        },
        "trial": false,
        "rankTrial": true
      }
    },
    {
      "id": 5,
      "name": "大夫",
      "city_count": 6,
      "salary": 25000,
      "promotion": {
        "taskId": 225,
        "prestige": 16000,
        "office": 4,
        "hall": 0,
        "gold": 100000,
        "jewels": {
          "agate": 10,
          "crystal": 5
        },
        "trial": false,
        "rankTrial": true
      }
    },
    {
      "id": 6,
      "name": "官大夫",
      "city_count": 7,
      "salary": 36000,
      "promotion": {
        "taskId": 226,
        "prestige": 32000,
        "office": 5,
        "hall": 0,
        "gold": 200000,
        "jewels": {
          "crystal": 10,
          "jadeite": 5
        },
        "trial": false,
        "rankTrial": true
      }
    },
    {
      "id": 7,
      "name": "公大夫",
      "city_count": 8,
      "salary": 49000,
      "promotion": {
        "taskId": 227,
        "prestige": 64000,
        "office": 6,
        "hall": 0,
        "gold": 300000,
        "jewels": {
          "jadeite": 10,
          "jade": 5
        },
        "trial": false
      }
    },
    {
      "id": 8,
      "name": "公乘",
      "city_count": 9,
      "salary": 64000,
      "promotion": {
        "taskId": 228,
        "prestige": 128000,
        "office": 7,
        "hall": 0,
        "gold": 400000,
        "jewels": {
          "jade": 10,
          "nightPearl": 5
        },
        "trial": false
      }
    },
    {
      "id": 9,
      "name": "五大夫",
      "city_count": 10,
      "salary": 81000,
      "promotion": {
        "taskId": 229,
        "prestige": 256000,
        "office": 7,
        "hall": 0,
        "gold": 500000,
        "jewels": {
          "pearl": 20,
          "coral": 15,
          "glass": 10,
          "amber": 5
        },
        "trial": false
      }
    },
    {
      "id": 10,
      "name": "左庶长",
      "city_count": 11,
      "salary": 100000,
      "promotion": {
        "taskId": 230,
        "prestige": 512000,
        "office": 8,
        "hall": 0,
        "gold": 600000,
        "jewels": {
          "coral": 20,
          "glass": 15,
          "amber": 10,
          "agate": 5
        },
        "trial": false
      }
    },
    {
      "id": 11,
      "name": "右庶长",
      "city_count": 12,
      "salary": 121000,
      "promotion": {
        "taskId": 231,
        "prestige": 1024000,
        "office": 8,
        "hall": 0,
        "gold": 800000,
        "jewels": {
          "glass": 20,
          "amber": 15,
          "agate": 10,
          "crystal": 5
        },
        "trial": false
      }
    },
    {
      "id": 12,
      "name": "左更",
      "city_count": 13,
      "salary": 144000,
      "promotion": {
        "taskId": 232,
        "prestige": 2048000,
        "office": 9,
        "hall": 0,
        "gold": 1000000,
        "jewels": {
          "amber": 20,
          "agate": 15,
          "crystal": 10,
          "jadeite": 5
        },
        "trial": false
      }
    },
    {
      "id": 13,
      "name": "中更",
      "city_count": 14,
      "salary": 169000,
      "promotion": {
        "taskId": 233,
        "prestige": 4096000,
        "office": 9,
        "hall": 0,
        "gold": 2000000,
        "jewels": {
          "agate": 20,
          "crystal": 15,
          "jadeite": 10,
          "jade": 5
        },
        "trial": false
      }
    },
    {
      "id": 14,
      "name": "右更",
      "city_count": 15,
      "salary": 196000,
      "promotion": {
        "taskId": 234,
        "prestige": 8192000,
        "office": 10,
        "hall": 0,
        "gold": 3000000,
        "jewels": {
          "crystal": 20,
          "jadeite": 15,
          "jade": 10,
          "nightPearl": 5
        },
        "trial": false
      }
    },
    {
      "id": 15,
      "name": "少上造",
      "city_count": 16,
      "salary": 225000,
      "promotion": {
        "taskId": 235,
        "prestige": 16384000,
        "office": 10,
        "hall": 0,
        "gold": 4000000,
        "jewels": {
          "pearl": 50,
          "coral": 40,
          "glass": 30,
          "amber": 20,
          "agate": 10
        },
        "trial": false
      }
    },
    {
      "id": 16,
      "name": "大上造",
      "city_count": 17,
      "salary": 256000,
      "promotion": {
        "taskId": 236,
        "prestige": 32768000,
        "office": 11,
        "hall": 0,
        "gold": 5000000,
        "jewels": {
          "coral": 50,
          "glass": 40,
          "amber": 30,
          "agate": 20,
          "crystal": 10
        },
        "trial": false
      }
    },
    {
      "id": 17,
      "name": "驷车庶长",
      "city_count": 18,
      "salary": 289000,
      "promotion": {
        "taskId": 237,
        "prestige": 65536000,
        "office": 11,
        "hall": 0,
        "gold": 6000000,
        "jewels": {
          "glass": 50,
          "amber": 40,
          "agate": 30,
          "crystal": 20,
          "jadeite": 10
        },
        "trial": false
      }
    },
    {
      "id": 18,
      "name": "大庶长",
      "city_count": 19,
      "salary": 324000,
      "promotion": {
        "taskId": 238,
        "prestige": 131072000,
        "office": 12,
        "hall": 0,
        "gold": 8000000,
        "jewels": {
          "amber": 50,
          "agate": 40,
          "crystal": 30,
          "jadeite": 20,
          "jade": 10
        },
        "trial": false
      }
    },
    {
      "id": 19,
      "name": "关内侯",
      "city_count": 20,
      "salary": 361000,
      "promotion": {
        "taskId": 239,
        "prestige": 262144000,
        "office": 12,
        "hall": 0,
        "gold": 10000000,
        "jewels": {
          "agate": 50,
          "crystal": 40,
          "jadeite": 30,
          "jade": 20,
          "nightPearl": 10
        },
        "trial": false
      }
    },
    {
      "id": 20,
      "name": "列侯",
      "city_count": 21,
      "salary": 400000,
      "promotion": {
        "taskId": 240,
        "prestige": 524288000,
        "office": 12,
        "hall": 0,
        "gold": 20000000,
        "jewels": {
          "pearl": 100,
          "glass": 80,
          "agate": 60,
          "jadeite": 40,
          "nightPearl": 20
        },
        "trial": false
      }
    },
    {
      "id": 21,
      "name": "王",
      "city_count": 22,
      "salary": 441000,
      "promotion": {
        "taskId": 241,
        "prestige": 1048576000,
        "office": 13,
        "hall": 0,
        "gold": 50000000,
        "jewels": {
          "coral": 100,
          "amber": 90,
          "crystal": 80,
          "jade": 70,
          "nightPearl": 50
        },
        "trial": false
      }
    }
  ],
  "fields": {
    "hill": {
      "code": 2,
      "rate": 0.045,
      "weights": [
        2,
        2,
        10,
        2,
        6,
        3,
        3,
        6,
        1
      ]
    },
    "forest": {
      "code": 3,
      "rate": 0.09,
      "weights": [
        3,
        4,
        3,
        10,
        3,
        5,
        4,
        2,
        1
      ]
    },
    "grass": {
      "code": 4,
      "rate": 0.07,
      "weights": [
        3,
        3,
        8,
        7,
        3,
        5,
        2,
        3,
        1
      ]
    },
    "mountain": {
      "code": 5,
      "rate": 0.035,
      "weights": [
        1,
        1,
        1,
        1,
        10,
        10,
        5,
        5,
        1
      ]
    },
    "lake": {
      "code": 6,
      "rate": 0.09,
      "weights": [
        15,
        10,
        1,
        2,
        1,
        1,
        1,
        1,
        3
      ]
    },
    "swamp": {
      "code": 7,
      "rate": 0.08,
      "weights": [
        5,
        6,
        3,
        4,
        4,
        2,
        8,
        1,
        2
      ]
    }
  }
};


// SOURCE: heritage-system.js
'use strict';
const HeritageSystem=(()=>{
 const roles={governor:'城守',commander:'主将',counsellor:'军师'},HOUR=3600000;
 const zeroRoles=()=>({commander:'',counsellor:''});
 function init(s){if(!s||!Array.isArray(s.generals))return;if(s.cityRoles===undefined)s.cityRoles=zeroRoles();if(s.honors===undefined)s.honors={office:0,noble:0,salaryClaims:{office:0,noble:0}};if(s.gatherings===undefined)s.gatherings={};if(s.heritageHistory===undefined)s.heritageHistory=[];}
 const office=s=>HeritageData.offices[s.honors.office];
 const noble=s=>HeritageData.nobles[s.honors.noble];
 const roleHero=(s,role)=>role==='governor'?s.governor:s.cityRoles[role];
 const roleOf=(s,id)=>Object.keys(roles).find(role=>roleHero(s,role)===id)||'';
 function effectiveHero(s,kind){const order=kind==='research'?['counsellor','commander','governor']:kind==='train'?['commander','governor','counsellor']:['governor'];return order.map(role=>roleHero(s,role)).find(Boolean)||'';}
 const live=()=>{Game.tick();init(Game.state);return Game.state;};
 const save=()=>{Game.save();return null;};
 function assign(governor,commander,counsellor){const s=live(),all=[governor,commander,counsellor],chosen=all.filter(Boolean);if(!governor)return '请选择一位城守';if(chosen.some(id=>!s.generals.includes(id)||Game.generalBusy(id)))return '任职将领必须已经招募且留在城内';if(new Set(chosen).size!==chosen.length)return '一位将领只能担任一个职位';s.governor=governor;s.cityRoles={commander,counsellor};return save();}
 // Only current owned county cities count. Raid wins and former ownership do not.
 function ownedCounties(s){return Object.values(s?.realm?.cities||{}).filter(c=>NamedCityData.definition(c)?.tier==='county'&&NamedCitySystem.owned(s,c.node));}
 // Missing jewels of the named kind may be covered by any spare jewels at twice their prestige value, cheapest first.
 const JEWEL_SUBSTITUTE_RATE=2;
 function jewelPayment(s,required){
  const pay={},short={};let deficit=0;
  for(const [id,n] of Object.entries(required||{})){const own=Math.max(0,Math.min(s.jewels[id]||0,n));if(own)pay[id]=own;if(n>own){short[id]=n-own;deficit+=(n-own)*Progression.jewels[id].prestige*JEWEL_SUBSTITUTE_RATE;}}
  const substitute={};
  for(const [id,j] of Object.entries(Progression.jewels).sort((a,b)=>a[1].prestige-b[1].prestige)){if(deficit<=0)break;const spare=(s.jewels[id]||0)-(required?.[id]||0);if(spare<1)continue;const use=Math.min(spare,Math.ceil(deficit/j.prestige));substitute[id]=use;deficit-=use*j.prestige;}
  const total={...pay};for(const [id,n] of Object.entries(substitute))total[id]=(total[id]||0)+n;
  return {pay,short,substitute,total,covered:deficit<=0,rate:JEWEL_SUBSTITUTE_RATE};
 }
 function promotionQuote(s,kind){const list=kind==='office'?HeritageData.offices:kind==='noble'?HeritageData.nobles:null;if(!list)return null;const current=s.honors[kind],next=list[current+1];if(!next)return {next:null,reason:'已达最高级别'};const r=next.promotion,missing=[];
  if(s.prestige<r.prestige)missing.push('声望 '+r.prestige);
  if(s.honors.office<r.office)missing.push('官职 '+HeritageData.offices[r.office].name);
  if(r.noble&&s.honors.noble<r.noble)missing.push('爵位 '+HeritageData.nobles[r.noble].name);
  if(s.buildings.hall<r.hall)missing.push('官府 '+r.hall+' 级');
  if(s.res.gold<r.gold)missing.push('黄金 '+r.gold);
  const jewels=jewelPayment(s,r.jewels);if(!jewels.covered)for(const [id,n] of Object.entries(jewels.short))missing.push(Progression.jewels[id].name+' ×'+n+'（其他珠宝按 '+jewels.rate+' 倍价值折算也不足）');
  if(r.county&&!ownedCounties(s).length)missing.push('持有至少一座县城（须占领，掠夺不算）');
  return {next,rule:r,jewels,missing,reason:missing.length?'条件未满足：'+missing.join('、'):''};
 }
 function promote(kind){const s=live(),q=promotionQuote(s,kind);if(!q?.next)return q?.reason||'请选择晋升类型';if(q.reason)return q.reason;s.res.gold-=q.rule.gold;for(const [id,n] of Object.entries(q.jewels.total))s.jewels[id]-=n;s.honors[kind]=q.next.id;return save();}
 function salaryQuote(s,kind){const row=kind==='office'?office(s):kind==='noble'?noble(s):null;if(!row)return null;return {row,claimed:s.honors.salaryClaims[kind]===Progression.period(Date.now()),reward:kind==='office'?{gold:row.salary}:{food:row.salary,wood:row.salary,stone:row.salary,iron:row.salary}};}
 function record(s,r){s.heritageHistory.unshift({at:Date.now(),...r});s.heritageHistory=s.heritageHistory.slice(0,10);}
 function salary(kind){const s=live(),q=salaryQuote(s,kind);if(!q||q.row.salary<1)return '晋升后才能领取俸禄';if(q.claimed)return '今日已领取，北京时间 05:00 重置';for(const [id,n] of Object.entries(q.reward))s.res[id]+=n;s.honors.salaryClaims[kind]=Progression.period(Date.now());record(s,{kind:'salary',name:kind==='office'?'食君之禄':'采食封邑',loot:q.reward,jewels:{},xp:0});return save();}
 function gatherReason(s,id){const n=Game.getNode(id),g=s.garrisons[id];if(!n?.wild||!s.conquered[id])return '需要先占领野地';if(!HeritageData.fields[n.type])return '平地不能采集';if(n.level<1)return '0 级野地不能开始采集';if(!g||g.phase!=='stationed'||!g.general||!Game.totalArmy(g.army))return '需要有将领率领的驻守部队';if(s.gatherings[id])return '正在采集';return '';}
 function startGather(id){const s=live(),reason=gatherReason(s,id);if(reason)return reason;const n=Game.getNode(id),g=s.garrisons[id];s.gatherings[id]={start:Date.now(),level:n.level,type:n.type,general:g.general,fooduse:Game.upkeep(g.army)};return save();}
 function gatherQuote(s,id){const a=s.gatherings[id],g=s.garrisons[id];if(!a||!g||g.phase!=='stationed')return null;const elapsed=Math.max(0,Date.now()-a.start),hours=Math.min(24,elapsed/HOUR),profile=HeritageData.fields[a.type],effectiveLevel=Math.log((a.level+.6)*1.25)/Math.log(1.2),amount=Math.floor(effectiveLevel*a.fooduse*profile.rate*hours),resource=Game.terrainTypes[a.type].resource,carry=Game.carry(g.army),room=Math.max(0,Math.floor(Game.capacity(resource)-s.res[resource])),received=Math.min(amount,carry,Math.max(0,Math.floor(Number.MAX_SAFE_INTEGER-s.res[resource]))),overCapacity=Math.max(0,received-room),rolls=Math.floor(hours),chance=Math.min(.6,.05+.01*(effectiveLevel+Math.floor((s.generalLevels[a.general]||1)/10)+Math.floor(a.fooduse/10000)));
  return {elapsed,hours,amount,resource,carry,room,received,overCapacity,discarded:amount-received,rolls,chance,xp:Math.floor(received*.01),ready:elapsed>=HOUR,cap:elapsed>=24*HOUR};
 }
 function weightedJewel(weights){const total=weights.reduce((a,b)=>a+b,0);let roll=Math.random()*total;for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0)return Object.keys(Progression.jewels)[i];}return 'nightPearl';}
 function collectGather(id){const s=live(),q=gatherQuote(s,id),a=s.gatherings[id];if(!q)return '没有可以结束的采集';if(!q.ready)return '至少采集 1 小时才能收获，可选择取消';const jewels={};for(let i=0;i<q.rolls;i++)if(Math.random()<q.chance){const key=weightedJewel(HeritageData.fields[a.type].weights);jewels[key]=(jewels[key]||0)+1;}
  const loot={[q.resource]:q.received};s.res[q.resource]+=q.received;for(const [key,n] of Object.entries(jewels))s.jewels[key]+=n;HeroSystem.addXp(s,a.general,q.xp);delete s.gatherings[id];record(s,{kind:'gather',node:id,name:Game.getNode(id).name,loot,jewels,xp:q.xp,discarded:q.discarded,overCapacity:q.overCapacity});return save();
 }
 function cancelGather(id){const s=live();if(!s.gatherings[id])return '这里没有进行采集';delete s.gatherings[id];return save();}
 function valid(s){const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
  if(!obj(s.cityRoles)||Object.keys(s.cityRoles).length!==2||!['commander','counsellor'].every(k=>s.cityRoles[k]===''||s.generals.includes(s.cityRoles[k])))return false;
  const staff=[s.governor,...Object.values(s.cityRoles)].filter(Boolean),deployed=[...(s.expedition?[s.expedition]:[]),...s.expeditions,...Object.values(s.garrisons)];if(new Set(staff).size!==staff.length||deployed.some(e=>staff.includes(e.general)))return false;
  const h=s.honors;if(!obj(h)||!Number.isInteger(h.office)||h.office<0||h.office>=HeritageData.offices.length||!Number.isInteger(h.noble)||h.noble<0||h.noble>=HeritageData.nobles.length||!obj(h.salaryClaims)||!['office','noble'].every(k=>int(h.salaryClaims[k])&&(h.salaryClaims[k]===0||Progression.period(h.salaryClaims[k])===h.salaryClaims[k])))return false;
  if(!obj(s.gatherings)||Object.keys(s.gatherings).length>10||!Object.entries(s.gatherings).every(([id,a])=>obj(a)&&Game.getNode(id,s)?.wild&&s.conquered[id]&&s.garrisons[id]?.phase==='stationed'&&s.garrisons[id].general===a.general&&int(a.start)&&Number.isInteger(a.level)&&a.level>=1&&a.level<=10&&Object.hasOwn(HeritageData.fields,a.type)&&a.type===Game.getNode(id,s).type&&Number.isFinite(a.fooduse)&&a.fooduse>=0&&a.fooduse<=Number.MAX_SAFE_INTEGER))return false;
  if(!Array.isArray(s.heritageHistory)||s.heritageHistory.length>10)return false;
  return s.heritageHistory.every(r=>obj(r)&&int(r.at)&&['salary','gather'].includes(r.kind)&&typeof r.name==='string'&&r.name.length<=100&&obj(r.loot)&&Object.entries(r.loot).every(([k,n])=>['food','wood','stone','iron','gold'].includes(k)&&int(n))&&obj(r.jewels)&&Object.entries(r.jewels).every(([k,n])=>Object.hasOwn(Progression.jewels,k)&&int(n)&&n<=24)&&int(r.xp)&&(r.kind==='salary'||Game.getNode(r.node,s)?.wild&&int(r.discarded)&&(r.overCapacity===undefined||int(r.overCapacity)&&r.overCapacity<=Object.values(r.loot).reduce((sum,n)=>sum+n,0))));
 }
 return {roles,HOUR,init,office,noble,roleHero,roleOf,effectiveHero,assign,ownedCounties,jewelPayment,promotionQuote,promote,salaryQuote,salary,gatherReason,startGather,gatherQuote,collectGather,cancelGather,valid};
})();


// SOURCE: npc-data.js
'use strict';
// Standalone PVE defense rules are trial values, independent of historical handbook tables.
const NPCDefenseData={
  unlockHall:2,intervalMs:30*60*1000,warningMs:5*60*1000,maxLevel:10,classicMaxLevel:5,maxRounds:30,
  distance:2000,marchPerRound:200,abatisSlow:.5,wallHp:2000,baseGateHp:3000,
  trapDamage:300,fortificationPerLevel:.1,repairPerLevel:.05,
  wonWounded:.35,lostWounded:.15,raidFraction:.1,rewardPerLevel:150,xpPerLevel:30,
  waveArmy:{militia:18,spear:6,archer:3},cavalryMinLevel:3,cavalryPerLevel:2,
  generalAttackDivisor:220,generalDefenseDivisor:300,
  profiles:[
    {id:'classic',name:'黄巾游军',hall:2,description:'传统步弓混编，周期来袭使用此阵容。',army:{militia:18,spear:6,archer:3},reward:{food:150,wood:150},gold:0,food:0},
    {id:'cavalry',name:'黄巾突骑',hall:4,description:'快速骑军，拒马和长枪兵可拦截。',army:{militia:8,spear:8,cavalry:12,heavy:2},reward:{food:400,wood:300,gold:600},gold:400,food:200},
    {id:'archer',name:'黄巾强弓',hall:5,description:'弓箭手与床弩远射，城墙和箭塔可分担火力。',army:{shield:14,archer:18,ballista:2},reward:{food:300,wood:400,gold:700},gold:500,food:200},
    {id:'siege',name:'黄巾攻城军',hall:6,description:'冲车与投石车威胁城门，需要器械与工事配合。',army:{shield:15,spear:10,ram:5,catapult:3},reward:{food:300,wood:300,iron:300,gold:900},gold:700,food:300},
    // Internal front profiles: only RegionalFront's city-bound request may create them.
    {id:'region_granary',name:'护粮战线敌军',regional:true,hall:2,gold:0,food:0},
    {id:'region_mine',name:'保矿战线敌军',regional:true,hall:2,gold:0,food:0},
    {id:'region_pass',name:'扼守战线敌军',regional:true,hall:2,gold:0,food:0}
  ]
};


// SOURCE: war-care.js
'use strict';
// v0.33: per-city defense doctrine and a paid hospital. Old returned wounded are not reclaimed.
const WarCare=(()=>{
  const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const int=n=>Number.isSafeInteger(n)&&n>=0;
  const time=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
  const roster=u=>u||(typeof ManualData!=='undefined'?ManualData.units:{});
  const blank=u=>Object.fromEntries(Object.keys(roster(u)).map(id=>[id,0]));
  const sum=a=>Object.values(a).reduce((n,v)=>n+v,0);
  const same=(a,b)=>JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort());
  const counts=(a,u,full=true)=>obj(a)&&(!full||Object.keys(u).every(id=>int(a[id])))&&Object.entries(a).every(([id,n])=>Object.hasOwn(u,id)&&int(n));
  function defaultDefense(u){return {mode:'field',autoResolve:true,orders:Object.fromEntries(Object.keys(roster(u)).map(id=>[id,{command:'hold',target:''}]))};}
  function init(s,u){u=roster(u);if(s.warCare===undefined)s.warCare={version:1,defense:defaultDefense(u),autoHeal:false,wounded:blank(u),admitted:blank(u),treated:blank(u),receipts:{},archived:{counts:blank(u),through:{}}};return s.warCare;}
  const cityOf=s=>s.scopeID||s.realm?.activeCity;
  function token(id){const m=/^(field|npc|pvp):([^:]+):([0-9]+)(?::([^:]+))?$/.exec(id),sequence=m?Number(m[3]):NaN;return m&&int(sequence)&&sequence>0&&(m[1]!=='npc'?!!m[4]:!m[4])?{city:m[2],channel:m[1]+':'+m[2]+(m[1]!=='npc'?':'+m[4]:''),sequence}:null;}
  function validDefense(d,u){u=roster(u);return obj(d)&&['field','inside'].includes(d.mode)&&typeof d.autoResolve==='boolean'&&obj(d.orders)&&Object.keys(d.orders).length===Object.keys(u).length&&Object.keys(u).every(id=>{const r=d.orders[id];return obj(r)&&Object.keys(r).length===2&&['advance','hold','fallback'].includes(r.command)&&typeof r.target==='string'&&(r.target===''||Object.hasOwn(u,r.target));});}
  function valid(s,u){
    u=roster(u);const w=s.warCare;if(!obj(w)||w.version!==1||!validDefense(w.defense,u)||typeof w.autoHeal!=='boolean'||![w.wounded,w.admitted,w.treated].every(a=>counts(a,u))||!obj(w.receipts))return false;
    if(!obj(w.archived)||!counts(w.archived.counts,u)||!obj(w.archived.through)||Object.entries(w.archived.through).some(([channel,n])=>!/^(npc:[^:]+|(field|pvp):[^:]+:[^:]+)$/.test(channel)||cityOf(s)&&channel.split(':')[1]!==cityOf(s)||!int(n))||Object.keys(w.receipts).length>100)return false;
    const total={...w.archived.counts};
    for(const [id,r]of Object.entries(w.receipts)){const t=token(id);if(!t||id.length>200||cityOf(s)&&t.city!==cityOf(s)||t.sequence<=(w.archived.through[t.channel]||0)||!obj(r)||Object.keys(r).length!==2||!time(r.at)||!counts(r.counts,u,false)||!sum(r.counts))return false;for(const [unit,n]of Object.entries(r.counts)){total[unit]+=n;if(!int(total[unit]))return false;}}
    if(!Object.keys(u).every(id=>total[id]===w.admitted[id]&&w.treated[id]<=w.admitted[id]&&w.wounded[id]===w.admitted[id]-w.treated[id]))return false;
    if(w.lastAuto!==undefined){const r=w.lastAuto;if(!obj(r)||!time(r.at)||!['healed','gold','remaining'].every(k=>int(r[k]))||typeof r.blocked!=='boolean')return false;}
    return true;
  }
  function setDefense(s,d,u){if(!validDefense(d,u))return '守城战术格式不正确';if(s.cityDefense?.battle)return '当前守城战使用已冻结战术，请结束后再调整';s.warCare.defense=JSON.parse(JSON.stringify(d));return null;}
  function defenseSnapshot(s,u){return JSON.parse(JSON.stringify(s.warCare?.defense||defaultDefense(u)));}
  function admit(s,id,a,now,u){
    u=roster(u);init(s,u);const t=typeof id==='string'?token(id):null;if(!t||id.length>200||cityOf(s)&&t.city!==cityOf(s)||!time(now)||!counts(a,u,false))return '伤兵来源记录不正确';
    const positive=Object.fromEntries(Object.entries(a).filter(([,n])=>n>0)),w=s.warCare,old=w.receipts[id];
    if(old)return same(old.counts,positive)?null:'同一战斗的伤兵记录不匹配';
    if(t.sequence<=(w.archived.through[t.channel]||0))return '该历史战斗的伤兵已经结算';
    if(!sum(positive))return null;
    if(Object.entries(positive).some(([unit,n])=>!int(w.admitted[unit]+n)||!int(w.wounded[unit]+n)))return '伤兵数量达到数值上限';
    w.receipts[id]={at:now,counts:positive};for(const [unit,n]of Object.entries(positive)){w.admitted[unit]+=n;w.wounded[unit]+=n;}
    if(Object.keys(w.receipts).length>100){const [retired,r]=Object.entries(w.receipts).sort((a,b)=>a[1].at-b[1].at||token(a[0]).sequence-token(b[0]).sequence)[0],past=token(retired);w.archived.through[past.channel]=Math.max(w.archived.through[past.channel]||0,past.sequence);for(const [unit,n]of Object.entries(r.counts))w.archived.counts[unit]+=n;delete w.receipts[retired];}
    return null;
  }
  // Trial gold price: 5% of one soldier's original recruitment materials, minimum 1.
  function price(id,u){const row=roster(u)[id];return row?Math.max(1,Math.ceil(Object.entries(row.cost||{}).filter(([r])=>['food','wood','stone','iron'].includes(r)).reduce((n,[,v])=>n+v,0)*.05)):null;}
  function quote(s,unit='all',count,u){
    u=roster(u);const w=s.warCare;if(!w||unit!=='all'&&!Object.hasOwn(u,unit))return null;
    const available=unit==='all'?sum(w.wounded):w.wounded[unit];
    if(count!==undefined&&(!int(count)||unit==='all'))return null;
    const amount=count===undefined?available:Math.min(count,available),selected=unit==='all'?{...w.wounded}:{[unit]:amount},gold=sum(Object.fromEntries(Object.entries(selected).map(([id,n])=>[id,n*price(id,u)])));
    const rows=Object.keys(u).map(id=>({id,count:w.wounded[id],price:price(id,u),gold:w.wounded[id]*price(id,u),affordable:Math.min(w.wounded[id],Math.floor(s.res.gold/price(id,u)))}));
    const reason=!int(gold)||!int(amount)?'治疗数量达到数值上限':!amount?'本城没有待治疗的伤兵':gold>s.res.gold?'黄金不足：需要 '+gold+'，现有 '+Math.floor(s.res.gold):Object.entries(selected).some(([id,n])=>!int((s.army[id]||0)+n))?'驻军数量达到数值上限':'';
    return {unit,count:amount,selected,gold,available,rows,autoHeal:w.autoHeal,reason,key:[unit,amount,w.wounded[unit]??available,sum(w.treated)].join('|'),lastAuto:w.lastAuto?{...w.lastAuto}:null};
  }
  function heal(s,unit='all',count,key,u){
    const q=quote(s,unit,count,u);if(!q)return '请选择有效兵种与治疗人数';if(key!==undefined&&key!==q.key)return '治疗预览已变化，请重新查看';if(q.reason)return q.reason;
    s.res.gold-=q.gold;for(const [id,n]of Object.entries(q.selected)){s.warCare.wounded[id]-=n;s.warCare.treated[id]+=n;s.army[id]=(s.army[id]||0)+n;}
    return {healed:q.count,gold:q.gold,counts:{...q.selected}};
  }
  function setAuto(s,enabled){if(typeof enabled!=='boolean')return '请选择是否自动治疗';s.warCare.autoHeal=enabled;return null;}
  function tick(s,now,u){
    u=roster(u);const w=s.warCare;if(!w?.autoHeal||!sum(w.wounded))return null;let healed=0,gold=0;
    for(const id of Object.keys(u)){const n=Math.min(w.wounded[id],Math.floor(s.res.gold/price(id,u)));if(!n)continue;const result=heal(s,id,n,undefined,u);if(typeof result==='string')continue;healed+=result.healed;gold+=result.gold;}
    const remaining=sum(w.wounded),blocked=remaining>0;
    if(healed||!w.lastAuto||w.lastAuto.remaining!==remaining||w.lastAuto.blocked!==blocked)w.lastAuto={at:now,healed,gold,remaining,blocked};
    return {healed,gold,remaining,blocked};
  }
  return {init,valid,validDefense,defaultDefense,setDefense,defenseSnapshot,admit,price,quote,heal,setAuto,tick,heldArmy:s=>({...s.warCare?.wounded})};
})();


// SOURCE: npc-defense.js
'use strict';
const NPCDefense=(()=>{
  const C=NPCDefenseData;
  const total=a=>Object.values(a).reduce((sum,n)=>sum+n,0);
  const blank=units=>Object.fromEntries(Object.keys(units).map(id=>[id,0]));
  function init(s){
    if(s.cityDefense===undefined)s.cityDefense={autoEnabled:false,nextAt:0,wave:0,wins:0,incoming:null,battle:null,reports:[]};
    else if(s.cityDefense&&typeof s.cityDefense==='object'&&s.cityDefense.autoEnabled===undefined)s.cityDefense.autoEnabled=true;
  }
  const unlocked=s=>s.buildings.hall>=C.unlockHall&&s.stats.victories>=1;
  const profile=id=>C.profiles.find(p=>p.id===id);
  function challengeQuote(s,profileId='classic',selectedLevel){
    const p=profile(profileId);if(!p||p.regional)return null;
    const level=selectedLevel===undefined?Math.min(profileId==='classic'?C.classicMaxLevel:C.maxLevel,Math.max(1,s.buildings.hall)):selectedLevel;
    if(!Number.isInteger(level)||level<1||level>(profileId==='classic'?C.classicMaxLevel:C.maxLevel))return null;
    const army=Object.fromEntries(Object.entries(p.army).map(([id,n])=>[id,n*level]));if(profileId==='classic'&&level>=C.cavalryMinLevel)army.cavalry=C.cavalryPerLevel*level;
    const cost={gold:p.gold*level*level,food:p.food*level},reward=Object.fromEntries(Object.entries(p.reward).map(([id,n])=>[id,n*level]));
    const reason=!unlocked(s)?'官府达到 2 级并赢得一次出征后可发起黄巾挑战':s.buildings.hall<p.hall?'需要 '+p.hall+' 级官府':profileId!=='classic'&&level>s.buildings.hall?'挑战难度不能超过官府等级':s.cityDefense.incoming||s.cityDefense.battle?'已有来袭或守城战，请先处理当前事件':s.res.gold<cost.gold?'黄金不足':s.res.food<cost.food?'粮食不足':'';
    return {profile:profileId,name:p.name,description:p.description,level,maxLevel:profileId==='classic'?C.classicMaxLevel:Math.min(C.maxLevel,s.buildings.hall),army,cost,reward,xp:level*C.xpPerLevel,warningSeconds:C.warningMs/1000,reason,key:[profileId,level,s.buildings.hall,s.cityDefense.wave,!!s.cityDefense.incoming,!!s.cityDefense.battle].join('|')};
  }
  function requestChallenge(s,now,profileId='classic',level,key){
    const d=s.cityDefense;if(!unlocked(s))return '官府达到 2 级并赢得一次出征后可发起黄巾挑战';
    if(d.incoming||d.battle)return '已有来袭或守城战，请先处理当前事件';
    const q=challengeQuote(s,profileId,level);if(!q||key!==undefined&&key!==q.key)return '挑战条件已变化，请重新查看';if(q.reason)return q.reason;
    s.res.gold-=q.cost.gold;s.res.food-=q.cost.food;d.incoming=makeWave(s,now,false,profileId,q.level);d.wave=d.incoming.wave;d.nextAt=0;return null;
  }
  function setAutomatic(s,now,enabled){
    if(typeof enabled!=='boolean')return '请选择是否开启周期来袭';
    if(enabled&&!unlocked(s))return '官府达到 2 级并赢得一次出征后可开启周期来袭';
    s.cityDefense.autoEnabled=enabled;
    if(enabled&&!s.cityDefense.nextAt&&!s.cityDefense.incoming&&!s.cityDefense.battle)s.cityDefense.nextAt=now+C.intervalMs;
    return null;
  }
  function requestRegional(s,now,meta){
    const d=s.cityDefense,q=typeof RegionalFront==='undefined'?null:RegionalFront.waveSpec(meta);
    if(!q||meta.startedAt!==now||s.regionalFront?.run?.status!=='incoming'||!RegionalFront.matches(s,meta))return '战线预览已变化，请重新准备';
    if(d.incoming||d.battle)return '本城已有来袭或守城战，请先处理';
    const incoming={wave:d.wave+1,level:meta.level,army:{...q.army},arriveAt:meta.arriveAt,profile:q.profile,rewardSnapshot:{...q.reward},costSnapshot:{...q.cost},front:{...meta}};
    if(!RegionalFront.valid({...s,cityDefense:{...d,incoming}}))return '战线记录不匹配，请重新载入';
    d.incoming=incoming;
    d.wave=d.incoming.wave;d.nextAt=0;return null;
  }
  function makeWave(s,now,drill=false,profileId='classic',selectedLevel){
    const q=challengeQuote(s,profileId,selectedLevel);if(!q)return null;
    return {wave:drill?0:s.cityDefense.wave+1,level:q.level,army:q.army,arriveAt:now+(drill?0:C.warningMs),...(profileId==='classic'?{}:{profile:profileId,rewardSnapshot:q.reward,costSnapshot:q.cost})};
  }
  function beaconIntel(s,w=s.cityDefense.incoming){
    if(!w)return null;const beacon=s.buildings.beacon||0,precision=w.front?'exact':beacon>=7?'exact':beacon>=4?'bands':beacon>=1?'types':'warning';
    const types=Object.keys(w.army).filter(id=>w.army[id]>0),army=precision==='exact'?{...w.army}:precision==='bands'?Object.fromEntries(types.map(id=>{const n=w.army[id],band=Math.max(10,10**Math.floor(Math.log10(n||1)));return [id,{min:Math.floor(n/band)*band,max:(Math.floor(n/band)+1)*band-1}];})):null;
    return {precision,exact:precision==='exact',profile:w.profile||'classic',name:w.front&&typeof RegionalFront!=='undefined'?RegionalFront.waveSpec(w.front)?.name||profile(w.profile).name:profile(w.profile||'classic').name,level:w.level,arriveAt:w.arriveAt,types:precision==='warning'?[]:types,army};
  }
  function tick(s,now){
    const d=s.cityDefense;
    if(!d.autoEnabled||!unlocked(s)||d.incoming||d.battle)return;
    if(!d.nextAt)d.nextAt=now+C.intervalMs;
    if(now>=d.nextAt){d.incoming=makeWave(s,now);d.wave=d.incoming.wave;d.nextAt=0;}
  }
  function heldArmy(s){const b=s.cityDefense?.battle;return b&&!b.drill?b.army:{};}
  function heldDefenses(s){const b=s.cityDefense?.battle;return b&&!b.drill?b.defenses:{};}
  function begin(s,api,now,drill=false,generalId=s.governor,selectedArmy){
    const d=s.cityDefense;
    if(typeof drill!=='boolean')return '请选择正式守城或演练';
    if(d.battle)return '已有守城战或演练正在进行';
    if(s.battle&&!s.battle.finished)return '请先结束当前出征战斗';
    if(!drill&&(!d.incoming||d.incoming.arriveAt>now))return '敌军尚未抵达';
    if(!s.generals.includes(generalId))return '请选择已招募的守将';
    const deployed=[...(s.expedition?[s.expedition]:[]),...(s.expeditions||[]),...Object.values(s.garrisons||{})];
    if(api.generalBusy?.(generalId)||deployed.some(e=>e.general===generalId))return '守将正在出征或驻守，请选择留城将领';
    if(generalId!==s.governor&&Object.values(s.cityRoles||{}).includes(generalId))return '主将或军师正在任职，请先卸任；城守可亲自守城';
    const source=selectedArmy===undefined?s.army:selectedArmy;
    if(!source||typeof source!=='object'||Array.isArray(source)||Object.keys(source).some(id=>!Object.hasOwn(api.units,id)))return '驻城配兵格式不正确';
    const army=blank(api.units);
    for(const id of Object.keys(api.units)){const n=Object.hasOwn(source,id)?source[id]:0;if(!Number.isSafeInteger(n)||n<0||n>s.army[id])return '守城兵数必须为驻城兵力范围内的非负整数';army[id]=n;}
    const wave=drill?makeWave(s,now,true):d.incoming,general=generalId,defenses={...s.defenses};
    if(!drill&&wave.front){const q=typeof RegionalFront==='undefined'?null:RegionalFront.waveSpec(wave.front),same=(a,b)=>a&&Object.keys(a).length===Object.keys(b).length&&Object.entries(b).every(([id,n])=>a[id]===n);if(!q||!RegionalFront.matches(s,wave.front)||q.profile!==wave.profile||!same(wave.army,q.army)||!same(wave.rewardSnapshot,q.reward)||!same(wave.costSnapshot,q.cost)||wave.arriveAt!==wave.front.arriveAt)return '战线来袭记录不匹配，请重新载入';}
    const rows=(a,player)=>Object.entries(a).filter(([,n])=>n>0).map(([id,n])=>{const stats=api.unitStats(id,player);return {id,count:n,stats,hp:n*stats.hp};}),player=rows(army,true),enemy=rows(wave.army,false);
    const fortified=1+s.tech.fortification*C.fortificationPerLevel;
    const forts=Object.entries(defenses).filter(([,n])=>n>0).map(([id,n])=>({id,count:n,hp:n*api.defenses[id].hp*fortified,used:0}));
    const g=api.general(general),generalSnapshot={id:general,name:g.name,atk:g.atk,def:g.def},skillProfile=typeof GeneralGrowth!=='undefined'?GeneralGrowth.profile(s,general):undefined;
    // Every selection has passed before the paid prepared defense is atomically consumed.
    const administrationDefense=drill?null:api.consumeAdministrationDefense?.(general,drill)||null;
    const baseGateMax=(C.baseGateHp+s.buildings.wall*C.wallHp)*fortified,gateMax=baseGateMax*(administrationDefense?.gateFactor||1);
    delete d.drillResult;
    const contribution={wallBonus:Math.max(0,baseGateMax-C.baseGateHp*fortified),...(administrationDefense?{administrationGateBonus:gateMax-baseGateMax}:{}),gateDamage:0,abatisDelayed:0,armyDamage:0,forts:{}};
    d.battle={fortification:fortified,drill,wave:wave.wave,level:wave.level,general,generalSnapshot,...(skillProfile?{skillProfile}:{}),...(wave.profile?{profile:wave.profile,rewardSnapshot:{...wave.rewardSnapshot},costSnapshot:{...wave.costSnapshot}}:{}),...(wave.front?{front:{...wave.front}}:{}),...(administrationDefense?{administrationDefense}:{}),army,defenses,player,enemy,forts,gateMax,gateHp:gateMax,distance:C.distance,round:0,contribution,log:[(profile(wave.profile||'classic').name)+'逼近城池，'+g.name+'率所选 '+total(army)+' 人迎敌；未参战部队留城。','城墙增加城门耐久 '+Math.round(contribution.wallBonus)+(administrationDefense?'，庞统预备额外增加 '+Math.round(contribution.administrationGateBonus):'')+'，总耐久 '+Math.round(gateMax)+'。']};
    if(typeof WarCare!=='undefined'){
      WarCare.init(s,api.units);const b=d.battle;
      b.commandVersion=1;b.doctrine=WarCare.defenseSnapshot(s,api.units);b.careId='npc:'+(s.scopeID||s.realm?.activeCity||'capital')+':'+wave.wave;
      for(const r of b.player)r.pos=0;for(const r of b.enemy)r.pos=C.distance;
      log(b,b.doctrine.mode==='inside'?'驻军留城，不攻击也不受敌军伤害；由工事先战，工事耗尽后城门承受接触进攻。':'所选驻军出城迎战，按各兵种预设自动移动并选择攻击目标；未选驻军安全留城。');
    }
    if(!drill){for(const id of Object.keys(s.army))s.army[id]-=army[id];for(const id of Object.keys(s.defenses))s.defenses[id]=0;d.incoming=null;}
    return null;
  }
  function log(b,text){b.log.push(text);b.log=b.log.slice(-20);}
  const living=rows=>rows.filter(r=>r.hp>0);
  const number=r=>Math.ceil(r.hp/r.stats.hp);
  function damage(rows,amount){let rest=amount,actual=0;for(const row of living(rows)){const dealt=Math.min(row.hp,rest/(1+row.stats.def/200));row.hp-=dealt;actual+=dealt;rest=Math.max(0,rest-dealt*(1+row.stats.def/200));if(!rest)break;}return actual;}
  function fortImpact(b,id,key,amount){if(!b.contribution)return;const row=b.contribution.forts[id]||(b.contribution.forts[id]={damage:0,absorbed:0});row[key]+=amount;}
  function round(s,api,now){
    const b=s.cityDefense.battle;if(!b)return '当前没有守城战';
    if(b.commandVersion===1)return commandedRound(s,api,now);
    b.round++;const g=b.generalSnapshot||api.general(b.general),abatis=b.forts.some(f=>f.id==='abatis'&&f.hp>0);
    const beforeDistance=b.distance,slowed=abatis&&b.distance<=api.defenses.abatis.range;
    b.distance=Math.max(0,b.distance-C.marchPerRound*(b.profile==='cavalry'||b.profile==='region_pass'?1.5:1)*(slowed?C.abatisSlow:1));
    log(b,'第 '+b.round+' 回合 · 敌军距城门 '+b.distance);
    if(slowed){const delayed=Math.max(0,Math.min(beforeDistance,C.marchPerRound)-(beforeDistance-b.distance));if(b.contribution)b.contribution.abatisDelayed+=delayed;if(delayed)log(b,'拒马阻滞，本回合敌军少前进 '+delayed+' 距离。');}
    for(const f of b.forts){
      const cfg=api.defenses[f.id];if(b.distance>cfg.range||!living(b.enemy).length)continue;
      if(cfg.oneUse){if(f.used>=f.count)continue;const count=Math.min(f.count-f.used,total(living(b.enemy).map(number)));f.used+=count;const hit=count*(f.id==='trap'?C.trapDamage:cfg.atk),actual=damage(b.enemy,hit);fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 消耗 '+count+' 个，攻击 '+hit+' 点，实际削减敌军生命 '+Math.round(actual)+'。');}
      else if(f.hp>0&&cfg.atk){const hit=Math.ceil(f.hp/(cfg.hp*b.fortification))*cfg.atk,actual=damage(b.enemy,hit);fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 射击，攻击 '+hit+' 点，实际削减敌军生命 '+Math.round(actual)+'。');}
    }
    const attack=living(b.player).filter(r=>r.stats.range>=b.distance).reduce((sum,r)=>sum+number(r)*r.stats.atk*(b.skillProfile?.attackByUnit?.[r.id]||1),0)*(1+g.atk/C.generalAttackDivisor);
    if(attack){const actual=damage(b.enemy,attack);if(b.contribution)b.contribution.armyDamage+=actual;log(b,'守军攻击 '+Math.round(attack)+' 点，实际削减敌军生命 '+Math.round(actual)+'。');}
    if(!living(b.enemy).length)return finish(s,api,now,true);
    let hit=living(b.enemy).filter(r=>r.stats.range>=b.distance).reduce((sum,r)=>sum+number(r)*r.stats.atk,0)/(1+g.def/C.generalDefenseDivisor);
    if(hit){
      for(const f of b.forts.filter(f=>f.hp>0)){const cfg=api.defenses[f.id],dealt=Math.min(f.hp,hit/(1+cfg.def/200));f.hp-=dealt;fortImpact(b,f.id,'absorbed',dealt);if(dealt)log(b,cfg.name+' 承受 '+Math.round(dealt)+' 点耐久损伤。');hit=Math.max(0,hit-dealt*(1+cfg.def/200));if(!hit)break;}
      for(const r of living(b.player)){const dealt=Math.min(r.hp,hit/(1+r.stats.def/200));r.hp-=dealt;hit=Math.max(0,hit-dealt*(1+r.stats.def/200));if(!hit)break;}
      if(b.distance===0||b.profile==='siege'&&b.distance<=600){const before=b.gateHp;b.gateHp=Math.max(0,b.gateHp-hit);if(b.contribution)b.contribution.gateDamage+=before-b.gateHp;}
      log(b,'敌军进攻，城门耐久 '+Math.ceil(b.gateHp)+' / '+Math.ceil(b.gateMax)+'。');
    }
    if(b.gateHp<=0)return finish(s,api,now,false);
    if(b.round>=C.maxRounds)return finish(s,api,now,true);
    return null;
  }
  function commandedRound(s,api,now){
    const b=s.cityDefense.battle,g=b.generalSnapshot||api.general(b.general);b.round++;
    const before=b.distance,abatis=b.forts.some(f=>f.id==='abatis'&&f.hp>0),slowed=abatis&&b.distance<=api.defenses.abatis.range;
    const step=C.marchPerRound*(b.profile==='cavalry'||b.profile==='region_pass'?1.5:1)*(slowed?C.abatisSlow:1);
    for(const r of living(b.enemy))r.pos=Math.max(0,r.pos-step);
    b.distance=living(b.enemy).length?Math.min(...living(b.enemy).map(r=>r.pos)):0;
    log(b,'第 '+b.round+' 回合 · 敌军距城门 '+b.distance);
    if(slowed){const delayed=Math.max(0,Math.min(before,step/(C.abatisSlow||1))-(before-b.distance));b.contribution.abatisDelayed+=delayed;if(delayed)log(b,'拒马阻滞，敌军少前进 '+delayed+' 距离。');}
    for(const f of b.forts){
      const cfg=api.defenses[f.id],inRange=living(b.enemy).filter(r=>r.pos<=cfg.range);if(!inRange.length)continue;
      if(cfg.oneUse){if(f.used>=f.count||cfg.hp>0&&f.hp<=0)continue;const count=Math.min(f.count-f.used,cfg.hp>0?Math.ceil(f.hp/(cfg.hp*b.fortification)):f.count-f.used,total(inRange.map(number)));f.used+=count;if(cfg.hp>0)f.hp=Math.max(0,f.hp-count*cfg.hp*b.fortification);const actual=damage(inRange,count*(f.id==='trap'?C.trapDamage:cfg.atk));fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 消耗 '+count+'，削减敌军生命 '+Math.round(actual)+'。');}
      else if(f.hp>0&&cfg.atk){const actual=damage(inRange,Math.ceil(f.hp/(cfg.hp*b.fortification))*cfg.atk);fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 射击，削减敌军生命 '+Math.round(actual)+'。');}
    }
    const nearest=(rows,pos)=>[...rows].sort((a,c)=>Math.abs(a.pos-pos)-Math.abs(c.pos-pos))[0];
    if(b.doctrine.mode==='field')for(const r of living(b.player)){
      const order=b.doctrine.orders[r.id],enemies=living(b.enemy),preferred=enemies.find(e=>e.id===order.target),aim=preferred||nearest(enemies,r.pos);if(!aim)break;
      const old=r.pos,movement=Math.min(400,Math.max(50,r.stats.speed*.5));
      if(order.command==='advance')r.pos=Math.min(C.distance,r.pos+Math.min(movement,Math.max(0,aim.pos-r.pos)));
      if(order.command==='fallback')r.pos=Math.max(0,r.pos-movement);
      if(old!==r.pos)log(b,api.units[r.id].name+(order.command==='fallback'?'后退':'前进')+' '+Math.round(Math.abs(old-r.pos))+'，距城门 '+Math.round(r.pos)+'。');
      const inRange=enemies.filter(e=>Math.abs(e.pos-r.pos)<=r.stats.range),target=inRange.find(e=>e.id===order.target)||nearest(inRange,r.pos);if(!target)continue;
      const before=number(target),actual=damage([target],number(r)*r.stats.atk*(b.skillProfile?.attackByUnit?.[r.id]||1)*(1+g.atk/C.generalAttackDivisor));
      b.contribution.armyDamage+=actual;log(b,api.units[r.id].name+' 攻击 '+api.units[target.id].name+'，敌军损失 '+(before-number(target))+' 人。');
    }
    if(!living(b.enemy).length)return finish(s,api,now,true);
    for(const e of living(b.enemy)){
      let hit=number(e)*e.stats.atk/(1+g.def/C.generalDefenseDivisor);
      const exposed=b.doctrine.mode==='field'?living(b.player).filter(r=>Math.abs(r.pos-e.pos)<=e.stats.range):[],target=nearest(exposed,e.pos);
      if(target){const before=number(target);damage([target],hit);log(b,api.units[e.id].name+' 攻击 '+api.units[target.id].name+'，守军损失 '+(before-number(target))+' 人。');continue;}
      if(e.pos>e.stats.range)continue;
      // One attack budget: visible fortifications absorb it before contact can damage the gate.
      for(const f of b.forts.filter(f=>f.hp>0&&(!api.defenses[f.id].oneUse||f.used<f.count))){const cfg=api.defenses[f.id],dealt=Math.min(f.hp,hit/(1+cfg.def/200));f.hp-=dealt;fortImpact(b,f.id,'absorbed',dealt);hit=Math.max(0,hit-dealt*(1+cfg.def/200));if(!hit)break;}
      if(e.pos===0||b.profile==='siege'&&e.pos<=600){const before=b.gateHp;b.gateHp=Math.max(0,b.gateHp-hit);b.contribution.gateDamage+=before-b.gateHp;}
    }
    log(b,'敌军进攻后，城门耐久 '+Math.ceil(b.gateHp)+' / '+Math.ceil(b.gateMax)+'。');
    if(b.gateHp<=0)return finish(s,api,now,false);
    if(b.round>=C.maxRounds)return finish(s,api,now,true);
    return null;
  }
  function resolve(s,api,now){if(!s.cityDefense.battle)return '当前没有守城战';let result=null;for(let i=0;i<C.maxRounds&&s.cityDefense.battle;i++){result=round(s,api,now);if(typeof result==='string')return result;}return result;}
  function finish(s,api,now,won){
    const d=s.cityDefense,b=d.battle;if(!b)return null;
    const lost=blank(api.units),wounded=blank(api.units),back=blank(api.units),defenseLost={},repaired={},robbed={};
    const hospital=!b.drill&&b.commandVersion===1&&typeof WarCare!=='undefined';
    for(const id of Object.keys(api.units)){const row=b.player.find(r=>r.id===id),alive=row?number(row):0;wounded[id]=Math.floor((b.army[id]-alive)*(won?C.wonWounded:C.lostWounded));back[id]=alive+(hospital?0:wounded[id]);lost[id]=b.army[id]-alive-wounded[id];}
    if(hospital){const error=WarCare.admit(s,b.careId,wounded,now,api.units);if(error)return error;}
    for(const f of b.forts){const cfg=api.defenses[f.id],alive=cfg.oneUse?Math.min(f.count-f.used,b.commandVersion===1&&cfg.hp>0?Math.ceil(f.hp/(cfg.hp*b.fortification)):f.count-f.used):Math.ceil(f.hp/(cfg.hp*b.fortification)),destroyed=f.count-alive;repaired[f.id]=cfg.oneUse?0:Math.floor(destroyed*s.tech.repair*C.repairPerLevel);defenseLost[f.id]=destroyed-repaired[f.id];}
    const reward=won?(b.rewardSnapshot||{food:b.level*C.rewardPerLevel,wood:b.level*C.rewardPerLevel}):{},resourceReceipt=b.drill?null:api.settleLoot(reward);
    if(!b.drill){
      for(const id of Object.keys(back))s.army[id]+=back[id];
      for(const id of Object.keys(b.defenses))s.defenses[id]+=b.defenses[id]-(defenseLost[id]||0);
      if(won)d.wins++;else {const enemies=Object.fromEntries(b.enemy.map(r=>[r.id,number(r)])),available=Object.fromEntries(['food','wood','stone','iron'].map(id=>[id,Math.floor(s.res[id]*C.raidFraction)]));Object.assign(robbed,api.capLoot(available,api.carry(enemies)));for(const [id,n] of Object.entries(robbed))s.res[id]-=n;}
      if(won)api.addXp(b.general,b.level*C.xpPerLevel);if(d.autoEnabled)d.nextAt=now+C.intervalMs;
    }
    const enemyRemaining=total(living(b.enemy).map(number)),victoryReason=won?(enemyRemaining?'held':'cleared'):'gate';
    const report={id:now,kind:'defense',drill:b.drill,wave:b.wave,level:b.level,...(b.commandVersion===1?{commandVersion:1,doctrine:b.doctrine}:{}),...(hospital?{woundedInHospital:true,careId:b.careId}:{}),...(b.profile?{profile:b.profile,costSnapshot:b.costSnapshot,rewardSnapshot:b.rewardSnapshot}:{}),...(b.front?{front:{...b.front}}:{}),...(b.administrationDefense?{administrationDefense:b.administrationDefense}:{}),general:b.general,round:b.round,won,victoryReason,enemyRemaining,...(b.contribution?{contribution:b.contribution}:{}),lost,wounded,back,defenseLost,repaired,robbed,resourceReceipt,xp:b.drill||!won?0:b.level*C.xpPerLevel};
    if(!b.drill){d.reports.unshift(report);d.reports=d.reports.slice(0,20);}else d.drillResult=report;
    d.battle=null;return report;
  }
  function endDrill(s){if(!s.cityDefense.battle?.drill)return '只能结束演练，正式守城战需完成结算';s.cityDefense.battle=null;return null;}
  function validate(s,units,defenses,receiptValid,cityId=s.scopeID||s.realm?.activeCity){
    cityId=cityId||'capital';
    const d=s.cityDefense,obj=x=>x&&typeof x==='object'&&!Array.isArray(x),finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER,int=n=>Number.isSafeInteger(n)&&n>=0;
    const counts=(a,ids,full=false)=>obj(a)&&(!full||Object.keys(ids).every(id=>int(a[id])))&&Object.entries(a).every(([id,n])=>Object.hasOwn(ids,id)&&int(n));
    const same=(a,b)=>obj(a)&&Object.keys(a).length===Object.keys(b).length&&Object.entries(b).every(([k,n])=>a[k]===n);
    const regional=w=>typeof RegionalFront==='undefined'?null:RegionalFront.waveSpec(w.front);
    const administration=w=>w.administrationDefense===undefined||!w.drill&&typeof HeroAdministration!=='undefined'&&HeroAdministration.validDefenseSnapshot(w.administrationDefense,s,{cityId,historical:true});
    const metadata=w=>{const p=profile(w.profile);if(p?.regional){const q=regional(w);return !!q&&!w.drill&&w.front.city===cityId&&q.profile===w.profile&&w.level===w.front.level&&same(w.rewardSnapshot,q.reward)&&same(w.costSnapshot,q.cost);}if(w.front!==undefined)return false;if(w.profile===undefined)return w.level<=C.classicMaxLevel&&w.rewardSnapshot===undefined&&w.costSnapshot===undefined;return !!p&&p.id!=='classic'&&same(w.rewardSnapshot,Object.fromEntries(Object.entries(p.reward).map(([id,n])=>[id,n*w.level])))&&same(w.costSnapshot,{gold:p.gold*w.level*w.level,food:p.food*w.level});};
    const wave=w=>obj(w)&&int(w.wave)&&int(w.level)&&w.level>=1&&w.level<=C.maxLevel&&finite(w.arriveAt)&&counts(w.army,units)&&metadata(w)&&(w.front?same(w.army,regional(w).army)&&w.arriveAt===w.front.arriveAt:w.profile===undefined||same(w.army,Object.fromEntries(Object.entries(profile(w.profile).army).map(([id,n])=>[id,n*w.level]))));
    const historicalHero=id=>s.generals.includes(id)||['lin','su','yan'].includes(id)||(s.customGenerals||[]).some(g=>g.id===id);
    const doctrine=b=>b.commandVersion===undefined?b.doctrine===undefined&&b.woundedInHospital===undefined&&b.careId===undefined:b.commandVersion===1&&typeof WarCare!=='undefined'&&WarCare.validDefense(b.doctrine,units);
    const care=b=>b.commandVersion!==1||b.drill?b.woundedInHospital===undefined&&b.careId===undefined:b.woundedInHospital===true&&b.careId==='npc:'+cityId+':'+b.wave;
    const report=r=>obj(r)&&doctrine(r)&&care(r)&&finite(r.id)&&r.kind==='defense'&&typeof r.drill==='boolean'&&int(r.wave)&&int(r.level)&&r.level>=1&&r.level<=C.maxLevel&&historicalHero(r.general)&&int(r.round)&&r.round<=C.maxRounds&&typeof r.won==='boolean'&&counts(r.back,units,true)&&counts(r.lost,units,true)&&counts(r.wounded,units,true)&&counts(r.defenseLost,defenses)&&counts(r.repaired,defenses)&&obj(r.robbed)&&Object.entries(r.robbed).every(([id,n])=>['food','wood','stone','iron'].includes(id)&&int(n))&&finite(r.xp)&&(r.drill?r.resourceReceipt===null:receiptValid(r.resourceReceipt));
    const contribution=c=>c===undefined||obj(c)&&['wallBonus','gateDamage','abatisDelayed','armyDamage'].every(k=>finite(c[k]))&&(c.administrationGateBonus===undefined||finite(c.administrationGateBonus))&&obj(c.forts)&&Object.entries(c.forts).every(([id,r])=>Object.hasOwn(defenses,id)&&obj(r)&&finite(r.damage)&&finite(r.absorbed));
    const outcome=r=>(r.enemyRemaining===undefined||int(r.enemyRemaining))&&(r.victoryReason===undefined||int(r.enemyRemaining)&&(r.victoryReason==='cleared'?r.won&&r.enemyRemaining===0:r.victoryReason==='held'?r.won&&r.enemyRemaining>0&&r.round===C.maxRounds:r.victoryReason==='gate'&&!r.won));
    const recorded=r=>report(r)&&metadata(r)&&administration(r)&&contribution(r.contribution)&&outcome(r)&&(!r.front||same(r.resourceReceipt.loaded,r.won?regional(r).reward:{})&&r.xp===(r.won?regional(r).xp:0))&&(r.administrationDefense!==undefined?r.contribution?.administrationGateBonus>0:r.contribution?.administrationGateBonus===undefined);
    if(!obj(d)||(d.autoEnabled!==undefined&&typeof d.autoEnabled!=='boolean')||!finite(d.nextAt)||!int(d.wave)||!int(d.wins)||!(d.incoming===null||wave(d.incoming))||!Array.isArray(d.reports)||d.reports.length>20||!d.reports.every(recorded)||(d.drillResult!==undefined&&!recorded(d.drillResult)))return false;
    if(d.battle!==null){
      const b=d.battle,rows=(a,army)=>Array.isArray(a)&&new Set(a.map(r=>r.id)).size===a.length&&a.every(r=>obj(r)&&Object.hasOwn(units,r.id)&&int(r.count)&&r.count>0&&r.count===army[r.id]&&obj(r.stats)&&['hp','atk','def','range','speed'].every(k=>finite(r.stats[k]))&&r.stats.hp>0&&finite(r.hp)&&r.hp<=r.count*r.stats.hp)&&Object.entries(army).filter(([,n])=>n>0).every(([id])=>a.some(r=>r.id===id));
      const snapshot=b?.generalSnapshot,snapshotValid=snapshot===undefined||obj(snapshot)&&snapshot.id===b.general&&typeof snapshot.name==='string'&&snapshot.name.length<=100&&finite(snapshot.atk)&&finite(snapshot.def);
      const skillValid=b?.skillProfile===undefined||typeof GeneralGrowth!=='undefined'&&GeneralGrowth.validProfile(b.skillProfile);
      if(!doctrine(b)||b.commandVersion===1&&(b.careId!=='npc:'+cityId+':'+b.wave||b.woundedInHospital!==undefined||![...(b.player||[]),...(b.enemy||[])].every(r=>finite(r.pos)&&r.pos<=C.distance)))return false;
      if(!administration(b)||b.front&&!same(Object.fromEntries((b.enemy||[]).map(r=>[r.id,r.count])),regional(b)?.army))return false;
      if(b.administrationDefense!==undefined){const original=b.gateMax/b.administrationDefense.gateFactor;if(!b.contribution||Math.abs(b.contribution.administrationGateBonus-(b.gateMax-original))>1e-6)return false;}else if(b.contribution?.administrationGateBonus!==undefined)return false;
      if(!obj(b)||!metadata(b)||!snapshotValid||!skillValid||!contribution(b.contribution)||typeof b.drill!=='boolean'||!int(b.wave)||!int(b.level)||b.level<1||b.level>C.maxLevel||!s.generals.includes(b.general)||!counts(b.army,units,true)||!counts(b.defenses,defenses,true)||!int(b.round)||b.round>=C.maxRounds||!finite(b.fortification)||b.fortification<1||b.fortification>2||!finite(b.gateMax)||b.gateMax<=0||!finite(b.gateHp)||b.gateHp<=0||b.gateHp>b.gateMax||!finite(b.distance)||b.distance>C.distance||!rows(b.player,b.army)||!Array.isArray(b.enemy)||!rows(b.enemy,Object.fromEntries(b.enemy.map(r=>[r.id,r.count])))||!Array.isArray(b.forts)||new Set(b.forts.map(f=>f.id)).size!==b.forts.length||!b.forts.every(f=>obj(f)&&Object.hasOwn(defenses,f.id)&&int(f.count)&&f.count>0&&f.count===b.defenses[f.id]&&int(f.used)&&f.used<=f.count&&finite(f.hp)&&f.hp<=f.count*defenses[f.id].hp*b.fortification)||!Object.entries(b.defenses).filter(([,n])=>n>0).every(([id])=>b.forts.some(f=>f.id===id))||!Array.isArray(b.log)||b.log.length>20||!b.log.every(t=>typeof t==='string'&&t.length<1000)||(!b.drill&&d.incoming))return false;
    }
    return true;
  }
  function valid(...args){try{return validate(...args);}catch{return false;}}
  return {profiles:C.profiles.filter(p=>!p.regional),init,tick,makeWave,unlocked,challengeQuote,beaconIntel,requestChallenge,requestRegional,setAutomatic,heldArmy,heldDefenses,begin,round,resolve,endDrill,valid};
})();


// SOURCE: chapter-data.js
'use strict';
// Original PVE chapter; all armies, loot, rewards and production bonuses are trial values.
const ChapterData={
  title:'第二章 · 平定北境',
  nodes:[
    {id:'north_road',name:'北原驿道',terrain:'grass',x:34,y:19,level:5,chapter:2,requires:'fort',desc:'古渡以北商路断绝。先清除步弓混编的路匪，重新打通粮道。',army:{shield:90,spear:110,archer:100,cavalry:25},loot:{food:1800,wood:1000,iron:700,gold:1600},reward:'粮道恢复 · 粮食产量 +10%',bonus:{food:.1},time:36},
    {id:'north_granary',name:'北原粮仓',terrain:'camp',x:30,y:16,level:5,chapter:2,requires:'north_road',desc:'夺回粮仓前须控制北原驿道。敌军弓兵众多，准备前排护卫与运输部队。',army:{shield:120,spear:90,archer:150,cavalry:30},loot:{food:3200,wood:1200,stone:700,gold:2000},reward:'夺回军粮 · 木材产量 +10%',bonus:{wood:.1},time:40},
    {id:'north_ford',name:'寒川渡口',terrain:'lake',x:35,y:12,level:6,chapter:2,requires:'north_granary',desc:'粮仓供给稳固后才能进军渡口。枪兵守住桥头，骑兵巡逻两岸。',army:{spear:160,shield:110,archer:130,cavalry:60},loot:{food:2200,wood:1800,iron:1100,gold:2400},reward:'控制渡口 · 石料产量 +10%',bonus:{stone:.1},time:44},
    {id:'north_camp',name:'朔风骑营',terrain:'camp',x:39,y:10,level:6,chapter:2,requires:'north_ford',desc:'渡河后遭遇敌军骑营。用长枪兵抵挡冲阵，注意弓兵与运输队安全。',army:{cavalry:130,heavy:25,spear:110,archer:100},loot:{food:2600,wood:1300,iron:2000,gold:3000},reward:'拔除骑营 · 铁锭产量 +10%',bonus:{iron:.1},time:48},
    {id:'north_pass',name:'玄石关',terrain:'mountain',x:35,y:7,level:7,chapter:2,requires:'north_camp',desc:'北境大营的门户，由刀盾兵与床弩联合封锁。先侦察，再选择射程与兵种搭配。',army:{shield:220,spear:150,archer:170,ballista:20},loot:{food:3000,stone:2600,iron:2400,gold:4000},reward:'攻克关隘 · 北境大营开放',time:54},
    {id:'north_keep',name:'北境大营',terrain:'camp',x:40,y:5,level:8,chapter:2,requires:'north_pass',desc:'北境叛军的最终据点。混编重兵与远程器械守营，准备充足兵力与运输能力再发动决战。',army:{shield:260,spear:200,archer:220,cavalry:100,heavy:35,ballista:30},loot:{food:4500,wood:3000,stone:3000,iron:3000,gold:6000},reward:'平定北境 · 第二章完成',time:60}
  ],
  rewards:[
    {resources:12000,gold:40000,jewels:{pearl:3},items:{speed_train_1h:1}},
    {resources:16000,gold:50000,jewels:{pearl:5},items:{speed_build_1h:1}},
    {resources:20000,gold:60000,jewels:{coral:3},items:{speed_research_1h:1}},
    {resources:24000,gold:75000,jewels:{coral:5},items:{speed_train_3h:1}},
    {resources:30000,gold:100000,jewels:{glass:5},items:{speed_build_3h:1}},
    {resources:40000,gold:150000,jewels:{amber:5},items:{speed_train_3h:2,speed_research_3h:1}}
  ],
  chapterThreeTitle:'第三章 · 河洛攻城',
  chapterThreeNodes:[
    {id:'luo_outpost',name:'洛水前哨',terrain:'camp',x:43,y:9,level:8,chapter:3,requires:'north_keep',desc:'北境平定后南下河洛。孟衡率枪兵守住前哨；先在野外交锋，领取盟军试作冲车。',commander:{name:'孟衡',title:'前哨守将',attack:1.08,defense:1.06,order:'advance'},army:{shield:180,spear:220,archer:180,cavalry:70},loot:{food:4000,wood:4000,iron:2500,gold:6000},reward:'前哨肃清 · 盟军支援 5 辆试作冲车',time:60},
    {id:'luo_gate',name:'河洛东门',terrain:'mountain',x:46,y:12,level:8,chapter:3,requires:'luo_outpost',desc:'石峤坚守城门，步军依托门墙。冲车推进至门前可迅速破门；破门前守军不会出城。',commander:{name:'石峤',title:'东门守将',attack:1,defense:1.18,order:'hold'},fortification:{name:'包铁城门',hp:18000,protection:1.5,tower:700,range:1100},army:{shield:240,spear:220,archer:200,ballista:12},loot:{food:5000,wood:4000,stone:3500,gold:8000},reward:'攻破东门 · 盟军支援 2 辆投石车',time:66},
    {id:'luo_cavalry',name:'赤垒外营',terrain:'camp',x:49,y:15,level:9,chapter:3,requires:'luo_gate',desc:'韩骁带骑兵主动迎战，外围木栅虽弱但骑兵冲击凌厉。枪兵护住器械，避免弓兵先行接敌。',commander:{name:'韩骁',title:'突骑统领',attack:1.2,defense:1.03,order:'advance'},fortification:{name:'外营木栅',hp:10000,protection:1.2,tower:300,range:800},army:{cavalry:180,heavy:40,spear:170,archer:140},loot:{food:5500,wood:4500,iron:4000,gold:9000},reward:'击退突骑 · 战线补给',time:70},
    {id:'luo_wall',name:'白石城垣',terrain:'mountain',x:51,y:11,level:9,chapter:3,requires:'luo_cavalry',desc:'严岑以弓弩据守厚墙。投石车能在远处轰击城垣，冲车需要护卫靠近。破墙后箭楼停止射击。',commander:{name:'严岑',title:'弩阵都督',attack:1.12,defense:1.18,order:'hold'},fortification:{name:'白石重墙',hp:30000,protection:1.65,tower:1000,range:1400},army:{shield:280,spear:180,archer:260,ballista:30},loot:{food:6000,wood:5000,stone:5000,iron:4500,gold:12000},reward:'攻克城垣 · 河洛内城开放',time:76},
    {id:'luo_citadel',name:'河洛内城',terrain:'camp',x:54,y:8,level:10,chapter:3,requires:'luo_wall',desc:'邵靖收拢混编精锐据守内城。必须破坏城防并清空守军；只歼敌而未破城仍不能占领。',commander:{name:'邵靖',title:'河洛主将',attack:1.18,defense:1.25,order:'hold'},fortification:{name:'内城门墙',hp:42000,protection:1.7,tower:1200,range:1400},army:{shield:330,spear:250,archer:300,cavalry:130,heavy:40,ballista:35},loot:{food:8000,wood:6500,stone:6500,iron:6500,gold:18000},reward:'平定河洛 · 第三章完成',time:84}
  ],
  chapterThreeRewards:[
    {resources:45000,gold:160000,jewels:{pearl:12},items:{speed_train_3h:2},army:{ram:5}},
    {resources:50000,gold:180000,jewels:{coral:10},items:{speed_research_3h:2},army:{catapult:2}},
    {resources:55000,gold:200000,jewels:{glass:10},items:{speed_train_3h:2}},
    {resources:65000,gold:230000,jewels:{amber:10},items:{speed_build_3h:2}},
    {resources:80000,gold:300000,jewels:{jade:5,nightPearl:1},items:{speed_train_3h:3,speed_research_3h:2}}
  ],
  allNodes(){return [...this.nodes,...this.chapterThreeNodes];},
  chapterNodes(chapter=2){return chapter===3?this.chapterThreeNodes:this.nodes;},
  chapterTitle(chapter=2){return chapter===3?this.chapterThreeTitle:this.title;},
  completed(s,chapter=2){return this.chapterNodes(chapter).every(n=>!!s.conquered[n.id]);},
  unlocked(s,chapter=2){return !!s.conquered.fort&&(chapter!==3||this.completed(s,2));},
  blocked(s,id){const n=this.allNodes().find(n=>n.id===id);if(!n)return null;if(!s.conquered.fort)return '先占领古渡县城，开启第二章';if(n.chapter===3&&!this.unlocked(s,3))return '先完成第二章六关（含北境大营），开启第三章';if(!s.conquered[n.requires])return '先占领'+this.allNodes().find(row=>row.id===n.requires).name;return null;},
  progress(s,chapter=2){const nodes=this.chapterNodes(chapter);return {unlocked:this.unlocked(s,chapter),conquered:nodes.filter(n=>s.conquered[n.id]).length,claimed:nodes.filter(n=>s.missionClaims.includes('chapter'+chapter+'_'+n.id)).length,next:nodes.find(n=>!s.conquered[n.id])||null};},
  extendMissions(missions){[2,3].forEach(chapter=>this.chapterNodes(chapter).forEach((n,i)=>{const r=(chapter===3?this.chapterThreeRewards:this.rewards)[i];missions.push({id:'chapter'+chapter+'_'+n.id,node:n.id,chapter,stage:this.chapterTitle(chapter),title:n.name+' · 平定',desc:'占领'+n.name+'，掠夺胜利不算通关',route:'world',check:s=>!this.blocked(s,n.id)&&!!s.conquered[n.id],reward:{food:r.resources,wood:r.resources,stone:r.resources,iron:r.resources,gold:r.gold},jewels:r.jewels,items:r.items,army:r.army});}));}
};
// v0.34.34: late battles were too easy in the 4-day playtest, so garrisons are raised by a fixed factor (not tied to player strength). Higher factors starve the unaccelerated campaign of food (design/balance/late-battle-difficulty-2026-10-08.md).
ChapterData.armyScale={2:1.3,3:1.5};
for(const n of ChapterData.allNodes())for(const id of Object.keys(n.army))n.army[id]=Math.round(n.army[id]*ChapterData.armyScale[n.chapter]);


// SOURCE: siege-data.js
'use strict';
// Original siege rules; combat state contains only the mutable gate HP.
const SiegeSystem={
  gate(node,mode){const f=node.fortification;return f&&mode==='occupy'?{hp:f.hp,maxHp:f.hp}:null;},
  valid(gate,node,mode){const f=node?.fortification;if(gate===undefined||gate===null)return !f||mode!=='occupy';return !!f&&mode==='occupy'&&Number.isInteger(gate.hp)&&gate.hp>=0&&gate.hp<=f.hp&&gate.maxHp===f.hp;},
  damage(row){const count=Math.ceil(row.hp/row.stats.hp);return Math.max(1,Math.round(count*(row.id==='ram'?800:row.id==='catapult'?1200:row.id==='ballista'?80:['archer','cavalry','heavy'].includes(row.id)?2:8)));},
  canHit(row,b){return b.gate?.hp>0&&b.length-row.pos<=row.stats.range;},
  protection(b,node){return b.gate?.hp>0?node.fortification.protection:b.siege&&!node.fortification?1.25:1;},
  commander(node){return node.commander||{attack:1,defense:1,order:null};}
};


// SOURCE: war-orders.js
'use strict';
// Repeatable PVE orders use immutable target IDs so expeditions and saves retain their exact encounter.
const WarOrders=(()=>{
  const MAX_TIER=10,RECOVERY=10*60*1000;
  const routes={
    field:{name:'野战破阵',hint:'骑兵突击、盾阵和弓弩交替出现，按敌军组成调整前排与远程。',plans:[{spear:120,shield:80,archer:120,cavalry:90},{shield:180,spear:100,archer:140},{spear:100,archer:210,ballista:12}]},
    siege:{name:'攻坚拔寨',hint:'守军依托门墙，必须破城并歼敌；为冲车与投石车配备护卫。',plans:[{shield:140,spear:120,archer:130},{shield:180,archer:160,ballista:12},{spear:170,archer:140,cavalry:70}]},
    elite:{name:'精锐会战',hint:'敌将率领重骑和器械，训练、将领装备与混编部队决定持久战表现。',plans:[{shield:130,spear:100,archer:140,heavy:35},{spear:160,cavalry:110,archer:120,heavy:25},{shield:150,spear:120,archer:150,ballista:20}]}
  };
  const offers=[
    {id:'speed_train_1h',cost:20},
    {id:'starterJewelBox',cost:50},
    {id:'speed_research_3h',cost:65},
    {id:'speed_build_3h',cost:65},
    {id:'starterEquipmentBasic',cost:100},
    {id:'pearl',cost:40},
    {id:'speed_train_8h',cost:140},
    {id:'starterEquipmentFine',cost:240}
  ];
  const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
  // Scenario data is separate from wild-general provenance. Commanders are not captive heroes.
  // Positions and plans are engine-owned: player troops retain the normal shared line deployment.
  const encounters=freeze([
    {id:'order_encounter_field_5_screen',route:'field',tier:5,name:'盾幕蓄弦',kind:'loss',limit:20,bonus:45,encounter:true,army:{shield:240,spear:160,archer:340},condition:'击败盾枪护卫与预备弓阵，永久损失不超过出征人数的 20%。',hint:'任何主将均可察伏取消敌弓预备；也可用盾兵探阵或快骑抢入射程。限损只看永久战损，不要求拥有名将。',config:{version:1,length:2600,deployment:'line',enemyPositions:{shield:1200,spear:1400,archer:1650},enemyOrders:{shield:{command:'advance',target:''},spear:{command:'hold',target:''},archer:{command:'hold',target:''}},enemyIdentity:'huangzhong',plans:[{atRound:0,action:{type:'huangzhong',unit:'archer'}}],intel:{warning:'盾枪护弓，弓队开战即蓄弦；下一行动轮等待敌队从射程外进入。',response:'察伏在下一轮准备仍有效时可用；盾兵探阵、首轮抢入射程或暂不进入均可应对。'}}},
    {id:'order_encounter_elite_7_lure',route:'elite',tier:7,name:'游骑诱阵',kind:'loss',limit:25,bonus:55,encounter:true,army:{cavalry:210,spear:300,archer:280},condition:'击败轻骑诱兵与后方枪弓阵，永久损失不超过出征人数的 25%。',hint:'敌骑首轮后退准备诱追，只诱下一轮仍前进的近战队。坚守或后退即可不追；弓兵不受诱追，可承担主输出。',config:{version:1,length:3000,deployment:'line',enemyPositions:{cavalry:1600,spear:2200,archer:2700},enemyOrders:{cavalry:{command:'advance',target:''},spear:{command:'hold',target:''},archer:{command:'hold',target:''}},enemyIdentity:'weiyan',plans:[{atRound:0,action:{type:'weiyan',unit:'cavalry'},targetPolicy:'firstEligibleMelee'}],intel:{warning:'轻骑摆出退势，后方留有枪弓阵；仅在诱兵价值足够且存在近战目标时准备诱追。',response:'给前排坚守或后退，不随轻骑追入后阵；保持弓兵输出。徐庶可提前看见已经锁定的追兵。'}}},
    {id:'order_encounter_siege_10_fire',route:'siege',tier:10,name:'火隘截骑',kind:'swift_loss',limit:30,maxRound:12,bonus:70,encounter:true,army:{cavalry:300,spear:260,archer:380},condition:'在 12 回合内击败火区骑枪弓阵，永久损失不超过出征人数的 30%。',hint:'本场是营外截击，没有门墙。火区只封路、不直接扣血且阻挡双方；徐庶能早揭区间，普通将可先观察，待公开后调整前进、坚守或后退。',config:{version:1,length:3000,deployment:'line',enemyPositions:{cavalry:2600,spear:2250,archer:2800},enemyOrders:{cavalry:{command:'advance',target:''},spear:{command:'advance',target:''},archer:{command:'hold',target:''}},enemyIdentity:'ordinary',plans:[{atRound:0,action:{type:'fire',unit:'archer',left:1400}}],intel:{warning:'弓阵正在准备火攻，轻骑抢进；火攻类型公开，准备区间尚未公开，下一行动轮冻结指令后生效。',response:'徐庶可提前揭露准确区间；普通将可先稳住前排，火区公开后再调整。火区只维持一轮，不要求特定主将。'}}}
  ]);
  const challenges=Object.freeze([
    Object.freeze({id:'order_challenge_field_5_preserve',route:'field',tier:5,name:'稳阵保兵',kind:'loss',limit:15,bonus:30,condition:'战胜第 5 阶野战敌军，永久损失不超过出征人数的 15%。',hint:'永久损失按结算战损计算，已救回伤兵不计入；可调整阵型、科技和将领装备。'}),
    Object.freeze({id:'order_challenge_elite_5_swift',route:'elite',tier:5,name:'六回合决胜',kind:'round',limit:6,bonus:40,condition:'在 6 回合以内战胜第 5 阶精锐敌军。',hint:'在射程内集中火力，避免远程在阵地上空等；超过回合条件仍可取得普通胜利。'}),
    Object.freeze({id:'order_challenge_siege_5_engines',route:'siege',tier:5,name:'护械破城',kind:'engines',limit:80,minimum:5,bonus:40,condition:'派出至少 5 架冲车或投石车，器械实际攻击城防至少一次，破城歼敌时至少 80% 器械仍在战场存活。',hint:'停在后方而未参与攻城不能达标；器械按架数计算，伤兵救回不算战场存活。搭配护卫并关注城防箭楼的射程。'}),
    Object.freeze({id:'order_branch_field_10_intercept',route:'field',tier:10,branch:true,name:'截骑护弓',kind:'loss',limit:30,bonus:60,army:Object.freeze({cavalry:500}),condition:'击退 500 轻骑，永久损失不超过出征人数的 30%。',hint:'枪兵克制轻骑，可在弓阵前接住冲锋；弓兵继续担当输出。先比较战损和补兵成本，再决定护卫人数。'}),
    Object.freeze({id:'order_branch_elite_10_flank',route:'elite',tier:10,branch:true,name:'疾袭弩阵',kind:'swift_loss',limit:15,maxRound:2,bonus:70,army:Object.freeze({ballista:200}),condition:'在 2 回合内击败 200 床弩，永久损失不超过出征人数的 15%。',hint:'轻骑的速度能及时接近长射程弩阵；纯弓能速胜但可能损失较高，慢护卫更省兵却可能超时。可用科技、装备或指挥尝试其他解法。'}),
    ...encounters
  ]);
  const targets=Object.fromEntries(Object.entries(routes).flatMap(([route,spec])=>Array.from({length:MAX_TIER},(_,i)=>{
    const tier=i+1,champion=tier===5||tier===10,factor=1+i*.16,plan=spec.plans[i%spec.plans.length];
    const id=`order_${route}_${tier}`,army=Object.fromEntries(Object.entries(plan).map(([key,n])=>[key,Math.ceil(n*factor)]));
    const node={id,orderRoute:route,orderTier:tier,name:spec.name+' · 第 '+tier+' 阶',terrain:route==='siege'?'mountain':'camp',wild:false,level:Math.min(10,6+Math.floor(i/2)),time:45+tier*3,desc:spec.hint+(champion?' 本阶由精锐敌将督战。':''),army,loot:{food:2000+tier*500,wood:1500+tier*400,stone:1500+tier*400,iron:1500+tier*400,gold:2500+tier*600},reward:'战胜敌军，领取军功；部队返城，讨伐不改变领地归属。',commander:{name:['伏骑校尉','守寨都尉','精锐统领'][Object.keys(routes).indexOf(route)],title:champion?'精锐督战':'军令敌将',attack:1+(route==='elite'?.12:0)+(champion?.1:0),defense:1+(route==='siege'?.1:0)+(champion?.1:0),order:route==='siege'?'hold':'advance'}};
    if(route==='siege')node.fortification={name:champion?'重垒门墙':'营寨门墙',hp:12000+i*3500+(champion?6000:0),protection:1.4,tower:400+i*70,range:1100};
    return [id,node];
  })));
  for(const c of challenges){const base=targets[`order_${c.route}_${c.tier}`];targets[c.id]=Object.freeze({...base,id:c.id,name:c.name+' · '+(c.branch?'进阶分支':'第 '+c.tier+' 阶战术挑战'),challengeId:c.id,desc:c.condition+' '+c.hint,army:Object.freeze({...(c.army||base.army)}),loot:Object.freeze({...base.loot}),commander:Object.freeze(c.branch?{name:c.kind==='loss'?'游骑统领':'弩阵校尉',title:'分支守将',attack:1,defense:1,order:'advance'}:{...base.commander}),...(base.fortification?{fortification:Object.freeze({...base.fortification})}:{}),reward:'胜利获得普通军功；首次达成战术条件额外获得 '+c.bonus+' 军功。'});}
  for(const c of encounters){const {fortification,...base}=targets[c.id];targets[c.id]=freeze({...base,name:c.name+' · 战术遭遇',terrain:'camp',encounter:c.config,commander:{name:c.name+'守将',title:'军令战术守将',attack:1,defense:1,order:'advance'}});}
  function init(s){if(s.warOrders===undefined)s.warOrders={schema:1,merit:0,earned:0,spent:0,cleared:{field:0,siege:0,elite:0},wins:{field:0,siege:0,elite:0},nextAt:{field:0,siege:0,elite:0},last:null};if(s.warOrders&&typeof s.warOrders==='object'&&!Array.isArray(s.warOrders)&&s.warOrders.challenges===undefined)s.warOrders.challenges={schema:1,completed:{},earned:0,lastAttempts:{}};}
  function getNode(id){return Object.hasOwn(targets,id)?targets[id]:null;}
  function challenge(id){return challenges.find(c=>c.id===id)||null;}
  function encounterConfig(id){return getNode(id)?.encounter||null;}
  function points(n,first=false){const base=12+4*n.orderTier+(n.orderRoute==='siege'?4:n.orderRoute==='elite'?8:0);return base*(first?2:1);}
  const int=n=>Number.isSafeInteger(n)&&n>=0,object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  function challengeMet(c,a){if(!a.won||!a.deployed)return false;if(c.kind==='loss')return a.lost<=Math.floor(a.deployed*c.limit/100);if(c.kind==='round')return a.round<=c.limit;if(c.kind==='swift_loss')return a.round<=c.maxRound&&a.lost<=Math.floor(a.deployed*c.limit/100);return a.machines>=c.minimum&&a.machineAlive>=Math.ceil(a.machines*c.limit/100)&&(a.rulesVersion===undefined||a.machineGateAttacks>0);}
  function validAttempt(a,c){return object(a)&&a.id===c.id&&typeof a.won==='boolean'&&typeof a.met==='boolean'&&(a.rulesVersion===undefined?!c.branch&&!c.encounter&&a.machineGateAttacks===undefined:a.rulesVersion===2&&int(a.machineGateAttacks)&&a.machineGateAttacks<=a.round*2)&&['round','deployed','lost','machines','machineAlive'].every(k=>int(a[k]))&&(a.round>=1||!a.won)&&a.round<=30&&a.lost<=a.deployed&&a.machines<=a.deployed&&a.machineAlive<=a.machines&&a.machineAlive<=a.deployed-a.lost&&(!a.machineGateAttacks||a.machines>0)&&a.met===challengeMet(c,a);}
  function validReceipt(r){
    if(r===undefined||r===null)return true;
    const n=getNode(r.node);if(!n||r.route!==n.orderRoute||r.tier!==n.orderTier||typeof r.first!=='boolean')return false;
    if(!n.challengeId)return r.challenge===undefined&&r.basePoints===undefined&&r.points===points(n,r.first);
    const c=challenge(n.challengeId),a=r.challenge;
    return r.first===false&&r.basePoints===points(n)&&validAttempt(a,c)&&a.won===true&&typeof a.first==='boolean'&&(!a.first||a.met)&&a.bonus===(a.first?c.bonus:0)&&r.points===r.basePoints+a.bonus;
  }
  function valid(s){
    const w=s.warOrders;if(!object(w)||w.schema!==1||!int(w.merit)||!int(w.earned)||!int(w.spent)||w.merit+w.spent!==w.earned||!['cleared','wins','nextAt'].every(key=>object(w[key])&&Object.keys(w[key]).length===3&&Object.keys(routes).every(route=>int(w[key][route])))||!Object.keys(routes).every(route=>w.cleared[route]<=MAX_TIER&&w.wins[route]>=w.cleared[route])||!(w.last===null||!!w.last&&validReceipt(w.last)&&w.last.tier<=w.cleared[w.last.route]&&w.last.points<=w.earned))return false;
    const ledger=w.challenges;if(!object(ledger)||ledger.schema!==1||!object(ledger.completed)||!object(ledger.lastAttempts)||!int(ledger.earned)||!Object.entries(ledger.completed).every(([id,value])=>{const c=challenge(id);return c&&value===true&&w.cleared[c.route]>=c.tier&&w.wins[c.route]>w.cleared[c.route];})||ledger.earned!==Object.keys(ledger.completed).reduce((sum,id)=>sum+challenge(id).bonus,0)||ledger.earned>w.earned||!Object.entries(ledger.lastAttempts).every(([id,a])=>{const c=challenge(id);return c&&w.cleared[c.route]>=c.tier&&validAttempt(a,c)&&(!a.met||ledger.completed[id]===true);}))return false;
    const receipts=[w.last,...(s.reports||[]).map(r=>r.warOrder),s.battle?.finished?s.battle.result?.warOrder:null].filter(r=>r?.challenge);
    if(receipts.some(r=>!validReceipt(r)||r.challenge.met&&ledger.completed[r.node]!==true))return false;
    // A saved finished battle and its history entry share one receipt; history itself cannot replay a first bonus.
    for(const c of challenges)if((s.reports||[]).filter(r=>r.warOrder?.challenge?.id===c.id&&r.warOrder.challenge.first).length>1)return false;
    return true;
  }
  function unlocked(s){return !!s.conquered.north_keep;}
  function maxTier(s,route){return Math.min(MAX_TIER,s.warOrders.cleared[route]+1);}
  function blocked(s,n,mode,now=Date.now()){
    if(!unlocked(s))return '先平定北境大营，开放战役军令';
    if(mode!=='occupy')return '军令需要讨伐，战胜守军并破坏城防';
    if(n.challengeId&&s.warOrders.cleared[n.orderRoute]<n.orderTier)return '先完成此路线普通第 '+n.orderTier+' 阶，再开启战术挑战';
    if(n.orderTier>maxTier(s,n.orderRoute))return '先完成此路线第 '+(n.orderTier-1)+' 阶';
    if(s.warOrders.nextAt[n.orderRoute]>now)return '此路线正在整军，请等待倒计时结束';
    const deployed=[...(s.expedition?[s.expedition]:[]),...s.expeditions];
    if(deployed.some(e=>getNode(e.node)?.orderRoute===n.orderRoute))return '此路线已有部队出征，请等待返城';
    return null;
  }
  // Called only by the engine's one-time battle settlement, never by viewing or claiming UI.
  function attempt(n,won,context){
    const c=challenge(n.challengeId),sum=a=>Object.values(a||{}).reduce((total,value)=>total+value,0),army=context?.army,lost=context?.lost,alive=context?.alive;
    const counts=a=>object(a)&&Object.keys(a).every(id=>Object.hasOwn(ManualData.units,id))&&Object.values(a).every(int)&&int(sum(a));
    const validContext=context&&int(context.round)&&(context.round>=1||!won)&&context.round<=30&&counts(army)&&counts(lost)&&counts(alive)&&sum(army)>0&&sum(lost)<=sum(army)&&sum(alive)<=sum(army)&&Object.keys(ManualData.units).every(id=>(lost[id]||0)+(alive[id]||0)<=(army[id]||0));
    const a={id:c.id,rulesVersion:2,machineGateAttacks:validContext&&int(context.machineGateAttacks)&&context.machineGateAttacks<=context.round*2?context.machineGateAttacks:0,won:!!won,met:false,round:validContext?context.round:30,deployed:validContext?sum(army):0,lost:validContext?sum(lost):0,machines:validContext?(army.ram||0)+(army.catapult||0):0,machineAlive:validContext?(alive.ram||0)+(alive.catapult||0):0};a.met=challengeMet(c,a);return a;
  }
  function settle(s,n,won,now,context){
    if(!n.orderRoute)return null;
    const w=s.warOrders;w.nextAt[n.orderRoute]=now+RECOVERY;
    const a=n.challengeId?attempt(n,won,context):null;if(a)w.challenges.lastAttempts[n.id]=a;
    if(!won)return null;
    const first=!a&&n.orderTier>w.cleared[n.orderRoute],receipt={node:n.id,route:n.orderRoute,tier:n.orderTier,first,points:points(n,first)};
    if(a){const c=challenge(n.challengeId),first=a.met&&!w.challenges.completed[n.id],bonus=first?c.bonus:0;receipt.basePoints=receipt.points;receipt.challenge={...a,first,bonus};receipt.points+=bonus;if(first){w.challenges.completed[n.id]=true;w.challenges.earned+=bonus;}}
    if(!a)w.cleared[n.orderRoute]=Math.max(w.cleared[n.orderRoute],n.orderTier);w.wins[n.orderRoute]++;w.merit+=receipt.points;w.earned+=receipt.points;w.last=receipt;
    return receipt;
  }
  function exchange(id){Game.tick(Date.now(),false);const s=Game.state,offer=offers.find(o=>o.id===id);if(!unlocked(s))return '先平定北境大营，开放军功兑换';if(!offer)return '兑换物品不存在';if(s.warOrders.merit<offer.cost)return '军功不足';s.warOrders.merit-=offer.cost;s.warOrders.spent+=offer.cost;s.inventory[id]=(s.inventory[id]||0)+1;Game.save();return null;}
  return {MAX_TIER,RECOVERY,routes,offers,challenges,encounters,challenge,encounterConfig,init,valid,validReceipt,getNode,points,unlocked,maxTier,blocked,settle,exchange};
})();


// SOURCE: automation-system.js
'use strict';
// In-game assistant settings and bounded, persistent completion inbox.
const AutomationSystem=(()=>{
  const keys=['food','wood','stone','iron','gold'],focuses=['balanced','economy','military'];
  const military=['training','combat','protection','load','march','riding','shooting','supply','fortification','repair','plunder','leadership','scouting'];
  const defaults=()=>({researchFocus:'balanced',researchPriority:'',reserve:Object.fromEntries(keys.map(k=>[k,0])),notify:true,notices:[],nextId:1});
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  function init(s){if(s.automation===undefined)s.automation=defaults();}
  function settingsValid(a){return object(a)&&focuses.includes(a.researchFocus)&&(a.researchPriority===''||Object.hasOwn(ManualData.technology,a.researchPriority))&&typeof a.notify==='boolean'&&object(a.reserve)&&Object.keys(a.reserve).length===keys.length&&keys.every(k=>Number.isSafeInteger(a.reserve[k])&&a.reserve[k]>=0&&a.reserve[k]<=1000000000);}
  function valid(s){const a=s?.automation;return settingsValid(a)&&Array.isArray(a.notices)&&a.notices.length<=30&&a.notices.every(object)&&Number.isSafeInteger(a.nextId)&&a.nextId>=1&&a.nextId<Number.MAX_SAFE_INTEGER&&new Set(a.notices.map(n=>n.id)).size===a.notices.length&&a.notices.every(n=>object(n)&&Number.isSafeInteger(n.id)&&n.id>0&&n.id<a.nextId&&['build','research','train','defense'].includes(n.kind)&&typeof n.text==='string'&&n.text.length>0&&n.text.length<=160&&Number.isSafeInteger(n.at)&&n.at>=0&&n.at<=8640000000000000&&typeof n.read==='boolean');}
  function canSpend(s,cost){return Object.entries(cost).every(([k,v])=>s.res[k]-v>=s.automation.reserve[k]);}
  function rank(s,id){const a=s.automation;if(id===a.researchPriority)return -1;if(a.researchFocus==='balanced')return 0;return military.includes(id)===(a.researchFocus==='military')?0:1;}
  function record(s,kind,q,at,note=''){const a=s.automation;if(!a.notify)return;if(a.nextId>=Number.MAX_SAFE_INTEGER-1){a.notices.forEach((n,i)=>n.id=a.notices.length-i);a.nextId=a.notices.length+1;}
    const labels={build:()=>ManualData.buildings[q.id].name+'升至 '+q.level+' 级',research:()=>ManualData.technology[q.id].name+'研究至 '+q.level+' 级',train:()=>ManualData.units[q.id].name+'训练完成 ×'+q.count,defense:()=>ManualData.defenses[q.id].name+'建造完成 ×'+q.count};
    a.notices.unshift({id:a.nextId++,kind,text:labels[kind]()+note,at:Math.floor(at),read:false});a.notices=a.notices.slice(0,30);
  }
  function unread(s){return s.automation.notices.filter(n=>!n.read).length;}
  return {init,valid,settingsValid,canSpend,rank,record,unread,keys,focuses};
})();


// SOURCE: named-city-data.js
'use strict';
// Administrative hierarchy and all armies/bonuses are this game's PVE parameters.
// Existing chapter sites remain chapter sites; these cities do not enter that sequence.
const NamedCityData=(()=>{
  const tiers=Object.freeze({county:{name:'县城',plotMax:12,goldFactor:1.1,hall:3,population:500,plots:6,reward:5000},prefecture:{name:'郡城',plotMax:15,goldFactor:1.2,hall:5,population:1000,plots:9,reward:10000},province:{name:'州城',plotMax:18,goldFactor:1.3,hall:7,population:1500,plots:12,reward:20000},capital:{name:'都城',plotMax:18,goldFactor:1.4,hall:8,population:2000,plots:12,reward:30000}});
  const definitions=[
    {id:'fort',name:'古渡县城',tier:'county',district:'北原郡 · 古渡县',parent:'named_beiyuan',strategy:'granary',children:[]},
    {id:'yellow_qingshi',name:'青石黄巾城',tier:'county',district:'中原外围 · 青石县',parent:null,strategy:'granary',children:[]},
    {id:'yellow_baisha',name:'白沙黄巾城',tier:'county',district:'中原外围 · 白沙县',parent:null,strategy:'mine',children:[]},
    {id:'yellow_chigang',name:'赤岗黄巾城',tier:'county',district:'中原外围 · 赤岗县',parent:null,strategy:'pass',children:[]},
    {id:'named_hanchuan',name:'寒川县城',tier:'county',district:'北原郡 · 寒川县',parent:'named_beiyuan',strategy:'mine',children:[],discover:'fort'},
    {id:'named_luoshui',name:'洛水县城',tier:'county',district:'河洛郡 · 洛水县',parent:'named_heluo',strategy:'granary',children:[],discoverChapter:2},
    {id:'named_baishi',name:'白石县城',tier:'county',district:'河洛郡 · 白石县',parent:'named_heluo',strategy:'pass',children:[],discoverChapter:2},
    {id:'named_beiyuan',name:'北原郡城',tier:'prefecture',district:'中原州 · 北原郡',parent:'named_zhongyuan',strategy:'granary',children:['fort','named_hanchuan']},
    {id:'named_heluo',name:'河洛郡城',tier:'prefecture',district:'中原州 · 河洛郡',parent:'named_zhongyuan',strategy:'mine',children:['named_luoshui','named_baishi']},
    {id:'named_zhongyuan',name:'中原州城',tier:'province',district:'中原州',parent:'named_luoyang',strategy:'balanced',children:['named_beiyuan','named_heluo']},
    {id:'named_luoyang',name:'洛阳都城',tier:'capital',district:'京畿 · 洛阳',parent:null,strategy:'balanced',children:['named_zhongyuan'],requiresChapter:3}
  ].map(d=>Object.freeze({...d,tierName:tiers[d.tier].name,plotMax:tiers[d.tier].plotMax,goldFactor:tiers[d.tier].goldFactor,children:Object.freeze(d.children),development:Object.freeze({hall:tiers[d.tier].hall,morale:70,population:tiers[d.tier].population,plots:tiers[d.tier].plots,reward:Object.freeze({food:tiers[d.tier].reward,wood:tiers[d.tier].reward,stone:tiers[d.tier].reward,iron:tiers[d.tier].reward,gold:tiers[d.tier].reward/2})})}));
  const byId=new Map(definitions.map(d=>[d.id,d]));
  function nodeId(value){if(typeof value==='string')return value.replace(/^city_/,'');if(!value||typeof value!=='object'||value.capital===true)return '';return typeof value.node==='string'?value.node:typeof value.id==='string'?value.id.replace(/^city_/,''):'';}
  function definition(value){return byId.get(nodeId(value))||null;}
  const node=(id,x,y,level,population,army,loot,time,fortification)=>{const d=byId.get(id);return Object.freeze({id,name:d.name,namedCity:true,openCity:true,terrain:'fort',faction:'local_warlord',x,y,level,population,army:Object.freeze(army),loot:Object.freeze(loot),time,...(fortification?{fortification:Object.freeze(fortification)}:{}),desc:d.district+'的'+d.tierName+'。占领须连续攻城降低民心至零以下；先控制指定辖区，再建立独立城市与补给线。',reward:'本城资源田最高 '+d.plotMax+' 级 · 黄金税收 +'+Math.round((d.goldFactor-1)*100)+'%'});};
  const nodes=Object.freeze([
    node('named_hanchuan',28,20,5,500,{shield:100,spear:100,archer:110,cavalry:30},{food:2200,wood:1800,stone:1800,iron:1800,gold:1500},38),
    node('named_luoshui',46,22,6,600,{shield:130,spear:140,archer:150,cavalry:45},{food:3200,wood:2300,stone:2300,iron:2300,gold:2000},44),
    node('named_baishi',51,20,6,600,{shield:150,spear:160,archer:140,cavalry:40,ballista:8},{food:2700,wood:2700,stone:3500,iron:2700,gold:2200},48),
    node('named_beiyuan',29,10,8,1000,{shield:260,spear:260,archer:300,cavalry:70,ballista:18},{food:6000,wood:4500,stone:4500,iron:4500,gold:4000},58,{name:'北原郡城门',hp:24000,protection:1.4,tower:500,range:1100}),
    node('named_heluo',49,26,8,1000,{shield:280,spear:250,archer:320,cavalry:80,ballista:22},{food:5000,wood:6000,stone:6000,iron:6000,gold:4500},62,{name:'河洛郡城门',hp:28000,protection:1.45,tower:600,range:1200}),
    node('named_zhongyuan',39,16,9,1500,{shield:420,spear:380,archer:450,cavalry:130,heavy:40,ballista:35},{food:9000,wood:9000,stone:9000,iron:9000,gold:7000},74,{name:'中原州重墙',hp:42000,protection:1.6,tower:900,range:1300}),
    node('named_luoyang',58,18,10,2000,{shield:600,spear:500,archer:650,cavalry:200,heavy:70,ballista:50,catapult:12},{food:14000,wood:14000,stone:14000,iron:14000,gold:10000},90,{name:'洛阳都城门墙',hp:60000,protection:1.75,tower:1200,range:1400})
  ]);
  return Object.freeze({tiers,definitions:Object.freeze(definitions),nodes,nodeId,definition});
})();


// SOURCE: named-city-system.js
'use strict';
// Pure territory/field rules. Game owns timing, writer guards, combat and persistence.
const NamedCitySystem=(()=>{
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const keys=(v,list)=>object(v)&&Object.keys(v).length===list.length&&list.every(k=>Object.hasOwn(v,k));
  const owned=(s,id)=>!!s?.conquered?.[id]&&Object.values(s?.realm?.cities||{}).some(c=>c.node===id&&!c.capital);
  const chapterDone=(s,n)=>typeof ChapterData!=='undefined'&&ChapterData.completed(s,n);
  function profile(value){const d=NamedCityData.definition(value);return d||{id:NamedCityData.nodeId(value),tier:'ordinary',tierName:'普通城池',district:'',parent:null,children:[],plotMax:10,goldFactor:1,development:null};}
  function init(s){if(s?.realm&&s.realm.namedCities===undefined)s.realm.namedCities={version:1,developed:[]};}
  function valid(s){try{const n=s?.realm?.namedCities;return keys(n,['version','developed'])&&n.version===1&&Array.isArray(n.developed)&&n.developed.length<=NamedCityData.definitions.length&&new Set(n.developed).size===n.developed.length&&n.developed.every(id=>typeof id==='string'&&!!NamedCityData.definition(id));}catch{return false;}}
  function visible(s,id){const d=NamedCityData.definition(id);if(!d)return true;if(owned(s,d.id)||s?.raided?.[d.id]||s?.garrisons?.[d.id])return true;const deployed=scope=>scope?.battle?.node===d.id||[scope?.expedition,...(scope?.expeditions||[])].some(e=>e?.node===d.id);if(deployed(s)||Object.values(s?.realm?.cities||{}).some(c=>deployed(c.data)))return true;if(d.id==='fort')return !!(s?.raided?.mine||s?.conquered?.mine);if(!d.id.startsWith('named_'))return true;if(d.children.length)return d.children.some(child=>owned(s,child));if(d.discover)return owned(s,d.discover);if(d.discoverChapter)return chapterDone(s,d.discoverChapter);return false;}
  function progress(s,value,api={}){const d=NamedCityData.definition(value);if(!d)return null;const has=api.owns||((id)=>owned(s,id)),children=d.children.map(id=>({id,name:NamedCityData.definition(id)?.name||id,owned:!!has(id)})),missing=children.filter(c=>!c.owned),chapter=d.requiresChapter?{chapter:d.requiresChapter,complete:chapterDone(s,d.requiresChapter)}:null;return {id:d.id,name:d.name,tier:d.tier,tierName:d.tierName,district:d.district,parent:d.parent,plotMax:d.plotMax,goldFactor:d.goldFactor,children,controlled:children.length-missing.length,required:children.length,missing:missing.length,chapter,owned:!!has(d.id),visible:visible(s,d.id),ready:missing.length===0&&(!chapter||chapter.complete)};}
  function attackBlocked(s,value,api={}){const p=progress(s,value,api);if(!p||p.owned)return '';if(!p.visible)return '此名城尚未发现，请推进当前辖区';if(p.missing)return '先占领辖区 '+p.children.filter(c=>!c.owned).map(c=>c.name).join('、')+'（还差 '+p.missing+' 座）';if(p.chapter&&!p.chapter.complete)return '先完成第三章 · 河洛攻城，再攻打洛阳都城';return '';}
  function fieldRecord(id,level,table){if(!['farm','lumber','quarry','mine'].includes(id)||!Number.isInteger(level)||level<1||level>18)return null;const rows=table?.rows||table;if(!Array.isArray(rows))return null;if(level<=10)return rows[level-1]||null;const base=rows[9];if(!base?.cost||!Number.isFinite(base.seconds)||!Number.isFinite(base.output)||!Number.isFinite(base.workers)||!Number.isFinite(base.capacity))return null;const extra=level-10,triangle=level*(level+1);return {level,cost:Object.fromEntries(Object.entries(base.cost).map(([key,n])=>[key,Math.ceil(n*1.35**extra)])),seconds:Math.ceil(base.seconds*1.25**extra),confirmedTime:false,trialTime:true,workers:Math.ceil(base.workers*triangle/110),output:Math.ceil(base.output*triangle/110),capacity:Math.ceil(base.capacity*triangle/110)};}
  function developmentQuote(s,value){const d=NamedCityData.definition(value),city=Object.values(s?.realm?.cities||{}).find(c=>c.node===d?.id),data=city&&(city.id===s.realm.activeCity?s:city.data);if(!d||!city||!data)return null;const t=d.development,current={hall:data.buildings?.hall||0,morale:Math.floor(data.morale||0),population:Math.floor(data.population||0),plots:(data.plots||[]).filter(p=>p.type&&p.level>0).length},checks=['hall','morale','population','plots'].map(key=>({id:key,current:current[key],required:t[key],complete:current[key]>=t[key]})),claimed=(s.realm.namedCities?.developed||[]).includes(d.id);let reason=!owned(s,d.id)?'请先取得城池归属':claimed?'本城发展奖励已领取':checks.some(c=>!c.complete)?'先完成本城稳定发展目标':'';if(!reason&&Object.entries(t.reward).some(([key,n])=>!Number.isSafeInteger(Math.floor(data.res?.[key]))||data.res[key]<0||data.res[key]+n>Number.MAX_SAFE_INTEGER))reason='本城资源已达数值上限';return {id:d.id,city:city.id,name:city.name,tierName:d.tierName,checks,reward:{...t.reward},claimed,ready:!reason,reason,key:JSON.stringify([city.id,claimed,checks.map(c=>c.complete)])};}
  function claimDevelopment(s,value,key){init(s);const q=developmentQuote(s,value);if(!q)return '请先占领此名城';if(q.reason)return q.reason;if(key!==undefined&&key!==q.key)return '发展条件已变化，请重新预览';const city=s.realm.cities[q.city],data=city.id===s.realm.activeCity?s:city.data;for(const [id,n]of Object.entries(q.reward))data.res[id]+=n;s.realm.namedCities.developed.push(q.id);return null;}
  function list(s){return NamedCityData.definitions.filter(d=>visible(s,d.id)).map(d=>progress(s,d.id));}
  return Object.freeze({profile,owned,init,valid,visible,progress,attackBlocked,fieldRecord,developmentQuote,claimDevelopment,list});
})();


// SOURCE: yellow-city-data.js
'use strict';
// Independent PVE cities. Guard counts, loot and baseline march times are trial values.
// City morale, militia, defense, carry limits and ownership use the ordinary city rules.
const YellowCityData={
  nodes:[
    {id:'yellow_qingshi',name:'青石黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:26,y:31,level:2,population:200,desc:'黄巾占据青石小城，枪盾护卫弓兵。先侦察、备好前排与运输队；占领战胜利可缴获资源和黄金，连续三胜使民心降至零以下后易主。',army:{shield:12,spear:20,archer:18},loot:{food:800,wood:800,stone:800,iron:800,gold:1500},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:18},
    {id:'yellow_baisha',name:'白沙黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:41,y:38,level:3,population:300,desc:'白沙城守军步弓混编，少量骑兵巡守外围。携带长枪兵保护弓阵，再配运输队带回战利品；占领战每胜降低 35 民心，降至零以下后易主。',army:{shield:25,spear:32,archer:28,cavalry:8},loot:{food:1500,wood:1500,stone:1500,iron:1500,gold:3000},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:26},
    {id:'yellow_chigang',name:'赤岗黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:21,y:20,level:4,population:400,desc:'赤岗城的枪盾与弓兵阵列较厚，城防会消耗进攻兵力。整备混编部队与运输队后再攻城；占领战每胜降低 35 民心，降至零以下后易主。',army:{shield:42,spear:40,archer:42,cavalry:12},loot:{food:2500,wood:2500,stone:2500,iron:2500,gold:5000},reward:'占领缴获资源与黄金 · 民心低于 0 后归属',time:34},
    {id:'yellow_liulin',name:'柳林黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:37,y:40,level:2,population:200,desc:'柳林小城守备松散，适合初次攻城练手。占领战胜利可缴获资源与黄金；黄金每小时刷新一次。',army:{shield:14,spear:18,archer:20},loot:{food:900,wood:900,stone:900,iron:900,gold:1500},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:20},
    {id:'yellow_heishan',name:'黑山黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:24,y:40,level:3,population:300,desc:'黑山城依山设寨，弓兵居高。携带盾兵与长枪掩护弓阵；黄金每小时刷新一次。',army:{shield:28,spear:30,archer:32,cavalry:6},loot:{food:1600,wood:1600,stone:1600,iron:1600,gold:3000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:28},
    {id:'yellow_yuntai',name:'云台黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:44,y:24,level:5,population:500,desc:'云台城为黄巾渠帅驻地，枪盾厚重、骑兵游走。需完整混编与充足运输队；黄金每小时刷新一次。',army:{shield:60,spear:58,archer:56,cavalry:20},loot:{food:3500,wood:3500,stone:3500,iron:3500,gold:8000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:40},
    {id:'yellow_tieling',name:'铁岭黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:48,y:42,level:5,population:500,desc:'铁岭城囤积兵甲，器械守城。准备攻城器械与前排；黄金每小时刷新一次。',army:{shield:66,spear:52,archer:60,cavalry:16},loot:{food:3200,wood:3200,stone:3600,iron:4000,gold:8000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:44},
    {id:'yellow_huangsha',name:'黄沙黄巾城',terrain:'fort',openCity:true,faction:'yellow_turban',x:14,y:28,level:6,population:600,desc:'黄沙城是黄巾大营，守军最多、城防最坚。需要高级将领与大批混编部队；黄金每小时刷新一次。',army:{shield:90,spear:84,archer:86,cavalry:30},loot:{food:5000,wood:5000,stone:5000,iron:5000,gold:12000},reward:'占领缴获资源与黄金 · 黄金每小时刷新',time:52}
  ],
  allNodes(){return [...this.nodes,...(typeof NamedCityData==='undefined'?[]:NamedCityData.nodes)];},
  createSites(legacy,namedSites=[],existing={}){
    const occupied=new Set(['32,32']),inBounds=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<64&&y<64;
    for(const site of namedSites)if(inBounds(site?.x,site?.y))occupied.add(site.x+','+site.y);
    // Preserve saved sites when appending cities to old worlds. New sites must
    // also avoid player-built cities and any already reserved open-city cells.
    for(const site of Object.values(existing||{}))if(inBounds(site?.x,site?.y))occupied.add(site.x+','+site.y);
    for(const city of Object.values(legacy?.realm?.cities||{}))if(inBounds(city?.x,city?.y))occupied.add(city.x+','+city.y);
    // Read whole JSON string tokens, including object keys, so a report sentence
    // mentioning a coordinate cannot accidentally reserve unrelated map cells.
    const serialized=JSON.stringify(legacy||{})||'';
    for(const token of serialized.matchAll(/"(?:\\.|[^"\\])*"/g)){
      const match=/^wild_(\d{1,2})_(\d{1,2})$/.exec(JSON.parse(token[0]));
      if(match){const x=Number(match[1]),y=Number(match[2]);if(inBounds(x,y))occupied.add(x+','+y);}
    }
    const sites={...existing};
    for(const node of this.allNodes()){
      if(Object.hasOwn(sites,node.id))continue;
      let nearest=null,distance=Infinity;
      // Iterating y then x gives deterministic tie breaking without sorting.
      for(let y=0;y<64;y++)for(let x=0;x<64;x++){
        if(occupied.has(x+','+y))continue;
        const squared=(x-node.x)**2+(y-node.y)**2;
        if(squared<distance){nearest={x,y};distance=squared;}
      }
      if(!nearest)return null;
      sites[node.id]=nearest;occupied.add(nearest.x+','+nearest.y);
    }
    return sites;
  }
};
// v0.34.34: yellow-turban garrisons were 50–290 men; raised five-fold so taking a city needs a real army.
YellowCityData.armyScale=5;
for(const n of YellowCityData.nodes)for(const id of Object.keys(n.army))n.army[id]=Math.round(n.army[id]*YellowCityData.armyScale);


// SOURCE: plot-template-data.js
'use strict';
// Pure outdoor layout suggestions. Queueing, payment and save ownership stay in Game.
const PlotTemplateData = (() => {
  const types = ['farm','lumber','quarry','mine'];
  const resources = {farm:'food',lumber:'wood',quarry:'stone',mine:'iron'};
  const templates = [
    {id:'army',name:'兵城',desc:'木场、石场、铁矿各留一块，其余种粮，侧重军队粮草。'},
    {id:'balanced',name:'资源城',desc:'粮、木、石、铁尽量等分，适合主城均衡发展。'},
    {id:'catapult',name:'投石城',desc:'按投石车的粮、木、石、铁造价分配，侧重石料。'}
  ];
  const blank = () => Object.fromEntries(types.map(type=>[type,0]));
  const validTotal = total => Number.isInteger(total)&&total>=0&&total<=39;
  const countTypes = entries => {
    const result=blank();
    entries.forEach(type=>{if(types.includes(type))result[type]++;});
    return result;
  };
  function counts(id,total,units,buildings) {
    if(!validTotal(total)||!templates.some(template=>template.id===id))return null;
    const result=blank();
    if(id==='army'&&total>=4){result.farm=total-3;result.lumber=result.quarry=result.mine=1;return result;}
    if(id!=='catapult'){
      types.forEach((type,index)=>{result[type]=Math.floor(total/4)+(index<total%4?1:0);});
      return result;
    }
    const cost=units?.catapult?.cost;
    if(!cost||types.some(type=>!Number.isFinite(cost[resources[type]])||cost[resources[type]]<0))return null;
    // Level-one outputs are currently all 100; the optional tables keep this
    // recommendation proportional if the basic production rates later differ.
    const weights=types.map(type=>{
      const output=buildings?.[type]?.rows?.find(row=>row.level===1)?.output;
      return cost[resources[type]]/(Number.isFinite(output)&&output>0?output:100);
    });
    const sum=weights.reduce((value,weight)=>value+weight,0);
    if(sum<=0)return null;
    const quotas=weights.map(weight=>total*weight/sum);
    types.forEach((type,index)=>{result[type]=Math.max(total>=4?1:0,Math.floor(quotas[index]));});
    // Largest remainder, with the displayed resource order breaking ties.
    while(types.reduce((value,type)=>value+result[type],0)<total){
      let next=0;
      for(let index=1;index<types.length;index++)if(quotas[index]-result[types[index]]>quotas[next]-result[types[next]])next=index;
      result[types[next]]++;
    }
    while(types.reduce((value,type)=>value+result[type],0)>total){
      const reducible=types.map((type,index)=>({type,index})).filter(({type})=>result[type]>(total>=4?1:0));
      reducible.sort((a,b)=>(result[b.type]-quotas[b.index])-(result[a.type]-quotas[a.index])||a.index-b.index);
      if(!reducible.length)return null;
      result[reducible[0].type]--;
    }
    return result;
  }
  function plan(state,id,total,units,mode='fill') {
    const desired=counts(id,total,units);
    if(!desired||!Array.isArray(state?.plots)||!['fill','replace'].includes(mode))return null;
    const plots=Array.from({length:total},(_,index)=>state.plots[index]||{type:null,level:0});
    if(plots.some(plot=>plot.type!==null&&!types.includes(plot.type)))return null;
    const jobs=new Map();
    for(const job of state.buildQueue||[]){
      if(Number.isInteger(job.plot)&&job.plot>=0&&job.plot<total){
        if(!types.includes(job.id)||jobs.has(job.plot))return null;
        jobs.set(job.plot,job);
      }
    }
    const actualCounts=countTypes(plots.map(plot=>plot.type));
    const effective=plots.map((plot,index)=>jobs.get(index)?.id||plot.type);
    const effectiveCounts=countTypes(effective);
    const targets=Array(total).fill(null);
    const used=blank();
    function retain(index){targets[index]=effective[index];if(targets[index])used[targets[index]]++;}
    // A build, upgrade or conversion already in progress owns its position.
    for(const index of jobs.keys())retain(index);
    if(mode==='fill'){
      plots.forEach((plot,index)=>{if(!jobs.has(index)&&plot.type)retain(index);});
    }else{
      // Matching high-level fields survive, including their original locations.
      for(const type of types){
        const matching=plots.map((plot,index)=>({plot,index}))
          .filter(({plot,index})=>!jobs.has(index)&&plot.type===type)
          .sort((a,b)=>(b.plot.level||0)-(a.plot.level||0)||a.index-b.index);
        matching.slice(0,Math.max(0,desired[type]-used[type])).forEach(({index})=>retain(index));
      }
    }
    const free=plots.map((plot,index)=>({plot,index}))
      .filter(({index})=>!jobs.has(index)&&targets[index]===null)
      .sort((a,b)=>Number(Boolean(a.plot.type))-Number(Boolean(b.plot.type))||(a.plot.level||0)-(b.plot.level||0)||a.index-b.index);
    const tasks=[];
    for(const {plot,index} of free){
      let type=types[0];
      for(const candidate of types.slice(1))if(desired[candidate]-used[candidate]>desired[type]-used[type])type=candidate;
      targets[index]=type;used[type]++;
      if(plot.type!==type)tasks.push({index,type,kind:plot.type?'replace':'build'});
    }
    const projectedCounts=countTypes(targets);
    const conflicts=types.filter(type=>projectedCounts[type]!==desired[type]).map(type=>({
      type,desired:desired[type],actual:actualCounts[type],effective:effectiveCounts[type],projected:projectedCounts[type],
      shortfall:Math.max(0,desired[type]-projectedCounts[type]),excess:Math.max(0,projectedCounts[type]-desired[type])
    }));
    return {id,mode,total,counts:desired,actualCounts,effectiveCounts,projectedCounts,targets,tasks,conflicts,
      builds:tasks.filter(task=>task.kind==='build').length,replaces:tasks.filter(task=>task.kind==='replace').length};
  }
  return {templates,types,counts,plan};
})();


// SOURCE: city-system.js
'use strict';
// The top-level save remains the active-city view for old UI and saves.
// realm.cities stores city scopes; global heroes, quests and ownership stay shared.
const CitySystem=(()=>{
  const fields=['last','res','buildings','cityLayout','cityLevels','tactics','plots','plotTemplate','army','captives','buildQueue','trainQueue','researchQueue','tech','innCandidates','governor','population','morale','unrest','tax','storageAllocation','civicCooldowns','defenses','defenseQueue','garrisons','expedition','expeditions','battle','autoUpgrade','autoResearch','automation','cityRoles','gatherings','cityDefense','scoutQueue','scoutIntel','regionalFront','heroAdministration','warCare','governance'];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const integer=n=>Number.isSafeInteger(n)&&n>=0;
  const idFor=node=>'city_'+node;
  const pick=s=>Object.fromEntries(fields.filter(k=>s[k]!==undefined).map(k=>[k,s[k]]));
  function capture(s){if(!s.realm?.cities?.[s.realm.activeCity])return;Object.assign(s.realm.cities[s.realm.activeCity].data,pick(s));}
  function activate(s,id){const c=s.realm?.cities?.[id];if(!c)return false;for(const k of fields){if(c.data[k]!==undefined)s[k]=c.data[k];else delete s[k];}s.realm.activeCity=id;return true;}
  function empty(s,node,now){
    const d=clone(pick(s));d.last=now;d.res=Object.fromEntries(Object.keys(s.res).map(k=>[k,0]));d.buildings=Object.fromEntries(Object.keys(s.buildings).map(k=>[k,k==='hall'?1:0]));d.cityLayout=Array.from({length:36},(_,i)=>i===14?'hall':[15,20,21].includes(i)?'reserved':null);d.cityLevels=Array.from({length:36},(_,i)=>i===14?1:0);d.plots=Array.from({length:39},()=>({type:null,level:0}));d.plotTemplate={id:null,active:false,mode:'fill'};
    for(const k of ['army','captives','defenses','tech'])d[k]=Object.fromEntries(Object.keys(s[k]).map(id=>[id,0]));
    d.tactics=clone(s.tactics);d.governor=null;d.cityRoles={commander:'',counsellor:''};d.population=0;d.morale=60;d.unrest=0;d.tax=20;d.storageAllocation={food:25,wood:25,stone:25,iron:25};d.civicCooldowns={comfort:0,levy:0};
    for(const k of ['buildQueue','trainQueue','defenseQueue','innCandidates','expeditions','scoutQueue'])d[k]=[];
    for(const k of ['garrisons','gatherings','scoutIntel'])d[k]={};d.expedition=null;d.battle=null;d.researchQueue=null;d.autoUpgrade=false;d.autoResearch=false;
    d.automation={...clone(s.automation),notices:[],nextId:1};d.cityDefense={autoEnabled:false,nextAt:0,wave:0,wins:0,incoming:null,battle:null,reports:[]};
    delete d.regionalFront;delete d.heroAdministration;delete d.warCare;delete d.governance;RegionalFront.init(d);HeroAdministration.init(d);WarCare.init(d);GovernanceSystem.initCity(d,now);
    return {id:idFor(node.id),name:node.name,node:node.id,x:node.x,y:node.y,capital:false,createdAt:now,data:d};
  }
  function init(s,legacy=[]){
    if(s.realm===undefined){
      const now=s.last||Date.now();s.realm={version:1,activeCity:'capital',capital:'capital',cities:{capital:{id:'capital',name:'青溪城',node:'home',x:32,y:32,capital:true,createdAt:now,data:pick(s)}},heroLocations:Object.fromEntries(s.generals.map(id=>[id,'capital'])),wildOwners:Object.fromEntries(Object.keys(s.conquered||{}).filter(id=>id.startsWith('wild_')).map(id=>[id,'capital'])),logistics:[],logisticsSeq:0,logisticsReports:[]};
      for(const n of legacy)if(n&&s.conquered?.[n.id]&&!s.realm.cities[idFor(n.id)])s.realm.cities[idFor(n.id)]=empty(s,n,now);
    }

  }
  const list=s=>Object.values(s.realm?.cities||{});
  const current=s=>s.realm?.cities?.[s.realm.activeCity];
  const scope=(s,c)=>c.id===s.realm.activeCity?pick(s):c.data;
  function valid(s,checkCity){
    const r=s.realm;if(!object(r)||r.version!==1||r.capital!=='capital'||!object(r.cities)||!r.cities[r.activeCity]||!r.cities.capital||list(s).length<1||list(s).length>22||!object(r.heroLocations)||!object(r.wildOwners)||!Array.isArray(r.logistics)||r.logistics.length>100||!integer(r.logisticsSeq)||!Array.isArray(r.logisticsReports)||r.logisticsReports.length>30)return false;
    const nodes=new Set(),coords=new Set(),staff=new Set(),deployed=new Set();
    for(const c of list(s)){if(!object(c)||!object(c.data))return false;const d=scope(s,c);for(const id of [d.governor,...Object.values(d.cityRoles||{})].filter(Boolean)){if(staff.has(id)||r.heroLocations[id]!==c.id)return false;staff.add(id);}}
    for(const c of list(s)){
      if(!object(c)||r.cities[c.id]!==c||typeof c.id!=='string'||!(c.id==='capital'||/^city_(?:[a-zA-Z0-9_]+)$/.test(c.id))||typeof c.name!=='string'||!c.name.length||c.name.length>20||typeof c.node!=='string'||!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.x>63||c.y<0||c.y>63||typeof c.capital!=='boolean'||c.capital!==(c.id==='capital')||!integer(c.createdAt)||!object(c.data)||nodes.has(c.node)||coords.has(c.x+':'+c.y))return false;
      if(c.id==='capital'&&(c.node!=='home'||c.x!==32||c.y!==32))return false;
      if(c.id!=='capital'&&c.id!==idFor(c.node))return false;nodes.add(c.node);coords.add(c.x+':'+c.y);
      const d=scope(s,c);if(!checkCity(c,d))return false;
      for(const e of [...(d.expedition?[d.expedition]:[]),...(d.expeditions||[]),...Object.values(d.garrisons||{}),...(d.cityDefense?.battle?[d.cityDefense.battle]:[])]){if(r.heroLocations[e.general]!==c.id||deployed.has(e.general)||staff.has(e.general)&&!(e===d.cityDefense?.battle&&e.general===d.governor))return false;deployed.add(e.general);if(e.sourceCity!==undefined&&e.sourceCity!==c.id)return false;}
    }
    if(!s.generals.every(id=>typeof r.heroLocations[id]==='string'&&(r.cities[r.heroLocations[id]]||r.heroLocations[id]==='transit'))||Object.keys(r.heroLocations).some(id=>!s.generals.includes(id)))return false;
    if(Object.entries(r.wildOwners).some(([id,city])=>!id.startsWith('wild_')||!s.conquered[id]||!r.cities[city]))return false;
    const jobIds=new Set();for(const j of r.logistics){if(!object(j)||typeof j.id!=='string'||!/^logistics_\d+$/.test(j.id)||jobIds.has(j.id)||Number(j.id.slice(10))>r.logisticsSeq||!r.cities[j.sourceCity]||!r.cities[j.destinationCity]||j.sourceCity===j.destinationCity||!['transport','redeploy'].includes(j.kind)||!['outbound','return'].includes(j.phase)||!integer(j.start)||!integer(j.end)||j.end<=j.start||!integer(j.seconds)||j.seconds<1||!object(j.army)||Object.entries(j.army).some(([id,n])=>!Object.hasOwn(s.army,id)||!integer(n))||!Object.values(j.army).some(n=>n>0)||!object(j.cargo)||Object.entries(j.cargo).some(([id,n])=>!Object.hasOwn(s.res,id)||!integer(n))||typeof j.general!=='string'||j.general&&(!s.generals.includes(j.general)||deployed.has(j.general)||staff.has(j.general)||r.heroLocations[j.general]!=='transit')||typeof j.delivered!=='boolean'||typeof j.cancelled!=='boolean'||j.delivered!==(j.kind==='transport'&&j.phase==='return'&&!j.cancelled)||j.phase==='outbound'&&j.cancelled||j.kind==='redeploy'&&j.phase==='return'&&!j.cancelled)return false;jobIds.add(j.id);if(j.general)deployed.add(j.general);}
    if(s.generals.some(id=>r.heroLocations[id]==='transit'&&!r.logistics.some(j=>j.general===id)))return false;
    return r.logisticsReports.every(j=>object(j)&&typeof j.id==='string'&&typeof j.kind==='string'&&typeof j.sourceCity==='string'&&typeof j.destinationCity==='string'&&integer(j.at)&&typeof j.text==='string'&&j.text.length<=200);
  }
  return {fields,clone,pick,capture,activate,empty,init,list,current,scope,idFor,valid};
})();


// SOURCE: city-strategy.js
'use strict';
// Fixed city identities; these production/march coefficients are trial values.
// Derive from the original map node ID, never the player name, hall level or save state.
const CityStrategy=(()=>{
  const make=(id,name,description,production={},marchFactor=1)=>Object.freeze({id,name,description,production:Object.freeze({food:1,wood:1,stone:1,iron:1,gold:1,...production}),marchFactor});
  const profiles=Object.freeze({
    balanced:make('balanced','均衡城','资源与行军采用普通规则。主城和平地自建城保持均衡。'),
    granary:make('granary','粮城','本城粮食毛产量 +20%，在扣除驻军与在途队伍维护前计算；适合作为养兵与军粮补给基地。',{food:1.2}),
    mine:make('mine','矿城','本城木材、石料、铁锭毛产量 +15%；适合作为建设与器械补给基地。',{wood:1.15,stone:1.15,iron:1.15}),
    pass:make('pass','关隘','从本城新派出的队伍行军时间 −20%；适合作为前沿出征与接应基地。既有在途队伍按出发时的时间结算。',{},.8)
  });
  // Every ordinary capturable city in the current map has an explicit assignment.
  // New designed cities register here; an unassigned city keeps ordinary rules.
  const roles=Object.freeze({fort:'granary',yellow_qingshi:'granary',yellow_baisha:'mine',yellow_chigang:'pass'});
  const namedProfiles=typeof NamedCityData==='undefined'?{}:Object.fromEntries(NamedCityData.definitions.map(d=>{
    const p=profiles[d.strategy]||profiles.balanced;
    return [d.id,make(p.id,p.name,p.description+' '+d.tierName+'本城黄金税收 +'+Math.round((d.goldFactor-1)*100)+'%，资源田最高 '+d.plotMax+' 级；仅本城生效。',{...p.production,gold:d.goldFactor},p.marchFactor)];
  }));
  function profile(nodeOrCity){
    const c=typeof nodeOrCity==='string'?{id:nodeOrCity}:nodeOrCity;
    if(!c||typeof c!=='object'||c.capital===true||c.id==='capital'||c.id==='home')return profiles.balanced;
    const node=typeof c.node==='string'?c.node:typeof c.id==='string'?c.id.replace(/^city_/,''):'';
    if(node==='home'||node.startsWith('wild_'))return profiles.balanced;
    return namedProfiles[node]||profiles[roles[node]]||profiles.balanced;
  }
  function summary(city){const p=profile(city),d=typeof NamedCityData==='undefined'?null:NamedCityData.definition(city);return p.name+' · '+({balanced:'普通资源与行军规则',granary:'本城粮食毛产量 +20%',mine:'本城木石铁毛产量 +15%',pass:'本城新派队伍行军时间 −20%'}[p.id])+(d?' · 黄金税收 +'+Math.round((d.goldFactor-1)*100)+'%':'');}
  function marchSeconds(base,city){return Math.max(1,Math.ceil(Math.max(0,Number(base)||0)*profile(city).marchFactor));}
  return Object.freeze({profiles,roles,profile,summary,marchSeconds});
})();


// SOURCE: general-growth-data.js
'use strict';
// Skill values and costs are this game's trial rules, not a historical attribute table.
const GeneralGrowthData={
  maxLevel:5,
  heroLevels:[0,1,3,5,8,12],
  routes:[
    {id:'cavalry',name:'骑军统领',description:'每级轻骑兵、铁骑兵与斥候攻击 +6%，仅由这三种兵组成的编队行军速度 +5%。',units:['cavalry','heavy','scout'],attack:.06,march:.05,gate:0,stats:{}},
    {id:'archer',name:'弓军统领',description:'每级弓箭手与床弩攻击 +8%。',units:['archer','ballista'],attack:.08,march:0,gate:0,stats:{}},
    {id:'siege',name:'攻城统领',description:'每级冲车、投石车攻击 +6%，器械攻城门伤害 +8%。',units:['ram','catapult'],attack:.06,march:0,gate:.08,stats:{}},
    {id:'politics',name:'治城谋略',description:'每级内政 +4、智谋 +3、统率 +2，加快新安排的建设与研究。',units:[],attack:0,march:0,gate:0,stats:{pol:4,wis:3,lead:2}}
  ],
  cost:level=>({merit:20*level,gold:4000*level*level,jewels:{pearl:Math.ceil(level/2),...(level>=3?{coral:Math.floor(level/3)}:{})}})
};


// SOURCE: general-growth-system.js
'use strict';
const GeneralGrowth=(()=>{
  const D=GeneralGrowthData,obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const route=id=>D.routes.find(r=>r.id===id);
  function init(s){if(s.heroSkills===undefined)s.heroSkills={};}
  function valid(s){return obj(s.heroSkills)&&Object.entries(s.heroSkills).every(([id,k])=>s.generals.includes(id)&&obj(k)&&Object.keys(k).length===2&&!!route(k.route)&&Number.isInteger(k.level)&&k.level>=1&&k.level<=D.maxLevel&&(s.generalLevels[id]||1)>=D.heroLevels[k.level]);}
  function statBonus(s,id){const k=s.heroSkills?.[id],r=k&&route(k.route);return Object.fromEntries(Object.entries(r?.stats||{}).map(([key,n])=>[key,n*k.level]));}
  function profile(s,id){const k=s.heroSkills?.[id],r=k&&route(k.route);return {route:r?.id||'',level:k?.level||0,attackByUnit:Object.fromEntries((r?.units||[]).map(unit=>[unit,1+r.attack*k.level])),marchFactor:1+(r?.march||0)*(k?.level||0),gateFactor:1+(r?.gate||0)*(k?.level||0)};}
  function validProfile(p){if(!obj(p)||!Number.isInteger(p.level)||p.level<0||p.level>D.maxLevel||!obj(p.attackByUnit))return false;if(!p.level)return p.route===''&&Object.keys(p.attackByUnit).length===0&&p.marchFactor===1&&p.gateFactor===1;const r=route(p.route);return !!r&&p.marchFactor===1+r.march*p.level&&p.gateFactor===1+r.gate*p.level&&Object.keys(p.attackByUnit).length===r.units.length&&r.units.every(unit=>p.attackByUnit[unit]===1+r.attack*p.level);}
  function trainQuote(s,id,routeId,api={}){
    const r=route(routeId);if(!r||!s.generals.includes(id))return null;
    const old=s.heroSkills?.[id],level=old?.level||0,next=level+1,cost=D.cost(next),busy=api.generalBusy?.(id)||false;
    const reason=old&&old.route!==routeId?'此将已选择 '+route(old.route).name+'，四条路线互斥':level>=D.maxLevel?'此路线已达 5 级':busy?'将领出征或驻守中，请返城后训练':(s.generalLevels[id]||1)<D.heroLevels[next]?'需要将领 '+D.heroLevels[next]+' 级':(s.warOrders?.merit||0)<cost.merit?'军功不足':s.res.gold<cost.gold?'黄金不足':Object.entries(cost.jewels).some(([j,n])=>(s.jewels[j]||0)<n)?'珍宝不足':'';
    return {id,route:routeId,name:r.name,description:r.description,level,next,cost,reason,key:[id,routeId,old?.route||'',level,s.generalLevels[id]||1,!!busy].join('|')};
  }
  // Pure mutation API. The engine owns write-session checks, tick, and save.
  function train(s,id,routeId,key,api={}){
    const q=trainQuote(s,id,routeId,api);if(!q||q.key!==key)return '技能条件已变化，请重新查看';if(q.reason)return q.reason;
    s.res.gold-=q.cost.gold;s.warOrders.merit-=q.cost.merit;s.warOrders.spent+=q.cost.merit;for(const [j,n]of Object.entries(q.cost.jewels))s.jewels[j]-=n;
    s.heroSkills[id]={route:routeId,level:q.next};return null;
  }
  return {routes:D.routes,init,valid,statBonus,profile,validProfile,trainQuote,train};
})();
const GeneralGrowthSystem=GeneralGrowth;


// SOURCE: scout-system.js
'use strict';
// Timed, deterministic PVE scouting. A server must own these snapshots for future PVP.
const ScoutSystem=(()=>{
  const MAX_QUEUE=10,MAX_SCOUTS=1000,MAX_INTEL=256;
  const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
  const coord=p=>obj(p)&&Number.isInteger(p.x)&&p.x>=0&&p.x<64&&Number.isInteger(p.y)&&p.y>=0&&p.y<64;
  const units=api=>api.units||(typeof ManualData!=='undefined'?ManualData.units:{});
  const armyValid=(a,api)=>obj(a)&&Object.entries(a).every(([id,n])=>Object.hasOwn(units(api),id)&&int(n));
  function init(s){if(s.scoutQueue===undefined)s.scoutQueue=[];if(s.scoutIntel===undefined)s.scoutIntel={};}
  const origin=(s,api)=>typeof api.origin==='function'?api.origin(s):api.origin||api.home||{x:32,y:32};
  function assessment(count,tech,counter){const margin=tech+Math.floor(Math.log2(count+1))-counter,quality=margin>=5?3:margin>=3?2:margin>=1?1:0,lost=quality===0?Math.ceil(count*.5):quality===1?Math.floor(count*.1):0;return {quality,success:quality>0,lost,survivors:count-lost};}
  function quote(s,nodeId,count=1,now=Date.now(),api={}){
    const n=api.getNode?.(nodeId,s),o=origin(s,api);if(!n||!coord(n)||!coord(o))return null;
    if(!Number.isSafeInteger(count)||count<1||count>MAX_SCOUTS)return null;
    const counterLevel=api.counterLevel?.(s,n)??Math.min(10,Math.max(1,Math.ceil((n.level||1)/2)+(n.city?2:0))),tech=s.tech.scouting||0;
    const result=assessment(count,tech,counterLevel),distance=Math.hypot(n.x-o.x,n.y-o.y),speed=api.scoutSpeed?.(s)||units(api).scout?.speed||3000;
    const seconds=Math.max(1,Math.ceil((8+distance*2)*(300/speed)/Math.max(1,s.speed||1))),returnSeconds=seconds,cost={food:Math.ceil(count*10+distance*count/2)},ttlMs=(15+tech*5)*60000;
    const queueLimit=Math.min(MAX_QUEUE,Math.max(1,api.queueLimit?.(s)??s.buildings.drill??1));
    const blocked=api.canScout?.(s,n)||'';
    const finalReason=blocked||(s.buildings.drill<1?'请先建造校场':'')||((s.scoutQueue||[]).length>=queueLimit?'侦察队列已满':'')||((s.scoutQueue||[]).some(m=>m.node===nodeId)?'已有斥候前往这个目标':'')||(s.army.scout<count?'城内斥候不足':'')||(s.res.food<cost.food?'行军粮食不足':'');
    return {node:nodeId,name:n.name,count,scouts:count,origin:{x:o.x,y:o.y},target:{x:n.x,y:n.y},distance,seconds,returnSeconds,cost,queueLimit,counterLevel,tech,ttlMs,quality:result.quality,precision:['failed','types','bands','exact'][result.quality],success:result.success,expectedLost:result.lost,reason:finalReason,key:[nodeId,count,o.x,o.y,n.x,n.y,tech,counterLevel,speed,s.speed||1,cost.food,(s.scoutQueue||[]).length].join('|')};
  }
  function dispatch(s,nodeId,count,now,api={},key){
    const q=quote(s,nodeId,count,now,api);if(!q||key!==undefined&&key!==q.key)return '侦察条件已变化，请重新查看';if(q.reason)return q.reason;
    const n=api.getNode(nodeId,s),enemy=api.enemyArmy?.(s,n)||n.army||{};if(!armyValid(enemy,api))return '目标兵力格式不正确';
    let suffix=0,id;do{id='scout_'+now+'_'+suffix++;}while(s.scoutQueue.some(m=>m.id===id));
    s.res.food-=q.cost.food;s.army.scout-=q.count;
    s.scoutQueue.push({id,node:nodeId,origin:q.origin,target:q.target,scouts:q.count,phase:'out',start:now,end:now+q.seconds*1000,arriveAt:now+q.seconds*1000,returnSeconds:q.returnSeconds,cost:q.cost,tech:q.tech,counterLevel:q.counterLevel,ttlMs:q.ttlMs,enemySnapshot:{...enemy},outcome:null});return null;
  }
  function band(n){const step=Math.max(10,10**Math.floor(Math.log10(n||1)));return {min:Math.floor(n/step)*step,max:(Math.floor(n/step)+1)*step-1};}
  function settle(m){const a=assessment(m.scouts,m.tech,m.counterLevel),types=a.success?Object.keys(m.enemySnapshot).filter(id=>m.enemySnapshot[id]>0):[];return {...a,at:m.arriveAt,expiresAt:m.arriveAt+m.ttlMs,level:m.tech,types,army:a.quality===3?{...m.enemySnapshot}:null,bands:a.quality===2?Object.fromEntries(types.map(id=>[id,band(m.enemySnapshot[id])])):null};}
  function tick(s,now,api={}){
    const done=[];for(const m of s.scoutQueue){
      if(m.phase==='out'&&now>=m.end){m.outcome=settle(m);m.phase='return';m.start=m.arriveAt;m.end=m.arriveAt+m.returnSeconds*1000;s.scoutIntel[m.node]={...m.outcome};if(m.outcome.success)api.record?.(s,'scout');}
      if(m.phase==='return'&&now>=m.end){s.army.scout+=m.outcome.survivors;done.push(m.id);}
    }
    if(done.length)s.scoutQueue=s.scoutQueue.filter(m=>!done.includes(m.id));
    const entries=Object.entries(s.scoutIntel).sort((a,b)=>b[1].at-a[1].at);if(entries.length>MAX_INTEL)s.scoutIntel=Object.fromEntries(entries.slice(0,MAX_INTEL));
    return done;
  }
  const heldArmy=s=>({scout:(s.scoutQueue||[]).reduce((sum,m)=>sum+(m.phase==='return'?m.outcome.survivors:m.scouts),0)});
  function intel(s,nodeId,now=Date.now()){const r=s.scoutIntel?.[nodeId];if(!r||!r.success||r.expiresAt<=now)return null;return {...r,exact:r.quality===3,precision:['failed','types','bands','exact'][r.quality]};}
  function valid(s,api={}){
    try{
      const counts=army=>armyValid(army,api),target=id=>typeof id==='string'&&id.length<=100&&(!api.getNode||!!api.getNode(id,s));
      const report=r=>obj(r)&&typeof r.success==='boolean'&&int(r.quality)&&r.quality<=3&&r.success===(r.quality>0)&&int(r.lost)&&int(r.survivors)&&r.lost+r.survivors>=1&&r.lost+r.survivors<=MAX_SCOUTS&&int(r.at)&&int(r.expiresAt)&&r.expiresAt===r.at+(15+r.level*5)*60000&&int(r.level)&&r.level<=10&&Array.isArray(r.types)&&r.types.every(id=>Object.hasOwn(units(api),id))&&new Set(r.types).size===r.types.length&&(r.success||r.types.length===0)&&(r.quality===3?counts(r.army)&&Object.keys(r.army).filter(id=>r.army[id]>0).length===r.types.length&&r.types.every(id=>r.army[id]>0):r.army===null)&&(r.quality===2?obj(r.bands)&&Object.keys(r.bands).length===r.types.length&&r.types.every(id=>obj(r.bands[id])&&int(r.bands[id].min)&&int(r.bands[id].max)&&r.bands[id].max>=r.bands[id].min):r.bands===null);
      const outcomeValid=m=>{if(!report(m.outcome))return false;const expected=settle(m);return ['quality','success','lost','survivors','at','expiresAt','level'].every(k=>m.outcome[k]===expected[k])&&JSON.stringify(m.outcome.types)===JSON.stringify(expected.types)&&JSON.stringify(m.outcome.army)===JSON.stringify(expected.army)&&JSON.stringify(m.outcome.bands)===JSON.stringify(expected.bands);};
      if(!Array.isArray(s.scoutQueue)||s.scoutQueue.length>MAX_QUEUE||!obj(s.scoutIntel)||Object.keys(s.scoutIntel).length>MAX_INTEL||!Object.entries(s.scoutIntel).every(([id,r])=>target(id)&&report(r)))return false;
      if(new Set(s.scoutQueue.map(m=>m.id)).size!==s.scoutQueue.length||new Set(s.scoutQueue.map(m=>m.node)).size!==s.scoutQueue.length)return false;
      return s.scoutQueue.every(m=>obj(m)&&typeof m.id==='string'&&/^scout_\d+_\d+$/.test(m.id)&&target(m.node)&&coord(m.origin)&&coord(m.target)&&int(m.scouts)&&m.scouts>=1&&m.scouts<=MAX_SCOUTS&&['out','return'].includes(m.phase)&&int(m.start)&&int(m.end)&&m.end>m.start&&int(m.arriveAt)&&int(m.returnSeconds)&&m.returnSeconds>=1&&m.returnSeconds<=360000&&obj(m.cost)&&Object.keys(m.cost).length===1&&int(m.cost.food)&&m.cost.food>=m.scouts*10&&int(m.tech)&&m.tech<=10&&int(m.counterLevel)&&m.counterLevel>=1&&m.counterLevel<=10&&m.ttlMs===(15+m.tech*5)*60000&&counts(m.enemySnapshot)&&(m.phase==='out'?m.outcome===null&&m.arriveAt===m.end:outcomeValid(m)&&m.start===m.arriveAt&&m.end===m.arriveAt+m.returnSeconds*1000&&m.outcome.at===m.arriveAt&&m.outcome.lost+m.outcome.survivors===m.scouts&&m.outcome.expiresAt===m.arriveAt+m.ttlMs));
    }catch{return false;}
  }
  return {MAX_QUEUE,MAX_SCOUTS,init,valid,quote,dispatch,tick,heldArmy,intel};
})();


// SOURCE: battle-stratagems.js
'use strict';
// Pure 1D PvE prototype for design/gdd/hero-stratagems.md. The engine owns
// strike/counterstrike, frozen orders, persistence, and unsupported-mode gates.
const BattleStratagems=(()=>{
  const sides=['player','enemy'],opposite=side=>side==='player'?'enemy':'player';
  const RULES=Object.freeze({version:2,points:3,fireLength:100,maxPlans:6,maxEvents:160,melee:['worker','militia','scout','spear','shield','cavalry','heavy','wagon','ram']});
  const definitions=[
    {type:'watch',name:'察伏',cost:1,timing:'当前规划回合、移动之前识破上轮预备射击',consequences:'只取消选定黄忠准备；筹策不退，预留的主攻击不恢复。'},
    {type:'fire',name:'火攻封路',cost:2,timing:'本轮准备，下轮冻结响应后生效一轮',consequences:'本轮施计队放弃主攻击。火区阻挡双方，不造成额外生命伤害；已有队伍占据时失效。'},
    {type:'huangzhong',name:'蓄弦先射',cost:1,timing:'本轮坚守准备，下轮等待敌队实际进入射程',consequences:'两轮预留弓兵主攻击；未触发、取消或被察伏也不补射。'},
    {type:'weiyan',name:'佯退诱追',cost:1,timing:'本轮实际后退准备，下轮只诱前进的敌近战队',consequences:'只放弃准备轮主攻击；诱兵训练价值至少为目标现存价值的三分之一。'},
    {type:'zhaoyun',name:'接应撤军',cost:1,timing:'本轮坚守接应准备，下轮被保护队实际后退时生效',consequences:'准备轮轻骑放弃主攻击；响应轮仍坚守且距被保护队不超过300，后退速度最多为原速1.5倍。被保护队接应后退本轮放弃主攻击，不传送、不增加伤害。'},
    {type:'machao',name:'冲阵退敌',cost:1,timing:'本轮实际前进准备，下轮实际推进接触指定敌近战队',consequences:'准备轮骑兵放弃主攻击；冲阵成功再消耗响应轮主攻击，推退距离为目标速度的一半，最多200。目标坚守完全反制，不额外伤害。'},
    {type:'xushu',name:'料敌先机',cost:1,timing:'当前规划回合即时揭露一个已锁定的敌计目标',consequences:'不取消敌计、不读取未来命令；黄忠尚未确定的进入射程目标不能揭露。'}
  ];
  const identities={
    huangzhong:{id:'huangzhong',name:'黄忠',action:'huangzhong',description:'坚守蓄弦，以两轮主攻击机会换敌军进入射程时的先射。',condition:'存活弓兵；触发轮仍坚守；敌队本次从正常射程外移入。',counter:'坚守、盾兵探阵、察伏或在射程外压制。'},
    weiyan:{id:'weiyan',name:'魏延',action:'weiyan',description:'长枪或轻骑实际后退，使选定的前进近战队追向诱兵。',condition:'诱兵可后退，现存训练价值达到追兵三分之一。',counter:'保持阵线不追、改为后退或先击溃诱兵。'},
    xushu:{id:'xushu',name:'徐庶',action:'xushu',description:'提前看见一个敌方已经提交、尚未公开的具体目标。',condition:'有未公开的火区、诱追、接应或冲阵目标可查。',counter:'正面强攻或不用隐藏目标的战法。'},
    zhaoyun:{id:'zhaoyun',name:'赵云',action:'zhaoyun',description:'轻骑坚守接应另一队撤退，以准备轮主攻击换一次有距离限制的撤军加速。',condition:'存活轻骑；响应轮仍坚守，距被保护队不超过300，被保护队实际后退。',counter:'先击溃或逼离接应骑兵、保持距离，接应不会带来传送或额外攻击。'},
    machao:{id:'machao',name:'马超',action:'machao',description:'轻骑或重骑两轮真实推进接触敌近战队，以主攻击机会换一次有限推退。',condition:'准备轮实际前进，响应轮仍前进并实际移动到指定敌近战队射程内。',counter:'坚守完全抵消冲阵；保持距离或后退使其无法接触。'},
    ordinary:{id:'',name:'普通主将',action:'',description:'可使用察伏、火攻封路。',condition:'按公共计谋条件施计。',counter:'通过距离、指令和公共察伏反制。'}
  };
  const legacyLines={huangzhong:'huangzhong',warrior:'weiyan',strategist:'xushu'},lines={...legacyLines,zhaoyun:'zhaoyun',machao:'machao'};
  const identityTypes=['huangzhong','weiyan','xushu','zhaoyun','machao'],preparingTypes=['fire','huangzhong','weiyan','zhaoyun','machao'],targetTypes=['fire','weiyan','zhaoyun','machao'];
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),integer=n=>Number.isSafeInteger(n)&&n>=0;
  const copy=x=>JSON.parse(JSON.stringify(x)),unitId=id=>typeof id==='string'&&id.length>0&&id.length<=40;
  const rows=(b,side)=>side==='player'?b.player:b.enemy,row=(b,side,id)=>rows(b,side)?.find(r=>r.id===id);
  const alive=r=>!!r&&r.hp>0,kind=type=>definitions.find(d=>d.type===type);
  const units=api=>api?.units||(typeof ManualData!=='undefined'?ManualData.units:{});
  const unitName=(id,api)=>units(api)[id]?.name||id;
  function savedIdentity(hero,version=RULES.version){
    const line=typeof hero==='string'?hero:hero?.wildLine;
    if(version===RULES.version&&!line&&typeof hero?.id==='string'&&hero.id.startsWith('enemy_order_encounter_')&&typeof WarOrders!=='undefined'&&typeof WarOrders.encounterConfig==='function'){
      const cfg=WarOrders.encounterConfig(hero.id.slice(6));if(cfg&&cfg.enemyIdentity===hero.encounterIdentity&&['huangzhong','weiyan'].includes(cfg.enemyIdentity))return cfg.enemyIdentity;
    }
    return (version===1?legacyLines:lines)[line]||'';
  }
  function identity(hero){return {...(identities[savedIdentity(hero)]||identities.ordinary)};}
  function leader(hero){return {id:typeof hero?.id==='string'?hero.id:'',wildLine:typeof hero==='string'?hero:typeof hero?.wildLine==='string'?hero.wildLine:''};}
  function create(b,heroes={}){
    const snapshots={player:heroes.player||b.generalSnapshot,enemy:heroes.enemy||b.enemyGeneralSnapshot},leaders={player:leader(snapshots.player),enemy:leader(snapshots.enemy)};
    return {version:RULES.version,round:(b.round||0)+1,phase:'planning',leaders,identities:Object.fromEntries(sides.map(side=>[side,identity(snapshots[side]).id])),points:{player:RULES.points,enemy:RULES.points},submitted:{player:0,enemy:0},identityUsed:{player:false,enemy:false},seq:0,plans:[],reservations:[],spent:[],orders:null,events:[]};
  }
  function emit(b,type,plan,text,api={},visibleTo=sides){
    const s=b.stratagem,event={id:s.events.length?s.events.at(-1).id+1:1,round:s.round,type,side:plan?.side||'',unit:plan?.unit||'',planId:plan?.id||'',text,visibleTo:[...visibleTo]};
    s.events.push(event);s.events=s.events.slice(-RULES.maxEvents);
    if(visibleTo.length===2)api.log?.(b,text);return event;
  }
  function canonical(action){
    if(!object(action)||!kind(action.type))return null;
    const fields={watch:['type','planId'],fire:['type','unit','left'],huangzhong:['type','unit'],weiyan:['type','unit','target'],zhaoyun:['type','unit','target'],machao:['type','unit','target'],xushu:['type','planId']}[action.type];
    if(Object.keys(action).some(k=>!fields.includes(k)))return null;
    const a={type:action.type};for(const k of fields.slice(1))if(action[k]!==undefined)a[k]=action[k];
    if(a.type==='huangzhong'&&a.unit===undefined)a.unit='archer';return a;
  }
  const undecided=p=>p.status==='prepared'||p.status==='ready'||p.status==='active';
  const liveFire=s=>s.plans.find(p=>p.type==='fire'&&undecided(p));
  function publicPlan(b,p,viewer,api={}){
    const s=b.stratagem,known=p.side===viewer||p.public||p.revealedTo.includes(viewer),d=kind(p.type);
    const v={id:p.id,type:p.type,name:d.name,side:p.side,unit:p.unit,actor:p.unit,planId:p.planId,round:p.round,readyRound:p.readyRound,status:p.status,hidden:!known&&targetTypes.includes(p.type),public:p.public,revealed:known,cancelable:p.side===viewer&&s.phase==='planning'&&p.status==='prepared',reason:p.reason};
    if(known){v.target=p.target;if(p.type==='fire'){v.left=p.left;v.right=p.left+RULES.fireLength;}v.details=p.type==='zhaoyun'?`接应 ${unitName(p.unit,api)}，被保护队 ${unitName(p.target,api)}；距离不超过300，后退最多1.5倍`:p.type==='machao'?`冲阵 ${unitName(p.unit,api)}，敌近战 ${unitName(p.target,api)}；坚守完全反制，推退最多200`:p.type==='fire'?`火区 ${p.left}–${p.left+RULES.fireLength}`:p.type==='weiyan'?`诱兵 ${unitName(p.unit,api)}，追兵 ${unitName(p.target,api)}`:d.timing;}
    return v;
  }
  function options(b,side,type,api={}){
    const s=b.stratagem,foe=opposite(side),catalog=units(api),candidate=kind(type),label=r=>({id:r.id,name:catalog[r.id]?.name||r.id});
    const actors=(rows(b,side)||[]).filter(alive).filter(r=>type==='huangzhong'?r.id==='archer':type==='weiyan'?['spear','cavalry'].includes(r.id):type==='zhaoyun'?r.id==='cavalry':type==='machao'?['cavalry','heavy'].includes(r.id):true).map(label);
    const targets=(rows(b,type==='zhaoyun'?side:foe)||[]).filter(alive).filter(r=>['weiyan','machao'].includes(type)?RULES.melee.includes(r.id):true).map(label);
    const preparations=s?s.plans.filter(p=>p.side===foe&&p.status==='prepared'&&(type==='watch'?p.type==='huangzhong'&&p.readyRound===s.round:type==='xushu'?targetTypes.includes(p.type)&&!p.public&&!p.revealedTo.includes(side):true)).map(p=>publicPlan(b,p,side,api)):[];
    return {actors,targets,preparations,fireBounds:{min:1,max:b.length-RULES.fireLength-1,length:RULES.fireLength},available:!!candidate};
  }
  function trainingValue(r,api){const cost=units(api)[r?.id]?.cost;if(!alive(r)||!object(cost)||!(r.stats?.hp>0))return NaN;return Math.ceil(r.hp/r.stats.hp)*Object.values(cost).reduce((n,c)=>n+c,0);}
  function currentOrder(b,side,id){return side==='player'?b.orders?.[id]?.command||'advance':b.enemyOrders?.[id]?.command||b.stratagem?.orders?.enemy?.[id]?.command||'advance';}
  function quote(b,side,action,api={}){
    const a=canonical(action),d=a&&kind(a.type),s=b?.stratagem;
    const q={ok:false,reason:'',type:a?.type||'',side,unit:a?.unit||'',actor:a?.unit||'',cost:d?.cost||0,round:s?.round||0,readyRound:(s?.round||0)+(preparingTypes.includes(a?.type)?1:0),key:'',requiredOrder:['huangzhong','zhaoyun'].includes(a?.type)?'hold':a?.type==='weiyan'?'fallback':a?.type==='machao'?'advance':'',currentOrder:a?.unit?currentOrder(b,side,a.unit):'',changesOrder:false,timing:d?.timing||'',consequences:d?.consequences||'',options:s&&sides.includes(side)?options(b,side,a?.type,api):{actors:[],targets:[],preparations:[],fireBounds:{min:1,max:0,length:RULES.fireLength}}};
    const reject=reason=>({...q,reason});
    if(!s)return reject('此旧战斗沿原规则结束，未启用计谋');if(!sides.includes(side)||!a)return reject('计谋参数不合法');
    if(b.finished||s.phase!=='planning'||s.round!==b.round+1)return reject('响应指令已经冻结，不能在行动中提交');
    if(preparingTypes.includes(a.type)&&s.round>=30)return reject('本轮已是最后一回合，新的准备来不及生效');
    if(s.submitted[side]===s.round)return reject('本回合已提交一个计谋或身份战法');if(s.points[side]<d.cost)return reject('筹策不足');
    if(!rows(b,side).some(alive))return reject('己方已没有可施计的部队');
    if(identityTypes.includes(a.type)){if(s.identities[side]!==a.type)return reject('此主将没有该身份战法');if(s.identityUsed[side])return reject('主将身份战法每战只能使用一次');}
    const actor=a.unit&&row(b,side,a.unit),target=a.target&&row(b,a.type==='zhaoyun'?side:opposite(side),a.target);
    if(s.version===1&&['zhaoyun','machao'].includes(a.type))return reject('此旧战斗继续原有三名将规则，新战法在下次出征启用');
    if(preparingTypes.includes(a.type)){
      if(!alive(actor))return reject('请选择存活的己方施计队');
      if(s.reservations.some(r=>r.side===side&&r.unit===a.unit&&r.round===s.round))return reject('该队本轮主攻击已经用于另一项准备');
    }
    if(a.type==='huangzhong'&&a.unit!=='archer')return reject('黄忠预备射击需要弓箭兵');
    if(a.type==='weiyan'){
      if(!['spear','cavalry'].includes(a.unit))return reject('魏延诱兵只能选择长枪或轻骑');
      if(!alive(target)||!RULES.melee.includes(target.id))return reject('追兵必须是存活的敌近战队');
      if(side==='player'?actor.pos<=0:actor.pos>=b.length)return reject('诱兵没有实际后退空间');
      const baitValue=trainingValue(actor,api),targetValue=trainingValue(target,api);
      if(!Number.isSafeInteger(baitValue)||!Number.isSafeInteger(targetValue)||baitValue<Math.ceil(targetValue/3))return reject('诱兵现存训练价值不足追兵的三分之一');
      q.baitValue=baitValue;q.targetValue=targetValue;
    }
    if(a.type==='zhaoyun'){
      if(a.unit!=='cavalry')return reject('赵云接应必须选择轻骑');
      if(!alive(target)||target.id===actor.id)return reject('请选择另一支存活的己方被保护队');
      if(side==='player'?target.pos<=0:target.pos>=b.length)return reject('被保护队没有实际后退空间');
      if(Math.abs(actor.pos-target.pos)>300)return reject('接应轻骑距被保护队超过300');
    }
    if(a.type==='machao'){
      if(!['cavalry','heavy'].includes(a.unit))return reject('马超冲阵必须选择轻骑或重骑');
      if(!alive(target)||!RULES.melee.includes(target.id))return reject('冲阵目标必须是存活的敌近战队');
      if(side==='player'?actor.pos>=b.length||target.pos<=actor.pos:actor.pos<=0||target.pos>=actor.pos)return reject('骑兵没有向指定敌队实际前进的空间');
    }
    if(a.type==='fire'){
      if(liveFire(s))return reject('战场已有准备或生效火区');
      const left=a.left,right=left+RULES.fireLength,own=rows(b,side).filter(alive),foes=rows(b,opposite(side)).filter(alive);
      if(!Number.isSafeInteger(left)||left<1||right>b.length-1)return reject('火区必须在战场内，长度为100');
      if([...own,...foes].some(r=>r.pos>=left&&r.pos<=right))return reject('火区内已有部队，请选择空区间');
      if(!foes.some(r=>r.pos>right&&own.some(x=>x.pos<left))&&!foes.some(r=>r.pos<left&&own.some(x=>x.pos>right)))return reject('火区需要位于双方队伍之间');
    }
    if(a.type==='watch'||a.type==='xushu'){
      if(!q.options.preparations.some(p=>p.id===a.planId))return reject(a.type==='watch'?'没有可察伏的上轮黄忠预备射击':'没有可揭露的未公开敌计目标');
    }
    q.changesOrder=!!q.requiredOrder&&q.currentOrder!==q.requiredOrder;
    // The quote ID never serializes an opposing hidden interval or target.
    q.key=JSON.stringify([side,s.round,s.seq,a]);q.ok=true;return q;
  }
  function submit(b,side,action,key,api={}){
    const s=b?.stratagem,a=canonical(action);if(!s||!a||!sides.includes(side))return {ok:false,reason:'计谋参数不合法'};
    if(typeof key!=='string'||!key.length||key.length>1024)return {ok:false,reason:'请先核对当前计谋预览'};
    const previous=s.plans.find(p=>p.key===key);
    if(previous)return previous.side===side&&JSON.stringify(previous.action)===JSON.stringify(a)?{ok:true,reason:'',planId:previous.id,replayed:true,requiredOrder:'',changesOrder:false,cost:0}:{ok:false,reason:'同一命令ID不能用于不同计谋载荷'};
    const q=quote(b,side,a,api);if(!q.ok)return q;if(key!==q.key)return {ok:false,reason:'计谋条件已变化，请重新预览'};
    const preparing=preparingTypes.includes(a.type),p={id:'stratagem_'+(++s.seq),key,action:a,side,type:a.type,unit:a.unit||'',target:a.target||'',planId:a.planId||'',left:a.left??null,round:s.round,readyRound:s.round+(preparing?1:0),status:preparing?'prepared':'resolved',public:!preparing,revealedTo:[],reason:'',sourcePos:a.unit?row(b,side,a.unit).pos:null,retreated:false,baitValue:q.baitValue??null,targetValue:q.targetValue??null,originalTarget:'',originalCaptured:false,chased:false};
    if(['zhaoyun','machao'].includes(p.type))p.effectApplied=false;if(p.type==='machao')p.preparedAdvance=false;
    s.plans.push(p);s.points[side]-=q.cost;s.submitted[side]=s.round;if(identityTypes.includes(a.type))s.identityUsed[side]=true;
    if(preparing){s.reservations.push({side,unit:p.unit,round:p.round,planId:p.id});if(p.type==='huangzhong')s.reservations.push({side,unit:p.unit,round:p.readyRound,planId:p.id});}
    emit(b,'submit',p,(side==='player'?'我军':'敌军')+kind(p.type).name+'已宣布'+(preparing?'，准备一轮':'')+'；筹策 -'+q.cost+'。',api);
    if(p.type==='watch'){
      const targetPlan=s.plans.find(x=>x.id===p.planId);targetPlan.status='cancelled';targetPlan.reason='察伏识破';
      emit(b,'watch',p,'察伏取消了'+unitName(targetPlan.unit,api)+'的预备射击；本回合预留主攻击仍已消耗，筹策不退。',api);
    }
    if(p.type==='xushu'){
      const targetPlan=s.plans.find(x=>x.id===p.planId);targetPlan.revealedTo.push(side);
      emit(b,'reveal',p,'徐庶已揭露一项敌计的锁定目标，没有取消敌计。',api);
      emit(b,'revealDetail',p,'料敌先机：'+publicPlan(b,targetPlan,side,api).details,api,[side]);
    }
    return {...q,planId:p.id,replayed:false};
  }
  function invalidate(b,p,reason,api={}){if(!undecided(p))return;p.status='cancelled';p.reason=reason;emit(b,'cancel',p,kind(p.type).name+(p.type==='weiyan'&&p.chased?'结束：':'失效：')+reason+'；筹策不退，已预留主攻击不恢复。',api);}
  function cancel(b,side,planId,api={}){
    const s=b?.stratagem,p=s?.plans.find(x=>x.id===planId);if(!s||!p||p.side!==side)return {ok:false,reason:'准备不存在或不属于己方'};
    if(b.finished||s.phase!=='planning'||p.status!=='prepared')return {ok:false,reason:'响应已冻结或准备已经结束，不能取消'};
    invalidate(b,p,'主动取消',api);return {ok:true,reason:'',planId};
  }
  function pruneDead(b,api={}){
    const s=b?.stratagem;if(!s)return;
    for(const p of s.plans.filter(undecided))if(!alive(row(b,p.side,p.unit))||['weiyan','machao'].includes(p.type)&&!alive(row(b,opposite(p.side),p.target))||p.type==='zhaoyun'&&!alive(row(b,p.side,p.target)))invalidate(b,p,'关联兵队已失去战斗力',api);
  }
  function normalizeOrders(b,side,input){
    const entries=Array.isArray(input)?Object.fromEntries(input.map(x=>[x.id||x.unit,x.order||x])):input;
    if(!object(entries))return null;const out={};
    for(const r of rows(b,side)){const o=entries[r.id];if(!o){if(alive(r))return null;out[r.id]={command:'hold',target:''};continue;}const target=o.target||'';if(!['advance','hold','fallback'].includes(o.command)||typeof (o.target??'')!=='string'||target!==''&&!(side==='player'&&target==='gate'&&b.gate)&&!row(b,opposite(side),target))return null;out[r.id]={command:o.command,target};}
    return out;
  }
  function beginRound(b,ordersBySide,api={}){
    const s=b?.stratagem;if(!s)return {ok:true,reason:''};
    if(s.phase!=='planning'||s.round!==b.round)return {ok:false,reason:'计谋回合状态不一致'};
    const frozen={player:normalizeOrders(b,'player',ordersBySide?.player),enemy:normalizeOrders(b,'enemy',ordersBySide?.enemy)};
    if(!frozen.player||!frozen.enemy)return {ok:false,reason:'需要双方完整、有效的冻结响应指令'};
    s.orders=frozen;s.phase='acting';s.spent=[];pruneDead(b,api);
    for(const p of s.plans){
      if(p.type==='weiyan'&&p.status==='prepared'&&p.round===s.round){p.originalTarget=frozen[opposite(p.side)][p.target].target;p.originalCaptured=true;}
      if(p.readyRound<=s.round&&!p.public){p.public=true;if(targetTypes.includes(p.type))emit(b,'public',p,'响应已冻结：'+publicPlan(b,p,p.side,api).details+'。',api);}
      if(p.status!=='prepared'||p.readyRound!==s.round)continue;
      if(p.type==='huangzhong'&&frozen[p.side][p.unit].command!=='hold'){invalidate(b,p,'预备射击触发轮未继续坚守',api);continue;}
      if(p.type==='weiyan'){
        if(!p.retreated){invalidate(b,p,'准备轮没有实际后退',api);continue;}
        const targetOrder=frozen[opposite(p.side)][p.target];if(targetOrder.command!=='advance'){invalidate(b,p,'追兵保持阵线或后退，没有追击',api);continue;}
      }
      if(p.type==='zhaoyun'){
        const cover=row(b,p.side,p.unit),protectedRow=row(b,p.side,p.target);
        if(frozen[p.side][p.unit].command!=='hold'){invalidate(b,p,'接应轻骑响应轮没有继续坚守',api);continue;}
        if(frozen[p.side][p.target].command!=='fallback'){invalidate(b,p,'被保护队没有选择后退',api);continue;}
        if(Math.abs(cover.pos-protectedRow.pos)>300){invalidate(b,p,'接应轻骑距被保护队超过300',api);continue;}
      }
      if(p.type==='machao'){
        if(!p.preparedAdvance){invalidate(b,p,'准备轮没有实际前进',api);continue;}
        if(frozen[p.side][p.unit].command!=='advance'){invalidate(b,p,'冲阵骑兵响应轮没有继续前进',api);continue;}
        if(frozen[opposite(p.side)][p.target].command==='hold'){invalidate(b,p,'目标坚守，完全抵消冲阵',api);continue;}
      }
      if(p.type==='fire'){
        if([...b.player,...b.enemy].some(r=>alive(r)&&r.pos>=p.left&&r.pos<=p.left+RULES.fireLength)){invalidate(b,p,'生效时火区内已有部队',api);continue;}
        p.status='active';emit(b,'fire',p,'火区 '+p.left+'–'+(p.left+RULES.fireLength)+'生效一轮，同时阻挡双方，不造成额外伤害。',api);continue;
      }
      p.status='ready';
    }
    return {ok:true,reason:''};
  }
  function preparationOrder(b,side,id,order){
    const s=b?.stratagem,p=s?.plans.find(p=>p.side===side&&p.unit===id&&p.round===s.round&&p.status==='prepared');
    return p&&['huangzhong','zhaoyun'].includes(p.type)?{...order,command:'hold'}:p&&p.type==='weiyan'?{...order,command:'fallback'}:p&&p.type==='machao'?{...order,command:'advance'}:{...order};
  }
  function movementOverride(b,side,r,order,api={}){
    const s=b?.stratagem,p=s?.plans.find(p=>p.type==='weiyan'&&p.side!==side&&p.target===r.id&&p.readyRound===s.round&&p.status==='ready');
    const target=p&&row(b,p.side,p.unit);if(p&&order.command==='advance'&&alive(r)&&alive(target)){
      if(!p.chased){p.chased=true;emit(b,'chase',p,'魏延诱追：'+unitName(r.id,api)+'仍选择前进，改向诱兵'+unitName(target.id,api)+'；接触不到时不改打其他队。',api);}
      return {forcedTarget:target,exclusive:true};
    }
    const rescue=s?.plans.find(p=>p.type==='zhaoyun'&&p.side===side&&p.target===r.id&&p.readyRound===s.round&&p.status==='ready'&&!p.effectApplied);
    if(rescue&&order.command==='fallback'){const cover=row(b,side,rescue.unit);if(alive(cover)&&alive(r)&&s.orders?.[side]?.[cover.id]?.command==='hold'&&Math.abs(cover.pos-r.pos)<=300)return {forcedTarget:null,exclusive:false,speedFactor:1.5};invalidate(b,rescue,'接应队已失去战斗力或距离超过300',api);}
    return {forcedTarget:null,exclusive:false,speedFactor:1};
  }
  function clipMove(b,from,to){
    const p=b?.stratagem?.plans.find(p=>p.type==='fire'&&p.status==='active');if(!p||from===to)return to;
    const left=p.left,right=left+RULES.fireLength;
    if(from<left&&to>=left)return left-1;if(from>right&&to<=right)return right+1;return to;
  }
  function normalAttackAllowed(b,side,id){
    const s=b?.stratagem;if(!s)return true;
    return !s.reservations.some(r=>r.side===side&&r.unit===id&&r.round===s.round)&&!s.spent.some(r=>r.side===side&&r.unit===id);
  }
  function markMainAttack(b,side,id){
    const s=b?.stratagem;if(!s)return true;if(s.phase!=='acting'||!normalAttackAllowed(b,side,id)||!alive(row(b,side,id)))return false;
    s.spent.push({side,unit:id,round:s.round,kind:'normal',planId:''});return true;
  }
  function afterMove(b,side,moving,from,api={}){
    const s=b?.stratagem;if(!s||s.phase!=='acting')return [];pruneDead(b,api);
    for(const p of s.plans)if(!api.forcedMove&&p.type==='weiyan'&&p.side===side&&p.unit===moving.id&&p.round===s.round&&p.status==='prepared'&&(side==='player'?moving.pos<from:moving.pos>from))p.retreated=true;
    const triggered=[];
    for(const p of s.plans){
      if(!api.forcedMove&&p.type==='machao'&&p.side===side&&p.unit===moving.id&&p.round===s.round&&p.status==='prepared'&&(side==='player'?moving.pos>from:moving.pos<from))p.preparedAdvance=true;
      if(!api.forcedMove&&p.type==='zhaoyun'&&p.side===side&&p.target===moving.id&&p.readyRound===s.round&&p.status==='ready'&&!p.effectApplied){
        const cover=row(b,side,p.unit);
        if(alive(cover)&&s.orders[side][p.unit].command==='hold'&&s.orders[side][moving.id].command==='fallback'&&Math.abs(cover.pos-from)<=300&&(side==='player'?moving.pos<from:moving.pos>from)){p.effectApplied=true;p.status='triggered';if(!s.spent.some(x=>x.side===side&&x.unit===moving.id)&&normalAttackAllowed(b,side,moving.id))s.spent.push({side,unit:moving.id,round:s.round,kind:'rescue',planId:p.id});emit(b,'rescue',p,'赵云接应撤军：'+unitName(moving.id,api)+'实际后退 '+Math.abs(moving.pos-from)+'；接应范围300，最多1.5倍后退速度，被保护队本轮主攻击已消耗。',api);}
      }
      if(!api.forcedMove&&p.type==='machao'&&p.side===side&&p.unit===moving.id&&p.readyRound===s.round&&p.status==='ready'&&!p.effectApplied){
        const foe=opposite(side),target=row(b,foe,p.target),advanced=side==='player'?moving.pos>from:moving.pos<from;
        if(!advanced||!alive(target)||s.orders[side][moving.id].command!=='advance'||Math.abs(moving.pos-target.pos)>moving.stats.range)continue;
        if(s.orders[foe][target.id].command==='hold'){invalidate(b,p,'目标坚守，完全抵消冲阵',api);continue;}
        if(!normalAttackAllowed(b,side,moving.id)){invalidate(b,p,'响应轮骑兵主攻击已用于其他准备',api);continue;}
        p.effectApplied=true;p.status='triggered';s.spent.push({side,unit:moving.id,round:s.round,kind:'charge',planId:p.id});
        const origin=target.pos,amount=Math.floor(Math.min(target.stats.speed/2,200)),to=clipMove(b,origin,Math.max(0,Math.min(b.length,origin+(side==='player'?amount:-amount))));target.pos=to;
        emit(b,'charge',p,'马超冲阵：'+unitName(target.id,api)+'被推退 '+Math.abs(to-origin)+'，位置 '+origin+' → '+to+'；骑兵本轮主攻击已消耗，没有额外伤害'+(to===origin?'，边界或火区挡住推退':'')+'。',api);
        if(to!==origin)triggered.push({kind:'forcedMove',side:foe,unit:target.id,from:origin,to,planId:p.id,sourceSide:side,sourceUnit:moving.id});
      }
    }
    const plans=s.plans.filter(p=>p.type==='huangzhong'&&p.side!==side&&p.readyRound===s.round&&p.status==='ready').sort((a,z)=>(row(b,z.side,z.unit)?.stats.speed||0)-(row(b,a.side,a.unit)?.stats.speed||0)||(a.side===z.side?0:a.side==='enemy'?-1:1)||a.unit.localeCompare(z.unit));
    for(const p of plans){const archer=row(b,p.side,p.unit);if(!alive(archer)||!alive(moving)||s.spent.some(x=>x.side===p.side&&x.unit===p.unit)||Math.abs(from-archer.pos)<=archer.stats.range||Math.abs(moving.pos-archer.pos)>archer.stats.range||moving.pos===from)continue;
      p.status='triggered';s.spent.push({side:p.side,unit:p.unit,round:s.round,kind:'trigger',planId:p.id});triggered.push({kind:'readyShot',side:p.side,unit:p.unit,target:moving.id,planId:p.id});
      emit(b,'trigger',p,'黄忠预备射击：'+unitName(moving.id,api)+'实际进入射程；弓队本回合主攻击已使用。',api);
    }
    return triggered;
  }
  function endRound(b,api={}){
    const s=b?.stratagem;if(!s)return {ok:true,reason:''};if(s.phase!=='acting'||s.round!==b.round)return {ok:false,reason:'计谋回合状态不一致'};
    pruneDead(b,api);
    for(const p of s.plans){
      if(p.type==='weiyan'&&p.status==='prepared'&&p.round===s.round&&!p.retreated)invalidate(b,p,'准备轮没有实际后退',api);
      if(p.type==='machao'&&p.status==='prepared'&&p.round===s.round&&!p.preparedAdvance)invalidate(b,p,'准备轮没有实际前进',api);
      if(['ready','active'].includes(p.status)&&p.readyRound===s.round){p.status='expired';p.reason=p.type==='fire'?'火区一轮后熄灭':p.type==='huangzhong'?'没有敌队实际进入射程，不能补普通射击':p.type==='weiyan'?'诱追本轮结束':p.type==='zhaoyun'?'本轮没有发生符合条件的实际后退':'本轮没有实际推进接触目标，冲阵未触发';emit(b,'expire',p,kind(p.type).name+'结束：'+p.reason+'。',api);}
    }
    s.phase='planning';s.round=b.round+1;s.spent=[];s.orders=null;return {ok:true,reason:''};
  }
  function view(b,viewer='player',api={}){
    const s=b?.stratagem;if(!s||!sides.includes(viewer))return {enabled:false,reason:'此战斗沿原规则结束，计谋未启用',preparations:[],plans:[],events:[],actions:[]};
    const visible=s.plans.map(p=>publicPlan(b,p,viewer,api));
    return {enabled:true,side:viewer,round:s.round,phase:s.phase,points:{...s.points},cp:s.points[viewer],submittedThisRound:s.submitted[viewer]===s.round,identityUsed:s.identityUsed[viewer],identities:Object.fromEntries(sides.map(side=>[side,{...(identities[s.identities[side]]||identities.ordinary)}])),identity:{...(identities[s.identities[viewer]]||identities.ordinary)},actions:definitions.filter(d=>!identityTypes.includes(d.type)||d.type===s.identities[viewer]).map(copy),preparations:visible.filter(p=>['prepared','ready','active'].includes(p.status)),plans:visible,reservedMainAttacks:[...s.reservations,...s.spent.filter(r=>['rescue','charge'].includes(r.kind))].filter(r=>r.side===viewer&&r.round===s.round).map(r=>{const p=s.plans.find(p=>p.id===r.planId);return {...r,type:p.type,status:p.status};}),events:s.events.filter(e=>e.visibleTo.includes(viewer)).map(e=>({id:e.id,round:e.round,type:e.type,side:e.side,unit:e.unit,planId:e.planId,text:e.text})),options:options(b,viewer,'fire',api)};
  }
  function valid(b,api={}){
    try{
      const s=b.stratagem;if(s===undefined)return true;
      const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
      const pair=o=>exact(o,sides),catalog=units(api),known=(side,id)=>unitId(id)&&!!catalog[id]&&!!row(b,side,id),bounded=(n,max)=>integer(n)&&n<=max;
      if(!exact(s,['version','round','phase','leaders','identities','points','submitted','identityUsed','seq','plans','reservations','spent','orders','events'])||![1,RULES.version].includes(s.version)||!['planning','acting'].includes(s.phase)||!bounded(s.round,31)||s.round<1||s.round!==b.round+(s.phase==='planning'?1:0)||!sides.every(side=>Array.isArray(rows(b,side)))||!pair(s.leaders)||!pair(s.identities)||!pair(s.points)||!pair(s.submitted)||!pair(s.identityUsed))return false;
      for(const side of sides){const l=s.leaders[side],snapshot=side==='player'?b.generalSnapshot:b.enemyGeneralSnapshot;if(side==='player'&&snapshot?.encounterIdentity!==undefined||!exact(l,['id','wildLine'])||typeof l.id!=='string'||l.id.length>100||typeof l.wildLine!=='string'||l.wildLine.length>40||l.id!==(snapshot?.id||'')||l.wildLine!==(snapshot?.wildLine||'')||s.identities[side]!==savedIdentity(snapshot,s.version)||!bounded(s.points[side],RULES.points)||!bounded(s.submitted[side],s.round)||typeof s.identityUsed[side]!=='boolean')return false;}
      if(!bounded(s.seq,RULES.maxPlans)||!Array.isArray(s.plans)||s.plans.length!==s.seq||!Array.isArray(s.reservations)||s.reservations.length>12||!Array.isArray(s.spent)||s.spent.length>24||!Array.isArray(s.events)||s.events.length>RULES.maxEvents)return false;
      const keys=new Set(),turns=new Set(),expectedReservations=[];
      for(let n=0;n<s.plans.length;n++){
        const p=s.plans[n],a=canonical(p.action),d=kind(p.type);if(!exact(p,['id','key','action','side','type','unit','target','planId','left','round','readyRound','status','public','revealedTo','reason','sourcePos','retreated','baitValue','targetValue','originalTarget','originalCaptured','chased',...(['zhaoyun','machao'].includes(p.type)?['effectApplied']:[]),...(p.type==='machao'?['preparedAdvance']:[])])||p.id!=='stratagem_'+(n+1)||typeof p.key!=='string'||!p.key.length||p.key.length>1024||keys.has(p.key)||!sides.includes(p.side)||!a||JSON.stringify(a)!==JSON.stringify(p.action)||a.type!==p.type||!d||!integer(p.round)||p.round<1||p.round>s.round||turns.has(p.side+':'+p.round)||!['prepared','ready','active','triggered','cancelled','expired','resolved'].includes(p.status)||typeof p.public!=='boolean'||!Array.isArray(p.revealedTo)||p.revealedTo.length>1||p.revealedTo.some(side=>side!==opposite(p.side))||typeof p.reason!=='string'||p.reason.length>200||typeof p.retreated!=='boolean'||typeof p.originalCaptured!=='boolean'||typeof p.chased!=='boolean'||typeof p.originalTarget!=='string'||p.originalTarget.length>40)return false;
        keys.add(p.key);turns.add(p.side+':'+p.round);const preparing=preparingTypes.includes(p.type);
        if(p.unit!==(a.unit||'')||p.target!==(a.target||'')||p.planId!==(a.planId||'')||p.left!==(a.left??null)||p.readyRound!==p.round+(preparing?1:0)||p.readyRound>30||preparing&&!known(p.side,p.unit)||!preparing&&p.unit!==''||preparing&&!Number.isFinite(p.sourcePos)||!preparing&&p.sourcePos!==null||!preparing&&p.status!=='resolved'||p.status==='active'&&p.type!=='fire'||p.status==='triggered'&&!['huangzhong','zhaoyun','machao'].includes(p.type))return false;
        if(p.sourcePos!==null&&(p.sourcePos<0||p.sourcePos>b.length))return false;
        const shouldPublic=!preparing||p.readyRound<s.round||p.readyRound===s.round&&s.phase==='acting';if(p.public!==shouldPublic||p.status==='prepared'&&p.readyRound<s.round||['ready','active'].includes(p.status)&&(s.phase!=='acting'||p.readyRound!==s.round)||p.status==='resolved'&&preparing)return false;
        if(identityTypes.includes(p.type)&&s.identities[p.side]!==p.type)return false;
        if(s.version===1&&['zhaoyun','machao'].includes(p.type))return false;
        if(['zhaoyun','machao'].includes(p.type)){
          if(typeof p.effectApplied!=='boolean'||p.effectApplied!==(p.status==='triggered')||p.effectApplied&&(!p.public||p.readyRound>s.round))return false;
          if(p.type==='zhaoyun'&&(p.unit!=='cavalry'||!known(p.side,p.target)||p.target===p.unit))return false;
          if(p.type==='machao'&&(!['cavalry','heavy'].includes(p.unit)||!known(opposite(p.side),p.target)||!RULES.melee.includes(p.target)||typeof p.preparedAdvance!=='boolean'||['ready','triggered','expired'].includes(p.status)&&!p.preparedAdvance))return false;
          if(p.effectApplied&&s.phase==='acting'&&p.readyRound===s.round){
            const budgetUnit=p.type==='zhaoyun'?p.target:p.unit,paid=s.spent.some(x=>x.side===p.side&&x.unit===budgetUnit&&x.planId===p.id&&x.kind===(p.type==='zhaoyun'?'rescue':'charge'));
            if(!paid&&!(p.type==='zhaoyun'&&s.reservations.some(x=>x.side===p.side&&x.unit===budgetUnit&&x.round===s.round)))return false;
          }
        }
        if(p.type==='huangzhong'&&p.unit!=='archer')return false;
        if(p.type==='weiyan'){
          if(!['spear','cavalry'].includes(p.unit)||!known(opposite(p.side),p.target)||!RULES.melee.includes(p.target)||!integer(p.baitValue)||!integer(p.targetValue)||p.baitValue<1||p.targetValue<1||p.baitValue<Math.ceil(p.targetValue/3))return false;
          for(const [side,id,value]of [[p.side,p.unit,p.baitValue],[opposite(p.side),p.target,p.targetValue]]){const cost=Object.values(catalog[id].cost).reduce((sum,n)=>sum+n,0);if(value%cost!==0||value/cost>row(b,side,id).initial)return false;}
          if(p.chased&&(!p.retreated||!p.originalCaptured||!p.public))return false;
        }else if(p.baitValue!==null||p.targetValue!==null||p.retreated||p.originalCaptured||p.originalTarget!==''||p.chased)return false;
        if(p.type==='fire'&&(!Number.isSafeInteger(p.left)||p.left<1||p.left+RULES.fireLength>b.length-1)||p.type!=='fire'&&p.left!==null)return false;
        if(preparing){expectedReservations.push({side:p.side,unit:p.unit,round:p.round,planId:p.id});if(p.type==='huangzhong')expectedReservations.push({side:p.side,unit:p.unit,round:p.readyRound,planId:p.id});}
        if(p.type==='watch'||p.type==='xushu'){const target=s.plans.find(x=>x.id===p.planId);if(!target||target.side===p.side||Number(target.id.slice(10))>=n+1||p.type==='watch'&&(target.type!=='huangzhong'||target.readyRound!==p.round)||p.type==='xushu'&&!targetTypes.includes(target.type))return false;}
      }
      for(const p of s.plans){const revealed=s.plans.filter(x=>x.type==='xushu'&&x.planId===p.id).map(x=>x.side);if(JSON.stringify(p.revealedTo)!==JSON.stringify(revealed))return false;}
      if(JSON.stringify(expectedReservations)!==JSON.stringify(s.reservations)||s.plans.filter(p=>p.type==='fire'&&undecided(p)).length>1)return false;
      for(const side of sides){const owned=s.plans.filter(p=>p.side===side),identitiesUsed=owned.filter(p=>identityTypes.includes(p.type));if(s.points[side]!==RULES.points-owned.reduce((sum,p)=>sum+kind(p.type).cost,0)||identitiesUsed.length>1||s.identityUsed[side]!==!!identitiesUsed.length||s.submitted[side]!==Math.max(0,...owned.map(p=>p.round)))return false;}
      const spent=new Set();for(const attack of s.spent){if(!exact(attack,['side','unit','round','kind','planId'])||!sides.includes(attack.side)||!known(attack.side,attack.unit)||attack.round!==s.round||!['normal','trigger','charge','rescue'].includes(attack.kind)||spent.has(attack.side+':'+attack.unit))return false;spent.add(attack.side+':'+attack.unit);if(attack.kind==='trigger'){const p=s.plans.find(p=>p.id===attack.planId);if(!p||p.type!=='huangzhong'||p.status!=='triggered'||p.side!==attack.side||p.unit!==attack.unit||p.readyRound!==s.round)return false;}else if(attack.kind==='rescue'){const p=s.plans.find(p=>p.id===attack.planId);if(!p||p.type!=='zhaoyun'||!p.effectApplied||p.status!=='triggered'||p.side!==attack.side||p.target!==attack.unit||p.readyRound!==s.round||s.reservations.some(r=>r.side===attack.side&&r.unit===attack.unit&&r.round===s.round))return false;}else if(attack.kind==='charge'){const p=s.plans.find(p=>p.id===attack.planId);if(!p||p.type!=='machao'||!p.effectApplied||p.status!=='triggered'||p.side!==attack.side||p.unit!==attack.unit||p.readyRound!==s.round||s.reservations.some(r=>r.side===attack.side&&r.unit===attack.unit&&r.round===s.round))return false;}else if(attack.planId!==''||s.reservations.some(r=>r.side===attack.side&&r.unit===attack.unit&&r.round===s.round))return false;}
      if(s.phase==='planning'&&(s.orders!==null||s.spent.length))return false;
      if(s.phase==='acting'){if(!pair(s.orders))return false;for(const side of sides){const normalized=normalizeOrders(b,side,s.orders[side]);if(!normalized||JSON.stringify(normalized)!==JSON.stringify(s.orders[side]))return false;}}
      let lastEvent=0;for(const e of s.events){if(!exact(e,['id','round','type','side','unit','planId','text','visibleTo'])||!integer(e.id)||e.id<=lastEvent||!integer(e.round)||e.round<1||e.round>s.round||!['submit','watch','reveal','revealDetail','cancel','public','fire','trigger','chase','rescue','charge','expire'].includes(e.type)||!sides.includes(e.side)||typeof e.text!=='string'||e.text.length>500||!Array.isArray(e.visibleTo)||e.visibleTo.length<1||e.visibleTo.length>2||new Set(e.visibleTo).size!==e.visibleTo.length||e.visibleTo.some(side=>!sides.includes(side))||!s.plans.some(p=>p.id===e.planId&&p.side===e.side&&p.unit===e.unit)||e.type==='revealDetail'&&(e.visibleTo.length!==1||e.visibleTo[0]!==e.side))return false;lastEvent=e.id;}
      return true;
    }catch{return false;}
  }
  return {RULES,actions:definitions.map(copy),identities:copy(identities),create,identity,quote,submit,beginRound,preparationOrder,movementOverride,clipMove,afterMove,normalAttackAllowed,markMainAttack,endRound,cancel,pruneDead,view,valid};
})();


// SOURCE: tactical-lessons.js
'use strict';
// Fixed practice armies use the same unit tables and round resolver as PvE.
// Nothing in this module grants heroes, items, rewards or permanent progress.
const TacticalLessons=(()=>{
  const definitions=[
    {id:'spear_cavalry',basic:true,title:'长枪抗骑 · 保护弓阵',generalName:'先锋将',wildLine:'',description:'固定借调30长枪、18弓箭手，对阵18轻骑、8弓箭手。让枪阵接触轻骑，观察枪骑交锋与弓阵受击。',objective:'打败练习守军，观察队形与克制。',length:1800,player:[['spear',30,0,'advance'],['archer',18,0,'hold']],enemy:[['cavalry',18,1800,'advance'],['archer',8,1800,'hold']]},
    {id:'siege_guard',basic:true,siegeNode:'luo_gate',title:'护卫器械 · 河洛东门',generalName:'先锋将',wildLine:'',description:'借调450刀盾、240长枪、420弓箭手、12冲车、2投石车。使用原第三章河洛东门、实际守军和18000耐久城门；演练不开放正式章节或占领城池。',objective:'推进护卫和器械，先破城门，再清守军。观察破門回合、箭楼和器械存活。',length:1800,player:[['shield',450,0,'advance'],['spear',240,0,'advance'],['archer',420,0,'advance'],['ram',12,0,'advance'],['catapult',2,0,'advance']],enemy:[]},
    {id:'opening_battle',basic:true,title:'开场 · 黄巾遭遇战',generalName:'先锋将',wildLine:'',description:'盾兵前进吸收箭矢，弓兵先坚守射击；如果够不到敌人，再推进弓队。逐队选择向前、坚守、后退，点击下一回合观察变化。',objective:'打败黄巾部队，认识射程、速度和逐队指令。也可以随时跳过，回城按指引发展。',length:1600,player:[['shield',24,0,'advance'],['archer',30,0,'hold']],enemy:[['militia',18,1600,'advance'],['spear',8,1600,'advance'],['archer',12,1600,'hold']]},
    {id:'ready_shot',title:'一 · 蓄弦与探阵',generalName:'黄忠',wildLine:'huangzhong',description:'黄忠的弓队先准备一轮。第二轮，盾兵从射程外进入时先射；盾兵仍抵御箭矢。比较准备射击与普通连续射击的代价。',objective:'用弓箭兵提交蓄弦先射，再推进两轮，观察盾兵进入射程时的先手与克制。',length:2600,player:[['archer',50,1000,'hold'],['shield',15,900,'hold']],enemy:[['shield',35,2600,'advance'],['archer',10,2600,'hold']]},
    {id:'bait_chase',title:'二 · 诱追与守势',generalName:'魏延',wildLine:'warrior',description:'长枪阵先退到弓队后方。仍前进的轻骑被诱去追枪阵；不追的盾阵保留原令。诱追只改变目标，不加移动、不送第二次攻击。',objective:'以长枪兵诱退敌方轻骑，再推进两轮；比较轻骑追枪与弓队遭骑兵克制的区别。',length:3000,player:[['spear',30,1200,'hold'],['archer',35,1100,'hold']],enemy:[['cavalry',20,2600,'advance'],['shield',25,3000,'hold']]},
    {id:'fire_reveal',title:'三 · 料敌与封路',generalName:'徐庶',wildLine:'strategist',description:'开局时敌弓队已准备火攻，具体区间尚未公开。徐庶能提前揭露，让你调整本轮位置；火区下一轮才截停双方，且不额外扣血。',objective:'揭露敌方火攻，再调整前进或坚守，推进两轮观察火区。',length:3000,player:[['spear',25,900,'hold'],['archer',40,600,'hold']],enemy:[['cavalry',15,2600,'advance'],['archer',20,2800,'hold']],enemyPlan:{type:'fire',unit:'archer',left:1400}},
    {id:'rescue_retreat',title:'四 · 接应与撤军',generalName:'赵云',wildLine:'zhaoyun',description:'轻骑坚守准备接应弓队。下一轮保持轻骑坚守，让附近弓队后退：后退速度最多1.5倍，被保护队放弃本轮主攻击。离开300范围或先击溃接应骑兵会使接应失效。',objective:'以轻骑接应弓队，准备一轮后将弓队改为后退，观察真实移动与主攻击代价。',length:4000,player:[['cavalry',25,1500,'hold'],['archer',35,1400,'hold']],enemy:[['spear',20,3600,'hold'],['archer',10,3800,'hold']]},
    {id:'charge_hold',title:'五 · 冲阵与固守',generalName:'马超',wildLine:'machao',description:'轻骑先实际前进准备冲阵。下一轮继续推进到敌长枪阵，若它没有固守，骑兵牺牲本轮主攻击推退敌阵；距离不足、没有真实推进或目标固守都会阻止冲阵。',objective:'以轻骑向敌长枪阵准备冲阵，推进两轮，观察有限推退与两轮主攻击代价。',length:3500,player:[['cavalry',45,200,'advance'],['archer',25,0,'hold']],enemy:[['spear',30,2400,'advance'],['archer',10,3500,'hold']]}
  ];
  function create(id,units){
    const d=definitions.find(x=>x.id===id);if(!d)return null;
    const rows=entries=>entries.map(([unit,count,pos])=>{const u=units[unit],stats=Object.fromEntries(['hp','atk','def','range','speed'].map(k=>[k,u[k]]));return {id:unit,initial:count,stats,hp:count*stats.hp,maxHp:count*stats.hp,pos,defending:false};});
    const generalSnapshot={id:'practice_'+id,name:d.generalName,wildLine:d.wildLine,atk:80,def:70,wis:85,pol:60,lead:50,bonus:d.wildLine==='huangzhong'?'archer':d.wildLine==='warrior'?'spear':['zhaoyun','machao'].includes(d.wildLine)?'cavalry':'shield'};
    const target=d.siegeNode?Game.getNode(d.siegeNode):null;
    const enemyEntries=target?Object.entries(target.army).map(([unit,count])=>[unit,count,d.length,'hold']):d.enemy;
    const node=target?{...target,name:d.title}:{id:'practice_'+id,name:d.title,level:1,terrain:'plain',army:{},loot:{},time:0};
    const battle={rules:3,lesson:id,node:node.id,general:generalSnapshot.id,generalSnapshot,enemyGeneralSnapshot:{id:'practice_enemy_'+id,name:'演练守军',wildLine:''},mode:target?'occupy':'raid',length:d.length,siege:!!target,gate:target?SiegeSystem.gate(target,'occupy'):null,militia:0,round:0,machineGateAttacks:0,currentRoundSummary:{round:0,events:[]},player:rows(d.player),enemy:rows(enemyEntries),orders:Object.fromEntries(d.player.map(([unit,,,_order])=>[unit,{command:_order,target:''}])),enemyOrders:Object.fromEntries(enemyEntries.map(([unit,,,_order])=>[unit,{command:_order,target:''}])),log:['独立演练：使用固定阵容，不消耗正式资源、军队或奖励。'],auto:false,finished:false,result:null};
    return {id,title:d.title,generalName:d.generalName,description:d.description,objective:d.objective,node,battle,enemyPlan:d.enemyPlan?{...d.enemyPlan}:null,result:null};
  }
  function objectiveMet(session){
    if(session.id==='opening_battle'||definitions.find(d=>d.id===session.id)?.basic)return false;
    const b=session.battle,types={ready_shot:'huangzhong',bait_chase:'weiyan',fire_reveal:'xushu',rescue_retreat:'zhaoyun',charge_hold:'machao'},plans=b.stratagem?.plans||[];
    return b.round>=2&&plans.some(p=>p.side==='player'&&p.type===types[session.id]&&(session.id==='bait_chase'?p.chased===true:['rescue_retreat','charge_hold'].includes(session.id)?p.effectApplied===true:['triggered','resolved'].includes(p.status)));
  }
  function finish(session,won){
    const b=session.battle,met=session.id==='opening_battle'||definitions.find(d=>d.id===session.id)?.basic?won:objectiveMet(session);
    const result={won,round:b.round,objectiveMet:met,summary:(session.id==='opening_battle'||definitions.find(d=>d.id===session.id)?.basic)?(won?'遭遇战获胜！回城领取工程补给，跟随引导建设、募兵，再发起真正的出征。':'先锋演练结束，可重试改变指令，或直接回城跟随成长路线。'):met?'已观察到本课战法的作用。教学观察结束，可重开比较另一套指令；这不代表正式战斗已经歼灭全部敌军。':'演练结束。可重开按目标试一次，观察日志中的准备、反制和失效原因。'};
    session.result=result;b.result=result;b.finished=true;b.auto=false;return result;
  }
  return {definitions,create,objectiveMet,finish};
})();


// SOURCE: regional-front.js
'use strict';
// Voluntary local fronts share the real city-defense battle. Values are trial PVE rules.
const RegionalFront=(()=>{
  const WARNING=5*60*1000,COOLDOWN=30*60*1000,MAX_LEVEL=3;
  const stages=Object.freeze(['进犯','强攻','守住']);
  const profiles=Object.freeze({
    granary:Object.freeze({name:'粮城护粮战线',profile:'region_granary',army:Object.freeze({militia:80,spear:30,archer:40}),resource:Object.freeze({food:1800}),hint:'步弓混编争夺粮道，补充弓兵并用工事分担损伤。'}),
    mine:Object.freeze({name:'矿城保矿战线',profile:'region_mine',army:Object.freeze({shield:50,spear:40,archer:30,ram:4}),resource:Object.freeze({wood:600,stone:600,iron:600}),hint:'盾枪掩护冲车，检查城墙、远程兵与器械防线。'}),
    pass:Object.freeze({name:'关隘扼守战线',profile:'region_pass',army:Object.freeze({spear:30,cavalry:45,heavy:8,archer:20}),resource:Object.freeze({food:700,wood:400,iron:400}),hint:'骑军威胁关口，长枪、拒马与箭塔可帮助拦截。'})
  });
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
  const keys=(x,list)=>object(x)&&Object.keys(x).length===list.length&&list.every(k=>Object.hasOwn(x,k));
  const same=(a,b)=>object(a)&&object(b)&&JSON.stringify(Object.keys(a).sort().map(k=>[k,a[k]]))===JSON.stringify(Object.keys(b).sort().map(k=>[k,b[k]]));
  const current=s=>s.realm?.cities?.[s.scopeID||s.realm?.activeCity];
  const kind=city=>typeof CityStrategy==='undefined'?'balanced':CityStrategy.profile(city).id;
  const sumStage=(f,i)=>[1,2,3].reduce((n,l)=>n+f.wins[l][i],0);
  const completed=f=>[1,2,3].reduce((n,l)=>n+f.wins[l][2],0);
  function init(s){if(s.regionalFront===undefined)s.regionalFront={version:1,seq:0,run:null,nextAt:0,wins:{1:[0,0,0],2:[0,0,0],3:[0,0,0]},earnedMerit:0,last:null};}
  function waveSpec(m){
    if(!keys(m,['version','id','city','kind','level','stage','attempt','startedAt','arriveAt','first'])||m.version!==1||typeof m.city!=='string'||!/^city_[a-zA-Z0-9_]+$/.test(m.city)||!Object.hasOwn(profiles,m.kind)||kind(m.city)!==m.kind||typeof m.id!=='string'||!new RegExp('^front_'+m.city+'_[1-9]\\d*$').test(m.id)||!int(Number(m.id.slice(('front_'+m.city+'_').length)))||!int(m.level)||m.level<1||m.level>MAX_LEVEL||!int(m.stage)||m.stage<1||m.stage>3||!int(m.attempt)||m.attempt<1||!int(m.startedAt)||!int(m.arriveAt)||m.arriveAt-m.startedAt!==WARNING||typeof m.first!=='boolean')return null;
    const p=profiles[m.kind],factor=m.level*m.stage;
    return {profile:p.profile,name:p.name+' · '+stages[m.stage-1],army:Object.fromEntries(Object.entries(p.army).map(([id,n])=>[id,n*factor])),reward:Object.fromEntries(Object.entries(p.resource).map(([id,n])=>[id,n*factor*(m.first?2:.5)])),cost:{gold:0,food:0},xp:m.level*NPCDefenseData.xpPerLevel,merit:[3,5,8][m.stage-1]*m.level+(m.first?[12,18,30][m.stage-1]:0)};
  }
  function matches(s,m,cityId=s.scopeID||s.realm?.activeCity){
    const f=s.regionalFront,r=f?.run;
    return !!waveSpec(m)&&!!r&&r.city===cityId&&m.city===cityId&&r.id===m.id&&r.kind===m.kind&&r.level===m.level&&r.stage===m.stage&&r.attempt===m.attempt&&same(r.pending,m)&&m.first===(sumStage(f,m.stage-1)===0);
  }
  function valid(s,city=current(s)){
    try{
      const f=s.regionalFront;
      if(!keys(f,['version','seq','run','nextAt','wins','earnedMerit','last'])||f.version!==1||!int(f.seq)||!int(f.nextAt)||!int(f.earnedMerit)||!keys(f.wins,['1','2','3'])||![1,2,3].every(l=>Array.isArray(f.wins[l])&&f.wins[l].length===3&&f.wins[l].every(int)))return false;
      const r=f.run,done=completed(f),cityKind=kind(city),owned=city&&s.realm?.cities?.[city.id]&&s.conquered?.[city.node]===true;
      if(r===null)return f.seq===0&&f.nextAt===0&&f.earnedMerit===0&&f.last===null&&[0,1,2].every(i=>sumStage(f,i)===0)&&!s.cityDefense?.incoming?.front&&!s.cityDefense?.battle?.front;
      if(!owned||!Object.hasOwn(profiles,cityKind)||!keys(r,['id','city','kind','level','stage','status','attempt','startedAt','pending'])||r.city!==city.id||r.kind!==cityKind||r.id!=='front_'+city.id+'_'+f.seq||!int(r.level)||r.level<1||r.level>MAX_LEVEL||!int(r.stage)||r.stage<1||r.stage>3||!['ready','incoming','battle','retry','complete'].includes(r.status)||!int(r.attempt)||!int(r.startedAt)||f.seq!==(done+(r.status==='complete'?0:1))||r.status==='complete'&&r.stage!==3)return false;
      for(const l of [1,2,3])for(let i=0;i<3;i++)if(f.wins[l][i]!==f.wins[l][2]+(r.status!=='complete'&&l===r.level&&i<r.stage-1?1:0))return false;
      let merit=0;for(let i=0;i<3;i++){if(sumStage(f,i)>0)merit+=[12,18,30][i];for(const l of [1,2,3])merit+=f.wins[l][i]*[3,5,8][i]*l;}if(!int(merit)||merit!==f.earnedMerit)return false;
      if(r.status==='complete'?(f.nextAt===0||!f.last||!f.last.won||f.nextAt!==f.last.at+COOLDOWN):f.nextAt!==0)return false;
      if(['incoming','battle'].includes(r.status)){
        if(!matches(s,r.pending,city.id)||r.pending.startedAt<r.startedAt)return false;
        const w=r.status==='incoming'?s.cityDefense?.incoming:s.cityDefense?.battle;
        if(!w||!same(w.front,r.pending)||w.drill===true)return false;
        if(r.status==='incoming'&&s.cityDefense?.battle?.front||r.status==='battle'&&s.cityDefense?.incoming?.front)return false;
      }else if(r.pending!==null||s.cityDefense?.incoming?.front||s.cityDefense?.battle?.front)return false;
      if(f.last!==null){
        const a=f.last,q=waveSpec(a.front);
        if(!keys(a,['front','won','at','merit'])||!q||a.front.city!==city.id||a.front.kind!==cityKind||!int(a.at)||a.at<a.front.arriveAt||typeof a.won!=='boolean'||a.merit!==(a.won?q.merit:0)||Number(a.front.id.slice(('front_'+city.id+'_').length))>f.seq||a.won&&f.wins[a.front.level][a.front.stage-1]<1)return false;
        if(r.status==='retry'&&(!same(a.front,{...a.front,id:r.id,level:r.level,stage:r.stage,attempt:r.attempt})||a.won))return false;
        if(r.status==='complete'&&(a.front.id!==r.id||a.front.stage!==3||!a.won))return false;
      }else if(r.status==='retry'||r.status==='complete'||f.earnedMerit>0)return false;
      const history=(s.cityDefense?.reports||[]).filter(a=>a.front);
      const ids=new Set();for(const a of history){const m=a.front,q=waveSpec(m),k=m.id+':'+m.stage+':'+m.attempt,c=a.regionalFront;if(!q||m.city!==city.id||m.kind!==cityKind||Number(m.id.slice(('front_'+city.id+'_').length))>f.seq||ids.has(k)||a.won&&f.wins[m.level][m.stage-1]<1||m.id===r.id&&r.status!=='complete'&&(m.stage>r.stage||a.won&&m.stage>=r.stage||m.stage===r.stage&&m.attempt>r.attempt)||!keys(c,['merit','first','complete'])||c.merit!==(a.won?q.merit:0)||c.first!==(a.won&&m.first)||c.complete!==(a.won&&m.stage===3))return false;ids.add(k);}
      for(const l of [1,2,3])for(let i=1;i<=3;i++)if(history.filter(a=>a.won&&a.front.level===l&&a.front.stage===i).length>f.wins[l][i-1])return false;
      for(let i=1;i<=3;i++)if(history.filter(a=>a.won&&a.front.stage===i&&a.front.first).length>1)return false;
      return true;
    }catch{return false;}
  }
  function quote(s,city=current(s),now=Date.now(),selectedLevel){
    const f=s.regionalFront,r=f?.run,p=profiles[kind(city)];if(!p||!city||!s.realm?.cities?.[city.id]||s.conquered?.[city.node]!==true)return null;
    const active=!!r&&r.status!=='complete',maxLevel=Math.min(MAX_LEVEL,Math.max(1,Math.floor((s.buildings?.hall||0)/2))),level=active?r.level:selectedLevel===undefined?1:selectedLevel;
    if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)return null;
    const stage=active?r.stage:1,first=sumStage(f,stage-1)===0,m=active&&r.pending?{...r.pending}:{version:1,id:active?r.id:'front_'+city.id+'_'+(f.seq+1),city:city.id,kind:kind(city),level,stage,attempt:active?r.attempt+1:1,startedAt:now,arriveAt:now+WARNING,first},spec=waveSpec(m);
    const reason=!valid(s,city)?'战线记录异常，请重新载入':s.realm.activeCity!==city.id?'请先进入此城，再从本城开启战线':s.buildings.hall<2?'本城官府达到 2 级后可开启战线':!active&&level>maxLevel?'难度不能超过本城官府允许的上限':r&&['incoming','battle'].includes(r.status)?'本阶段已开始，请先完成当前守城':s.cityDefense?.incoming||s.cityDefense?.battle?'本城已有来袭或守城战，请先处理':f.nextAt>now?'本城正在整军，请等待冷却结束':'';
    return {...spec,city:city.id,cityName:city.name,kind:kind(city),level,stage,status:r?.status||'idle',maxLevel,active,first,warningMs:WARNING,arriveAt:active&&r.pending?r.pending.arriveAt:m.arriveAt,nextAt:f.nextAt,hint:p.hint,reason,key:[city.id,f.seq,r?.stage||0,r?.status||'idle',r?.attempt||0,level,first,s.buildings.hall,!!s.cityDefense?.incoming,!!s.cityDefense?.battle,f.nextAt].join('|'),meta:m};
  }
  function start(s,city,now,key,api={},level){
    const q=quote(s,city,now,level);if(!q||q.key!==key)return '战线条件已变化，请重新预览';if(q.reason)return q.reason;
    if(typeof api.requestRegional!=='function')return '守城接口尚未准备好';
    const f=s.regionalFront,prior={seq:f.seq,run:f.run,nextAt:f.nextAt};
    if(!q.active){f.seq++;f.run={id:q.meta.id,city:city.id,kind:q.kind,level:q.level,stage:1,status:'ready',attempt:0,startedAt:now,pending:null};}
    const r=f.run,previous={...r};r.attempt=q.meta.attempt;r.status='incoming';r.pending={...q.meta};f.nextAt=0;
    const error=api.requestRegional(r.pending);if(error){if(!q.active)Object.assign(f,prior);else f.run=previous;return error;}
    return null;
  }
  function markBattle(s,b){const r=s.regionalFront?.run;if(!b?.front||b.drill||r?.status!=='incoming'||!matches(s,b.front))return false;r.status='battle';return true;}
  function settle(s,report,now,api={}){
    const f=s.regionalFront,r=f?.run,m=report?.front,q=waveSpec(m);
    if(!q||r?.status!=='battle'||!matches(s,m)||s.cityDefense?.battle||s.cityDefense?.reports?.[0]!==report||report.drill||report.kind!=='defense'||report.regionalFront!==undefined||report.profile!==q.profile||report.level!==m.level||!same(report.rewardSnapshot,q.reward)||!same(report.costSnapshot,q.cost)||!same(report.resourceReceipt?.loaded,report.won?q.reward:{})||report.xp!==(report.won?q.xp:0)||!Number.isSafeInteger(now)||now<m.arriveAt||typeof report.won!=='boolean')return '战线战报不匹配，未重复结算';
    const points=report.won?q.merit:0;if(points&&typeof api.addMerit!=='function'&&(!s.warOrders||!int(s.warOrders.merit)||!int(s.warOrders.earned)))return '军功接口尚未准备好';
    if(points){if(api.addMerit)api.addMerit(points);else {s.warOrders.merit+=points;s.warOrders.earned+=points;}f.earnedMerit+=points;f.wins[r.level][r.stage-1]++;}
    f.last={front:{...m},won:report.won,at:now,merit:points};r.pending=null;
    if(!report.won)r.status='retry';else if(r.stage===3){r.status='complete';f.nextAt=now+COOLDOWN;}else {r.stage++;r.attempt=0;r.status='ready';}
    report.regionalFront={merit:points,first:report.won&&m.first,complete:r.status==='complete'};return null;
  }
  return Object.freeze({WARNING,COOLDOWN,MAX_LEVEL,stages,profiles,init,valid,quote,start,settle,markBattle,waveSpec,matches});
})();


// SOURCE: supply-lines.js
'use strict';
// Route configuration is persistent; plans are derived from current city scopes.
// This module never advances time, switches cities, saves, or creates resources.
const SupplyLines=(()=>{
  const resources=['food','wood','stone','iron','gold'],maxLines=12,maxStock=1000000000,maxArmy=1000000;
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),clone=x=>JSON.parse(JSON.stringify(x));
  const integer=(n,max=maxStock)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
  const fields=['id','sourceCity','destinationCity','resource','targetStock','sourceReserve','army','enabled'];
  const routeOf=(s,id)=>s.realm?.supplyLines?.lines.find(l=>l.id===id);
  const jobs=(s,id)=>s.realm?.logistics?.filter(j=>j.supplyLine===id)||[];
  const scope=c=>c?.data?{...c,...c.data}:c;
  function init(s){if(s.realm&&s.realm.supplyLines===undefined)s.realm.supplyLines={version:1,nextId:1,lines:[]};}
  function armyValid(s,a){return object(a)&&Object.keys(a).length>0&&Object.entries(a).every(([id,n])=>Object.hasOwn(s.army||{},id)&&integer(n,maxArmy)&&n>0)&&Object.values(a).reduce((v,n)=>v+n,0)<=maxArmy;}
  function lineValid(s,l){return object(l)&&Object.keys(l).length===fields.length&&fields.every(k=>Object.hasOwn(l,k))&&typeof l.id==='string'&&/^supply_[1-9]\d*$/.test(l.id)&&typeof l.sourceCity==='string'&&typeof l.destinationCity==='string'&&Object.hasOwn(s.realm.cities,l.sourceCity)&&Object.hasOwn(s.realm.cities,l.destinationCity)&&l.sourceCity!==l.destinationCity&&resources.includes(l.resource)&&integer(l.targetStock)&&l.targetStock>0&&integer(l.sourceReserve)&&armyValid(s,l.army)&&typeof l.enabled==='boolean';}
  function valid(s){
    if(!object(s?.realm)||!object(s.realm.cities)||!Array.isArray(s.realm.logistics))return false;
    const a=s.realm?.supplyLines;if(!object(a)||Object.keys(a).length!==3||a.version!==1||!integer(a.nextId,maxStock)||a.nextId<1||!Array.isArray(a.lines)||a.lines.length>maxLines)return false;
    const ids=new Set(),directions=new Set();for(const l of a.lines){if(!lineValid(s,l)||Number(l.id.slice(7))>=a.nextId||ids.has(l.id))return false;const key=JSON.stringify([l.sourceCity,l.destinationCity,l.resource]);if(directions.has(key))return false;directions.add(key);ids.add(l.id);}
    const counts=new Map();for(const j of s.realm.logistics){if(!object(j))return false;if(j.supplyLine===undefined)continue;const l=routeOf(s,j.supplyLine);if(!l||j.kind!=='transport'||j.sourceCity!==l.sourceCity||j.destinationCity!==l.destinationCity||j.general||!object(j.cargo)||!object(j.army)||Object.keys(j.army).some(id=>!Object.hasOwn(s.army||{},id))||!integer(j.cargo[l.resource],Number.MAX_SAFE_INTEGER)||j.cargo[l.resource]<1||Object.entries(j.cargo).some(([id,n])=>!resources.includes(id)||id!==l.resource&&n!==0)||Object.keys(s.army||{}).some(id=>(j.army[id]||0)!==(l.army[id]||0)))return false;counts.set(l.id,(counts.get(l.id)||0)+1);if(counts.get(l.id)>1)return false;}
    return true;
  }
  function draftOf(s,draft){
    if(!object(draft)||Object.keys(draft).some(k=>!fields.includes(k)))return null;
    const army=object(draft.army)?Object.fromEntries(Object.keys(s.army||{}).filter(id=>draft.army[id]>0).map(id=>[id,draft.army[id]])):null;
    if(!object(draft.army)||Object.entries(draft.army).some(([id,n])=>!Object.hasOwn(s.army||{},id)||!integer(n,maxArmy)))return null;
    return {id:draft.id||'',sourceCity:draft.sourceCity,destinationCity:draft.destinationCity,resource:draft.resource,targetStock:draft.targetStock,sourceReserve:draft.sourceReserve,army,enabled:draft.enabled};
  }
  function configReason(s,d){
    if(!d)return '补给线配置格式无效';
    if(d.id&&!routeOf(s,d.id))return '补给线不存在';
    if(typeof d.sourceCity!=='string'||typeof d.destinationCity!=='string'||!Object.hasOwn(s.realm?.cities||{},d.sourceCity)||!Object.hasOwn(s.realm.cities,d.destinationCity)||d.sourceCity===d.destinationCity)return '请选择两座不同的治下城市';
    if(!resources.includes(d.resource))return '请选择粮食、木材、石料、铁锭或黄金';
    if(!integer(d.targetStock)||d.targetStock<1||!integer(d.sourceReserve))return '目标库存需为 1–10 亿，源城保留量需为 0–10 亿整数';
    if(!armyValid(s,d.army))return '固定运输队需为 1–100 万名有效士兵';
    if(typeof d.enabled!=='boolean')return '补给线启用状态无效';
    const lines=s.realm.supplyLines?.lines||[];
    if(lines.some(l=>l.id!==d.id&&l.sourceCity===d.sourceCity&&l.destinationCity===d.destinationCity&&l.resource===d.resource))return '同方向、同资源已经有一条补给线';
    if(!d.id&&(lines.length>=maxLines||s.realm.supplyLines?.nextId>=maxStock))return '补给线数量已达上限';
    if(d.id&&jobs(s,d.id).length)return '运输队仍在途中，请等返城后再修改配置';
    return '';
  }
  function keyFor(s,d){return JSON.stringify([d,s.realm?.supplyLines]);}
  function plan(s,line,api){
    const result={state:'blocked',reason:'',amount:0,deficit:0,pending:0,cargo:{},quote:null};
    const stop=(state,reason)=>({...result,state,reason});
    if(!line||!resources.includes(line.resource)||!armyValid(s,line.army)||!integer(line.targetStock)||line.targetStock<1||!integer(line.sourceReserve)||typeof line.enabled!=='boolean'||!Object.hasOwn(s.realm?.cities||{},line.sourceCity)||!Object.hasOwn(s.realm.cities,line.destinationCity)||line.sourceCity===line.destinationCity)return stop('blocked','补给线配置无效');
    const active=line.id?jobs(s,line.id):[];if(active.length)return {...stop('inflight',active[0].phase==='return'?'等待运输队返城':'运输队正在送达'),job:clone(active[0])};
    if(!line.enabled)return stop('paused','补给线已暂停');
    const source=scope(api?.getCity?.(line.sourceCity)),target=scope(api?.getCity?.(line.destinationCity));
    if(!source?.res||!target?.res)return stop('blocked','来源或目的城市不存在');
    const pending=(s.realm.logistics||[]).filter(j=>j.kind==='transport'&&j.destinationCity===line.destinationCity&&j.phase==='outbound'&&!j.delivered&&!j.cancelled).reduce((v,j)=>v+(j.cargo?.[line.resource]||0),0);
    const stock=target.res[line.resource],sourceStock=source.res[line.resource],food=source.res.food;
    if(!Number.isFinite(stock)||!Number.isFinite(sourceStock)||!Number.isFinite(food)||!Number.isSafeInteger(pending))return stop('blocked','城市资源数量无效');
    result.pending=pending;result.deficit=Math.max(0,Math.floor(line.targetStock-stock-pending));
    if(!result.deficit)return stop('stocked','目的城库存与待到货物已达到目标');
    if(typeof api?.quoteFrom!=='function')return stop('blocked','运输报价暂不可用');
    const reserve=Math.max(line.sourceReserve,source.automation?.reserve?.[line.resource]||0),foodReserve=Math.max(source.automation?.reserve?.food||0,line.resource==='food'?line.sourceReserve:0),available=Math.max(0,Math.floor(sourceStock-reserve));
    const probe=api.quoteFrom(line.sourceCity,line.destinationCity,clone(line.army),{[line.resource]:1});
    if(!probe||!Number.isFinite(probe.carry)||!Number.isSafeInteger(probe.foodCost)||probe.foodCost<0)return stop('blocked','运输报价暂不可用');
    result.quote=probe;result.sourceReserve=reserve;result.foodReserve=foodReserve;
    if(food-foodReserve<probe.foodCost)return stop('blocked',`源城粮食不足，需保留 ${foodReserve} 并支付行军粮 ${probe.foodCost}`);
    if(!available)return stop('blocked','源城可供资源不足，保留量不会被动用');
    const foodCargo=line.resource==='food'?Math.max(0,Math.floor(food-foodReserve-probe.foodCost)):Number.MAX_SAFE_INTEGER;
    result.amount=Math.min(result.deficit,available,Math.max(0,Math.floor(probe.carry)),foodCargo);
    if(result.amount<1)return stop('blocked',probe.reason||'固定运输队没有可用负重');
    result.cargo={[line.resource]:result.amount};
    const q=api.quoteFrom(line.sourceCity,line.destinationCity,clone(line.army),clone(result.cargo));result.quote=q;
    if(!q)return stop('blocked','运输报价暂不可用');
    if(q.reason)return stop('blocked',q.reason);
    return {...result,state:'ready',reason:result.amount<result.deficit?'本次装载部分缺口，运输队返城后继续补给':'运输队可补足当前缺口'};
  }
  function quote(s,draft,api){if(!valid(s))return {draft:null,reason:'存档补给线配置无效',key:'',plan:null};const d=draftOf(s,draft),reason=configReason(s,d);return {draft:d,reason,key:d?keyFor(s,d):'',plan:reason?null:plan(s,{...d,enabled:true},api)};}
  function set(s,draft,key,api){
    const q=quote(s,draft,api);if(q.reason)return q.reason;if(q.key!==key)return '补给线配置已变化，请重新预览';
    const a=s.realm.supplyLines,d=clone(q.draft);if(d.id)a.lines[a.lines.findIndex(l=>l.id===d.id)]=d;else{d.id='supply_'+a.nextId++;a.lines.push(d);}return null;
  }
  function setEnabled(s,id,enabled){const l=routeOf(s,id);if(!l)return '补给线不存在';if(typeof enabled!=='boolean')return '补给线启用状态无效';l.enabled=enabled;return null;}
  function remove(s,id){const l=routeOf(s,id);if(!l)return '补给线不存在';if(jobs(s,id).length)return '请先暂停补给线，等待运输队返城后删除';s.realm.supplyLines.lines=s.realm.supplyLines.lines.filter(l=>l.id!==id);return null;}
  function pauseForRecall(s,job){const l=routeOf(s,job?.supplyLine);if(l)l.enabled=false;return !!l;}
  function list(s,api){return (s.realm?.supplyLines?.lines||[]).map(l=>({...clone(l),...plan(s,l,api)}));}
  function status(s,id,api){return list(s,api).find(l=>l.id===id)||null;}
  function run(s,api){
    if(!valid(s)||typeof api?.send!=='function')return [];
    const results=[];for(const line of s.realm.supplyLines.lines){const p=plan(s,line,api);if(p.state!=='ready'){results.push({id:line.id,...p});continue;}const error=api.send(p,line);results.push({id:line.id,...p,state:error?'blocked':'sent',reason:error||'运输队已出发'});}return results;
  }
  return {resources,maxLines,maxStock,maxArmy,init,valid,quote,set,plan,list,status,setEnabled,remove,pauseForRecall,run};
})();


// SOURCE: hero-administration.js
'use strict';
// City duties are attached to actually recruited wild heroes. These bounded
// effects never replace the governor's existing politics production bonus.
const HeroAdministration=(()=>{
  const COST=Object.freeze({wood:1000,stone:1000,iron:1000}),MAX_SEQ=1000000000;
  const definitions=Object.freeze({
    xunyu:Object.freeze({id:'xunyu',name:'荀彧',action:'transport',title:'统筹粮运',description:'任本城城守且留城时，本城新派资源运输的行军粮减少20%。',condition:'真实招降后任本城城守；不影响运送资源、部队负重、调遣、运输时间或已有在途队伍。'}),
    pangtong:Object.freeze({id:'pangtong',name:'庞统',action:'defense',title:'筹备城防',description:'任本城城守且留城时，投入木、石、铁各1000，备好一次正式守城的城门耐久增加20%。',condition:'官府4级、城墙2级；每城最多一份。演练不消耗也不增益；工事攻击、现有战斗与其他城池不改变。'})
  });
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0,copy=x=>JSON.parse(JSON.stringify(x));
  const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
  const cityId=(s,api={})=>typeof api.cityId==='string'?api.cityId:typeof api.currentCityId==='function'?api.currentCityId():s.realm?.activeCity||'capital';
  const sameCost=c=>exact(c,Object.keys(COST))&&Object.entries(COST).every(([id,n])=>c[id]===n);
  function identity(hero){const d=object(hero)&&Object.hasOwn(definitions,hero.wildLine)&&definitions[hero.wildLine];return d?{...d}:{id:'',name:'普通城守',action:'',title:'常规治理',description:'按已有内政、城守和任职规则治理城池。',condition:''};}
  function ownedHero(s,hero){
    const id=typeof hero==='string'?hero:hero?.id,g=s.customGenerals?.find(g=>g.id===id),w=s.wildGenerals,r=w?.rumors?.find(r=>r.id===id);
    if(!g||!Object.hasOwn(definitions,g.wildLine)||g.origin!=='wild'||!s.generals?.includes(id)||!w?.recruited?.includes(id)||!r||r.status!=='recruited'||r.line!==g.wildLine||r.node!==g.sourceNode)return null;
    // A caller-provided display or snapshot cannot substitute another identity.
    if(object(hero)&&hero.wildLine!==g.wildLine)return null;
    return g;
  }
  function busy(s,id,api={}){
    if(api.generalBusy?.(id))return true;
    if([...(s.expedition?[s.expedition]:[]),...(s.expeditions||[]),...Object.values(s.garrisons||{}),...(s.cityDefense?.battle?[s.cityDefense.battle]:[])].some(e=>e.general===id))return true;
    return (s.realm?.logistics||[]).some(e=>e.general===id);
  }
  function profile(s,hero,api={}){
    const g=ownedHero(s,hero),d=identity(g||hero),city=cityId(s,api);
    let reason=!g?'尚未通过画像、俘获与招降获得此名将':s.governor!==g.id?'需要任本城城守':s.realm?.heroLocations&&s.realm.heroLocations[g.id]!==city?'名将不在本城':busy(s,g.id,api)?'城守正在出征、驻守、调遣或守城':'';
    if(!d.id)reason='此将领没有专属内政职责';
    return {...d,hero:g?.id||hero?.id||'',city,active:!!g&&!reason,reason,transportFoodFactor:g&&!reason&&d.id==='xunyu'?.8:1};
  }
  function transportFactor(s,hero,kind,api={}){return kind==='transport'?profile(s,hero,api).transportFoodFactor:1;}
  function init(s){if(s.heroAdministration===undefined)s.heroAdministration={schema:1,seq:0,prepared:null};return s.heroAdministration;}
  function validDefenseSnapshot(snapshot,s,api={}){
    try{
      if(!exact(snapshot,['schema','id','hero','city','at','cost','gateFactor'])||snapshot.schema!==1||typeof snapshot.id!=='string'||!/^administration_defense_[1-9]\d*$/.test(snapshot.id)||typeof snapshot.hero!=='string'||typeof snapshot.city!=='string'||!snapshot.city.length||snapshot.city.length>100||!int(snapshot.at)||!sameCost(snapshot.cost)||snapshot.gateFactor!==1.2)return false;
      const seq=Number(snapshot.id.slice('administration_defense_'.length));if(!int(seq)||seq<1||seq>MAX_SEQ)return false;
      if(s){const g=api.historical?s.customGenerals?.find(g=>g.id===snapshot.hero&&g.origin==='wild'):ownedHero(s,snapshot.hero);if(!g||g.wildLine!=='pangtong'||snapshot.city!==cityId(s,api)||!object(s.heroAdministration)||!int(s.heroAdministration.seq)||seq>s.heroAdministration.seq)return false;}
      return true;
    }catch{return false;}
  }
  function valid(s,api={}){
    try{
      const d=s.heroAdministration,records=[...(s.cityDefense?.battle&&!s.cityDefense.battle.drill?[s.cityDefense.battle]:[]),...(s.cityDefense?.reports||[]).filter(r=>!r.drill)].map(r=>r.administrationDefense).filter(x=>x!==undefined);
      if(d===undefined)return records.length===0;
      if(!exact(d,['schema','seq','prepared'])||d.schema!==1||!int(d.seq)||d.seq>MAX_SEQ||!(d.prepared===null||validDefenseSnapshot(d.prepared,s,api)&&d.prepared.id==='administration_defense_'+d.seq))return false;
      const used=new Set();for(const snapshot of records){if(!validDefenseSnapshot(snapshot,s,{...api,historical:true})||used.has(snapshot.id)||d.prepared?.id===snapshot.id)return false;used.add(snapshot.id);}
      return true;
    }catch{return false;}
  }
  function prepareQuote(s,hero,selectedCity=cityId(s),now=Date.now(),api={}){
    const p=profile(s,hero,api),d=s.heroAdministration||{schema:1,seq:0,prepared:null},city=cityId(s,api);
    let reason=p.id!=='pangtong'?'筹备城防需要真实招降的庞统':p.reason;
    if(!reason&&selectedCity!==city)reason='请在要备防的城池中操作';
    if(!reason&&!valid(s,api))reason='备防记录无效，请重新读取存档';
    if(!reason&&(s.buildings?.hall||0)<4)reason='需要官府4级';
    if(!reason&&(s.buildings?.wall||0)<2)reason='需要城墙2级';
    if(!reason&&s.cityDefense?.battle)reason='请先结束当前守城战或演练';
    if(!reason&&d.prepared)reason='本城已有一份备防，不可叠加';
    if(!reason&&d.seq>=MAX_SEQ)reason='本城备防记录已达上限';
    if(!reason&&!int(now))reason='筹备时间无效';
    if(!reason)for(const [id,n]of Object.entries(COST))if(!Number.isFinite(s.res?.[id])||s.res[id]<n||s.res[id]>Number.MAX_SAFE_INTEGER){reason=({wood:'木材',stone:'石料',iron:'铁锭'})[id]+'不足，需要'+n;break;}
    return {ok:!reason,reason,hero:p.hero,city,cost:{...COST},gateFactor:1.2,requirements:{hall:4,wall:2},description:definitions.pangtong.description,condition:definitions.pangtong.condition,key:JSON.stringify([city,p.hero,p.id,s.governor,d.seq,d.prepared?.id||'',s.buildings?.hall||0,s.buildings?.wall||0,p.active,!!s.cityDefense?.battle])};
  }
  function prepare(s,hero,selectedCity,now,key,api={}){
    const q=prepareQuote(s,hero,selectedCity,now,api);
    if(!q.ok)return {ok:false,reason:q.reason};if(typeof key!=='string'||q.key!==key)return {ok:false,reason:'筹备条件已变化，请重新预览'};
    const d=init(s);for(const [id,n]of Object.entries(COST))s.res[id]-=n;
    d.seq++;d.prepared={schema:1,id:'administration_defense_'+d.seq,hero:q.hero,city:q.city,at:now,cost:{...COST},gateFactor:1.2};
    return {ok:true,reason:'',prepared:copy(d.prepared)};
  }
  function defensePrepared(s,hero,selectedCity=cityId(s),api={}){
    const snapshot=s.heroAdministration?.prepared,p=profile(s,hero,api),city=cityId(s,api);
    const reason=!snapshot?'本城尚未筹备城防':!valid(s,api)?'备防记录无效':selectedCity!==city||snapshot.city!==city?'备防属于另一座城池':p.id!=='pangtong'||!p.active?p.reason||'需要庞统任本城城守':snapshot.hero!==p.hero?'需要原筹备城守庞统留城任职':s.cityDefense?.battle?'当前守城已经开始，备防只用于下次正式守城':'';
    return {ready:!reason,reason,gateFactor:reason?1:1.2,snapshot:snapshot?copy(snapshot):null};
  }
  function consumeDefense(s,hero,selectedCity=cityId(s),drill=false,api={}){
    if(drill!==false)return null;
    const ready=defensePrepared(s,hero,selectedCity,api);if(!ready.ready)return null;
    const snapshot=ready.snapshot;s.heroAdministration.prepared=null;return snapshot;
  }
  return {COST,definitions,identity,profile,transportFactor,init,valid,prepareQuote,prepare,defensePrepared,consumeDefense,validDefenseSnapshot};
})();


// SOURCE: battle-review.js
'use strict';
const BattleReview=(()=>{
// Read-only explanations of canonical receipts and recorded round events.
// This module does not resolve combat, grant rewards, or change a save.
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const count = value => Number.isSafeInteger(value) && value >= 0;
const damage = value => Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const METRICS = ['shieldArrowDamage', 'shieldArrowHits', 'shieldOtherRangedDamage', 'shieldOtherRangedHits',
  'spearCavalryDamage', 'spearCavalryHits', 'cavalrySpearDamage', 'cavalrySpearHits',
  'cavalryArcherDamage', 'cavalryArcherHits', 'archerDamage', 'archerHits',
  'gateDamage', 'gateHits', 'machineGateDamage', 'machineGateHits', 'towerDamage', 'towerHits'];
const number = value => new Intl.NumberFormat('zh-CN', {maximumFractionDigits: 2}).format(value);

/** Plain JSON data owned by a practice session, never by canonical game state. */
function createRoundEvidence() {
  return {version: 1, rounds: [], incompleteRounds: [],
    totals: Object.fromEntries(METRICS.map(key => [key, 0])),
    gate: {maxHp: null, lastHp: null, brokenRound: null}};
}

/** Accumulate a real resolved round once. Recoil duplicates its strike and is excluded.
 * Pass {battle} after the round to record an observed gate transition. */
function collectRoundEvidence(summary, accumulator, {battle = null} = {}) {
  if (!object(accumulator) || accumulator.version !== 1 || !Array.isArray(accumulator.rounds) ||
      !Array.isArray(accumulator.incompleteRounds) || !object(accumulator.totals) || !object(accumulator.gate))
    throw new TypeError('Use createRoundEvidence() for the evidence accumulator');
  if (!object(summary) || !count(summary.round) || summary.round < 1 || summary.round > 30 || !Array.isArray(summary.events))
    return accumulator;
  if (accumulator.rounds.includes(summary.round)) return accumulator;
  const totals = accumulator.totals;
  let incomplete = false;
  const add = (metric, amount) => {
    const next = totals[metric] + amount;
    if (damage(totals[metric]) && damage(next)) totals[metric] = next;
    else incomplete = true;
  };
  for (const event of summary.events) {
    if (!object(event)) { incomplete = true; continue; }
    if (event.type === 'move' || event.type === 'recoil') continue;
    if (!['strike', 'tower', 'gate'].includes(event.type) || !['player', 'enemy'].includes(event.side) ||
        typeof event.unit !== 'string' || typeof event.target !== 'string' || !damage(event.damage) ||
        !count(event.killed) || typeof event.ranged !== 'boolean' || typeof event.counter !== 'boolean') {
      incomplete = true; continue;
    }
    if (event.type === 'gate') {
      if (event.side !== 'player' || event.target !== 'gate') { incomplete = true; continue; }
      add('gateDamage', event.damage); add('gateHits', 1);
      if (['ram', 'catapult'].includes(event.unit)) {
        add('machineGateDamage', event.damage); add('machineGateHits', 1);
      }
      continue;
    }
    if (event.type === 'tower') {
      if (event.side === 'enemy' && event.unit === 'tower') {
        add('towerDamage', event.damage); add('towerHits', 1);
      } else incomplete = true;
      continue;
    }
    if (event.side === 'enemy' && event.target === 'shield' && event.unit === 'archer') {
      add('shieldArrowDamage', event.damage); add('shieldArrowHits', 1);
    } else if (event.side === 'enemy' && event.target === 'shield' && event.ranged) {
      add('shieldOtherRangedDamage', event.damage); add('shieldOtherRangedHits', 1);
    }
    if (event.side === 'player' && event.unit === 'spear' && event.target === 'cavalry') {
      add('spearCavalryDamage', event.damage); add('spearCavalryHits', 1);
    }
    if (event.side === 'enemy' && event.unit === 'cavalry' && event.target === 'spear') {
      add('cavalrySpearDamage', event.damage); add('cavalrySpearHits', 1);
    }
    if (event.side === 'enemy' && event.unit === 'cavalry' && event.target === 'archer') {
      add('cavalryArcherDamage', event.damage); add('cavalryArcherHits', 1);
    }
    if (event.side === 'player' && event.unit === 'archer') {
      add('archerDamage', event.damage); add('archerHits', 1);
    }
  }
  accumulator.rounds.push(summary.round);
  accumulator.rounds.sort((a, b) => a - b);
  if (incomplete) accumulator.incompleteRounds.push(summary.round);
  const gate = object(battle?.gate) ? battle.gate : null;
  if (battle?.round === summary.round && gate && damage(gate.hp) && damage(gate.maxHp) && gate.maxHp > 0) {
    accumulator.gate.maxHp = gate.maxHp;
    accumulator.gate.lastHp = gate.hp;
    // Only a complete prefix of actual rounds can identify the break round.
    // An already-broken gate first seen after a gap is not a measured duration.
    if (gate.hp === 0 && accumulator.gate.brokenRound === null && !incomplete &&
        accumulator.incompleteRounds.length === 0 && accumulator.rounds.length === summary.round &&
        accumulator.rounds.every((round, index) => round === index + 1) && totals.gateDamage >= gate.maxHp)
      accumulator.gate.brokenRound = summary.round;
  }
  return accumulator;
}

const armyCount = (army, id) => object(army) && (!Object.hasOwn(army, id) || count(army[id])) ? army[id] || 0 : null;
function machineReceipt(report, battle, practice) {
  if (['lost', 'wounded', 'back'].every(key => object(report[key]))) {
    const values = ['ram', 'catapult'].map(id => ({id, lost: armyCount(report.lost, id),
      wounded: armyCount(report.wounded, id), alive: armyCount(report.back, id)}));
    if (values.some(row => Object.values(row).some(value => value === null))) return null;
    return {deployed: values.reduce((sum, row) => sum + row.lost + row.wounded + row.alive, 0),
      lost: values.reduce((sum, row) => sum + row.lost, 0), wounded: values.reduce((sum, row) => sum + row.wounded, 0),
      alive: values.reduce((sum, row) => sum + row.alive, 0), practice: !!practice};
  }
  if (!practice || !Array.isArray(battle?.player)) return null;
  const rows = battle.player.filter(row => object(row) && ['ram', 'catapult'].includes(row.id));
  if (!rows.length || rows.some(row => !count(row.initial) || !damage(row.hp) || !damage(row.stats?.hp) || row.stats.hp <= 0)) return null;
  const deployed = rows.reduce((sum, row) => sum + row.initial, 0);
  const alive = rows.reduce((sum, row) => sum + Math.ceil(row.hp / row.stats.hp), 0);
  return alive <= deployed ? {deployed, alive, practice: true} : null;
}

/** The report is a receipt, not a reconstructed simulation. Evidence is optional.
 * Formal DTOs omit evidence. Only a practice service supplies an accumulator. */
function battleReview(report = {}, {battle = null, evidence = null, practice = false} = {}) {
  report = object(report) ? report : {};
  battle = object(battle) ? battle : null;
  const result = {title: '本战关键原因', scope: '战报结算凭据；整场交锋数据未记录', findings: [], actions: []};
  const finding = (label, text, kind = 'evidence') => result.findings.push({label, text, kind});
  const rounds = count(report.round) ? report.round : count(battle?.round) ? battle.round : null;
  const failure = object(report.failure) ? report.failure : null;
  const failureNames = {retreat: '主动撤军后结束', army: '我军已无可战部队', gate: '城防仍未攻破',
    enemy: '尚有守军存活', gate_and_enemy: '城防未破且仍有守军存活'};
  if (failure) {
    finding('结算原因', failureNames[failure.reason] || '战报没有可识别的失败原因', 'result');
    if (count(failure.gateHp) && failure.gateHp > 0)
      finding('未破城防', `结束时城防耐久剩余 ${number(failure.gateHp)}。`);
    if (count(failure.enemyRemaining) && failure.enemyRemaining > 0)
      finding('守军仍在', `结束时剩余守军 ${number(failure.enemyRemaining)} 人。`);
    if (failure.outOfRange === true)
      finding('射程空等', '结束时仍有我军坚守队伍，其射程内没有存活敌军。', 'warning');
  } else if (typeof report.won === 'boolean') {
    finding('结算结果', (report.won ? '本战获胜' : '本战未获胜') + (rounds === null ? '。' : `，共 ${rounds} 回合。`), 'result');
  }
  const machines = machineReceipt(report, battle, practice);
  if (machines?.deployed > 0) {
    const text = `冲车与投石车出征 ${number(machines.deployed)} 架，战场幸存 ${number(machines.alive)} 架`;
    const simulated = count(machines.lost) && count(machines.wounded) ?
      `演练模拟损失 ${number(machines.lost)} 架、模拟伤兵 ${number(machines.wounded)} 架` :
      `演练中离场 ${number(machines.deployed - machines.alive)} 架，尚无正式伤兵判定`;
    finding('器械存活', machines.practice ? text + `；${simulated}。不改变正式军队或伤兵。` :
      text + `；永久损失 ${number(machines.lost)} 架，伤兵 ${number(machines.wounded)} 架。`);
  }
  const challenge = object(report.warOrder?.challenge) ? report.warOrder.challenge : null;
  if (challenge && count(challenge.machineGateAttacks) &&
      (challenge.machineGateAttacks > 0 || count(challenge.machines) && challenge.machines > 0)) {
    finding('挑战凭据', `器械实际攻击门墙 ${number(challenge.machineGateAttacks)} 次；战术条件` +
      (challenge.met === true ? '已达成。' : '未达成。') + '这是战报中的挑战判定，不能归因于单一指令。');
  } else if (count(battle?.machineGateAttacks) && battle.machineGateAttacks > 0) {
    finding('破门参与', `本场器械实际攻击门墙 ${number(battle.machineGateAttacks)} 次。`);
  }

  let measured = null;
  let full = false;
  let prefix = false;
  if (practice && object(evidence) && evidence.version === 1 && Array.isArray(evidence.rounds) &&
      Array.isArray(evidence.incompleteRounds) && object(evidence.totals) &&
      METRICS.every(key => damage(evidence.totals[key]))) {
    measured = evidence;
    prefix = rounds !== null && rounds > 0 && evidence.incompleteRounds.length === 0 &&
      evidence.rounds.length === rounds && evidence.rounds.every((round, index) => round === index + 1);
    full = prefix && (battle?.finished === true || !battle && typeof report.won === 'boolean');
    result.scope = full ? `演练第 1–${rounds} 回合的完整实际事件；不含反事实估算` :
      prefix ? `演练第 1–${rounds} 回合的实际事件（战斗仍在进行）；不含反事实估算` :
      `演练已记录 ${evidence.rounds.length} 轮${evidence.incompleteRounds.length ? '（部分事件不完整）' : ''}；不能当作整场总计`;
  } else if (!report.shared && battle && object(battle.currentRoundSummary) &&
      battle.currentRoundSummary.round === battle.round && battle.round > 0) {
    measured = collectRoundEvidence(battle.currentRoundSummary, createRoundEvidence(), {battle});
    result.scope = `战报结算凭据＋第 ${battle.round} 回合实际记录（仅末轮）；整场交锋数据未记录`;
  }
  if (measured && measured.rounds.length) {
    const t = measured.totals;
    const scope = full ? '整场' : prefix ? '截至本回合' : practice ? '已记录范围' : '末回合';
    finding('盾阵承箭', t.shieldArrowHits ? `${scope}敌弓命中我军刀盾 ${number(t.shieldArrowHits)} 次，实际伤害 ${number(t.shieldArrowDamage)}。这是承受的伤害，不是免去的伤害。` :
      `${scope}没有记录到敌弓命中我军刀盾，不能据此声称盾阵承担了箭矢。`);
    if (t.shieldOtherRangedHits)
      finding('其他远程', `${scope}刀盾承受其他远程实际伤害 ${number(t.shieldOtherRangedDamage)}，${number(t.shieldOtherRangedHits)} 次命中。`);
    finding('枪骑交锋', `${scope}我军长枪命中敌轻骑 ${number(t.spearCavalryHits)} 次、伤害 ${number(t.spearCavalryDamage)}；敌轻骑命中我军枪阵 ${number(t.cavalrySpearHits)} 次、伤害 ${number(t.cavalrySpearDamage)}（均含反击）。这不是自动拦截次数。`);
    if (t.cavalryArcherHits)
      finding('弓阵遇骑', `${scope}敌轻骑命中我军弓队 ${number(t.cavalryArcherHits)} 次，实际伤害 ${number(t.cavalryArcherDamage)}。`, 'warning');
    if (t.archerHits)
      finding('弓队输出', `${scope}我军弓队命中 ${number(t.archerHits)} 次，实际输出 ${number(t.archerDamage)}。`);
    if (t.gateHits)
      finding('门墙受击', `${scope}门墙实际承受伤害 ${number(t.gateDamage)}；其中器械攻击 ${number(t.machineGateHits)} 次、伤害 ${number(t.machineGateDamage)}。`);
    if (t.towerHits)
      finding('箭楼威胁', `${scope}箭楼命中我军 ${number(t.towerHits)} 次，实际伤害 ${number(t.towerDamage)}。`);
    if (prefix && count(measured.gate?.brokenRound) && measured.gate.brokenRound > 0)
      finding('破门耗时', `完整记录确认城防耐久在第 ${measured.gate.brokenRound} 回合归零。`);
    else if (battle?.gate && battle.gate.hp === 0)
      finding('破门范围', '已观察到城防耐久归零；现有证据不足以确认精确破门回合。', 'gap');
  } else {
    finding('记录边界', practice && battle?.round === 0 ?
      '尚未结算演练回合；行动后显示实际交锋证据。' :
      '未保存整场逐回合攻击事件：盾阵受箭伤害、枪骑交锋次数与精确破门回合均不能补算。', 'gap');
  }
  finding('盾与箭 · 规则', '弓箭兵攻击刀盾兵时伤害系数为 0.5；床弩与投石不享受这一专属减伤。坚守本身没有额外减伤。', 'rule');
  finding('枪与骑 · 规则', '长枪兵攻击轻骑兵时伤害系数为 1.6；不包含重骑。枪兵是否先接敌，要看实际站位和攻击目标。', 'rule');
  finding('门墙 · 规则', '器械进入射程并实际攻击才参与破门；破门后城防掩护解除、箭楼停止射击。', 'rule');
  result.actions = [
    {label: '盾护推进：刀盾向前，弓队保持后排；观察敌弓实际命中谁。'},
    {label: '枪护弓：枪兵推进、弓兵坚守，形成前后位置；重骑需单独评估。'},
    {label: '护械破门：让冲车或投石进入射程，关注门墙耐久、箭楼与器械存活。'},
  ];
  return result;
}

return {createRoundEvidence,collectRoundEvidence,battleReview};})();


// SOURCE: wild-fields.js
'use strict';
const WildFields=(()=>{

const WILD_INTERVAL_MS = 30 * 60 * 1000;
const TYPES = ['plain', 'grass', 'forest', 'hill', 'mountain', 'lake', 'swamp'];
const wildId = /^wild_(\d{1,2})_(\d{1,2})$/;
const integer = n => Number.isSafeInteger(n) && n >= 0;
const object = n => !!n && typeof n === 'object' && !Array.isArray(n);
const uint = n => integer(n) && n <= 0xffffffff;
const validId = id => {
  const m = wildId.exec(id);
  return !!m && Number(m[1]) < 64 && Number(m[2]) < 64 && id === `wild_${Number(m[1])}_${Number(m[2])}`;
};
const mix = (...values) => {
  let n = 2166136261;
  for (const value of values) {
    n = Math.imul(n ^ (value >>> 0), 16777619);
    n = Math.imul(n ^ (n >>> 16), 2246822507);
  }
  return (n ^ (n >>> 13)) >>> 0;
};
const cache = new Map();
function shuffle(values, seed) {
  const result = [...values];
  let n = seed;
  for (let i = result.length - 1; i > 0; i--) {
    n = mix(n, i);
    const j = n % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function block(meta, x, y) {
  const bx = Math.floor(x / 8), by = Math.floor(y / 8);
  const key = `${meta.seed}:${meta.generation}:${bx}:${by}`;
  if (!cache.has(key)) {
    if (cache.size >= 128) cache.clear();
    const seed = mix(meta.seed, meta.generation, bx, by);
    cache.set(key, {
      types: shuffle(Array.from({length: 64}, (_, i) => TYPES[(i + seed % 7) % 7]), mix(seed, 1)),
      levels: shuffle(Array.from({length: 64}, (_, i) => 1 + (i + seed % 10) % 10), mix(seed, 2)),
    });
  }
  return cache.get(key);
}

function validWildFields(state) {
  if (!object(state) || state.wildRefresh === undefined) return object(state);
  const m = state.wildRefresh;
  return object(m) && Object.keys(m).length === 5 && m.version === 1 && uint(m.seed) &&
    integer(m.generation) && integer(m.at) && m.at === m.generation * WILD_INTERVAL_MS &&
    object(m.pins) && Object.keys(m.pins).length <= 4096 && Object.entries(m.pins).every(([id, p]) =>
      validId(id) && object(p) && Object.keys(p).length === 4 && TYPES.includes(p.type) &&
      integer(p.level) && p.level <= 10 && uint(p.seed) && typeof p.legacy === 'boolean');
}

/** A balanced 8×8 neighbourhood; shuffle changes placements, not quotas. */
function resolveWild(state, x, y, now) {
  const m = state?.wildRefresh;
  if (!m || state.onlineRealm) return null;
  const id = `wild_${x}_${y}`, p = m.pins[id];
  const row = p || (() => {
    const b = block(m, x, y), index = y % 8 * 8 + x % 8;
    return {type: b.types[index], level: b.levels[index], seed: mix(m.seed, m.generation, x, y), legacy: false};
  })();
  const claim = state.landClaims?.[id];
  const level = claim && state.conquered?.[id] ? Math.max(0, claim.level - Math.floor((now - claim.at) / 86400000)) : row.level;
  return {...row, level};
}

const wildWeight = (seed, index) => mix(seed, index + 17);
function wildKey(state, x, y, now) {
  const r = resolveWild(state, x, y, now);
  return r ? `${r.type}:${r.level}:${r.seed}:${r.legacy ? 1 : 0}` : '';
}

function scopes(state) {
  return [state, ...Object.entries(state.realm?.cities || {}).filter(([id]) => id !== state.realm.activeCity).map(([, city]) => city.data)];
}
function heldTargets(state) {
  const held = new Set();
  const add = id => { if (typeof id === 'string' && validId(id)) held.add(id); };
  for (const [id, owned] of Object.entries(state.conquered || {})) if (owned) add(id);
  for (const id of Object.keys(state.realm?.wildOwners || {})) add(id);
  for (const city of Object.values(state.realm?.cities || {})) add(city.node);
  for (const s of scopes(state)) {
    for (const id of Object.keys(s.garrisons || {})) add(id);
    for (const id of Object.keys(s.gatherings || {})) add(id);
    add(s.expedition?.node);
    for (const e of s.expeditions || []) add(e.node);
    for (const e of s.scoutQueue || []) add(e.node);
    if (s.battle && !s.battle.finished) add(s.battle.node);
  }
  return held;
}
function clearIntel(state, held, released = null) {
  const shouldClear = id => validId(id) && !held.has(id) && (!released || released.has(id));
  for (const s of scopes(state)) {
    for (const id of Object.keys(s.scoutIntel || {})) if (shouldClear(id)) delete s.scoutIntel[id];
  }
  for (const id of Object.keys(state.scouted || {})) if (shouldClear(id)) delete state.scouted[id];
}

/** Freeze active targets before changing epoch; canonical claims keep their daily decay. */
function syncWildFields(game, now) {
  const s = game.state; if (!s || s.onlineRealm || game.authorityActive() || (typeof GAME_SERVER_RUNTIME!=='undefined' && GAME_SERVER_RUNTIME && !s.wildRefresh)) return;
  const held = heldTargets(s), first = !s.wildRefresh;
  if (!validWildFields(s)) throw new Error('Invalid wild-refresh state');
  if (first) s.wildRefresh = {version: 1, seed: Math.floor(Math.random()*0x100000000),
    generation: Math.floor(now / WILD_INTERVAL_MS), at: Math.floor(now / WILD_INTERVAL_MS) * WILD_INTERVAL_MS, pins: {}};
  const m = s.wildRefresh;
  for (const id of held) if (!m.pins[id]) {
    const [, xs, ys] = wildId.exec(id), x = Number(xs), y = Number(ys);
    if (first) {
      const n = game.legacyWildTile(x, y);
      m.pins[id] = {type: n.type, level: n.level, seed: 0, legacy: true};
    } else m.pins[id] = resolveWild(s, x, y, now);
  }
  const released = new Set();
  for (const id of Object.keys(m.pins)) if (!held.has(id)) {
    const old = m.pins[id], [, xs, ys] = wildId.exec(id);
    delete m.pins[id];
    const fresh = resolveWild(s, Number(xs), Number(ys), now);
    if (['type', 'level', 'seed', 'legacy'].some(key => old[key] !== fresh[key])) released.add(id);
  }
  const next = Math.max(m.generation, Math.floor(now / WILD_INTERVAL_MS));
  if (first || next !== m.generation) clearIntel(s, held);
  else if (released.size) clearIntel(s, held, released);
  m.generation = next;
  m.at = next * WILD_INTERVAL_MS;
  if (!validWildFields(s)) throw new Error('Invalid wild-refresh result');
}

function wildRefreshView(state) {
  const m = state.wildRefresh;
  return m ? {enabled: true, generation: m.generation, intervalSeconds: WILD_INTERVAL_MS / 1000,
    refreshedAt: m.at, nextAt: m.at + WILD_INTERVAL_MS, protected: Object.keys(m.pins).length,
    description: '每30分钟随机刷新空闲野地的类型、等级和守军；每个8×8区域均衡分布。城池、已占领、采集及行军目标保留。'} : {enabled: false};
}

return {resolve:resolveWild,weight:wildWeight,key:wildKey,sync:syncWildFields,valid:validWildFields,view:wildRefreshView};
})();


// SOURCE: web-edition.js
'use strict';
// Faithful browser adaptation of Godot's private progression modules.
// Shared-world rewards and map state continue to belong to online/.
const WebEdition=(()=>{
  const copy=value=>JSON.parse(JSON.stringify(value));
  class GameError extends Error{constructor(code,message){super(message);this.code=code;}}
  const validateInput=input=>{if(!input||typeof input.type!=='string'||!Array.isArray(input.args)||input.args.length>8)throw new GameError('BAD_INPUT','操作参数无效');};
const CONQUEST_BUNDLES = Object.freeze({supply_choice: '百工调拨令', supply_rations: '行军粮秣包',
  supply_recovery: '返城整备包', supply_siege: '攻城筹备包'});
const conquestGems = (kind, level) => kind === 'city' ? 20 + level * 5 : 3 + level * 2;

/** Provenance for earned bundles lives in the independently validated conquest ledger. */
function earnedConquestBundles(state, id) {
  return Object.values(state.conquestSupply?.records || {}).filter(row => row?.status === 'rewarded' &&
    row.drop?.kind === 'bundle' && row.drop.id === id).length;
}

const GrowthSupport=(()=>{

const OFFER_ID = 'growth_coral';
const COST = 80;
const LIMIT = 5;
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
// Optional prototype supply prices. Promotion requirements remain canonical;
// these fixed copper prices are clearly marked as this game's trial design.
const PREPARATION_PRICES = Object.freeze({pearl: 40, coral: 80, glass: 120, amber: 160,
  agate: 200, crystal: 240, jadeite: 280, jade: 320, nightPearl: 400});
let catalogue = null;

function preparationCatalogue() {
  if (catalogue) return catalogue;
  const rows = new Map();
  for(const kind of ['office','noble']) for(const row of kind==='office'?HeritageData.offices:HeritageData.nobles){
    const rank=row.id;
    for(const [jewel,limit] of Object.entries(row.promotion?.jewels||{})){
      if(!Object.hasOwn(PREPARATION_PRICES,jewel)||kind==='noble'&&rank===1&&jewel==='coral')continue;
      const id=`growth_prepare_${kind}_${rank}_${jewel}`;
      rows.set(id,{id,kind,rank,jewel,limit,stage:row.name,cost:PREPARATION_PRICES[jewel]});
    }
  }
  catalogue = rows;
  return catalogue;
}

const isGrowthSupportOffer = id => typeof id === 'string' && (id === OFFER_ID || id.startsWith('growth_prepare_'));

/** Optional save-wide extension; old canonical saves do not need migration. */
function validGrowthSupport(snapshot) {
  if (!object(snapshot)) return false;
  if (!Object.hasOwn(snapshot, 'growthSupport')) return true;
  const record = snapshot.growthSupport;
  if (!object(record) || !Number.isSafeInteger(record.coralExchanged) || record.coralExchanged < 0 || record.coralExchanged > LIMIT) return false;
  if (record.version === 1) return Object.keys(record).length === 2 && Object.hasOwn(record, 'version') && Object.hasOwn(record, 'coralExchanged');
  if (record.version !== 2 || Object.keys(record).length !== 3 || !Object.hasOwn(record, 'version') ||
    !Object.hasOwn(record, 'coralExchanged') || !Object.hasOwn(record, 'preparation') || !object(record.preparation)) return false;
  const entries = Object.entries(record.preparation), rules = preparationCatalogue();
  return entries.length <= rules.size && entries.every(([id, count]) => rules.has(id) &&
    Number.isSafeInteger(count) && count >= 0 && count <= rules.get(id).limit &&
    rules.get(id).rank <= (snapshot.honors?.[rules.get(id).kind] ?? -2) + 1);
}

/** Only the two current next-promotion stages are quoted. Future offers are
 * never purchasable just by inventing their IDs. A rank's quota never resets. */
function growthPreparationQuotes(runtime, {shared = false} = {}) {
  if (shared) return [];
  const {Game: game, HeritageSystem: heritage, Progression: progression} = runtime, state = game.state;
  if (!validGrowthSupport(state)) return [];
  const rows = [];
  for (const kind of ['office', 'noble']) {
    const promotion = heritage.promotionQuote(state, kind);
    if (!promotion?.next) continue;
    for (const [jewel, required] of Object.entries(promotion.rule.jewels)) {
      const id = `growth_prepare_${kind}_${promotion.next.id}_${jewel}`, rule = preparationCatalogue().get(id);
      if (!rule) continue;
      const claimed = state.growthSupport?.preparation?.[id] || 0, owned = state.jewels[jewel], remaining = rule.limit - claimed;
      let reason = state.conquered?.camp !== true ? '先占领黄巾营寨，开放晋升筹备' :
        !Number.isSafeInteger(state.copper) || state.copper < 0 || !Number.isSafeInteger(owned) || owned < 0 ? '铜钱或珍宝记录无效' :
        owned >= required ? '本次晋升所需珍宝已备齐' : remaining <= 0 ? '本次晋升的固定筹备份额已用完' :
        state.copper < rule.cost ? `铜钱不足：需要 ${rule.cost}` : '';
      if (owned >= Number.MAX_SAFE_INTEGER) reason = '珍宝数量达到上限';
      rows.push({...rule, name: `${rule.stage}筹备 · ${progression.jewels[jewel].name} ×1`,
        claimed, remaining, period: 'rank', owned, required, missing: Math.max(0, required - owned), reason,
        trial: true, command: {type: 'exchangeCopper', args: [id]}});
    }
  }
  return rows;
}

/** Deterministic, read-only offer. Never initializes a counter or resets daily. */
function growthSupportQuote(runtime, {shared = false} = {}) {
  const state = runtime.Game.state;
  const valid = validGrowthSupport(state);
  const claimed = valid ? state.growthSupport?.coralExchanged ?? 0 : null;
  let reason = '';
  if (shared) reason = '共享模式不开放县城筹备兑换，请切换本机进度';
  else if (!valid) reason = '县城筹备兑换记录无效';
  else if (state.conquered?.camp !== true) reason = '先占领黄巾营寨，开放县城筹备兑换';
  else if (claimed >= LIMIT) reason = '本存档珊瑚筹备兑换限额已用完（5 枚）';
  else if (!Number.isSafeInteger(state.copper) || state.copper < 0 ||
    !Number.isSafeInteger(state.jewels?.coral) || state.jewels.coral < 0) reason = '铜钱或珊瑚记录无效';
  else if (state.jewels.coral >= Number.MAX_SAFE_INTEGER) reason = '珊瑚数量达到数值上限';
  else if (state.copper < COST) reason = '铜钱不足：需要 80';
  return {id: OFFER_ID, name: '县城筹备 · 珊瑚 ×1', cost: COST, claimed,
    remaining: valid ? LIMIT - claimed : 0, limit: LIMIT, period: 'save', reason,
    command: {type: 'exchangeCopper', args: [OFFER_ID]}};
}

/** Executes only on the private bridge's disposable canonical runtime/CAS candidate. */
function executeGrowthSupport(runtime, input, now, {shared = false} = {}) {
  validateInput(input);
  if (input.type !== 'exchangeCopper' || input.args.length !== 1 || !isGrowthSupportOffer(input.args[0])) {
    throw new GameError('COMMAND_NOT_ALLOWED', '晋升筹备操作参数无效');
  }
  if (shared) throw new GameError('COMMAND_NOT_ALLOWED', '共享模式不开放阶段筹备兑换');
  if (!Number.isSafeInteger(now) || now < 0) throw new GameError('BAD_TIME', '结算时间无效');
  const game = runtime.Game;
  if (!validGrowthSupport(game.state) || !game.validSave(copy(game.state))) {
    throw new GameError('BAD_SAVE', '晋升筹备兑换无法通过存档校验');
  }
  game.tick(now, true);
  const offer = input.args[0] === OFFER_ID ? growthSupportQuote(runtime) :
    growthPreparationQuotes(runtime).find(row => row.id === input.args[0]);
  if (!offer) throw new GameError('GAME_RULE', '这项筹备不属于当前晋升阶段，请刷新后选择');
  if (offer.reason) throw new GameError('GAME_RULE', offer.reason);
  game.state.copper -= offer.cost;
  const jewel = offer.jewel || 'coral';
  game.state.jewels[jewel] += 1;
  const claimed = offer.claimed + 1;
  // CitySystem's field list excludes this extension, so the single top-level
  // record remains shared by every owned city and survives canonical migration.
  const old = game.state.growthSupport;
  if (offer.id === OFFER_ID) game.state.growthSupport = old?.version === 2 ?
    {...old, coralExchanged: claimed} : {version: 1, coralExchanged: claimed};
  else game.state.growthSupport = {version: 2, coralExchanged: old?.coralExchanged || 0,
    preparation: {...(old?.preparation || {}), [offer.id]: claimed}};
  if (game.save() === false) throw new GameError('SAVE_FAILED', '晋升筹备兑换保存失败', 500);
  if (!validGrowthSupport(game.state) || !game.validSave(game.state)) {
    throw new GameError('INVALID_RESULT', '晋升筹备兑换产生无效状态', 500);
  }
  return {state: copy(game.state), result: {id: offer.id, jewel, count: 1,
    copperSpent: offer.cost, claimed, remaining: offer.limit - claimed}, runtime};
}

return {validGrowthSupport,growthPreparationQuotes,growthSupportQuote,executeGrowthSupport};})();
const SupplyWorkshop=(()=>{

// Optional prototype items. Native item IDs, resource caps and queues stay in Game.
const offers = [
  {id: 'supply_choice', name: '百工调拨令', price: 22, limit: 10,
    description: '开包时选择建设、研究或练兵，固定获得对应15分钟加速 ×4。按当前需要调拨，合计1小时；不直接完成队列。',
    choices: ['build', 'research', 'train'].map(kind => ({id: kind,
      name: {build: '建设加速', research: '研究加速', train: '练兵加速'}[kind], items: {[`speed_${kind}_15m`]: 4}}))},
  {id: 'supply_rations', name: '行军粮秣包', price: 12, limit: 10,
    description: '固定粮食 +10000。用于行军、募兵或伤兵治疗；资源装不下时保留包裹。', resources: {food: 10000}},
  {id: 'supply_recovery', name: '返城整备包', price: 55, limit: 5,
    description: '固定获得练兵1小时加速 ×2、典民令 ×1，粮食 +5000、黄金 +2000。人口与练兵道具需另行使用，不直接补满部队。',
    items: {speed_train_1h: 2, population: 1}, resources: {food: 5000, gold: 2000}},
  {id: 'supply_siege', name: '攻城筹备包', price: 90, limit: 5,
    description: '固定获得建设1小时加速 ×2、练兵1小时加速 ×2，石料 +10000、铁锭 +5000。帮助准备器械，仍需满足原募兵条件。',
    items: {speed_build_1h: 2, speed_train_1h: 2}, resources: {stone: 10000, iron: 5000}},
];
const ids = new Map(offers.map(row => [row.id, row]));
const commands = new Set(['supplies.buy', 'supplies.open', 'supplies.claimStarter']);
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const int = value => Number.isSafeInteger(value) && value >= 0;
const empty = () => ({version: 1, stock: {}, purchases: {}, starterClaimed: false});
const starterItems = {speed_build_1h: 4, speed_research_1h: 2, speed_train_1h: 1};
const isSupplyCommand = type => commands.has(type);

function validSupplyWorkshop(state) {
  if (!object(state)) return false;
  if (!Object.hasOwn(state, 'supplyWorkshop')) return true;
  const r = state.supplyWorkshop;
  return object(r) && Object.keys(r).length === 4 && r.version === 1 && typeof r.starterClaimed === 'boolean' &&
    object(r.stock) && object(r.purchases) && Object.entries(r.purchases).every(([id, n]) => ids.has(id) && int(n) && n <= ids.get(id).limit) &&
    Object.entries(r.stock).every(([id, n]) => ids.has(id) && int(n) &&
      n <= (r.purchases[id] || 0) + (r.starterClaimed && id === 'supply_choice' ? 1 : 0) + earnedConquestBundles(state, id));
}

function grantEarnedSupplyBundle(game, id) {
  if (!ids.has(id)) throw new GameError('BAD_SUPPLIES', '未知军需包');
  const r = copy(game.state.supplyWorkshop || empty());
  r.stock[id] = (r.stock[id] || 0) + 1;
  game.state.supplyWorkshop = r;
  if (!validSupplyWorkshop(game.state)) throw new GameError('BAD_SUPPLIES', '所得军需包无法通过来源校验');
}

function contentsReason(game, contents) {
  for (const [id, n] of Object.entries(contents.items || {})) {
    if (!game.manual.shop.some(row => row.id === id && row.effect) || !int(n) ||
      !int(game.state.inventory[id] || 0) || !int((game.state.inventory[id] || 0) + n)) return '道具内容或库存无效';
  }
  for (const [id, n] of Object.entries(contents.resources || {})) {
    if (!Object.hasOwn(game.resources, id) || !int(n) || !Number.isFinite(game.state.res[id]) ||
      game.state.res[id] + n > game.capacity(id)) return `${game.resources[id]?.name || id}容量不足；包裹保留，请腾出空间或提升仓储`;
  }
  return '';
}

function starterView(game, shared) {
  const reason = shared ? '首战工程补给用于本机进度' : game.state.supplyWorkshop?.starterClaimed ? '本存档已领取' :
    game.state.onboarding.firstBattle === 'complete' ? '首战引导已完成，本补给仅用于首战准备' :
    game.state.buildings.hall < 1 ? '官府达到1级后领取' : contentsReason(game, {items: starterItems});
  return {name: '首战工程补给', description: '一次性免费领取：建设1小时加速 ×4、研究1小时加速 ×2、练兵1小时加速 ×1、百工调拨令 ×1。先安排当前工程，再按成长路线预览使用。',
    claimed: !!game.state.supplyWorkshop?.starterClaimed, reason,
    command: {type: 'supplies.claimStarter', args: []}};
}

const starterSupplyQuote = (runtime, {shared = false} = {}) => starterView(runtime.Game, shared);

function supplyWorkshopView(runtime, {shared = false} = {}) {
  const game = runtime.Game, state = game.state, r = state.supplyWorkshop || empty();
  const items = shared ? [] : offers.map(offer => {
    const count = r.stock[offer.id] || 0, remaining = offer.limit - (r.purchases[offer.id] || 0);
    const reason = !remaining ? '本存档限购份额已用完' : state.gems < offer.price ? '试玩元宝不足' : '';
    const choices = (offer.choices || []).map(row => ({id: row.id, name: row.name, reason: contentsReason(game, row)}));
    return {id: offer.id, name: offer.name, category: '创新军需', effect: 'supplyBundle', count,
      description: offer.description + `\n试玩设计 · 本存档限购 ${offer.limit} 包，跨城共用。`, trial: true,
      supported: true, rewardOnly: false, price: offer.price, buyType: 'supplies.buy', openType: 'supplies.open',
      purchase: {reason, limit: reason ? 0 : Math.min(99, remaining, Math.floor(state.gems / offer.price)),
        remaining, dailyLimit: offer.limit, period: 'save', costs: Array.from({length: 99}, (_, i) => offer.price * (i + 1))},
      use: {targetKind: choices.length ? 'choice' : 'none', targets: choices,
        reason: count < 1 ? '没有这件包裹' : choices.length ? '' : contentsReason(game, offer), route: null}};
  });
  return {items, starter: starterView(game, shared)};
}

function grant(game, contents) {
  for (const [id, n] of Object.entries(contents.items || {})) game.state.inventory[id] = (game.state.inventory[id] || 0) + n;
  for (const [id, n] of Object.entries(contents.resources || {})) game.state.res[id] += n;
}

/** Private CAS candidate only. All failures discard the candidate and keep receipts unchanged. */
function executeSupplyCommand(runtime, input, now) {
  validateInput(input);
  if (!commands.has(input.type) || !validSupplyWorkshop(runtime.Game.state)) throw new GameError('BAD_SUPPLIES', '军需记录或操作无效');
  const game = runtime.Game;
  game.tick(now, true);
  const r = copy(game.state.supplyWorkshop || empty());
  let result;
  if (input.type === 'supplies.claimStarter') {
    if (input.args.length) throw new GameError('BAD_SUPPLIES', '首战补给参数无效');
    const quote = starterView(game, false);
    if (quote.reason) throw new GameError('GAME_RULE', quote.reason);
    grant(game, {items: starterItems});
    r.starterClaimed = true; r.stock.supply_choice = (r.stock.supply_choice || 0) + 1;
    result = {items: copy(starterItems), bundles: {supply_choice: 1}, free: true};
  } else {
    const offer = ids.get(input.args[0]);
    if (!offer) throw new GameError('BAD_SUPPLIES', '军需包不存在');
    if (input.type === 'supplies.buy') {
      const count = input.args[1], purchased = r.purchases[offer.id] || 0, cost = count * offer.price;
      if (input.args.length !== 2 || !int(count) || count < 1 || count > 99 || purchased + count > offer.limit)
        throw new GameError('GAME_RULE', '购买数量超过本存档限购份额');
      if (!int(game.state.gems) || game.state.gems < cost) throw new GameError('GAME_RULE', '试玩元宝不足');
      game.state.gems -= cost; r.purchases[offer.id] = purchased + count;
      r.stock[offer.id] = (r.stock[offer.id] || 0) + count;
      result = {bundle: offer.id, count, gemsSpent: cost};
    } else {
      if (!(r.stock[offer.id] > 0)) throw new GameError('GAME_RULE', '没有这件包裹');
      const choice = offer.choices?.find(row => row.id === input.args[1]);
      if (offer.choices ? input.args.length !== 2 || !choice : input.args.length !== 1)
        throw new GameError('BAD_SUPPLIES', '请明确选择合法的调拨方向');
      const contents = choice || offer, reason = contentsReason(game, contents);
      if (reason) throw new GameError('GAME_RULE', reason);
      grant(game, contents); r.stock[offer.id] -= 1;
      result = {bundle: offer.id, choice: choice?.id || null, items: copy(contents.items || {}), resources: copy(contents.resources || {})};
    }
  }
  game.state.supplyWorkshop = r;
  if (!validSupplyWorkshop(game.state) || !game.validSave(game.state) || game.save() === false)
    throw new GameError('INVALID_RESULT', '军需操作无法通过存档校验');
  return {state: copy(game.state), result, runtime};
}

return {validSupplyWorkshop,grantEarnedSupplyBundle,starterSupplyQuote,supplyWorkshopView,executeSupplyCommand};})();
const ConquestSupply=(()=>{

const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const int = value => Number.isSafeInteger(value) && value >= 0;
let metadata;
function catalogue() {
  if (metadata) return metadata;
  const {Game: game} = {Game};
  const nodes = new Map(game.nodes.map(node => [node.id, game.isCity(node) ? 'city' : 'wild']));
  const pool = game.manual.shop.filter(item => item.effect && !item.rewardOnly).map(item => ({
    kind: 'item', id: item.id, name: item.name, weight: item.price >= 100 ? 1 : 8}));
  pool.push(...Object.entries(CONQUEST_BUNDLES).map(([id, name]) => ({kind: 'bundle', id, name, weight: id === 'supply_siege' ? 3 : 8})));
  metadata = {nodes, pool};
  return metadata;
}

function nodeKind(id) {
  const wild = /^wild_(\d+)_(\d+)$/.exec(id);
  if (wild) return Number(wild[1]) < 64 && Number(wild[2]) < 64 && `wild_${Number(wild[1])}_${Number(wild[2])}` === id ? 'wild' : null;
  return catalogue().nodes.get(id) || null;
}
function empty() { return {version: 1, enabled: false, records: {}}; }
function availablePool(game) {
  return catalogue().pool.filter(drop => drop.kind === 'bundle' || (game.state.inventory[drop.id] || 0) < Number.MAX_SAFE_INTEGER);
}
function validConquestSupply(state) {
  if (!object(state)) return false;
  if (!Object.hasOwn(state, 'conquestSupply')) return true;
  const r = state.conquestSupply;
  if (!object(r) || Object.keys(r).length !== 3 || r.version !== 1 || typeof r.enabled !== 'boolean' || !object(r.records)) return false;
  const rows = Object.entries(r.records), {nodes, pool} = catalogue();
  if (rows.length > 4096 + nodes.size) return false;
  return rows.every(([id, row]) => object(row) && Object.keys(row).length === 7 && ['wild', 'city'].includes(row.kind) && nodeKind(id) === row.kind &&
    ['baseline', 'disabled', 'rewarded'].includes(row.status) && int(row.level) && row.level >= 1 && row.level <= 10 && int(row.at) &&
    typeof row.sourceCity === 'string' && row.sourceCity.length <= 100 && int(row.gems) &&
    (row.status === 'rewarded' ? row.gems <= conquestGems(row.kind, row.level) && !!row.sourceCity &&
      object(row.drop) && Object.keys(row.drop).length === 2 && pool.some(drop => drop.kind === row.drop.kind && drop.id === row.drop.id) : row.gems === 0 && row.drop === null));
}

function conquestNodeQuote(game, node, mode = 'occupy') {
  const kind = nodeKind(node.id), enabled = game.state.conquestSupply?.enabled === true;
  const first = !!kind && !game.state.conquestSupply?.records[node.id] && !game.state.conquered[node.id];
  return {enabled, eligible: !!kind && mode === 'occupy', first,
    gems: kind ? conquestGems(kind, Math.max(1, Math.min(10, node.level || 1))) : 0,
    reason: !enabled ? '征战补给模式尚未开启' : !kind || mode !== 'occupy' ? '额外补给用于野地／据点与城池占领' :
      !first ? '此地点的首次占领份额已处理，重占不再发放' : '真正占领后自动获得元宝与随机商城道具 ×1'};
}

function conquestSupplyView(runtime, {shared = false} = {}) {
  const game = runtime.Game, r = game.state.conquestSupply || empty(), pool = availablePool(game);
  const totalWeight = pool.reduce((n, row) => n + row.weight, 0);
  const rewarded = Object.entries(r.records).filter(([, row]) => row.status === 'rewarded');
  return {shared, enabled: !shared && r.enabled, reason: shared ? '征战补给模式用于本机PVE进度' : '',
    earnedGems: rewarded.reduce((n, [, row]) => n + row.gems, 0), rewarded: rewarded.length,
    history: shared ? [] : rewarded.sort((a, b) => b[1].at - a[1].at).slice(0, 8).map(([id, row]) => ({
      node: id, name: game.getNode(id)?.name || id, kind: row.kind, gems: row.gems, at: row.at,
      itemName: catalogue().pool.find(drop => drop.kind === row.drop.kind && drop.id === row.drop.id).name})),
    pool: shared ? [] : pool.map(row => ({id: row.id, kind: row.kind, name: row.name, percent: 100 * row.weight / totalWeight})),
    command: {type: 'conquest.setEnabled', args: [!r.enabled]}};
}

function executeConquestSetting(runtime, input, now) {
  validateInput(input);
  if (input.type !== 'conquest.setEnabled' || input.args.length !== 1 || typeof input.args[0] !== 'boolean')
    throw new GameError('BAD_CONQUEST_MODE', '请选择开启或暂停征战补给模式');
  const game = runtime.Game;
  game.tick(now, true);
  const r = copy(game.state.conquestSupply || empty());
  // Initial opt-in never pays retroactive prizes for already-owned/imported land.
  for (const id of Object.keys(game.state.conquered)) {
    if (!game.state.conquered[id] || r.records[id] || !nodeKind(id)) continue;
    const node = game.getNode(id);
    if (node) r.records[id] = {status: 'baseline', kind: nodeKind(id), level: Math.max(1, Math.min(10, node.level || 1)),
      at: now, sourceCity: '', gems: 0, drop: null};
  }
  r.enabled = input.args[0]; game.state.conquestSupply = r;
  if (!validConquestSupply(game.state) || !game.validSave(game.state) || game.save() === false)
    throw new GameError('INVALID_RESULT', '征战补给设置无法通过存档校验');
  return {runtime, state: copy(game.state), result: {enabled: r.enabled}};
}

/** Capture only a real player-issued occupancy round, before native settlement. */
function captureConquestContext(game, input) {
  const b = game.state.battle;
  if (input.type !== 'battleRound' || !game.state.conquestSupply || !b || b.finished || b.mode !== 'occupy' ||
      game.state.expedition?.node !== b.node || game.state.expedition?.general !== b.general || !nodeKind(b.node)) return null;
  if (game.state.expedition.sourceCity && game.state.expedition.sourceCity !== game.currentCityId()) return null;
  return {battle: b, node: b.node, general: b.general, sourceCity: game.currentCityId(), already: !!game.state.conquered[b.node]};
}

/** Supplemental reward only after actual ownership changes. Same CAS/receipt as the battle. */
function settleConquestSupply(runtime, context, now) {
  if (!context) return null;
  const game = runtime.Game, b = game.state.battle, result = b?.result, node = game.getNode(context.node);
  if (b !== context.battle || !b.finished || b.node !== context.node || b.general !== context.general || context.already ||
      !result?.won || result.mode !== 'occupy' || result.claimed !== true || !game.state.conquered[context.node] ||
      game.currentCityId() !== context.sourceCity || game.state.conquestSupply.records[context.node]) return null;
  if (node.wild && game.state.realm.wildOwners[context.node] !== context.sourceCity ||
      game.isCity(node) && !game.cityList().some(city => city.node === context.node)) return null;
  const report = game.state.reports[0];
  if (!report || report.node !== context.node || report.general !== context.general || report.sourceCity !== context.sourceCity ||
      !int(report.id) || report.won !== true || report.claimed !== true || report.mode !== 'occupy') return null;
  const r = game.state.conquestSupply, kind = nodeKind(context.node), level = Math.max(1, Math.min(10, node.level || 1));
  const row = {status: r.enabled ? 'rewarded' : 'disabled', kind, level, at: report.id, sourceCity: context.sourceCity, gems: 0, drop: null};
  r.records[context.node] = row;
  if (r.enabled) {
    const pool = availablePool(game);
    let pick = Math.floor(Math.random()*pool.reduce((n, drop) => n + drop.weight, 0));
    const chosen = pool.find(drop => (pick -= drop.weight) < 0);
    row.drop = {kind: chosen.kind, id: chosen.id};
    row.gems = Math.min(conquestGems(kind, level), Number.MAX_SAFE_INTEGER - game.state.gems);
    game.state.gems += row.gems;
    if (chosen.kind === 'bundle') SupplyWorkshop.grantEarnedSupplyBundle(game, chosen.id);
    else game.state.inventory[chosen.id] = (game.state.inventory[chosen.id] || 0) + 1;
  }
  if (!validConquestSupply(game.state) || !game.validSave(game.state) || game.save() === false)
    throw new GameError('INVALID_RESULT', '占领补给无法通过存档校验');
  return row.status === 'rewarded' ? conquestReportReceipt(runtime, report) : null;
}

function conquestReportReceipt(runtime, report) {
  const row = runtime.Game.state.conquestSupply?.records[report.node];
  if (!row || row.status !== 'rewarded' || row.at !== report.id || row.sourceCity !== report.sourceCity ||
      report.won !== true || report.claimed !== true || report.mode !== 'occupy') return null;
  const drop = catalogue().pool.find(value => value.kind === row.drop.kind && value.id === row.drop.id);
  return {node: report.node, gems: row.gems, item: {...copy(row.drop), name: drop.name, count: 1}};
}

return {validConquestSupply,conquestNodeQuote,conquestSupplyView,executeConquestSetting,captureConquestContext,settleConquestSupply,conquestReportReceipt};})();

  const runtime=()=>({Game,HeritageSystem,Progression});
  const shared=()=>Game.authorityActive()||!!Game.state?.onlineRealm||typeof GAME_SERVER_RUNTIME!=='undefined'&&GAME_SERVER_RUNTIME;
  function execute(type,args){
    if(shared())return '此扩展用于本机进度，共享世界继续使用原结算规则';
    const reason=Game.saveBlockReason();if(reason)return reason;
    try{
      if(type.startsWith('supplies.'))SupplyWorkshop.executeSupplyCommand(runtime(),{type,args},Date.now());
      else if(type==='conquest.setEnabled')ConquestSupply.executeConquestSetting(runtime(),{type,args},Date.now());
      else GrowthSupport.executeGrowthSupport(runtime(),{type,args},Date.now());
      return null;
    }catch(error){return error.message;}
  }
  function capture(){return shared()?null:ConquestSupply.captureConquestContext(Game,{type:'battleRound'});}
  function settle(context){
    if(!context)return null;
    // finishBattle persists the native report and supplemental receipt together.
    const game=Object.create(Game);game.save=()=>true;
    return ConquestSupply.settleConquestSupply({...runtime(),Game:game},context,Date.now());
  }
  function sync(){
    if(shared()||Game.state.conquestSupply)return;
    // Preserve old ownership as a baseline before any new battle or toggle.
    const records={};
    for(const [id,held] of Object.entries(Game.state.conquered)){
      const node=held?Game.getNode(id):null;if(!node)continue;
      records[id]={kind:Game.isCity(node)?'city':'wild',status:'baseline',level:Math.max(1,Math.min(10,node.level||1)),at:Date.now(),sourceCity:'',gems:0,drop:null};
    }
    Game.state.conquestSupply={version:1,enabled:false,records};
  }
  return {execute,capture,settle,sync,shared,
    valid:s=>WildFields.valid(s)&&GrowthSupport.validGrowthSupport(s)&&SupplyWorkshop.validSupplyWorkshop(s)&&ConquestSupply.validConquestSupply(s),
    supplies:()=>SupplyWorkshop.supplyWorkshopView(runtime(),{shared:shared()}),
    growth:()=>[GrowthSupport.growthSupportQuote(runtime(),{shared:shared()}),...GrowthSupport.growthPreparationQuotes(runtime(),{shared:shared()})],
    conquest:()=>ConquestSupply.conquestSupplyView(runtime(),{shared:shared()}),
    conquestQuote:(node,mode)=>ConquestSupply.conquestNodeQuote(Game,node,mode),
    receipt:report=>ConquestSupply.conquestReportReceipt(runtime(),report)};
})();


// SOURCE: engine.js
'use strict';
// Handbook tables are in manual-data.js. Trial economy formulas and combat coefficients are documented in RULES.md.
const Game = (() => {
  const KEY = 'sanguo-city-v2';
  // Income follows real time; the trial clock only speeds population and queues.
  const ECONOMY_OUTPUT_FACTOR=.7,RAID_LOOT_FACTOR=1.3;
  // A Yellow Turban city pays its gold once per occupation victory, then refreshes after an hour.
  const YELLOW_GOLD_REFRESH_MS=3600000;
  // A started build with this much time or less left can be finished at once for free.
  const FREE_FINISH_MS=300000;
  const resources = {food:{name:'粮食',icon:'穗'},wood:{name:'木材',icon:'木'},stone:{name:'石料',icon:'石'},iron:{name:'铁锭',icon:'铁'},gold:{name:'黄金',icon:'金'}};
  const buildings=ManualData.buildings,units=ManualData.units;
  const cityIds=Object.keys(buildings).filter(id=>!['farm','lumber','quarry','mine'].includes(id));
  const plotTypes={farm:{resource:'food',tech:'plant',color:'#9cab6e'},lumber:{resource:'wood',tech:'logging',color:'#78a289'},quarry:{resource:'stone',tech:'mining',color:'#aab4ae'},mine:{resource:'iron',tech:'smelting',color:'#b99a7d'}};
  const PLOT_COUNT=39;
  const newPlots=()=>Array.from({length:PLOT_COUNT},()=>({type:null,level:0}));
  const newPlotTemplate=()=>({id:null,active:false,mode:'fill'});
  const templateValid=p=>!!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&(p.id===null||PlotTemplateData.templates.some(t=>t.id===p.id))&&typeof p.active==='boolean'&&(!p.active||p.id!==null)&&['fill','replace'].includes(p.mode);
  const generals = [
    {id:'lin',name:'林朔',title:'乡勇统领',type:'枪',atk:64,def:58,pol:48,desc:'熟悉乡间地势，以长枪方阵守住阵线。',bonus:'spear'},
    {id:'su',name:'苏砚',title:'随军谋士',type:'策',atk:48,def:72,pol:78,desc:'善理内政，率军时以稳健守势减少损失。',bonus:'shield'},
    {id:'yan',name:'严秋',title:'弓马游侠',type:'弓',atk:78,def:48,pol:42,desc:'游走于山林，擅长寻找敌军弓阵的空隙。',bonus:'archer'}
  ];
  const nodes = [
    {id:'field',name:'河畔荒田',terrain:'field',x:24,y:73,level:1,desc:'溃散的乡勇盘踞河岸，夺回粮田可增加粮食产量。',army:{spear:18,archer:7},loot:{food:330,wood:90,gold:80},bonus:{food:.2},reward:'粮食产量 +20%',time:10},
    {id:'wood',name:'青竹林',terrain:'forest',x:29,y:34,level:1,desc:'林中匪兵轻装上阵，带上弓箭兵压制敌军。',army:{spear:22,archer:8},loot:{wood:350,food:130,gold:90},bonus:{wood:.2},reward:'木材产量 +20%',time:14},
    {id:'pass',name:'白石隘口',terrain:'mountain',x:62,y:64,level:2,desc:'盾兵封锁隘口。集中兵力，避免分散攻击。',army:{shield:32,spear:20,archer:12},loot:{stone:410,iron:180,gold:170},bonus:{stone:.2},reward:'石料产量 +20%',time:18},
    {id:'camp',name:'黄巾营寨',terrain:'camp',x:66,y:27,level:2,desc:'弓兵依托营寨防守，轻骑兵能快速绕过前排。',army:{spear:30,archer:35,shield:12},loot:{food:380,wood:240,iron:160,gold:230},reward:'解救武将 · 严秋',time:22,capture:'yan'},
    {id:'mine',name:'赤铁山',terrain:'mountain',x:83,y:49,level:3,desc:'骑兵巡守矿脉，长枪兵是攻取这里的关键。',army:{cavalry:30,shield:25,archer:25},loot:{iron:580,stone:200,gold:280},bonus:{iron:.25},reward:'铁锭产量 +25%',time:24},
    {id:'fort',name:'古渡县城',terrain:'fort',x:49,y:13,level:4,desc:'县城守军兵种齐全。扩充兵力与武将等级后，再发起总攻。',army:{shield:70,spear:55,archer:65,cavalry:18},loot:{food:1100,wood:750,stone:600,iron:480,gold:900},reward:'占领县城 · 开启第二章',time:30},
    ...ChapterData.allNodes(),
    ...YellowCityData.allNodes()
  ];
  const WORLD_SIZE=64,home={x:32,y:32};
  const landmarks={field:{x:29,y:35},wood:{x:29,y:29},pass:{x:36,y:34},camp:{x:37,y:28},mine:{x:40,y:32},fort:{x:34,y:23},...Object.fromEntries([...ChapterData.allNodes(),...YellowCityData.allNodes()].map(n=>[n.id,{x:n.x,y:n.y}]))};
  const fixedSites=nodes.filter(n=>!n.openCity).map(n=>landmarks[n.id]);
  const nodeSite=(n,context=state)=>n.openCity?(context?.openCitySites?.[n.id]||landmarks[n.id]):landmarks[n.id];
  const terrainTypes={
    plain:{name:'平地',icon:'平',resource:'food',color:'#86976a'},
    grass:{name:'草原',icon:'草',resource:'food',color:'#83985e'},
    forest:{name:'森林',icon:'林',resource:'wood',color:'#496e54'},
    hill:{name:'荒漠',icon:'漠',resource:'stone',color:'#999d7a'},
    mountain:{name:'山地',icon:'山',resource:'iron',color:'#828c83'},
    lake:{name:'湖泊',icon:'湖',resource:'food',color:'#638d86'},
    swamp:{name:'沼泽',icon:'泽',resource:'food',color:'#617b67'}
  };
  const hash=(x,y)=>{let n=Math.imul(x+419,374761393)^Math.imul(y+733,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
  function legacyWildTile(x,y,context=state,override=null){
    const seed=override?.seed??hash(x,y),district=hash(Math.floor(x/4),Math.floor(y/4))%100,river=Math.abs(x-(15+Math.round(4*Math.sin(y/7))));
    const type=override?.type||(river<1?'lake':district<19?'forest':district<35?'mountain':district<48?'hill':district<61?'swamp':district<80?'grass':'plain');
    const cfg=terrainTypes[type],distance=Math.hypot(x-home.x,y-home.y),base=Math.min(10,1+Math.floor(distance/5)+(seed%11===0?1:0));
    const id='wild_'+x+'_'+y,claim=context?.landClaims?.[id];
    const level=override?.level??(claim?Math.max(0,claim.level-Math.floor((Date.now()-claim.at)/86400000)):base);
    // Use the package's NPC value budget and conversion factor; stable seeded weights
    // adapt its random composition to a persistent browser map.
    const army={},budget=(ReferenceRules.fieldBudget[level]||0)*1.1,ids=Object.keys(ReferenceRules.npcValues);let allocated=0;
    ids.forEach((id,i)=>{const weight=(override&&!override.legacy?WildFields.weight(seed,i):hash(x+i*7,y+i*13))%(100-allocated||1);allocated+=weight;const count=Math.floor(budget*weight*.0078/ReferenceRules.npcValues[id]);if(count>0)army[id]=count;});
    if(level&&!Object.keys(army).length)army.militia=1;
    let bonus=0;if(level&&type!=='plain')bonus=(type==='lake'?5+level*3:type==='grass'?11+level:3+level*2)/100;
    const value=Object.entries(army).reduce((v,[id,n])=>v+Math.floor(n*ReferenceRules.npcValues[id]/.784),0),amount=Math.floor(value*(cfg.resource==='stone'?.5:cfg.resource==='iron'?.4:1)),bonusMap=bonus?{[cfg.resource]:bonus}:{},reward=type==='plain'?'平地 · 占领后可筑城':level?'占领后 '+resources[cfg.resource].name+'产量 +'+Math.round(bonus*100)+'%':'0 级野地 · 无产量加成';
    return {id,name:cfg.name+'野地 ('+x+','+y+')',type,terrain:type,x,y,level,wild:true,referenceArmy:true,desc:'野地守军按等级战力预算生成，各地配兵不同。先侦察，再选择掠夺或占领；运输兵决定能带回多少资源。',army,loot:{[cfg.resource]:amount},reward,bonus:bonusMap,time:Math.min(90,Math.max(8,Math.round(6+distance*2)))};
  }
  function wildTile(x,y,context=state){const override=WildFields.resolve(context,x,y,Date.now());return {...legacyWildTile(x,y,context,override),wildKey:WildFields.key(context,x,y,Date.now())};}
  function getWorldTile(x,y,context=state){
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=WORLD_SIZE||y>=WORLD_SIZE)return null;
    if(x===home.x&&y===home.y)return {id:'home',name:'青溪城',type:'home',x,y,level:context?.realm?.cities?.capital?.data.buildings.hall||context?.buildings.hall||1};
    const own=Object.values(context?.realm?.cities||{}).find(c=>!c.capital&&c.x===x&&c.y===y);
    if(own&&!nodes.some(n=>n.id===own.node))return {...wildTile(x,y,context),name:own.name,type:'fort',terrain:'fort',ownCity:own.id,wild:false};
    const named=nodes.find(n=>nodeSite(n,context).x===x&&nodeSite(n,context).y===y);
    if(named)return {...named,...nodeSite(named,context),type:named.terrain==='field'?'grass':named.terrain==='forest'?'forest':named.terrain==='mountain'?'mountain':named.terrain,wild:false};
    return wildTile(x,y,context);
  }
  function getNode(id,context=state){
    const order=WarOrders.getNode(id);if(order)return order;
    const named=nodes.find(n=>n.id===id);if(named)return {...named,...nodeSite(named,context),wild:false};
    if(typeof id!=='string')return null;
    const match=/^wild_(\d{1,2})_(\d{1,2})$/.exec(id);if(!match)return null;
    const x=Number(match[1]),y=Number(match[2]);if(id!==`wild_${x}_${y}`)return null;
    const tile=getWorldTile(x,y,context);return tile?.wild?tile:context?.realm?.cities?.[CitySystem.idFor(id)]?wildTile(x,y,context):null;
  }
  // Visibility follows completed visits. Existing later progress and deployed armies stay reachable.
  function landmarkReached(n){return n.chapter||['camp','fort'].includes(n.id)?!!state.conquered[n.id]:!!(state.raided[n.id]||state.conquered[n.id]);}
  function landmarkVisible(id){
    const n=nodes.find(n=>n.id===id);if(!n)return true;
    if(n.namedCity)return NamedCitySystem.visible(state,id);
    if(n.openCity)return true;
    if(state.conquered[id]||state.raided[id]||state.garrisons[id]||state.battle?.node===id||allExpeditions().some(e=>e.node===id))return true;
    if(n.chapter)return ChapterData.unlocked(state,n.chapter)&&!ChapterData.blocked(state,id);
    const first=nodes.filter(x=>!x.chapter&&!x.openCity),farthest=first.reduce((i,x,j)=>landmarkReached(x)?j:i,-1);
    return first.indexOf(n)<=farthest+1;
  }
  function nextLandmark(){const first=nodes.filter(n=>!n.chapter&&!n.openCity),farthest=first.reduce((i,n,j)=>landmarkReached(n)?j:i,-1);if(farthest+1<first.length)return first[farthest+1];for(const chapter of [2,3])if(ChapterData.unlocked(state,chapter)){const next=ChapterData.progress(state,chapter).next;if(next)return next;}return null;}
  const defaultCityLayout=()=>Array.from({length:36},(_,i)=>i===14?'hall':[15,20,21].includes(i)?'reserved':null);
  const starterGiftReward={...OnboardingData.gifts[0].resources};
  const supplies=(amount,gold)=>({food:amount,wood:amount,stone:amount,iron:amount,gold});
  const plotReached=(s,type,level=1)=>s.plots.some(p=>p.type===type&&p.level>=level);
  const missions = [
    {id:'gift',stage:'立城补给',title:'奉诏立城',desc:'领取新手补给第 1 阶（官府礼包），取得第一批建城物资',route:'gift',check:s=>s.starterGiftClaimed,reward:supplies(3000,8000)},
    {id:'house',stage:'立城补给',title:'安置百姓',desc:'完成 1 座 1 级民房，为招兵提供人口',route:'inner',check:s=>s.buildings.house>=1,reward:{food:5000,wood:4000,stone:3000,iron:2000,gold:6000}},
    {id:'farm',stage:'立城补给',title:'开垦农田',desc:'在城外完成 1 块农田',route:'outer',check:s=>plotReached(s,'farm'),reward:{food:6000,wood:4000,stone:3000,iron:2000,gold:5000}},
    {id:'lumber',stage:'立城补给',title:'伐木备料',desc:'在城外完成 1 块伐木场',route:'outer',check:s=>plotReached(s,'lumber'),reward:{food:3000,wood:7000,stone:3000,iron:2000,gold:5000}},
    {id:'quarry',stage:'立城补给',title:'采石筑城',desc:'在城外完成 1 块采石场',route:'outer',check:s=>plotReached(s,'quarry'),reward:{food:3000,wood:4000,stone:7000,iron:2000,gold:5000}},
    {id:'mine',stage:'立城补给',title:'冶铁备兵',desc:'在城外完成 1 块铁矿',route:'outer',check:s=>plotReached(s,'mine'),reward:{food:3000,wood:4000,stone:3000,iron:7000,gold:6000}},
    {id:'house2',stage:'立城补给',title:'扩充民居',desc:'将任意民房升至 2 级，人口上限达到 300',route:'inner',check:s=>s.buildings.house>=2,reward:supplies(5000,8000)},
    {id:'population',stage:'立城补给',title:'百姓归附',desc:'城中人口达到 100；已累计训练 20 名士兵也可完成',route:'inner',check:s=>s.population>=100||s.stats.trained>=20,reward:{food:8000,wood:4000,stone:3000,iron:4000,gold:10000}},
    {id:'hall2',stage:'立城补给',title:'立城之本',desc:'官府升至 2 级',route:'inner',check:s=>s.buildings.hall>=2,reward:supplies(8000,12000)},
    {id:'warehouse',stage:'立城补给',title:'储粮备战',desc:'完成 1 座仓库；任务奖励可暂时超出仓储上限',route:'inner',check:s=>s.buildings.warehouse>=1,reward:supplies(5000,8000)},
    {id:'drill',stage:'立城补给',title:'设立校场',desc:'完成 1 座校场，开启派兵出征',route:'inner',check:s=>s.buildings.drill>=1,reward:{food:10000,wood:6000,stone:4000,iron:6000,gold:10000}},
    {id:'barracks',stage:'立城补给',title:'军营落成',desc:'完成 1 座军营，开启义兵训练',route:'inner',check:s=>s.buildings.barracks>=1,reward:{food:12000,wood:10000,stone:4000,iron:8000,gold:12000}},
    {id:'trained20',stage:'整军出征',title:'操练乡勇',desc:'累计完成训练 20 名士兵',route:'army',check:s=>s.stats.trained>=20,reward:{food:6000,wood:5000,iron:4000,gold:8000}},
    {id:'spearReady',stage:'整军出征',title:'长枪列阵',desc:'军营达到 2 级，并研究 1 级战斗技巧，解锁长枪兵',route:'research',check:s=>s.buildings.barracks>=2&&s.tech.combat>=1,reward:{food:5000,wood:8000,iron:4000,gold:10000}},
    {id:'trained60',stage:'整军出征',title:'初成军势',desc:'累计完成训练 60 名士兵，开始依靠战利品发展',route:'army',check:s=>s.stats.trained>=60,reward:{food:4000,wood:3000,iron:3000,gold:12000}},
    {id:'firstVictory',stage:'征战里程',title:'首战告捷',desc:'赢得任意 1 场掠夺或占领战斗',route:'world',check:s=>s.stats.victories>=1,reward:{food:6000,wood:6000,iron:6000,gold:6000}},
    {id:'field',stage:'征战里程',title:'收复粮田',desc:'掠夺或占领河畔荒田并获胜',route:'world',check:s=>!!(s.raided.field||s.conquered.field),reward:{food:4000,wood:3000,iron:3000,gold:8000}},
    {id:'victories3',stage:'征战里程',title:'连战三捷',desc:'累计赢得 3 场战斗',route:'world',check:s=>s.stats.victories>=3,reward:{food:3000,iron:2000,gold:15000}},
    {id:'camp',stage:'征战里程',title:'兵临营寨',desc:'占领黄巾营寨，解救严秋',route:'world',check:s=>!!s.conquered.camp,reward:{food:4000,wood:3000,gold:18000}},
    {id:'victories10',stage:'征战里程',title:'威震乡野',desc:'累计赢得 10 场战斗',route:'world',check:s=>s.stats.victories>=10,reward:{food:5000,iron:3000,gold:25000}},
    {id:'fort',stage:'征战里程',title:'一县之主',desc:'占领古渡县城',route:'world',check:s=>!!s.conquered.fort,reward:{food:6000,wood:4000,stone:4000,iron:4000,gold:30000}}
  ];
  missions.push({id:'wildGeneral',stage:'征战里程',title:'招降野将',desc:'通过野地线索俘获并招降 1 名将领',route:'wildGenerals',check:s=>(s.wildGenerals?.recruited?.length||0)>0,reward:{food:3000,wood:3000,iron:3000}});
  RewardData.extendMissions(missions);
  ChapterData.extendMissions(missions);
  // Final values, after legacy reward scaling. Existing claims remain one-time.
  for(const [id,reward]of Object.entries({firstVictory:{food:6000,wood:6000,stone:6000,iron:6000,gold:6000},field:{food:4000,wood:3000,stone:4000,iron:3000,gold:8000},wildGeneral:{food:3000,wood:3000,stone:3000,iron:3000}}))missions.find(m=>m.id===id).reward=reward;
  const missionClaimed=(id,s=state)=>s.missionClaims.includes(id);
  const missionReady=(m,s=state)=>!missionClaimed(m.id,s)&&m.check(s);
  const currentMission=()=>missions.find(m=>missionReady(m))||missions.find(m=>!missionClaimed(m.id));
  const lessonEvidence=new WeakMap();
  let state,economyClock=null,realmSettling=false,onlineAuthority=false,offlineSnapshot=null,externalGeneralBusy=new Set(),lessonSession=null;
  const tacticsAvailable=()=>typeof BattleStratagems!=='undefined'&&!onlineAuthority&&typeof GAME_SERVER_RUNTIME==='undefined';
  const blankArmy = () => Object.fromEntries(Object.keys(units).map(k=>[k,0]));
  const initialTown=(n,owned=false)=>({morale:owned?-5:100,unrest:0,population:n.population||400});
  const initialTowns=(owned={})=>Object.fromEntries(nodes.filter(n=>n.terrain==='fort').map(n=>[n.id,initialTown(n,!!owned[n.id])]));
  const newState=()=>{const fresh=({version:2,manualSchema:1,last:Date.now(),speed:1,autoUpgrade:false,autoResearch:false,starterGiftClaimed:false,starterGiftVersion:0,missionSchema:2,missionClaims:[],res:{food:5000,wood:5000,stone:5000,iron:5000,gold:5000},buildings:Object.fromEntries(cityIds.map(id=>[id,id==='hall'?1:0])),cityLayout:defaultCityLayout(),cityLevels:Array.from({length:36},(_,i)=>i===14?1:0),tactics:Object.fromEntries(Object.keys(units).map(id=>[id,{command:id==='archer'?'advance':defaultOrder(id),target:''}])),plots:newPlots(),plotTemplate:newPlotTemplate(),army:blankArmy(),captives:blankArmy(),buildQueue:[],trainQueue:[],researchQueue:null,tech:Object.fromEntries(Object.keys(ManualData.technology).map(id=>[id,0])),generals:['lin','su'],generalLevels:{lin:1,su:1},generalXp:{lin:0,su:0},customGenerals:[],innCandidates:[],governor:'su',population:0,morale:80,unrest:0,tax:20,storageAllocation:{food:25,wood:25,stone:25,iron:25},gems:1000,inventory:{},buffs:{},itemCooldowns:{},civicCooldowns:{comfort:0,levy:0},trialGiftAt:0,ruler:'青溪城主',banner:'青',scouted:{},defenses:Object.fromEntries(Object.keys(ManualData.defenses).map(id=>[id,0])),defenseQueue:[],landClaims:{},conquered:{},raided:{},garrisons:{},towns:initialTowns(),yellowGold:{},openCitySites:YellowCityData.createSites(null,fixedSites),cooldowns:{},expedition:null,expeditions:[],battle:null,reports:[],mission:0,stats:{trained:0,victories:0},seen:[],tutorial:false});Progression.init(fresh);HeroSystem.init(fresh);HeritageSystem.init(fresh);NPCDefense.init(fresh);WarCare.init(fresh);GovernanceSystem.init(fresh);AutomationSystem.init(fresh);OnboardingSystem.init(fresh);WarOrders.init(fresh);GeneralGrowth.init(fresh);ScoutSystem.init(fresh);RegionalFront.init(fresh);HeroAdministration.init(fresh);CitySystem.init(fresh);NamedCitySystem.init(fresh);SupplyLines.init(fresh);fresh.prestige=0;return fresh;};
  function migrateSave(data){
    if(!data||![1,2].includes(data.version))return data;
    const migrationNow=Date.now(),old=JSON.parse(JSON.stringify(data));
    if(old.version===1){old.plots=newPlots();Object.keys(plotTypes).forEach((type,index)=>{old.plots[index]={type,level:old.buildings[type]||1};delete old.buildings[type];});old.buildQueue=old.buildQueue.map(q=>Object.hasOwn(plotTypes,q.id)?{...q,plot:Object.keys(plotTypes).indexOf(q.id),kind:'upgrade'}:q);}
    old.version=2;if(old.expeditions===undefined)old.expeditions=[];if(old.autoUpgrade===undefined)old.autoUpgrade=false;if(old.autoResearch===undefined)old.autoResearch=false;if(old.starterGiftClaimed===undefined)old.starterGiftClaimed=false;
    if(!old.manualSchema){
      const layout=old.cityLayout||Array.from({length:16},(_,i)=>({1:'house',5:'hall',10:'barracks',15:'wall'})[i]||null),fresh=defaultCityLayout(),levels=Array(36).fill(0);levels[14]=old.buildings.hall||1;
      for(let i=0;i<layout.length;i++){const id=layout[i];if(!id||id==='hall')continue;const target=fresh[i]===null?i:fresh.findIndex((x,j)=>x===null&&j!==14);fresh[target]=id;levels[target]=old.buildings[id]||1;}
      for(const q of old.buildQueue||[])if(q.plot===undefined){q.site=fresh.indexOf(q.id);q.kind='upgrade';}
      old.cityLayout=fresh;old.cityLevels=levels;old.manualSchema=1;
      const defaults=newState();for(const id of cityIds)if(old.buildings[id]===undefined)old.buildings[id]=0;
      for(const key of ['speed','tech','researchQueue','population','morale','unrest','storageAllocation','gems','inventory','buffs','itemCooldowns','trialGiftAt','ruler','banner','scouted','defenses','defenseQueue','customGenerals','innCandidates','landClaims'])if(old[key]===undefined)old[key]=defaults[key];
      old.population=Math.max(100,old.cityLevels.reduce((v,l,i)=>v+(old.cityLayout[i]==='house'?buildRecord('house',l).population||0:0),0));
      if(old.expedition&&old.expedition.node.startsWith('wild_')&&!old.battle){const match=/wild_(\d+)_(\d+)/.exec(old.expedition.node),x=Number(match[1]),y=Number(match[2]),distance=Math.hypot(x-home.x,y-home.y),seed=hash(x,y),level=Math.min(8,1+Math.floor(distance/7)+(seed%11===0?1:0)),type=wildTile(x,y,old).type,army={spear:10+level*8};if(type==='forest'||type==='lake')army.archer=6+level*6;else if(type==='mountain'||type==='hill')army.shield=5+level*7;else army.archer=4+level*3;if(level>=3)army.cavalry=level*3;old.expedition.enemySnapshot=army;}
    }
    while(old.plots.length<PLOT_COUNT)old.plots.push({type:null,level:0});
    if(old.plotTemplate===undefined)old.plotTemplate=newPlotTemplate();
    if(old.tactics===undefined)old.tactics={};for(const id of Object.keys(units)){if(old.army[id]===undefined)old.army[id]=0;if(old.tactics[id]===undefined)old.tactics[id]={command:defaultOrder(id),target:''};}
    if(old.raided===undefined)old.raided={...old.conquered};if(old.garrisons===undefined)old.garrisons={};if(old.towns===undefined)old.towns=initialTowns(old.conquered);
    if(old.towns&&typeof old.towns==='object'&&!Array.isArray(old.towns))for(const n of nodes.filter(n=>n.terrain==='fort'))if(old.towns[n.id]===undefined)old.towns[n.id]=initialTown(n,!!old.conquered[n.id]);
    if(old.openCitySites===undefined)old.openCitySites=YellowCityData.createSites(old,fixedSites);
    if(old.expedition){const e=old.expedition;if(e.orders===undefined)e.orders=JSON.parse(JSON.stringify(old.tactics));if(e.mode===undefined)e.mode='occupy';for(const id of Object.keys(units)){if(e.army[id]===undefined)e.army[id]=0;if(e.orders[id]===undefined)e.orders[id]={command:defaultOrder(id),target:''};}}
    for(const g of Object.values(old.garrisons)){for(const id of Object.keys(units))if(g.army[id]===undefined)g.army[id]=0;}
    for(const id of Object.keys(old.conquered))if(id.startsWith('wild_')&&!old.landClaims[id])old.landClaims[id]={at:Date.now(),level:getNode(id,old).level};
    if(old.battle){const b=old.battle;if(![2,3].includes(b.rules)){b.length=battleLength([...b.player,...b.enemy]);for(const r of [...b.player,...b.enemy]){const ratio=r.maxHp>0?r.hp/r.maxHp:0;r.maxHp=r.initial*units[r.id].hp;r.hp=Math.min(r.maxHp,Math.round(ratio*r.maxHp));r.pos=Math.max(0,Math.min(b.length,Math.round(r.pos/7*b.length)));}b.orders=Object.fromEntries(b.player.map(r=>[r.id,{command:defaultOrder(r.id),target:''}]));b.rules=2;}
      for(const r of [...b.player,...b.enemy])if(!r.stats)r.stats={hp:units[r.id].hp,atk:units[r.id].atk,def:units[r.id].def,range:units[r.id].range,speed:units[r.id].speed};
      if(b.mode===undefined)b.mode='occupy';if(b.siege===undefined)b.siege=false;if(b.militia===undefined)b.militia=0;if(b.finished){if(!b.result.mode)b.result.mode='occupy';if(b.result.claimed===undefined)b.result.claimed=!!b.result.first;if(b.result.stationed===undefined)b.result.stationed=false;}
    }
    for(const r of [...old.reports,...(old.battle?.finished?[old.battle.result]:[])]){if(!r.mode)r.mode='occupy';for(const key of ['back','lost','wounded'])for(const id of Object.keys(units))if(r[key][id]===undefined)r[key][id]=0;}
    if(old.civicCooldowns===undefined)old.civicCooldowns={comfort:0,levy:0};
    if(old.starterGiftVersion===undefined)old.starterGiftVersion=old.starterGiftClaimed?1:0;
    if(old.missionSchema===undefined&&Number.isInteger(old.mission)&&old.mission>=0&&old.mission<=6){
      // The old six sequential missions map to stable IDs, so previously collected rewards stay collected.
      const legacy=['farm','trained20','field','hall2','camp','fort'];
      old.missionClaims=legacy.slice(0,Math.max(0,Math.min(legacy.length,old.mission||0)));
      old.missionSchema=2;old.mission=old.missionClaims.length;
    }
    for(const id of Object.keys(ManualData.technology))if(old.tech[id]===undefined)old.tech[id]=0;
    if(old.captives===undefined)old.captives=blankArmy();
    Progression.init(old);HeroSystem.init(old);HeritageSystem.init(old);NPCDefense.init(old);WarCare.init(old);GovernanceSystem.init(old,migrationNow);AutomationSystem.init(old);OnboardingSystem.init(old);WarOrders.init(old);GeneralGrowth.init(old);ScoutSystem.init(old);RegionalFront.init(old);HeroAdministration.init(old);CitySystem.init(old,nodes.filter(n=>isCity(n)).map(n=>getNode(n.id,old)));
    for(const c of CitySystem.list(old)){GeneralGrowth.init(old);ScoutSystem.init(c.data);RegionalFront.init(c.data);HeroAdministration.init(c.data);WarCare.init(c.data);GovernanceSystem.initCity(c.data,migrationNow);}NamedCitySystem.init(old);SupplyLines.init(old);
    if(old.openCitySites&&typeof old.openCitySites==='object'&&!Array.isArray(old.openCitySites)&&['yellow_qingshi','yellow_baisha','yellow_chigang'].every(id=>Object.hasOwn(old.openCitySites,id))&&Object.keys(old.openCitySites).every(id=>YellowCityData.allNodes().some(n=>n.id===id))&&YellowCityData.allNodes().some(n=>!Object.hasOwn(old.openCitySites,n.id)))old.openCitySites=YellowCityData.createSites(old,fixedSites,old.openCitySites);
    if(old.yellowGold===undefined)old.yellowGold={};
    return old;
  }
  // Hold one origin-wide exclusive Web Lock throughout a browser writer's lifetime.
  const SESSION_KEY=KEY+'-writer',BACKUP_KEY=KEY+'-backup',REQUEST_KEY=KEY+'-handoff',LEASE_MS=15000;
  const browserSession=typeof navigator!=='undefined',locks=browserSession&&navigator.locks;
  let sessionOwner='',observedRaw=null,saveMode='uninitialized',saveReason='',lastSavedAt=0,archiveSerial=0,lockHeld=false,lockRelease=null,lockPending=null,lastOffline=null,lockAbort=null,lockGeneration=0,pendingFinish=null,pendingHandoff=null,handoffSerial=0;
  function ownerId(){if(!sessionOwner){if(typeof crypto!=='undefined'&&crypto.randomUUID)sessionOwner=crypto.randomUUID();else{const counter=Number(localStorage.getItem(KEY+'-session-sequence')||0)+1;localStorage.setItem(KEY+'-session-sequence',String(counter));sessionOwner=Date.now()+'-'+counter;}}return sessionOwner;}
  function storedState(raw){try{if(raw===null)return null;const data=migrateSave(JSON.parse(raw));return validSave(data)?data:null;}catch{return null;}}
  function writer(){const raw=localStorage.getItem(SESSION_KEY);if(!raw)return null;try{const value=JSON.parse(raw);return value&&typeof value.owner==='string'&&Number.isFinite(value.until)?value:null;}catch{return null;}}
  function storageFailure(mode,reason){saveMode=mode;saveReason=reason;return reason;}
  function saveBlockReason(){
    if(onlineAuthority)return '';
    if(saveMode!=='active')return saveReason||'当前页面未取得存档写入权';
    if(browserSession&&!lockHeld)return storageFailure('readonly','本页没有存档写入锁，已暂停操作');
    try{
      const lease=writer();
      if(lease?.owner&&lease.owner!==sessionOwner)return storageFailure('readonly','另一页面已接管城池，本页已暂停，请接管后继续');
      if(localStorage.getItem(KEY)!==observedRaw)return storageFailure('conflict','已保存进度发生变化，本页已暂停，请重新读取最新进度');
      return '';
    }catch{return storageFailure('read-error','无法读取浏览器存储，已暂停操作并保留原存档');}
  }
  function claimWriter(){
    if(browserSession&&!lockHeld)return storageFailure(locks?'starting':'unsupported',locks?'正在读取存档并取得写入权':'此浏览器无法提供独占存档锁，请使用支持 Web Locks 的浏览器；原始数据已保留');
    ownerId();const lease=writer();
    // Headless callers have no Web Locks: refuse foreign ownership even after lease expiry.
    if(!lockHeld&&lease?.owner&&lease.owner!==sessionOwner)return storageFailure('readonly','城池正在另一页面运行，请关闭原页面后重新读取');
    localStorage.setItem(SESSION_KEY,JSON.stringify({owner:sessionOwner,until:Date.now()+LEASE_MS}));
    if(writer()?.owner!==sessionOwner)return storageFailure('readonly','另一页面取得了城池写入权，请重新接管');
    saveMode='active';saveReason='';return '';
  }
  function save(){
    if(state?.realm)for(const id of state.generals)if(state.realm.heroLocations[id]===undefined)state.realm.heroLocations[id]=currentCityId();
    CitySystem.capture(state);
    if(realmSettling||onlineAuthority)return true;
    if(saveBlockReason())return false;
    try{
      const next=JSON.stringify(state);
      localStorage.setItem(SESSION_KEY,JSON.stringify({owner:sessionOwner,until:Date.now()+LEASE_MS}));
      if(saveBlockReason())return false;
      if(next!==observedRaw){if(storedState(observedRaw))localStorage.setItem(BACKUP_KEY,observedRaw);localStorage.setItem(KEY,next);observedRaw=next;}
      lastSavedAt=Date.now();return true;
    }catch{storageFailure('write-error','保存失败，已暂停操作。请导出当前进度后检查浏览器存储');return false;}
  }
  function saveSessionInfo(){
    if(onlineAuthority)return {mode:'active',writable:true,reason:'',lastSavedAt:state.last,hasBackup:false,rawAvailable:true,lockSupported:!!locks,online:true};
    saveBlockReason();let backup=null,rawAvailable=false;
    try{backup=storedState(localStorage.getItem(BACKUP_KEY));rawAvailable=localStorage.getItem(KEY)!==null||localStorage.getItem('sanguo-city-v1')!==null;}catch{}
    return {mode:saveMode,writable:saveMode==='active',reason:saveReason,lastSavedAt,hasBackup:!!backup,backupAt:backup?.last||0,rawAvailable,lockSupported:!!locks};
  }
  function exportStoredRaw(){try{const raw=localStorage.getItem(KEY);return raw===null?(localStorage.getItem('sanguo-city-v1')??''):raw;}catch{throw new Error('无法读取原始存档');}}
  function archiveRaw(raw){if(raw!==null)localStorage.setItem(KEY+'-recovery-'+Date.now()+'-'+sessionOwner+'-'+(++archiveSerial),raw);}
  function replaceSave(data){
    const next=migrateSave(data);if(!validSave(next))throw new Error('Invalid save');
    if(browserSession&&!lockHeld||['readonly','conflict','released','starting','handoff'].includes(saveMode))throw new Error(saveReason||'请先接管最新进度');
    const current=localStorage.getItem(KEY),lease=writer();
    if(!lockHeld&&lease?.owner&&lease.owner!==sessionOwner)throw new Error('城池正在另一页面运行，请先接管');
    if(saveMode==='active'&&current!==observedRaw)throw new Error('存档已变化，请先重新读取最新进度');
    // Explicit import/reset/restore preserves the replaced payload, including invalid or empty data.
    archiveRaw(current);if(storedState(current))localStorage.setItem(BACKUP_KEY,current);
    observedRaw=current;if(claimWriter())throw new Error(saveReason);
    state=next;if(!save())throw new Error(saveReason);init();if(saveMode!=='active')throw new Error(saveReason||'恢复后重新读取失败');
  }
  function restoreSaveBackup(){try{const data=storedState(localStorage.getItem(BACKUP_KEY));if(!data)return '没有可恢复的有效备份';replaceSave(data);return null;}catch(error){return error.message||'备份恢复失败';}}
  function openSaveSession(wait=false){
    if(!locks){lastOffline=init();return Promise.resolve(saveMode==='active'?null:saveReason);}
    if(lockHeld){lastOffline=init();return Promise.resolve(saveMode==='active'?null:saveReason);}
    if(lockPending)return lockPending;
    let finish;const opened=new Promise(resolve=>{finish=resolve;});lockPending=opened;pendingFinish=finish;
    const generation=lockGeneration,controller=wait&&typeof AbortController!=='undefined'?new AbortController():null;lockAbort=controller;
    locks.request(KEY+'-exclusive',{ifAvailable:!wait,...(controller?{signal:controller.signal}:{})},async lock=>{
      if(generation!==lockGeneration){finish('本页已停止等待存档交接');return;}
      if(!lock){storageFailure('readonly','城池正在另一页面运行。本页只读，可接管最新进度');finish(saveReason);return;}
      lockHeld=true;const held=new Promise(resolve=>{lockRelease=resolve;});
      lastOffline=init();finish(saveMode==='active'?null:saveReason);
      await held;
    }).catch(()=>{if(generation!==lockGeneration){finish('本页已停止等待存档交接');return;}storageFailure('lock-error','无法取得存档锁，已暂停操作并保留原始数据');finish(saveReason);});
    opened.then(()=>{if(lockPending===opened){lockPending=null;pendingFinish=null;lockAbort=null;}});return opened;
  }
  function takeOverSaveSession(){
    if(!locks||lockHeld){init();return saveMode==='active'?null:saveReason;}
    if(lockPending)return lockPending;
    try{ownerId();const lease=writer(),id=sessionOwner+'-'+(++handoffSerial);pendingHandoff=id;localStorage.setItem(REQUEST_KEY+'-'+sessionOwner,id);localStorage.setItem(REQUEST_KEY,JSON.stringify({id,requester:sessionOwner,target:lease?.owner||'',at:Date.now()}));storageFailure('handoff','等待另一页面保存并交接，请保持两个页面打开');const opened=openSaveSession(true);opened.then(()=>clearHandoff(id));return opened;}
    catch{return storageFailure('read-error','无法请求存档交接，未覆盖原始数据');}
  }
  function clearHandoff(id=pendingHandoff){if(!id)return;try{if(localStorage.getItem(REQUEST_KEY+'-'+sessionOwner)===id)localStorage.setItem(REQUEST_KEY+'-'+sessionOwner,'');}catch{}if(pendingHandoff===id)pendingHandoff=null;}
  function respondSaveTakeover(){
    if(!lockHeld&&saveMode==='handoff'&&pendingHandoff){try{const lease=writer();localStorage.setItem(REQUEST_KEY,JSON.stringify({id:pendingHandoff,requester:sessionOwner,target:lease?.owner||'',at:Date.now()}));}catch{}return;}
    if(!lockHeld||saveMode!=='active')return;
    try{const request=JSON.parse(localStorage.getItem(REQUEST_KEY)||'null');if(!request||request.requester===sessionOwner||request.target!==sessionOwner||!request.id||localStorage.getItem(REQUEST_KEY+'-'+request.requester)!==request.id)return;
      // A blocked writer must preserve unsaved progress and must not report a successful handoff.
      if(!save())return;
      if(localStorage.getItem(REQUEST_KEY+'-'+request.requester)!==request.id)return;
      releaseSaveSession();storageFailure('readonly','另一页面已请求接管，本页已保存并暂停');
    }catch{}
  }
  function releaseSaveSession(){
    clearHandoff();lockGeneration++;if(lockAbort){lockAbort.abort();lockAbort=null;}if(pendingFinish){pendingFinish('本页已停止等待存档交接');pendingFinish=null;}lockPending=null;
    if(saveMode==='active')save();
    try{if(writer()?.owner===sessionOwner)localStorage.setItem(SESSION_KEY,JSON.stringify({owner:'',until:0}));}catch{}
    if(lockRelease){const release=lockRelease;lockRelease=null;lockHeld=false;release();}
    if(['active','handoff','starting','readonly'].includes(saveMode))storageFailure('released','本页已停止写入，重新读取后可继续');
  }
  function validSave(d,cityScopeOnly=false){
    if(d===state&&!cityScopeOnly)CitySystem.capture(state);
    if(!cityScopeOnly&&!WebEdition.valid(d))return false;
    const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
    const finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
    const integer=n=>finite(n)&&Number.isInteger(n);
    const army=a=>object(a)&&Object.keys(units).every(k=>integer(a[k]))&&Object.keys(a).every(k=>Object.hasOwn(units,k));
    const orders=o=>object(o)&&Object.keys(units).every(id=>object(o[id])&&['advance','hold','fallback'].includes(o[id].command)&&(o[id].target===''||Object.hasOwn(units,o[id].target)));
    const loot=a=>object(a)&&Object.entries(a).every(([k,n])=>Object.hasOwn(resources,k)&&finite(n));
    if(object(d)&&d.yellowGold!==undefined&&(!object(d.yellowGold)||Object.entries(d.yellowGold).some(([id,at])=>!YellowCityData.nodes.some(n=>n.id===id)||!Number.isSafeInteger(at)||at<0)))return false;
    if(!object(d)||!object(d.openCitySites)||Object.keys(d.openCitySites).length!==YellowCityData.allNodes().length||Object.keys(d.openCitySites).some(id=>!YellowCityData.allNodes().some(n=>n.id===id)))return false;
    const reservedSites=new Set([home,...fixedSites].map(p=>p.x+':'+p.y));
    for(const n of YellowCityData.allNodes()){const p=d.openCitySites[n.id];if(!object(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<0||p.y<0||p.x>=WORLD_SIZE||p.y>=WORLD_SIZE||reservedSites.has(p.x+':'+p.y))return false;reservedSites.add(p.x+':'+p.y);}
    const node=id=>!!getNode(id,d);
    const timing=q=>finite(q.start)&&finite(q.end)&&q.end>q.start;
    const frozen=e=>(e.generalSnapshot===undefined||object(e.generalSnapshot)&&e.generalSnapshot.id===e.general&&typeof e.generalSnapshot.name==='string'&&e.generalSnapshot.name.length<=100&&['atk','def','pol','wis','lead'].every(k=>finite(e.generalSnapshot[k])))&&(e.skillProfile===undefined||GeneralGrowth.validProfile(e.skillProfile))&&(e.returnSeconds===undefined||finite(e.returnSeconds)&&e.returnSeconds>=1)&&(e.sourceCity===undefined||!!d.realm?.cities[e.sourceCity]);
    const itemDrops=a=>object(a)&&Object.entries(a).every(([id,n])=>ManualData.shop.some(x=>x.id===id)&&integer(n)&&n>0&&n<=2);
    const tacticReceipt=r=>r.tacticEvents===undefined&&r.tacticPoints===undefined||Array.isArray(r.tacticEvents)&&r.tacticEvents.length<=60&&r.tacticEvents.every(t=>typeof t==='string'&&t.length<=500)&&object(r.tacticPoints)&&Object.keys(r.tacticPoints).length===2&&['player','enemy'].every(side=>integer(r.tacticPoints[side])&&r.tacticPoints[side]<=3);
    const result=r=>object(r)&&tacticReceipt(r)&&(r.returnAfterOccupy===undefined||typeof r.returnAfterOccupy==='boolean')&&(r.failure===undefined||r.failure===null||!r.won&&object(r.failure)&&['retreat','army','gate','enemy','gate_and_enemy'].includes(r.failure.reason)&&integer(r.failure.round)&&r.failure.round<=30&&integer(r.failure.enemyRemaining)&&integer(r.failure.gateHp)&&typeof r.failure.outOfRange==='boolean')&&HeroSystem.wild.validReceipt(r.wildGeneral,d)&&WarOrders.validReceipt(r.warOrder)&&(!r.warOrder||r.won&&(r.node===undefined||r.warOrder.node===r.node))&&(r.resourceReceipt===undefined||object(r.resourceReceipt)&&validReceipt(r.resourceReceipt.base)&&validReceipt(r.resourceReceipt.bonus))&&(r.equipmentDrops===undefined||Array.isArray(r.equipmentDrops)&&r.equipmentDrops.length<=1&&r.equipmentDrops.every(e=>HeroSystem.validEquipment(e,d)))&&(r.equipmentDiscarded===undefined||[0,1].includes(r.equipmentDiscarded))&&(r.prestigeDelta===undefined||Number.isSafeInteger(r.prestigeDelta))&&(r.jewelDrops===undefined||object(r.jewelDrops)&&Object.entries(r.jewelDrops).every(([id,n])=>Progression.jewels[id]&&integer(n)&&n<=2))&&(r.captures===undefined||army(r.captures))&&(r.captureDiscarded===undefined||integer(r.captureDiscarded))&&['raid','occupy'].includes(r.mode)&&typeof r.won==='boolean'&&loot(r.loot)&&(r.itemDrops===undefined||itemDrops(r.itemDrops))&&(r.bonusLoot===undefined||loot(r.bonusLoot))&&(r.bonusDiscarded===undefined||finite(r.bonusDiscarded))&&(r.cargoCapacity===undefined||integer(r.cargoCapacity))&&(r.cargoLoaded===undefined||integer(r.cargoLoaded)&&r.cargoLoaded<=r.cargoCapacity)&&(r.lootDiscarded===undefined||integer(r.lootDiscarded))&&army(r.back)&&army(r.lost)&&army(r.wounded)&&finite(r.xp)&&finite(r.overflow)&&validOverCapacityTotal(r)&&(r.recruit===null||generals.some(g=>g.id===r.recruit));
    const rows=(a,length)=>Array.isArray(a)&&a.length<=12&&new Set(a.map(r=>r.id)).size===a.length&&a.every(r=>object(r)&&Object.hasOwn(units,r.id)&&integer(r.initial)&&r.initial>0&&finite(r.hp)&&object(r.stats)&&['hp','atk','def','range','speed'].every(k=>finite(r.stats[k]))&&r.stats.hp>0&&r.maxHp===r.initial*r.stats.hp&&r.hp<=r.maxHp&&Number.isInteger(r.pos)&&r.pos>=0&&r.pos<=length);
    if(!object(d)||!AutomationSystem.valid(d)||!Progression.valid(d)||d.version!==2||typeof d.autoUpgrade!=='boolean'||typeof d.autoResearch!=='boolean'||typeof d.starterGiftClaimed!=='boolean'||!finite(d.last)||!loot(d.res)||!Object.keys(resources).every(k=>finite(d.res[k]))||!object(d.buildings)||!cityIds.every(k=>Number.isInteger(d.buildings[k])&&d.buildings[k]>=(k==='hall'?1:0)&&d.buildings[k]<=10)||!army(d.army)||!army(d.captives)||Object.entries(d.captives).some(([id,n])=>n>0&&!RewardData.captives.units.includes(id)))return false;
    if(!templateValid(d.plotTemplate)||d.plotTemplate.active&&d.autoUpgrade)return false;
    if(!Array.isArray(d.plots)||d.plots.length!==PLOT_COUNT||!d.plots.every(p=>object(p)&&(p.type===null?p.level===0:Object.hasOwn(plotTypes,p.type)&&Number.isInteger(p.level)&&p.level>=1&&p.level<=NamedCitySystem.profile(d.realm?.cities?.[d.realm.activeCity]).plotMax)))return false;
    if(d.manualSchema!==1||!Array.isArray(d.cityLayout)||d.cityLayout.length!==36||!d.cityLayout.every(id=>id===null||id==='reserved'||cityIds.includes(id))||d.cityLayout.filter(x=>x==='hall').length!==1||d.cityLayout.filter(x=>x==='reserved').length!==3||!Array.isArray(d.cityLevels)||d.cityLevels.length!==36||!d.cityLevels.every((lv,i)=>integer(lv)&&lv<=10&&(d.cityLayout[i]===null||d.cityLayout[i]==='reserved'?lv===0:true)))return false;
    if(![1,10,60].includes(d.speed)||!object(d.tech)||!Object.keys(ManualData.technology).every(id=>integer(d.tech[id])&&d.tech[id]<=10)||!finite(d.population)||!finite(d.morale)||d.morale>100||!finite(d.unrest)||d.unrest>100||!finite(d.gems)||!object(d.inventory)||!Object.entries(d.inventory).every(([id,n])=>ManualData.shop.some(x=>x.id===id)&&integer(n))||!object(d.buffs)||!object(d.itemCooldowns)||!object(d.scouted)||!object(d.landClaims)||!object(d.defenses)||!Object.keys(ManualData.defenses).every(id=>integer(d.defenses[id]))||!Array.isArray(d.defenseQueue)||d.defenseQueue.length>5||!object(d.storageAllocation)||Object.values(d.storageAllocation).reduce((v,n)=>v+n,0)!==100)return false;
    if(!Array.isArray(d.customGenerals)||d.customGenerals.length>100||!Array.isArray(d.innCandidates)||d.innCandidates.length>10||![...d.customGenerals,...d.innCandidates].every(g=>object(g)&&typeof g.id==='string'&&/^local_\d+$/.test(g.id)&&typeof g.name==='string'&&g.name.length<=20&&['atk','def','pol','wis','lead','level','price'].every(k=>finite(g[k]))))return false;
    const knownHero=id=>generals.some(g=>g.id===id)||d.customGenerals.some(g=>g.id===id);
    if(d.researchQueue!==null&&(!object(d.researchQueue)||!Object.hasOwn(ManualData.technology,d.researchQueue.id)||d.researchQueue.level!==d.tech[d.researchQueue.id]+1||!timing(d.researchQueue)))return false;
    if(!orders(d.tactics))return false;
    if(!object(d.raided)||!Object.entries(d.raided).every(([id,v])=>node(id)&&v===true)||!object(d.garrisons)||!object(d.towns))return false;
    const cityNodes=nodes.filter(n=>n.terrain==='fort');if(Object.keys(d.towns).length!==cityNodes.length||Object.keys(d.towns).some(id=>!cityNodes.some(n=>n.id===id)))return false;
    for(const n of cityNodes){const town=d.towns[n.id];if(!object(town)||!Number.isInteger(town.morale)||town.morale < -100||town.morale>100||!integer(town.unrest)||town.unrest>100||!integer(town.population))return false;}
    const stationed=[];
    for(const [id,g] of Object.entries(d.garrisons)){if(!getNode(id,d)?.wild||!d.conquered[id]||!object(g)||!d.generals.includes(g.general)||g.general===d.governor||!army(g.army)||!['stationed','return'].includes(g.phase)||!finite(g.start)||(g.phase==='return'?!timing(g):g.end!==null))return false;stationed.push(g.general);}
    if(new Set(stationed).size!==stationed.length||stationed.includes(d.expedition?.general))return false;
    if(!Array.isArray(d.generals)||d.generals.length<2||!d.generals.includes('lin')||!d.generals.includes('su')||new Set(d.generals).size!==d.generals.length||!d.generals.every(id=>knownHero(id))||(d.governor!==null&&!d.generals.includes(d.governor)))return false;
    if(!object(d.generalLevels)||!object(d.generalXp)||!d.generals.every(id=>integer(d.generalLevels[id])&&d.generalLevels[id]>=1&&d.generalLevels[id]<=10000&&finite(d.generalXp[id])))return false;
    if(!HeroSystem.valid(d))return false;
    if(!OnboardingSystem.valid(d)||!WarOrders.valid(d))return false;
    if(!Number.isInteger(d.tax)||d.tax<0||d.tax>100||!object(d.stats)||!integer(d.stats.trained)||!integer(d.stats.victories)||!object(d.conquered)||!Object.entries(d.conquered).every(([id,v])=>node(id)&&v===true)||!object(d.cooldowns)||!Object.entries(d.cooldowns).every(([id,v])=>node(id)&&finite(v)))return false;
    if(!Array.isArray(d.buildQueue)||d.buildQueue.length>5||new Set(d.buildQueue.map(q=>q.plot===undefined?'city:'+q.site:'plot:'+q.plot)).size!==d.buildQueue.length||!d.buildQueue.every(q=>{
      if(!object(q)||!timing(q)||(q.auto!==undefined&&typeof q.auto!=='boolean')||(q.paidItems!==undefined&&(!object(q.paidItems)||!Object.entries(q.paidItems).every(([id,n])=>id==='blueprint'&&integer(n)&&n<=1))))return false;
      if(q.plot===undefined)return cityIds.includes(q.id)&&integer(q.site)&&q.site<36&&d.cityLayout[q.site]===q.id&&q.level===d.cityLevels[q.site]+1&&q.level<=10;
      if(!integer(q.plot)||q.plot>=PLOT_COUNT||!Object.hasOwn(plotTypes,q.id))return false;const p=d.plots[q.plot];
      return q.kind==='upgrade'?p.type===q.id&&q.level===p.level+1&&q.level<=NamedCitySystem.profile(d.realm?.cities?.[d.realm.activeCity]).plotMax:q.kind==='build'?p.type===null&&q.level===1:q.kind==='replace'&&p.type!==null&&p.type!==q.id&&q.level===1;
    }))return false;
    if(!Array.isArray(d.trainQueue)||d.trainQueue.length>100||!d.trainQueue.every(q=>object(q)&&Object.hasOwn(units,q.id)&&integer(q.count)&&q.count>=1&&q.count<=100000&&timing(q)))return false;
    if(!object(d.civicCooldowns)||!['comfort','levy'].every(k=>finite(d.civicCooldowns[k])))return false;
    if(d.missionSchema!==2||!Array.isArray(d.missionClaims)||new Set(d.missionClaims).size!==d.missionClaims.length||!d.missionClaims.every(id=>missions.some(m=>m.id===id))||!integer(d.starterGiftVersion)||d.starterGiftVersion>2||d.starterGiftClaimed!==(d.starterGiftVersion>0))return false;
    if(!integer(d.mission)||d.mission!==d.missionClaims.length||d.mission>missions.length||!Array.isArray(d.reports)||d.reports.length>20||!d.reports.every(r=>result(r)&&node(r.node)&&finite(r.id)&&integer(r.round)&&knownHero(r.general)))return false;
    if(d.expedition!==null){const e=d.expedition;if(!object(e)||!frozen(e)||!node(e.node)||!d.generals.includes(e.general)||e.general===d.governor||!army(e.army)||!['raid','occupy'].includes(e.mode)||(e.returnAfterOccupy!==undefined&&typeof e.returnAfterOccupy!=='boolean')||!orders(e.orders)||!['march','battle','return'].includes(e.phase)||!timing(e))return false;}
    if(!Array.isArray(d.expeditions)||d.expeditions.length>10||!d.expeditions.every(e=>object(e)&&frozen(e)&&node(e.node)&&d.generals.includes(e.general)&&e.general!==d.governor&&army(e.army)&&['raid','occupy'].includes(e.mode)&&(e.returnAfterOccupy===undefined||typeof e.returnAfterOccupy==='boolean')&&orders(e.orders)&&['march','return'].includes(e.phase)&&timing(e)))return false;
    const deployment=[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)];if(new Set(deployment.map(e=>e.general)).size!==deployment.length)return false;
    if(!['food','wood','stone','iron'].every(k=>integer(d.storageAllocation[k])&&d.storageAllocation[k]<=100)||!Object.values(d.buffs).every(b=>object(b)&&typeof b.effect==='string'&&finite(b.end)&&(b.general===null||d.generals.includes(b.general)))||!Object.values(d.itemCooldowns).every(finite)||!finite(d.trialGiftAt)||typeof d.ruler!=='string'||d.ruler.length>12||typeof d.banner!=='string'||d.banner.length>2)return false;
    if(!d.defenseQueue.every(q=>object(q)&&Object.hasOwn(ManualData.defenses,q.id)&&integer(q.count)&&q.count>0&&q.count<=10000&&timing(q)))return false;
    if(!Object.entries(d.landClaims).every(([id,c])=>getNode(id,d)?.wild&&object(c)&&finite(c.at)&&integer(c.level)&&c.level<=10)||!Object.entries(d.scouted).every(([id,c])=>node(id)&&object(c)&&finite(c.at)&&integer(c.level)&&c.level<=10))return false;
    const roundSummary=(s,b)=>object(s)&&s.round===b.round&&Array.isArray(s.events)&&s.events.length<=150&&s.events.every(e=>object(e)&&['move','strike','recoil','gate','tower'].includes(e.type)&&['player','enemy'].includes(e.side)&&(Object.hasOwn(units,e.unit)||['gate','tower'].includes(e.unit))&&(e.target===''||Object.hasOwn(units,e.target)||['gate','tower'].includes(e.target))&&['from','to','damage'].every(k=>finite(e[k]))&&e.from<=b.length&&e.to<=b.length&&integer(e.killed)&&typeof e.counter==='boolean'&&typeof e.ranged==='boolean'&&(e.type!=='move'||e.damage===0&&e.killed===0)&&(e.type!=='gate'||e.target==='gate'&&e.killed===0)&&(e.type!=='tower'||e.unit==='tower')&&(e.type!=='strike'||Object.hasOwn(units,e.unit)&&Object.hasOwn(units,e.target)));
    if(d.battle!==null){const b=d.battle;const encounter=object(b)&&WarOrders.encounterConfig?.(b.node);if(encounter&&(b.rules!==3||b.stratagem?.version!==2||b.length!==encounter.length))return false;if(object(b)&&b.rules===3&&(!object(b.generalSnapshot)||b.generalSnapshot.id!==b.general||(b.generalSnapshot.wildLine||'')!==((d.customGenerals.find(g=>g.id===b.general)||generals.find(g=>g.id===b.general))?.wildLine||'')||!b.finished&&d.expedition?.generalSnapshot&&(b.generalSnapshot.wildLine||'')!==(d.expedition.generalSnapshot.wildLine||'')||!b.finished&&(b.enemyGeneralSnapshot?.wildLine||'')!==(d.wildGenerals?.rumors.find(r=>r.status==='active'&&r.node===b.node)?.line||'')||!object(b.enemyGeneralSnapshot)||b.enemyGeneralSnapshot.id!=='enemy_'+b.node||typeof b.enemyGeneralSnapshot.name!=='string'||b.enemyGeneralSnapshot.name.length>100||typeof b.enemyGeneralSnapshot.wildLine!=='string'||b.enemyGeneralSnapshot.wildLine.length>40||(b.enemyGeneralSnapshot.encounterIdentity!==undefined&&b.enemyGeneralSnapshot.encounterIdentity!==WarOrders.encounterConfig?.(b.node)?.enemyIdentity)||(WarOrders.encounterConfig?.(b.node)&&b.enemyGeneralSnapshot.encounterIdentity!==WarOrders.encounterConfig(b.node).enemyIdentity)||!object(b.enemyOrders)||Object.keys(b.enemyOrders).length!==b.enemy?.length||!b.enemy?.every(r=>object(b.enemyOrders[r.id])&&['advance','hold','fallback'].includes(b.enemyOrders[r.id].command)&&(b.enemyOrders[r.id].target===''||b.player?.some(p=>p.id===b.enemyOrders[r.id].target)))||b.lesson!==undefined))return false;if(!object(b)||!frozen(b)||!['raid','occupy'].includes(b.mode)||typeof b.siege!=='boolean'||!integer(b.militia)||![2,3].includes(b.rules)||(b.rules===3&&(typeof BattleStratagems==='undefined'||!b.stratagem||!BattleStratagems.valid(b,{units})))||(b.rules===2&&b.stratagem!==undefined)||!integer(b.length)||b.length<200||b.length>10000||!node(b.node)||!(b.finished?knownHero(b.general):d.generals.includes(b.general))||!integer(b.round)||b.round>30||(b.machineGateAttacks!==undefined&&(!integer(b.machineGateAttacks)||b.machineGateAttacks>b.round*2))||(b.currentRoundSummary!==undefined&&!roundSummary(b.currentRoundSummary,b))||typeof b.finished!=='boolean'||typeof b.auto!=='boolean'||!rows(b.player,b.length)||!rows(b.enemy,b.length)||!object(b.orders)||!SiegeSystem.valid(b.gate,getNode(b.node,d),b.mode)||!b.player.every(r=>object(b.orders[r.id])&&['advance','hold','fallback'].includes(b.orders[r.id].command)&&(b.orders[r.id].target===''||b.orders[r.id].target==='gate'&&!!b.gate||Object.hasOwn(units,b.orders[r.id].target)))||!Array.isArray(b.log)||b.log.length>40||!b.log.every(t=>typeof t==='string'&&t.length<1000))return false;if(b.finished?(!result(b.result)||b.result.warOrder&&b.result.warOrder.node!==b.node):!d.expedition||d.expedition.phase!=='battle'||d.expedition.node!==b.node||d.expedition.general!==b.general)return false;}
    if(!HeritageSystem.valid(d)||!NPCDefense.valid(d,units,ManualData.defenses,validReceipt,d.realm?.activeCity))return false;
    if(!GeneralGrowth.valid(d)||!ScoutSystem.valid(d,scoutApi(d))||!RegionalFront.valid(d,d.realm?.cities?.[d.realm.activeCity])||!HeroAdministration.valid(d,{cityId:d.realm?.activeCity}))return false;
    if(!WarCare.valid(d)||!GovernanceSystem.valid(d))return false;
    if(!cityScopeOnly&&(!SupplyLines.valid(d)||!NamedCitySystem.valid(d)))return false;
    if(!cityScopeOnly&&CitySystem.list(d).reduce((sum,c)=>sum+(CitySystem.scope(d,c).regionalFront?.earnedMerit||0),0)>d.warOrders.earned)return false;
    if(!cityScopeOnly&&CitySystem.fields.some(k=>JSON.stringify(d[k])!==JSON.stringify(d.realm?.cities?.[d.realm.activeCity]?.data[k])))return false;
    if(!cityScopeOnly&&!CitySystem.valid(d,(c,scope)=>{
      const n=c.capital?null:getNode(c.node,d);if(!c.capital&&(!n||!d.conquered[c.node]||n.x!==c.x||n.y!==c.y||!(isCity(n)||n.wild&&n.type==='plain')))return false;
      return validSave({...d,...scope,realm:{...d.realm,activeCity:c.id}},true)&&validSave({...d,...c.data,realm:{...d.realm,activeCity:c.id}},true);
    }))return false;
    return true;
  }
  function init(){
    lessonSession=null;
    let raw,legacy;saveMode='uninitialized';saveReason='';
    try{raw=localStorage.getItem(KEY);legacy=raw===null?localStorage.getItem('sanguo-city-v1'):null;observedRaw=raw;
      const payload=raw===null?legacy:raw;state=payload===null?newState():storedState(payload);
      if(!state){state=newState();if(lockHeld)claimWriter();storageFailure('recovery','原始存档无法通过校验，已暂停并保留原始数据');return null;}
      if(claimWriter())return null;CitySystem.activate(state,state.realm.activeCity);
      if(legacy&&!localStorage.getItem(KEY+'-before-manual'))localStorage.setItem(KEY+'-before-manual',legacy);
    }catch{state=state||newState();storageFailure('read-error','读取存档失败，已暂停并保留原始数据。可重新读取或导出');return null;}
    const before={...state.res},elapsed=(Date.now()-state.last)/1000;state.last=Math.min(Date.now(),state.last);tick(Date.now(),false);if(state.battle)state.battle.auto=false;
    const offline=elapsed>60?{seconds:Math.min(elapsed,28800),gain:Object.fromEntries(Object.keys(resources).map(k=>[k,Math.max(0,Math.floor(state.res[k]-before[k]))]))}:null;
    save();return offline;
  }
  function importSave(data){replaceSave(data);lessonSession=null;}
  const totalArmy = a => Object.values(a).reduce((v,n)=>v+n,0);
  const maxPop=()=>state.cityLayout.reduce((v,id,i)=>v+(id==='house'?(buildRecord(id,state.cityLevels[i])?.population||0):0),0);
  const allExpeditions=()=>[...(state.expedition?[state.expedition]:[]),...state.expeditions];
  const armyPeople=a=>Object.entries(a).reduce((v,[id,n])=>v+n*(units[id].people||1),0);
  const sourceLogistics=()=>state.realm.logistics.filter(j=>j.sourceCity===state.realm.activeCity);
  const committed=()=>armyPeople(WarCare.heldArmy(state))+armyPeople(ScoutSystem.heldArmy(state))+sourceLogistics().reduce((v,j)=>v+armyPeople(j.army),0)+armyPeople(NPCDefense.heldArmy(state))+armyPeople(state.army)+allExpeditions().reduce((v,e)=>v+armyPeople(e.army),0)+state.trainQueue.reduce((v,q)=>v+q.count*(units[q.id].people||1),0)+Object.values(state.garrisons).reduce((v,g)=>v+armyPeople(g.army),0);
  function capacity(k){if(!k)return Math.min(...Object.keys(resources).map(capacity));if(k==='gold')return buildRecord('hall',state.buildings.hall)?.capacity||1000000;let total=state.plots.filter(p=>p.type&&plotTypes[p.type].resource===k).reduce((v,p)=>v+buildRecord(p.type,p.level).capacity,0);total+=state.cityLayout.reduce((v,id,i)=>v+(id==='warehouse'?(buildRecord(id,state.cityLevels[i])?.capacity||0)*state.storageAllocation[k]/100:0),0);return Math.max(10000,total)*(1+state.tech.storage*.1);}
  const activeBuff=(id,generalId)=>Object.values(state.buffs).some(b=>b.effect===id&&b.end>(economyClock??Date.now())&&(!generalId||b.general===generalId));
  function productionBoost(){const gov=general(state.governor);return 1+gov.pol/100*Math.min(1,gov.lead*1000/Math.max(1,state.population));}
  const cityStrategy=(city=CitySystem.current(state))=>CityStrategy.profile(city);
  function resourceBonus(resource){let bonus=0;for(const id of Object.keys(state.conquered)){const n=getNode(id);if(!n?.wild||state.realm.wildOwners[id]===state.realm.activeCity)bonus+=n?.bonus?.[resource]||0;}return 1+bonus;}
  function workers(){return state.plots.reduce((v,p)=>v+(p.type?buildRecord(p.type,p.level).workers:0),0);}
  const freePopulation=()=>Math.max(0,Math.floor(state.population)-workers());
  function plotYield(plot){if(!plot?.type)return 0;const cfg=plotTypes[plot.type],labor=Math.min(1,state.population/Math.max(1,workers()));return buildRecord(plot.type,plot.level).output*ECONOMY_OUTPUT_FACTOR/60*productionBoost()*(1+state.tech[cfg.tech]*.1)*resourceBonus(cfg.resource)*labor*cityStrategy().production[cfg.resource];}
  function upkeep(army){return Object.entries(army).reduce((v,[id,n])=>v+(units[id]?.upkeep||0)*n,0);}
  function rates(){let r={food:100/60,wood:100/60,stone:100/60,iron:100/60,gold:state.population*state.tax/100/60};for(const key of Object.keys(r))r[key]*=ECONOMY_OUTPUT_FACTOR*cityStrategy().production[key];for(const p of state.plots)if(p.type)r[plotTypes[p.type].resource]+=plotYield(p);r.food-=(upkeep(WarCare.heldArmy(state))*2+upkeep(ScoutSystem.heldArmy(state))+sourceLogistics().reduce((v,j)=>v+upkeep(j.army),0)+upkeep(NPCDefense.heldArmy(state))+upkeep(state.army)+allExpeditions().reduce((v,e)=>v+upkeep(e.army),0)+Object.values(state.garrisons).reduce((v,g)=>v+upkeep(g.army)*(g.phase==='stationed'?2:1),0))/60;return r;}
  const currentCityId=()=>state.realm.activeCity;
  const domesticStrategyAvailable=()=>!onlineAuthority&&typeof GAME_SERVER_RUNTIME==='undefined';
  const domesticStrategyReason=()=>domesticStrategyAvailable()?'':'当前共享世界暂未开放区域战线、自动补给与主动备防';
  const cityMeta=(id=currentCityId())=>{const c=state.realm.cities[id]||CitySystem.list(state).find(c=>c.node===id);if(!c)return null;const {data,...meta}=c;return {...meta};};
  const currentHome=()=>{const c=cityMeta();return {x:c.x,y:c.y};};
  function setExternalGeneralBusy(ids=[]){if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||state&&!state.generals.includes(id)))return '外部出征将领无效';externalGeneralBusy=new Set(ids);return null;}
  const heroCity=id=>state.realm.heroLocations[id]||'';
  const heroCapacity=(s=state)=>CitySystem.list(s).reduce((sum,c)=>sum+(CitySystem.scope(s,c).buildings.tavern||0),0);
  const cityLimit=()=>HeritageSystem.noble(state).city_count;
  // A quote can inspect another city without ticking, changing its queues or
  // leaving the player's active projection pointed at the source city.
  function withCityScope(id,read){
    if(!state.realm.cities[id])return null;
    CitySystem.capture(state);const selected=currentCityId();CitySystem.activate(state,id);
    try{return read();}finally{CitySystem.capture(state);CitySystem.activate(state,selected);}
  }
  const citySummary=id=>{const c=state.realm.cities[id];if(!c)return null;const d=CitySystem.scope(state,c),net=withCityScope(id,rates),foodSeconds=net.food<0?Math.max(0,Math.floor(d.res.food/-net.food*60)):null;return {...cityMeta(id),strategy:cityStrategy(c),res:{...d.res},army:{...d.army},buildings:{...d.buildings},governor:d.governor,population:d.population,tax:d.tax,rates:net,foodSeconds,regionalFront:CitySystem.clone(d.regionalFront),heroAdministration:CitySystem.clone(d.heroAdministration),queues:{build:d.buildQueue.length,train:d.trainQueue.length,research:d.researchQueue?1:0},garrisons:CitySystem.clone(d.garrisons),expeditions:CitySystem.clone([...(d.expedition?[d.expedition]:[]),...d.expeditions]),scoutQueue:CitySystem.clone(d.scoutQueue)};};
  const cityList=()=>CitySystem.list(state).map(c=>citySummary(c.id));
  const getCityState=(id=currentCityId())=>{const c=state.realm.cities[id];return c?CitySystem.clone(CitySystem.scope(state,c)):null;};
  const everyExpedition=()=>CitySystem.list(state).flatMap(c=>{const d=CitySystem.scope(state,c);return [...(d.expedition?[d.expedition]:[]),...d.expeditions].map(e=>({...e,sourceCity:c.id}));});
  function switchCity(id){if(!state.realm.cities[id])return '城市不存在';tick(Date.now(),false);CitySystem.capture(state);CitySystem.activate(state,id);save();return null;}
  const enterOwnedCity=nodeId=>switchCity(CitySystem.idFor(nodeId));
  function foundCityQuote(nodeId,name='新城'){
    const n=getNode(nodeId),cost={food:10000,wood:10000,stone:10000,iron:10000,gold:5000};name=typeof name==='string'?name.trim():'';
    const reason=!n?.wild||n.type!=='plain'?'只能在平地上筑城':!state.conquered[nodeId]?'请先占领这块平地':state.realm.wildOwners[nodeId]!==currentCityId()?'请切换至这块野地的所属城市':state.realm.cities[CitySystem.idFor(nodeId)]?'这里已经建城':cityList().length>=cityLimit()?'城池名额已满':state.garrisons[nodeId]||state.gatherings[nodeId]?'请先收回驻军并结束采集':!name||name.length>12?'城市名称需要 1–12 个字':!canPay(cost)?'本城建城资源不足':'';
    return {node:nodeId,name,cost,reason,sourceCity:currentCityId(),key:JSON.stringify([currentCityId(),nodeId,name,cityLimit(),cityList().length,state.realm.wildOwners[nodeId],!!state.garrisons[nodeId]])};
  }
  function foundCity(nodeId,name,key){tick(Date.now(),false);const q=foundCityQuote(nodeId,name);if(key!==q.key)return '建城条件已变化，请重新预览';if(q.reason)return q.reason;pay(q.cost);const n={...getNode(nodeId),name:q.name};state.realm.cities[CitySystem.idFor(nodeId)]=CitySystem.empty(state,n,Date.now());delete state.realm.wildOwners[nodeId];save();return null;}
  const logisticsList=()=>CitySystem.clone(state.realm.logistics);
  function logisticsQuote(kind,destination,army,cargo={},generalId=''){
    const source=cityMeta(),target=cityMeta(destination),selected=blankArmy(),load=Object.fromEntries(Object.keys(resources).map(k=>[k,0]));let reason='';
    if(!target||target.id===source.id)reason='请选择另一座治下城市';
    if(!army||typeof army!=='object'||Array.isArray(army)||Object.keys(army).some(id=>!units[id]))reason='部队格式无效';
    for(const id of Object.keys(units)){const n=army?.[id]??0;if(!Number.isSafeInteger(n)||n<0||n>state.army[id])reason='本城可派遣兵力不足';else selected[id]=n;}
    if(!totalArmy(selected))reason='至少派出 1 名士兵';else if(totalArmy(selected)>armyLimit())reason='超过校场单队人数上限';
    if(!cargo||typeof cargo!=='object'||Array.isArray(cargo)||Object.keys(cargo).some(id=>!resources[id]))reason='运送资源格式无效';
    for(const id of Object.keys(resources)){const n=cargo?.[id]??0;if(!Number.isSafeInteger(n)||n<0||n>state.res[id])reason='运送资源超过本城库存';else load[id]=n;}
    const distance=target?Math.hypot(target.x-source.x,target.y-source.y):0,speed=Math.min(...Object.keys(units).filter(id=>selected[id]>0).map(id=>unitStats(id).speed)),carryLimit=carry(selected),baseSeconds=Math.max(1,Math.ceil((8+distance*2)*units.archer.speed/Math.max(1,Number.isFinite(speed)?speed:1)/state.speed/marchSkillFactor(selected,generalId))),strategy=cityStrategy(source),seconds=CityStrategy.marchSeconds(baseSeconds,source),baseFoodCost=Math.ceil(totalArmy(selected)*1.2+distance*2),administrationFactor=domesticStrategyAvailable()?HeroAdministration.transportFactor(state,general(state.governor),kind,{generalBusy,cityId:currentCityId()}):1,foodCost=Math.ceil(baseFoodCost*administrationFactor),loaded=Object.values(load).reduce((v,n)=>v+n,0);
    if(kind==='transport'&&!loaded)reason='请选择运送资源';else if(loaded>carryLimit)reason='运送资源超过部队负重';
    if(state.buildings.drill<1)reason='请先建造校场';else if(kind==='transport'&&state.buildings.market<1)reason='运输需要本城市场 1 级';
    if(typeof generalId!=='string'||generalId&&(!state.generals.includes(generalId)||generalBusy(generalId)||HeritageSystem.roleOf(state,generalId)))reason='随行将领需要留在本城且未任职';
    if(state.realm.logistics.length>=100)reason='在途队伍已满';else if(state.res.food<foodCost+load.food)reason='运送粮食与行军粮合计超过本城库存';
    if(target&&Object.keys(resources).some(id=>state.realm.cities[target.id].data.res[id]+load[id]+state.realm.logistics.filter(j=>j.destinationCity===target.id&&!j.delivered&&!j.cancelled).reduce((v,j)=>v+j.cargo[id],0)>Number.MAX_SAFE_INTEGER))reason='目的城市的资源数量已达数值上限';
    if(target&&kind==='redeploy'&&Object.keys(units).some(id=>state.realm.cities[target.id].data.army[id]+selected[id]>Number.MAX_SAFE_INTEGER))reason='目的城市的兵力已达数值上限';
    const q={kind,sourceCity:source.id,destinationCity:target?.id||destination,origin:{x:source.x,y:source.y},target:target?{x:target.x,y:target.y}:null,army:selected,cargo:load,general:generalId,distance,seconds,baseSeconds,marchFactor:strategy.marchFactor,cityStrategy:strategy,baseFoodCost,administrationFactor,foodCost,carry:carryLimit,reason};q.key=JSON.stringify([q.kind,q.sourceCity,q.destinationCity,q.army,q.cargo,q.general,q.seconds,q.foodCost,state.realm.logistics.length]);return q;
  }
  const transportQuote=(destination,army,cargo,generalId='')=>logisticsQuote('transport',destination,army,cargo,generalId);
  const redeployQuote=(destination,army,generalId='')=>logisticsQuote('redeploy',destination,army,{},generalId);
  function commitLogistics(q,start,supplyLine){
    for(const id of Object.keys(units))state.army[id]-=q.army[id];for(const id of Object.keys(resources))state.res[id]-=q.cargo[id];state.res.food-=q.foodCost;if(q.general)state.realm.heroLocations[q.general]='transit';
    const job={id:'logistics_'+(++state.realm.logisticsSeq),kind:q.kind,sourceCity:q.sourceCity,destinationCity:q.destinationCity,origin:q.origin,target:q.target,army:q.army,cargo:q.cargo,general:q.general,phase:'outbound',start,end:start+q.seconds*1000,seconds:q.seconds,foodCost:q.foodCost,delivered:false,cancelled:false};
    if(supplyLine)job.supplyLine=supplyLine;state.realm.logistics.push(job);return job;
  }
  function sendLogistics(kind,destination,army,cargo,generalId,key){tick(Date.now(),false);const q=logisticsQuote(kind,destination,army,cargo,generalId);if(q.key!==key)return '派遣条件已变化，请重新预览';if(q.reason)return q.reason;commitLogistics(q,Date.now());save();return null;}
  const sendTransport=(destination,army,cargo,generalId='',key)=>sendLogistics('transport',destination,army,cargo,generalId,key);
  const redeployArmy=(destination,army,generalId='',key)=>sendLogistics('redeploy',destination,army,{},generalId,key);
  function recallLogistics(id){tick(Date.now(),false);const j=state.realm.logistics.find(j=>j.id===id);if(!j)return '队伍已经抵达或返回';if(j.phase!=='outbound')return '队伍已在返程';const now=Date.now(),elapsed=Math.max(1000,now-j.start);j.phase='return';j.start=now;j.end=now+elapsed;j.cancelled=true;SupplyLines.pauseForRecall(state,j);save();return null;}
  function supplyApi(now=Date.now()){
    return {getCity:id=>{const c=state.realm.cities[id];return c?{...cityMeta(id),...CitySystem.scope(state,c)}:null;},quoteFrom:(source,destination,army,cargo)=>withCityScope(source,()=>transportQuote(destination,army,cargo)),send:(plan,line)=>withCityScope(line.sourceCity,()=>{const q=transportQuote(line.destinationCity,line.army,plan.cargo);if(q.reason)return q.reason;if(q.key!==plan.quote.key)return '运输条件已变化，等待下次检查';commitLogistics(q,now,line.id);return null;})};
  }
  const supplyLines=()=>SupplyLines.list(state,supplyApi());
  const supplyLineQuote=draft=>{const q=SupplyLines.quote(state,draft,supplyApi());return domesticStrategyAvailable()?q:{...q,reason:domesticStrategyReason()};};
  function saveSupplyLine(draft,key){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const error=SupplyLines.set(state,draft,key,supplyApi());if(!error){tick();save();}return error;}
  function setSupplyLineEnabled(id,enabled){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const error=SupplyLines.setEnabled(state,id,enabled);if(!error){tick();save();}return error;}
  function removeSupplyLine(id){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const error=SupplyLines.remove(state,id);if(!error)save();return error;}
  function settleLogistics(now){
    const remove=new Set();for(const j of state.realm.logistics){if(j.end>now)continue;const source=state.realm.cities[j.sourceCity].data,target=state.realm.cities[j.destinationCity].data;
      if(j.phase==='outbound'){
        if(j.kind==='redeploy'){for(const id of Object.keys(units))target.army[id]+=j.army[id];if(j.general)state.realm.heroLocations[j.general]=j.destinationCity;remove.add(j.id);}
        else{if(!j.delivered){for(const id of Object.keys(resources))target.res[id]+=j.cargo[id];j.delivered=true;}j.phase='return';j.start=j.end;j.end+=j.seconds*1000;}
        state.realm.logisticsReports.unshift({id:j.id,kind:j.kind,sourceCity:j.sourceCity,destinationCity:j.destinationCity,at:j.start,text:j.kind==='redeploy'?'部队已到达目的城':'资源已到达目的城，允许爆仓；运输队返城'});
      }
      if(j.phase==='return'&&j.end<=now){for(const id of Object.keys(units))source.army[id]+=j.army[id];if(j.cancelled)for(const id of Object.keys(resources))source.res[id]+=j.cargo[id];if(j.general)state.realm.heroLocations[j.general]=j.sourceCity;remove.add(j.id);}
    }state.realm.logistics=state.realm.logistics.filter(j=>!remove.has(j.id));state.realm.logisticsReports=state.realm.logisticsReports.slice(0,30);
  }
  function tick(now=Date.now(),allowAutomation=true,settleAtSameTime=false){
    if(onlineAuthority||realmSettling||saveBlockReason())return;WildFields.sync(api,now);WebEdition.sync();CitySystem.capture(state);const selected=currentCityId();
    const scouts=CitySystem.list(state).flatMap(c=>CitySystem.scope(state,c).scoutQueue.flatMap(j=>[j.end,...(j.phase==='out'?[j.end+j.returnSeconds*1000]:[])]));
    const capStart=now-28800000,salaryFrom=Math.max(state.heroService.lastPay,capStart),salaryBounds=Array.from({length:Math.max(0,Math.floor((now-salaryFrom)/GovernanceSystem.HOUR))},(_,i)=>salaryFrom+(i+1)*GovernanceSystem.HOUR);
    const bounds=[...new Set([...salaryBounds,...scouts.filter(end=>end<=now),...state.realm.logistics.flatMap(j=>[j.end,...(j.kind==='transport'&&j.phase==='outbound'?[j.end+j.seconds*1000]:[])]).filter(end=>end<=now),now])].sort((a,b)=>a-b);realmSettling=true;
    try{for(const end of bounds){for(const c of CitySystem.list(state)){CitySystem.activate(state,c.id);tickCity(end,allowAutomation&&end===now,settleAtSameTime,capStart);CitySystem.capture(state);}settleLogistics(end);CitySystem.activate(state,selected);GovernanceSystem.tickHeroes(state,end,{capStart,busy:id=>externalGeneralBusy.has(id)||state.realm.logistics.some(j=>j.general===id)||CitySystem.list(state).some(c=>{const d=CitySystem.scope(state,c);return d.cityDefense.battle?.general===id||[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)].some(e=>e.general===id);})});CitySystem.capture(state);}if(allowAutomation&&domesticStrategyAvailable())SupplyLines.run(state,supplyApi(now));}finally{CitySystem.activate(state,selected);realmSettling=false;}
  }
  function scoutApi(s=state){const c=s.realm?.cities?.[s.realm.activeCity];return {units,getNode,origin:{x:c?.x??32,y:c?.y??32},scoutSpeed:()=>units.scout.speed*(1+(s.tech.riding||0)*.05)/cityStrategy(c).marchFactor,canScout:(d,n)=>n.chapter===3&&!ChapterData.unlocked(d,3)?ChapterData.blocked(d,n.id):d===state&&!landmarkVisible(n.id)?'此任务据点尚未开启':'',enemyArmy:(d,n)=>n.army,record:(d,kind)=>Progression.record(d,kind)};}
  const scoutQuote=(node,count=1)=>ScoutSystem.quote(state,node,count,Date.now(),scoutApi());
  function dispatchScout(node,count=1,key){tick(Date.now(),false);const error=ScoutSystem.dispatch(state,node,count,Date.now(),scoutApi(),key);if(!error)save();return error;}
  function trainGeneralSkill(id,route,key){tick(Date.now(),false);const error=GeneralGrowth.train(state,id,route,key,{generalBusy});if(!error)save();return error;}
  function applyOnlineSnapshot(snapshot){const candidate=migrateSave(snapshot);if(!validSave(candidate))return '服务器存档无法通过校验';state=candidate;CitySystem.activate(state,state.realm.activeCity);return null;}
  function enterOnlineSession(snapshot){const candidate=migrateSave(snapshot);if(!validSave(candidate))return '服务器存档无法通过校验';if(!onlineAuthority){CitySystem.capture(state);offlineSnapshot=CitySystem.clone(state);releaseSaveSession();}lessonSession=null;onlineAuthority=true;state=candidate;CitySystem.activate(state,state.realm.activeCity);return null;}
  async function leaveOnlineSession(){if(!onlineAuthority)return null;onlineAuthority=false;state=offlineSnapshot||newState();offlineSnapshot=null;return openSaveSession();}
  function tickCity(now=Date.now(),allowAutomation=true,settleAtSameTime=false,accrualFloor=now-28800000){
    if(saveBlockReason())return;
    if(now<=state.last&&!settleAtSameTime){Progression.ensureDaily(state,now);NPCDefense.tick(state,now);ScoutSystem.tick(state,now,scoutApi());WarCare.tick(state,now);if(allowAutomation){processPlotTemplate();processAutoUpgrade();processAutoResearch();}return;}
    const start=Math.max(state.last,accrualFloor);
    // Settle queues in timestamp order so offline buildings only boost production after completion.
    const events=[...state.buildQueue.map(q=>({q,type:'build'})),...state.trainQueue.map(q=>({q,type:'train'})),...(state.researchQueue?[{q:state.researchQueue,type:'research'}]:[]),...state.defenseQueue.map(q=>({q,type:'defense'})),...allExpeditions().filter(q=>q.phase==='return').map(q=>({q,type:'expeditionReturn'})),...Object.entries(state.garrisons).filter(([,q])=>q.phase==='return').map(([id,q])=>({q,id,type:'garrisonReturn'})),...Object.values(state.buffs).map(q=>({q,type:'buffExpire'}))].filter(e=>e.q.end<=now).sort((a,b)=>a.q.end-b.q.end);
    let cursor=start;
    function accrue(end){while(cursor<end){const next=Math.min(end,cursor+30000),dt=(next-cursor)/60000;economyClock=cursor;const r=rates();for(const k of Object.keys(resources)){if(r[k]<0)state.res[k]=Math.max(0,state.res[k]+r[k]*dt);else if(state.res[k]<capacity(k))state.res[k]=Math.min(capacity(k),state.res[k]+r[k]*dt);}const change=dt*state.speed/6,target=GovernanceSystem.moraleTarget(state);state.morale+=Math.sign(target-state.morale)*Math.min(Math.abs(target-state.morale),change);const popTarget=maxPop()*state.morale/100;state.population=Math.max(0,Math.min(maxPop(),state.population+Math.sign(popTarget-state.population)*Math.min(Math.abs(popTarget-state.population),Math.max(1,maxPop()*.01)*dt*state.speed)));GovernanceSystem.tickCity(state,next);cursor=next;}economyClock=null;}

    for(const e of events){accrue(Math.max(start,e.q.end));const xp=e.type==='build'&&state.governor?HeroSystem.constructionXp(e.q.level):0;if(['build','train','research','defense'].includes(e.type))AutomationSystem.record(state,e.type,e.q,e.q.end,xp?' · 城守 '+general(state.governor).name+' 经验 +'+xp:'');if(e.type==='build'){if(e.q.plot!==undefined)state.plots[e.q.plot]={type:e.q.id,level:e.q.level};else{state.cityLevels[e.q.site]=e.q.level;refreshBuildings();}state.buildQueue=state.buildQueue.filter(q=>q!==e.q);if(state.governor)HeroSystem.addXp(state,state.governor,xp);state.prestige+=e.q.level*50;Progression.record(state,'build',1,e.q.end);Progression.record(state,e.q.plot!==undefined?'field_build':'city_build',1,e.q.end);}else if(e.type==='train'){state.army[e.q.id]+=e.q.count;state.stats.trained+=e.q.count;state.prestige+=Math.ceil(e.q.count/5);Progression.record(state,'train',e.q.count,e.q.end);Progression.record(state,'train_'+e.q.id,e.q.count,e.q.end);state.trainQueue=state.trainQueue.filter(q=>q!==e.q);}else if(e.type==='research'){state.tech[e.q.id]=e.q.level;state.researchQueue=null;state.prestige+=e.q.level*100;Progression.record(state,'research',1,e.q.end);const category=Progression.researchMetric(e.q.id);if(category)Progression.record(state,'research_'+category,1,e.q.end);}else if(e.type==='defense'){state.defenses[e.q.id]+=e.q.count;Progression.record(state,'defense',e.q.count,e.q.end);state.defenseQueue=state.defenseQueue.filter(q=>q!==e.q);}else if(['expeditionReturn','garrisonReturn'].includes(e.type)){for(const [id,n] of Object.entries(e.q.army))state.army[id]+=n;if(e.type==='garrisonReturn')delete state.garrisons[e.id];else if(state.expedition===e.q)state.expedition=null;else state.expeditions=state.expeditions.filter(q=>q!==e.q);}}
    accrue(now);state.last=now;Progression.ensureDaily(state,now);
    for(const [id,g] of Object.entries(state.garrisons))if(g.phase==='return'&&g.end<=now){for(const [k,n] of Object.entries(g.army))state.army[k]+=n;delete state.garrisons[id];}
    if(state.expedition?.phase==='return'&&state.expedition.end<=now){for(const [k,n] of Object.entries(state.expedition.army))state.army[k]+=n;state.expedition=null;}
    for(const e of [...state.expeditions])if(e.phase==='return'&&e.end<=now){for(const [k,n] of Object.entries(e.army))state.army[k]+=n;state.expeditions=state.expeditions.filter(x=>x!==e);}
    if(!state.expedition&&state.expeditions.length&&(!state.battle||state.battle.finished))state.expedition=state.expeditions.shift();
    NPCDefense.tick(state,now);ScoutSystem.tick(state,now,scoutApi());WarCare.tick(state,now);if(allowAutomation){processPlotTemplate();processAutoUpgrade();processAutoResearch();}
  }
  function canPay(cost){return Object.entries(cost).every(([k,v])=>state.res[k]>=v);}
  function pay(cost){for(const [k,v] of Object.entries(cost))state.res[k]-=v;}
  // The same per-resource capacity calculation powers settlement and dispatch estimates.
  function storageQuote(loot,stock=state.res,allowOverCapacity=false){
    const rows=Object.entries(loot).map(([id,amount])=>{const limit=capacity(id),room=Math.max(0,limit-stock[id]),received=Math.min(amount,allowOverCapacity?Math.max(0,Number.MAX_SAFE_INTEGER-stock[id]):room);return {id,amount,stock:stock[id],limit,room,received,overflow:amount-received,overCapacity:Math.max(0,received-room)};});
    return {rows,received:rows.reduce((sum,row)=>sum+row.received,0),overflow:rows.reduce((sum,row)=>sum+row.overflow,0),overCapacity:rows.reduce((sum,row)=>sum+row.overCapacity,0)};
  }
  function settleLoot(loot,allowOverCapacity=false){const quote=storageQuote(loot,state.res,allowOverCapacity);for(const row of quote.rows)state.res[row.id]+=row.received;return {loaded:{...loot},received:Object.fromEntries(quote.rows.map(r=>[r.id,r.received])),overflow:Object.fromEntries(quote.rows.map(r=>[r.id,r.overflow])),...(allowOverCapacity?{overCapacity:Object.fromEntries(quote.rows.map(r=>[r.id,r.overCapacity]))}:{})};}
  function validReceipt(receipt){
    const object=x=>x&&typeof x==='object'&&!Array.isArray(x),finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
    if(!object(receipt)||!['loaded','received','overflow'].every(key=>object(receipt[key])&&Object.entries(receipt[key]).every(([id,n])=>Object.hasOwn(resources,id)&&finite(n))))return false;
    const ids=Object.keys(receipt.loaded);return ['received','overflow'].every(key=>Object.keys(receipt[key]).length===ids.length&&ids.every(id=>Object.hasOwn(receipt[key],id)))&&(receipt.overCapacity===undefined||object(receipt.overCapacity)&&Object.keys(receipt.overCapacity).length===ids.length&&ids.every(id=>Object.hasOwn(receipt.overCapacity,id)&&finite(receipt.overCapacity[id])&&receipt.overCapacity[id]<=receipt.received[id]))&&ids.every(id=>Math.abs(receipt.loaded[id]-receipt.received[id]-receipt.overflow[id])<1e-6);
  }
  function validOverCapacityTotal(result){
    if(result.overCapacity===undefined)return true;
    const base=result.resourceReceipt?.base?.overCapacity,bonus=result.resourceReceipt?.bonus?.overCapacity;
    return Number.isFinite(result.overCapacity)&&result.overCapacity>=0&&result.overCapacity<=Number.MAX_SAFE_INTEGER&&base!==undefined&&bonus!==undefined&&Math.abs(result.overCapacity-Object.values(base).reduce((sum,n)=>sum+n,0)-Object.values(bonus).reduce((sum,n)=>sum+n,0))<1e-6;
  }
  const receiptOverflow=r=>Object.values(r.overflow).reduce((sum,n)=>sum+n,0);
  function addRes(loot){return receiptOverflow(settleLoot(loot));}
  const administrationApi=()=>({generalBusy,cityId:currentCityId()});
  const heroAdministrationQuote=id=>{const q=HeroAdministration.prepareQuote(state,general(id),currentCityId(),Date.now(),administrationApi());return domesticStrategyAvailable()?q:{...q,ok:false,reason:domesticStrategyReason()};};
  function prepareHeroAdministration(id,key){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const result=HeroAdministration.prepare(state,general(id),currentCityId(),Date.now(),key,administrationApi());if(result.ok)save();return result.ok?null:result.reason;}
  const regionFrontQuote=(level)=>{const q=RegionalFront.quote(state,cityMeta(),Date.now(),level);return q&&!domesticStrategyAvailable()?{...q,reason:domesticStrategyReason()}:q;};
  const regionalFrontStatus=(cityId=currentCityId())=>withCityScope(cityId,()=>{const q=regionFrontQuote();return q?{...q,run:CitySystem.clone(state.regionalFront.run),ledger:CitySystem.clone(state.regionalFront)}:null;});
  function startRegionalFront(level,key){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const now=Date.now(),error=RegionalFront.start(state,cityMeta(),now,key,{requestRegional:m=>NPCDefense.requestRegional(state,now,m)},level);if(!error)save();return error;}
  const defenseApi=()=>({units,defenses:ManualData.defenses,unitStats,general,generalBusy,settleLoot:loot=>settleLoot(loot,!!state.cityDefense.battle?.front),capLoot,carry,consumeAdministrationDefense:(_selected,drill)=>domesticStrategyAvailable()?HeroAdministration.consumeDefense(state,general(state.governor),currentCityId(),drill,administrationApi()):null,addXp:(id,xp)=>HeroSystem.addXp(state,id,xp)});
  function requestCityDefense(profile='classic',level,key){tick();const error=NPCDefense.requestChallenge(state,Date.now(),profile,level,key);if(!error)save();return error;}
  function setAutoCityDefense(enabled){tick();const error=NPCDefense.setAutomatic(state,Date.now(),enabled);if(!error)save();return error;}
  function startCityDefense(drill=false,generalId=state.governor,army){if(state.cityDefense.incoming?.front&&!domesticStrategyAvailable())return domesticStrategyReason();tick();const error=NPCDefense.begin(state,defenseApi(),Date.now(),drill,generalId,army);if(!error&&state.cityDefense.battle?.front)RegionalFront.markBattle(state,state.cityDefense.battle);if(!error&&state.cityDefense.battle?.doctrine?.autoResolve){const result=resolveCityDefense();return typeof result==='string'?result:null;}save();return error;}
  function cityDefenseRound(){if((state.cityDefense.battle?.front||state.cityDefense.battle?.administrationDefense)&&!domesticStrategyAvailable())return domesticStrategyReason();tick();const now=Date.now(),result=NPCDefense.round(state,defenseApi(),now);if(result&&typeof result==='object'&&result.front){const error=RegionalFront.settle(state,result,now,{addMerit:points=>{state.warOrders.merit+=points;state.warOrders.earned+=points;}});if(error)return error;}save();return result;}
  function endDefenseDrill(){const error=NPCDefense.endDrill(state);save();return error;}
  function buildRecord(id,level){return level>10&&Object.hasOwn(plotTypes,id)?NamedCitySystem.fieldRecord(id,level,buildings[id]):level>0?buildings[id]?.rows[level-1]:null;}
  const plotMaxLevel=()=>NamedCitySystem.profile(cityMeta()).plotMax;
  function refreshBuildings(){for(const id of cityIds)state.buildings[id]=Math.max(0,...state.cityLayout.map((type,i)=>type===id?state.cityLevels[i]:0));}
  const primarySite=id=>state.cityLayout.indexOf(id);
  const buildLimit=()=>activeBuff('labor')?5:2;
  function buildSeconds(id,level){const referenceSeconds=buildRecord(id,level).seconds||600,seconds=id==='hall'&&OnboardingData.hallBuildSeconds?OnboardingData.hallBuildSeconds(level,referenceSeconds):referenceSeconds;return Math.max(1,seconds/(1+state.tech.construction*.1+general(state.governor).pol/100)/state.speed);}
  function completeFirstBattleGuide(){tick(Date.now(),false);const error=OnboardingSystem.completeFirstBattle(state);save();return error;}
  function upgradeCost(id){const site=typeof id==='number'?id:primarySite(id),type=typeof id==='number'?state.cityLayout[site]:id,level=state.cityLevels[site]||0;return buildRecord(type,level+1)?.cost||{};}
  function queueBuilding(site,id){tick(Date.now(),false);return enqueueBuilding(site,id);}
  function requirementLevel(id){return Object.hasOwn(plotTypes,id)?Math.max(0,...state.plots.filter(p=>p.type===id).map(p=>p.level)):state.buildings[id]||0;}
  function requirementsText(list,onlyMissing=true){return list.filter(r=>!onlyMissing||(r.kind==='building'?requirementLevel(r.id):r.kind==='tech'?state.tech[r.id]:state.inventory[r.id]||0)<r.level).map(r=>r.kind==='item'?'消耗 '+ManualData.shop.find(i=>i.id===r.id).name+' ×'+r.level:(r.kind==='building'?buildings[r.id].name:ManualData.technology[r.id].name)+' '+r.level+' 级').join('、');}
  function buildingConditions(id,level){const list=[...(ReferenceRules.buildingConditions[id]?.[level]||[])];if(id==='wall')list.unshift({kind:'building',id:'hall',level:2});if(Object.hasOwn(plotTypes,id)&&level>10)list.unshift({kind:'building',id:'hall',level:10});return list;}
  function buildingRequirements(id,level=1){return requirementsText(buildingConditions(id,level));}
  function buildingRuleText(id,level){return requirementsText(buildingConditions(id,level),false);}
  function payBuildingItems(id,level){const paid={};for(const r of buildingConditions(id,level).filter(r=>r.kind==='item')){state.inventory[r.id]-=r.level;paid[r.id]=(paid[r.id]||0)+r.level;}return paid;}
  function researchRequirements(id){return requirementsText(ReferenceRules.researchConditions[id]?.[state.tech[id]+1]||[]);}
  function researchRuleText(id){return requirementsText(ReferenceRules.researchConditions[id]?.[state.tech[id]+1]||[],false);}
  function defenseCapacity(){return ReferenceRules.wallRows.find(r=>r.level===state.buildings.wall)?.area||0;}
  function defenseUsed(){return Object.entries(NPCDefense.heldDefenses(state)).reduce((v,[id,n])=>v+n*(ManualData.defenses[id].area||1),0)+Object.entries(state.defenses).reduce((v,[id,n])=>v+n*(ManualData.defenses[id].area||1),0)+state.defenseQueue.reduce((v,q)=>v+q.count*(ManualData.defenses[q.id].area||1),0);}
  function defenseRequirements(id,count=1){const d=ManualData.defenses[id];return requirementsText(d?.requires||[])||(defenseUsed()+count*(d?.area||1)>defenseCapacity()?'城防空间不足':'');}
  function enqueueBuilding(site,id){if(!Number.isInteger(site)||site<0||site>=36||!cityIds.includes(id)||state.cityLayout[site]==='reserved')return '请选择城内空地';const requirement=buildingRequirements(id,(state.cityLevels[site]||0)+1);if(requirement)return requirement;const current=state.cityLayout[site],level=state.cityLevels[site]||0;if(current&&current!==id)return '这块地已有其他建筑';if(!current&&!buildings[id].repeat&&state.cityLayout.includes(id))return '该建筑在本城只能建一座';if(level>=10)return '本城建筑最高 10 级';if(state.buildQueue.length>=buildLimit())return '建造队正在忙碌';if(state.buildQueue.some(q=>q.site===site))return '该建筑正在施工';const cost=buildRecord(id,level+1).cost;if(!canPay(cost))return '建设资源不足';pay(cost);state.cityLayout[site]=id;const start=Date.now();state.buildQueue.push({id,site,paidItems:payBuildingItems(id,level+1),kind:level?'upgrade':'build',level:level+1,paid:{...cost},start,end:start+buildSeconds(id,level+1)*1000});save();return null;}
  function upgrade(id){const site=typeof id==='number'?id:primarySite(id);return site<0?'请先在城内空地建造':queueBuilding(site,state.cityLayout[site]);}
  const unlockedPlots=()=>Math.min(PLOT_COUNT,Math.max(12+(state.buildings.hall-1)*3,1+state.plots.findLastIndex(p=>p.type!==null)));
  const plotJob=index=>state.buildQueue.find(q=>q.plot===index);
  function plotCost(index,type){const p=state.plots[index];return buildRecord(type,p?.type===type?p.level+1:1)?.cost||{};}
  function plotTime(index,type){const p=state.plots[index];return buildSeconds(type,p.type===type?p.level+1:1);}
  function developPlot(index,type){tick(Date.now(),false);const error=enqueuePlot(index,type);if(!error){state.plotTemplate.active=false;save();}return error;}
  function enqueuePlot(index,type){if(!Number.isInteger(index)||index<0||index>=unlockedPlots())return '升级官府后可开垦这块土地';if(!Object.hasOwn(plotTypes,type))return '请选择资源产业';if(plotJob(index))return '该地块正在施工';if(state.buildQueue.length>=buildLimit())return '建造队正在忙碌';const p=state.plots[index],same=p.type===type;if(same&&p.level>=plotMaxLevel())return '本城资源田最高 '+plotMaxLevel()+' 级';const requirement=buildingRequirements(type,same?p.level+1:1);if(requirement)return '需要 '+requirement;const cost=plotCost(index,type);if(!canPay(cost))return '资源不足';pay(cost);const start=Date.now();state.buildQueue.push({id:type,plot:index,paidItems:payBuildingItems(type,same?p.level+1:1),paid:{...cost},kind:same?'upgrade':p.type?'replace':'build',level:same?p.level+1:1,start,end:start+plotTime(index,type)*1000});save();return null;}
  function plotTemplateQuote(id=state.plotTemplate.id,mode=state.plotTemplate.mode){
    const meta=PlotTemplateData.templates.find(t=>t.id===id);
    if(!meta||!['fill','replace'].includes(mode))return {id,mode,error:'请选择城外样板与建设方式',reason:'请选择城外样板与建设方式',tasks:[],counts:{},cost:{}};
    const plan=PlotTemplateData.plan(state,id,unlockedPlots(),units,mode),cost={};
    for(const task of plan.tasks)for(const [key,value] of Object.entries(plotCost(task.index,task.type)))cost[key]=(cost[key]||0)+value;
    let reason='';
    if(!plan.tasks.length)reason=state.buildQueue.some(q=>q.plot!==undefined)?'等待当前城外工程完工':'当前开放土地已按此方式处理完成';
    else if(state.buildQueue.length>=buildLimit())reason='等待空闲建造队';
    else if(!plan.tasks.some(t=>!buildingRequirements(t.type,1)&&AutomationSystem.canSpend(state,plotCost(t.index,t.type))))reason=plan.tasks.every(t=>buildingRequirements(t.type,1))?'等待资源田建设前置':'等待资源积累或降低保留额度';
    return {...plan,name:meta.name,cost,reason};
  }
  function setPlotTemplate(id){
    if(!PlotTemplateData.templates.some(t=>t.id===id))return '请选择城外样板';
    tick(Date.now(),false);state.plotTemplate={id,active:false,mode:'fill'};save();return null;
  }
  function applyPlotTemplate(id,mode='fill'){
    tick(Date.now(),false);const quote=plotTemplateQuote(id,mode);if(quote.error)return quote.error;
    state.plotTemplate={id,active:true,mode};state.autoUpgrade=false;processPlotTemplate();save();return null;
  }
  function pausePlotTemplate(){state.plotTemplate.active=false;save();return null;}
  function processPlotTemplate(){
    if(!state.plotTemplate.active)return 0;
    let started=0;
    for(let attempt=0;attempt<PLOT_COUNT;attempt++){
      const quote=plotTemplateQuote();
      if(!quote.tasks.length){if(!state.buildQueue.some(q=>q.plot!==undefined)){state.plotTemplate.active=false;save();}break;}
      if(state.buildQueue.length>=buildLimit())break;
      const task=quote.tasks.find(t=>!buildingRequirements(t.type,1)&&AutomationSystem.canSpend(state,plotCost(t.index,t.type)));
      if(!task||enqueuePlot(task.index,task.type))break;
      state.buildQueue[state.buildQueue.length-1].template=state.plotTemplate.id;started++;
    }
    if(started)save();return started;
  }
  function plotTemplateStatus(){
    const p=state.plotTemplate;if(!p.id)return '请选择城外样板';
    const quote=plotTemplateQuote();if(!p.active)return quote.tasks.length?'已暂停 · 待安排 '+quote.tasks.length+' 块':quote.reason;
    return quote.reason||'按样板建设中 · 待安排 '+quote.tasks.length+' 块';
  }
  function autoUpgradeCandidates(){
    const candidates=[];
    state.cityLayout.forEach((id,index)=>{
      const level=state.cityLevels[index];
      if(!cityIds.includes(id)||level<1||level>=buildings[id].max||buildingRequirements(id,level+1)||buildingConditions(id,level+1).some(r=>r.kind==='item')||state.buildQueue.some(q=>q.site===index))return;
      candidates.push({area:'city',index,id,level,cost:buildRecord(id,level+1).cost});
    });
    state.plots.forEach((plot,index)=>{
      if(!plot.type||plot.level<1||plot.level>=plotMaxLevel()||index>=unlockedPlots()||plotJob(index)||buildingRequirements(plot.type,plot.level+1)||buildingConditions(plot.type,plot.level+1).some(r=>r.kind==='item'))return;
      candidates.push({area:'plot',index,id:plot.type,level:plot.level,cost:plotCost(index,plot.type)});
    });
    const price=c=>Object.values(c.cost).reduce((sum,n)=>sum+n,0);
    return candidates.sort((a,b)=>a.level-b.level||price(a)-price(b)||a.area.localeCompare(b.area)||a.index-b.index);
  }
  function processAutoUpgrade(){
    if(!state.autoUpgrade)return 0;
    let started=0;
    while(state.buildQueue.length<buildLimit()){
      // Recompute after every payment, so two queues never spend the same stock.
      const candidate=autoUpgradeCandidates().find(c=>AutomationSystem.canSpend(state,c.cost));
      if(!candidate)break;
      const error=candidate.area==='city'?enqueueBuilding(candidate.index,candidate.id):enqueuePlot(candidate.index,candidate.id);
      if(error)break;
      state.buildQueue[state.buildQueue.length-1].auto=true;started++;
    }
    if(started)save();return started;
  }
  function autoUpgradeStatus(){
    if(!state.autoUpgrade)return '已暂停';
    if(state.buildQueue.length>=buildLimit())return '等待空闲建造队';
    const candidates=autoUpgradeCandidates();
    if(!candidates.length)return state.buildQueue.length?'等待当前工程完工':'暂无可自动升级建筑，可能缺少前置或需要图纸';
    return candidates.some(c=>AutomationSystem.canSpend(state,c.cost))?'材料充足，准备升级':'等待资源积累或降低保留额度';
  }
  function setAutoUpgrade(enabled){
    if(typeof enabled!=='boolean')return '请选择自动升级状态';
    tick(Date.now(),false);state.autoUpgrade=enabled;if(enabled)state.plotTemplate.active=false;
    if(enabled)processAutoUpgrade();save();return null;
  }
  function cancelBuild(key){tick(Date.now(),false);const q=state.buildQueue.find(q=>q.plot===undefined?'site:'+q.site===key:'plot:'+q.plot===key);if(!q)return '没有正在进行的建设';state.autoUpgrade=false;state.plotTemplate.active=false;const fraction=.66;for(const [id,count] of Object.entries(q.paidItems||{}))state.inventory[id]=(state.inventory[id]||0)+Math.ceil(count*.66);addRes(Object.fromEntries(Object.entries(q.paid||{}).map(([k,v])=>[k,Math.floor(v*fraction)])));if(q.site!==undefined&&state.cityLevels[q.site]===0)state.cityLayout[q.site]=null;state.buildQueue=state.buildQueue.filter(x=>x!==q);refreshBuildings();save();return null;}
  function demolish(site){tick(Date.now(),false);const id=state.cityLayout[site],level=state.cityLevels[site];if(!id||id==='reserved'||id==='hall')return '官府和空地不能拆除';if(state.buildQueue.some(q=>q.site===site))return '请先取消施工';if(['tavern','drill'].includes(id)&&(allExpeditions().length||Object.keys(state.garrisons).length))return '请先收回外出部队';if(id==='tavern'&&state.generals.length>Math.max(0,level-1))return '请先处理将领房间不足';state.autoUpgrade=false;state.cityLevels[site]--;if(state.cityLevels[site]===0)state.cityLayout[site]=null;addRes(Object.fromEntries(Object.entries(buildRecord(id,level).cost).map(([k,v])=>[k,Math.floor(v*.5)])));refreshBuildings();save();return null;}
  function relocateBuilding(id,index){const old=primarySite(id);if(old<0||id==='hall'||!Number.isInteger(index)||index<0||index>=36||state.cityLayout[index])return '请选择空地，官府不能迁移';state.cityLayout[index]=id;state.cityLayout[old]=null;state.cityLevels[index]=state.cityLevels[old];state.cityLevels[old]=0;for(const q of state.buildQueue)if(q.site===old)q.site=index;save();return null;}
  function unitRequirements(id){const u=units[id];if(!u)return '兵种不存在';const missing=[];for(const [key,level] of Object.entries(u.requires.buildings))if(state.buildings[key]<level)missing.push(buildings[key].name+' '+level+'级');for(const [key,level] of Object.entries(u.requires.tech))if(state.tech[key]<level)missing.push(ManualData.technology[key].name+' '+level+'级');return missing.join('、');}
  const unitUnlocked=id=>!unitRequirements(id);
  const trainingLimit=()=>state.cityLayout.reduce((v,id,i)=>v+(id==='barracks'?state.cityLevels[i]:0),0);
  function trainCost(id,count){return Object.fromEntries(Object.entries(units[id].cost).map(([k,v])=>[k,v*count]));}
  function trainSeconds(id,count){const u=units[id],tech=u.kind==='machine'?state.tech.manufacture:state.tech.training;return Math.max(1,count*u.time/(1+tech*.1+general(HeritageSystem.effectiveHero(state,'train')).atk/100)/state.speed);}
  function train(id,count){tick();count=Math.floor(count);if(!units[id]||count<1||count>100000)return '请选择训练数量';const needed=unitRequirements(id);if(needed)return '需要 '+needed;if(state.trainQueue.length>=trainingLimit())return '军营训练队列已满';if(count*(units[id].people||1)>freePopulation())return '空闲人口不足，每名'+units[id].name+'需要 '+(units[id].people||1)+' 人口';const cost=trainCost(id,count);if(!canPay(cost))return '训练资源不足';pay(cost);state.population-=count*(units[id].people||1);const start=Math.max(Date.now(),...state.trainQueue.map(q=>q.end));state.trainQueue.push({id,count,start,end:start+trainSeconds(id,count)*1000});save();return null;}
  function dismissTroops(id,count){tick();count=Math.floor(count);if(!units[id]||count<1||count>state.army[id])return '数量不足';state.army[id]-=count;state.population=Math.min(maxPop(),state.population+count*(units[id].people||1));save();return null;}
  function general(id){const g=[...generals,...state.customGenerals].find(g=>g.id===id),lv=state.generalLevels[id]||1;if(!g)return {id,name:id?'未知将领':'尚未任命',level:1,atk:0,def:0,pol:0,wis:0,lead:0};const baseExtra=HeroSystem.bonus(state,id),skillExtra=GeneralGrowth.statBonus(state,id),extra=Object.fromEntries(Object.keys(baseExtra).map(k=>[k,baseExtra[k]+(skillExtra[k]||0)]));return {...g,level:lv,atk:(g.atk+(lv-1)*4+extra.atk)*(activeBuff('valor',id)?1.25:1),def:g.def+(lv-1)*3+extra.def,pol:(g.pol+extra.pol)*(activeBuff('politics',id)?1.25:1),wis:((g.wis||g.def)+extra.wis)*(activeBuff('wisdom',id)?1.25:1),lead:((g.lead||lv*10)+extra.lead)*(1+state.tech.leadership*.1)*(activeBuff('tiger',id)?1.5:1)};}
  function setGovernor(id){tick(Date.now(),false);if(!state.generals.includes(id))return '尚未招募该武将';if(generalBusy(id))return '该武将正在出征或驻守';for(const role of ['commander','counsellor'])if(state.cityRoles[role]===id)state.cityRoles[role]='';state.governor=id;save();return null;}
  function setTax(value){tick();state.tax=Math.max(0,Math.min(100,Math.round(Number(value)||0)));save();}
  function civicOrderPreview(id){
    if(typeof id!=='string')return null;
    if(id==='sacrifice')return GovernanceSystem.sacrificeQuote(state,Date.now());
    const rule=Object.hasOwn(ManualData.civic.comfort,id)?ManualData.civic.comfort[id]:null,resource=id.startsWith('levy_')?id.slice(5):null;
    if(!rule&&!Object.hasOwn(ManualData.civic.levyMultipliers,resource))return null;
    const kind=rule?'comfort':'levy',name=rule?.name||'征收'+resources[resource].name;
    const end=state.civicCooldowns[kind],cost={},reward={},effects={morale:0,unrest:0,population:0};
    let reason='',requested=0;
    if(rule?.unavailable)reason=rule.unavailable;
    else if(rule){
      cost[rule.resource]=Math.max(ManualData.civic.minimumCostPopulation,Math.ceil(state.population))*rule.costMultiplier;
      if(id==='immigration')effects.population=Math.max(0,Math.min(Math.floor(maxPop()-state.population),Math.max(rule.minimumIncrease,Math.ceil(state.population*rule.populationFraction))));
      else{effects.morale=Math.min(100,state.morale+rule.morale)-state.morale;effects.unrest=Math.max(0,state.unrest+rule.unrest)-state.unrest;}
      if(!Object.values(effects).some(n=>n!==0))reason=id==='immigration'?'人口已满，请先扩建民房':'民心已满且没有民怨';
    }else{
      requested=Math.floor(state.population)*ManualData.civic.levyMultipliers[resource];
      reward[resource]=Math.min(requested,Math.max(0,Math.floor(capacity(resource)-state.res[resource])));
      effects.morale=-20;
      if(state.population<1)reason='没有可征收的人口';
      else if(state.morale<20)reason='民心不足 20，无法征收';
      else if(reward[resource]<=0)reason=resources[resource].name+'已满仓，请先使用或扩充容量';
    }
    if(!rule?.unavailable){if(end>Date.now())reason=kind==='comfort'?'安抚冷却中':'征收冷却中';else if(!reason&&!canPay(cost))reason='所需'+Object.keys(cost).map(k=>resources[k].name).join('、')+'不足';}
    return {id,name,kind,cost,reward,requested,effects,cooldownEnd:end,reason,enabled:!reason};
  }
  function executeCivicOrder(id){
    tick(Date.now(),false);if(id==='sacrifice'){const error=GovernanceSystem.sacrifice(state,Date.now());if(!error){Progression.record(state,'civic');Progression.record(state,'comfort');save();}return error;}const order=civicOrderPreview(id);if(!order)return '官府指令不存在';if(order.reason)return order.reason;
    pay(order.cost);addRes(order.reward);
    state.morale=Math.max(0,Math.min(100,state.morale+order.effects.morale));
    state.unrest=Math.max(0,Math.min(100,state.unrest+order.effects.unrest));
    state.population=Math.min(maxPop(),state.population+order.effects.population);
    state.civicCooldowns[order.kind]=Date.now()+ManualData.civic.cooldownSeconds*1000;Progression.record(state,'civic');Progression.record(state,order.kind);
    save();return null;
  }
  const power=a=>Math.round(Object.entries(a).reduce((v,[k,n])=>v+n*(units[k].atk+units[k].hp/10),0));
  const marchSkillFactor=(army,id)=>Object.entries(army).filter(([,n])=>n>0).every(([unit])=>['cavalry','heavy','scout'].includes(unit))?GeneralGrowth.profile(state,id).marchFactor:1;
  function marchQuote(nodeId,army={},generalId=''){
    const node=getNode(nodeId),rows=Object.keys(units).filter(id=>Number.isFinite(Number(army?.[id]))&&Math.floor(Number(army?.[id]))>0).map(id=>({id,speed:unitStats(id).speed}));
    if(!node||!rows.length)return {error:!node?'目标不存在':'至少选择 1 名士兵',slowest:null,speed:0,seconds:1,returnSeconds:1};
    const slowest=rows.reduce((a,r)=>r.speed<a.speed?r:a),baselineSpeed=units.archer.speed,ratio=baselineSpeed/Math.max(1,slowest.speed),trialMultiplier=state.speed,origin=currentHome(),distance=Math.hypot(node.x-origin.x,node.y-origin.y),baseDistance=Math.hypot(node.x-home.x,node.y-home.y),time=node.time*(currentCityId()==='capital'||!Number.isFinite(distance)||!baseDistance?1:distance/baseDistance)/marchSkillFactor(army,generalId),strategy=cityStrategy(),baseSeconds=Math.max(1,time*ratio/trialMultiplier),baseReturnSeconds=Math.max(1,time/2*ratio/trialMultiplier);
    return {error:null,slowest:slowest.id,speed:slowest.speed,baselineSpeed,trialMultiplier,distance,sourceCity:currentCityId(),cityStrategy:strategy,marchFactor:strategy.marchFactor,baseSeconds,baseReturnSeconds,seconds:Math.max(1,baseSeconds*strategy.marchFactor),returnSeconds:Math.max(1,baseReturnSeconds*strategy.marchFactor)};
  }
  function dispatch(nodeId,id,army,mode='raid',returnAfterOccupy=false){if(typeof returnAfterOccupy!=='boolean')return '请选择占领后的返回方式';tick();const n=getNode(nodeId);if(!n)return '目标不存在';const blocked=attackBlocked(nodeId,mode);if(blocked)return blocked;if(state.buildings.drill<1)return '请先建造校场';if(allExpeditions().length>=state.buildings.drill)return '超过校场可派遣队伍数';if(allExpeditions().some(e=>e.node===nodeId))return '已有部队前往该目标';if(state.cooldowns[nodeId]>Date.now())return '据点仍在恢复';if(!state.generals.includes(id))return '请选择武将';if(generalBusy(id))return '该武将正在出征或驻守';if(HeritageSystem.roleOf(state,id))return '任职将领留守城池，请先在官府卸任或换将';let selected=blankArmy();for(const k of Object.keys(units)){const count=Math.floor(Number(army[k])||0);if(count<0||count>state.army[k])return '城内兵力不足';selected[k]=count;}if(!totalArmy(selected))return '至少选择 1 名士兵';if(totalArmy(selected)>armyLimit())return '超过校场单队人数上限';const supply=Math.ceil(totalArmy(selected)*1.2+n.time*2);if(state.res.food<supply)return '行军粮食不足';state.res.food-=supply;if(activeBuff('flag'))delete state.buffs.flag;for(const k of Object.keys(units))state.army[k]-=selected[k];if(!state.expedition&&state.battle?.finished)state.battle=null;const expedition={node:nodeId,general:id,mode,returnAfterOccupy:(n.wild||isCity(n))&&mode==='occupy'&&returnAfterOccupy,sourceCity:currentCityId(),origin:{...currentHome()},generalSnapshot:{...general(id)},skillProfile:GeneralGrowth.profile(state,id),returnSeconds:marchQuote(nodeId,selected,id).returnSeconds,army:selected,enemySnapshot:{...attackInfo(nodeId,mode).army},orders:JSON.parse(JSON.stringify(state.tactics)),phase:'march',start:Date.now(),end:Date.now()+marchQuote(nodeId,selected,id).seconds*1000};if(!state.expedition)state.expedition=expedition;else state.expeditions.push(expedition);save();return null;}

  const isCity=n=>n?.terrain==='fort';
  const nLevel=id=>getNode(id)?.level||1;
  const generalBusy=id=>externalGeneralBusy.has(id)||heroCity(id)!==currentCityId()||state.realm.logistics.some(j=>j.general===id)||CitySystem.list(state).some(c=>{const d=CitySystem.scope(state,c);return !!(d.cityDefense.battle&&d.cityDefense.battle.general===id)||[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)].some(e=>e.general===id);});
  const wildOwned=()=>Object.keys(state.conquered).filter(id=>getNode(id)?.wild&&state.realm.wildOwners[id]===currentCityId()&&!state.realm.cities[CitySystem.idFor(id)]).length;
  function attackBlocked(id,mode){
    const n=getNode(id);if(!n)return '目标不存在';if(!['raid','occupy'].includes(mode))return '请选择掠夺或占领';
    if(n.encounter&&!tacticsAvailable())return '战术遭遇目前支持单机逐回合战斗，请切回单机模式';
    if(n.orderRoute)return WarOrders.blocked(state,n,mode);
    const namedBlocked=NamedCitySystem.attackBlocked(state,id);if(namedBlocked)return namedBlocked;
    const chapterBlocked=ChapterData.blocked(state,id);if(chapterBlocked)return chapterBlocked;
    if(isCity(n)&&!n.openCity&&!Progression.countyUnlocked(state))return '黄巾之乱四项史诗尚未全部完成，县城攻打未开放';
    if(state.conquered[id]&&(n.wild||isCity(n)))return '这块领地已归属你，可在领地管理中召回驻军或放弃野地';
    if(mode==='occupy'&&isCity(n)&&cityList().length>=cityLimit())return '城池名额已满';
    if(mode==='occupy'&&state.conquered[id])return '据点已占领';
    if(mode==='occupy'&&n.wild&&wildOwned()>=state.buildings.hall)return '附属野地已满，升级官府或放弃一块野地';
    return null;
  }
  function attackInfo(id,mode='raid'){
    const n=getNode(id);if(!n)return null;const city=isCity(n),siege=(city||!!n.fortification)&&mode==='occupy',town=city?state.towns[id]:null;
    const militia=siege&&town?Math.ceil(town.population*.1):0,army={...n.army};if(militia)army.militia=(army.militia||0)+militia;
    const factor=(mode==='raid'?RAID_LOOT_FACTOR*(n.wild&&n.level>=3?2:1):1)*(state.raided[id]?.6:1)*(city&&mode==='raid'?Math.min(1,.6+state.tech.plunder*.03):1);
    const yellowGold=n.faction==='yellow_turban'&&n.openCity&&mode==='occupy',goldReadyAt=yellowGold?state.yellowGold?.[id]||0:null;
    const loot=Object.fromEntries(Object.entries(n.loot).filter(([k])=>mode!=='raid'||k!=='gold').map(([k,v])=>[k,k==='gold'&&yellowGold?(goldReadyAt>Date.now()?0:v):Math.round(v*factor)]));
    return {army,loot,goldReadyAt,siege,militia,morale:town?.morale??null,unrest:town?.unrest??null,population:town?.population??null};
  }
  function recallGarrison(id){
    tick();const source=CitySystem.list(state).find(c=>CitySystem.scope(state,c).garrisons[id]);if(source&&source.id!==currentCityId())switchCity(source.id);const g=state.garrisons[id];if(!g)return '这里没有驻军';if(g.phase!=='stationed')return '部队已在返城途中';if(state.gatherings[id])return '请先收获或取消采集，再召回驻军';g.phase='return';g.start=Date.now();g.end=Date.now()+marchQuote(id,g.army).returnSeconds*1000;save();return null;
  }
  function abandonWild(id){
    tick();const n=getNode(id);if(!n?.wild||!state.conquered[id])return '只能放弃已占领野地';if(state.garrisons[id])return '请先召回驻军，待部队返城后再放弃';if(state.realm.cities[CitySystem.idFor(id)])return '此处已经筑城，不能作为野地放弃';delete state.conquered[id];delete state.landClaims[id];delete state.realm.wildOwners[id];save();return null;
  }

  const defaultOrder=id=>['archer','ballista','catapult'].includes(id)?'hold':'advance';
  const battleLength=rows=>Math.max(0,...rows.map(r=>r.stats?.range||units[r.id].range))+200;
  function formation(army,enemy=false,length=1400){return Object.entries(army).filter(([,n])=>n>0).map(([id,n])=>({id,initial:n,stats:unitStats(id,!enemy),hp:n*unitStats(id,!enemy).hp,maxHp:n*unitStats(id,!enemy).hp,pos:enemy?length:0,defending:false}));}
  const survivors=rows=>Object.fromEntries(Object.keys(units).map(id=>[id,Math.ceil((rows.find(r=>r.id===id)?.hp||0)/(rows.find(r=>r.id===id)?.stats.hp||units[id].hp))]));
  const stratagemApi={units,log:(b,text)=>pushLog(b,text)};
  function enemyGeneralSnapshot(node){const encounter=WarOrders.encounterConfig?.(node.id),rumor=state.wildGenerals?.rumors.find(r=>r.status==='active'&&r.node===node.id),definition=rumor&&HeroSystem.wild.definitions.find(d=>d.line===rumor.line);return {id:'enemy_'+node.id,name:definition?.name||node.commander?.name||'守军',wildLine:definition?.line||'',...(encounter?{encounterIdentity:encounter.enemyIdentity}:{})};}
  function tacticSubmit(b,side,type,args,key){
    if(!b||b.finished||b.rules!==3||!tacticsAvailable())return {ok:false,reason:'此战斗不支持名将计谋；请在单机新出征或教学演练中使用。'};
    const action={...args,type},q=BattleStratagems.quote(b,side,action,stratagemApi),r=BattleStratagems.submit(b,side,action,key===undefined?q.key:key,stratagemApi);
    if(r.ok&&!r.replayed&&q.requiredOrder){const orders=side==='player'?b.orders:b.enemyOrders;const unit=action.unit||q.unit;if(orders?.[unit])orders[unit].command=q.requiredOrder;}
    return r;
  }
  function planEnemyTactic(b,node){
    if(!b.stratagem||b.lesson||b.finished)return;
    const encounter=WarOrders.encounterConfig?.(node.id);
    if(encounter){
      for(const r of b.enemy)b.enemyOrders[r.id]={...(encounter.enemyOrders[r.id]||{command:defaultOrder(r.id),target:''})};
      // A paid preparation retains its required order until its response is resolved.
      for(const p of b.stratagem.plans.filter(p=>p.side==='enemy'&&p.status==='prepared')){
        if(b.enemyOrders[p.unit]){if(p.type==='weiyan'&&p.round===b.stratagem.round)b.enemyOrders[p.unit].command='fallback';if(p.type==='huangzhong')b.enemyOrders[p.unit].command='hold';}
      }
      for(const plan of encounter.plans.filter(p=>p.atRound===b.round)){
        const attempts=plan.targetPolicy==='firstEligibleMelee'?b.player.filter(r=>r.hp>0&&BattleStratagems.RULES.melee.includes(r.id)).map(r=>({...plan.action,target:r.id})):[plan.action];
        for(const action of attempts){const q=BattleStratagems.quote(b,'enemy',action,stratagemApi);if(q.ok&&tacticSubmit(b,'enemy',action.type,action,q.key).ok)break;}
      }
      return;
    }
    for(const r of b.enemy)b.enemyOrders[r.id]={command:b.gate?.hp>0&&node.commander?.order?node.commander.order:defaultOrder(r.id),target:''};
    const identity=b.stratagem.version===1?{action:b.stratagem.identities.enemy}:BattleStratagems.identity(b.enemyGeneralSnapshot),attempt=action=>{const q=BattleStratagems.quote(b,'enemy',action,stratagemApi);return q.ok?tacticSubmit(b,'enemy',action.type,action,q.key).ok:false;};
    for(const p of b.stratagem.plans.filter(p=>p.side==='enemy'&&p.type==='zhaoyun'&&p.status==='prepared')){
      if(b.enemyOrders[p.unit])b.enemyOrders[p.unit].command='hold';
      if(b.enemyOrders[p.target])b.enemyOrders[p.target].command='fallback';
    }
    if(identity.action==='zhaoyun')for(const target of b.enemy.filter(r=>r.hp>0&&r.id!=='cavalry'))if(attempt({type:'zhaoyun',unit:'cavalry',target:target.id}))return;
    if(identity.action==='machao')for(const actor of b.enemy.filter(r=>r.hp>0&&['cavalry','heavy'].includes(r.id)))for(const target of b.player.filter(r=>r.hp>0&&BattleStratagems.RULES.melee.includes(r.id)))if(attempt({type:'machao',unit:actor.id,target:target.id}))return;
    if(identity.action==='huangzhong'&&attempt({type:'huangzhong',unit:'archer'}))return;
    if(identity.action==='weiyan'){for(const row of b.enemy.filter(r=>r.hp>0&&['spear','cavalry'].includes(r.id)))for(const target of b.player.filter(r=>r.hp>0))if(attempt({type:'weiyan',unit:row.id,target:target.id}))return;}
    // Automatic plans belong to the explicitly designed wild-general encounters.
    // Ordinary commanders retain their existing attacks and challenge balance.
    if(b.round===0&&identity.action==='xushu'){
      const actor=b.enemy.find(r=>r.hp>0),left=Math.floor(b.length/2)-50;if(actor)attempt({type:'fire',unit:actor.id,left});
    }
  }
  const heroIdentity=value=>typeof BattleStratagems==='undefined'?null:BattleStratagems.identity(typeof value==='string'?general(value):value);
  const battleTacticsView=(b=state.battle)=>b?.rules===3&&tacticsAvailable()?BattleStratagems.view(b,'player'):{enabled:false,reason:'旧版战斗、NPC守城与共享世界暂不支持新计谋。'};
  const battleTacticQuote=(type,args={},b=state.battle)=>b?.rules===3&&tacticsAvailable()?BattleStratagems.quote(b,'player',{...args,type},stratagemApi):{ok:false,reason:'此战斗不支持新计谋。',options:{actors:[],targets:[],preparations:[]}};
  function submitBattleTactic(type,args={},key){const r=tacticSubmit(state.battle,'player',type,args,key);if(r.ok)save();return r;}
  function cancelBattleTactic(id){const b=state.battle;if(!b||!b.stratagem||!tacticsAvailable())return {ok:false,reason:'此战斗不支持新计谋。'};const r=BattleStratagems.cancel(b,'player',id,stratagemApi);if(r.ok)save();return r;}
  function startTacticalLesson(id){
    if(!tacticsAvailable()||typeof TacticalLessons==='undefined')return '教学演练仅在单机模式可用';
    if(state.battle&&!state.battle.finished||state.cityDefense.battle)return '请先结束当前正式战斗或守城演练';
    const next=TacticalLessons.create(id,units);if(!next)return '演练不存在';
    lessonEvidence.set(next.battle,BattleReview.createRoundEvidence());next.battle.stratagem=BattleStratagems.create(next.battle,{player:next.battle.generalSnapshot,enemy:next.battle.enemyGeneralSnapshot});lessonSession=next;
    if(next.enemyPlan)tacticSubmit(next.battle,'enemy',next.enemyPlan.type,next.enemyPlan);
    return null;
  }
  const lessonInfo=()=>lessonSession?{id:lessonSession.id,title:lessonSession.title,basic:!!TacticalLessons.definitions.find(d=>d.id===lessonSession.id)?.basic,generalName:lessonSession.generalName,description:lessonSession.description,objective:lessonSession.objective,node:lessonSession.node,battle:lessonSession.battle,result:lessonSession.result,evidence:lessonEvidence.get(lessonSession.battle)}:null;
  function lessonOrder(index,command){const b=lessonSession?.battle,r=Number.isInteger(index)?b?.player[index]:null;if(!r||r.hp<=0||b.finished||!['advance','hold','fallback'].includes(command))return '演练指令无效';b.orders[r.id].command=command;return null;}
  function lessonTarget(index,target){const b=lessonSession?.battle,r=Number.isInteger(index)?b?.player[index]:null;if(!r||r.hp<=0||b.finished||target!==''&&!(target==='gate'&&b.gate?.hp>0)&&!b.enemy.some(t=>t.id===target))return '演练目标无效';b.orders[r.id].target=target;return null;}
  function lessonAllOrders(command){if(!lessonSession||!['advance','hold','fallback'].includes(command)||lessonSession.battle.finished)return '演练指令无效';for(let i=0;i<lessonSession.battle.player.length;i++)if(lessonSession.battle.player[i].hp>0)lessonOrder(i,command);return null;}
  const lessonTactic=(type,args={},key)=>tacticSubmit(lessonSession?.battle,'player',type,args,key);
  const lessonCancelTactic=id=>lessonSession?BattleStratagems.cancel(lessonSession.battle,'player',id,stratagemApi):{ok:false,reason:'尚未开始演练'};
  const endTacticalLesson=()=>{lessonSession=null;return null;};
  function startBattle(){
    tick();if(state.cityDefense.battle)return '请先结束守城战或演练';const e=state.expedition;if(!e||e.phase!=='march'||e.end>Date.now())return '部队尚未到达';
    const n=getNode(e.node);if(n.encounter&&!tacticsAvailable())return '战术遭遇目前支持单机逐回合战斗，请切回单机模式';
    const encounter=WarOrders.encounterConfig?.(n.id),info=attackInfo(n.id,e.mode),player=formation(e.army),enemy=formation(e.enemySnapshot||info.army,true),length=encounter?.length||battleLength([...player,...enemy]);for(const r of enemy)r.pos=encounter?.enemyPositions[r.id]??length;
    state.battle={rules:2,length,node:n.id,general:e.general,sourceCity:e.sourceCity||currentCityId(),generalSnapshot:e.generalSnapshot||{...general(e.general)},skillProfile:e.skillProfile||GeneralGrowth.profile(state,e.general),mode:e.mode,siege:info.siege,gate:SiegeSystem.gate(n,e.mode),militia:info.militia,round:0,machineGateAttacks:0,currentRoundSummary:{round:0,events:[]},player,enemy,orders:Object.fromEntries(player.map(r=>[r.id,{...e.orders[r.id]}])),log:['两军相距 '+length+'。按兵种速度依次行动，同速守方优先。'],auto:true,finished:false,result:null};
    normalizeBattleTargets(state.battle);
    if(tacticsAvailable()){const b=state.battle;b.rules=3;if(b.generalSnapshot.wildLine===undefined&&general(e.general)?.wildLine){b.generalSnapshot.wildLine=general(e.general).wildLine;if(e.generalSnapshot)e.generalSnapshot.wildLine=b.generalSnapshot.wildLine;}b.enemyGeneralSnapshot=enemyGeneralSnapshot(n);b.enemyOrders=Object.fromEntries(enemy.map(r=>[r.id,{command:b.gate?.hp>0&&n.commander?.order?n.commander.order:defaultOrder(r.id),target:''}]));b.stratagem=BattleStratagems.create(b,{player:b.generalSnapshot,enemy:b.enemyGeneralSnapshot});planEnemyTactic(b,n);}
    if(n.commander)pushLog(state.battle,'敌将 '+n.commander.name+' · '+n.commander.title+'：攻击 ×'+n.commander.attack+'，防御 ×'+n.commander.defense+'。');if(state.battle.gate)pushLog(state.battle,n.fortification.name+'：耐久 '+state.battle.gate.hp+'；冲车、投石车优先破城，破城后箭楼失效。');
    if(info.siege)pushLog(state.battle,'占领攻城：城防启用，义兵 '+info.militia+' 人加入义兵阵。');e.phase='battle';save();return null;
  }
  function normalizeBattleTargets(b){
    // Default expedition tactics may name a valid troop type absent from this encounter.
    // Clear only those stale targets; keep commands and malformed input validation intact.
    for(const [orders,foes,canTargetGate] of [[b.orders,b.enemy,true],[b.enemyOrders,b.player,false]]){
      for(const order of Object.values(orders||{})){
        const target=order.target;
        if(Object.hasOwn(units,target)&&!foes.some(row=>row.id===target)||target==='gate'&&(!canTargetGate||!b.gate?.hp))order.target='';
      }
    }
  }
  function setTactic(id,command,target){
    if(!Object.hasOwn(units,id))return '兵种不存在';
    const order=state.tactics[id];
    if(command!==undefined){if(!['advance','hold','fallback'].includes(command))return '指令不存在';order.command=command;}
    if(target!==undefined){if(target!==''&&!Object.hasOwn(units,target))return '目标不存在';order.target=target;}
    save();return null;
  }
  function setBattleOrder(id,command,target){
    const b=state.battle;if(!b||b.finished)return '当前没有进行中的战斗';
    if(!b.player.some(r=>r.id===id&&r.hp>0))return '该部队已无法行动';
    const order=b.orders[id];
    if(command!==undefined){if(!['advance','hold','fallback'].includes(command))return '请选择向前、坚守或后退';order.command=command;}
    if(target!==undefined){if(target!==''&&!(target==='gate'&&b.gate?.hp>0)&&!b.enemy.some(r=>r.id===target))return '目标兵种不存在';order.target=target;}
    save();return null;
  }
  function setBattleOrders(command){
    const b=state.battle;if(!b||b.finished)return '当前没有进行中的战斗';
    if(!['advance','hold','fallback'].includes(command))return '请选择前进、固守或后退';
    const living=b.player.filter(r=>r.hp>0);if(!living.length)return '当前没有可指挥的部队';
    for(const row of living)b.orders[row.id].command=command;save();return null;
  }
  function pushLog(b,text){b.log.push(text);b.log=b.log.slice(-40);}
  function battleRound(){return resolveBattleRound(state.battle);}
  function lessonRound(){if(!lessonSession)return '尚未开始演练';if(!tacticsAvailable())return '教学演练仅在单机模式可用';return resolveBattleRound(lessonSession.battle,lessonSession);}
  function resolveBattleRound(b,lesson=null){
    if(!b||b.finished)return b||null;if(b.rules===3&&!tacticsAvailable())return '此模式暂不支持名将计谋战斗';
    if(!lesson&&(b.round>=30||!b.player.some(r=>r.hp>0)||!b.enemy.some(r=>r.hp>0)&&!b.gate?.hp)){const error=finishBattle(b.player.some(r=>r.hp>0)&&!b.enemy.some(r=>r.hp>0)&&!b.gate?.hp);save();return error||b;}
    if(!b.generalSnapshot)for(const row of b.player){const stats=unitStats(row.id);row.hp=Math.min(row.initial*stats.hp,row.hp/row.stats.hp*stats.hp);row.maxHp=row.initial*stats.hp;row.stats=stats;}b.round++;
    const tactics=b.rules===3&&!!b.stratagem;
    normalizeBattleTargets(b);
    if(tactics){const begun=BattleStratagems.beginRound(b,{player:b.orders,enemy:b.enemyOrders},stratagemApi);if(!begun.ok){b.round--;return begun.reason;}}
    const currentRoundSummary={round:b.round,events:[]};b.currentRoundSummary=currentRoundSummary;
    const event=(type,side,unit,target,from,to,damage=0,killed=0,counter=false,ranged=false)=>currentRoundSummary.events.push({type,side,unit,target,from,to,damage,killed,counter,ranged});
    const g=b.generalSnapshot||general(b.general),living=rows=>rows.filter(r=>r.hp>0),node=lesson?.node||getNode(b.node),commander=SiegeSystem.commander(node);
    pushLog(b,'—— 第 '+b.round+' 回合 ——');
    const all=[...b.player.map(r=>({r,side:'player'})),...b.enemy.map(r=>({r,side:'enemy'}))].sort((a,z)=>z.r.stats.speed-a.r.stats.speed||(a.side===z.side?(tactics?a.r.id.localeCompare(z.r.id):0):a.side==='enemy'?-1:1));
    function strike(r,t,side,counter=false,tag=''){
      const u={...units[r.id],...r.stats};let mod=1;
      if(r.id==='spear'&&t.id==='cavalry')mod=1.6;
      if(r.id==='cavalry'&&t.id==='archer')mod=1.65;
      if(r.id==='archer'&&t.id==='shield')mod=.5;
      const coverage=Math.min(1,g.lead*100/Math.max(1,b.player.reduce((sum,row)=>sum+row.initial,0)));const attackBonus=side==='player'?1+(g.atk/220+(g.bonus===r.id?.12:0))*coverage:1.1*commander.attack;
      const defenseBonus=side==='enemy'?1+g.def/300*coverage:1;
      const damage=Math.max(1,Math.round(Math.ceil(r.hp/u.hp)*u.atk*attackBonus*mod*(side==='player'?(b.skillProfile?.attackByUnit?.[r.id]||1):1)/(1+t.stats.def/200)/defenseBonus/(side==='player'?SiegeSystem.protection(b,node)*commander.defense:1)));
      const beforeHp=t.hp,before=Math.ceil(t.hp/t.stats.hp);t.hp=Math.max(0,t.hp-damage);
      const lost=before-Math.ceil(t.hp/t.stats.hp),ranged=['archer','ballista','catapult'].includes(r.id);
      event('strike',side,r.id,t.id,r.pos,t.pos,Math.min(beforeHp,damage),lost,counter,ranged);
      if(tag)currentRoundSummary.events.at(-1).tag=tag;
      event('recoil',side==='player'?'enemy':'player',t.id,r.id,t.pos,t.pos,Math.min(beforeHp,damage),lost,counter,ranged);
      pushLog(b,(side==='player'?'我军':'敌军')+u.name+(counter?'反击':tag==='readyShot'?'预备射击':'攻击')+units[t.id].name+'，距离 '+Math.abs(t.pos-r.pos)+'，伤害 '+Math.min(beforeHp,damage)+(lost?'，击倒 '+lost+' 人':'')+(mod>1?' · 克制':''));
      if(tactics)BattleStratagems.pruneDead(b,stratagemApi);
    }
    for(const {r,side} of all){
      if(r.hp<=0)continue;
      const foes=living(side==='player'?b.enemy:b.player);if(!foes.length&&!(side==='player'&&b.gate?.hp>0))break;
      const u={...units[r.id],...r.stats},original=tactics?b.stratagem.orders[side][r.id]:side==='player'?b.orders[r.id]:{command:b.gate?.hp>0&&commander.order?commander.order:defaultOrder(r.id),target:''},order=tactics?BattleStratagems.preparationOrder(b,side,r.id,original):original,before=r.pos,override=tactics?BattleStratagems.movementOverride(b,side,r,order,stratagemApi):{forcedTarget:null,exclusive:false};
      const movementSpeed=Math.max(1,Math.floor(u.speed*(override.speedFactor||1)));
      if(order.command==='advance'){
        const direction=side==='player'?1:-1;
        const ahead=foes.filter(t=>direction*(t.pos-r.pos)>=0);
        const chase=override.forcedTarget,directionLegal=chase&&direction*(chase.pos-r.pos)>=0;
        const stop=chase?(directionLegal?chase.pos:r.pos):b.gate?.hp>0&&side==='player'&&!ahead.length?b.length:ahead.length?(side==='player'?Math.min(...ahead.map(t=>t.pos)):Math.max(...ahead.map(t=>t.pos))):r.pos;
        r.pos=side==='player'?Math.min(stop,r.pos+movementSpeed):Math.max(stop,r.pos-movementSpeed);
      }else if(order.command==='fallback')r.pos=side==='player'?Math.max(0,r.pos-movementSpeed):Math.min(b.length,r.pos+movementSpeed);
      r.pos=Math.max(0,Math.min(b.length,r.pos));if(tactics){const intended=r.pos;r.pos=BattleStratagems.clipMove(b,before,intended);if(r.pos!==intended)pushLog(b,'第 '+b.round+' 回合 · '+(side==='player'?'我军':'敌军')+u.name+'被火区截停：原定位置 '+intended+'，实际位置 '+r.pos+'；剩余移动丢失，没有额外生命伤害。');}r.defending=order.command==='hold';
      if(r.pos!==before)event('move',side,r.id,'',before,r.pos);
      if(r.pos!==before)pushLog(b,(side==='player'?'我军':'敌军')+u.name+(order.command==='fallback'?'后退':'向前')+Math.abs(r.pos-before)+'，位置 '+before+' → '+r.pos);
      if(tactics){
        const movements=BattleStratagems.afterMove(b,side,r,before,stratagemApi);
        for(let i=0;i<movements.length;i++){
          const trigger=movements[i];
          if(trigger.kind==='forcedMove'){
            event('move',trigger.side,trigger.unit,'',trigger.from,trigger.to);
            const moved=(trigger.side==='player'?b.player:b.enemy).find(x=>x.id===trigger.unit);
            if(moved?.hp>0&&trigger.from!==trigger.to)movements.push(...BattleStratagems.afterMove(b,trigger.side,moved,trigger.from,{...stratagemApi,forcedMove:true}));
            continue;
          }
          const shooter=(trigger.side==='player'?b.player:b.enemy).find(x=>x.id===trigger.unit),target=(trigger.side==='player'?b.enemy:b.player).find(x=>x.id===trigger.target);
          if(shooter?.hp>0&&target?.hp>0){strike(shooter,target,trigger.side,false,'readyShot');if(shooter.hp>0&&target.hp>0&&Math.abs(shooter.pos-target.pos)<=target.stats.range)strike(target,shooter,trigger.side==='player'?'enemy':'player',true);}
        }
        if(r.hp<=0)continue;
        if(!BattleStratagems.normalAttackAllowed(b,side,r.id)){pushLog(b,(side==='player'?'我军':'敌军')+u.name+'：本回合主攻击已预留或使用，正常反击保留。');continue;}
      }
      if(side==='player'&&!override.exclusive&&SiegeSystem.canHit(r,b)&&(order.target==='gate'||['ram','catapult'].includes(r.id)||!foes.some(t=>Math.abs(t.pos-r.pos)<=u.range))){if(tactics)BattleStratagems.markMainAttack(b,side,r.id);const damage=Math.round(SiegeSystem.damage(r)*(['ram','catapult'].includes(r.id)?(b.skillProfile?.gateFactor||1):1)),before=b.gate.hp;b.gate.hp=Math.max(0,b.gate.hp-damage);event('gate',side,r.id,'gate',r.pos,b.length,Math.min(before,damage),0,false,r.id==='catapult');event('recoil','enemy','gate',r.id,b.length,b.length,Math.min(before,damage));if(['ram','catapult'].includes(r.id)&&before>b.gate.hp)b.machineGateAttacks=(b.machineGateAttacks||0)+1;pushLog(b,'我军'+u.name+'攻击'+node.fortification.name+'，伤害 '+Math.min(before,damage)+'，剩余耐久 '+b.gate.hp+'。');if(!b.gate.hp)pushLog(b,'城防已破：守军掩护解除，箭楼停止射击。');continue;}
      const inRange=foes.filter(t=>t.hp>0&&Math.abs(t.pos-r.pos)<=u.range);
      const t=override.exclusive?inRange.find(t=>t===override.forcedTarget):inRange.find(t=>t.id===order.target)||inRange.sort((a,z)=>Math.abs(a.pos-r.pos)-Math.abs(z.pos-r.pos)||a.hp-z.hp)[0];
      if(!t){pushLog(b,(side==='player'?'我军':'敌军')+u.name+'：'+(order.command==='hold'?'坚守阵位，':'')+'射程 '+u.range+' 内没有目标。');continue;}
      if(tactics)BattleStratagems.markMainAttack(b,side,r.id);strike(r,t,side);
      if(t.hp>0&&r.hp>0&&Math.abs(t.pos-r.pos)<=t.stats.range)strike(t,r,side==='player'?'enemy':'player',true);
    }
    if(b.siege&&(!b.gate||b.gate.hp>0)&&living(b.player).length){
      const target=living(b.player).filter(r=>b.length-r.pos<=(node.fortification?.range||1200)).sort((a,z)=>z.pos-a.pos)[0];
      if(target){const beforeHp=target.hp,before=Math.ceil(target.hp/target.stats.hp),damage=Math.round((node.fortification?.tower||180+nLevel(b.node)*70)/(1+target.stats.def/200)/(1+g.def/300));target.hp=Math.max(0,target.hp-damage);const killed=before-Math.ceil(target.hp/target.stats.hp);event('tower','enemy','tower',target.id,b.length,target.pos,Math.min(beforeHp,damage),killed,false,true);event('recoil','player',target.id,'tower',target.pos,target.pos,Math.min(beforeHp,damage),killed,false,true);pushLog(b,'城防箭楼射击我军'+units[target.id].name+'，伤害 '+Math.min(beforeHp,damage)+'。');}
    }
    if(tactics)BattleStratagems.endRound(b,stratagemApi);
    if(lesson)BattleReview.collectRoundEvidence(b.currentRoundSummary,lessonEvidence.get(b),{battle:b});
    const finish=won=>lesson?TacticalLessons.finish(lesson,won):finishBattle(won);
    if(!living(b.enemy).length&&(!b.gate||!b.gate.hp))finish(true);
    else if(!living(b.player).length||b.round>=30){if(b.round>=30)pushLog(b,lesson?'演练达到回合上限，可重开比较指令。':'达到回合上限，'+(b.gate?.hp>0?'城防仍未攻破'+(living(b.enemy).length?'且守军尚未清空':''):'守军尚未清空')+'，本次攻打失败。');finish(false);}
    else if(lesson&&TacticalLessons.objectiveMet(lesson))finish(false);
    if(!lesson){if(tactics&&!b.finished)planEnemyTactic(b,node);save();}return b;
  }
  function finishBattle(won,retreated=false){
    const b=state.battle,e=state.expedition;if(!b||b.finished)return;
    const conquestContext=WebEdition.capture();
    const n=getNode(b.node),mode=b.mode,originalArmy={...e.army},alive=survivors(b.player),back=blankArmy(),lost=blankArmy(),wounded=blankArmy();
    const enemyRemaining=totalArmy(survivors(b.enemy)),gateHp=b.gate?.hp||0,outOfRange=b.player.some(r=>r.hp>0&&b.orders[r.id].command==='hold'&&b.enemy.some(t=>t.hp>0)&&!b.enemy.some(t=>t.hp>0&&Math.abs(t.pos-r.pos)<=r.stats.range));
    const failure=won?null:{reason:retreated?'retreat':!totalArmy(alive)?'army':gateHp>0?(enemyRemaining?'gate_and_enemy':'gate'):'enemy',round:b.round,enemyRemaining,gateHp,outOfRange};
    for(const k of Object.keys(units)){wounded[k]=Math.floor((e.army[k]-alive[k])*Math.min(1,(won?.35:.15)+(activeBuff('heal')?.3:0)));back[k]=alive[k];lost[k]=e.army[k]-alive[k]-wounded[k];}
    const careError=WarCare.admit(state,'field:'+currentCityId()+':'+Math.floor(e.start)+':'+n.id,wounded,Date.now());
    if(careError){b.auto=false;pushLog(b,'战果尚未结算：'+careError);return careError;}
    const resourceBefore={...state.res};
    const cargoCapacity=carry(alive),availableLoot=won?attackInfo(n.id,mode).loot:{},loot=won?capLoot(availableLoot,cargoCapacity):{},lootDiscarded=Object.values(availableLoot).reduce((v,n)=>v+n,0)-Object.values(loot).reduce((v,n)=>v+n,0),drops=won?rollBattleDrops(n):{items:{},resources:{}},remainingCarry=Math.max(0,cargoCapacity-Object.values(loot).reduce((v,n)=>v+n,0)),bonusLoot=capLoot(drops.resources,remainingCarry),bonusDiscarded=Object.values(drops.resources).reduce((v,n)=>v+n,0)-Object.values(bonusLoot).reduce((v,n)=>v+n,0),baseReceipt=settleLoot(loot,true),bonusReceipt=settleLoot(bonusLoot,true),resourceReceipt={base:baseReceipt,bonus:bonusReceipt},overflow=receiptOverflow(baseReceipt)+receiptOverflow(bonusReceipt),overCapacity=Object.values(baseReceipt.overCapacity).reduce((sum,n)=>sum+n,0)+Object.values(bonusReceipt.overCapacity).reduce((sum,n)=>sum+n,0);let recruit=null,claimed=false,stationed=false,moraleBefore=null,moraleAfter=null;
    for(const [id,count] of Object.entries(drops.items))state.inventory[id]=(state.inventory[id]||0)+count;
    if(won){
      state.stats.victories++;if(!n.orderRoute)state.raided[n.id]=true;state.cooldowns[n.id]=Date.now()+90000;
      if(n.faction==='yellow_turban'&&n.openCity&&mode==='occupy'&&availableLoot.gold>0){if(!state.yellowGold)state.yellowGold={};state.yellowGold[n.id]=Date.now()+YELLOW_GOLD_REFRESH_MS;}
      if(isCity(n)){const town=state.towns[n.id];if(mode==='occupy'){moraleBefore=town.morale;town.morale=Math.max(-100,town.morale-35);town.population=Math.max(0,town.population-40);moraleAfter=town.morale;claimed=town.morale<0&&!state.conquered[n.id]&&cityList().length<cityLimit();}else town.unrest=Math.min(100,town.unrest+10);}
      else if(mode==='occupy'&&!n.orderRoute)claimed=!state.conquered[n.id];
      if(claimed){Progression.record(state,'occupy');state.conquered[n.id]=true;if(n.wild){state.landClaims[n.id]={at:Date.now(),level:n.level};state.realm.wildOwners[n.id]=currentCityId();}if(isCity(n))state.realm.cities[CitySystem.idFor(n.id)]=CitySystem.empty(state,n,Date.now());}
      if(claimed&&n.capture&&!state.generals.includes(n.capture)){state.generals.push(n.capture);state.generalLevels[n.capture]=1;state.generalXp[n.capture]=0;recruit=n.capture;state.realm.heroLocations[n.capture]=currentCityId();}
      if(isCity(n)&&claimed&&!e.returnAfterOccupy&&totalArmy(back)>0){const destination=state.realm.cities[CitySystem.idFor(n.id)];for(const [id,count]of Object.entries(back))destination.data.army[id]+=count;state.realm.heroLocations[e.general]=destination.id;stationed=true;}
      if(n.wild&&mode==='occupy'&&!e.returnAfterOccupy&&claimed&&totalArmy(back)>0){state.garrisons[n.id]={general:e.general,army:{...back},phase:'stationed',start:Date.now(),end:null};stationed=true;}
    }
    const wildGeneral=HeroSystem.wild.settle(state,n,b,won,Date.now());
    const {captures,captureDiscarded}=won?rollCaptives(b,alive,n):{captures:blankArmy(),captureDiscarded:0};
    const received=Object.fromEntries(Object.keys(resources).map(id=>[id,Math.max(0,Math.floor(state.res[id]-resourceBefore[id]))])),progressionResult=Progression.battle(state,n,b,won,received);
    const xp=won?n.level*45:15;HeroSystem.addXp(state,e.general,xp);
    const equipmentResult=won?HeroSystem.drops(state,n.level):{equipmentDrops:[],equipmentDiscarded:0};
    if(stationed)state.expedition=null;else{e.army=back;e.phase='return';e.start=Date.now();e.end=Date.now()+marchQuote(n.id,back,e.general).returnSeconds*1000;}
    const warOrder=WarOrders.settle(state,n,won,Date.now(),{round:b.round,machineGateAttacks:b.machineGateAttacks||0,army:originalArmy,lost,back,wounded,alive});
    const tacticReceipt=b.stratagem?{tacticEvents:[...BattleStratagems.view(b,'player').events.map(e=>'第 '+e.round+' 回合 · '+e.text),...b.log.filter(line=>line.includes('被火区截停'))].slice(-60),tacticPoints:{...b.stratagem.points}}:{};
    b.finished=true;b.auto=false;b.result={...tacticReceipt,wildGeneral,warOrder,failure,...progressionResult,...equipmentResult,won,mode,returnAfterOccupy:!!e.returnAfterOccupy,claimed,stationed,moraleBefore,moraleAfter,retreated,woundedInHospital:true,loot,resourceReceipt,captures,captureDiscarded,itemDrops:drops.items,bonusLoot,bonusDiscarded,cargoCapacity,cargoLoaded:Object.values(loot).reduce((v,n)=>v+n,0)+Object.values(bonusLoot).reduce((v,n)=>v+n,0),lootDiscarded,lost,wounded,back,xp,first:claimed,recruit,overflow,overCapacity};
    state.reports.unshift({id:Date.now(),node:n.id,general:e.general,sourceCity:currentCityId(),round:b.round,...b.result});state.reports=state.reports.slice(0,20);
    WebEdition.settle(conquestContext);
    pushLog(b,n.orderRoute&&won?'军令讨伐成功，军功 +'+warOrder.points+'，已保存；部队返城。':!won?'战斗失利，幸存部队返城整顿。':mode==='raid'?'掠夺成功，战利品已入库（允许爆仓），部队返城；领地归属不变。':stationed?(isCity(n)?'占领成功，部队驻扎新城，可切换城市查看。':'占领成功，部队留守野地，耗粮翻倍。'):claimed?(n.wild&&e.returnAfterOccupy?'占领成功，部队按出征选择返城；野地归属与产量加成保留。':'占领成功，领地归属变更。'):moraleAfter!==null?'攻城获胜，民心 '+moraleBefore+' → '+moraleAfter+'，尚未易主。':'本次战斗结束。');
    if(wildGeneral)pushLog(b,wildGeneral.status==='captured'?'俘获将领 '+wildGeneral.name+'，忠诚 40；请在俘将管理中手动招降。':wildGeneral.status==='portrait_required'?'未能俘获将领 '+wildGeneral.name+'：'+wildGeneral.reason+'。线索仍然有效。':'释放将领 '+wildGeneral.name+'：'+wildGeneral.reason+'。扩建招贤馆后可重新打听。');
    if(totalArmy(captures))pushLog(b,'收容俘虏：'+Object.entries(captures).filter(([,n])=>n>0).map(([id,n])=>units[id].name+' ×'+n).join('、')+'；可在军队的俘虏营招降。');
    if(captureDiscarded)pushLog(b,'押解或俘虏营名额不足，释放 '+captureDiscarded+' 名俘虏。');
    if(equipmentResult.equipmentDrops.length)pushLog(b,'缴获装备：'+equipmentResult.equipmentDrops.map(e=>HeroSystem.qualities[e.tier]+' · '+HeroSystem.itemName(e)).join('、')+'，已收入装备库。');
    if(equipmentResult.equipmentDiscarded)pushLog(b,'装备库已满，未能收取 1 件装备。');
    if(Object.keys(drops.items).length)pushLog(b,'缴获道具：'+Object.entries(drops.items).map(([id,count])=>ManualData.shop.find(x=>x.id===id).name+' ×'+count).join('、')+'，已收入道具行囊。');
    if(Object.values(bonusLoot).some(n=>n>0))pushLog(b,'额外资源：'+Object.entries(bonusLoot).filter(([,count])=>count>0).map(([id,count])=>resources[id].name+' +'+count).join('、')+'。');
    if(won)pushLog(b,'幸存部队负重 '+cargoCapacity+'，装载资源 '+b.result.cargoLoaded+'；伤兵不参与搬运。');
    if(lootDiscarded>0)pushLog(b,'负重不足，基础资源有 '+lootDiscarded+' 未能带回。');
    if(bonusDiscarded>0)pushLog(b,'部队负重不足，额外资源有 '+bonusDiscarded+' 未能带回。');
    pushLog(b,'声望 '+(progressionResult.prestigeDelta>=0?'+':'')+progressionResult.prestigeDelta+(won?'；获得珍珠 ×1，可用于进献珍宝。':''));
    save();return b.result;
  }
  function captiveCapacity(){return Math.min(RewardData.captives.maxCapacity,Math.max(100,state.buildings.hall*100+state.buildings.drill*50));}
  function captiveChance(nodeId){const n=getNode(nodeId),r=RewardData.captives;return Math.min(r.maxChance,r.baseChance+Math.max(0,n?.level||0)*r.perLevel);}
  function rollCaptives(b,alive,n){
    const captures=blankArmy(),r=RewardData.captives;
    if(Math.random()>=captiveChance(n.id))return {captures,captureDiscarded:0};
    let escort=Math.min(r.maxPerBattle,Math.floor(totalArmy(alive)*r.escortRatio)),room=Math.max(0,captiveCapacity()-totalArmy(state.captives)),captureDiscarded=0;
    // Shuffle troop types so a large first stack does not always use every escort slot.
    const candidates=b.enemy.filter(row=>r.units.includes(row.id)).map(row=>({row,sort:Math.random()})).sort((a,b)=>a.sort-b.sort);
    for(const {row} of candidates){const eligible=Math.max(0,row.initial-(row.id==='militia'?b.militia:0));if(!eligible)continue;
      const possible=Math.max(1,Math.floor(eligible*(r.minRatio+Math.random()*(r.maxRatio-r.minRatio)))),count=Math.min(possible,escort,room);
      captures[row.id]+=count;state.captives[row.id]+=count;escort-=count;room-=count;captureDiscarded+=possible-count;
    }
    Progression.record(state,'capture',totalArmy(captures));return {captures,captureDiscarded};
  }
  function captiveRecruitQuote(id,count){
    const r=RewardData.captives,u=units[id];count=Math.floor(count);let reason='';
    if(!r.units.includes(id)||!Number.isSafeInteger(count)||count<1||count>state.captives[id])return {reason:'俘虏数量不足',cost:{},people:0};
    const cost={food:count*r.food,gold:count*Math.max(r.minGold,Math.ceil((u.cost.gold||0)*r.goldRatio))},people=count*(u.people||1);
    if(unitRequirements(id))reason='需要 '+unitRequirements(id);else if(people>freePopulation())reason='空闲人口不足，需要 '+people+' 人口';else if(!canPay(cost))reason='招降所需粮食或黄金不足';
    return {reason,cost,people};
  }
  function recruitCaptives(id,count){tick(Date.now(),false);count=Math.floor(count);const q=captiveRecruitQuote(id,count);if(q.reason)return q.reason;
    pay(q.cost);state.population-=q.people;state.captives[id]-=count;state.army[id]+=count;Progression.record(state,'captive_recruit',count);save();return null;
  }
  function captiveRecruitAllQuote(){
    const r=RewardData.captives,cost={food:0,gold:0};let food=Math.max(0,state.res.food),gold=Math.max(0,state.res.gold),peopleLeft=freePopulation(),count=0,people=0;const rows=[];
    for(const id of r.units){const available=state.captives[id]||0;if(!available)continue;const u=units[id],perPeople=u.people||1,perGold=Math.max(r.minGold,Math.ceil((u.cost.gold||0)*r.goldRatio)),needed=unitRequirements(id);let selected=0,reason='';
      if(needed)reason='需要 '+needed;else{selected=Math.max(0,Math.min(available,Math.floor(food/r.food),Math.floor(gold/perGold),Math.floor(peopleLeft/perPeople)));if(selected<available)reason='其余俘虏因粮食、黄金或人口不足暂留营中';}
      rows.push({id,available,count:selected,reason});food-=selected*r.food;gold-=selected*perGold;peopleLeft-=selected*perPeople;count+=selected;people+=selected*perPeople;cost.food+=selected*r.food;cost.gold+=selected*perGold;
    }
    const key=JSON.stringify({rows:rows.filter(row=>row.count>0).map(row=>[row.id,row.count]),cost,people});
    return {rows,count,people,cost,key,reason:count?'':rows.length?'当前没有满足条件且可负担的俘虏':'暂未收容俘虏'};
  }
  function recruitAllCaptives(expectedKey){
    tick(Date.now(),false);const q=captiveRecruitAllQuote();if(typeof expectedKey!=='string'||expectedKey!==q.key)return '招降计划已变化，请重新核对数量和费用';if(q.reason)return q.reason;
    pay(q.cost);state.population-=q.people;for(const row of q.rows)if(row.count){state.captives[row.id]-=row.count;state.army[row.id]+=row.count;}Progression.record(state,'captive_recruit',q.count);save();return null;
  }
  function releaseCaptives(id,count){tick(Date.now(),false);count=Math.floor(count);if(!RewardData.captives.units.includes(id)||!Number.isSafeInteger(count)||count<1||count>state.captives[id])return '俘虏数量不足';state.captives[id]-=count;save();return null;}
  function battleDropInfo(nodeId){
    const n=getNode(nodeId),level=Math.max(0,Math.min(10,n?.level||0)),d=ManualData.battleDrops;
    return {level,itemChance:Math.min(d.itemChanceMax,d.itemChanceBase+level*d.itemChancePerLevel),resourceChance:Math.min(d.resourceChanceMax,d.resourceChanceBase+level*d.resourceChancePerLevel)};
  }
  function rollBattleDrops(n){
    const d=ManualData.battleDrops,info=battleDropInfo(n.id),items={},resourceLoot={};
    const pool=ManualData.shop.filter(item=>item.effect&&!item.rewardOnly).map(item=>({item,weight:item.price>=d.rarePrice?d.rareWeightBase+info.level*d.rareWeightPerLevel:d.commonWeight}));
    function pickItem(){let cursor=Math.random()*pool.reduce((sum,entry)=>sum+entry.weight,0);for(const {item,weight} of pool){cursor-=weight;if(cursor<0){items[item.id]=(items[item.id]||0)+1;return;}}}
    if(pool.length&&Math.random()<info.itemChance){pickItem();if(info.level>=d.secondItemMinLevel&&Math.random()<d.secondItemChance)pickItem();}
    if(Math.random()<info.resourceChance){const keys=Object.keys(resources),count=Math.random()<d.secondResourceChance?2:1;for(let i=0;i<count;i++){const index=Math.floor(Math.random()*keys.length),id=keys.splice(index,1)[0];resourceLoot[id]=Math.round((d.resourceBase+d.resourcePerLevelSquared*info.level*info.level)*(.8+Math.random()*.4));}}
    return {items,resources:resourceLoot};
  }
  function selectExpedition(nodeId){tick();const source=CitySystem.list(state).find(c=>{const d=CitySystem.scope(state,c);return [d.expedition,...d.expeditions].some(e=>e?.node===nodeId);});if(source&&source.id!==currentCityId())switchCity(source.id);if(state.battle&&!state.battle.finished)return '请先完成当前战斗';if(state.expedition?.node===nodeId)return null;const e=state.expeditions.find(x=>x.node===nodeId);if(!e)return '该部队已返回或转入驻军';state.expeditions=state.expeditions.filter(x=>x!==e);if(state.expedition)state.expeditions.push(state.expedition);state.expedition=e;if(state.battle?.finished)state.battle=null;save();return null;}
  function recall(){const e=state.expedition;if(e?.phase!=='march')return '只有行军中的部队可以召回';const now=Date.now(),progress=Math.max(0,Math.min(1,(now-e.start)/(e.end-e.start))),seconds=Math.max(1,marchQuote(e.node,e.army).returnSeconds*progress);e.phase='return';e.start=now;e.end=now+seconds*1000;save();return null;}
  function dismissBattle(){if(state.battle?.finished){state.battle=null;save();}}

  function unitStats(id,player=true){const u=units[id];if(!player)return {hp:u.hp,atk:u.atk,def:u.def,range:u.range,speed:u.speed};return {hp:Math.round(u.hp*(1+state.tech.supply*.05)),atk:Math.round(u.atk*(1+state.tech.combat*.05)*(activeBuff('drum')?1.1:1)),def:Math.round(u.def*(1+state.tech.protection*.05)*(activeBuff('formation')?1.1:1)),range:Math.round(u.range*(u.range>=1000?1+state.tech.shooting*.05:1)),speed:Math.round(u.speed*(u.kind==='infantry'?1+state.tech.march*.1:1+state.tech.riding*.05))};}
  function carry(army){return Math.floor(Object.entries(army).reduce((v,[id,n])=>v+units[id].carry*n,0)*(1+state.tech.load*.1));}
  function capLoot(loot,limit){const total=Object.values(loot).reduce((v,n)=>v+n,0),factor=Math.min(1,limit/Math.max(1,total));return Object.fromEntries(Object.entries(loot).map(([k,n])=>[k,Math.floor(n*factor)]));}
  function lootPreview(id,mode,army){
    const n=getNode(id),info=attackInfo(id,mode),capacity=carry(army),loot=capLoot(info?.loot||{},capacity),loaded=Object.values(loot).reduce((v,n)=>v+n,0);
    const supply=n&&totalArmy(army)>0?Math.ceil(totalArmy(army)*1.2+n.time*2):0,stock={...state.res,food:Math.max(0,state.res.food-supply)};
    return {capacity,loot,loaded,discarded:Object.values(info?.loot||{}).reduce((v,n)=>v+n,0)-loaded,storage:storageQuote(loot,stock,true)};
  }
  function researchCost(id){return ReferenceRules.researchRows[id]?.[state.tech[id]+1]?.cost||{};}
  const researchSeconds=id=>Math.max(1,Math.floor((ReferenceRules.researchRows[id]?.[state.tech[id]+1]?.seconds||1)/(1+general(HeritageSystem.effectiveHero(state,'research')).wis/100)*(1-(state.tech.researching||0)*.03)/state.speed));
  const armyLimit=()=>Math.floor(state.buildings.drill*10000*(activeBuff('flag')?1.25:1));
  function enqueueResearch(id){if(!ManualData.technology[id])return '科技不存在';if(state.buildings.academy<1)return '请先建造书院';if(state.researchQueue)return '书院正在研究另一项科技';if(state.tech[id]>=10)return '科技已满级';const level=state.tech[id]+1;const requirement=researchRequirements(id);if(requirement)return '需要 '+requirement;const cost=researchCost(id);if(!canPay(cost))return '研究资源不足';pay(cost);const start=Date.now();state.researchQueue={id,level,start,end:start+researchSeconds(id)*1000};return null;}
  function research(id){tick(Date.now(),false);const error=enqueueResearch(id);if(!error)save();return error;}
  function autoResearchCandidates(){
    return Object.keys(ManualData.technology).filter(id=>state.tech[id]<10&&!researchRequirements(id)).sort((a,b)=>AutomationSystem.rank(state,a)-AutomationSystem.rank(state,b)||state.tech[a]-state.tech[b]);
  }
  function processAutoResearch(){
    if(!state.autoResearch||state.researchQueue||state.buildings.academy<1)return false;
    const id=autoResearchCandidates().find(id=>AutomationSystem.canSpend(state,researchCost(id)));
    if(!id||enqueueResearch(id))return false;
    save();return true;
  }
  function autoResearchStatus(){
    if(!state.autoResearch)return '已暂停；已开始的研究继续完成';
    if(state.researchQueue){const q=state.researchQueue;return '正在研究：'+ManualData.technology[q.id].name+' '+q.level+' 级，完成后自动接续';}
    if(state.buildings.academy<1)return '等待建造书院';
    if(Object.values(state.tech).every(level=>level>=10))return '全部科技已满级';
    const candidates=autoResearchCandidates();
    if(!candidates.length)return '等待满足科技前置条件，请升级建筑或相关科技';
    return candidates.some(id=>AutomationSystem.canSpend(state,researchCost(id)))?'资源充足，准备研究':'资源不足或达到保留额度，等待积累';
  }
  function setAutoResearch(enabled){
    if(typeof enabled!=='boolean')return '请选择自动研究状态';
    tick(Date.now(),false);state.autoResearch=enabled;
    if(enabled)processAutoResearch();save();return null;
  }
  function setAutomationSettings(settings){
    if(!AutomationSystem.settingsValid(settings))return '挂机设置无效：保留数量须为 0–10 亿之间的整数';
    tick(Date.now(),false);const a=state.automation;
    a.researchFocus=settings.researchFocus;a.researchPriority=settings.researchPriority;a.reserve={...settings.reserve};a.notify=settings.notify;
    processPlotTemplate();processAutoUpgrade();processAutoResearch();save();return null;
  }
  function readAutomationNotices(){state.automation.notices.forEach(n=>n.read=true);save();}
  const scout=(id,count=1,key)=>dispatchScout(id,count,key);
  function intel(id){if(getNode(id)?.orderRoute||getNode(id)?.chapter===2)return {exact:true,public:true};const report=ScoutSystem.intel(state,id);if(report)return report;const entry=state.scouted[id];return entry&&Date.now()-entry.at<((15+entry.level*5)*60000)?{...entry,exact:entry.level>=5,legacy:true}:null;}
  function troopBand(n){if(n===0)return '无';const bands=[[10,'几个'],[25,'少数'],[50,'小队'],[100,'一些'],[250,'一群'],[500,'许多'],[1000,'大队'],[2500,'大群'],[5000,'大批'],[10000,'巨量'],[Infinity,'无数']];return bands.find(([max])=>n<max)[1];}
  function npcName(id,n){return n?.wild?ManualData.npcNames[id]||units[id].name:units[id].name;}
  function refreshInn(){tick();if(state.buildings.inn<1)return '请先建造客栈';const surnames=['魏','邵','程','陆','叶','夏','徐','陶','苏','韩','沈','顾','温','卫','裴','秦'],given=['衡','舟','川','岚','松','宁','瑜','晏','澄','朗','珩','越','砚','骁','岑','翊'];const taken=new Set(state.customGenerals.map(g=>g.name));state.innCandidates=Array.from({length:state.buildings.inn},(_,i)=>{const number=Date.now()+i,seed=hash(number%10000,i),level=1+seed%Math.max(1,state.buildings.inn*2);let k=seed%256;for(let n=0;n<256&&taken.has(surnames[k%16]+given[Math.floor(k/16)]);n++)k=(k+1)%256;const name=surnames[k%16]+given[Math.floor(k/16)];taken.add(name);return {id:'local_'+number,name,level,atk:35+seed%46,def:35+Math.floor(seed/5)%46,pol:35+Math.floor(seed/13)%46,wis:35+Math.floor(seed/17)%46,lead:level*10,price:level*1000,type:'将',title:'客栈游士',desc:'愿以一身所学，助城池安稳发展。',bonus:['spear','archer','shield'][seed%3]};});save();return null;}
  function recruit(id){tick();const hero=state.innCandidates.find(g=>g.id===id);if(!hero)return '候选已离开';if(HeroSystem.wild.roomUsed(state)>=heroCapacity())return '招贤馆没有空闲房间（包含被俘将领）';if(state.customGenerals.length+HeroSystem.wild.heldCaptives(state)>=100)return '将领总量已达上限';if(state.res.gold<hero.price)return '黄金不足';state.res.gold-=hero.price;state.customGenerals.push(hero);state.generals.push(hero.id);state.generalLevels[hero.id]=hero.level;state.generalXp[hero.id]=0;state.innCandidates=state.innCandidates.filter(g=>g.id!==id);HeroSystem.init(state);save();return null;}
  function tradeQuote(resource,buy=true){
    const scale=state.buildings.market*100000;
    if(!Object.hasOwn(resources,resource)||resource==='gold')return {limit:0,reason:'请选择可交易资源'};
    const room=Math.max(0,Math.floor(capacity(buy?resource:'gold')-state.res[buy?resource:'gold'])),stock=Math.max(0,Math.floor(state.res[buy?'gold':resource])),limit=Math.min(scale,stock,buy?Math.max(0,Math.floor(Number.MAX_SAFE_INTEGER-state.res[resource])):room);
    const reason=scale<1?'请先建造市场':!buy&&room<1?'黄金已满仓，当前不能卖出':stock<1?(buy?'黄金不足':'资源不足'):'';
    const warning=buy&&room<limit?(room===0?'该资源已满仓，仍可购买；成交后暂时超仓。':'购买超过仓储空位时可暂时超仓。'):'';
    return {scale,room,stock,limit,reason,warning};
  }
  function trade(resource,count,buy){
    tick();if(!Number.isFinite(Number(count)))return '请输入有效交易数量';count=Math.floor(Number(count));const q=tradeQuote(resource,buy);
    if(q.reason)return q.reason;if(!Number.isSafeInteger(count)||count<1)return '请输入至少 1 的交易数量';if(count>q.limit)return '当前最多可'+(buy?'买入':'卖出')+' '+q.limit;
    if(buy){state.res.gold-=count;state.res[resource]+=count;}else{state.res[resource]-=count;state.res.gold+=count;}
    Progression.record(state,'trade',count);Progression.record(state,buy?'trade_buy':'trade_sell',count);save();return null;
  }
  function brickPurchaseRemaining(id){return RewardData.goldBricks.some(b=>b.id===id)?Math.max(0,RewardData.dailyBrickLimit-(state.daily.brickPurchases[id]||0)):null;}
  function grantTestSupplies(){
    tick(Date.now(),false);const amount=RewardData.testSupplyAmount;
    if(Object.keys(resources).some(id=>!Number.isFinite(state.res[id])||state.res[id]>Number.MAX_SAFE_INTEGER-amount))return '资源数值已达上限';
    addSupplies(Object.fromEntries(Object.keys(resources).map(id=>[id,amount])));save();return null;
  }
  function buyItem(id,count=1){tick(Date.now(),false);const item=ManualData.shop.find(x=>x.id===id);count=Math.floor(count);if(item?.rewardOnly)return '此物品仅由成长礼包获得，不能购买';if(!item?.effect)return '该道具依赖尚未接入的系统，暂不出售';if(!Number.isSafeInteger(count)||count<1||count>99)return '请选择购买数量';const remaining=brickPurchaseRemaining(id);if(remaining!==null&&count>remaining)return '该种金砖每日限购 '+RewardData.dailyBrickLimit+' 块，今日剩余 '+remaining+' 块';if(state.gems<item.price*count)return '试玩元宝不足';state.gems-=item.price*count;state.inventory[id]=(state.inventory[id]||0)+count;if(remaining!==null)state.daily.brickPurchases[id]+=count;save();return null;}
  function speedupKey(kind,q){return kind+':'+(kind==='build'?(q.plot===undefined?'site'+q.site:'plot'+q.plot):q.id)+':'+q.start;}
  function speedupQueue(kind){return kind==='build'?state.buildQueue:kind==='train'?state.trainQueue:kind==='research'&&state.researchQueue?[state.researchQueue]:[];}
  function speedupTargets(kind,now=Date.now()){
    return speedupQueue(kind).filter(q=>q.end>now).map(q=>({key:speedupKey(kind,q),name:kind==='build'?(q.plot===undefined?'城内 '+(q.site+1)+'号':'城外 '+(q.plot+1)+'号')+' · '+buildings[q.id].name+' → '+q.level+' 级':kind==='train'?units[q.id].name+' ×'+q.count:ManualData.technology[q.id].name+' → '+q.level+' 级',waitSeconds:Math.max(0,q.start-now)/1000,workSeconds:Math.max(0,q.end-Math.max(now,q.start))/1000}));
  }
  function speedupQuote(itemId,key,now=Date.now()){
    const item=ManualData.shop.find(i=>i.id===itemId);if(item?.effect!=='speedup')return {error:'请选择加速道具'};
    const q=speedupQueue(item.queueKind).find(q=>speedupKey(item.queueKind,q)===key&&q.end>now);if(!q)return {error:'这项任务已结束或队列已变化，请重新选择'};
    const spec=item.speedup,workMs=q.end-Math.max(now,q.start),waitMs=Math.max(0,q.start-now),minMs=spec.ratio?Math.ceil(workMs*spec.ratio):spec.minHours?spec.minHours*3600000:spec.seconds*1000,maxMs=spec.maxHours?spec.maxHours*3600000:minMs;
    return {error:null,workMs,waitMs,minMs,maxMs,afterMinMs:Math.max(0,workMs-maxMs),afterMaxMs:Math.max(0,workMs-minMs),overflow:maxMs>workMs};
  }
  function freeFinishReady(q,now=Date.now()){return !!q&&q.start<=now&&q.end>now&&q.end-now<=FREE_FINISH_MS;}
  function freeFinishBuild(key){
    if(typeof OnlineClient!=='undefined'&&OnlineClient.shared?.())return '共享世界暂不支持免费完成';
    const now=Date.now();tick(now,false);const q=state.buildQueue.find(x=>speedupKey('build',x)===key);
    if(!q)return '工程已完成或不存在';if(q.start>now)return '工程尚未开工';if(!freeFinishReady(q,now))return '剩余时间超过 5 分钟，可使用加速道具';
    q.start=Math.min(q.start,now-1);q.end=now;tick(now,false,true);processAutoUpgrade();processAutoResearch();save();return null;
  }
  function useSpeedup(itemId,key){
    const now=Date.now();tick(now,false);const item=ManualData.shop.find(i=>i.id===itemId),quote=speedupQuote(itemId,key,now);
    if(quote.error)return quote;if(!(state.inventory[itemId]>0))return {error:'没有这件加速道具'};
    if(quote.workMs<=1)return {error:'任务即将完成，无需加速'};
    const kind=item.queueKind,queue=speedupQueue(kind),index=queue.findIndex(q=>speedupKey(kind,q)===key),q=queue[index],oldEnd=q.end,spec=item.speedup;
    // Draw only after checking the target and inventory; viewing the preview never rolls.
    const requestedMs=spec.minHours?(spec.minHours+Math.floor(Math.random()*(spec.maxHours-spec.minHours+1)))*3600000:quote.maxMs,base=Math.max(now,q.start),remaining=Math.max(0,quote.workMs-requestedMs);
    if(!remaining&&q.start<=now)q.start=Math.min(q.start,now-1);
    q.end=Math.max(q.start+1,base+remaining);const removedMs=oldEnd-q.end;
    if(kind==='train')for(const next of queue.slice(index+1)){next.start-=removedMs;next.end-=removedMs;}
    state.inventory[itemId]--;Progression.record(state,'item',1,now);
    // Settle immediate completions even when the clock matches the preceding tick.
    tick(now,false,true);processAutoUpgrade();processAutoResearch();save();
    return {error:null,requestedMs,removedMs,completed:q.end<=now,waitMs:quote.waitMs};
  }
  function itemUseQuote(id,count=1,heroId){
    const item=ManualData.shop.find(x=>x.id===id),owned=state.inventory[id]||0;
    const timed=['labor','heal','politics','valor','wisdom','tiger','drum','formation'].includes(item?.effect);
    const batch=item?.effect==='gold'||item?.effect==='population'||timed;
    let max=batch?owned:Math.min(1,owned),gold=0,seconds=0,population=0;
    const needsHero=['politics','valor','wisdom','tiger'].includes(item?.effect);
    if(item?.effect==='gold')max=Math.min(max,Math.max(0,Math.floor((Number.MAX_SAFE_INTEGER-state.res.gold)/item.gold)));
    if(item?.effect==='population')max=Math.min(max,Math.max(0,Math.ceil((maxPop()-state.population)/Math.max(100,maxPop()*.2))));
    if(timed){const key=item.effect+(needsHero?':'+heroId:'');max=Math.min(max,Math.max(0,Math.floor((8640000000000000-Math.max(Date.now(),state.buffs[key]?.end||0))/(item.seconds*1000))));}
    let error=!item?.effect?'该道具尚不能使用':!owned?'没有可使用的道具':!Number.isSafeInteger(count)||count<1?'请输入至少 1 的整数数量':count>owned?'道具数量不足，当前持有 '+owned+' 个':!batch&&count!==1?'该道具每次只能使用 1 个':needsHero&&!state.generals.includes(heroId)?'请选择将领':count>max?(item.effect==='population'?'人口已达上限或数量超过本次所需':'本次最多可使用 '+max+' 个'):null;
    if(!error){if(item.effect==='gold')gold=item.gold*count;if(timed)seconds=item.seconds*count;if(item.effect==='population')population=Math.min(maxPop()-state.population,Math.max(100,maxPop()*.2)*count);}
    return {error,owned,max,batch,count,gold,seconds,population};
  }
  function useItem(id,heroId,text,count=1){tick();const quote=itemUseQuote(id,count,heroId);if(quote.error)return quote.error;const item=ManualData.shop.find(x=>x.id===id),effect=item.effect;
    if(['jewelBox','equipmentBox'].includes(effect))return OnboardingSystem.openItem(id,text);
    if(effect==='heroReset')return HeroSystem.reset(heroId);
    if(effect==='equipmentRack')return HeroSystem.expand(id);
    if(effect==='equipmentMaterial')return '强化宝珠在装备详情中使用';
    if(effect==='speedup')return useSpeedup(id,text).error;
    if(effect==='blueprint')return '图纸在建筑升至 10 级时自动消耗，请在建筑页面使用';
    if(['politics','valor','wisdom','tiger'].includes(effect)&&!state.generals.includes(heroId))return '请选择将领';
    if(effect==='gold'){state.res.gold+=quote.gold;}
    else if(effect==='population'){if(state.population>=maxPop())return '人口已达上限';state.population=Math.min(maxPop(),state.population+quote.population);}
    else if(effect==='peace'){if((state.itemCooldowns.peace||0)>Date.now())return '安民告示仍在 3 天冷却';state.morale=100;state.unrest=0;state.itemCooldowns.peace=Date.now()+259200000;}
    else if(effect==='recruit'){const error=refreshInn();if(error)return error;}
    else if(['rename','banner'].includes(effect)){const value=String(text||'').trim();if(!value||value.length>(effect==='rename'?12:2))return '名称长度不合适';state[effect==='rename'?'ruler':'banner']=value;}
    else{const key=effect+(['politics','valor','wisdom','tiger'].includes(effect)?':'+heroId:'');const end=effect==='flag'?Date.now()+86400000:Math.max(Date.now(),state.buffs[key]?.end||0)+item.seconds*1000*count;state.buffs[key]={effect,general:heroId||null,end};}
    state.inventory[id]-=count;Progression.record(state,'item',count);save();return null;
  }
  function starterGiftPending(){return OnboardingSystem.available(state).length>0;}
  function starterGiftRemaining(){return {...OnboardingSystem.quote(state,1).resources};}
  function addSupplies(reward){for(const [id,n] of Object.entries(reward))state.res[id]+=n;}
  function claimStarterGift(){
    return OnboardingSystem.claim(1);
  }
  function claimTrialGems(){if(Date.now()-state.trialGiftAt<86400000)return '试玩补给每天领取一次';state.gems+=1000;state.trialGiftAt=Date.now();save();return null;}
  function setSpeed(value){tick();if(![1,10,60].includes(Number(value)))return '请选择试玩倍率';state.speed=Number(value);save();return null;}
  function setStorage(allocation){const keys=['food','wood','stone','iron'];if(!keys.every(k=>Number.isInteger(Number(allocation[k]))&&Number(allocation[k])>=0&&Number(allocation[k])<=100)||keys.reduce((v,k)=>v+Number(allocation[k]),0)!==100)return '四项比例之和必须是 100%';state.storageAllocation=Object.fromEntries(keys.map(k=>[k,Number(allocation[k])]));save();return null;}
  function buildDefense(id,count){tick();count=Math.floor(count);const d=ManualData.defenses[id];if(!d||count<1||count>10000)return '请输入城防数量';if(state.buildings.wall<d.wall)return '需要城墙 '+d.wall+' 级';for(const [key,level] of Object.entries(d.tech||{}))if(state.tech[key]<level)return '需要 '+ManualData.technology[key].name+' '+level+' 级';const requirement=defenseRequirements(id,count);if(requirement)return '需要 '+requirement;if(state.defenseQueue.length>=1)return '城防工队正在忙碌';const cost=Object.fromEntries(Object.entries(d.cost).map(([k,v])=>[k,v*count]));if(!canPay(cost))return '城防资源不足';pay(cost);const start=Date.now();state.defenseQueue.push({id,count,start,end:start+Math.max(1,count*d.time/(1+state.tech.construction*.1+general(state.governor).pol/100)/state.speed)*1000});save();return null;}

  function awardMission(m){addSupplies(m.reward);for(const [id,n] of Object.entries(m.army||{}))state.army[id]+=n;state.prestige+=300;for(const [id,n] of Object.entries(m.items||{}))state.inventory[id]=(state.inventory[id]||0)+n;for(const [id,n] of Object.entries(m.jewels||{}))state.jewels[id]+=n;state.missionClaims.push(m.id);state.mission=state.missionClaims.length;}
  function claimMission(id){
    tick(Date.now(),false);const m=id?missions.find(x=>x.id===id):currentMission();
    if(!m)return '任务已全部完成';if(missionClaimed(m.id))return '该任务奖励已领取';if(!missionReady(m))return '目标尚未达成';
    awardMission(m);save();return null;
  }
  function claimReadyMissions(){
    tick(Date.now(),false);const ready=missions.filter(m=>missionReady(m));if(!ready.length)return '暂无可领取奖励';
    for(const m of ready)awardMission(m);save();return null;
  }
  function progressionAction(action,...args){tick(Date.now(),false);const error=Progression[action](state,...args);if(!error)save();return error;}
  const acceptDaily=uid=>progressionAction('accept',uid),abandonDaily=uid=>progressionAction('abandon',uid),claimDaily=uid=>progressionAction('claim',uid),donateEpic=(kind,id)=>progressionAction('donate',kind,id),exchangeCopper=id=>progressionAction('exchange',id);
  const claimDailyMilestone=count=>progressionAction('claimMilestone',Number(count));
  const claimReadyDaily=()=>progressionAction('claimReady');
  function reset(){try{replaceSave(newState());return null;}catch(error){return error.message||'重新开始失败';}}

  const namedCityProgress=id=>NamedCitySystem.progress(state,id);
  const namedCities=()=>NamedCitySystem.list(state);
  const namedCityDevelopmentQuote=id=>NamedCitySystem.developmentQuote(state,id);
  function claimNamedCityDevelopment(id,key){tick(Date.now(),false);const error=NamedCitySystem.claimDevelopment(state,id,key);if(!error)save();return error;}
  const warCareQuote=(unit='all',count)=>WarCare.quote(state,unit,count);
  function healWounded(unit='all',count,key){tick(Date.now(),false);const result=WarCare.heal(state,unit,count===null?undefined:count,key);if(typeof result==='string')return result;save();return result;}
  function setAutoHeal(enabled){tick(Date.now(),false);const result=WarCare.setAuto(state,enabled);if(typeof result==='string')return result;WarCare.tick(state,Date.now());save();return null;}
  function setDefenseDoctrine(preset){tick(Date.now(),false);const result=WarCare.setDefense(state,preset);if(typeof result==='string')return result;save();return null;}
  function resolveCityDefense(){let result=null;for(let i=0;i<30&&state.cityDefense.battle;i++){result=cityDefenseRound();if(typeof result==='string')return result;}return result;}
  const governanceStatus=()=>GovernanceSystem.status(state,Date.now());
  const salaryQuote=(id='all')=>GovernanceSystem.salaryQuote(state,id);
  function payHeroArrears(id,key){tick(Date.now(),false);const error=GovernanceSystem.payArrears(state,id,key,Date.now());if(!error)save();return error;}
  function setGovernancePolicy(kind,enabled){tick(Date.now(),false);const error=GovernanceSystem.setPolicy(state,kind,enabled,Date.now());if(!error)save();return error;}
  const defeatedHeroQuote=(id,method='gold')=>GovernanceSystem.captiveQuote(state,id,method);
  function recruitDefeatedHero(id,method,key){tick(Date.now(),false);const error=GovernanceSystem.recruitCaptive(state,id,method,key,Date.now());if(!error)save();return error;}
  const api={legacyWildTile,webEditionAction:(type,...args)=>WebEdition.execute(type,args),namedCityProgress,namedCities,namedCityDevelopmentQuote,claimNamedCityDevelopment,plotMaxLevel,warCareQuote,healWounded,setAutoHeal,setDefenseDoctrine,resolveCityDefense,governanceStatus,salaryQuote,payHeroArrears,setGovernancePolicy,defeatedHeroQuote,recruitDefeatedHero,cityStrategy,battleTacticsView,battleTacticQuote,submitBattleTactic,cancelBattleTactic,heroIdentity,startTacticalLesson,lessonInfo,currentBattle:()=>lessonSession?.battle||state.battle,lessonRound,lessonOrder,lessonAllOrders,lessonTarget,lessonTactic,lessonCancelTactic,endTacticalLesson,setExternalGeneralBusy,domesticStrategyAvailable,supplyLines,supplyLineQuote,saveSupplyLine,setSupplyLineEnabled,removeSupplyLine,heroAdministrationQuote,prepareHeroAdministration,regionFrontQuote,regionalFrontStatus,startRegionalFront,cityMeta,citySummary,cityList,currentCityId,currentHome,heroCity,heroCapacity,cityLimit,getCityState,switchCity,enterOwnedCity,foundCityQuote,foundCity,transportQuote,sendTransport,redeployQuote,redeployArmy,logisticsList,recallLogistics,scoutQuote,dispatchScout,trainGeneralSkill,generalGrowth:GeneralGrowth,enterOnlineSession,leaveOnlineSession,applyOnlineSnapshot,authorityActive:()=>onlineAuthority,saveOfflineInfo:()=>lastOffline,openSaveSession,respondSaveTakeover,saveBlockReason,saveSessionInfo,exportStoredRaw,restoreSaveBackup,takeOverSaveSession,releaseSaveSession,completeFirstBattleGuide,warOrders:WarOrders,onboarding:OnboardingSystem,buildingConditions,requirementLevel,requestCityDefense,setAutoCityDefense,startCityDefense,cityDefenseRound,endDefenseDrill,brickPurchaseRemaining,grantTestSupplies,captiveCapacity,captiveChance,captiveRecruitQuote,captiveRecruitAllQuote,recruitAllCaptives,recruitCaptives,releaseCaptives,claimDailyMilestone,claimReadyDaily,defenseCapacity,defenseUsed,defenseRequirements,armyPeople,buildingRuleText,researchRequirements,researchRuleText,buildingRequirements,speedupKey,speedupTargets,speedupQuote,useSpeedup,progression:Progression,acceptDaily,abandonDaily,claimDaily,donateEpic,exchangeCopper,countyUnlocked:()=>Progression.countyUnlocked(state),init,tick,save,reset,validSave,migrateSave,importSave,get state(){return state;},get uiState(){return state;},allExpeditions:everyExpedition,selectExpedition,resources,buildings,cityIds,plotTypes,PLOT_COUNT,unlockedPlots,plotJob,plotCost,plotTime,plotYield,developPlot,plotTemplates:PlotTemplateData.templates,plotTemplateQuote,setPlotTemplate,applyPlotTemplate,pausePlotTemplate,plotTemplateStatus,economyOutputFactor:ECONOMY_OUTPUT_FACTOR,lootPreview,isCity,generalBusy,wildOwned,attackBlocked,attackInfo,battleDropInfo,recallGarrison,abandonWild,buildRecord,buildSeconds,researchSeconds,armyLimit,primarySite,queueBuilding,cancelBuild,demolish,buildLimit,setAutoUpgrade,autoUpgradeStatus,setAutoResearch,autoResearchStatus,setAutomationSettings,readAutomationNotices,automation:AutomationSystem,freePopulation,workers,unitRequirements,trainSeconds,trainingLimit,dismissTroops,unitStats,marchQuote,carry,upkeep,researchCost,research,scout,intel,troopBand,npcName,refreshInn,recruit,tradeQuote,trade,buyItem,itemUseQuote,useItem,claimStarterGift,starterGiftPending,starterGiftRemaining,starterGiftReward,claimReadyMissions,missionClaimed,missionReady,currentMission,claimTrialGems,setSpeed,setStorage,buildDefense,manual:ManualData,units,get generals(){return [...generals,...(state?.customGenerals||[])];},nodes,WORLD_SIZE,home,landmarks,landmarkVisible,landmarkReached,nextLandmark,terrainTypes,getWorldTile,getNode,relocateBuilding,missions,rates,maxPop,committed,capacity,canPay,upgradeCost,upgrade,unitUnlocked,trainCost,train,general,setGovernor,setTax,civicOrderPreview,executeCivicOrder,power,totalArmy,dispatch,startBattle,battleRound,setBattleOrder,setBattleOrders,setTactic,recall,dismissBattle,claimMission};
  api.freeFinishBuild=freeFinishBuild;api.freeFinishReady=freeFinishReady;
  const actions=['freeFinishBuild','webEditionAction','claimNamedCityDevelopment','healWounded','setAutoHeal','setDefenseDoctrine','resolveCityDefense','payHeroArrears','setGovernancePolicy','recruitDefeatedHero','submitBattleTactic','cancelBattleTactic','saveSupplyLine','setSupplyLineEnabled','removeSupplyLine','prepareHeroAdministration','startRegionalFront','switchCity','enterOwnedCity','foundCity','sendTransport','redeployArmy','recallLogistics','dispatchScout','trainGeneralSkill','completeFirstBattleGuide','requestCityDefense','setAutoCityDefense','startCityDefense','cityDefenseRound','endDefenseDrill','grantTestSupplies','recruitAllCaptives','recruitCaptives','releaseCaptives','claimDailyMilestone','claimReadyDaily','acceptDaily','abandonDaily','claimDaily','donateEpic','exchangeCopper','selectExpedition','developPlot','setPlotTemplate','applyPlotTemplate','pausePlotTemplate','recallGarrison','abandonWild','queueBuilding','cancelBuild','demolish','setAutoUpgrade','setAutoResearch','setAutomationSettings','readAutomationNotices','dismissTroops','research','scout','refreshInn','recruit','trade','buyItem','useItem','claimStarterGift','claimReadyMissions','claimTrialGems','setSpeed','setStorage','buildDefense','relocateBuilding','upgrade','train','setGovernor','setTax','executeCivicOrder','dispatch','startBattle','battleRound','setBattleOrder','setBattleOrders','setTactic','recall','dismissBattle','claimMission'];
  for(const name of actions){const action=api[name];api[name]=(...args)=>{const error=saveBlockReason();if(error)return error;const result=action(...args);return ['write-error','read-error','readonly','conflict'].includes(saveMode)?saveReason:result;};}
  api.useSpeedup=(...args)=>{const error=saveBlockReason();if(error)return {error};const result=useSpeedup(...args);return saveMode==='active'?result:{error:saveReason};};
  return api;
})();
if(typeof module!=='undefined')module.exports=Game;

 Game.setExternalGeneralBusy(externalBusy);
 Game.init();
 if(!Game.validSave(Game.state)||!Game.saveSessionInfo().writable)throw new Error('Invalid canonical game state');
 return {Game,HeroSystem,HeritageSystem,WarCare,GovernanceSystem,NamedCityData,NamedCitySystem,NPCDefense,NPCDefenseData,Progression,ChapterData,ManualData,WarOrders,OnboardingSystem};
}
