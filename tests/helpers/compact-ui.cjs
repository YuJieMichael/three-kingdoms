const fs=require('node:fs'),path=require('node:path');
function loadCompactUI(e){const source=fs.readFileSync(path.join(__dirname,'../../manual-ui.js'),'utf8');e.evaluate(source.split('\n').filter(l=>/^function (cardDetails|taskIcon|upgradeTime)\(/.test(l)).join('\n'));if(e.evaluate('typeof buildingIcon')!=='function')e.evaluate(`function buildingIcon(id,c=''){return '<span class="'+c+'" aria-label="'+id+'"></span>';}`);}
module.exports={loadCompactUI};
