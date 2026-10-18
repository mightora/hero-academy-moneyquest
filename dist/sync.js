// Game-only capabilities are stored outside exported saves. No parent credentials.
const API='https://chorequest.heroacademy.app/api/games/moneyquest';
const PREFIX='hero-academy-moneyquest:connection:';
export function createSync({getProfile,onChange=()=>{},storage=globalThis.localStorage,fetcher=globalThis.fetch}={}){
 const busy=new Set();let timer;
 const load=id=>{try{return JSON.parse(storage.getItem(PREFIX+id)||'null');}catch{return null;}};
 const persist=(id,value)=>{storage.setItem(PREFIX+id,JSON.stringify(value));};
 async function request(path,c,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const r=await fetcher(API+path,{method:body?'POST':'GET',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal,headers:{'Content-Type':'application/json',...(c?{Authorization:'Bearer '+c.token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok){const e=Error(data.error||'Sync is unavailable. Your device save is safe.');e.status=r.status;e.save=data.save;throw e;}return data;}finally{clearTimeout(timeout);}
 }
 function status(){const c=load(getProfile().id);return c?{connected:true,name:c.child?.name||'Hero',xp:c.child?.xp||0,gameXP:c.gameXP||0,pending:c.queue.length,dirty:!!c.dirty,revision:c.revision,error:c.error||'',blocked:!!c.blocked,conflict:c.conflict||null,lastSync:c.lastSync}: {connected:false};}
 async function sync(id=getProfile().id){
  if(busy.has(id))return;let c=load(id);if(!c||c.blocked)return;busy.add(id);
  try{
   const d=await request('/profile',c);if(load(id)?.token!==c.token)return;c=load(id);c.child=d.child;c.gameXP=d.gameXP;c.error='';persist(id,c);
   while((c=load(id))&&c.queue.length){const event=c.queue[0];let d;try{d=await request('/events',c,event);}catch(e){if(e.status===422){const current=load(id);if(current){current.error=e.message;persist(id,current);}break;}throw e;}const current=load(id);if(!current||current.token!==c.token)return;current.queue=current.queue.filter(e=>e.id!==event.id);current.child=d.child;current.gameXP=d.gameXP;persist(id,current);}
   c=load(id);if(!c)return;
   if(c.dirty&&!c.conflict){const payload=JSON.stringify(c.dirty),d=await request('/save',c,{expectedRevision:c.revision,state:c.dirty});const current=load(id);if(!current||current.token!==c.token)return;current.revision=d.save.revision;if(JSON.stringify(current.dirty)===payload)current.dirty=null;current.lastSync=Date.now();current.error='';persist(id,current);}
   else if(!c.conflict){const d=await request('/save',c);const current=load(id);if(!current||current.token!==c.token)return;if(d.save&&d.save.revision>current.revision){current.conflict=d.save;current.error='A newer journey is saved. Choose which to continue.';}else current.lastSync=Date.now();persist(id,current);}
  }catch(e){const current=load(id);if(current){current.error=e.name==='AbortError'?'Sync timed out. Your device save is safe.':e.message;if(e.status===401||e.status===403)current.blocked=true;if(e.status===409&&e.save)current.conflict=e.save;persist(id,current);}}
  finally{busy.delete(id);onChange();if(load(id)&&!load(id).blocked){clearTimeout(timer);timer=setTimeout(()=>void sync(id),60000);}}
 }
 return {
  status,
  async connect(code){const p=getProfile();if(load(p.id))throw Error('Disconnect this hero before connecting again.');const d=await request('/connect',null,{code});if(!/^[a-f0-9]{64}$/.test(d.token))throw Error('The connection response was not valid.');persist(p.id,{token:d.token,child:d.child,gameXP:d.gameXP,queue:[],dirty:null,revision:d.save?.revision||0,conflict:d.save||null,error:'',lastSync:0});onChange();return d;},
  changed(snapshot){const id=getProfile().id,c=load(id);if(!c)return;c.dirty=structuredClone(snapshot);persist(id,c);onChange();clearTimeout(timer);timer=setTimeout(()=>void sync(id),1200);},
  enqueue(level){const id=getProfile().id,c=load(id);if(!c||c.blocked)return;const event={id:'moneyquest:stop:'+String(level).padStart(2,'0'),level};if(!c.queue.some(e=>e.id===event.id))c.queue.push(event);persist(id,c);onChange();},
  resolve(remote,state){const id=getProfile().id,c=load(id);if(!c)return;const save=c.conflict;c.revision=save?.revision||c.revision;c.conflict=null;c.error='';c.dirty=remote?null:structuredClone(state);persist(id,c);onChange();void sync(id);},
  async disconnect(){const id=getProfile().id,c=load(id);if(!c)return;try{await request('/disconnect',c,{});}catch(e){if(e.status!==401)throw e;}storage.removeItem(PREFIX+id);onChange();},
  sync,
  start(){globalThis.addEventListener?.('online',()=>void sync());globalThis.addEventListener?.('focus',()=>void sync());void sync();},
  stop(){clearTimeout(timer);}
 };
}
