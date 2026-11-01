import {Node,UITransform,UIOpacity,JsonAsset,resources,Label} from 'cc';
type LayoutNode={id:string;x:number;y:number;width:number;height:number;rotation:number;scaleX:number;scaleY:number;z:number;visible:boolean;opacity:number;anchorX:number;anchorY:number;parentId:string|null;layerId?:string};
/** Apply authored sprite transforms after city/HUD construction. Missing layout preserves defaults. */
export function applyCityLayout(world:Node,hud:Node,resourceLabels:Label[]=[]):void {
 resources.load('layouts/city-layout',JsonAsset,(error,asset)=>{
  if(error||!world.isValid||!hud.isValid)return;
  const doc=asset.json as {canvas:{width:number;height:number};nodes:LayoutNode[];layers?:{id:string;visible:boolean;z:number}[]};
  if(!doc||doc.canvas?.width!==1672||doc.canvas?.height!==941||!Array.isArray(doc.nodes))return;
  const map=new Map<string,Node>();for(const parent of [world,hud])for(const node of parent.children)map.set(node.name,node);
  const companionNames:Record<string,string[]>={
   'Art_hud-gold':['ResourcePlus_gold'],'Art_hud-grain':['ResourcePlus_grain'],'Art_hud-jade':['ResourcePlus_jade'],
   'Art_hud-activity':['Utility_活动'],'Art_hud-task':['Utility_任务'],'Art_hud-mail':['Utility_邮件'],
   'Art_hud-nav-city':['Nav_主城'],'Art_hud-nav-hero':['Nav_武将'],'Art_hud-nav-formation':['Nav_布阵'],'Art_hud-nav-bag':['Nav_背包'],'Art_hud-nav-alliance':['Nav_联盟'],'Art_hud-campaign':['Campaign']};
  const companions=new Map<string,Node[]>();for(const [id,names] of Object.entries(companionNames))companions.set(id,names.map(name=>map.get(name)).filter((n):n is Node=>!!n));
  ['gold','grain','jade'].forEach((key,i)=>{const label=resourceLabels[i];if(label?.isValid)companions.get('Art_hud-'+key)?.push(label.node);});
  const seen=new Set<string>();const ordered:{node:Node;z:number;layerZ:number}[]=[];
  for(const item of doc.nodes){if(!item||seen.has(item.id)||item.parentId!==null)continue;seen.add(item.id);const node=map.get(item.id);if(!node)continue;
   const layer=doc.layers?.find(l=>l.id===item.layerId);const effectiveVisible=item.visible&&layer?.visible!==false;
   const values=[item.x,item.y,item.width,item.height,item.rotation,item.scaleX,item.scaleY,item.z,item.opacity,item.anchorX,item.anchorY];if(values.some(v=>!Number.isFinite(v))||item.width<=0||item.height<=0)continue;
   const oldUI=node.getComponent(UITransform);const oldW=oldUI?.width||item.width,oldH=oldUI?.height||item.height;const oldX=node.position.x,oldY=node.position.y;
   const sx=item.width/oldW*item.scaleX,sy=item.height/oldH*item.scaleY;const angle=-item.rotation*Math.PI/180,cs=Math.cos(angle),sn=Math.sin(angle);
   // Companion offsets are relative to the artwork's geometric center. Account for an edited anchor.
   const centerX=item.x-836+(0.5-item.anchorX)*item.width*item.scaleX*cs-(0.5-item.anchorY)*item.height*item.scaleY*sn;
   const centerY=470.5-item.y+(0.5-item.anchorX)*item.width*item.scaleX*sn+(0.5-item.anchorY)*item.height*item.scaleY*cs;
   for(const linked of companions.get(item.id)||[]){const dx=(linked.position.x-oldX)*sx,dy=(linked.position.y-oldY)*sy;linked.setPosition(centerX+dx*cs-dy*sn,centerY+dx*sn+dy*cs);linked.setScale(linked.scale.x*sx,linked.scale.y*sy,1);linked.angle-=item.rotation;linked.active=effectiveVisible;const alpha=linked.getComponent(UIOpacity)||linked.addComponent(UIOpacity);alpha.opacity=Math.round(Math.max(0,Math.min(1,item.opacity))*255);}
   node.setPosition(item.x-836,470.5-item.y);node.angle=-item.rotation;node.setScale(item.scaleX,item.scaleY,1);node.active=effectiveVisible;
   const ui=node.getComponent(UITransform);if(ui){ui.setContentSize(item.width,item.height);ui.setAnchorPoint(item.anchorX,item.anchorY);}const flagLabel=node.name.startsWith('Flag_')?node.getComponent(Label):null;if(flagLabel)flagLabel.fontSize=item.height/2.2;const alpha=node.getComponent(UIOpacity)||node.addComponent(UIOpacity);alpha.opacity=Math.round(Math.max(0,Math.min(1,item.opacity))*255);ordered.push({node,z:item.z,layerZ:layer?.z||0});
  }
  // A valid saved document is authoritative: absent authored sprites are deleted.
  for(const [id,node] of map){if((id.startsWith('Art_')||id.startsWith('Flag_'))&&!seen.has(id)){node.active=false;for(const linked of companions.get(id)||[])linked.active=false;}}
  for(const parent of [world,hud]){const entries=ordered.filter(e=>e.node.parent===parent);const slots=entries.map(e=>e.node.getSiblingIndex()).sort((a,b)=>a-b);entries.sort((a,b)=>a.layerZ-b.layerZ||a.z-b.z);entries.forEach((entry,i)=>entry.node.setSiblingIndex(slots[i]));}
 });
}
