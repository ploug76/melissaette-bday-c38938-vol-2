/* Melissa Time Vol 2 - world: level build, physics, player, enemies, bosses, particles */
'use strict';
const PH={run:340,accG:2600,decG:3200,accA:1900,iceAcc:800,iceDec:380,jump:880,jump2:760,cut:2.4,fallMax:1150,coy:0.11,buf:0.13,spring:1300,pound:1250};
const EN={grumblin:{w:52,h:56,hp:1,sc:0.42,walk:62},snapper:{w:62,h:46,hp:1,sc:0.42,walk:95},snowgrump:{w:56,h:56,hp:1,sc:0.4,roll:230},
 buzzgrump:{w:58,h:56,hp:1,sc:0.4,fly:1},crystalbat:{w:70,h:44,hp:1,sc:0.42,fly:1},raincloud:{w:84,h:60,hp:2,sc:0.5,fly:1}};
const BOSS={smudge:{hp:10,w:150,h:170,sc:0.5},buzzbelle:{hp:10,w:150,h:150,sc:0.5,fly:1},snapjaw:{hp:10,w:200,h:150,sc:0.52},
 glimmerfang:{hp:12,w:200,h:130,sc:0.5},frostbeard:{hp:12,w:170,h:200,sc:0.56},humbug:{hp:20,w:190,h:190,sc:0.48,fly:1}};
function newRun(li){const L=LANDS[li];const g={li,L,t:0,score:G&&G.li!==undefined&&G.keepScore?G.score:0,sol:[],plats:[],springs:[],spikes:[],gifts:[],en:[],es:[],ps:[],items:[],candles:[],balloons:[],drops:[],cps:[],deco:[],lights:[],
 parts:[],pops:[],shake:0,hitstop:0,flash:0,cpX:60,cpY:GY,boss:null,arena:null,bossOn:false,cleared:false,clearT:0,lightning:0,lt:rnd(5,9),combo:0,banner:null,pals:[],hist:[],found:[]};
 for(const s of L.ground){const top=s[2]||GY;g.sol.push({x:s[0],y:top,w:s[1]-s[0],h:900,k:'g'})}
 for(const q of L.plats){const [x,y,w,k,dx,dy,per]=q;g.plats.push({x,y,w,h:24,k,x0:x,y0:y,dx:dx||0,dy:dy||0,per:per||3,ph:0,vx:0,vy:0,t:0,fall:0,gone:0,sink:0})}
 const tA=x=>{const t=topAt(g,x);return t<9999?t:GY};for(const x of L.springs)g.springs.push({x,y:tA(x),sq:0});
 for(const [x,w] of L.spikes)if(w>0)g.spikes.push({x,w,y:tA(x+w/2)});
 for(const [x,y,c] of L.gifts)g.gifts.push({x,y,w:46,h:46,c,open:0,bump:0});
 L.candles.forEach(([x,y],i)=>g.candles.push({x,y,i,got:(SAVE.c[li]||[]).includes(i),taken:0,t:Math.random()*6}));
 for(const [k,x,y] of L.items)g.items.push({k,x,y,t:Math.random()*6});
 for(const [x,y] of L.balloons)g.balloons.push({x,y,t:0,gone:0});
 for(const x of L.drops)g.drops.push({x,y:topY(g)+0,st:'hang',t:0,vy:0,y0:0});
 for(const x of L.cps)g.cps.push({x,y:tA(x),on:0,t:0});
 for(const e of L.en)spawnEnemy(g,e[0],e[1],e[2]);
 // decor + lights
 const th=L.theme;for(const s of g.sol){for(let x=s.x+80;x<s.x+s.w-60;x+=rnd(160,320)){if(th==='cave'){g.deco.push({k:'crystal',x,y:s.y,s:rnd(0.6,1.2),hue:[200,280,320][(Math.random()*3)|0]})}
  else if(th==='castle'&&Math.random()<0.45){g.deco.push({k:'torch',x,y:s.y});}else if(th==='village'||th==='fields'){g.deco.push({k:'flower',x,y:s.y,hue:[330,280,50,10,200][(Math.random()*5)|0],s:rnd(0.7,1.2)})}
  else if(th==='peaks'&&Math.random()<0.5)g.deco.push({k:'snowtuft',x,y:s.y,s:rnd(0.6,1.1)})}}
 const B=L.boss;g.arena={x0:B.x0,x1:B.x1};g.cage={x:(B.x0+B.x1)/2+120,y:200,open:0,drop:0,vy:0};
 g.p=newPlayer(60,GY);
 // party pals already rescued follow along
 const order=['bunny','frog','mouse','hedgehog','fox','owl','badger'];for(let i=0;i<Math.min(li,5);i++)g.pals.push(newPal(order[i],60-i*40));
 return g}
