/* Melissa Time Vol 2 - screens, HUD, main loop, QA hooks */
'use strict';
let hudDirty=1,story={on:false,score:0,max:3},lastT=0,clearShown=false;
const ui=$('ui');
function show(html,cls){ui.innerHTML=html;ui.className='ui-on '+(cls||'');const b=ui.querySelector('button.primary')||ui.querySelector('button');if(b&&PAD.on)setTimeout(()=>b.focus(),30)}
function hideUI(){ui.innerHTML='';ui.className='';window.onEnterKey=null;window.onBack=null}
function setPlayUI(on){$('hud').hidden=!on;$('pad').hidden=!on;document.body.classList.toggle('playing',on)}
const LANDIMG=th=>`art/bg/${th}_far.webp?v=${window.MTV}`;
/* ---------- title ---------- */
function toTitle(){state='title';G=null;setPlayUI(false);CINE.img=portrait?'cine/title_tall':'cine/title_wide';CINE.mode='title';CINE.t=0;AU.play('title');
 const tc=totalCandles();
 show(`<div class="title"><div class="logo"><div class="l1">MELISSA TIME</div><div class="l2">The Great Birthday Rescue</div><div class="vol">VOLUME 2</div></div>
 <div class="hb54">🎂 Happy 54th Birthday, Melissa! 🎂</div>
 <div class="menu"><button class="primary big" id="tPlay">▶ PLAY</button><button id="tSel">🗺️ CHOOSE LAND</button><button id="tHow">❓ HOW TO PLAY</button></div>
 <div class="tc">🕯 ${tc} / 54 candles found${PAD.on?' · 🎮 controller ready':''}</div></div>`,'t');
 $('tPlay').onclick=()=>{AU.fx('click');story={on:true,score:0,max:3};if(!SAVE.seenIntro)toIntro();else startLand(0)};
 $('tSel').onclick=()=>{AU.fx('click');toSelect()};$('tHow').onclick=()=>{AU.fx('click');toHow(toTitle)};
 window.onEnterKey=()=>$('tPlay').click();window.onBack=null}
/* ---------- intro cinematic ---------- */
const INTRO=[['cine/intro1','It\u2019s Melissa\u2019s 54th birthday! The Party Pals baked the biggest, pinkest cake Willowbrook has ever seen\u2026'],
 ['cine/intro2','But grumpy Baron Humbug HATES parties! He swooped in, vacuumed up all 54 candles, and carried off the Party Pals!'],
 ['cine/intro3','Melissa isn\u2019t having it. Six lands stand between her and Humbug Castle. The Great Birthday Rescue begins!']];
function toIntro(i=0){state='intro';setPlayUI(false);const [im,txt]=INTRO[i];CINE.img=im;CINE.t=0;CINE.mode='intro';AU.play('title');AU.fx('whoosh');
 show(`<div class="cine"><div class="cap"><span class="pg">${i+1} / 3</span><p id="capT"></p></div><div class="row"><button id="cSkip">SKIP</button><button class="primary" id="cNext">${i<2?'NEXT ▶':'LET\u2019S GO! ▶'}</button></div></div>`,'c');
 let n=0;const el=$('capT');const iv=setInterval(()=>{n+=2;el.textContent=txt.slice(0,n);if(n>=txt.length)clearInterval(iv)},28);
 const next=()=>{clearInterval(iv);clearTimeout(au);if(i<2)toIntro(i+1);else{SAVE.seenIntro=1;persist();startLand(0)}};const au=setTimeout(next,9000);
 $('cNext').onclick=()=>{AU.fx('click');next()};$('cSkip').onclick=()=>{AU.fx('click');clearInterval(iv);clearTimeout(au);SAVE.seenIntro=1;persist();startLand(0)};
 window.onEnterKey=()=>$('cNext').click();window.onBack=()=>$('cSkip').click()}
/* ---------- land select ---------- */
function toSelect(){state='select';setPlayUI(false);CINE.img=portrait?'cine/title_tall':'cine/title_wide';AU.play('title');
 const cards=LANDS.map((L,i)=>{const lock=i+1>SAVE.un;return `<button class="land${lock?' locked':''}" data-i="${i}" ${lock?'disabled':''}><img src="${LANDIMG(L.theme)}" alt=""><b>${L.sub}: ${L.name}</b><span>${lock?'🔒 Clear Land '+i+' to unlock':'🕯 '+candlesFound(i)+' / 9 candles'}</span></button>`}).join('');
 show(`<div class="sel"><h2>CHOOSE A LAND</h2><div class="grid">${cards}</div><div class="row"><button id="sBack">◀ BACK</button></div><p class="tip">Replay any land to find the candles you missed. ${totalCandles()}/54 found.</p></div>`,'s');
 ui.querySelectorAll('.land').forEach(b=>b.onclick=()=>{AU.fx('click');story={on:false,score:0,max:3};startLand(+b.dataset.i)});
 $('sBack').onclick=()=>{AU.fx('click');toTitle()};window.onBack=()=>$('sBack').click();window.onEnterKey=()=>{const b=ui.querySelector('.land:not(.locked)');b&&b.click()}}
