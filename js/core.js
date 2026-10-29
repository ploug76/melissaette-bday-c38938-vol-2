/* Melissa Time Vol 2 - core: canvas, layout, input, assets, save */
'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),TAU=Math.PI*2;
const cv=$('cv'),ctx=cv.getContext('2d');
const GY=440,GRAV=2300;
let W=0,H=0,DPR=1,S=1,VV=540,VW=800,gameTop=0,gameH=0,portrait=false;
let state='load',G=null,tNow=0;
const AU=window.MTAudio;
/* ---------- save ---------- */
let SAVE={un:1,c:{},best:0,seenIntro:0};
try{const s=JSON.parse(localStorage.getItem('mt2_save')||'null');if(s&&typeof s==='object')SAVE=Object.assign(SAVE,s)}catch(e){}
function persist(){try{localStorage.setItem('mt2_save',JSON.stringify(SAVE))}catch(e){}}
function candlesFound(li){return (SAVE.c[li]||[]).length}
function totalCandles(){let n=0;for(let i=0;i<6;i++)n+=candlesFound(i);return n}
/* ---------- layout ---------- */
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';
 portrait=H>W*1.1;
 if(portrait){VV=540;S=W/clamp(W*1.05,400,470);gameH=VV*S;if(gameH>H*0.6){S=H*0.6/VV;gameH=VV*S}gameTop=Math.round(clamp((H-gameH)*0.3,56,170))}
 else{VV=clamp(Math.round(540*Math.min(1,(W/H)/2.6)),440,540);S=H/VV;gameH=H;gameTop=0}
 VW=W/S;document.body.classList.toggle('portrait',portrait);document.body.classList.toggle('landscape',!portrait);layoutPad()}
function layoutPad(){const pad=$('pad'),bj=$('bJump'),ba=$('bAct'),hud=$('hud');
 if(portrait){const top=gameTop+gameH,ph=H-top;pad.style.top=top+'px';pad.style.height=ph+'px';const sz=Math.round(clamp(ph*0.38,84,124));
  [bj,ba].forEach(b=>{b.style.width=b.style.height=sz+'px'});bj.style.right='18px';bj.style.bottom=Math.round(clamp(ph*0.2,18,80))+'px';ba.style.right=(18+sz+18)+'px';ba.style.bottom=Math.round(clamp(ph*0.2,18,80)+sz*0.42)+'px';
  hud.style.top=Math.max(4,gameTop-52)+'px'}
 else{pad.style.top='0';pad.style.height='100%';const sz=Math.round(clamp(H*0.2,68,94));[bj,ba].forEach(b=>{b.style.width=b.style.height=sz+'px'});bj.style.right='12px';bj.style.bottom='14px';ba.style.right=(12+Math.round(sz*0.15))+'px';ba.style.bottom=(14+sz+12)+'px';hud.style.top='6px'}}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,120));
/* ---------- input: swipe & hold to move, swipe up to jump (hold = higher), swipe down = drop / ground-pound. NO D-pad. ---------- */
const K={},VIRT={jump:0,act:0},TOUCH=new Map();
const inp={L:0,R:0,U:0,D:0,jump:0,jumpP:0,act:0,actP:0,downP:0};let lastJ=0,lastA=0,lastD=0,swipeJump=0,swipeDown=0;
const KEYMAP={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'J',KeyW:'J',Space:'J',KeyZ:'J',ArrowDown:'D',KeyS:'D',KeyX:'A',KeyK:'A',KeyJ:'A',ShiftLeft:'A',ShiftRight:'A'};
addEventListener('keydown',e=>{AU.unlock();const k=KEYMAP[e.code];if(k){K[k]=1;if(state==='play')e.preventDefault()}
 if(e.code==='KeyP'||e.code==='Escape'){if(state==='play')pauseGame();else if(state==='pause')resumeGame()}
 if(e.code==='KeyM')toggleMute();if((e.code==='Enter'||e.code==='Space')&&window.onEnterKey){const f=window.onEnterKey;if(state!=='play'){e.preventDefault();f()}}});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=0});
