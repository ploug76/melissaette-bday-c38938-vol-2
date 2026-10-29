/* Melissa Time Vol 2 - bosses: each has phases and readable tells. Hit with SPARKLE (1) or a stomp (2). */
'use strict';
function startBoss(g){const B=g.L.boss,d=BOSS[B.k];const a=g.arena;const b={k:B.k,name:B.name,x:a.x1-180,y:d.fly?220:GY,w:d.w,h:d.h,hp:d.hp,max:d.hp,face:-1,st:'intro',t:0,inv:0,phase:1,vx:0,vy:0,hitT:0,n:0,fly:!!d.fly,intro:2.2};
 g.boss=b;g.bossOn=true;AU.play(B.final?'final':'boss');g.banner={txt:B.name,sub:B.final?'FINAL BOSS':'BOSS',t:0};AU.fx('thunder');shake(g,6);return b}
function bossBox(b){return{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h}}
function bossHit(g,dmg){const b=g.boss;if(!b||b.inv>0||b.hp<=0||b.st==='intro')return;b.hp-=dmg;b.inv=0.45;b.hitT=0.2;g.hitstop=0.06;AU.fx('bosshit');shake(g,6);g.score+=250*dmg;
 if(b.hp<=0){b.hp=0;b.st='die';b.t=0;AU.stop();AU.fx('bossdie');g.score+=10000;pop(g,b.x,b.y-b.h-30,'+10000','#ffd84a',1);g.es=[];for(const e of g.en)if(!e.dead)killEnemy(g,e)}
 else{const ph=b.hp<=b.max*(b.k==='humbug'?0.34:0.5)?(b.k==='humbug'?3:2):(b.k==='humbug'&&b.hp<=b.max*0.67?2:1);if(ph!==b.phase){b.phase=ph;g.banner={txt:b.k==='humbug'&&ph===3?'HE\u2019S FURIOUS!':'PHASE '+ph,sub:b.name,t:0};confetti(g,b.x,b.y-b.h/2,30);AU.fx('thunder')}}}
