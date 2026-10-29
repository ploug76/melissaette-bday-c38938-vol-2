/* Melissa Time Vol 2 - renderer: painted parallax, lighting, particles, sprites */
'use strict';
const cam={x:0,y:0};let lc=null,lctx=null;
const SKY={village:['#7ec8ff','#d8f0ff'],fields:['#ff9a62','#ffd59a'],river:['#a8dcff','#e8f7ff'],cave:['#0b0820','#1c1446'],peaks:['#2a2870','#8a6cc8'],castle:['#140a2a','#3a2060']};
function updCam(g,dt){const p=g.p;let tx=p.x-VW*0.42+p.face*VW*0.06;let lo=0,hi=g.L.len-VW;
 if(g.bossOn){lo=g.arena.x0-40;hi=Math.max(lo,g.arena.x1+40-VW);if(VW>g.arena.x1-g.arena.x0+80){tx=(g.arena.x0+g.arena.x1)/2-VW/2;lo=hi=tx}}
 tx=clamp(tx,lo,hi);cam.x=g.t<0.05?tx:lerp(cam.x,tx,1-Math.exp(-dt*7));
 const bottom=GY+(g.bossOn?40:110)-VV;let ty=Math.min(bottom,p.y-VV*0.66);ty=Math.max(ty,-420);cam.y=g.t<0.05?ty:lerp(cam.y,ty,1-Math.exp(-dt*4));g.camTop=cam.y;
 const B=g.boss;if(B&&g.bossOn&&B.st!=='die'&&B.st!=='gone'&&(BOSS[B.k].fly||B.k==='glimmerfang')){const im=IMG['boss/'+B.k],sh=im?im.height*BOSS[B.k].sc:B.h;B.y=Math.max(B.y,ty+sh*0.95+14)}
 if(!g.bossOn&&p.x>g.arena.x0+60&&!g.boss)startBoss(g)}
function img(k){return IMG[k]}
function drawSprite(k,x,y,sc,flip,ax,rot,alpha){const im=IMG[k];if(!im)return;const w=im.width*sc,h=im.height*sc;ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);if(flip)ctx.scale(-1,1);if(alpha!==undefined)ctx.globalAlpha*=alpha;ctx.drawImage(im,-w*(ax===undefined?0.5:ax),-h,w,h);ctx.restore()}
function glow(x,y,r,col,a){const gr=ctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a===undefined?1:a;ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1}
function drawLayer(k,fx,yScr,sc){const im=IMG[k];if(!im)return;const w=im.width*sc,h=im.height*sc;let x0=-((cam.x*fx)%w);if(x0>0)x0-=w;for(let x=x0;x<VW+w;x+=w-1)ctx.drawImage(im,cam.x+x,cam.y+yScr-h,w,h)}
function render(){const g=G;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#120a26';ctx.fillRect(0,0,W,H);
 if(state==='play'||state==='pause'||state==='clear'||state==='card'&&g){if(g)drawWorld(g)}else if(CINE.img)drawCine()}