/* ---------- how to play ---------- */
function toHow(back){const prev=state;if(prev!=='pause')state='howto';
 show(`<div class="how"><h2>HOW TO PLAY</h2><div class="cols">
 <div><h3>📱 Touch (no D-pad!)</h3><ul><li><b>Move:</b> swipe left or right anywhere and keep your finger down. Lift to stop.</li><li><b>Jump:</b> swipe up or tap <b>JUMP</b>. Hold for a higher jump. Jump again in the air for a <b>sparkle double jump</b>.</li><li><b>Sparkle:</b> tap <b>✨</b> to throw rainbow sparkles.</li><li><b>Ground pound:</b> swipe down in the air. Swipe down on a ledge to drop through.</li></ul></div>
 <div><h3>🎮 Controller</h3><ul><li>Works with USB or Bluetooth controllers on computers and phones. Just press a button.</li><li><b>Move:</b> left stick or D-pad</li><li><b>Jump:</b> A &nbsp; <b>Sparkle:</b> X</li><li><b>Pound / drop:</b> down</li><li><b>Pause:</b> Start</li><li><b>Menus:</b> stick or D-pad to choose, A to confirm, B to go back</li></ul>
 <h3>⌨️ Keyboard</h3><ul><li>Arrows/WASD move · Space/Up jump · X sparkle · Down pound · P pause · M mute</li></ul></div>
 <div><h3>🎂 Goal</h3><ul><li>Find all <b>9 candles</b> in each land: <b>54</b> in all. Some hide up high or inside 🎁 gift blocks (bump them from below).</li><li>Stomp or sparkle Humbug\u2019s grumpy minions. They pop into confetti!</li><li>🧁 heals · ❤️ adds a heart · ⭐ super sparkle · 🎈 float · 🎂 flags are checkpoints</li><li>Beat each boss and free a Party Pal. They follow you home!</li></ul></div></div>
 <div class="row"><button class="primary" id="hOk">GOT IT</button></div></div>`,'h');
 $('hOk').onclick=()=>{AU.fx('click');back()};window.onBack=window.onEnterKey=()=>$('hOk').click()}
/* ---------- land card + play ---------- */
function startLand(li){G=newRun(li);if(story.on){G.score=story.score;G.p.max=G.p.hp=G.maxHp=story.max}state='card';setPlayUI(false);updCam(G,0.016);G.t=0;
 const L=G.L;AU.play(L.music);
 show(`<div class="card"><div class="cardin"><div class="sub">${L.sub}</div><h1>${L.name}</h1><p>${L.intro}</p><div class="cc">🕯 ${candlesFound(li)} / 9 found here · Rescue <b>${L.palName}</b></div><button class="primary big" id="gGo">START ▶</button></div></div>`,'k');
 const go=()=>{clearTimeout(au);hideUI();state='play';setPlayUI(true);hudDirty=1;AU.unlock();AU.play(L.music)};const au=setTimeout(go,5000);
 $('gGo').onclick=()=>{AU.fx('click');go()};window.onEnterKey=()=>$('gGo').click();window.onBack=()=>{clearTimeout(au);toTitle()}}
function pauseGame(){if(state!=='play')return;state='pause';AU.duck(true);TOUCH.clear();
 show(`<div class="pause"><h2>PAUSED</h2><div class="menu"><button class="primary" id="pRes">▶ RESUME</button><button id="pHow">❓ HOW TO PLAY</button><button id="pRe">↺ RESTART LAND</button><button id="pQuit">⌂ TITLE</button></div></div>`,'p');
 $('pRes').onclick=resumeGame;$('pHow').onclick=()=>toHow(()=>{state='play';pauseGame()});$('pRe').onclick=()=>{AU.duck(false);startLand(G.li)};$('pQuit').onclick=()=>{AU.duck(false);toTitle()};
 window.onEnterKey=resumeGame;window.onBack=resumeGame}