function newPal(k,x){return{k,x,y:GY,vy:0,face:1,hop:Math.random()*6}}
function newPlayer(x,y){return{x,y,vx:0,vy:0,w:38,h:96,on:false,onP:null,face:1,coy:0,buf:0,jumps:0,hp:3,max:3,inv:0,hurtT:0,castT:0,cd:0,star:0,balloon:0,pound:0,dropT:0,anim:0,land:0,sx:1,sy:1,safeX:x,safeY:y,dead:0}}
function topY(g){return 30}
function topAt(g,x){let t=9999;for(const s of g.sol)if(x>=s.x&&x<=s.x+s.w&&s.y<t)t=s.y;return t}
function spawnEnemy(g,k,x,y){const d=EN[k];const gy0=topAt(g,x),gy=gy0<9999?gy0:GY;const e={k,x,y:y||gy,w:d.w,h:d.h,hp:d.hp,vx:0,vy:0,face:-1,hx:x,hy:y||gy,t:Math.random()*6,st:'idle',dead:0,hit:0,fly:!!d.fly,on:false};
 if(k==='grumblin'||k==='snapper')e.vx=-(d.walk);g.en.push(e);return e}
/* ---------- particles ---------- */
function part(g,o){if(g.parts.length>700)g.parts.shift();g.parts.push(Object.assign({x:0,y:0,vx:0,vy:0,life:1,max:1,size:4,col:'#fff',k:'dot',grav:0,rot:0,vr:0,add:0,drag:0},o))}
function burst(g,x,y,n,cols,sp,k,size){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=rnd(sp*0.3,sp);part(g,{x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*0.2,life:rnd(0.5,1.1),max:1,size:rnd(size*0.6,size),col:cols[i%cols.length],k:k||'spark',grav:500,rot:Math.random()*6,vr:rnd(-10,10),add:k!=='confetti',drag:1.5})}}
const CONF=['#ff5fa2','#ffd84a','#5fd3ff','#8cff6a','#c77dff','#ff8a3d','#fff'];
function confetti(g,x,y,n){burst(g,x,y,n,CONF,520,'confetti',9)}
function pop(g,x,y,txt,col,big){g.pops.push({x,y,txt,col:col||'#fff',t:0,big:!!big})}
function shake(g,a){g.shake=Math.max(g.shake,a)}
/* ---------- collision helpers ---------- */
const ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function pbox(p){return{x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h}}
function solidsFor(g){const out=g.sol.slice();for(const b of g.gifts)out.push(b);if(g.bossOn&&g.arena){out.push({x:g.arena.x0-40,y:-2000,w:40,h:4000,k:'wall'});out.push({x:g.arena.x1,y:-2000,w:40,h:4000,k:'wall'})}return out}
/* ---------- platforms ---------- */
function updPlats(g,dt){for(const q of g.plats){const ox=q.x,oy=q.y;
 if(q.k==='m'){q.t+=dt;const s=(1-Math.cos(q.t/q.per*TAU))/2;q.x=q.x0+q.dx*s;q.y=q.y0+q.dy*s}
 else if(q.k==='c'){if(q.fall>0){q.fall+=dt;if(q.fall>0.55){q.gone=1;q.vy+=GRAV*dt;q.y+=q.vy*dt}if(q.fall>3.2){q.fall=0;q.vy=0;q.y=q.y0;q.gone=0}}}
 else if(q.k==='f'){if(q.sink>0){q.sink+=dt;q.y=q.y0+Math.min(70,Math.max(0,(q.sink-0.5)*90));if(q.sink>1.25)q.gone=1}else q.y=lerp(q.y,q.y0,dt*3);if(q.sink>3){q.sink=0;q.gone=0}}
 q.vx=(q.x-ox)/Math.max(dt,1e-4);q.vy2=(q.y-oy)/Math.max(dt,1e-4)}}