function drawWorld(g){const L=g.L,th=L.theme;let sx=0,sy=0;if(g.shake>0){sx=rnd(-1,1)*g.shake;sy=rnd(-1,1)*g.shake}
 ctx.save();ctx.beginPath();ctx.rect(0,gameTop,W,gameH);ctx.clip();
 ctx.setTransform(DPR*S,0,0,DPR*S,DPR*sx,DPR*(gameTop+sy));
 // sky + far painted layer
 const sk=SKY[th],sg=ctx.createLinearGradient(0,0,0,VV);sg.addColorStop(0,sk[0]);sg.addColorStop(1,sk[1]);ctx.fillStyle=sg;ctx.fillRect(0,0,VW+2,VV+2);
 ctx.translate(-cam.x,-cam.y);
 const rest=GY+110-VV,dy=rest-cam.y;const farSc=(VV+200)/540;drawLayer('bg/'+th+'_far',0.08,VV+170+dy*0.12,farSc);
 // god rays
 if(L.rays){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=cam.x+VW*(0.15+i*0.25)+Math.sin(g.t*0.2+i)*40;const gr=ctx.createLinearGradient(x,cam.y,x+180,cam.y+VV);gr.addColorStop(0,'rgba(255,240,200,0.16)');gr.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x,cam.y-10);ctx.lineTo(x+70,cam.y-10);ctx.lineTo(x+260,cam.y+VV);ctx.lineTo(x+120,cam.y+VV);ctx.fill()}ctx.restore()}
 // back ambient
 drawAmbient(g,0);
 const midSc=th==='castle'?0.95:0.85;drawLayer('bg/'+th+'_mid',0.42,VV-110+44+dy*0.5,midSc);
 // atmospheric haze between mid and play layer
 const hz=ctx.createLinearGradient(0,cam.y+VV*0.4,0,cam.y+VV);hz.addColorStop(0,'rgba(255,255,255,0)');hz.addColorStop(1,th==='cave'||th==='castle'?'rgba(20,8,50,0.35)':'rgba(255,255,255,0.12)');ctx.fillStyle=hz;ctx.fillRect(cam.x,cam.y,VW,VV);
 drawTerrain(g);
 drawThings(g);
 drawEnemies(g);
 if(g.boss)drawBoss(g);
 drawCage(g);
 drawShots(g);
 drawPals(g);
 drawPlayer(g);
 drawParts(g);
 drawAmbient(g,1);
 if(L.dark)drawDark(g);
 ctx.setTransform(DPR*S,0,0,DPR*S,0,DPR*gameTop);
 if(L.rain)drawRain(g);
 // grade + vignette
 ctx.fillStyle=L.grade;ctx.fillRect(0,0,VW,VV);
 const vg=ctx.createRadialGradient(VW/2,VV*0.5,VV*0.35,VW/2,VV*0.5,Math.max(VW,VV)*0.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,0,30,0.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VV);
 if(g.flash>0){ctx.fillStyle=`rgba(255,80,120,${g.flash*1.2})`;ctx.fillRect(0,0,VW,VV)}
 if(g.lightning>0){ctx.fillStyle=`rgba(235,220,255,${g.lightning})`;ctx.fillRect(0,0,VW,VV)}
 drawPops(g);drawBossBar(g);drawBanner(g);
 ctx.restore();
 // frame line for portrait
 if(portrait){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(255,140,210,0.8)';ctx.fillRect(0,gameTop-2,W,2);ctx.fillRect(0,gameTop+gameH,W,2)}}
function drawTerrain(g){const th=g.L.theme,top=IMG['ground/'+th],fill=IMG['ground/'+th+'_fill'],surf=(MAN['ground/'+th]||{}).surf||8;
 const bottom=cam.y+VV+20;
 // pits: water or void
 if(g.L.water){const wy=GY+22+Math.sin(g.t*2)*3;const wg=ctx.createLinearGradient(0,wy,0,bottom);wg.addColorStop(0,'rgba(90,210,230,0.92)');wg.addColorStop(1,'rgba(10,70,120,0.98)');ctx.fillStyle=wg;ctx.fillRect(cam.x,wy,VW,bottom-wy);
  ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=3;ctx.beginPath();for(let x=cam.x-(cam.x%40);x<cam.x+VW+40;x+=20)ctx.lineTo(x,wy+Math.sin(x*0.05+g.t*4)*3);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.25)';for(let i=0;i<14;i++){const x=cam.x+((i*137+g.t*40)%VW);ctx.fillRect(x,wy+12+(i%4)*14,30+(i%3)*14,2)}}
 for(const s of g.sol){if(s.x>cam.x+VW+20||s.x+s.w<cam.x-20)continue;const y0=s.y-surf*0.85;
  if(top){const tw=top.width;ctx.save();ctx.beginPath();ctx.rect(s.x,y0-60,s.w,bottom-y0+60);ctx.clip();
   if(fill){const fh=fill.height,fw=fill.width;for(let y=y0+top.height-6;y<bottom;y+=fh-1)for(let x=s.x-((s.x)%fw);x<s.x+s.w;x+=fw-1)ctx.drawImage(fill,x,y);}
   for(let x=s.x-20;x<s.x+s.w;x+=tw-2)ctx.drawImage(top,x,y0);
   const sh=ctx.createLinearGradient(0,y0+40,0,bottom);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,20,0.55)');ctx.fillStyle=sh;ctx.fillRect(s.x,y0+40,s.w,bottom-y0);ctx.restore();
   // edge shading
   const eg=ctx.createLinearGradient(s.x,0,s.x+18,0);eg.addColorStop(0,'rgba(0,0,0,0.35)');eg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=eg;ctx.fillRect(s.x,y0+10,18,bottom-y0);
   const eg2=ctx.createLinearGradient(s.x+s.w,0,s.x+s.w-18,0);eg2.addColorStop(0,'rgba(0,0,0,0.35)');eg2.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=eg2;ctx.fillRect(s.x+s.w-18,y0+10,18,bottom-y0)}}
 // decor
 for(const d of g.deco){if(d.x<cam.x-80||d.x>cam.x+VW+80)continue;
  if(d.k==='crystal'){ctx.save();ctx.translate(d.x,d.y+4);ctx.scale(d.s,d.s);for(let i=-1;i<=1;i++){const h=40+Math.abs(i)*-12+20;const gr=ctx.createLinearGradient(0,-h,0,0);gr.addColorStop(0,`hsla(${d.hue},100%,85%,0.95)`);gr.addColorStop(1,`hsla(${d.hue},90%,45%,0.9)`);ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(i*14-8,0);ctx.lineTo(i*14+i*6,-h);ctx.lineTo(i*14+8,0);ctx.fill()}ctx.restore();ctx.globalCompositeOperation='lighter';glow(d.x,d.y-24,60*d.s,`hsla(${d.hue},100%,70%,0.35)`);ctx.globalCompositeOperation='source-over'}
  else if(d.k==='torch'){ctx.fillStyle='#3a2a40';ctx.fillRect(d.x-3,d.y-70,6,70);ctx.fillStyle='#6a4a30';ctx.fillRect(d.x-8,d.y-76,16,8);const f=Math.sin(g.t*14+d.x)*3;ctx.fillStyle='#ffb040';ctx.beginPath();ctx.ellipse(d.x,d.y-86+f*0.3,7,13+f,0,0,TAU);ctx.fill();ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.ellipse(d.x,d.y-82,3,6,0,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';glow(d.x,d.y-84,90,'rgba(255,150,60,0.45)');ctx.globalCompositeOperation='source-over';if(Math.random()<0.15)part(g,{x:d.x,y:d.y-96,vx:rnd(-10,10),vy:rnd(-60,-30),life:0.6,size:3,col:'#ffcf70',k:'dot',add:1})}
  else if(d.k==='flower'){const sw=Math.sin(g.t*2+d.x)*3;ctx.strokeStyle='#3c8a3a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.quadraticCurveTo(d.x+sw,d.y-12,d.x+sw,d.y-22*d.s);ctx.stroke();ctx.fillStyle=`hsl(${d.hue},85%,70%)`;for(let i=0;i<5;i++){const a=i/5*TAU+g.t*0.3;ctx.beginPath();ctx.arc(d.x+sw+Math.cos(a)*5*d.s,d.y-22*d.s+Math.sin(a)*5*d.s,3.5*d.s,0,TAU);ctx.fill()}ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(d.x+sw,d.y-22*d.s,2.5*d.s,0,TAU);ctx.fill()}
  else if(d.k==='snowtuft'){ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.ellipse(d.x,d.y-2,30*d.s,10*d.s,0,Math.PI,0);ctx.fill()}}
 // platforms
 for(const q of g.plats){if(q.x>cam.x+VW+20||q.x+q.w<cam.x-20)continue;if(q.k==='c'&&q.fall>0.55&&q.y>cam.y+VV+40)continue;ctx.save();if(q.k==='c'&&q.fall>0&&q.fall<0.55)ctx.translate(Math.sin(q.fall*80)*2.5,0);
  if(q.k==='f'){ctx.globalAlpha=q.gone?0.35:1;ctx.fillStyle='#3fa84a';ctx.beginPath();ctx.ellipse(q.x+q.w/2,q.y+4,q.w/2,10,0,0,TAU);ctx.fill();ctx.fillStyle='#62cf5d';ctx.beginPath();ctx.ellipse(q.x+q.w/2,q.y+1,q.w/2-3,8,0,0.25,TAU-0.25);ctx.lineTo(q.x+q.w/2,q.y+1);ctx.fill();ctx.fillStyle='#ff9ad5';ctx.beginPath();ctx.arc(q.x+q.w*0.65,q.y-2,5,0,TAU);ctx.fill()}
  else if(top){const sc=0.42,th2=top.height*sc;ctx.beginPath();ctx.moveTo(q.x+10,q.y-surf*sc);ctx.lineTo(q.x+q.w-10,q.y-surf*sc);ctx.lineTo(q.x+q.w,q.y+th2*0.3);ctx.lineTo(q.x+q.w-16,q.y+th2);ctx.lineTo(q.x+16,q.y+th2);ctx.lineTo(q.x,q.y+th2*0.3);ctx.closePath();ctx.save();ctx.clip();for(let x=q.x;x<q.x+q.w;x+=top.width*sc-1)ctx.drawImage(top,x,q.y-surf*sc,top.width*sc,th2);ctx.restore();
   ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(q.x+12,q.y+th2-6,q.w-24,4);
   if(q.k==='m'){ctx.fillStyle='rgba(255,230,120,0.9)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(q.x+q.w/2+(i-1)*14,q.y+th2*0.6,3,0,TAU);ctx.fill()}}
   if(q.k==='c'){ctx.strokeStyle='rgba(40,20,10,0.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x+q.w*0.3,q.y);ctx.lineTo(q.x+q.w*0.38,q.y+th2*0.7);ctx.moveTo(q.x+q.w*0.7,q.y);ctx.lineTo(q.x+q.w*0.62,q.y+th2*0.6);ctx.stroke()}}
  ctx.restore()}}
function drawThings(g){const t=g.t;
 // spikes
 for(const s of g.spikes){if(s.x>cam.x+VW||s.x+s.w<cam.x)continue;const th=g.L.theme;const n=Math.max(2,Math.round(s.w/14));for(let i=0;i<n;i++){const x=s.x+(i+0.5)*s.w/n,h=24+((i*7)%3)*6;const gr=ctx.createLinearGradient(0,s.y-h,0,s.y);
  const c=th==='peaks'?['#ffffff','#7fc8ff']:th==='cave'?['#ffd0f0','#c040a0']:th==='castle'?['#c9a0ff','#3a1f6e']:['#f4c0ff','#5a2a6a'];gr.addColorStop(0,c[0]);gr.addColorStop(1,c[1]);ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x-9,s.y+2);ctx.lineTo(x,s.y-h);ctx.lineTo(x+9,s.y+2);ctx.fill()}
  if(th==='village'||th==='fields'){ctx.fillStyle='#2f6a34';ctx.beginPath();ctx.ellipse(s.x+s.w/2,s.y,s.w/2+6,12,0,Math.PI,0);ctx.fill()}}
 // springs (cupcake bounce pads)
 for(const sp of g.springs){sp.sq=Math.max(0,sp.sq-0.06);const sy=1-sp.sq*0.35;ctx.save();ctx.translate(sp.x,sp.y);ctx.scale(1+sp.sq*0.2,sy);drawSprite('item/cupcake',0,4,0.75,false);ctx.restore();ctx.fillStyle='#fff';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.globalAlpha=0.7+Math.sin(t*6)*0.3;ctx.fillText('▲ BOUNCE',sp.x,sp.y-92);ctx.globalAlpha=1}
 // gift blocks
 for(const b of g.gifts){b.bump=Math.max(0,b.bump-0.08);const by=b.y-Math.sin(b.bump*Math.PI)*10;if(!b.open){ctx.globalCompositeOperation='lighter';glow(b.x+b.w/2,by+b.h/2,52,'rgba(255,200,120,0.3)');ctx.globalCompositeOperation='source-over';drawSprite('item/gift',b.x+b.w/2,by+b.h,0.46,false)}else{ctx.globalAlpha=0.55;ctx.filter='grayscale(0.8)';drawSprite('item/gift',b.x+b.w/2,by+b.h,0.46,false);ctx.filter='none';ctx.globalAlpha=1}}
 // checkpoints (birthday banner poles)
 for(const c of g.cps){ctx.fillStyle='#e8d6b0';ctx.fillRect(c.x-3,c.y-130,6,130);ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(c.x,c.y-134,7,0,TAU);ctx.fill();const fy=c.on?c.y-128:c.y-40,wv=Math.sin(t*5)*6;ctx.fillStyle=c.on?'#ff5fa2':'#8a7a9a';ctx.beginPath();ctx.moveTo(c.x+3,fy);ctx.quadraticCurveTo(c.x+30,fy+6+wv*0.3,c.x+58,fy+8+wv);ctx.lineTo(c.x+3,fy+34);ctx.fill();if(c.on){ctx.fillStyle='#fff';ctx.font='bold 14px system-ui';ctx.fillText('🎂',c.x+22,fy+22);ctx.globalCompositeOperation='lighter';glow(c.x,c.y-130,60,'rgba(255,120,200,0.35)');ctx.globalCompositeOperation='source-over'}}
 // balloons
 for(const b of g.balloons){if(b.gone)continue;const y=b.y+Math.sin(b.t*2)*8;ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b.x,y);ctx.quadraticCurveTo(b.x+6,y+20,b.x,y+40);ctx.stroke();drawSprite('item/balloon',b.x,y,0.6,false);ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('FLOAT',b.x,y-72)}
 // candles
 for(const c of g.candles){if(c.taken>0.5)continue;const bob=Math.sin(c.t*2.4)*5,y=c.y+bob;const a=c.taken?1-c.taken*2:1;
  ctx.globalCompositeOperation='lighter';glow(c.x,y-12,70,'rgba(255,190,70,0.45)',a);glow(c.x,y-30,26+Math.sin(c.t*16)*3,'rgba(255,240,160,0.8)',a);ctx.globalCompositeOperation='source-over';
  drawSprite('item/candle',c.x,y+22-(c.taken*80),0.44,false,0.5,Math.sin(c.t*1.7)*0.08,c.got?a*0.75:a);
  if(c.got&&!c.taken){ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('found',c.x,y+36)}
  if(Math.random()<0.08)part(g,{x:c.x+rnd(-4,4),y:y-28,vx:rnd(-10,10),vy:rnd(-40,-20),life:0.6,size:3,col:'#ffe9a0',k:'dot',add:1})}
 // items
 for(const it of g.items){if(it.gone)continue;const y=it.y+Math.sin(it.t*3)*5;ctx.globalCompositeOperation='lighter';glow(it.x,y,48,it.k==='star'?'rgba(255,230,90,0.5)':'rgba(255,150,220,0.35)');ctx.globalCompositeOperation='source-over';
  drawSprite('item/'+it.k,it.x,y+24,it.k==='star'?0.42:0.44,false,0.5,it.k==='star'?Math.sin(it.t*3)*0.25:0)}
 // falling drops
 for(const d of g.drops){if(d.st==='gone')continue;const x=d.x+(d.st==='shake'?Math.sin(d.t*70)*3:0),y=d.y;const ice=g.L.theme==='peaks';const gr=ctx.createLinearGradient(0,y,0,y+58);gr.addColorStop(0,ice?'#e8f6ff':'#4a3a64');gr.addColorStop(1,ice?'#7fc8ff':'#c9a0ff');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x-16,y);ctx.lineTo(x+16,y);ctx.lineTo(x,y+58);ctx.fill();
  if(d.st!=='fall'&&Math.abs(g.p.x-d.x)<240){ctx.fillStyle='rgba(255,60,90,0.35)';ctx.beginPath();ctx.ellipse(d.x,topAt(g,d.x),22,6,0,0,TAU);ctx.fill()}}}
function drawEnemies(g){for(const e of g.en){if(e.x<cam.x-120||e.x>cam.x+VW+120)continue;const d=EN[e.k];
 if(e.dead){const a=1-e.dt/0.5;if(a<=0)continue;ctx.save();ctx.globalAlpha=a;ctx.translate(e.x,e.y-e.h/2);ctx.scale(1+e.dt*2,1-e.dt*1.5);drawSprite('enemy/'+e.k,0,e.h/2,d.sc,e.face>0);ctx.restore();continue}
 if(!e.fly){ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(e.x,e.y,e.w*0.45,6,0,0,TAU);ctx.fill()}
 const sq=e.k==='grumblin'||e.k==='snapper'?1+Math.sin(e.t*10)*0.05:1;ctx.save();ctx.translate(e.x,e.y);ctx.scale(1/sq,sq);if(e.hit>0)ctx.filter='brightness(2.2)';
 if(e.k==='buzzgrump'||e.k==='crystalbat'){const fl=Math.sin(e.t*30)*0.06;ctx.scale(1,1+fl)}
 drawSprite('enemy/'+e.k,0,e.k==='raincloud'?20:4,d.sc,e.face>0,0.5,e.k==='snowgrump'?e.rot||0:0);ctx.filter='none';ctx.restore();
 if(e.k==='crystalbat'&&g.L.dark){ctx.globalCompositeOperation='lighter';glow(e.x,e.y-20,50,'rgba(150,120,255,0.35)');ctx.globalCompositeOperation='source-over'}}}
function bossFace(b){return b.k==='humbug'||b.k==='buzzbelle'?b.face>0:b.face>0}
function drawBoss(g){const b=g.boss;if(b.st==='gone')return;const d=BOSS[b.k];ctx.save();
 if(!b.fly||b.y>GY-60){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(b.x,GY,b.w*0.5,12,0,0,TAU);ctx.fill()}
 ctx.translate(b.x,b.y+(b.fly?Math.sin(g.t*3)*6:0));if(b.st==='die'){ctx.rotate(Math.sin(b.t*20)*0.08);ctx.globalAlpha=Math.max(0,1-b.t/2.4)}
 const br=b.st==='stomp'&&!b.air&&b.t<0.4||b.st==='charge'&&b.t<0.6?1.06:1;ctx.scale(br,2-br);
 if(b.hitT>0)ctx.filter='brightness(2.4) saturate(0.3)';else if(b.dizzy)ctx.filter='saturate(0.6)';
 drawSprite('boss/'+b.k,0,b.k==='glimmerfang'?12:8,d.sc,bossFace(b));ctx.filter='none';ctx.restore();
 if(b.dizzy){for(let i=0;i<3;i++){const a=g.t*5+i*2.1;ctx.fillStyle='#ffd84a';ctx.font='18px system-ui';ctx.fillText('★',b.x+Math.cos(a)*40-6,b.y-b.h-6+Math.sin(a)*8)}}
 if(b.k==='glimmerfang'&&b.y<GY-20){ctx.strokeStyle='rgba(230,220,255,0.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,cam.y);ctx.lineTo(b.x,b.y-b.h);ctx.stroke()}
 if(b.vac){ctx.globalCompositeOperation='lighter';glow(b.x,b.y-70,160,'rgba(200,160,255,0.35)');ctx.globalCompositeOperation='source-over'}
 if(b.st==='intro'){ctx.globalCompositeOperation='lighter';glow(b.x,b.y-b.h/2,220,`rgba(255,80,160,${0.3*Math.min(1,b.intro)})`);ctx.globalCompositeOperation='source-over'}}
function drawCage(g){const c=g.cage;if(!c||!g.bossOn&&!g.boss)return;if(!c.open){ctx.strokeStyle='#b89a50';ctx.lineWidth=3;if(!c.drop){ctx.beginPath();ctx.moveTo(c.x,cam.y);ctx.lineTo(c.x,c.y-130);ctx.stroke()}
  drawSprite('pal/'+g.L.pal,c.x,c.y-8,0.42,false);if(g.L.pal2)drawSprite('pal/'+g.L.pal2,c.x+24,c.y-8,0.36,false);drawSprite('item/cage',c.x,c.y+4,0.95,false);
  if(c.drop===2){ctx.fillStyle='#fff';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText('Walk over to open!',c.x,c.y-150)}}}
function drawShots(g){ctx.globalCompositeOperation='lighter';for(const s of g.ps){glow(s.x,s.y,34,'rgba(255,200,255,0.6)');}ctx.globalCompositeOperation='source-over';
 for(const s of g.ps)drawSprite('item/spark',s.x,s.y+20,0.36,s.vx<0,0.5,s.t*8);
 for(const s of g.es){ctx.save();ctx.translate(s.x,s.y);switch(s.k){
  case'acorn':ctx.rotate(g.t*10);ctx.fillStyle='#8a5a2a';ctx.beginPath();ctx.ellipse(0,2,11,13,0,0,TAU);ctx.fill();ctx.fillStyle='#5a3a1a';ctx.beginPath();ctx.ellipse(0,-8,13,7,0,0,TAU);ctx.fill();break;
  case'stinger':ctx.rotate(Math.atan2(s.vy,s.vx));ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,-5);ctx.lineTo(-10,5);ctx.fill();ctx.fillStyle='#222';ctx.fillRect(-12,-3,5,6);break;
  case'coconut':ctx.rotate(g.t*8);ctx.fillStyle='#6a4424';ctx.beginPath();ctx.arc(0,0,18,0,TAU);ctx.fill();ctx.fillStyle='#3a2414';[0,2,4].forEach(a=>{ctx.beginPath();ctx.arc(Math.cos(a)*7,Math.sin(a)*7,3,0,TAU);ctx.fill()});break;
  case'shard':case'icicle':{if(s.warn>0){ctx.restore();ctx.fillStyle=`rgba(255,60,120,${0.3+Math.sin(g.t*30)*0.2})`;ctx.beginPath();ctx.ellipse(s.x,topAt(g,s.x)<9999?topAt(g,s.x):GY,24,7,0,0,TAU);ctx.fill();ctx.save();ctx.translate(s.x,s.y)}const ice=s.k==='icicle';const gr=ctx.createLinearGradient(0,-20,0,24);gr.addColorStop(0,ice?'#fff':'#ffd0f0');gr.addColorStop(1,ice?'#7fc8ff':'#c040c0');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(-11,-22);ctx.lineTo(11,-22);ctx.lineTo(0,26);ctx.fill();break}
  case'roll':ctx.rotate(s.rot||0);ctx.fillStyle='#f4fbff';ctx.beginPath();ctx.arc(0,-30,30,0,TAU);ctx.fill();ctx.strokeStyle='#bfe0ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-30,22,0.5,2.4);ctx.stroke();break;
  case'wave':{const gr=ctx.createLinearGradient(0,-40,0,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,g.L.theme==='peaks'?'rgba(200,235,255,0.95)':'rgba(255,220,160,0.9)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(-24,0);ctx.quadraticCurveTo(0,-50,24,0);ctx.fill();break}
  case'bomb':ctx.fillStyle='#3a1f6e';ctx.beginPath();ctx.arc(0,0,16,0,TAU);ctx.fill();ctx.fillStyle='#ff5fa2';ctx.fillRect(-3,-22,6,8);ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(0,-24,3+Math.random()*3,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('☹',0,5);break;
  case'gloom':ctx.globalCompositeOperation='lighter';glow(0,0,22,'rgba(160,110,255,0.8)');ctx.globalCompositeOperation='source-over';ctx.fillStyle='#5a2fa0';ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.fill();break;
  case'rocket':ctx.rotate(Math.atan2(s.vy,s.vx));ctx.fillStyle='#8a5cff';ctx.fillRect(-16,-7,26,14);ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.moveTo(10,-7);ctx.lineTo(20,0);ctx.lineTo(10,7);ctx.fill();ctx.fillStyle='#ff6a3d';ctx.beginPath();ctx.moveTo(-16,-5);ctx.lineTo(-26-Math.random()*8,0);ctx.lineTo(-16,5);ctx.fill();break;
  case'rain':ctx.fillStyle='#8fd0ff';ctx.beginPath();ctx.moveTo(0,-9);ctx.quadraticCurveTo(7,2,0,7);ctx.quadraticCurveTo(-7,2,0,-9);ctx.fill();break}ctx.restore()}}
function drawPals(g){for(const pl of g.pals){const hop=Math.abs(Math.sin(pl.hop))*8;ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(pl.x,pl.y,18,4,0,0,TAU);ctx.fill();drawSprite('pal/'+pl.k,pl.x,pl.y-hop,0.38,pl.face<0)}}
const HERO_SC=0.5;
function heroFrame(p){if(p.dead>0||p.hurtT>0)return'hurt';if(p.castT>0)return'cast';if(!p.on)return'jump';if(Math.abs(p.vx)>30)return(Math.floor(p.anim/2.2)%2)?'run1':'run2';return'idle'}
function drawPlayer(g){const p=g.p;if(p.inv>0&&p.dead<=0&&Math.floor(p.inv*14)%2===0)return;
 const sh=Math.max(0.3,1-(topAt(g,p.x)-p.y)/300);if(topAt(g,p.x)<9999){ctx.fillStyle=`rgba(0,0,0,${0.28*sh})`;ctx.beginPath();ctx.ellipse(p.x,topAt(g,p.x),24*sh,6*sh,0,0,TAU);ctx.fill()}
 if(p.star>0){ctx.globalCompositeOperation='lighter';glow(p.x,p.y-55,90,`hsla(${(g.t*300)%360},100%,70%,0.55)`);ctx.globalCompositeOperation='source-over'}
 if(p.balloon>0){const bx=p.x+p.face*16,by=p.y-150+Math.sin(g.t*3)*4;ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x+p.face*12,p.y-80);ctx.lineTo(bx,by);ctx.stroke();drawSprite('item/balloon',bx,by,0.55,false,0.5,0,p.balloon<1.5&&Math.floor(p.balloon*8)%2?0.4:1)}
 const fr=heroFrame(p),m=MAN['hero/'+fr]||{};const flip=p.face<0;
 ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.sx,p.sy);if(p.dead>0)ctx.rotate(Math.sin(p.dead*10)*0.2);
 let tilt=0;if(!p.on&&p.dead<=0)tilt=clamp(p.vx/2000,-0.12,0.12);if(p.pound)tilt=0;ctx.rotate(tilt);
 const breathe=fr==='idle'?1+Math.sin(g.t*3)*0.012:1;ctx.scale(1,breathe);
 drawSprite('hero/'+fr,0,2,HERO_SC,flip,flip?1-(m.ax||0.5):(m.ax||0.5));ctx.restore();
 if(p.pound){ctx.fillStyle='rgba(255,255,255,0.5)';for(let i=0;i<3;i++)ctx.fillRect(p.x-14+i*12,p.y-150-i*10,3,40)}}
function drawParts(g){for(const q of g.parts){const a=clamp(q.life/q.max,0,1);if(q.add)ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;
 switch(q.k){case'dot':ctx.fillStyle=q.col;ctx.beginPath();ctx.arc(q.x,q.y,q.size*0.5,0,TAU);ctx.fill();break;
  case'spark':case'star':{ctx.fillStyle=q.col;const s=q.size*(0.5+a*0.5);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.beginPath();for(let i=0;i<4;i++){const an=i*Math.PI/2;ctx.lineTo(Math.cos(an)*s,Math.sin(an)*s);ctx.lineTo(Math.cos(an+Math.PI/4)*s*0.3,Math.sin(an+Math.PI/4)*s*0.3)}ctx.fill();ctx.restore();break}
  case'confetti':ctx.fillStyle=q.col;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.fillRect(-q.size/2,-q.size/4,q.size,q.size/2*Math.abs(Math.cos(q.rot*2)));ctx.restore();break;
  case'smoke':ctx.fillStyle=q.col;ctx.beginPath();ctx.arc(q.x,q.y,q.size*(1.6-a*0.6),0,TAU);ctx.fill();break;
  case'glow':glow(q.x,q.y,q.size*2,q.col,a);break;
  case'heart':ctx.fillStyle=q.col;ctx.font=`${q.size*2}px system-ui`;ctx.textAlign='center';ctx.fillText('♥',q.x,q.y);break}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}}
/* ambient particles in screen-ish space (wrap around the camera) */
const AMB=[];for(let i=0;i<70;i++)AMB.push({x:Math.random(),y:Math.random(),z:rnd(0.4,1.4),s:Math.random()*6,v:Math.random()});
function drawAmbient(g,front){const k=g.L.amb,t=g.t;if(k==='rain')return;ctx.save();for(const a of AMB){if((a.z>1)!==!!front)continue;
 let x,y;const W2=VW+100,H2=VV+100;
 if(k==='snow'){x=((a.x*W2+Math.sin(t*0.7+a.s)*30-cam.x*0.2*a.z)%W2+W2)%W2-50;y=((a.y*H2+t*40*a.z)%H2)-50;ctx.fillStyle='rgba(255,255,255,0.85)';ctx.beginPath();ctx.arc(cam.x+x,cam.y+y,2.2*a.z,0,TAU);ctx.fill()}
 else if(k==='petals'){x=((a.x*W2-t*30*a.z-cam.x*0.2*a.z)%W2+W2)%W2-50;y=((a.y*H2+t*22*a.z)%H2)-50;ctx.fillStyle=a.v>0.5?'rgba(255,170,210,0.85)':'rgba(255,240,250,0.85)';ctx.save();ctx.translate(cam.x+x,cam.y+y);ctx.rotate(t*2+a.s);ctx.beginPath();ctx.ellipse(0,0,4*a.z,2*a.z,0,0,TAU);ctx.fill();ctx.restore()}
 else if(k==='seeds'){x=((a.x*W2+t*24*a.z-cam.x*0.2*a.z)%W2+W2)%W2-50;y=((a.y*H2-t*10*a.z+Math.sin(t+a.s)*20)%H2+H2)%H2-50;ctx.globalCompositeOperation='lighter';glow(cam.x+x,cam.y+y,5*a.z,a.v>0.5?'rgba(255,220,140,0.8)':'rgba(255,255,255,0.7)');ctx.globalCompositeOperation='source-over'}
 else if(k==='mist'){x=((a.x*W2+t*12*a.z-cam.x*0.3*a.z)%W2+W2)%W2-50;y=a.y*H2*0.5+VV*0.45;if(a.v<0.3){glow(cam.x+x,cam.y+y,70*a.z,'rgba(255,255,255,0.18)')}else{ctx.fillStyle='rgba(220,245,255,0.6)';ctx.beginPath();ctx.arc(cam.x+x,cam.y+((a.y*H2+t*30)%H2)-50,1.5*a.z,0,TAU);ctx.fill()}}
 else if(k==='motes'){x=((a.x*W2+Math.sin(t*0.5+a.s)*20-cam.x*0.2*a.z)%W2+W2)%W2-50;y=((a.y*H2-t*14*a.z)%H2+H2)%H2-50;ctx.globalCompositeOperation='lighter';glow(cam.x+x,cam.y+y,6*a.z,a.v>0.5?'rgba(140,180,255,0.9)':'rgba(255,140,230,0.9)');ctx.globalCompositeOperation='source-over'}}
 ctx.restore()}
function drawRain(g){ctx.strokeStyle='rgba(190,180,255,0.35)';ctx.lineWidth=1.3;ctx.beginPath();for(const a of AMB){for(let j=0;j<2;j++){const x=((a.x*VW+j*97-g.t*180)%VW+VW)%VW,y=((a.y*VV+j*211+g.t*900*a.z)%VV);ctx.moveTo(x,y);ctx.lineTo(x-6,y+18)}}ctx.stroke()}
function drawDark(g){const vw=Math.ceil(VW/2),vh=Math.ceil(VV/2);if(!lc){lc=document.createElement('canvas');lctx=lc.getContext('2d')}if(lc.width!==vw||lc.height!==vh){lc.width=vw;lc.height=vh}
 const dk=g.L.theme==='cave'?0.8:0.55;lctx.globalCompositeOperation='source-over';lctx.clearRect(0,0,vw,vh);lctx.fillStyle=`rgba(6,2,22,${Math.max(0,dk-g.lightning)})`;lctx.fillRect(0,0,vw,vh);lctx.globalCompositeOperation='destination-out';
 const L=(x,y,r,a)=>{x=(x-cam.x)/2;y=(y-cam.y)/2;r/=2;if(x<-r||x>vw+r||y<-r||y>vh+r)return;const gr=lctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=gr;lctx.fillRect(x-r,y-r,r*2,r*2)};
 const p=g.p;L(p.x,p.y-60,p.star>0?420:300,1);for(const c of g.candles)if(!c.taken)L(c.x,c.y-14,150,0.9);for(const d of g.deco)if(d.k==='crystal'||d.k==='torch')L(d.x,d.y-40,d.k==='torch'?240:170,0.85);
 for(const s of g.ps)L(s.x,s.y,160,0.9);for(const it of g.items)if(!it.gone)L(it.x,it.y,110,0.7);for(const e of g.en)if(!e.dead&&e.k==='crystalbat')L(e.x,e.y-20,120,0.6);if(g.boss)L(g.boss.x,g.boss.y-g.boss.h/2,320,0.8);if(g.cage)L(g.cage.x,g.cage.y-60,160,0.7);for(const c of g.cps)if(c.on)L(c.x,c.y-120,150,0.8);
 ctx.drawImage(lc,cam.x,cam.y,VW+2,VV+2)}
function drawPops(g){ctx.textAlign='center';for(const o of g.pops){const a=Math.min(1,(1.4-o.t)*2);const x=o.x-cam.x,y=o.y-cam.y-o.t*50;ctx.globalAlpha=a;ctx.font=`900 ${o.big?22:17}px system-ui,sans-serif`;ctx.lineWidth=4;ctx.strokeStyle='rgba(40,0,50,0.8)';ctx.strokeText(o.txt,x,y);ctx.fillStyle=o.col;ctx.fillText(o.txt,x,y)}ctx.globalAlpha=1}
/* boss bar placement: centred in the free gap between the HUD pills and the pause/mute buttons when it fits, otherwise just below the HUD; never overlaps a pill */
function bossBarBox(){let w=Math.min(VW-40,420),x=(VW-w)/2,y=14;const hud=document.getElementById('hud');if(!hud||hud.hidden)return{w,x,y};
 const gs=hud.querySelectorAll('.grp'),bp=document.getElementById('bPause');let le=0,bot=0;gs.forEach(e=>{const r=e.getBoundingClientRect();le=Math.max(le,r.right);bot=Math.max(bot,r.bottom)});
 let re=W;if(bp){const r=bp.getBoundingClientRect();re=r.left;bot=Math.max(bot,r.bottom)}let top=1e9;gs.forEach(e=>{top=Math.min(top,e.getBoundingClientRect().top)});
 const gap=re-le-24;if(gap>=230){const wc=Math.min(w*S,gap);w=wc/S;x=(le+12+(gap-wc)/2)/S;y=Math.max(4,(top-gameTop)/S+4);return{w,x,y}}
 y=Math.max(14,(bot+8-gameTop)/S+4);return{w,x,y}}
function drawBossBar(g){const b=g.boss;if(!b||b.st==='gone')return;const{w,x,y}=bossBarBox();ctx.fillStyle='rgba(20,0,40,0.75)';rr(x-6,y-4,w+12,34,10);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 12px system-ui';ctx.textAlign='left';ctx.fillText(b.name,x+4,y+10);
 const f=b.hp/b.max;ctx.fillStyle='#3a1050';rr(x+4,y+15,w-8,10,5);ctx.fill();const gr=ctx.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'#ff5fa2');gr.addColorStop(1,'#ffd84a');ctx.fillStyle=gr;rr(x+4,y+15,(w-8)*f,10,5);ctx.fill()}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function drawBanner(g){const b=g.banner;if(!b)return;b.t+=1/60;if(b.t>2.6){g.banner=null;return}const a=Math.min(1,b.t*4,(2.6-b.t)*3);const s=1+Math.max(0,0.4-b.t)*1.5;ctx.save();ctx.globalAlpha=a;ctx.translate(VW/2,VV*0.36);ctx.scale(s,s);ctx.textAlign='center';
 ctx.font='900 14px system-ui';ctx.fillStyle='#ffd84a';ctx.fillText(b.sub,0,-30);ctx.font=`900 ${VW<500?30:42}px system-ui,sans-serif`;ctx.lineWidth=7;ctx.strokeStyle='#3a0a50';ctx.strokeText(b.txt,0,8);const gr=ctx.createLinearGradient(0,-24,0,10);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#ff8ad8');ctx.fillStyle=gr;ctx.fillText(b.txt,0,8);ctx.restore()}
/* ---------- cinematic canvas (title / intro / ending) ---------- */
const CINE={img:null,t:0,parts:[],fw:0,mode:''};
function drawCine(){const im=IMG[CINE.img];CINE.t+=1/60;if(im){const s=Math.max(W/im.width,H/im.height)*(1.06+CINE.t*0.012),w=im.width*s,h=im.height*s;const px=Math.sin(CINE.t*0.15)*W*0.02;ctx.drawImage(im,(W-w)/2+px,(H-h)/2,w,h)}
 const vg=ctx.createLinearGradient(0,0,0,H);vg.addColorStop(0,'rgba(10,0,30,0.35)');vg.addColorStop(0.5,'rgba(10,0,30,0)');vg.addColorStop(1,'rgba(10,0,30,0.65)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
 // floating candles + sparkles + fireworks
 if(Math.random()<(CINE.mode==='ending'?0.12:0.04)){const x=rnd(W*0.1,W*0.9),y=rnd(H*0.08,H*0.45),n=40,c=CONF[(Math.random()*7)|0];for(let i=0;i<n;i++){const a=i/n*TAU,v=rnd(80,200);CINE.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1.4,c,k:'f'})}if(CINE.mode==='ending')AU.fx('firework')}
 if(Math.random()<0.3)CINE.parts.push({x:rnd(0,W),y:H+10,vx:rnd(-10,10),vy:rnd(-60,-30),life:6,c:'rgba(255,220,140,0.9)',k:'m'});
 ctx.globalCompositeOperation='lighter';for(const q of CINE.parts){q.life-=1/60;q.x+=q.vx/60;q.y+=q.vy/60;if(q.k==='f'){q.vy+=60/60;q.vx*=0.99}const a=Math.min(1,q.life);ctx.globalAlpha=a;ctx.fillStyle=q.c;ctx.beginPath();ctx.arc(q.x,q.y,q.k==='f'?2.2:1.6,0,TAU);ctx.fill()}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';CINE.parts=CINE.parts.filter(q=>q.life>0)}