addEventListener('blur',()=>{for(const k in K)K[k]=0;TOUCH.clear();VIRT.jump=VIRT.act=0});
function swipeDir(t){const dx=t.x-t.ax,dy=t.y-t.ay,d=Math.hypot(dx,dy);const o={};if(d<14)return t.z||o;
 if(d>40){t.ax=t.x-dx/d*40;t.ay=t.y-dy/d*40}
 const a=Math.atan2(dy,dx),s=Math.round(a/(Math.PI/4));
 if(s===0||s===1||s===-1)o.R=1;if(s===4||s===-4||s===3||s===-3)o.L=1;if(s===2)o.D=1;if(s===-2||s===-1||s===-3)o.U=1;
 // keep walking direction while swiping up/down diagonally
 if((o.U||o.D)&&!o.L&&!o.R&&t.z){if(t.z.L)o.L=1;if(t.z.R)o.R=1}
 return o}
function tStart(id,x,y){AU.unlock();TOUCH.set(id,{x,y,ax:x,ay:y,ox:x,oy:y,z:{},t0:performance.now(),mx:0})}
function tMove(id,x,y){const t=TOUCH.get(id);if(!t)return;t.x=x;t.y=y;t.mx=Math.max(t.mx,Math.hypot(x-t.ox,y-t.oy));const bu=t.z.U,bd=t.z.D;t.z=swipeDir(t);if(t.z.U&&!bu)swipeJump=1;if(t.z.D&&!bd)swipeDown=1}
function tEnd(id){TOUCH.delete(id)}
const isUI=el=>el&&el.closest&&el.closest('button,.ui-on,a,input');
document.addEventListener('touchstart',e=>{if(state!=='play'||isUI(e.target))return;e.preventDefault();for(const t of e.changedTouches)tStart(t.identifier,t.clientX,t.clientY)},{passive:false});
document.addEventListener('touchmove',e=>{if(state!=='play')return;if(TOUCH.size)e.preventDefault();for(const t of e.changedTouches)tMove(t.identifier,t.clientX,t.clientY)},{passive:false});
document.addEventListener('touchend',e=>{for(const t of e.changedTouches)tEnd(t.identifier)},{passive:false});
document.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)tEnd(t.identifier)});
let mdown=false;
document.addEventListener('mousedown',e=>{if(state!=='play'||isUI(e.target))return;mdown=true;tStart('m',e.clientX,e.clientY)});
addEventListener('mousemove',e=>{if(mdown)tMove('m',e.clientX,e.clientY)});addEventListener('mouseup',()=>{if(mdown){mdown=false;tEnd('m')}});
function bindBtn(el,k){const on=e=>{e.preventDefault();e.stopPropagation();AU.unlock();VIRT[k]=1;el.classList.add('on')},off=e=>{e.preventDefault();e.stopPropagation();VIRT[k]=0;el.classList.remove('on')};
 el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
 el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off);el.addEventListener('contextmenu',e=>e.preventDefault())}
const BOT={on:false,inp:null};
function readInput(){let L=K.L,R=K.R,U=0,D=K.D;for(const t of TOUCH.values()){if(t.z.L)L=1;if(t.z.R)R=1;if(t.z.U)U=1;if(t.z.D)D=1}
 if(PAD.on){if(PAD.L)L=1;if(PAD.R)R=1;if(PAD.D)D=1}
 let j=!!(K.J||VIRT.jump||U||PAD.J),a=!!(K.A||VIRT.act||PAD.A);let sj=swipeJump,sd=swipeDown;
 if(BOT.on&&BOT.inp){const b=BOT.inp;L=b.L;R=b.R;D=b.D;j=b.J;a=b.A;sj=0;sd=b.DP}
 inp.L=L?1:0;inp.R=R?1:0;inp.D=D?1:0;
 inp.jumpP=((j&&!lastJ)||sj)?1:0;inp.jump=j?1:0;lastJ=j;swipeJump=0;
 inp.downP=((D&&!lastD)||sd)?1:0;lastD=D;swipeDown=0;
 inp.actP=a&&!lastA?1:0;inp.act=a?1:0;lastA=a}