const aim=(b,p,sp)=>{const dx=p.x-b.x,dy=(p.y-50)-(b.y-b.h*0.6),d=Math.hypot(dx,dy)||1;return[dx/d*sp,dy/d*sp]};
function lob(g,x,y,tx,k,extra){const t=0.9+Math.random()*0.3,vx=(tx-x)/t,vy=-(GRAV*0.6*t)/2;g.es.push(Object.assign({k,x,y,vx,vy,r:16,life:5,grav:GRAV*0.6},extra||{}))}
function updBoss(g,dt){const b=g.boss;if(!b)return;const p=g.p,a=g.arena;b.t+=dt;b.inv=Math.max(0,b.inv-dt);b.hitT=Math.max(0,b.hitT-dt);const P2=b.phase>=2,P3=b.phase>=3;
 if(b.st==='intro'){b.intro-=dt;if(b.intro<=0){b.st='idle';b.t=0}if(b.fly)b.y=lerp(b.y,200,dt*2);return}
 if(b.st==='die'){b.y+=b.fly?dt*120:0;if(Math.random()<0.5)confetti(g,b.x+rnd(-80,80),b.y-rnd(0,b.h),6);if(Math.random()<0.15){AU.fx('firework');burst(g,b.x+rnd(-90,90),b.y-rnd(20,b.h),20,CONF,380,'star',8)}
  if(b.t>2.4){b.st='gone';bossDefeated(g)}return}
 if(b.st==='gone')return;
 const spd=P3?1.5:P2?1.25:1;const dx=p.x-b.x;
 switch(b.k){
 case'smudge':{// run -> lob candles/acorns -> big hop
  if(b.st==='idle'){if(b.t>0.6/spd){b.st=['run','throw','hop'][b.n++%3];b.t=0;b.tx=dx>0?a.x1-120:a.x0+120}}
  else if(b.st==='run'){b.face=Math.sign(b.tx-b.x)||-1;b.x+=b.face*290*spd*dt;if(Math.abs(b.tx-b.x)<12||b.t>2.5){b.st='idle';b.t=0}if(Math.random()<0.4)part(g,{x:b.x,y:b.y,vx:rnd(-60,60),vy:-40,life:0.4,size:8,col:'rgba(230,210,180,0.7)',k:'smoke'})}
  else if(b.st==='throw'){b.face=Math.sign(dx)||-1;const n=P2?5:3;if(b.t>0.35&&b.c===undefined)b.c=0;if(b.c!==undefined&&b.t>0.35+b.c*0.28&&b.c<n){lob(g,b.x+b.face*40,b.y-120,p.x+rnd(-140,140),'acorn');b.c++;AU.fx('shoot')}if(b.t>0.4+n*0.28+0.4){b.st='idle';b.t=0;b.c=undefined}}
  else if(b.st==='hop'){if(!b.air){b.air=1;b.vy=-950;b.vx=clamp(dx*1.2,-420,420);AU.fx('jump')}b.vy+=GRAV*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.face=Math.sign(b.vx)||b.face;if(b.y>=GY&&b.vy>0){b.y=GY;b.air=0;b.st='idle';b.t=-0.2;AU.fx('thud');shake(g,8);g.es.push({k:'wave',x:b.x-50,y:GY,vx:-360,vy:0,r:16,life:1.6},{k:'wave',x:b.x+50,y:GY,vx:360,vy:0,r:16,life:1.6})}}
  break}
 case'buzzbelle':{// hover + volley of stingers + dive (stompable at the bottom)
  if(b.st==='idle'||b.st==='hover'){b.st='hover';b.x=lerp(b.x,clamp(p.x+Math.sin(b.t*0.9)*260,a.x0+120,a.x1-120),dt*1.2);b.y=lerp(b.y,170+Math.sin(b.t*2.2)*40,dt*3);b.face=Math.sign(dx)||-1;
   if(b.t>2.2/spd){b.st=b.n++%2?'dive':'volley';b.t=0;b.c=0}}
  else if(b.st==='volley'){b.y=lerp(b.y,170,dt*3);const n=P2?5:3;if(b.t>0.4+b.c*0.22&&b.c<n){const [vx,vy]=aim(b,p,420);g.es.push({k:'stinger',x:b.x,y:b.y-60,vx:vx+rnd(-40,40),vy,r:10,life:4});b.c++;AU.fx('shoot')}if(b.t>0.4+n*0.22+0.5){b.st='hover';b.t=0;if(P2&&g.en.filter(e=>!e.dead).length<2){spawnEnemy(g,'buzzgrump',b.x,200).awake=1}}}
  else if(b.st==='dive'){if(b.t<0.6){b.y=lerp(b.y,120,dt*4);b.tx=p.x}else if(b.t<1.4){b.x=lerp(b.x,b.tx,dt*3);b.y=lerp(b.y,GY-10,dt*4.5)}else if(b.t<2.2){b.dizzy=1}else{b.dizzy=0;b.y=lerp(b.y,170,dt*3);if(b.t>2.8){b.st='hover';b.t=0}}}
  break}
 case'snapjaw':{// charge on raft, bouncing coconut cannonballs, chomp
  if(b.st==='idle'){b.face=Math.sign(dx)||-1;if(b.t>0.8/spd){b.st=['charge','cannon','charge','cannon','chomp'][b.n++%5];b.t=0;b.c=0}}
  else if(b.st==='charge'){if(b.t<0.6){b.x+=Math.sin(b.t*60)*1.5}else{b.x+=b.face*560*spd*dt;if(b.x<a.x0+120||b.x>a.x1-120){b.x=clamp(b.x,a.x0+120,a.x1-120);b.st='idle';b.t=0;shake(g,7);AU.fx('thud')}}if(b.t>0.6&&Math.random()<0.6)part(g,{x:b.x,y:GY,vx:-b.face*rnd(60,200),vy:rnd(-300,-100),life:0.6,size:6,col:'rgba(180,230,255,0.8)',k:'dot',grav:900})}
  else if(b.st==='cannon'){const n=P2?3:2;if(b.t>0.5+b.c*0.5&&b.c<n){g.es.push({k:'coconut',x:b.x+b.face*80,y:b.y-110,vx:b.face*rnd(220,340),vy:-600,r:18,life:5,grav:1500,bounce:3,bn:0});b.c++;AU.fx('shoot');shake(g,3)}if(b.t>0.5+n*0.5+0.4){b.st='idle';b.t=0}}
  else if(b.st==='chomp'){b.face=Math.sign(dx)||-1;if(b.t<0.5){}else if(b.t<0.9){b.x+=b.face*700*dt;b.chomp=1}else{b.chomp=0;b.st='idle';b.t=0;b.x=clamp(b.x,a.x0+120,a.x1-120)}}
  break}
 case'glimmerfang':{// ceiling crawl dropping crystal shards (with warning), then descend + skitter
  if(b.st==='idle'){b.st='ceil';b.t=0;b.c=0}
  if(b.st==='ceil'){b.y=lerp(b.y,150,dt*3);b.x=lerp(b.x,clamp(p.x,a.x0+140,a.x1-140),dt*1.1);b.face=Math.sign(dx)||-1;const n=P2?6:4;if(b.t>0.6+b.c*0.45&&b.c<n){g.es.push({k:'shard',x:clamp(p.x+rnd(-120,120),a.x0+30,a.x1-30),y:g.camTop+10,vx:0,vy:0,r:14,life:6,grav:1500,warn:0.7});b.c++;AU.fx('click')}
   if(b.t>0.6+n*0.45+0.6){b.st='drop';b.t=0}}
  else if(b.st==='drop'){b.y=lerp(b.y,GY,dt*5);if(b.t>0.6){b.st='skitter';b.t=0;b.c=0;shake(g,6);AU.fx('thud')}}
  else if(b.st==='skitter'){b.face=Math.sign(dx)||-1;b.x+=b.face*(P2?330:260)*dt;b.x=clamp(b.x,a.x0+110,a.x1-110);if(b.t>(P2?3:2.4)){b.st='rise';b.t=0}}
  else if(b.st==='rise'){b.y=lerp(b.y,150,dt*3);if(b.t>1){b.st='ceil';b.t=0;b.c=0}}
  break}
 case'frostbeard':{// stomp shockwaves, giant rolling snowballs, icicles in phase 2
  if(b.st==='idle'){b.face=Math.sign(dx)||-1;b.x+=b.face*90*dt;if(b.t>1/spd){b.st=['stomp','ball','stomp','ball'][b.n++%4];b.t=0;b.c=0}}
  else if(b.st==='stomp'){if(!b.air&&b.t<0.4){}else if(!b.air&&!b.done){b.air=1;b.vy=-900;b.done=1;AU.fx('jump')}if(b.air){b.vy+=GRAV*dt;b.y+=b.vy*dt;if(b.y>=GY&&b.vy>0){b.y=GY;b.air=0;shake(g,12);AU.fx('thud');g.es.push({k:'wave',x:b.x-60,y:GY,vx:-380,vy:0,r:18,life:1.8},{k:'wave',x:b.x+60,y:GY,vx:380,vy:0,r:18,life:1.8});
     if(P2)for(let i=0;i<3;i++)g.es.push({k:'icicle',x:clamp(p.x+rnd(-260,260),a.x0+30,a.x1-30),y:g.camTop+10,vx:0,vy:0,r:12,life:5,grav:1400,warn:0.6})}}
   if(b.done&&!b.air&&b.t>1.2){b.done=0;b.st='idle';b.t=0}}
  else if(b.st==='ball'){if(b.t>0.6&&b.c<(P2?2:1)){g.es.push({k:'roll',x:b.x+b.face*90,y:GY,vx:b.face*300,vy:0,r:30,life:4.5});b.c++;AU.fx('shoot')}if(b.t>1.6){b.st='idle';b.t=0}}
  break}
 case'humbug':{// P1 bombs while sweeping, P2 homing rockets + grumblins, P3 vacuum pull + spread + dizzy dip
  if(b.st==='idle'||b.st==='sweep'){b.st='sweep';b.tx=b.tx||a.x0+150;b.x=lerp(b.x,b.tx,dt*0.9);if(Math.abs(b.x-b.tx)<30)b.tx=b.tx<(a.x0+a.x1)/2?a.x1-150:a.x0+150;b.y=lerp(b.y,150+Math.sin(b.t*2)*24,dt*2);b.face=Math.sign(dx)||-1;
   b.bt=(b.bt||0)+dt;if(b.bt>(P2?1.6:1.1)){b.bt=0;g.es.push({k:'bomb',x:b.x,y:b.y-30,vx:rnd(-60,60),vy:0,r:16,life:5,grav:900});AU.fx('shoot')}
   if(b.t>(P3?3.5:5)){b.t=0;b.st=P3?(b.n++%2?'vacuum':'dip'):P2?(b.n++%2?'rockets':'dip'):'dip'}}
  else if(b.st==='rockets'){b.y=lerp(b.y,140,dt*2);if(b.t>0.5+(b.c||0)*0.5&&(b.c||0)<3){const [vx,vy]=aim(b,p,160);g.es.push({k:'rocket',x:b.x,y:b.y-40,vx,vy,r:16,life:6});b.c=(b.c||0)+1;AU.fx('shoot')}
   if(b.t>2.4){b.c=0;b.st='sweep';b.t=0;if(g.en.filter(e=>!e.dead).length<3){const e=spawnEnemy(g,'grumblin',clamp(b.x,a.x0+60,a.x1-60),GY);e.awake=1}}}
  else if(b.st==='vacuum'){b.y=lerp(b.y,200,dt*2);b.vac=b.t>0.5&&b.t<3.2;if(b.vac){const pull=Math.sign(b.x-p.x)*240;p.x+=pull*dt;if(Math.random()<0.8){const sx=b.x+rnd(-300,300);part(g,{x:sx,y:rnd(GY-200,GY),vx:(b.x-sx)*1.5,vy:(b.y-120-GY)*0.6,life:0.6,size:5,col:'rgba(220,200,255,0.7)',k:'smoke'})}
    if(((b.t*10)|0)%9===0&&!b.sf){b.sf=1;for(let i=-2;i<=2;i++){const [vx,vy]=aim(b,p,300);const ang=Math.atan2(vy,vx)+i*0.22;g.es.push({k:'gloom',x:b.x,y:b.y-50,vx:Math.cos(ang)*300,vy:Math.sin(ang)*300,r:11,life:4})}AU.fx('shoot')}else if(((b.t*10)|0)%9!==0)b.sf=0}
   if(b.t>3.4){b.vac=0;b.st='dip';b.t=0}}
  else if(b.st==='dip'){// sputters low: stompable!
   if(b.t<0.5)b.tx=p.x;b.x=lerp(b.x,clamp(b.tx,a.x0+140,a.x1-140),dt*2);b.y=lerp(b.y,GY-30,dt*(b.t<2.4?3:0));b.dizzy=b.t>0.8&&b.t<2.6;if(b.dizzy&&Math.random()<0.3)part(g,{x:b.x+rnd(-40,40),y:b.y-b.h,vx:0,vy:-60,life:0.8,size:9,col:'rgba(120,110,130,0.6)',k:'smoke'});
   if(b.t>2.6){b.dizzy=0;b.y=lerp(b.y,150,dt*3);if(b.t>3.4){b.st='sweep';b.t=0}}}
  break}}
 b.x=clamp(b.x,a.x0+60,a.x1-60);
 // contact
 if(p.dead<=0){const bb=bossBox(b),pb=pbox(p);if(ov(pb,bb)){const fromTop=(p.vy>50||p.pound)&&p.y-bb.y<b.h*0.45+20;
  if(fromTop){bossHit(g,2);p.vy=-PH.jump*0.9;p.jumps=1;p.pound=0;confetti(g,p.x,p.y,14)}else if(b.st!=='die'&&b.st!=='gone'){if(p.star>0)bossHit(g,1);hurt(g,p,b)}}}}
