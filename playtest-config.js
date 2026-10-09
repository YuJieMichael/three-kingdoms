'use strict';
// Public single-player playtest (production/milestones/public-playtest.md): online entries, the test-supply
// tool and not-yet-usable shop items stay hidden. Open the page with ?dev to show them again.
const PlaytestConfig=(()=>{
  let dev=false;try{dev=typeof location!=='undefined'&&new URLSearchParams(location.search).has('dev');}catch{}
  return {dev,online:dev,testSupplies:dev,unavailableShopItems:dev};
})();
