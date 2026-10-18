import {icon,robot,lantern} from './art.js';
const mod=(n,m)=>(n%m+m)%m;
export function mountGame(root,type,{level=0,gentle=false,reduce=false,onFinish=()=>{}}={}){
 const abort=new AbortController(),signal=abort.signal;let ended=false,frame=0,timers=[];
 const listen=(el,event,fn)=>el.addEventListener(event,fn,{signal});
 const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);};
 const finish=()=>{if(ended)return;ended=true;cancelAnimationFrame(frame);later(()=>onFinish(false),350);};
 root.innerHTML=`<div class="game-board" id="board"></div><p class="game-status" id="game-status" role="status"></p><div id="game-input"></div>`;
 const board=root.querySelector('#board'),input=root.querySelector('#game-input'),status=root.querySelector('#game-status');
 const say=t=>status.textContent=t;
 if(type==='river'){
  const path=level>20?[20,21,16,11,12,13,8,9,4]:[20,15,16,11,12,13,8,9,4];let step=0;
  const render=()=>{board.innerHTML=`<div class="river-grid">${Array.from({length:25},(_,i)=>`<button class="river-cell ${path.includes(i)?'stone':''} ${i===path[step]?'here':''} ${path.indexOf(i)<step&&path.includes(i)?'visited':''}" data-cell="${i}" aria-label="${i===path[step]?'Your hero':i===4?'Finish':path.includes(i)?'Stepping stone':'Water'}" ${!path.includes(i)?'disabled':''}>${i===path[step]?icon('boots'):i===4?icon('flag'):path.includes(i)?'·':''}</button>`).join('')}</div>`;say(step===0?'Tap the next stone.':`${step} / ${path.length-1} hops`);};
  listen(board,'click',e=>{const b=e.target.closest('[data-cell]');if(!b||ended)return;const next=Number(b.dataset.cell);if(next===path[step+1]){step++;render();if(step===path.length-1){say('Across the river!');finish();}}else if(next!==path[step])say('One stone at a time. Follow the path.');});render();
 }else if(type==='memory'){
  const pictures=['plant','lamp','boat','heart','plant','heart','lamp','boat'];let open=[],matched=[],locked=false;
  if(level%2)pictures.reverse();
  const render=()=>{board.innerHTML=`<div class="memory-grid">${pictures.map((p,i)=>`<button class="memory-card ${open.includes(i)?'open':''} ${matched.includes(i)?'matched':''}" data-card="${i}" aria-label="${open.includes(i)||matched.includes(i)?p:'Covered card '+(i+1)}" ${matched.includes(i)?'disabled':''}>${open.includes(i)||matched.includes(i)?icon(p):icon('star')}</button>`).join('')}</div>`;say(`${matched.length/2} / 4 pairs`);};
  listen(board,'click',e=>{const b=e.target.closest('[data-card]');if(!b||ended||locked)return;const i=Number(b.dataset.card);if(open.includes(i)||matched.includes(i))return;open.push(i);render();if(open.length===2){if(pictures[open[0]]===pictures[open[1]]){matched.push(...open);open=[];render();if(matched.length===8){say('All lanterns matched!');finish();}}else{locked=true;say('Take another look.');later(()=>{open=[];locked=false;render();},gentle?2200:1500);}}});render();
 }else if(type==='repair'){
  const path=[0,1,2,5,4,3,6,7,8],base=Array(9),turns=Array.from({length:9},(_,i)=>(i+level)%3+1);
  const dir=(a,b)=>b===a-3?0:b===a+1?1:b===a+3?2:3;
  path.forEach((p,i)=>base[p]=[i===0?3:dir(p,path[i-1]),i===8?1:dir(p,path[i+1])]);
  function connected(){let i=0,from=3,visited=new Set();for(let count=0;count<10;count++){const ports=base[i].map(d=>mod(d+turns[i],4));if(!ports.includes(from)||visited.has(i))return visited;visited.add(i);const out=ports.find(d=>d!==from);if(i===8&&out===1){visited.complete=true;return visited;}const row=Math.floor(i/3),col=i%3;if(out===0&&row===0||out===1&&col===2||out===2&&row===2||out===3&&col===0)return visited;const n=i+[-3,1,3,-1][out],nports=base[n].map(d=>mod(d+turns[n],4));if(!nports.includes(mod(out+2,4)))return visited;i=n;from=mod(out+2,4);}return visited;}
  function render(){const c=connected(),ends=[[50,0],[100,50],[50,100],[0,50]];board.innerHTML=`<div class="pipe-labels"><span>Light →</span><span>→ Lantern</span></div><div class="repair-grid">${base.map((ds,i)=>`<button class="pipe ${c.has(i)?'connected':''}" data-pipe="${i}" aria-label="Turn light tile ${i+1}"><svg viewBox="0 0 100 100" aria-hidden="true">${ds.map(d=>{const[x,y]=ends[mod(d+turns[i],4)];return `<path d="M50 50L${x} ${y}" stroke="${c.has(i)?'#A48435':'#6E987A'}" stroke-width="17" fill="none" stroke-linecap="round"/>`;}).join('')}<circle cx="50" cy="50" r="8" fill="${c.has(i)?'#FFF2BA':'#B5CBA3'}"/></svg></button>`).join('')}</div>`;say(c.complete?'The beacon is glowing!':'Tap a tile to turn it. Connect left to right.');if(c.complete)finish();}
  listen(board,'click',e=>{const b=e.target.closest('[data-pipe]');if(!b||ended)return;turns[Number(b.dataset.pipe)]++;render();});render();
 }else if(type==='maze'){
  const rows=['.....#E','.###.#.','...#...','##.K##.','...#...','.#...#.','S..#...'];let pos=42,key=false;
  function render(){board.innerHTML=`<div class="maze-grid">${rows.join('').split('').map((v,i)=>`<div class="maze-cell ${v==='#'?'wall':''}" aria-hidden="true">${i===pos?icon('robot'):v==='K'&&!key?icon('star'):v==='E'?icon('boat'):''}</div>`).join('')}</div>`;say(key?'Key found! Reach the boat at the top right.':'Find the golden key. Then reach the boat.');}
  function move(d){if(ended)return;const r=Math.floor(pos/7),c=pos%7,n=pos+[-7,1,7,-1][d];if(d===0&&r===0||d===1&&c===6||d===2&&r===6||d===3&&c===0||rows.join('')[n]==='#')return;pos=n;if(rows.join('')[pos]==='K')key=true;render();if(rows.join('')[pos]==='E'){if(key){say('Ready to sail!');finish();}else say('Find the golden key first.');}}
  input.innerHTML='<div class="arrow-pad"><button class="btn light" data-dir="0" aria-label="Up">↑</button><button class="btn light" data-dir="3" aria-label="Left">←</button><button class="btn light" data-dir="2" aria-label="Down">↓</button><button class="btn light" data-dir="1" aria-label="Right">→</button></div>';
  listen(input,'click',e=>{const b=e.target.closest('[data-dir]');if(b)move(+b.dataset.dir);});listen(document,'keydown',e=>{const d={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(d!==undefined&& !['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();move(d);}});render();
 }else{
  // Moving games start only after Play. No timer, lives or score loss on a miss.
  const gliding=type==='glider';let paused=true,last=0,position=50,target={x:92,y:35},count=0,keys=new Set();
  board.innerHTML=`<div class="sky" id="sky">${gliding?'<div class="glider" id="player"><svg viewBox="0 0 90 60" aria-hidden="true"><path d="m4 20 45-17 36 25-34-6-8 25-5-26z" fill="#EF9C65" stroke="#365F57" stroke-width="3"/><path d="m43 22-2 22m-7-4 16 1" stroke="#365F57" stroke-width="4"/></svg></div><div class="gate" id="target"></div>':`<div class="firefly" id="target"></div><div class="lantern-catcher" id="player">${lantern(true)}</div>`}<div id="pause-overlay" class="paused-overlay">Ready?</div></div>`;
  input.innerHTML=`<label class="sr-only" for="steer">${gliding?'Glider height':'Lantern position'}</label><input class="game-range" id="steer" type="range" min="8" max="92" value="50" aria-label="${gliding?'Move glider up and down':'Move lantern left and right'}"><div class="game-controls"><button class="btn light" id="negative" aria-label="${gliding?'Move up':'Move left'}">${gliding?'↑':'←'}</button><button class="btn orange" id="pause">▶ Play</button><button class="btn light" id="positive" aria-label="${gliding?'Move down':'Move right'}">${gliding?'↓':'→'}</button></div>`;
  const sky=board.querySelector('#sky'),player=board.querySelector('#player'),targetEl=board.querySelector('#target'),overlay=board.querySelector('#pause-overlay'),range=input.querySelector('#steer'),pause=input.querySelector('#pause');
  function setPosition(value){position=Math.max(8,Math.min(92,value));range.value=position;player.style[gliding?'top':'left']=position+'%';}
  function resetTarget(){target=gliding?{x:95,y:[25,67,40,76,30,55][count%6]}:{x:[30,65,45,80,20,55][count%6],y:3};}
  function drawTarget(){targetEl.style.left=target.x+'%';targetEl.style.top=target.y+'%';}
  function setPause(value){paused=value;overlay.hidden=!value;overlay.style.display=value?'grid':'none';overlay.textContent='Paused';pause.textContent=value?'▶ Play':'Ⅱ Pause';last=0;}
  listen(pause,'click',()=>setPause(!paused));listen(range,'input',()=>setPosition(+range.value));listen(input.querySelector('#negative'),'click',()=>setPosition(position-12));listen(input.querySelector('#positive'),'click',()=>setPosition(position+12));
  listen(document,'keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if((gliding?['ArrowUp','ArrowDown']:['ArrowLeft','ArrowRight']).includes(e.key)){e.preventDefault();keys.add(e.key);}});listen(document,'keyup',e=>keys.delete(e.key));listen(window,'blur',()=>{keys.clear();setPause(true);});listen(document,'visibilitychange',()=>{if(document.hidden){keys.clear();setPause(true);}});
  function tick(t){if(ended)return;const dt=last?Math.min((t-last)/1000,.06):0;last=t;if(!paused){if(keys.has(gliding?'ArrowUp':'ArrowLeft'))setPosition(position-dt*55);if(keys.has(gliding?'ArrowDown':'ArrowRight'))setPosition(position+dt*55);const speed=gentle||reduce?13:22;
    if(gliding){target.x-=dt*speed;if(target.x<=18){if(Math.abs(target.y-position)<17){count++;say(`${count} / 6 sky gates`);if(count===6){finish();return;}}else say('A little higher or lower. Try the next gate.');resetTarget();}}
    else{target.y+=dt*speed;if(target.y>=82){if(Math.abs(target.x-position)<16){count++;say(`${count} / 6 fireflies`);if(count===6){finish();return;}}else say('Bring your lantern underneath the firefly.');resetTarget();}}
    drawTarget();}frame=requestAnimationFrame(tick);}
  resetTarget();drawTarget();setPosition(50);say(gliding?'Move up and down. Fly through the golden gates.':'Move left and right. Catch the fireflies.');frame=requestAnimationFrame(tick);
 }
 return ()=>{ended=true;abort.abort();cancelAnimationFrame(frame);timers.forEach(clearTimeout);};
}
