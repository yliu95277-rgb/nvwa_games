// Node 24+, no third-party dependency. Tests production gameplay model directly.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {stripTypeScriptTypes} = require('node:module');
(async () => {
 const source=fs.readFileSync(path.join(__dirname,'../assets/scripts/GameState.ts'),'utf8');
 const {GameState,BattleModel}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
 const fresh=new GameState('{broken');assert.equal(fresh.resources.gold,128600);
 const cost=fresh.upgradeCost('palace');const before={...fresh.resources};assert.equal(fresh.upgrade('palace').ok,true);assert.equal(fresh.levels.palace,2);assert.equal(fresh.resources.gold,before.gold-cost.gold);assert.equal(fresh.resources.grain,before.grain-cost.grain);
 const jade=fresh.resources.jade;assert.equal(fresh.recruit().ok,true);assert.equal(fresh.heroes.length,2);assert.equal(fresh.resources.jade,jade-100);
 fresh.resources.gold=0;assert.equal(fresh.upgrade('palace').ok,false);assert.equal(fresh.levels.palace,2);fresh.resources.jade=0;assert.equal(fresh.recruit().ok,false);assert.equal(fresh.heroes.length,2);
 assert.equal(fresh.claimDaily().ok,true);const daily={...fresh.resources};assert.equal(fresh.claimDaily().ok,false);assert.deepEqual(fresh.resources,daily);
 assert.equal(fresh.claimMail().ok,true);const mail={...fresh.resources};assert.equal(fresh.claimMail().ok,false);assert.deepEqual(fresh.resources,mail);
 const restored=new GameState(fresh.serialize());assert.deepEqual(restored.resources,fresh.resources);assert.deepEqual(restored.levels,fresh.levels);assert.deepEqual(restored.heroes,fresh.heroes);assert.equal(restored.dailyClaimed,true);assert.equal(restored.mailClaimed,true);
 const empty=new BattleModel();assert.equal(empty.buildTower(-1).ok,false);empty.startWave();assert.equal(empty.startWave().ok,false);for(let n=0;n<40000&&empty.status!=='lost';n++){if(empty.status==='ready')empty.startWave();empty.tick(.1)}assert.equal(empty.status,'lost');assert.equal(restored.collectBattle(empty).ok,false);
 const battle=new BattleModel();for(const slot of [0,1,3])assert.equal(battle.buildTower(slot).ok,true);assert.equal(battle.buildTower(0).ok,false);assert.equal(battle.gold,40);
 for(let n=0;n<40000&&!['won','lost'].includes(battle.status);n++){if(battle.status==='ready')battle.startWave();battle.tick(.1);for(let i=0;i<6;i++)if(battle.gold>=60)battle.buildTower(i)}
 assert.equal(battle.status,'won');assert.equal(battle.wave,3);assert.ok(battle.lives>0);const rewardBefore={...restored.resources};assert.equal(restored.collectBattle(battle).ok,true);assert.equal(restored.resources.gold,rewardBefore.gold+3000);assert.equal(restored.resources.grain,rewardBefore.grain+1200);assert.equal(restored.victories,1);assert.equal(restored.collectBattle(battle).ok,false);assert.equal(restored.victories,1);assert.equal(new GameState(restored.serialize()).victories,1);
 const position=battle.enemies.length;battle.tick(NaN);assert.equal(battle.enemies.length,position);
 console.log('PASS: corrupt save; paid upgrade/recruit; insufficient resources; single claim; save restore; defeat; victory; single battle reward');
})().catch(error=>{console.error(error);process.exitCode=1});