/* ---------- assets ---------- */
const IMG={};let MAN={};
function loadImg(k,src){return new Promise(r=>{const i=new Image();i.onload=()=>{IMG[k]=i;r()};i.onerror=()=>{console.warn('img',src);r()};i.src=src})}
async function loadAll(onp){MAN=await (await fetch('art/manifest.json?v='+window.MTV)).json();
 const list=Object.keys(MAN).map(k=>[k,'art/'+k+'.webp?v='+window.MTV]);
 for(const n of ['intro1','intro2','intro3','ending','title_wide','title_tall'])list.push(['cine/'+n,'art/cine/'+n+'.jpg?v='+window.MTV]);
 let done=0;await Promise.all(list.map(([k,s])=>loadImg(k,s).then(()=>{done++;onp&&onp(done/list.length)})))}
function toggleMute(){AU.unlock();AU.setMute(!AU.muted);$('bMute').textContent=AU.muted?'🔇':'🔊'}
/* ---------- gamepad (Gamepad API, standard mapping): stick/d-pad move, A jump, X sparkle, B back, Start pause. Works with USB/Bluetooth pads on computers and phones. ---------- */
const PAD={on:false,prev:[],L:0,R:0,U:0,D:0,J:0,A:0,known:new Set(),navT:0,ax:0,ay:0};
function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),2400)}
function padFocus(){setTimeout(()=>{if(state==='play')return;const a=document.activeElement;if(a&&a.closest&&a.closest('#ui button'))return;const b=document.querySelector('#ui button.primary')||document.querySelector('#ui button');b&&b.focus()},60)}
addEventListener('gamepadconnected',e=>{PAD.known.add(e.gamepad.index);toast('🎮 Controller connected');padFocus()});
addEventListener('gamepaddisconnected',e=>{PAD.known.delete(e.gamepad.index);toast('🎮 Controller disconnected')});
function pads(){try{return Array.from((navigator.getGamepads&&navigator.getGamepads())||[]).filter(Boolean)}catch(e){return[]}}
function pollPad(dt){const ps=pads();let L=0,R=0,U=0,D=0,b=[];
 for(const gp of ps){if(!PAD.known.has(gp.index)){PAD.known.add(gp.index);toast('🎮 Controller connected');padFocus()}
  const B=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>0.5));const ax=gp.axes[0]||0,ay=gp.axes[1]||0;
  if(ax<-0.4||B(14))L=1;if(ax>0.4||B(15))R=1;if(ay<-0.6||B(12))U=1;if(ay>0.6||B(13))D=1;
  for(let i=0;i<17;i++)if(B(i))b[i]=1}
 const pressed=i=>b[i]&&!PAD.prev[i];
 if(!b[0])PAD.h0=0;if(!b[2])PAD.h2=0;
 PAD.on=ps.length>0;PAD.L=L;PAD.R=R;PAD.D=D;PAD.J=!!b[0]&&!PAD.h0;PAD.A=!!b[2]&&!PAD.h2;
 if(state==='play'){if(pressed(9))pauseGame()}
 else{// menu navigation: up/down/left/right move focus, A confirms, B goes back, Start = confirm/resume
  PAD.navT-=dt;const dir=U?-1:D?1:L?-1:R?1:0;
  if(dir&&PAD.navT<=0){moveFocus(dir);PAD.navT=0.22}else if(!dir)PAD.navT=0;
  if(pressed(0)){PAD.h0=1;const f=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#ui button');if(f)f.click();else if(window.onEnterKey)window.onEnterKey()}
  if(pressed(1)&&window.onBack)window.onBack();
  if(pressed(9)){PAD.h0=PAD.h2=b[0]||0;if(state==='pause')resumeGame();else if(window.onEnterKey)window.onEnterKey()}}
 PAD.prev=b}
function moveFocus(dir){const bs=Array.from(document.querySelectorAll('#ui button:not([disabled])')).filter(b=>b.offsetParent!==null);if(!bs.length)return;
 let i=bs.indexOf(document.activeElement);i=i<0?0:(i+dir+bs.length)%bs.length;bs[i].focus();AU.fx('click')}