/* ---------- player ---------- */
function hurt(g,p,src){if(p.inv>0||p.star>0||G.god)return;p.hp--;p.inv=1.4;p.hurtT=0.45;p.vy=-520;p.vx=(src&&src.x>p.x?-1:1)*320;AU.fx('hurt');shake(g,10);g.flash=0.25;
 burst(g,p.x,p.y-60,14,['#ffd84a','#fff','#ff5fa2'],300,'star',8);if(p.hp<=0)oops(g)}
function oops(g){const p=g.p;p.dead=1.4;AU.fx('fall');g.score=Math.max(0,g.score-500);pop(g,p.x,p.y-120,'Oops! Try again!','#ffd84a',1)}
function respawn(g){const p=g.p;const cp=g.bossOn?{x:g.arena.x0+80,y:GY}:{x:g.cpX,y:g.cpY};Object.assign(p,newPlayer(cp.x,cp.y));if(!g.bossOn){const sg=g.sol.find(s=>cp.x>=s.x&&cp.x<=s.x+s.w&&Math.abs(s.y-cp.y)<2);if(sg&&sg.w>=160)p.x=Math.max(sg.x+80,Math.min(sg.x+sg.w-80,cp.x))}p.hp=p.max=g.maxHp||3;p.inv=1.5;
 for(const pl of g.pals){pl.x=cp.x-40;pl.y=cp.y}g.hist=[];burst(g,p.x,p.y-50,24,CONF,300,'star',8)}
