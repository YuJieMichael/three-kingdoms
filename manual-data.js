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