function bossDefeated(g){const b=g.boss;g.cage.drop=1;AU.fx('cage');g.banner={txt:'BOSS DEFEATED!',sub:'Free your Party Pal!',t:0};
 // spill the candles
 for(let i=0;i<40;i++)part(g,{x:b.x,y:b.y-b.h/2,vx:rnd(-400,400),vy:rnd(-700,-200),life:2,size:10,col:CONF[i%7],k:'confetti',grav:700,rot:rnd(0,6),vr:rnd(-8,8)})}
function updCage(g,dt){const c=g.cage,p=g.p;if(!c)return;if(c.drop===1){c.vy+=GRAV*dt;c.y+=c.vy*dt;if(c.y>=GY){c.y=GY;c.drop=2;c.vy=0;shake(g,6);AU.fx('thud');burst(g,c.x,GY,16,['#ffd84a','#fff'],260,'spark',7)}}
 if(c.drop===2&&!c.open&&Math.abs(p.x-c.x)<70){c.open=1;g.clearT=0.001;AU.fx('cage');confetti(g,c.x,c.y-60,60);const L=g.L;g.pals.push(newPal(L.pal,c.x));if(L.pal2)g.pals.push(newPal(L.pal2,c.x+30));
  pop(g,c.x,c.y-150,(L.pal2?'Rescued ':'Rescued ')+L.palName+'!','#ffe27a',1);AU.play('party')}}
