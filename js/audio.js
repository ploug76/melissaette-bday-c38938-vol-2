/* Melissa Time Vol 2 - audio: original WebAudio score (all melodies written for this game) + "Happy Birthday" finale
   (Hill sisters melody, public domain in the US). Instruments: lead, pluck, pad, bass, bell, synth drums, reverb + echo. */
(()=>{'use strict';
const A={ctx:null,master:null,mus:null,sfx:null,rev:null,dly:null,muted:false,cur:null,timer:null,song:null,step:0,next:0,vol:0.5};
const N=n=>{if(typeof n==='number')return n;const m=/^([A-G])(#|b)?(-?\d)$/.exec(n);if(!m)return 0;return 12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)};
const F=m=>440*Math.pow(2,(m-69)/12);
function impulse(ctx,sec,decay){const r=ctx.sampleRate,l=r*sec,b=ctx.createBuffer(2,l,r);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<l;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/l,decay)}return b}
A.init=function(){if(this.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;const c=this.ctx=new C();
 const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.connect(c.destination);
 this.master=c.createGain();this.master.gain.value=this.muted?0:1;this.master.connect(comp);
 this.mus=c.createGain();this.mus.gain.value=this.vol;this.mus.connect(this.master);
 this.sfx=c.createGain();this.sfx.gain.value=0.8;this.sfx.connect(this.master);
 this.rev=c.createConvolver();this.rev.buffer=impulse(c,2.4,3);const rg=c.createGain();rg.gain.value=0.32;this.rev.connect(rg);rg.connect(this.master);
 this.dly=c.createDelay(1);this.dly.delayTime.value=0.3;const fb=c.createGain();fb.gain.value=0.28;const dg=c.createGain();dg.gain.value=0.22;this.dly.connect(fb);fb.connect(this.dly);this.dly.connect(dg);dg.connect(this.master);
 this.noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);const nd=this.noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
}catch(e){this.ctx=null}};
A.unlock=function(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})};
A.setMute=function(m){this.muted=m;try{localStorage.setItem('mt2_mute',m?'1':'0')}catch(e){}if(this.master)this.master.gain.setTargetAtTime(m?0:1,this.ctx.currentTime,0.02)};
try{A.muted=localStorage.getItem('mt2_mute')==='1'}catch(e){}
function env(g,t,a,d,s,r,peak,len){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(0.0001,peak*s),t+a+d);g.gain.setValueAtTime(Math.max(0.0001,peak*s),t+Math.max(a+d,len));g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(a+d,len)+r)}
function out(node,dest,send,echo){node.connect(dest);if(send){const s=A.ctx.createGain();s.gain.value=send;node.connect(s);s.connect(A.rev)}if(echo){const e=A.ctx.createGain();e.gain.value=echo;node.connect(e);e.connect(A.dly)}}
const INST={
 lead(t,m,len,v,dest){const c=A.ctx,g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(5200,t);f.Q.value=2;
  const o1=c.createOscillator(),o2=c.createOscillator();o1.type='square';o2.type='sawtooth';o1.frequency.value=F(m);o2.frequency.value=F(m);o2.detune.value=9;
  const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(F(m)*0.012,t+Math.min(len,0.35));lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
  const m1=c.createGain(),m2=c.createGain();m1.gain.value=0.55;m2.gain.value=0.35;o1.connect(m1);o2.connect(m2);m1.connect(f);m2.connect(f);f.connect(g);env(g,t,0.012,0.12,0.7,0.12,v,len);out(g,dest,0.35,0.25);
  [o1,o2,lfo].forEach(o=>{o.start(t);o.stop(t+len+0.3)})},
 flute(t,m,len,v,dest){const c=A.ctx,g=c.createGain(),o=c.createOscillator(),o2=c.createOscillator();o.type='triangle';o2.type='sine';o.frequency.value=F(m);o2.frequency.value=F(m)*2;const g2=c.createGain();g2.gain.value=0.25;
  const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5;lg.gain.value=F(m)*0.008;lfo.connect(lg);lg.connect(o.frequency);o.connect(g);o2.connect(g2);g2.connect(g);env(g,t,0.04,0.1,0.8,0.18,v*1.6,len);out(g,dest,0.45,0.2);[o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+len+0.4)})},
 pluck(t,m,len,v,dest){const c=A.ctx,g=c.createGain(),o=c.createOscillator(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=F(m);f.type='lowpass';f.frequency.setValueAtTime(3800,t);f.frequency.exponentialRampToValueAtTime(500,t+0.25);o.connect(f);f.connect(g);env(g,t,0.004,0.18,0.15,0.1,v,Math.min(len,0.2));out(g,dest,0.25,0.35);o.start(t);o.stop(t+0.6)},
 bell(t,m,len,v,dest){const c=A.ctx;[[1,1],[2.01,0.45],[3.98,0.2]].forEach(([r,a])=>{if(F(m)*r>16000)return;const g=c.createGain(),o=c.createOscillator();o.type='sine';o.frequency.value=F(m)*r;o.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v*a,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+1.2/r+0.3);out(g,dest,0.5,0.3);o.start(t);o.stop(t+1.8)})},
 pad(t,m,len,v,dest){const c=A.ctx,g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;f.Q.value=0.6;f.connect(g);
  [-11,0,10].forEach(d=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=F(m);o.detune.value=d;o.connect(f);o.start(t);o.stop(t+len+1)});env(g,t,0.35,0.3,0.8,0.7,v,len);out(g,dest,0.6,0)},
 bass(t,m,len,v,dest){const c=A.ctx,g=c.createGain(),f=c.createBiquadFilter(),o=c.createOscillator(),s=c.createOscillator();o.type='sawtooth';s.type='sine';o.frequency.value=F(m);s.frequency.value=F(m);f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(260,t+Math.max(0.1,len));f.Q.value=4;
  const sg=c.createGain();sg.gain.value=0.9;o.connect(f);s.connect(sg);sg.connect(g);f.connect(g);env(g,t,0.006,0.1,0.75,0.06,v,len*0.92);out(g,dest,0.05,0);o.start(t);s.start(t);o.stop(t+len+0.2);s.stop(t+len+0.2)},
 kick(t,v,dest){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+0.13);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.32);o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.35)},
 snare(t,v,dest){const c=A.ctx,n=c.createBufferSource();n.buffer=A.noiseBuf;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=0.7;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.2);n.connect(f);f.connect(g);out(g,dest,0.35,0);n.start(t);n.stop(t+0.22);
  const o=c.createOscillator(),og=c.createGain();o.type='triangle';o.frequency.setValueAtTime(240,t);o.frequency.exponentialRampToValueAtTime(140,t+0.08);og.gain.setValueAtTime(v*0.6,t);og.gain.exponentialRampToValueAtTime(0.0001,t+0.1);o.connect(og);og.connect(dest);o.start(t);o.stop(t+0.12)},
 hat(t,v,dest,open){const c=A.ctx,n=c.createBufferSource();n.buffer=A.noiseBuf;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=7500;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+(open?0.25:0.05));n.connect(f);f.connect(g);g.connect(dest);n.start(t,Math.random()*0.5);n.stop(t+0.3)},
 crash(t,v,dest){const c=A.ctx,n=c.createBufferSource();n.buffer=A.noiseBuf;n.loop=true;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=4000;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+1.6);n.connect(f);f.connect(g);out(g,dest,0.5,0);n.start(t);n.stop(t+1.7)},
 jingle(t,v,dest){const c=A.ctx;for(let i=0;i<3;i++){const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=5200+i*900;g.gain.setValueAtTime(v*0.25,t+i*0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.012+0.09);o.connect(g);g.connect(dest);o.start(t+i*0.012);o.stop(t+0.15)}}
};
/* ---------- song data ---------- chords: one per bar (or ':2' = half bar). melody tokens NOTE:eighths, r = rest */
const CH={C:[0,4,7],Cm:[0,3,7],Cmaj7:[0,4,7,11],D:[2,6,9],Dm:[2,5,9],Dm7:[2,5,9,0],E:[4,8,11],Em:[4,7,11],Eb:[3,7,10],F:[5,9,0],Fm:[5,8,0],Fmaj7:[5,9,0,4],G:[7,11,2],Gm:[7,10,2],G7:[7,11,2,5],Gsus:[7,0,2],A:[9,1,4],Am:[9,0,4],Am7:[9,0,4,7],Bb:[10,2,5],Bdim:[11,2,5],B:[11,3,6],Bm:[11,2,6],Ab:[8,0,3],Db:[1,5,8],Csus:[0,5,7],Esus:[4,9,11],Fsus2:[5,7,0],Bbmaj7:[10,2,5,9],Ebmaj7:[3,7,10,2],Abmaj7:[8,0,3,7]};
function parseMel(s){const o=[];let t=0;for(const tok of s.trim().split(/\s+/)){const [n,d]=tok.split(':');const len=+(d||1);if(n!=='r')o.push([t,N(n),len]);t+=len}return {notes:o,len:t}}
const DR={
 pop:  {k:'x...x...x...x...',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},
 drive:{k:'x..x..x.x..x..x.',s:'....x.......x..x',h:'xxxxxxxxxxxxxxxx'},
 shuf: {k:'x.....x.x.......',s:'....x.......x...',h:'x.xxx.xxx.xxx.xx'},
 march:{k:'x...x...x...x.x.',s:'..x...x...xx..x.',h:'x.x.x.x.x.x.x.x.'},
 soft: {k:'x.......x.......',s:'........x.......',h:'..x...x...x...x.'},
 boss: {k:'x.x.x..xx.x.x..x',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'},
 none: {k:'',s:'',h:''}};
const SONGS={
 title:{bpm:112,root:N('C3'),ch:'C G Am F C G F G',lead:'lead',drum:'pop',arp:'up',pad:1,
  mel:`G4:2 C5:2 E5:3 D5:1 C5:2 G5:4 r:2  G5:2 F5:2 E5:2 D5:2 E5:6 r:2  A4:2 C5:2 E5:3 D5:1 C5:2 A5:4 r:2  A5:2 G5:2 F5:2 A5:2 G5:6 r:2
       E5:2 G5:2 C6:3 B5:1 A5:2 G5:4 E5:2  D5:2 E5:2 F5:2 D5:2 B4:6 r:2  C5:2 E5:2 A5:3 G5:1 F5:2 E5:2 D5:2 C5:2  B4:2 C5:2 D5:2 B4:2 G4:6 r:2`},
 village:{bpm:126,root:N('F2'),ch:'F C Dm Bb F C Bb C',lead:'flute',drum:'pop',arp:'bounce',pad:1,bell:1,
  mel:`C5:1 D5:1 F5:2 F5:1 G5:1 A5:2 G5:1 F5:1 D5:2 C5:2 r:2  E5:1 F5:1 G5:2 G5:1 A5:1 G5:2 E5:4 r:4  D5:1 E5:1 F5:2 A5:2 D6:3 C6:1 A5:2 F5:4  G5:2 Bb5:2 A5:2 G5:2 F5:6 r:2
       A5:2 A5:1 G5:1 F5:2 C5:2 D5:2 F5:2 A5:4  G5:2 G5:1 F5:1 E5:2 C5:2 E5:2 G5:2 C6:4  Bb5:2 A5:2 G5:2 F5:2 D5:2 F5:2 Bb5:4  A5:2 G5:2 E5:2 G5:2 F5:6 r:2`},
 fields:{bpm:100,root:N('G2'),ch:'G Em C D G Em Am D',lead:'flute',drum:'shuf',arp:'wide',pad:1,
  mel:`D5:3 B4:1 D5:2 G5:2 F#5:3 E5:1 D5:4  E5:3 C5:1 E5:2 G5:2 A5:6 r:2  B5:3 A5:1 G5:2 D5:2 E5:3 D5:1 B4:4  C5:2 E5:2 A5:2 G5:2 F#5:6 r:2
       G5:2 B5:2 D6:4 B5:2 G5:2 E5:4  E5:2 G5:2 C6:4 B5:2 A5:2 G5:4  A5:2 F#5:2 D5:4 E5:2 F#5:2 G5:4  A5:3 B5:1 A5:2 F#5:2 D5:6 r:2`},
 river:{bpm:118,root:N('D2'),ch:'D A Bm G D A G A',lead:'lead',drum:'pop',arp:'flow',pad:1,bell:1,
  mel:`F#5:2 E5:1 D5:1 A4:2 D5:2 E5:2 F#5:2 A5:4  G5:2 F#5:1 E5:1 C#5:2 E5:2 A5:6 r:2  B5:2 A5:1 F#5:1 D5:2 F#5:2 B5:2 A5:2 F#5:4  G5:2 F#5:2 E5:2 D5:2 E5:6 r:2
       A5:2 D6:2 C#6:2 A5:2 B5:4 F#5:4  G5:2 B5:2 A5:2 E5:2 F#5:4 C#5:4  D5:2 F#5:2 B5:4 A5:2 G5:2 F#5:2 E5:2  D5:2 E5:2 F#5:2 G5:2 A5:6 r:2`},
 cave:{bpm:92,root:N('A1'),ch:'Am F C E Am F Dm E',lead:'bell',drum:'soft',arp:'mystic',pad:1,
  mel:`E5:2 A5:2 C6:2 B5:2 A5:4 E5:4  F5:2 A5:2 C6:2 A5:2 F5:8  G5:2 C6:2 E6:2 D6:2 C6:4 G5:4  G#5:2 B5:2 E6:4 D6:4 B5:4
       A5:2 C6:2 E6:2 C6:2 A5:4 r:4  F5:2 A5:2 D6:2 C6:2 A5:8  D5:2 F5:2 A5:2 G5:2 F5:4 D5:4  E5:2 G#5:2 B5:4 E6:8`},
 peaks:{bpm:132,root:N('Eb2'),ch:'Eb Bb Cm Ab Eb Bb Ab Bb',lead:'lead',drum:'drive',arp:'sparkle',pad:1,bell:1,jingle:1,
  mel:`G5:2 Bb5:2 Eb6:2 D6:1 C6:1 Bb5:4 G5:4  F5:2 Bb5:2 D6:2 C6:1 Bb5:1 F5:8  G5:2 C6:2 Eb6:2 D6:1 C6:1 G5:4 Eb5:4  Ab5:2 C6:2 Eb6:2 C6:2 Bb5:8
       Bb5:2 G5:2 Eb5:2 G5:2 Bb5:2 Eb6:2 G6:4  F6:2 D6:2 Bb5:2 D6:2 F6:8  Eb6:2 C6:2 Ab5:2 C6:2 Eb6:4 Ab5:4  D6:2 Bb5:2 F5:2 D6:2 Eb6:8`},
 castle:{bpm:108,root:N('C2'),ch:'Cm Ab Bb G Cm Fm G G',lead:'lead',drum:'march',arp:'gallop',pad:1,
  mel:`C5:2 Eb5:2 G5:3 F5:1 Eb5:2 D5:2 C5:4  Ab4:2 C5:2 Eb5:3 D5:1 C5:4 Ab4:4  Bb4:2 D5:2 F5:3 Eb5:1 D5:2 C5:2 Bb4:4  B4:2 D5:2 G5:4 F5:2 D5:2 B4:4
       C5:2 G5:2 C6:3 Bb5:1 Ab5:2 G5:2 Eb5:4  F5:2 Ab5:2 C6:3 Bb5:1 Ab5:4 F5:4  G5:2 B5:2 D6:3 C6:1 B5:2 G5:2 F5:2 D5:2  G5:4 D5:4 B4:4 G4:4`},
 boss:{bpm:150,root:N('E2'),ch:'Em C D B Em C Am B',lead:'lead',drum:'boss',arp:'drive',pad:1,
  mel:`E5:1 E5:1 G5:2 E5:1 E5:1 B5:2 A5:2 G5:2 F#5:4  E5:1 E5:1 G5:2 E5:1 E5:1 C6:2 B5:2 A5:2 G5:4  F#5:2 A5:2 D6:2 C6:2 B5:2 A5:2 F#5:4  D#5:2 F#5:2 B5:4 A5:2 F#5:2 D#5:4
       E5:2 B5:2 E6:3 D6:1 C6:2 B5:2 G5:4  C6:2 B5:2 A5:2 G5:2 E5:8  A5:2 C6:2 E6:2 D6:2 C6:2 B5:2 A5:4  B5:2 D#6:2 F#6:4 D#6:2 B5:2 F#5:4`},
 final:{bpm:144,root:N('D2'),ch:'Dm Bb C A Dm Bb Gm A',lead:'lead',drum:'boss',arp:'drive',pad:1,bell:1,
  mel:`D5:2 F5:2 A5:3 G5:1 F5:2 E5:2 D5:4  D5:2 F5:2 Bb5:3 A5:1 G5:4 F5:4  E5:2 G5:2 C6:3 Bb5:1 A5:2 G5:2 E5:4  C#5:2 E5:2 A5:4 G5:2 E5:2 C#5:4
       D6:2 A5:2 F5:2 A5:2 D6:4 F6:4  D6:2 Bb5:2 F5:2 Bb5:2 D6:8  Bb5:2 D6:2 G6:3 F6:1 E6:2 D6:2 Bb5:4  A5:2 C#6:2 E6:4 A6:8`},
 /* Happy Birthday to You (Patty & Mildred Hill melody; public domain), arranged in F, 3/4 feel written as 6 eighths per bar */
 birthday:{bpm:96,root:N('F2'),bar:6,ch:'F F C C F F Bb C F F',lead:'lead',drum:'none',arp:'waltz',pad:1,bell:1,once:1,
  mel:`r:4 C5:1 C5:1  D5:2 C5:2 F5:2  E5:4 C5:1 C5:1  D5:2 C5:2 G5:2  F5:4 C5:1 C5:1  C6:2 A5:2 F5:2  E5:2 D5:1 D5:1 Bb5:1 Bb5:1  A5:2 F5:2 G5:2  F5:6  r:6`},
 party:{bpm:128,root:N('F2'),ch:'F Dm Bb C F Dm Bb C',lead:'flute',drum:'pop',arp:'bounce',pad:1,bell:1,
  mel:`C6:2 A5:1 C6:1 F6:2 C6:2 D6:2 C6:2 A5:4  Bb5:2 G5:1 Bb5:1 D6:2 Bb5:2 C6:2 A5:2 F5:4  A5:2 F5:2 C5:2 F5:2 A5:2 C6:2 F6:4  E6:2 D6:2 C6:2 Bb5:2 A5:2 G5:2 F5:4
       F5:1 G5:1 A5:2 C6:2 A5:2 D6:2 C6:2 A5:4  Bb5:2 D6:2 F6:2 D6:2 C6:4 A5:4  Bb5:2 A5:2 G5:2 F5:2 D5:2 F5:2 Bb5:4  A5:2 G5:2 E5:2 G5:2 F5:8`}
};
function chordsOf(s){return s.trim().split(/\s+/).map(c=>CH[c]||CH.C)}
for(const k in SONGS){const s=SONGS[k];s.mel=parseMel(s.mel);s.chords=chordsOf(s.ch);s.bar=s.bar||8;s.bars=Math.max(s.chords.length,Math.ceil(s.mel.len/s.bar))}
const ARP={up:[0,1,2,1,0,1,2,3],bounce:[0,2,1,2,0,2,1,2],wide:[0,1,2,4,2,1,0,1],flow:[0,1,2,3,4,3,2,1],mystic:[0,2,4,2,1,3,5,3],sparkle:[4,2,3,1,4,2,3,1],gallop:[0,0,2,0,0,2,1,2],drive:[0,0,1,0,0,0,2,0],waltz:[0,1,2,1,2,1]};
function tick(){const c=A.ctx,s=A.song;if(!c||!s)return;const sp=60/s.bpm/2;// eighth-note step
 while(A.next<c.currentTime+0.2){const st=A.step,bar=Math.floor(st/s.bar)%s.bars,pos=st%s.bar,ch=s.chords[bar%s.chords.length],t=A.next,R=s.root;
  if(s.once&&st>=s.bars*s.bar){A.song=null;if(A.onEnd)A.onEnd();return}
  // melody
  const loopLen=s.bars*s.bar,mt=st%loopLen;for(const [nt,m,len] of s.mel.notes)if(nt===mt){(INST[s.lead]||INST.lead)(t,m,len*sp*0.95,s.lead==='bell'?0.09:s.lead==='flute'?0.07:0.06,A.mus);if(s.bell&&len>=3)INST.bell(t,m+12,1,0.025,A.mus)}
  // bass: root on 1, fifth/octave pattern
  const rootN=R+ch[0]+(ch[0]>7?-12:0);if(s.drum!=='none'||pos%3===0){if(s.drum==='boss'||s.drum==='drive'){INST.bass(t,rootN+(pos%4===3?12:0),sp*0.9,0.2,A.mus)}else if(pos%2===0)INST.bass(t,rootN+(pos===4?7:0)+(pos===6?12:0),sp*1.8,0.2,A.mus)}
  // arp
  const ap=ARP[s.arp]||ARP.up,ix=ap[pos%ap.length],oct=Math.floor(ix/ch.length);INST.pluck(t,R+24+ch[ix%ch.length]+oct*12+(ch[ix%ch.length]<ch[0]?12:0),sp,0.035,A.mus);
  // pad
  if(s.pad&&pos===0)ch.slice(0,3).forEach((n,i)=>INST.pad(t,R+24+n+(n<ch[0]?12:0),sp*s.bar*0.95,0.022,A.mus));
  // drums (16ths pattern read at 8th resolution x2)
  const d=DR[s.drum]||DR.none;for(let h=0;h<2;h++){const i=(pos*2+h)%16,tt=t+h*sp/2;if(d.k[i]==='x')INST.kick(tt,0.55,A.mus);if(d.s[i]==='x')INST.snare(tt,0.22,A.mus);if(d.h[i]==='x')INST.hat(tt,0.06,A.mus);if(s.jingle&&i%4===2)INST.jingle(tt,0.15,A.mus)}
  if(st%(s.bar*8)===0&&s.drum!=='none'&&s.drum!=='soft')INST.crash(t,0.12,A.mus);
  A.step++;A.next+=sp}}
A.play=function(key,onEnd){if(!this.ctx){this.pending=key;return}if(this.cur===key&&this.song)return;this.stop();const s=SONGS[key];if(!s)return;this.cur=key;this.song=s;this.step=0;this.onEnd=onEnd||null;this.next=this.ctx.currentTime+0.08;
 this.mus.gain.cancelScheduledValues(this.ctx.currentTime);this.mus.gain.setValueAtTime(0.0001,this.ctx.currentTime);this.mus.gain.exponentialRampToValueAtTime(this.vol,this.ctx.currentTime+0.4);
 this.timer=setInterval(tick,40);tick()};
A.stop=function(){this.cur=null;this.song=null;if(this.timer){clearInterval(this.timer);this.timer=null}};
A.duck=function(on){if(!this.ctx)return;this.mus.gain.setTargetAtTime(on?this.vol*0.35:this.vol,this.ctx.currentTime,0.08)};
/* ---------- SFX ---------- */
function tone(f,d,type,vol,slide,delay,send){const c=A.ctx,t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type||'square';f=Math.min(f,16000);o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);out(g,A.sfx,send||0,0);o.start(t);o.stop(t+d+0.05)}
function noise(d,vol,hp,delay,lp){const c=A.ctx,t=c.currentTime+(delay||0),s=c.createBufferSource();s.buffer=A.noiseBuf;const f=c.createBiquadFilter();f.type=lp?'lowpass':'highpass';f.frequency.value=hp||800;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(f);f.connect(g);g.connect(A.sfx);s.start(t);s.stop(t+d+0.05)}
let candleN=0;
A.fx=function(n,arg){if(!this.ctx||this.muted)return;try{switch(n){
 case'jump':tone(380,0.14,'square',0.07,420);tone(760,0.1,'sine',0.05,500);break;
 case'jump2':tone(560,0.16,'triangle',0.1,700);[1200,1600].forEach((f,i)=>tone(f,0.08,'sine',0.05,0,0.03*i,0.3));break;
 case'land':noise(0.06,0.06,400,0,1);break;
 case'spark':tone(1400,0.12,'triangle',0.07,-700,0,0.3);tone(2100,0.08,'sine',0.05,600,0.02,0.4);break;
 case'stomp':tone(220,0.12,'square',0.14,-140);noise(0.08,0.1,900);tone(880,0.1,'sine',0.06,400,0.05,0.3);break;
 case'pop':[660,880,1320].forEach((f,i)=>tone(f,0.09,'triangle',0.08,0,i*0.035,0.3));noise(0.05,0.05,3000);break;
 case'candle':{const k=(arg|0)%12,sc=[0,2,4,7,9,12,14,16,19,21,24,26][k];INST.bell(A.ctx.currentTime,N('C6')+sc,1,0.12,A.sfx);INST.bell(A.ctx.currentTime+0.07,N('C6')+sc+7,1,0.07,A.sfx);break}
 case'item':[523,659,784,1047].forEach((f,i)=>tone(f,0.12,'triangle',0.1,0,i*0.05,0.3));break;
 case'heal':[392,523,659,784,1047].forEach((f,i)=>tone(f,0.14,'sine',0.11,0,i*0.06,0.4));break;
 case'star':[784,988,1175,1568,1976].forEach((f,i)=>tone(f,0.1,'square',0.05,0,i*0.04,0.3));break;
 case'hurt':tone(420,0.28,'sawtooth',0.12,-300);noise(0.12,0.08,600);break;
 case'fall':tone(600,0.6,'triangle',0.12,-480);break;
 case'spring':tone(180,0.32,'sine',0.22,900);tone(360,0.25,'triangle',0.06,1200,0.02);break;
 case'check':[659,784,988,1319].forEach((f,i)=>tone(f,0.16,'triangle',0.1,0,i*0.07,0.4));break;
 case'bosshit':tone(160,0.12,'square',0.16,-60);noise(0.1,0.14,1200);break;
 case'bossdie':noise(1.4,0.22,120,0,1);tone(110,1.2,'sawtooth',0.16,-70);[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,0.2,'triangle',0.08,0,0.5+i*0.09,0.5));break;
 case'shoot':tone(300,0.18,'sawtooth',0.06,-160);break;
 case'thud':tone(70,0.35,'sine',0.3,-30);noise(0.2,0.12,200,0,1);break;
 case'thunder':noise(1.8,0.25,300,0,1);tone(48,1.4,'sine',0.2,-10);break;
 case'clear':[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>tone(f,0.18,'square',0.06,0,i*0.1,0.4));break;
 case'cage':[392,494,587,784,988].forEach((f,i)=>tone(f,0.2,'triangle',0.1,0,i*0.08,0.5));break;
 case'pound':tone(140,0.2,'square',0.16,-80);noise(0.18,0.16,300,0,1);break;
 case'gift':noise(0.12,0.08,2500);[880,1109,1319].forEach((f,i)=>tone(f,0.12,'square',0.05,0,i*0.05,0.3));break;
 case'click':tone(900,0.05,'square',0.05);break;
 case'whoosh':noise(0.35,0.08,1200);break;
 case'firework':noise(0.5,0.1,2500);tone(200+Math.random()*400,0.3,'sine',0.04,-100);break;
 case'balloon':tone(500,0.2,'sine',0.1,300);break;
 }}catch(e){}};
window.MTAudio=A;window.MTSongs=SONGS;
})();
