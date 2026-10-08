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
