import {LEVELS,SUITS,EMBLEMS} from './content.js';
export const SAVE_KEY='hero-academy-moneyquest:v1';
export const COST_PER_DAY=200;
export const fresh=()=>({version:1,id:crypto.randomUUID(),name:'Trail Hero',colour:SUITS[0],emblem:'star',wallet:3000,savings:0,debt:0,day:1,xp:0,kindness:0,support:0,current:0,done:[],records:[],started:false,updatedAt:Date.now()});
export const settingsDefault=()=>({currency:'GBP',scale:1,reduce:false,gentle:false});
const int=(n,max=10000000)=>Number.isInteger(n)&&n>=0&&n<=max;
export function validate(p){
 if(!p||p.version!==1||typeof p.id!=='string'||p.id.length>100||typeof p.name!=='string'||p.name.length>24||!SUITS.includes(p.colour)||!EMBLEMS.includes(p.emblem))throw Error('This is not a MoneyQuest save.');
 for(const k of ['wallet','savings','debt','day','xp','kindness','support','current'])if(!int(p[k],k==='current'?30:10000000))throw Error('This save has an invalid '+k+'.');
 if(!Array.isArray(p.done)||p.done.length>30||new Set(p.done).size!==p.done.length||p.done.some((v,i)=>v!==i)||p.current!==p.done.length)throw Error('This save has invalid journey progress.');
 if(!Array.isArray(p.records)||p.records.length>30||p.records.length!==p.done.length)throw Error('This save has invalid records.');
 for(const [i,r]of p.records.entries())if(r.level!==i||!int(r.choice,2)||!int(r.days,3)||r.days<1||typeof r.supported!=='boolean')throw Error('This save has an invalid activity record.');
 return {version:1,id:p.id,name:p.name,colour:p.colour,emblem:p.emblem,wallet:p.wallet,savings:p.savings,debt:p.debt,day:p.day,xp:p.xp,kindness:p.kindness,support:p.support,current:p.current,done:[...p.done],records:p.records.map(r=>({level:r.level,choice:r.choice,days:r.days,supported:r.supported,wise:!!r.wise})),started:!!p.started,updatedAt:Number(p.updatedAt)||0};
}
export function calculate(p,effect={}){
 const q=structuredClone(p),e=effect,days=e.days||1;let cost=(e.spend||0)+days*COST_PER_DAY,interest=0;
 q.wallet+=(e.earn||0)+(e.borrow||0);
 if(e.withdraw){const amount=Math.min(q.savings,e.withdraw);q.wallet+=amount;q.savings-=amount;}
 if(e.emergency){const amount=Math.min(q.savings,e.emergency);q.savings-=amount;cost+=e.emergency-amount;}
 if(e.repay){if(e.useSavings){const amount=Math.min(q.savings,q.debt);q.savings-=amount;q.debt-=amount;}cost+=q.debt;q.debt=0;}
 // Keep living costs covered before depositing. Never spend more than is available.
 const deposit=Math.min(e.deposit||0,Math.max(0,q.wallet-cost));q.wallet-=deposit;q.savings+=deposit;
 if(e.interest){interest=Math.floor(q.savings*e.interest/100);q.savings+=interest;}
 let help=0;
 if(q.wallet<cost){const fromSavings=Math.min(q.savings,cost-q.wallet);q.savings-=fromSavings;q.wallet+=fromSavings;}
 if(q.wallet<cost){help=cost-q.wallet;q.wallet+=help;q.support+=help;}
 q.wallet-=cost;q.debt+=e.debt||0;q.day+=days;q.kindness+=e.kindness||0;
 return {profile:q,days,living:days*COST_PER_DAY,help,deposit,interest};
}
export function complete(p,id,choice=0,supported=false){
 if(id!==p.current||id>=30)throw Error('Complete the current stop first.');
 const level=LEVELS[id],option=level.type==='money'?level.choices[choice]:null;
 if(level.type==='money'&&!option)throw Error('Choose an option first.');
 const result=calculate(p,option?.effect),q=result.profile,points=level.type==='money'?50:25;
 q.done.push(id);q.current=id+1;q.started=true;q.xp+=points;q.updatedAt=Date.now();
 q.records.push({level:id,choice,days:result.days,supported:supported||result.help>0,wise:option?.wise??true});
 return {...result,profile:q,points,outcome:option?.outcome||'The trail is brighter. Your next adventure is ready!'};
}
export function money(amount,currency='GBP'){
 const valid=['GBP','EUR','USD'].includes(currency)?currency:'GBP';
 return new Intl.NumberFormat('en-GB',{style:'currency',currency:valid,minimumFractionDigits:amount%100?2:0,maximumFractionDigits:2}).format(amount/100);
}
export function cloudSnapshot(p){return validate(p);}
export function exportSave(p,settings){return {app:'hero-academy-moneyquest',version:1,profile:cloudSnapshot(p),settings};}