function resumeGame(){if(state!=='pause')return;hideUI();state='play';AU.duck(false)}
function levelClear(){const g=G;state='clear';setPlayUI(false);const li=g.li;if(SAVE.un<li+2){SAVE.un=Math.min(6,li+2)}SAVE.best=Math.max(SAVE.best||0,g.score);persist();
 const got=g.found.length,all=candlesFound(li);story.score=g.score;story.max=g.p.max;AU.fx('clear');
 if(g.L.boss.final){setTimeout(toEnding,600);return}
 show(`<div class="clear"><h2>LAND CLEAR!</h2><div class="stats"><div>🕯 Candles this run: <b>${got} / 9</b></div><div>🕯 Found in this land: <b>${all} / 9</b></div><div>🎉 Rescued: <b>${g.L.palName}</b></div><div>⭐ Score: <b>${g.score.toLocaleString()}</b></div><div>🎂 Total candles: <b>${totalCandles()} / 54</b></div></div>
 <div class="menu"><button class="primary big" id="lNext">NEXT LAND ▶</button><button id="lRe">↺ REPLAY FOR CANDLES</button><button id="lT">⌂ TITLE</button></div></div>`,'l');
 $('lNext').onclick=()=>{AU.fx('click');if(!story.on)story={on:true,score:g.score,max:g.p.max};startLand(li+1)};$('lRe').onclick=()=>{AU.fx('click');story.on=false;startLand(li)};$('lT').onclick=()=>{AU.fx('click');toTitle()};
 window.onEnterKey=()=>$('lNext').click();window.onBack=()=>$('lT').click()}
/* ---------- ending celebration ---------- */
const LYR=['Happy birthday to you','Happy birthday to you','Happy birthday, dear Melissa','Happy birthday to you! 🎂'];
function toEnding(){state='ending';setPlayUI(false);CINE.img='cine/ending';CINE.mode='ending';CINE.t=0;CINE.parts=[];const tc=totalCandles(),sc=G?G.score:0;
 show(`<div class="end"><div class="lyr" id="lyr"></div><div class="endbox" id="endbox" hidden><h1>Happy 54th Birthday, Melissa!</h1><p>The candles are home, the Party Pals are safe, and even Baron Humbug is wearing a party hat.</p>
 <div class="stats"><div>🕯 Candles found: <b>${tc} / 54</b>${tc>=54?' · <b class="gold">PERFECT BIRTHDAY!</b>':''}</div><div>🎉 Party Pals rescued: <b>7 / 7</b></div><div>⭐ Score: <b>${sc.toLocaleString()}</b></div></div>
 ${tc<54?'<p class="tip">Replay lands to find the '+(54-tc)+' candles still hiding!</p>':''}<div class="menu"><button class="primary" id="eT">⌂ TITLE</button><button id="eS">🗺️ CHOOSE LAND</button></div></div></div>`,'e');
 $('eT').onclick=()=>{AU.fx('click');toTitle()};$('eS').onclick=()=>{AU.fx('click');toSelect()};
 const showBox=()=>{const b=$('endbox');if(b&&b.hidden){b.hidden=false;const f=$('eT');if(f&&PAD.on)f.focus()}};
 AU.play('birthday',()=>{AU.play('party');showBox()});setTimeout(showBox,AU.ctx?24000:1500);
 const lyr=$('lyr');const iv=setInterval(()=>{if(state!=='ending'){clearInterval(iv);return}if(AU.cur!=='birthday'||!AU.song){lyr.innerHTML='<span class="on">🎉 🎂 🎈 🎁 🎉</span>';return}const bar=Math.floor(AU.step/6);const li=bar<3?0:bar<5?1:bar<7?2:3;lyr.innerHTML=LYR.map((l,i)=>`<span class="${i===li?'on':i<li?'done':''}">${l}</span>`).join('')},120);
 window.onEnterKey=()=>{showBox();$('eT').click()};window.onBack=showBox}
/* ---------- HUD ---------- */
function updHud(){const g=G;if(!g)return;const p=g.p;let h='';for(let i=0;i<p.max;i++)h+=`<i class="${i<p.hp?'on':''}">♥</i>`;$('hHearts').innerHTML=h;
 $('hCandles').textContent=`${g.found.length}/9 · ${totalCandles()}/54`;$('hScore').textContent=g.score.toLocaleString()}