function updPlayer(g,dt){const p=g.p,L=g.L;
 if(p.dead>0){p.dead-=dt;p.vy+=GRAV*0.4*dt;p.y+=p.vy*dt*0.2;if(p.dead<=0)respawn(g);return}
 const ice=L.ice&&p.on&&!p.onP;
 let dir=(inp.R?1:0)-(inp.L?1:0);if(p.hurtT>0){p.hurtT-=dt;dir=0}
 const max=PH.run*(p.star>0?1.12:1);
 const acc=p.on?(ice?PH.iceAcc:PH.accG):PH.accA,dec=p.on?(ice?PH.iceDec:PH.decG):PH.accA*0.6;
 if(dir){if(Math.sign(p.vx)!==dir&&p.on&&!ice)p.vx+=dir*dec*dt;p.vx+=dir*acc*dt;p.vx=clamp(p.vx,-max,max);p.face=dir}
 else if(p.hurtT<=0){const s=Math.sign(p.vx);p.vx-=s*dec*dt;if(Math.sign(p.vx)!==s)p.vx=0}
 // jump buffer / coyote
 if(inp.jumpP)p.buf=PH.buf;else p.buf=Math.max(0,p.buf-dt);
 if(p.on){p.coy=PH.coy;p.jumps=0}else p.coy=Math.max(0,p.coy-dt);
 if(p.buf>0&&!p.pound){
  if(p.coy>0){p.vy=-PH.jump;p.on=false;p.coy=0;p.buf=0;p.jumps=1;p.sy=1.25;p.sx=0.8;AU.fx('jump');for(let i=0;i<8;i++)part(g,{x:p.x+rnd(-14,14),y:p.y,vx:rnd(-90,90),vy:rnd(-60,-10),life:0.45,size:rnd(4,8),col:'rgba(255,255,255,0.7)',k:'smoke'})}
  else if(p.jumps<2&&!p.balloon){p.vy=-PH.jump2;p.jumps=2;p.buf=0;p.sy=1.2;p.sx=0.85;AU.fx('jump2');for(let i=0;i<14;i++){const a=i/14*TAU;part(g,{x:p.x,y:p.y-30,vx:Math.cos(a)*220,vy:Math.sin(a)*90+60,life:0.5,size:6,col:CONF[i%7],k:'star',add:1})}}}
 // variable jump
 if(p.vy<0&&!inp.jump&&!p.springT)p.vy+=GRAV*(PH.cut-1)*dt;
 if(p.springT)p.springT=Math.max(0,p.springT-dt);
 // ground pound / drop-through
 if(inp.downP){if(!p.on&&!p.pound&&p.vy>-500){p.pound=1;p.vy=PH.pound;p.vx*=0.3;AU.fx('whoosh')}else if(p.on&&p.onP&&p.onP.k!=='f'){p.dropT=0.25}}
 if(p.dropT>0)p.dropT-=dt;
 // balloon float
 let grav=GRAV;if(p.balloon>0){p.balloon-=dt;grav*=0.32;if(inp.jump&&p.vy>-300)p.vy-=1100*dt;if(p.balloon<=0)AU.fx('pop')}
 p.vy=Math.min(p.vy+grav*dt,p.balloon>0?160:(p.pound?PH.pound:PH.fallMax));
 // carry with platform
 if(p.on&&p.onP){p.x+=p.onP.vx*dt;p.y=p.onP.y}
 // move X
 const sols=solidsFor(g);p.x+=p.vx*dt;let b=pbox(p);
 for(const s of sols){if(ov(b,s)){if(p.x<s.x+Math.min(s.w/2,60))p.x=s.x-p.w/2-0.01;else p.x=s.x+s.w+p.w/2+0.01;p.vx=0;b=pbox(p)}}
 if(p.x<20)p.x=20,p.vx=0;if(p.x>L.len-20)p.x=L.len-20;
 // move Y
 const prevY=p.y;p.y+=p.vy*dt;b=pbox(p);const wasOn=p.on;p.on=false;p.onP=null;
 for(const s of sols){if(ov(b,s)){if(p.vy>=0&&prevY<=s.y+8){p.y=s.y;landOn(g,p,s,wasOn)}else if(p.vy<0){p.y=s.y+s.h+p.h;p.vy=0;if(s.c!==undefined)hitGift(g,s)}b=pbox(p)}}
 if(p.dropT<=0)for(const q of g.plats){if(q.gone)continue;if(p.vy>=0&&p.x+p.w/2>q.x+4&&p.x-p.w/2<q.x+q.w-4&&prevY<=q.y+6+Math.max(0,q.vy2||0)*dt&&p.y>=q.y){p.y=q.y;landOn(g,p,q,wasOn);p.onP=q;
  if(q.k==='c'&&!q.fall){q.fall=0.001;AU.fx('click')}if(q.k==='f'&&!q.sink){q.sink=0.001}}}
 // springs
 for(const sp of g.springs){if(p.vy>=0&&Math.abs(p.x-sp.x)<34&&p.y>=sp.y-40&&prevY<=sp.y-30){p.y=sp.y-40;p.vy=-PH.spring;p.on=false;p.springT=0.5;p.jumps=1;p.pound=0;sp.sq=1;AU.fx('spring');confetti(g,sp.x,sp.y-40,16);p.sy=1.35;p.sx=0.75}}
 // water / pit
 if(p.y>GY+260){if(L.water){for(let i=0;i<20;i++)part(g,{x:p.x+rnd(-20,20),y:GY+20,vx:rnd(-160,160),vy:rnd(-520,-180),life:0.8,size:rnd(4,8),col:'rgba(190,240,255,0.9)',k:'dot',grav:1200})}
  if(G.god){p.x=nextGround(g,p.x);p.y=topAt(g,p.x)-1;p.vy=0}else if(p.inv>0||p.star>0){p.x=rfBack(g,p.safeX,p.safeY,p.x);p.y=p.safeY;p.vx=p.vy=0;p.inv=Math.max(p.inv,1)}else{p.hp--;AU.fx('fall');shake(g,8);if(p.hp<=0){oops(g);p.y=GY+260;return}p.x=rfBack(g,p.safeX,p.safeY,p.x);p.y=p.safeY;p.vx=p.vy=0;p.inv=1.4}}
 // spikes
 for(const s of g.spikes){if(ov(pbox(p),{x:s.x+6,y:s.y-26,w:s.w-12,h:26}))hurt(g,p,{x:s.x+s.w/2})}
 // timers & anim
 if(p.inv>0)p.inv-=dt;if(p.star>0){p.star-=dt;if(Math.random()<0.7)part(g,{x:p.x+rnd(-20,20),y:p.y-rnd(10,90),vx:-p.vx*0.2,vy:rnd(-40,40),life:0.6,size:rnd(4,8),col:CONF[(Math.random()*7)|0],k:'star',add:1})}
 p.castT=Math.max(0,p.castT-dt);p.cd=Math.max(0,p.cd-dt);
 if(inp.actP&&p.cd<=0&&p.dead<=0){shoot(g,p)}
 p.anim+=dt*(p.on?Math.abs(p.vx)/40:6);p.sx=lerp(p.sx,1,dt*12);p.sy=lerp(p.sy,1,dt*12);
 if(p.on&&!p.onP&&p.hurtT<=0){const s=g.sol.find(s=>p.x>=s.x+40&&p.x<=s.x+s.w-40&&Math.abs(s.y-p.y)<2);if(s){p.safeX=p.x;p.safeY=p.y}}
 if(p.on&&Math.abs(p.vx)>200&&Math.random()<0.25)part(g,{x:p.x-p.face*10,y:p.y-2,vx:-p.face*rnd(20,80),vy:rnd(-60,-20),life:0.35,size:rnd(3,6),col:L.theme==='peaks'?'rgba(255,255,255,0.9)':'rgba(230,210,180,0.6)',k:'smoke'});
 // trail history for followers
 g.hist.unshift({x:p.x,y:p.y,f:p.face,on:p.on});if(g.hist.length>200)g.hist.pop()}
