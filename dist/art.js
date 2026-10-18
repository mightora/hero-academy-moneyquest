import {hero,robot,icon as originalIcon} from './hero-art.js';
export {hero,robot};
export function icon(name){const paths={
 wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8h17M15 11h6v6h-6z"/><circle cx="18" cy="14" r=".7"/>',
 jar:'<path d="M8 3h8v4l3 4v9H5v-9l3-4zM7 7h10M8 14h8"/><path d="M12 11v6"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16"/>',
 home:'<path d="m2 11 10-8 10 8M5 10v11h14V10M10 21v-7h4v7"/>',
 settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
 speaker:'<path d="M3 9h4l5-5v16l-5-5H3zM16 8q5 4 0 8m3-11q8 7 0 14"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 close:'<path d="m5 5 14 14M5 19 19 5"/>',
 link:'<path d="m10 14 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 -1)"/>',
 heart:'<path d="M12 21 3 12C-3 4 6 0 12 7c6-7 15-3 9 5z"/>',
 bag:'<rect x="5" y="6" width="14" height="16" rx="4"/><path d="M9 6V3h6v3M5 12h14M9 17h6"/>',
 apple:'<path d="M12 7C0 1-1 18 9 21l3-1 3 1C25 18 24 1 12 7zM12 7V3m0 1q5 1 6-3"/>',
 tree:'<path d="m12 2-9 12h5l-4 5h16l-4-5h5zM12 19v4"/>',
 tent:'<path d="m12 3 10 18H2zM12 3v18M8 21l4-8 4 8"/>',
 bridge:'<path d="M2 19h20M3 10q9-12 18 0M3 6v13m18-13v13M7 7v12m5-14v14m5-12v12"/>',
 boat:'<path d="M2 15h20l-4 6H6zM12 3v12M12 3l8 9h-8zM3 23q4-3 8 0t10 0"/>',
 brush:'<path d="m13 13 7-10q4-2 2 2L12 15M12 15q2 7-9 6 3-2 2-5t7-1z"/>',
 gift:'<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M2 6h20v4H2zM12 6v15M12 6Q1 8 5 2q4-3 7 4Q23 8 19 2q-4-3-7 4"/>',
 bike:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-10 9 10M8 7h5m3-4h3v4M9 12h8"/>',
 mountain:'<path d="m2 21 9-18 11 18zM7 11l4 2 4-3"/>',
 lighthouse:'<path d="m7 21 2-15h6l2 15M7 6h10V2H7zM5 21h14M9 12h6M2 4h3m14 0h3"/>'
 };return paths[name]?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`:originalIcon(name);
}
export const POSITIONS=[[11,69],[26,45],[43,65],[58,39],[76,54],[89,27]];
const inner=svg=>svg.replace(/<svg[^>]*>|<\/svg>/g,'');
function tree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 16v25" stroke="#527A65" stroke-width="9" stroke-linecap="round"/><ellipse cy="-1" rx="29" ry="37" fill="#779C7C"/><ellipse cx="-8" cy="-13" rx="21" ry="26" fill="#91AF8C"/></g>`;}
function house(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-33" y="-10" width="66" height="51" rx="5" fill="#F8F0D3"/><path d="m-43-8 43-40L43-8z" fill="#CB815C"/><rect x="-8" y="12" width="17" height="29" rx="5" fill="#688D79"/><rect x="-25" y="6" width="11" height="13" rx="3" fill="#EFC66A"/><rect x="16" y="6" width="11" height="13" rx="3" fill="#EFC66A"/><path d="M20-31v-20h10v28" fill="#B79F80"/></g>`;}
export function landscape(region=0,lit=false){
 let details='';
 if(region===0)details=house(180,173,.8)+house(220,198,.55)+house(684,171,.7)+`<path d="M31 270q100-35 151 0" fill="none" stroke="#A9BC8C" stroke-width="16"/>`;
 if(region===1)details=Array.from({length:12},(_,i)=>tree(60+i*79,175+(i%3)*25,.9)).join('')+`<path d="m440 182 45-62 45 62z" fill="#D9C591"/><path d="m476 182 9-25 9 25" fill="#627E67"/>`;
 if(region===2)details=house(200,176,.7)+house(710,193,.65)+`<path d="M540 135v70m-50-15h100l-17 24h-64z" fill="#9D8666" stroke="#587E79" stroke-width="5"/><path d="m546 136 34 42h-34z" fill="#F8F0D3"/>`;
 if(region===3)details=`<path d="m100 213 100-180 118 180m220-14L690 14l172 200" fill="#A7B4AD"/><path d="m163 100 37-67 43 66-24-8-19 14-17-19zM645 69l45-55 47 62-28-8-16 14-22-23z" fill="#F8F5EC"/>`+tree(370,198,.8)+house(481,172,.65);
 if(region===4)details=`<path d="M0 290q215-135 430-40t570-25v340H0" fill="#92BEC3"/><path d="M90 277q312-175 777-66L965 465H35z" fill="#BCD0AB"/><path d="m743 198 13-104h39l15 104z" fill="#F4E8C9"/><path d="m749 147 53 6-4 18-51-6" fill="#CC8D6B"/><rect x="751" y="79" width="49" height="22" rx="4" fill="#345C5A"/><path d="m746 79 30-26 30 26" fill="#CC8D6B"/><rect x="765" y="83" width="22" height="12" rx="3" fill="${lit?'#F6D46C':'#9EC4BF'}"/>`+house(350,176,.7);
 const decor=region===1?'':tree(55,196,.7)+tree(356,150,.6)+tree(932,214,.8)+tree(638,400,.7);
 return `<svg viewBox="0 0 1000 520" class="landscape" aria-hidden="true"><defs><pattern id="grass${region}" width="45" height="45" patternUnits="userSpaceOnUse"><path d="m10 27 2-6 3 6m24 7 2-5" stroke="#819F7A" stroke-width="1.5" opacity=".25" fill="none"/></pattern></defs><rect width="1000" height="520" rx="28" fill="${['#DCEADD','#CBDCCB','#D8E7DB','#E0E5DD','#DAE7DC'][region]}"/><circle cx="832" cy="70" r="35" fill="#F0DC9B"/><g fill="#F8F5EC" opacity=".8"><path d="M113 60q4-22 24-18 12-19 29-2 24-5 25 20z"/><path d="M552 49q5-22 23-18 14-17 29-1 25-3 25 19z"/></g><path d="M0 165q140-94 285-7t320 0 395-25v387H0z" fill="#B4CBA8"/><path d="M0 237q210-111 432-30t568-16v329H0z" fill="${['#CBDCC0','#BCD1B6','#BDD4BC','#C9D3BD','#C7D7B7'][region]}"/><rect y="200" width="1000" height="320" fill="url(#grass${region})"/>${details}<path d="M-40 435q205-25 258 30t220-16 215 29 387-17" stroke="#8EB9BE" stroke-width="46" fill="none"/><path d="M-40 431q205-25 258 30t220-16 215 29 387-17" stroke="#A1C5C5" stroke-width="26" fill="none"/><path d="M110 359Q155 242 260 234T430 338Q470 232 580 203T760 281Q837 262 890 140" stroke="#B0BD98" stroke-width="43" stroke-linecap="round" fill="none"/><path d="M110 355Q155 238 260 230T430 334Q470 228 580 199T760 277Q837 258 890 136" stroke="#E8DFB9" stroke-width="32" stroke-linecap="round" fill="none"/><path d="M110 355Q155 238 260 230T430 334Q470 228 580 199T760 277Q837 258 890 136" stroke="#F8F0D3" stroke-width="2" stroke-dasharray="2 12" stroke-linecap="round" fill="none"/>${decor}<g fill="#F0CC71"><circle cx="66" cy="385" r="4"/><circle cx="520" cy="361" r="4"/><circle cx="832" cy="363" r="4"/></g><g stroke="#779C7C" stroke-width="3"><path d="M66 390v12m454-36v13m312-12v14"/></g></svg>`;
}
export function trailHero(p){return `<div class="trail-characters"><div class="trail-pip">${robot()}</div><div class="trail-hero">${hero(p.colour,p.emblem,true)}</div></div>`;}
export function lantern(lit=false){return `<svg viewBox="0 0 80 100" aria-hidden="true">${lit?'<circle cx="40" cy="47" r="36" fill="#F6D46C" opacity=".22"/>':''}<path d="M30 23V12a10 10 0 0 1 20 0v11" fill="none" stroke="#3C6761" stroke-width="5"/><rect x="23" y="23" width="34" height="49" rx="9" fill="${lit?'#F6D46C':'#C2D0BA'}" stroke="#3C6761" stroke-width="5"/><path d="M40 24v47M23 36h34m-34 24h34" stroke="#3C6761" stroke-width="3"/><rect x="27" y="73" width="26" height="5" rx="2" fill="#3C6761"/>${lit?'<path d="m40 37-7 15h7l-2 10 10-17h-8l4-8z" fill="#FFF8DE"/>':''}</svg>`;}