/* ---------- QA bot (used by automated playthroughs) ---------- */
function botThink(g,dt){const p=g.p,b={L:0,R:1,J:0,A:0,D:0,DP:0};BOT.t=(BOT.t||0)+dt;
 const ahead=p.x+p.face*70,gAhead=topAt(g,ahead),gHere=topAt(g,p.x);let want=false;
 if(p.on){if(gAhead>p.y+30||gAhead<p.y-12)want=true;if(blocked(g,p.x+55,p.y-20))want=true;for(const e of g.en)if(!e.dead&&e.x>p.x&&e.x-p.x<150&&Math.abs(e.y-p.y)<90)want=true;for(const s of g.spikes)if(s.x>p.x&&s.x-p.x<110)want=true}
 else if(p.vy>0&&gHere>p.y+40&&p.jumps<2)want=true;
 if(want&&!BOT.hold&&(BOT.rel||0)<=0){BOT.hold=0.32}
 if(BOT.hold>0){BOT.hold-=dt;b.J=1;if(BOT.hold<=0)BOT.rel=0.06}else{BOT.rel=(BOT.rel||0)-dt}
 if(g.bossOn&&g.boss&&g.boss.hp>0){const bx=g.boss.x;const d=bx-p.x;b.R=d>200?1:0;b.L=(d<110&&d>=0)?1:0;if(d<0){b.R=0;b.L=d<-200?1:0;if(d>-110)b.R=1}const A=g.arena;if(A&&(p.x<A.x0+90||p.x>A.x1-90)&&Math.abs(d)<200){b.L=d<0?1:0;b.R=d>0?1:0;if(p.on&&!BOT.hold)BOT.hold=0.32}
  if(Math.sin(BOT.t*2.7)>0.85&&p.on&&!BOT.hold)BOT.hold=0.3;BOT.away=(b.L&&d>0)||(b.R&&d<0)}
 if(g.cage&&g.cage.drop===2&&!g.cage.open){b.R=g.cage.x>p.x?1:0;b.L=g.cage.x<p.x?1:0}
 b.A=(Math.floor(BOT.t*8)%2===0)&&(g.bossOn||g.en.some(e=>!e.dead&&Math.abs(e.x-p.x)<500))?1:0;if(g.bossOn&&g.boss&&BOT.away&&Math.floor(BOT.t*3)%2===0){const d=g.boss.x-p.x;b.L=d<0?1:0;b.R=d>0?1:0}BOT.away=0;BOT.inp=b}
/* ---------- main loop ---------- */
function frame(ts){requestAnimationFrame(frame);const now=ts/1000;let dt=Math.min(0.033,now-(lastT||now));lastT=now;tNow=now;
 pollPad(dt);
 if(state==='play'&&G){const g=G;if(BOT.on)botThink(g,dt);readInput();
  if(g.hitstop>0)g.hitstop-=dt;else{g.t+=dt;updPlats(g,dt);updPlayer(g,dt);updItems(g,dt);updEnemies(g,dt);updShots(g,dt);updDrops(g,dt);updBoss(g,dt);updCage(g,dt);updPals(g,dt);updParts(g,dt);updCam(g,dt);
   if(g.combo&&g.p.on&&!g.p.pound)g.combo=0;g.shake=Math.max(0,g.shake-dt*30);g.flash=Math.max(0,g.flash-dt);
   if(g.L.rain){g.lt-=dt;g.lightning=Math.max(0,g.lightning-dt*2.5);if(g.lt<=0){g.lt=rnd(6,11);g.lightning=0.75;setTimeout(()=>AU.fx('thunder'),300)}}
   if(g.clearT>0){g.clearT+=dt;if(g.clearT>3.6&&state==='play')levelClear()}}
  if(hudDirty||(Math.floor(now*10)%3===0)){updHud();hudDirty=0}}
 else if((state==='card'||state==='pause')&&G){/* frozen world behind the card */}
 render()}
/* ---------- boot ---------- */
bindBtn($('bJump'),'jump');bindBtn($('bAct'),'act');
$('bPause').onclick=e=>{e.stopPropagation();pauseGame()};$('bMute').onclick=e=>{e.stopPropagation();toggleMute()};$('bMute').textContent=AU.muted?'🔇':'🔊';
document.addEventListener('pointerdown',()=>AU.unlock(),{capture:true});
resize();
(async()=>{state='load';requestAnimationFrame(frame);await loadAll(f=>{const b=$('ldBar');if(b)b.style.width=Math.round(f*100)+'%'});const ld=$('loading');if(ld)ld.remove();toTitle()})();
addEventListener('resize',()=>{if(state==='title')CINE.img=portrait?'cine/title_tall':'cine/title_wide'});
window.__mt={get G(){return G},get state(){return state},start:li=>{story={on:true,score:0,max:3};startLand(li)},go:()=>{const b=$('gGo');b&&b.click()},bot:on=>{BOT.on=!!on;BOT.inp=null},god:on=>{if(G)G.god=!!on},warp:x=>{if(G){G.p.x=x;G.p.y=topAt(G,x)<9999?topAt(G,x):GY;G.p.vy=0;G.hist=[]}},
 bossHp:n=>{if(G&&G.boss)G.boss.hp=n},ending:toEnding,title:toTitle,PAD,BOT,cam,layout:()=>({W,H,VV,VW,S,gameTop,gameH,portrait})};