/* respawn fix (Oct 30): blinking pit falls are free; respawn backs up ~1.5 body widths from the pit edge */
function rfBack(g,x,y,fx){const s=g.sol.find(s=>x>=s.x&&x<=s.x+s.w&&Math.abs(s.y-y)<2);if(!s)return x;const d=Math.sign(fx-x)||1,m=80,edge=d>0?s.x+s.w:s.x;let nx=x;if(Math.abs(edge-x)<m)nx=edge-d*m;nx=Math.max(s.x+Math.min(m,s.w/2),Math.min(s.x+s.w-Math.min(m,s.w/2),nx));for(const k of g.spikes||[])if(nx+40>k.x&&nx-40<k.x+k.w)return x;return nx}
function nextGround(g,x){let best=null;for(const s of g.sol){if(s.x+s.w>x+60){const nx=Math.max(s.x+50,x+60);if(!best||nx<best)best=nx}}return best||x}
function landOn(g,p,s,wasOn){p.vy=0;p.on=true;if(!wasOn){p.sx=1.2;p.sy=0.82;AU.fx('land');for(let i=0;i<6;i++)part(g,{x:p.x+rnd(-18,18),y:p.y,vx:rnd(-120,120),vy:rnd(-50,-10),life:0.4,size:rnd(4,8),col:'rgba(255,255,255,0.6)',k:'smoke'})}
 if(p.pound){p.pound=0;shake(g,9);AU.fx('pound');for(let i=0;i<18;i++){const a=Math.PI+i/17*Math.PI;part(g,{x:p.x,y:p.y-4,vx:Math.cos(a)*340,vy:Math.sin(a)*160,life:0.5,size:rnd(5,9),col:'rgba(255,240,220,0.8)',k:'smoke'})}
  for(const e of g.en)if(!e.dead&&Math.abs(e.x-p.x)<110&&Math.abs(e.y-p.y)<60)killEnemy(g,e,1);if(s.c!==undefined)hitGift(g,s)}}
function shoot(g,p){p.cd=0.26;p.castT=0.22;AU.fx('spark');const dir=p.face;g.ps.push({x:p.x+dir*34,y:p.y-62,vx:dir*760+p.vx*0.3,vy:0,life:g.bossOn?0.85:0.62,t:0});for(let i=0;i<6;i++)part(g,{x:p.x+dir*40,y:p.y-62,vx:dir*rnd(40,160),vy:rnd(-80,80),life:0.3,size:rnd(3,6),col:CONF[i],k:'star',add:1})}
function hitGift(g,b){if(b.open)return;b.open=1;b.bump=1;AU.fx('gift');confetti(g,b.x+b.w/2,b.y,18);g.score+=500;pop(g,b.x+b.w/2,b.y-20,'+500','#ffd84a');
 g.items.push({k:b.c,x:b.x+b.w/2,y:b.y-40,t:0,rise:1})}
/* ---------- items ---------- */
function updItems(g,dt){const p=g.p,pb=pbox(p);
 for(const c of g.candles){c.t+=dt;if(c.taken){c.taken+=dt;continue}if(Math.abs(c.x-p.x)<40&&c.y>p.y-p.h-26&&c.y<p.y+20){c.taken=0.001;getCandle(g,c)}}
 for(const it of g.items){it.t+=dt;if(it.gone)continue;if(it.rise){it.y-=dt*60;it.rise=Math.max(0,it.rise-dt*1.5)}
  if(ov(pb,{x:it.x-26,y:it.y-26,w:52,h:52})){it.gone=1;getItem(g,it)}}
 for(const b of g.balloons){b.t+=dt;if(b.gone){b.gone-=dt;if(b.gone<=0)b.gone=0;continue}if(ov(pb,{x:b.x-24,y:b.y-70,w:48,h:70})){b.gone=8;p.balloon=7;p.jumps=1;p.vy=Math.min(p.vy,-200);AU.fx('balloon');pop(g,b.x,b.y-80,'Balloon float! Hold JUMP to rise','#ff9ad5')}}
 for(const c of g.cps){c.t+=dt;if(!c.on&&p.x>c.x-10){c.on=1;g.cpX=c.x;g.cpY=c.y;AU.fx('check');confetti(g,c.x,c.y-120,30);pop(g,c.x,c.y-150,'Checkpoint!','#8cff6a',1);p.hp=Math.max(p.hp,Math.min(p.max,p.hp+1))}}}
