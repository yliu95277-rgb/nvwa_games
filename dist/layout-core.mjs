const clone = value => structuredClone(value);
const finite = (v, name, fallback, min=-Infinity, max=Infinity) => { const n=v===undefined?fallback:v; if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error(`Invalid ${name}`);return n; };
const string = (v,name,fallback) => { if(v===undefined&&fallback!==undefined)return fallback;if(typeof v!=='string'||!v.trim())throw Error(`Invalid ${name}`);return v; };
const safeSrc = src => {src=string(src,'asset src');if(/^\s*(javascript|vbscript|file):/i.test(src)||(/[\u0000-\u001f]/.test(src)))throw Error('Unsafe asset src');if(/^data:/i.test(src)&&!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(src))throw Error('Only raster image data URLs are accepted');return src;};
/** Validate version 1; discard unknown fields so imported objects cannot patch prototypes. */
export function validateLayout(input) {
 if(!input||typeof input!=='object'||Array.isArray(input)||input.version!==1)throw Error('Unsupported layout version');
 const canvas=input.canvas;if(!canvas||typeof canvas!=='object')throw Error('Missing canvas');
 if(!Array.isArray(input.assets)||!Array.isArray(input.nodes))throw Error('assets and nodes must be arrays');
 const assetIds=new Set();const assets=input.assets.map(a=>{if(!a||typeof a!=='object')throw Error('Invalid asset');const id=string(a.id,'asset id');if(assetIds.has(id))throw Error('Duplicate asset id');assetIds.add(id);return {id,name:string(a.name,'asset name',id),src:safeSrc(a.src),width:finite(a.width,'asset width',undefined,.01,100000),height:finite(a.height,'asset height',undefined,.01,100000)};});
 const nodeIds=new Set();const nodes=input.nodes.map(n=>{if(!n||typeof n!=='object')throw Error('Invalid node');const id=string(n.id,'node id');if(nodeIds.has(id))throw Error('Duplicate node id');nodeIds.add(id);if(!['image','text'].includes(n.type))throw Error('Invalid node type');
 const out={id,name:string(n.name,'node name',id),type:n.type,x:finite(n.x,'x',0),y:finite(n.y,'y',0),width:finite(n.width,'width',100,.01,100000),height:finite(n.height,'height',100,.01,100000),rotation:finite(n.rotation,'rotation',0),scaleX:finite(n.scaleX,'scaleX',1,.05,20),scaleY:finite(n.scaleY,'scaleY',1,.05,20),z:finite(n.z,'z',0),visible:n.visible===undefined?true:n.visible,locked:n.locked===undefined?false:n.locked,opacity:finite(n.opacity,'opacity',1,0,1),anchorX:finite(n.anchorX,'anchorX',.5,0,1),anchorY:finite(n.anchorY,'anchorY',.5,0,1),parentId:n.parentId??null};
 if(typeof out.visible!=='boolean'||typeof out.locked!=='boolean')throw Error('Invalid visibility/lock flag');if(out.parentId!==null&&typeof out.parentId!=='string')throw Error('Invalid parentId');
 if(n.type==='image'){out.assetId=string(n.assetId,'assetId');if(!assetIds.has(out.assetId))throw Error('Unknown asset reference');}else {if(typeof n.text!=='string')throw Error('Invalid text');out.text=n.text;}
 return out;});
 const byId=new Map(nodes.map(n=>[n.id,n]));for(const n of nodes){const seen=new Set([n.id]);let parent=n.parentId;while(parent!==null){if(!byId.has(parent))throw Error('Unknown parent');if(seen.has(parent))throw Error('Parent cycle');seen.add(parent);parent=byId.get(parent).parentId;}}
 return {version:1,id:string(input.id,'layout id'),name:string(input.name,'layout name'),canvas:{width:finite(canvas.width,'canvas width',undefined,1,100000),height:finite(canvas.height,'canvas height',undefined,1,100000),background:string(canvas.background,'background','#18201a')},assets,nodes};
}
export class LayoutStore {
 #doc;#selected=null;#past=[];#future=[];#listeners=new Set();#transaction=null;
 constructor(doc){this.#doc=validateLayout(doc);}
 get document(){return clone(this.#doc)} get selectedId(){return this.#selected} get canUndo(){return this.#past.length>0} get canRedo(){return this.#future.length>0}
 subscribe(fn){this.#listeners.add(fn);return ()=>this.#listeners.delete(fn)}
 #emit(){const event={document:this.document,selectedId:this.#selected,canUndo:this.canUndo,canRedo:this.canRedo};for(const fn of this.#listeners)fn(event);}
 #record(doc){this.#past.push(clone(doc));if(this.#past.length>100)this.#past.shift();this.#future=[];}
 select(id){if(id!==null&&!this.#doc.nodes.some(n=>n.id===id))throw Error('Unknown selected node');this.#selected=id;this.#emit();}
 commit(doc,{history=true}={}){const next=validateLayout(doc);if(JSON.stringify(next)===JSON.stringify(this.#doc))return;if(history&&!this.#transaction)this.#record(this.#doc);else if(!history&&!this.#transaction)this.#future=[];this.#doc=next;if(this.#selected&&!next.nodes.some(n=>n.id===this.#selected))this.#selected=null;this.#emit();}
 setDocument(doc){const next=validateLayout(doc);this.#doc=next;this.#selected=null;this.#past=[];this.#future=[];this.#transaction=null;this.#emit();}
 updateNode(id,patch,options={}){const doc=this.document;const node=doc.nodes.find(n=>n.id===id);if(!node)throw Error('Unknown node');if(patch.id!==undefined&&patch.id!==id)throw Error('Node id is immutable');Object.assign(node,patch);this.commit(doc,options);}
 beginTransaction(){if(this.#transaction)throw Error('Transaction already active');this.#transaction=this.document;}
 endTransaction(){if(!this.#transaction)return;const before=this.#transaction;this.#transaction=null;if(JSON.stringify(before)!==JSON.stringify(this.#doc))this.#record(before);this.#emit();}
 undo(){if(this.#transaction)throw Error('End transaction before undo');if(!this.canUndo)return false;this.#future.push(this.document);this.#doc=this.#past.pop();this.#selected=this.#doc.nodes.some(n=>n.id===this.#selected)?this.#selected:null;this.#emit();return true;}
 redo(){if(this.#transaction)throw Error('End transaction before redo');if(!this.canRedo)return false;this.#past.push(this.document);this.#doc=this.#future.pop();this.#selected=this.#doc.nodes.some(n=>n.id===this.#selected)?this.#selected:null;this.#emit();return true;}
 addNode(node){const doc=this.document;doc.nodes.push(clone(node));this.commit(doc);this.select(node.id);return node.id;}
 deleteNode(id){if(!this.#doc.nodes.some(n=>n.id===id))throw Error('Unknown node');const removed=new Set([id]);let changed=true;while(changed){changed=false;for(const n of this.#doc.nodes)if(removed.has(n.parentId)&&!removed.has(n.id)){removed.add(n.id);changed=true;}}const doc=this.document;doc.nodes=doc.nodes.filter(n=>!removed.has(n.id));this.commit(doc);}
 duplicateNode(id){const root=this.#doc.nodes.find(n=>n.id===id);if(!root)throw Error('Unknown node');const copyIds=new Set([id]);let changed=true;while(changed){changed=false;for(const n of this.#doc.nodes)if(copyIds.has(n.parentId)&&!copyIds.has(n.id)){copyIds.add(n.id);changed=true;}}const doc=this.document,used=new Set(doc.nodes.map(n=>n.id)),mapping=new Map();for(const old of copyIds){let i=1,newId;do{newId=`${old}-copy-${i++}`}while(used.has(newId));used.add(newId);mapping.set(old,newId);}for(const n of this.#doc.nodes.filter(n=>copyIds.has(n.id))){const c=clone(n);c.id=mapping.get(n.id);c.name+=' 副本';c.parentId=mapping.get(c.parentId)??c.parentId;if(n.id===id){c.x+=24;c.y+=24;c.z+=1;}doc.nodes.push(c);}this.commit(doc);this.select(mapping.get(id));return mapping.get(id);}
}
