// Test-only acceptance targets. These are not game rewards or tuning inputs.
// Provenance and boundary semantics: design/balance/growth-gold-targets-2026-10-09.md.
module.exports={
 // All legacy acceptance windows below retain their original comparison operators.
 // Detailed provenance: design/balance/acceptance-targets-2026-10-09.md.
 chapterCampaign:{acceleratedMaxHours:5,normalHours:{min:100,max:220},spentFoodMin:1000000},
 lateGarrisons:{innerCityMin:1600,yellowCityMin:250},
 opening:{giftCapacityMaxRatio:1.5,populationOutputMinRatio:2,firstBattleMaxMinutes:10,minPopulationItems:2,archersMaxMinutes:90},
 hallGrowth:{levelTwoSeconds:480,stepMaxRatio:2,levelTenReferenceMaxRatio:.5,tenGiftsHours:{min:24,max:48},lateWaitHours:{min:1,max:24},finalWaitMaxRatio:2.5},
 growthEconomy:{naturalWoodMin:200,naturalIronMin:500,stockFoodMin:10000,stockStoneMin:30000,governorReductionPercent:{min:7,max:8}},
 growthGold:{
  // starter-gold-tuning-2026-10-05.md: tiers 1+2 = 10,000+20,000.
  openingGiftTotal:30000,
  // Legacy growth-economy regression window; inclusive, seed 123 archer route.
  openingMissionIncome:{min:90000,max:170000},
  // Legacy growth-economy regression window; inclusive, same route after spending.
  openingStock:{min:50000,max:150000},
  // starter-gold-tuning-2026-10-05.md: sum of all ten tiers.
  tenGiftTotal:1000000,
  // Legacy growth-economy regression window; exclusive, twelve-seed ten-gifts route.
  tenGiftStock:{min:100000,max:750000},
 },
};