function getCandle(g,c){const li=g.li;g.found.push(c.i);const arr=SAVE.c[li]||(SAVE.c[li]=[]);const fresh=!arr.includes(c.i);if(fresh){arr.push(c.i);persist()}
 g.score+=1000;AU.fx('candle',g.found.length+li*2);burst(g,c.x,c.y,22,['#ffd84a','#ff9a3c','#fff6c0','#ff5fa2'],340,'star',8);
 for(let i=0;i<10;i++)part(g,{x:c.x,y:c.y,vx:rnd(-60,60),vy:rnd(-220,-80),life:1,size:rnd(8,14),col:'rgba(255,200,80,0.5)',k:'glow',add:1});
 pop(g,c.x,c.y-30,`🕯 ${g.found.length}/9  ·  ${totalCandles()}/54`,'#ffe27a',1);hudDirty=1}
function getItem(g,it){const p=g.p;switch(it.k){
 case'cupcake':p.hp=Math.min(p.max,p.hp+1);AU.fx('heal');pop(g,it.x,it.y-30,'Yum! +1 ♥','#ff8ad8');break;
 case'heart':p.max=Math.min(5,p.max+1);g.maxHp=p.max;p.hp=p.max;AU.fx('heal');pop(g,it.x,it.y-30,'Extra heart!','#ff5f7a',1);break;
 case'star':p.star=8;AU.fx('star');pop(g,it.x,it.y-30,'SUPER SPARKLE!','#ffd84a',1);break;
 case'gift':g.score+=2000;AU.fx('gift');pop(g,it.x,it.y-30,'+2000','#ffd84a');confetti(g,it.x,it.y,30);break}
 burst(g,it.x,it.y,16,CONF,300,'star',7);g.score+=100;hudDirty=1}
/* ---------- enemies ---------- */
function killEnemy(g,e,stomp){if(e.dead)return;e.dead=1;e.dt=0;g.combo++;const pts=200*Math.min(8,g.combo);g.score+=pts;pop(g,e.x,e.y-e.h-10,'+'+pts+(g.combo>1?' x'+g.combo:''),'#fff');
 AU.fx(stomp?'stomp':'pop');confetti(g,e.x,e.y-e.h/2,22);for(let i=0;i<3;i++)part(g,{x:e.x+rnd(-16,16),y:e.y-e.h/2,vx:rnd(-40,40),vy:rnd(-160,-90),life:1.4,size:12,col:'#ff6fae',k:'heart',grav:-30});g.hitstop=0.05;hudDirty=1}
