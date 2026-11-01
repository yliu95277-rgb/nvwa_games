export type BuildingId = 'palace' | 'tavern' | 'barracks' | 'forge' | 'market';
export interface Result { ok: boolean; message: string }
export interface Resources { gold: number; grain: number; jade: number }
const ids: BuildingId[] = ['palace','tavern','barracks','forge','market'];
/** Caller owns storage: new GameState(localStorage.getItem(key)), then serialize after mutations. */
export class GameState {
 resources: Resources = {gold:128600,grain:36800,jade:1280};
 levels: Record<BuildingId,number> = {palace:1,tavern:1,barracks:1,forge:1,market:1};
 heroes: string[] = ['关羽']; dailyClaimed=false; mailClaimed=false; victories=0;
 constructor(saved?: string | null) {
  if(!saved) return;
  try { const s=JSON.parse(saved); if(s.version!==1) return;
   for(const k of ['gold','grain','jade'] as const) if(Number.isFinite(s.resources?.[k])) this.resources[k]=Math.max(0,Math.floor(s.resources[k]));
   for(const k of ids) if(Number.isInteger(s.levels?.[k])) this.levels[k]=Math.max(1,Math.min(10,s.levels[k]));
   if(Array.isArray(s.heroes)) this.heroes=s.heroes.filter((h: unknown)=>typeof h==='string').slice(0,20);
   this.dailyClaimed=s.dailyClaimed===true;this.mailClaimed=s.mailClaimed===true;this.victories=Math.max(0,Number(s.victories)||0);
  }catch { /* Corrupt saves retain fresh playable state. */ }
 }
 serialize():string {return JSON.stringify({version:1,resources:this.resources,levels:this.levels,heroes:this.heroes,dailyClaimed:this.dailyClaimed,mailClaimed:this.mailClaimed,victories:this.victories});}
 upgradeCost(id:BuildingId):Resources {return {gold:1000*this.levels[id],grain:400*this.levels[id],jade:0};}
 upgrade(id:BuildingId):Result {
  if(!ids.includes(id)) return {ok:false,message:'未知建筑'};
  if(this.levels[id]>=10)return {ok:false,message:'已达最高等级'};
  const c=this.upgradeCost(id);if(this.resources.gold<c.gold||this.resources.grain<c.grain)return {ok:false,message:'资源不足'};
  this.resources.gold-=c.gold;this.resources.grain-=c.grain;this.levels[id]++;return {ok:true,message:'建筑升级成功'};
 }
 recruit():Result {const roster=['张飞','赵云','黄忠','诸葛亮'];const h=roster.find(x=>!this.heroes.includes(x));if(!h)return {ok:false,message:'本期武将已全部招募'};if(this.resources.jade<100)return {ok:false,message:'玉璧不足'};this.resources.jade-=100;this.heroes.push(h);return {ok:true,message:'招募成功：'+h};}
 claimDaily():Result {if(this.dailyClaimed)return {ok:false,message:'本期奖励已领取'};this.dailyClaimed=true;this.resources.gold+=2000;this.resources.grain+=1000;return {ok:true,message:'获得铜钱 2000、粮草 1000'};}
 claimMail():Result {if(this.mailClaimed)return {ok:false,message:'邮件已领取'};this.mailClaimed=true;this.resources.jade+=200;return {ok:true,message:'获得玉璧 200'};}
 /** Battle reward is guarded by the battle instance to prevent duplicate collection. */
 collectBattle(battle:BattleModel):Result {if(battle.status!=='won'||battle.rewardClaimed)return {ok:false,message:'暂无战利品'};battle.rewardClaimed=true;this.victories++;this.resources.gold+=3000;this.resources.grain+=1200;return {ok:true,message:'守城胜利！铜钱 +3000，粮草 +1200'};}
}
export interface Point {x:number;y:number}
export interface Enemy extends Point {id:number;hp:number;maxHp:number;progress:number;speed:number}
export interface Tower extends Point {id:number;level:number;cooldown:number}
export interface Projectile {from:Point;to:Point;life:number}
/** Normalized coordinates; renderer converts x/y to viewport units. */
export class BattleModel {
 readonly path:Point[]=[{x:0,y:.22},{x:.22,y:.22},{x:.22,y:.55},{x:.57,y:.55},{x:.57,y:.28},{x:.82,y:.28},{x:.82,y:.8},{x:1,y:.8}];
 readonly slots:Point[]=[{x:.13,y:.4},{x:.35,y:.4},{x:.45,y:.7},{x:.69,y:.43},{x:.7,y:.7},{x:.92,y:.57}];
 towers:Tower[]=[];enemies:Enemy[]=[];projectiles:Projectile[]=[];
 gold=220; lives=10;wave=0;status:'ready'|'running'|'won'|'lost'='ready';rewardClaimed=false;
 private pending=0;private spawnTimer=0;private nextId=0;
 buildTower(slot:number):Result {if(this.status==='won'||this.status==='lost')return {ok:false,message:'战斗已结束'};if(!this.slots[slot])return {ok:false,message:'无效塔位'};if(this.towers.some(t=>t.id===slot))return {ok:false,message:'此处已有箭塔'};if(this.gold<60)return {ok:false,message:'军资不足，需要 60'};this.gold-=60;this.towers.push({...this.slots[slot],id:slot,level:1,cooldown:0});return {ok:true,message:'箭塔建造完成'};}
 startWave():Result {if(this.status!=='ready')return {ok:false,message:'请先完成当前波次'};this.wave++;this.pending=5+this.wave*2;this.spawnTimer=0;this.status='running';return {ok:true,message:'第 '+this.wave+' 波敌军来袭'};}
 tick(dt:number):void {if(!Number.isFinite(dt)||dt<=0||this.status!=='running')return;let remaining=Math.min(dt,2);while(remaining>0){const step=Math.min(.05,remaining);this.step(step);remaining-=step;if(this.status!=='running')break;}}
 private position(progress:number):Point {const scaled=Math.min(.99999,progress)*(this.path.length-1);const i=Math.floor(scaled),f=scaled-i;const a=this.path[i],b=this.path[i+1];return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}
 private step(dt:number):void {
  this.spawnTimer-=dt;if(this.pending>0&&this.spawnTimer<=0){this.pending--;this.spawnTimer=.8;const hp=32+this.wave*13;this.enemies.push({id:this.nextId++,hp,maxHp:hp,progress:0,speed:.034+this.wave*.003,...this.path[0]});}
  for(const e of this.enemies){e.progress+=dt*e.speed;Object.assign(e,this.position(e.progress));if(e.progress>=1){this.lives--;e.hp=0;}}
  for(const t of this.towers){t.cooldown-=dt;if(t.cooldown>0)continue;const target=this.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-t.x,e.y-t.y)<.32).sort((a,b)=>b.progress-a.progress)[0];if(target){target.hp-=18;t.cooldown=.5;this.projectiles.push({from:{x:t.x,y:t.y},to:{x:target.x,y:target.y},life:.15});if(target.hp<=0)this.gold+=12;}}
  this.enemies=this.enemies.filter(e=>e.hp>0);for(const p of this.projectiles)p.life-=dt;this.projectiles=this.projectiles.filter(p=>p.life>0);
  if(this.lives<=0){this.status='lost';return;}if(this.pending===0&&this.enemies.length===0){this.status=this.wave>=3?'won':'ready';this.gold+=35;}
 }
}
