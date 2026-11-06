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
.gt-pill.gold{border-color:var(--gold);color:var(--gold)}.gt-pill.blue{border-color:var(--ac);color:var(--ac)}
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
 document.title='Lesson '+cfg.lesson+' - Game '+cfg.n+': '+cfg.title;
 const wrap=GT.el('div',{class:'gt-wrap'});document.body.appendChild(wrap);
 const sc=GT.el('span',{class:'gt-pill blue'},['Score 0']);
 const head=GT.el('div',{class:'gt-head'},[
  GT.el('div',{},[GT.el('h1',{},['Game '+cfg.n+': '+cfg.title]),GT.el('p',{},['Lesson '+cfg.lesson+' companion - '+cfg.sub])]),
  GT.el('div',{class:'gt-pills'},[GT.el('span',{class:'gt-pill '+(cfg.kind==='sim'?'gold':'')},[cfg.kind==='sim'?'Simulation - 2x leaderboard weight':'Video game - 1x leaderboard weight']),sc])]);
 const how=GT.el('div',{class:'gt-card gt-how',html:'<b>How to play.</b> '+cfg.how});
 const body=GT.el('div',{});
 wrap.append(head,how,body);
 const ov=GT.el('div',{class:'gt-ov'});document.body.appendChild(ov);
 const api={body,score:0,
  setScore(v){api.score=Math.max(0,Math.round(v));sc.textContent='Score '+api.score;},
  add(v){api.setScore(api.score+v);},
  end(summary,finalScore){
   const f=Math.max(0,Math.round(finalScore===undefined?api.score:finalScore));api.setScore(f);
   let rec='';try{if(typeof GTStorage!=='undefined'){GTStorage.recordScore('lesson_'+cfg.lesson,cfg.kind,f);rec='Score saved to your leaderboard record.';}}catch(e){}
   const w=cfg.kind==='sim'?f*2:f;
   ov.innerHTML='';ov.appendChild(GT.el('div',{class:'gt-card'},[
    GT.el('div',{class:'gt-mu'},['Lesson '+cfg.lesson+' - Game '+cfg.n+' complete']),
    GT.el('div',{class:'gt-big'},[f+' pts']),
    GT.el('div',{class:'gt-mu',html:cfg.kind==='sim'?('Counts as <b>'+w+'</b> on the leaderboard (2x).'):'Counts 1x on the leaderboard.'}),
    GT.el('div',{html:'<p style="margin:12px 0;line-height:1.55">'+summary+'</p>'}),
    GT.el('div',{class:'gt-mu',style:'margin-bottom:12px'},[rec]),
    GT.el('div',{class:'gt-row'},[GT.el('button',{class:'gt-btn pri',onclick:()=>location.reload()},['Play again']),
     GT.el('a',{class:'gt-btn',href:'../index.html',style:'text-decoration:none'},['Portal hub'])])]));
   ov.classList.add('on');}};
 window.__gt=api;return api;};

GT.nash=function(m){const R=m.length,C=m[0].length,out=[];for(let i=0;i<R;i++)for(let j=0;j<C;j++){let ok=true;for(let k=0;k<R;k++)if(m[k][j][0]>m[i][j][0])ok=false;for(let k=0;k<C;k++)if(m[i][k][1]>m[i][j][1])ok=false;if(ok)out.push([i,j])}return out};
GT.mtable=function(m,rn,cn,hl){const t=GT.el('table',{class:'gt-t'});let h='<tr><th></th>'+cn.map(x=>'<th>'+x+'</th>').join('')+'</tr>';t.innerHTML=h;
 m.forEach((row,i)=>{const tr=GT.el('tr',{});tr.appendChild(GT.el('th',{},[rn[i]]));row.forEach((c,j)=>{const on=(hl||[]).some(q=>q[0]===i&&q[1]===j);tr.appendChild(GT.el('td',{style:on?'background:rgba(16,185,129,.22);outline:2px solid #10b981':'',html:'<span class="gt-ok">'+(+c[0].toFixed(1))+'</span> , <span class="gt-bad">'+(+c[1].toFixed(1))+'</span>'+(on?'<br><small class="gt-ok">Nash</small>':'')}))});t.appendChild(tr)});return t};
window.GT=GT;
})();