function updEnemies(g,dt){const p=g.p,pb=pbox(p);
 for(const e of g.en){if(e.dead){e.dt+=dt;continue}e.t+=dt;const d=EN[e.k];const dx=p.x-e.x,near=Math.abs(dx)<VW*0.7;
  if(!near&&!e.awake)continue;e.awake=1;
  switch(e.k){
  case'grumblin':case'snapper':{e.x+=e.vx*dt;const ahead=e.x+Math.sign(e.vx)*(e.w/2+4);const t=topAt(g,ahead);if(Math.abs(t-e.y)>4||blocked(g,ahead,e.y-10)){e.vx=-e.vx}e.face=e.vx<0?-1:1;e.y=topAt(g,e.x)<9999?e.y:e.y;break}
  case'snowgrump':{if(e.st==='idle'&&Math.abs(dx)<520){e.st='roll';e.vx=Math.sign(dx)*d.roll}if(e.st==='roll'){e.x+=e.vx*dt;e.rot=(e.rot||0)+e.vx*dt/30;const t=topAt(g,e.x);if(Math.abs(t-e.y)>4){e.vy+=GRAV*dt;e.y+=e.vy*dt;if(e.y>GY+300)e.dead=1,e.dt=9}else e.vy=0;if(blocked(g,e.x+Math.sign(e.vx)*30,e.y-10))e.vx=-e.vx;if(Math.random()<0.3)part(g,{x:e.x,y:e.y,vx:rnd(-30,30),vy:rnd(-80,-20),life:0.4,size:5,col:'#fff',k:'smoke'})}break}
  case'buzzgrump':{e.x=e.hx+Math.sin(e.t*1.3)*90;e.y=e.hy+Math.sin(e.t*2.6)*30;e.face=Math.cos(e.t*1.3)>0?1:-1;break}
  case'crystalbat':{if(e.st==='idle'){e.y=e.hy+Math.sin(e.t*3)*6;if(Math.abs(dx)<280&&p.y>e.y){e.st='swoop';e.t=0;e.sx=e.x;e.tx=p.x+Math.sign(dx)*60;e.ty=p.y-50}}
   else if(e.st==='swoop'){const k=Math.min(1,e.t/1.1);e.x=lerp(e.sx,e.tx,k);e.y=e.hy+Math.sin(k*Math.PI)*(e.ty-e.hy);e.face=e.tx>e.sx?1:-1;if(k>=1){e.st='idle';e.hx=e.x;e.t=0}}break}
  case'raincloud':{e.x+=clamp(p.x-e.x,-1,1)*70*dt;e.x=clamp(e.x,e.hx-320,e.hx+320);e.y=e.hy+Math.sin(e.t*1.7)*12;e.rt=(e.rt||0)+dt;if(e.rt>1.5&&Math.abs(dx)<300){e.rt=0;g.es.push({k:'rain',x:e.x+rnd(-24,24),y:e.y,vx:0,vy:120,r:7,life:3,grav:900})}break}}
  e.hit=Math.max(0,(e.hit||0)-dt);
  // player contact
  const eb={x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h};
  if(ov(pb,eb)&&p.dead<=0){if(p.star>0){killEnemy(g,e)}else if((p.vy>60||p.pound)&&p.y-eb.y<e.h*0.55+18){if(e.hp>1&&!p.pound){e.hp--;e.hit=0.3;AU.fx('stomp')}else killEnemy(g,e,1);p.vy=inp.jump?-PH.jump*1.02:-PH.jump*0.72;p.jumps=1;p.pound=0;p.sy=1.2;shake(g,4)}else hurt(g,p,e)}
 }
 g.en=g.en.filter(e=>!(e.dead&&e.dt>2))}
