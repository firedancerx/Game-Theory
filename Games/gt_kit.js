/* Flameater's Game Theory School - player identity + victory certificate. Standalone, no dependencies.
   API: GTCert.name(), GTCert.gate(), GTCert.stars(score,kind,max), GTCert.show({lesson,n,title,kind,score,max,stars}) */
(function(){
const KEY='gt_player_name';
const SITE='https://firedancerx.github.io/Game-Theory/';
const REPO='https://github.com/firedancerx/Game-Theory';
const C={};
C.name=function(){try{return (localStorage.getItem(KEY)||'').trim();}catch(e){return '';}};
C.setName=function(v){v=String(v||'').replace(/\s+/g,' ').trim().slice(0,28);try{localStorage.setItem(KEY,v);}catch(e){}
  try{if(typeof GTStorage!=='undefined'&&v)GTStorage.setActiveUser(v);}catch(e){}return v;};
C.forget=function(){try{localStorage.removeItem(KEY);}catch(e){}};
/* Name gate: if no name is stored, show a full-page form and ABORT the calling game script (throw) so the game
   (and its clock) only starts after a name is entered. Submitting reloads the page. */
C.gate=function(){
  if(C.name())return;
  const st=document.createElement('style');
  st.textContent='.gtn{position:fixed;inset:0;background:radial-gradient(circle at 50% 30%,#14213d,#070c1a);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999;font-family:Georgia,serif}'+
  '.gtn div{max-width:480px;width:100%;background:#fbf3dc;color:#3b2a0a;border:6px double #b8860b;border-radius:10px;padding:26px;text-align:center;box-shadow:0 20px 60px #000}'+
  '.gtn h2{font-size:1.5rem;margin-bottom:6px;color:#7a1f1f}.gtn p{margin:8px 0 14px;line-height:1.5}'+
  '.gtn input{width:100%;font-size:1.2rem;padding:10px;border:2px solid #b8860b;border-radius:6px;text-align:center;background:#fff;color:#222}'+
  '.gtn button{margin-top:14px;font-size:1.05rem;font-weight:700;padding:11px 26px;border:0;border-radius:8px;background:linear-gradient(135deg,#b8860b,#8a6508);color:#fff;cursor:pointer}';
  document.head.appendChild(st);
  const o=document.createElement('div');o.className='gtn';
  o.innerHTML='<div><h2>Flameater\'s Game Theory School</h2><p>Enter your name or nickname. It will be printed on your <b>victory certificate</b> at the end of the game.</p>'+
   '<form id="gtnf"><input id="gtni" maxlength="28" placeholder="Your name or nickname" autocomplete="nickname" autofocus><br><button type="submit">Start the game</button></form></div>';
  document.body.appendChild(o);
  document.getElementById('gtnf').addEventListener('submit',function(e){e.preventDefault();
    const v=C.setName(document.getElementById('gtni').value);if(!v){document.getElementById('gtni').focus();return;}location.reload();});
  setTimeout(function(){const i=document.getElementById('gtni');if(i)i.focus();},50);
  throw new Error('GT_NAME_REQUIRED (waiting for player name)');
};
C.stars=function(score,kind,max){max=max||(kind==='sim'?600:1000);return Math.max(1,Math.min(5,Math.ceil(5*score/max)));};
const RANK=['','Apprentice Tactician','Tactician','Strategist','Grand Strategist','Nash Laureate'];
function star(g,x,y,r,fill){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.42:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();
  if(fill){const gr=g.createLinearGradient(x-r,y-r,x+r,y+r);gr.addColorStop(0,'#fff3a0');gr.addColorStop(.5,'#f5b800');gr.addColorStop(1,'#a36b00');g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle='#7a4f00';g.stroke();}
  else{g.fillStyle='#e6dcc0';g.fill();g.lineWidth=2;g.strokeStyle='#bfae80';g.stroke();}}
function ctext(g,t,x,y,font,color,maxw){g.font=font;g.fillStyle=color;g.textAlign='center';g.textBaseline='alphabetic';if(maxw)g.fillText(t,x,y,maxw);else g.fillText(t,x,y);}
function scallop(g,x,y,r,n,c1,c2){g.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n,rr=i%2?r*0.9:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();
  const gr=g.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fill();}
function ringText(g,t,x,y,r,start,span,font,color){g.save();g.translate(x,y);g.font=font;g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';
  const n=t.length;for(let i=0;i<n;i++){const a=start+span*(i/(n-1||1));g.save();g.rotate(a);g.translate(0,-r);g.rotate(Math.PI/2*0);g.fillText(t[i],0,0);g.restore();}g.restore();}
function draw(o){
  const W=1400,H=990,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  const stars=o.stars,name=o.name,rank=RANK[stars];
  // parchment
  let gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#fff8e1');gr.addColorStop(.5,'#fdf0c8');gr.addColorStop(1,'#f3dfa5');g.fillStyle=gr;g.fillRect(0,0,W,H);
  // guilloche-style rosette background
  g.save();g.globalAlpha=.07;g.strokeStyle='#8a6508';g.lineWidth=1.2;
  for(let k=0;k<46;k++){g.beginPath();for(let t=0;t<=Math.PI*2+.05;t+=.03){const rr=330+60*Math.sin(t*(k%7+5)+k);g.lineTo(W/2+Math.cos(t)*rr*1.5,H/2+Math.sin(t)*rr*.95);}g.stroke();}g.restore();
  // borders
  g.lineWidth=14;g.strokeStyle='#7a1f1f';g.strokeRect(24,24,W-48,H-48);
  g.lineWidth=5;g.strokeStyle='#d4a017';g.strokeRect(46,46,W-92,H-92);
  g.lineWidth=2;g.strokeStyle='#7a1f1f';g.strokeRect(58,58,W-116,H-116);
  g.save();g.globalAlpha=.55;g.strokeStyle='#b8860b';g.lineWidth=1.5;for(let x=70;x<W-70;x+=14){g.beginPath();g.arc(x,70,6,0,Math.PI);g.stroke();g.beginPath();g.arc(x,H-70,6,Math.PI,0);g.stroke();}
  for(let y=70;y<H-70;y+=14){g.beginPath();g.arc(70,y,6,-Math.PI/2,Math.PI/2);g.stroke();g.beginPath();g.arc(W-70,y,6,Math.PI/2,Math.PI*1.5);g.stroke();}g.restore();
  // corner ornaments
  [[70,70],[W-70,70],[70,H-70],[W-70,H-70]].forEach(function(p){scallop(g,p[0],p[1],34,12,'#ffe27a','#a36b00');g.beginPath();g.arc(p[0],p[1],14,0,7);g.fillStyle='#7a1f1f';g.fill();});
  // top ribbon banner
  const rx=W/2,ry=150;g.save();
  g.fillStyle='#5e1414';g.beginPath();g.moveTo(rx-470,ry-10);g.lineTo(rx-540,ry+22);g.lineTo(rx-500,ry+52);g.lineTo(rx-540,ry+84);g.lineTo(rx-440,ry+84);g.closePath();g.fill();
  g.beginPath();g.moveTo(rx+470,ry-10);g.lineTo(rx+540,ry+22);g.lineTo(rx+500,ry+52);g.lineTo(rx+540,ry+84);g.lineTo(rx+440,ry+84);g.closePath();g.fill();
  gr=g.createLinearGradient(0,ry-30,0,ry+90);gr.addColorStop(0,'#b3262c');gr.addColorStop(1,'#7a1217');g.fillStyle=gr;g.fillRect(rx-480,ry-30,960,112);
  g.strokeStyle='#ffd966';g.lineWidth=3;g.strokeRect(rx-470,ry-20,940,92);
  ctext(g,"FLAMEATER'S GAME THEORY SCHOOL",rx,ry+22,'bold 44px Georgia, "Times New Roman", serif','#ffe9a8',900);
  ctext(g,'EXECUTIVE GAME THEORY PROGRAMME  •  30-MODULE CURRICULUM',rx,ry+56,'600 19px Georgia, serif','#ffd966',900);
  g.restore();
  // title
  ctext(g,'CERTIFICATE OF STRATEGIC VICTORY',W/2,306,'bold 64px Georgia, "Times New Roman", serif','#5e1414',1100);
  ctext(g,'✦  ✦  ✦',W/2,340,'26px Georgia, serif','#b8860b');
  ctext(g,'This is to proudly certify that',W/2,392,'italic 28px Georgia, serif','#3b2a0a');
  // name
  let fs=84;g.font='italic bold '+fs+'px "Brush Script MT","Segoe Script","Lucida Handwriting",cursive';while(g.measureText(name).width>760&&fs>34){fs-=4;g.font='italic bold '+fs+'px "Brush Script MT","Segoe Script","Lucida Handwriting",cursive';}
  ctext(g,name,W/2,485,g.font,'#14213d',780);
  g.strokeStyle='#b8860b';g.lineWidth=3;g.beginPath();g.moveTo(W/2-400,503);g.lineTo(W/2+400,503);g.stroke();
  ctext(g,'has triumphed in',W/2,546,'italic 26px Georgia, serif','#3b2a0a');
  ctext(g,'Lesson '+o.lesson+' • Game '+o.n+': '+o.title,W/2,594,'bold 38px Georgia, serif','#7a1f1f',1000);
  ctext(g,'scoring '+Math.round(o.score)+' points and earning the rank of',W/2,638,'italic 26px Georgia, serif','#3b2a0a',1000);
  ctext(g,rank.toUpperCase(),W/2,688,'bold 44px Georgia, serif','#14213d',1000);
  // stars
  for(let i=0;i<5;i++)star(g,W/2-200+i*100,752,40,i<stars);
  ctext(g,stars+' / 5 GOLDEN STARS',W/2,815,'bold 22px Georgia, serif','#7a1f1f');
  // seal (left): gold scalloped rosette with ribbons
  (function(){const x=205,y=745;g.save();
    g.fillStyle='#b3262c';g.beginPath();g.moveTo(x-50,y+40);g.lineTo(x-85,y+112);g.lineTo(x-55,y+100);g.lineTo(x-30,y+122);g.lineTo(x+5,y+60);g.closePath();g.fill();
    g.fillStyle='#8c1a20';g.beginPath();g.moveTo(x+50,y+40);g.lineTo(x+85,y+112);g.lineTo(x+55,y+100);g.lineTo(x+30,y+122);g.lineTo(x-5,y+60);g.closePath();g.fill();
    g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=14;g.shadowOffsetY=6;scallop(g,x,y,92,28,'#fff0a0','#a36b00');g.shadowColor='transparent';
    g.beginPath();g.arc(x,y,70,0,7);g.strokeStyle='#7a4f00';g.lineWidth=3;g.stroke();g.beginPath();g.arc(x,y,60,0,7);g.strokeStyle='#fff3b0';g.lineWidth=2;g.stroke();
    ctext(g,'OFFICIAL',x,y-14,'bold 20px Georgia, serif','#5a3a00');ctext(g,'SEAL',x,y+12,'bold 26px Georgia, serif','#5a3a00');ctext(g,'EST. 2026',x,y+36,'bold 15px Georgia, serif','#5a3a00');
    g.restore();})();
  // circular embossed stamp (right)
  (function(){const x=W-205,y=760;g.save();g.globalAlpha=.9;g.strokeStyle='#1c4e9b';g.lineWidth=6;g.beginPath();g.arc(x,y,98,0,7);g.stroke();g.lineWidth=2;g.beginPath();g.arc(x,y,86,0,7);g.stroke();g.beginPath();g.arc(x,y,52,0,7);g.stroke();
    ringText(g,"* FLAMEATER'S GAME THEORY SCHOOL *",x,y,70,-Math.PI*0.88,Math.PI*1.76,'bold 13px Georgia, serif','#1c4e9b');
    ctext(g,'VERIFIED',x,y-2,'bold 20px Georgia, serif','#1c4e9b');ctext(g,'AUTHENTIC',x,y+20,'bold 13px Georgia, serif','#1c4e9b');g.restore();})();
  // rubber stamp "PASSED WITH DISTINCTION"
  g.save();g.translate(W-205,405);g.rotate(-0.22);g.globalAlpha=.82;g.strokeStyle='#c1121f';g.lineWidth=6;g.strokeRect(-150,-38,300,76);g.lineWidth=2;g.strokeRect(-142,-30,284,60);
  ctext(g,stars>=4?'DISTINCTION':'APPROVED',0,6,'bold 36px "Arial Black", Impact, sans-serif','#c1121f',270);ctext(g,'GAME THEORY DEPT.',0,26,'bold 13px Arial, sans-serif','#c1121f');g.restore();
  // second stamp left
  g.save();g.translate(205,405);g.rotate(0.16);g.globalAlpha=.7;g.strokeStyle='#1c4e9b';g.lineWidth=5;g.beginPath();g.ellipse(0,0,120,44,0,0,7);g.stroke();
  ctext(g,'CERTIFIED',0,6,'bold 30px "Arial Black", Impact, sans-serif','#1c4e9b',210);ctext(g,'NASH APPROVED',0,28,'bold 12px Arial, sans-serif','#1c4e9b');g.restore();
  // signatures
  ctext(g,'Flameater',W/2-240,846,'italic 40px "Brush Script MT","Segoe Script",cursive','#14213d');
  g.strokeStyle='#3b2a0a';g.lineWidth=1.5;g.beginPath();g.moveTo(W/2-390,858);g.lineTo(W/2-90,858);g.moveTo(W/2+90,858);g.lineTo(W/2+390,858);g.stroke();
  ctext(g,'Dean of Strategy',W/2-240,880,'600 16px Georgia, serif','#3b2a0a');
  const d=new Date(),ds=d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  ctext(g,ds,W/2+240,846,'italic 30px Georgia, serif','#14213d');ctext(g,'Date of Award',W/2+240,880,'600 16px Georgia, serif','#3b2a0a');
  // serial
  const serial='FGTS-'+o.lesson+o.n+'-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
  ctext(g,'Certificate No. '+serial,W/2,904,'12px "Courier New", monospace','#6b5a2e');
  // legible link band
  g.fillStyle='#14213d';g.fillRect(58,918,W-116,56);g.fillStyle='#d4a017';g.fillRect(58,918,W-116,3);
  ctext(g,'Play more games & earn more stars:  '+SITE,W/2,944,'bold 24px Arial, Helvetica, sans-serif','#ffffff',W-160);
  ctext(g,'Source: '+REPO.replace('https://',''),W/2,966,'600 16px Arial, Helvetica, sans-serif','#ffe9a8',W-160);
  return cv;}
C.show=function(o){
  const name=C.name()||'Executive Learner';
  o=Object.assign({lesson:'00',n:1,title:'Game',kind:'video',score:0},o);
  o.name=name;o.stars=o.stars||C.stars(o.score,o.kind,o.max);
  if(!document.getElementById('gtcst')){const st=document.createElement('style');st.id='gtcst';st.textContent=
   '.gtcv{position:fixed;inset:0;background:rgba(3,6,15,.94);z-index:9998;overflow:auto;padding:14px;display:flex;flex-direction:column;align-items:center;gap:12px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}'+
   '.gtcv canvas{width:min(1100px,100%);height:auto;border-radius:6px;box-shadow:0 18px 50px #000}'+
   '.gtcv .r{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}.gtcv button,.gtcv a.b{background:linear-gradient(135deg,#b8860b,#8a6508);color:#fff;border:0;border-radius:8px;padding:11px 20px;font-weight:700;font-size:1rem;cursor:pointer;text-decoration:none}'+
   '.gtcv button.g{background:#27354f}.gtcv .l{color:#f8fafc;font-size:1.05rem;text-align:center}.gtcv .l a{color:#7dd3fc;font-weight:700}';document.head.appendChild(st);}
  const ov=document.createElement('div');ov.className='gtcv';const cv=draw(o);
  const row=document.createElement('div');row.className='r';
  const dl=document.createElement('button');dl.textContent='Download certificate (PNG)';
  dl.onclick=function(){const a=document.createElement('a');a.download='Flameater-Certificate-L'+o.lesson+'-G'+o.n+'.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();};
  const cl=document.createElement('button');cl.className='g';cl.textContent='Close';cl.onclick=function(){ov.remove();};
  row.append(dl,cl);
  const lk=document.createElement('div');lk.className='l';lk.innerHTML='Portal: <a href="'+SITE+'" target="_blank" rel="noopener">'+SITE+'</a> &nbsp;|&nbsp; Repository: <a href="'+REPO+'" target="_blank" rel="noopener">'+REPO.replace('https://','')+'</a>';
  ov.append(cv,row,lk);document.body.appendChild(ov);return ov;};
window.GTCert=C;
})();

/* Executive Game Theory - shared game kit (UI chrome, scoring hand-off, helpers). No external deps. */
(function(){
const css = `
:root{--bg:#0b1120;--card:#131b2e;--card2:#1a253c;--bd:#2a3a5a;--ac:#38bdf8;--gold:#f59e0b;--em:#10b981;--rose:#f43f5e;--tx:#f8fafc;--mu:#94a3b8}
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
body{background:var(--bg);color:var(--tx);min-height:100vh;padding:16px 10px;display:flex;justify-content:center}
.gt-wrap{width:100%;max-width:880px;display:flex;flex-direction:column;gap:14px}
.gt-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}
.gt-head h1{font-size:1.45rem;color:var(--ac);letter-spacing:-.3px}
.gt-head p{color:var(--mu);font-size:.9rem;margin-top:3px}
.gt-pills{display:flex;gap:8px;flex-wrap:wrap}
.gt-pill{border:1px solid var(--bd);background:#101830;border-radius:99px;padding:5px 12px;font-size:.8rem;font-weight:700}
.gt-pill.gold{border-color:var(--gold);color:var(--gold)}.gt-pill.time{border-color:var(--em);color:var(--em);font-variant-numeric:tabular-nums}.gt-pill.time.low{border-color:var(--rose);color:var(--rose);animation:gtp 1s infinite}@keyframes gtp{50%{opacity:.45}}.gt-pill.blue{border-color:var(--ac);color:var(--ac)}
.gt-card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px}
.gt-how{color:var(--mu);font-size:.88rem;line-height:1.55}.gt-how b{color:var(--tx)}
.gt-btn{background:#1e293b;color:var(--tx);border:2px solid var(--bd);border-radius:8px;padding:10px 14px;font-size:.95rem;font-weight:600;cursor:pointer;transition:.15s}
.gt-btn:hover{border-color:var(--ac);background:#27354f}.gt-btn:disabled{opacity:.4;cursor:default}
.gt-btn.pri{background:linear-gradient(135deg,#0284c7,#2563eb);border-color:transparent}
.gt-btn.gold{background:linear-gradient(135deg,#d97706,#b45309);border-color:transparent}
.gt-btn.sel{border-color:var(--gold);background:#3a2f12}
.gt-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.gt-mu{color:var(--mu);font-size:.85rem}.gt-ok{color:var(--em)}.gt-bad{color:var(--rose)}.gt-gold{color:var(--gold)}
.gt-bar{height:12px;background:#0d1426;border:1px solid var(--bd);border-radius:99px;overflow:hidden}
.gt-bar>i{display:block;height:100%;background:linear-gradient(90deg,#0284c7,#38bdf8);width:0;transition:width .25s}
table.gt-t{border-collapse:collapse;width:100%;font-size:.9rem}
table.gt-t th,table.gt-t td{border:1px solid var(--bd);padding:8px;text-align:center}
table.gt-t th{background:#1b2742;color:var(--ac)}
canvas.gt-c{width:100%;background:#070c1a;border:1px solid var(--bd);border-radius:10px;touch-action:none;display:block}
.gt-ov{position:fixed;inset:0;background:rgba(5,9,20,.88);display:none;align-items:center;justify-content:center;padding:16px;z-index:50}
.gt-ov.on{display:flex}.gt-ov .gt-card{max-width:520px;width:100%;border-color:var(--ac)}
.gt-big{font-size:2.4rem;font-weight:800;color:var(--ac)}
select.gt-sel{background:#1e293b;color:var(--tx);border:2px solid var(--bd);border-radius:6px;padding:6px;font-size:.95rem}
input[type=range].gt-r{width:100%;accent-color:#38bdf8}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const GT={};
GT.$=(s,r)=>(r||document).querySelector(s);
GT.el=function(tag,attrs,kids){const e=document.createElement(tag);for(const k in (attrs||{})){if(k==='class')e.className=attrs[k];else if(k==='html')e.innerHTML=attrs[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k]);}
 (kids||[]).forEach(c=>e.appendChild(typeof c==='string'?document.createTextNode(c):c));return e;};
GT.rnd=(a,b)=>a+Math.random()*(b-a);GT.ri=(a,b)=>Math.floor(GT.rnd(a,b+1));
GT.pick=a=>a[Math.floor(Math.random()*a.length)];
GT.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
GT.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
GT.sleep=ms=>new Promise(r=>setTimeout(r,ms));
GT.fit=function(canvas,w,h){const d=Math.min(window.devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;canvas.style.aspectRatio=w+'/'+h;const g=canvas.getContext('2d');g.setTransform(d,0,0,d,0,0);return g;};
GT.ptr=function(canvas,w,h,e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*w/r.width,y:(e.clientY-r.top)*h/r.height};};
/* init: builds page chrome. cfg={lesson:'02',n:1,kind:'video'|'sim',title,sub,how(html)} returns {body,score,setScore,add,end} */
GT.init=function(cfg){
 GTCert.gate();
 document.title='Lesson '+cfg.lesson+' - Game '+cfg.n+': '+cfg.title;
 const wrap=GT.el('div',{class:'gt-wrap'});document.body.appendChild(wrap);
 const sc=GT.el('span',{class:'gt-pill blue'},['Score 0']);
 const who=GT.el('span',{class:'gt-pill',style:'cursor:pointer',title:'Click to change player name',onclick:()=>{GTCert.forget();location.reload();}},['Player: '+GTCert.name()+' (change)']);
 /* session clock: every game ends when time runs out (cfg.time seconds overrides the default: video 150s, sim 480s) */
 const limit=cfg.time||(cfg.kind==='sim'?480:150);const tEnd=Date.now()+limit*1000;
 const fmt=t=>Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
 const clock=GT.el('span',{class:'gt-pill time'},['Time '+fmt(limit)]);
 const head=GT.el('div',{class:'gt-head'},[
  GT.el('div',{},[GT.el('h1',{},['Game '+cfg.n+': '+cfg.title]),GT.el('p',{},['Lesson '+cfg.lesson+' companion - '+cfg.sub])]),
  GT.el('div',{class:'gt-pills'},[GT.el('span',{class:'gt-pill '+(cfg.kind==='sim'?'gold':'')},[cfg.kind==='sim'?'Simulation - 2x leaderboard weight':'Video game - 1x leaderboard weight']),who,clock,sc])]);
 const how=GT.el('div',{class:'gt-card gt-how',html:'<b>How to play.</b> '+cfg.how});
 const body=GT.el('div',{});
 wrap.append(head,how,body);
 /* START gate: nothing runs until the player clicks the bar; the click reloads and the flag lets init continue */
 if(window.name!=='gt_go'){
  if(!document.getElementById('gt-start-css')){const st=document.createElement('style');st.id='gt-start-css';
   st.textContent='.gt-start{display:block;width:100%;margin:18px 0;padding:30px 12px;font:900 2.1rem/1.1 Georgia,serif;letter-spacing:.12em;text-transform:uppercase;color:#1a1000;background:linear-gradient(135deg,#ffe27a,#f5b800 55%,#c98a00);border:4px solid #fff3a0;border-radius:14px;cursor:pointer;box-shadow:0 0 0 4px #7a4f00,0 10px 30px rgba(245,184,0,.45);animation:gtpulse 1.4s ease-in-out infinite}.gt-start small{display:block;margin-top:8px;font:600 .9rem system-ui,sans-serif;letter-spacing:.02em;text-transform:none;color:#4a3000}.gt-start:hover{filter:brightness(1.08)}@keyframes gtpulse{50%{transform:scale(1.015);box-shadow:0 0 0 4px #7a4f00,0 10px 40px rgba(245,184,0,.8)}}';
   document.head.appendChild(st);}
  const b=GT.el('button',{class:'gt-start',onclick:()=>{window.name='gt_go';location.reload();}},['START GAME']);
  b.insertAdjacentHTML('beforeend','<small>Read the instructions above, then click to begin. The clock starts only when you click.</small>');
  how.after(b);
  throw new Error('GT_START_REQUIRED (waiting for player to press START)');
 }
 window.name='';
 const ov=GT.el('div',{class:'gt-ov'});document.body.appendChild(ov);
 const api={body,score:0,ended:false,
  setScore(v){if(api.ended)return;api.score=Math.max(0,Math.round(v));sc.textContent='Score '+api.score;},
  add(v){api.setScore(api.score+v);},
  end(summary,finalScore){
   if(api.ended)return;
   const f=Math.max(0,Math.round(finalScore===undefined?api.score:finalScore));api.setScore(f);api.ended=true;clearInterval(tick);
   let rec='';try{if(typeof GTStorage!=='undefined'){GTStorage.recordScore('lesson_'+cfg.lesson,cfg.kind,f);rec='Score saved to your leaderboard record.';}}catch(e){}
   const w=cfg.kind==='sim'?f*2:f;
   ov.innerHTML='';ov.appendChild(GT.el('div',{class:'gt-card'},[
    GT.el('div',{class:'gt-mu'},['Lesson '+cfg.lesson+' - Game '+cfg.n+' complete']),
    GT.el('div',{class:'gt-big'},[f+' pts']),
    GT.el('div',{class:'gt-mu',html:cfg.kind==='sim'?('Counts as <b>'+w+'</b> on the leaderboard (2x).'):'Counts 1x on the leaderboard.'}),
    GT.el('div',{html:'<p style="margin:12px 0;line-height:1.55">'+summary+'</p>'}),
    GT.el('div',{class:'gt-mu',style:'margin-bottom:12px'},[rec]),
    GT.el('div',{class:'gt-row'},[GT.el('button',{class:'gt-btn gold',onclick:()=>GTCert.show({lesson:cfg.lesson,n:cfg.n,title:cfg.title,kind:cfg.kind,score:f,max:cfg.max,stars:cfg.stars&&cfg.stars(f)})},['Get Certified']),GT.el('button',{class:'gt-btn pri',onclick:()=>location.reload()},['Play again']),
     GT.el('a',{class:'gt-btn',href:'../index.html',style:'text-decoration:none'},['Portal hub'])])]));
   ov.classList.add('on');}};
 const tick=setInterval(()=>{const left=Math.max(0,Math.ceil((tEnd-Date.now())/1000));clock.textContent='Time '+fmt(left);clock.classList.toggle('low',left<=15);
  if(left<=0)api.end('<b>Time is up.</b> Every session is capped so each run stays a focused rep. Your score so far has been recorded; play again to beat it.');},250);
 window.__gt=api;return api;};

GT.nash=function(m){const R=m.length,C=m[0].length,out=[];for(let i=0;i<R;i++)for(let j=0;j<C;j++){let ok=true;for(let k=0;k<R;k++)if(m[k][j][0]>m[i][j][0])ok=false;for(let k=0;k<C;k++)if(m[i][k][1]>m[i][j][1])ok=false;if(ok)out.push([i,j])}return out};
GT.mtable=function(m,rn,cn,hl){const t=GT.el('table',{class:'gt-t'});let h='<tr><th></th>'+cn.map(x=>'<th>'+x+'</th>').join('')+'</tr>';t.innerHTML=h;
 m.forEach((row,i)=>{const tr=GT.el('tr',{});tr.appendChild(GT.el('th',{},[rn[i]]));row.forEach((c,j)=>{const on=(hl||[]).some(q=>q[0]===i&&q[1]===j);tr.appendChild(GT.el('td',{style:on?'background:rgba(16,185,129,.22);outline:2px solid #10b981':'',html:'<span class="gt-ok">'+(+c[0].toFixed(1))+'</span> , <span class="gt-bad">'+(+c[1].toFixed(1))+'</span>'+(on?'<br><small class="gt-ok">Nash</small>':'')}))});t.appendChild(tr)});return t};
window.GT=GT;
})();
