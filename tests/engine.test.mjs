import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,complete,calculate,validate,exportSave,money} from '../dist/engine.js';
import {LEVELS,REGIONS} from '../dist/content.js';
test('30 original stops include twenty decisions and ten action challenges across five regions',()=>{
 assert.equal(LEVELS.length,30);assert.equal(REGIONS.length,5);assert.equal(LEVELS.filter(l=>l.type==='money').length,20);assert.equal(LEVELS.filter(l=>l.type==='play').length,10);
 assert.equal(new Set(LEVELS.map(l=>l.title)).size,30);
 for(let i=0;i<5;i++)assert.equal(LEVELS.filter(l=>l.region===i).length,6);
});
test('every journey stays playable, uses integer money and settles borrowing',()=>{
 for(let run=0;run<100;run++){let p=fresh();for(const l of LEVELS){const c=run<3?run:(run*17+l.id*11)%3;const r=complete(p,l.id,l.type==='money'?c:0,run%4===0);p=r.profile;for(const k of ['wallet','savings','debt'])assert(Number.isInteger(p[k])&&p[k]>=0);validate(p);}assert.equal(p.current,30);assert.equal(p.xp,1250);assert.equal(p.debt,0);assert.equal(p.done.length,30);assert.throws(()=>complete(p,29),/current stop/);}
});
test('time, costs, savings, interest and support have visible monetary consequences',()=>{
 const p=fresh(),a=calculate(p,{spend:500,days:1}),b=calculate(p,{days:3});assert.equal(a.profile.wallet,2300);assert.equal(b.profile.wallet,2400);
 const saved=calculate(p,{deposit:500,interest:5});assert.equal(saved.profile.savings,525);assert.equal(saved.profile.wallet,2300);
 const poor={...fresh(),wallet:0,savings:100};const helped=calculate(poor,{spend:500});assert.equal(helped.help,600);assert.equal(helped.profile.wallet,0);assert.equal(helped.profile.savings,0);
 assert.equal(p.wallet,3000);assert.equal(p.savings,0);
});
test('borrowing pays for the bike and costs more after repayment than buying outright',()=>{
 const p=fresh(),loan=calculate(p,LEVELS[18].choices[0].effect),cash=calculate(p,LEVELS[18].choices[1].effect);
 assert.equal(loan.profile.debt,1200);assert.equal(loan.profile.wallet,2800);
 const repaid=calculate(loan.profile,{repay:true}),cashNextDay=calculate(cash.profile,{});
 assert.equal(repaid.profile.debt,0);assert.equal(cashNextDay.profile.wallet-repaid.profile.wallet,200);
});
test('exports strip connection capabilities and reject corrupt progress',()=>{
 const p=fresh();p.token='SECRET';p.connection={token:'SECRET'};const data=JSON.stringify(exportSave(p,{currency:'GBP'}));assert(!data.includes('SECRET'));
 assert.throws(()=>validate({...fresh(),done:[1],current:1,records:[]}),/progress/);
 assert.throws(()=>validate({...fresh(),wallet:-1}),/wallet/);
 assert.equal(money(515,'GBP'),'£5.15');assert.equal(money(500,'USD'),'US$5');
});