function blocked(g,x,y){for(const s of g.sol)if(x>s.x&&x<s.x+s.w&&y>s.y)return true;return false}
function updShots(g,dt){const p=g.p,pb=pbox(p);
 for(const s of g.ps){s.t+=dt;s.life-=dt;s.x+=s.vx*dt;const B=g.boss;if(g.bossOn&&B&&B.hp>0&&B.st!=='intro'&&(B.x-s.x)*Math.sign(s.vx)>0){const ty=B.y-B.h*0.5;s.vy=lerp(s.vy||0,clamp((ty-s.y)*4,-900,900),Math.min(1,dt*7))}s.y+=(s.vy||0)*dt+Math.sin(s.t*30)*0.8;if(Math.random()<0.8)part(g,{x:s.x,y:s.y+rnd(-6,6),vx:-s.vx*0.05,vy:rnd(-30,30),life:0.35,size:rnd(3,6),col:CONF[(Math.random()*7)|0],k:'star',add:1});
  const sb={x:s.x-14,y:s.y-14,w:28,h:28};
  for(const e of g.en){if(!e.dead&&ov(sb,{x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h})){e.hp--;e.hit=0.25;if(e.hp<=0)killEnemy(g,e);else AU.fx('stomp');s.life=0;break}}
  for(const es of g.es){if(es.k==='rocket'&&Math.hypot(es.x-s.x,es.y-s.y)<34){es.life=0;s.life=0;confetti(g,es.x,es.y,14);AU.fx('pop');g.score+=300}}
  if(g.boss&&g.boss.hp>0&&s.life>0&&ov(sb,bossBox(g.boss))){bossHit(g,1);s.life=0;burst(g,s.x,s.y,12,CONF,260,'star',7)}
  for(const sol of g.sol)if(s.x>sol.x&&s.x<sol.x+sol.w&&s.y>sol.y)s.life=0;
  if(s.life<=0)for(let i=0;i<8;i++)part(g,{x:s.x,y:s.y,vx:rnd(-160,160),vy:rnd(-160,160),life:0.3,size:5,col:CONF[i%7],k:'star',add:1})}
 g.ps=g.ps.filter(s=>s.life>0);
 for(const s of g.es){s.life-=dt;s.t=(s.t||0)+dt;
  if(s.k==='rocket'){const a=Math.atan2(p.y-60-s.y,p.x-s.x);s.vx=lerp(s.vx,Math.cos(a)*230,dt*1.6);s.vy=lerp(s.vy,Math.sin(a)*230,dt*1.6);if(Math.random()<0.6)part(g,{x:s.x,y:s.y,vx:-s.vx*0.3,vy:-s.vy*0.3,life:0.4,size:6,col:'rgba(180,140,255,0.7)',k:'smoke'})}
  if(s.k==='wave'){s.x+=s.vx*dt;s.y=topAt(g,s.x)}else{s.vy+=(s.grav||0)*dt;s.x+=s.vx*dt;s.y+=s.vy*dt}
  if(s.k==='shard'&&s.warn>0){s.warn-=dt;s.y-=s.vy*dt;s.vy=0;s.life+=dt}
  const gt=topAt(g,s.x);
  if(s.y>gt&&s.k!=='wave'){if(s.bounce&&s.bn<s.bounce){s.y=gt;s.vy=-Math.abs(s.vy)*0.62;s.bn=(s.bn||0)+1;AU.fx('thud')}else if(s.k==='bomb'){s.life=0;AU.fx('thud');shake(g,5);for(let i=-1;i<=1;i++)g.es.push({k:'gloom',x:s.x,y:gt-8,vx:i*240,vy:-420,r:10,life:2,grav:1400});burst(g,s.x,gt,16,['#8a5cff','#3a1f6e','#c9a0ff'],300,'smoke',12)}
   else if(s.k==='roll'){s.y=gt;s.vy=0;s.rot=(s.rot||0)+s.vx*dt/40}
   else{s.life=0;if(s.k==='rain')for(let i=0;i<4;i++)part(g,{x:s.x,y:gt,vx:rnd(-80,80),vy:rnd(-140,-40),life:0.3,size:3,col:'#9fd8ff',k:'dot',grav:800});else burst(g,s.x,gt,8,['#fff','#cfe8ff','#d8b0ff'],200,'spark',6)}}
  if(s.y>GY+400)s.life=0;
  if(ov(pb,{x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2})&&p.dead<=0){if(p.star>0&&s.k!=='wave'){s.life=0}else{hurt(g,p,s);if(s.k!=='wave')s.life=0}}}
 g.es=g.es.filter(s=>s.life>0)}
function updDrops(g,dt){const p=g.p;for(const d of g.drops){d.t+=dt;
 if(d.st==='hang'){d.y=g.camTop+6;if(Math.abs(p.x-d.x)<150){d.st='shake';d.t=0;d.y0=d.y}}
 else if(d.st==='shake'){if(d.t>0.55){d.st='fall';d.vy=0}}
 else if(d.st==='fall'){d.vy+=GRAV*dt;d.y+=d.vy*dt;const gt=topAt(g,d.x);if(ov(pbox(p),{x:d.x-14,y:d.y,w:28,h:56}))hurt(g,p,d);if(d.y+56>gt){d.st='gone';d.t=0;AU.fx('thud');shake(g,4);burst(g,d.x,gt,14,g.L.theme==='peaks'?['#fff','#bfe6ff']:['#6a5a8a','#c9a0ff','#ff9ad5'],260,'spark',7)}}
 else if(d.st==='gone'&&d.t>5){if(Math.abs(p.x-d.x)>400){d.st='hang';d.t=0}}}}
/* ---------- pals following ---------- */
function updPals(g,dt){g.pals.forEach((pl,i)=>{const h=g.hist[Math.min(g.hist.length-1,(i+1)*14)];pl.hop+=dt*8;if(!h)return;pl.x=lerp(pl.x,h.x-h.f*10,dt*10);pl.y=lerp(pl.y,h.y,dt*12);pl.face=h.f})}
/* ---------- particles ---------- */
function updParts(g,dt){for(const q of g.parts){q.life-=dt;q.vy+=q.grav*dt;if(q.drag){q.vx*=1-q.drag*dt;q.vy*=1-q.drag*dt*0.5}q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt}g.parts=g.parts.filter(q=>q.life>0);
 for(const o of g.pops)o.t+=dt;g.pops=g.pops.filter(o=>o.t<1.4)}
