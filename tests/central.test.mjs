import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bootAcademy} from '../dist/academy-client.js';
import {fresh,complete} from '../dist/engine.js';

test('shared launch removes its private fragment, saves progress and credits only new milestones',async()=>{
 let profile=complete(fresh(),0,0).profile,cloud=null,revision=0,online=true;const store=new Map(),requests=[],credits=[];
 const platform={crypto,location:{href:'https://moneyquest.heroacademy.app/#academy_launch=private-one-use'},history:{replaceState(a,b,url){assert(!url.includes('private-one-use'));platform.location.href='https://moneyquest.heroacademy.app'+url;}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},confirm:()=>true,setInterval:()=>0,clearInterval(){},addEventListener(){},removeEventListener(){},fetch:async(url,options)=>{
  assert(!platform.location.href.includes('private-one-use'));assert.equal(options.credentials,'omit');if(!online)throw Error('Offline');requests.push(url);const body=options.body?JSON.parse(options.body):{};
  if(url.endsWith('/exchange'))return Response.json({game_id:'moneyquest',token:'a'.repeat(64),hero:{id:'account-hero',name:'Hero',xp:0},gameXP:0,save:null});
  assert.equal(options.headers.Authorization,'Bearer '+'a'.repeat(64));
  if(url.endsWith('/save')){assert.equal(body.expectedRevision,revision);cloud=body.state;return Response.json({revision:++revision});}
  if(url.endsWith('/events')){credits.push(body.milestone);return Response.json({hero:{xp:50},gameXP:50});}
  return Response.json({game_id:'moneyquest',hero:{id:'account-hero',xp:50},gameXP:50});
 }};
 const account=await bootAcademy({game:'moneyquest',identity:()=>profile.id,select:id=>profile.id===id,create:()=>{throw Error('Unexpected new hero');},snapshot:()=>profile,restore:p=>{profile=p;},milestones:()=>profile.done},platform);
 assert.equal(cloud.current,1);assert.equal(credits.length,0);
 profile=complete(profile,1,0).profile;await account.flush();assert.equal(cloud.current,2);assert.deepEqual(credits,['1']);await account.flush();assert.equal(credits.length,1);
 online=false;profile=complete(profile,2,0).profile;await account.flush();assert.equal(profile.current,3);assert.equal(cloud.current,2);assert(store.size>0);account.stop();
});
