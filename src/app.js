const PEOPLE = [
  {n:'Leandro', r:'Zelador', g:'m', c:'#032f6c'},
  {n:'Guto', r:'Manutenção', g:'m', c:'#1f7a8c'},
  {n:'Cícero', r:'Limpeza', g:'l', c:'#a35b1d'},
  {n:'Valdirene', r:'Limpeza', g:'l', c:'#8a3d7a'},
  {n:'Alessandra', r:'Limpeza', g:'l', c:'#3f8a4e'}
];
const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const WD = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const CLS = {'Folga':'s-folga','8h–17h':'s-n8','8h–18h':'s-n9','8h–12h':'s-w4','Plantão 8h–17h':'s-w4'};
const HRS = {'Folga':0,'8h–17h':8,'8h–18h':9,'8h–12h':4,'Plantão 8h–17h':8};
const SUB = {'Folga':'Folga','8h–17h':'8h–17h','8h–18h':'8h–18h','8h–12h':'8h–12h','Plantão 8h–17h':'Plantão 8h–17h'};
const NW = 24;
let opt = (function(){try{const v=+localStorage.getItem('amvsOpt');return v>=1&&v<=3?v:2}catch(e){return 2}})(), wk = 0;
const $ = id => document.getElementById(id);
function on(id,ev,fn){const e=document.getElementById(id);if(e)e.addEventListener(ev,fn);}

function fmt(d){const [y,m,dd]=d.split('-');return dd+'/'+m}
function fmtLong(d){const [y,m,dd]=d.split('-');return (+dd)+' '+MONTHS[+m-1]}
function weekRows(o,w){return DATA[o].slice(w*7,w*7+7)}
function weekHours(o,w,p){return weekRows(o,w).reduce((s,r)=>s+HRS[r[2+p]],0)}
function level(h){return h>=40?'ok':(h>=36?'mid':'low')}
function avatar(p){return '<span class="av" style="background:'+p.c+'">'+p.n[0]+'</span>'}

/* before / after */
(function(){
  if(!$('weekBefore'))return;
  const before=[['Seg','8h'],['Ter','8h'],['Qua','8h'],['Qui','8h'],['Sex','8h'],['Sáb','4h'],['Dom','Folga']];
  const after=[['Seg','Folga'],['Ter','8h'],['Qua','8h'],['Qui','8h'],['Sex','8h'],['Sáb','8h'],['Dom','Folga']];
  const mk=(arr)=>arr.map(([d,v])=>{
    const c=v==='Folga'?'s-folga':(d==='Sáb'||d==='Dom'?'s-w4':'s-n8');
    return '<div class="day '+c+'">'+d+'<small>'+v+'</small></div>';}).join('');
  $('weekBefore').innerHTML=mk(before);
  $('weekAfter').innerHTML=mk(after);
})();

/* team */
if($('team'))$('team').innerHTML = PEOPLE.map(p=>'<div class="card person">'+avatar(p)+'<div><b>'+p.n+'</b><span>'+p.r+'</span></div></div>').join('');

/* rotation table (derived from Option 2 weekend duty, weeks 0..5 are not all plain, so use fixed cycle) */
const ROT=[['1','Cícero','Alessandra','Leandro','Guto'],['2','Alessandra','Valdirene','Guto','Leandro'],['3','Valdirene','Cícero','Leandro','Guto'],['4','Cícero','Alessandra','Guto','Leandro'],['5','Alessandra','Valdirene','Leandro','Guto'],['6','Valdirene','Cícero','Guto','Leandro']];
if($('rotbody'))$('rotbody').innerHTML = ROT.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i===0?' style="font-weight:700"':'')+'>'+c+'</td>').join('')+'</tr>').join('');

/* explorer */
const SHORT={'Folga':'Folga','8h–17h':'8h','8h–18h':'9h','8h–12h':'P 4h','Plantão 8h–17h':'P 8h'};
const TIME={'Folga':'Folga','8h–17h':'8h às 17h','8h–18h':'8h às 18h (9 horas)','8h–12h':'Plantão, 8h às 12h','Plantão 8h–17h':'Plantão, 8h às 17h'};
const WDL=['segunda','terça','quarta','quinta','sexta','sábado','domingo'];
const MN=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MV=[[2026,11],[2027,0],[2027,1],[2027,2],[2027,3],[2027,4]];
const PLANT=new Set(['8h–12h','Plantão 8h–17h']);
const idxByDate={}; DATA[2].forEach((r,i)=>idxByDate[r[0]]=i);
const START=DATA[2][0][0], END=DATA[2][DATA[2].length-1][0];
let view='week', person=0, mi=0, dayIdx=0;

function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2600)}
async function copyText(text,boxId,taId){
  try{ await navigator.clipboard.writeText(text); toast('Copiado. É só colar no WhatsApp.'); $(boxId).hidden=true; }
  catch(e){ $(boxId).hidden=false; const ta=$(taId); ta.value=text; ta.focus(); ta.select(); toast('Selecione o texto e copie.'); }
}
function fmtFull(d){const [y,m,dd]=d.split('-');return dd+'/'+m+'/'+y}

/* semana */
function renderSched(){
  const rows = weekRows(opt,wk);
  let h = '<div class="hd"></div>';
  rows.forEach((r,i)=>{ h += '<div class="hd'+(i>=5?' we':'')+'">'+WD[i]+'<b>'+fmt(r[0])+'</b></div>'; });
  h += '<div class="hd">Horas</div>';
  PEOPLE.forEach((p,pi)=>{
    h += '<div class="nm">'+avatar(p)+'<div>'+p.n+'<small>'+p.r+'</small></div></div>';
    rows.forEach(r=>{ const v=r[2+pi]; h += '<div class="cell '+CLS[v]+'">'+SUB[v]+'</div>'; });
    const hh = weekHours(opt,wk,pi);
    h += '<div class="tot '+level(hh)+'">'+hh+'h</div>';
  });
  h += '<div class="cov" style="text-align:left">No condomínio</div>';
  rows.forEach(r=>{
    let l=0,m=0;
    PEOPLE.forEach((p,pi)=>{ if(HRS[r[2+pi]]>0){ if(p.g==='l') l++; else m++; } });
    h += '<div class="cov"><b>'+l+' + '+m+'</b>limpeza + manut.</div>';
  });
  h += '<div class="cov"></div>';
  $('sched').innerHTML = h;

  let c='<div class="legendnote">Laranja com P = plantão de fim de semana ou feriado.</div>';
  PEOPLE.forEach((p,pi)=>{
    const hh=weekHours(opt,wk,pi);
    c+='<div class="pc"><div class="top"><div class="nm2">'+avatar(p)+'<div><b>'+p.n+'</b><small>'+p.r+'</small></div></div><span class="tot '+level(hh)+'" style="padding:6px 10px">'+hh+'h</span></div><div class="mini">'
      +rows.map((r,i)=>'<div class="'+CLS[r[2+pi]]+'">'+WD[i]+' '+r[0].slice(8)+'<small>'+SHORT[r[2+pi]]+'</small></div>').join('')+'</div></div>';
  });
  $('cards').innerHTML=c;

  const first = rows[0][0], last = rows[6][0];
  $('wl').innerHTML = 'Semana '+(wk+1)+' de '+NW+'<small>'+fmtLong(first)+' a '+fmtLong(last)+'</small>';
  $('prev').disabled = wk===0; $('next').disabled = wk===NW-1;
  const hs = PEOPLE.map((p,pi)=>weekHours(opt,wk,pi));
  const mn = Math.min(...hs), mx = Math.max(...hs);
  const notes = rows.filter(r=>r[7]).map(r=>'<b>'+fmt(r[0])+'</b>: '+r[7]);
  $('exsum').innerHTML = '<span class="pill s-n8">Maior jornada da semana: '+mx+'h</span>'+
    '<span class="pill '+(mn>=40?'':'s-w4')+'" '+(mn>=40?'style="background:var(--good-bg);color:var(--good-fg)"':'')+'>Menor jornada da semana: '+mn+'h</span>';
  $('exnote').innerHTML = notes.length ? notes.join(' · ')+'. Feriado é descanso remunerado, por isso as horas ficam abaixo de 40h.' : 'Semana sem feriado. Cada pessoa folga 2 dias.'+(mn<40?'':' Todos fecham '+mx+'h.');
  document.querySelectorAll('.hm button').forEach(b=>b.classList.toggle('sel', +b.dataset.w===wk));
}
function renderHeat(){
  let h = '<div></div>';
  for(let w=0;w<NW;w++){ h += '<div class="wk">'+fmt(DATA[opt][w*7][0])+'</div>'; }
  PEOPLE.forEach((p,pi)=>{
    h += '<div class="l">'+p.n+'</div>';
    for(let w=0;w<NW;w++){
      const hh = weekHours(opt,w,pi);
      h += '<button type="button" class="'+level(hh)+(w===wk?' sel':'')+'" data-w="'+w+'" aria-label="'+p.n+', semana '+(w+1)+', '+hh+' horas">'+hh+'</button>';
    }
  });
  $('hm').innerHTML = h;
  $('hm').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    wk = +b.dataset.w; setView('week'); renderSched();
    $('escala').scrollIntoView({behavior:'smooth'});
  }));
}

/* minha escala (mês) */
function renderMonth(){
  $('pchips').innerHTML=PEOPLE.map((q,i)=>'<button type="button" class="pchip" data-p="'+i+'" aria-pressed="'+(i===person)+'">'+avatar(q)+q.n+'</button>').join('');
  $('pchips').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{person=+b.dataset.p;renderMonth();}));
  const [y,m]=MV[mi];
  $('ml').textContent=MN[m][0].toUpperCase()+MN[m].slice(1)+' de '+y;
  $('mprev').disabled=mi===0; $('mnext').disabled=mi===MV.length-1;
  let h=WD.map(d=>'<div class="dh">'+d+'</div>').join('');
  const off=(new Date(y,m,1).getDay()+6)%7, nd=new Date(y,m+1,0).getDate();
  for(let i=0;i<off;i++) h+='<div></div>';
  for(let d=1;d<=nd;d++){
    const key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const ri=idxByDate[key];
    if(ri===undefined){ h+='<div class="d out"><i>'+d+'</i></div>'; continue; }
    const r=DATA[opt][ri], v=r[2+person];
    h+='<div class="d '+CLS[v]+(r[7]?' hol':'')+'"'+(r[7]?' title="'+r[7]+'"':'')+'><i>'+d+'</i><span>'+SHORT[v]+'</span></div>';
  }
  $('mcal').innerHTML=h;

  let sab=0,dom=0,free=0,pl=0;
  for(let w=0;w<NW;w++){ const s=DATA[opt][w*7+5][2+person], d=DATA[opt][w*7+6][2+person]; if(s!=='Folga')sab++; if(d!=='Folga')dom++; if(s==='Folga'&&d==='Folga')free++; }
  DATA[opt].forEach(r=>{ if(PLANT.has(r[2+person])) pl++; });
  $('pstats').innerHTML='<span class="pill s-w4">'+pl+' plantões em 24 semanas</span><span class="pill s-folga">'+free+' fins de semana livres</span><span class="pill s-n8">'+sab+' sábados e '+dom+' domingos trabalhados</span>';
  const nxt=[]; for(let i=wk*7;i<DATA[opt].length&&nxt.length<6;i++){ const r=DATA[opt][i]; if(PLANT.has(r[2+person])) nxt.push(r[1].toLowerCase()+' '+fmt(r[0])+' ('+TIME[r[2+person]].replace('Plantão, ','')+')'); }
  $('pnext').innerHTML='<b>Próximos plantões de '+PEOPLE[person].n+'</b> a partir da semana '+(wk+1)+': '+(nxt.length?nxt.join(', '):'nenhum no período')+'.';
}

/* quem está no dia */
function renderDay(){
  const r=DATA[opt][dayIdx]; $('dayin').value=r[0];
  const wd=(new Date(+r[0].slice(0,4),+r[0].slice(5,7)-1,+r[0].slice(8,10)).getDay()+6)%7;
  let l=0,m=0, rows='';
  PEOPLE.forEach((p,pi)=>{
    const v=r[2+pi], on=v!=='Folga';
    if(on){ if(p.g==='l') l++; else m++; }
    rows+='<div class="dayrow'+(on?'':' off')+'">'+avatar(p)+'<div class="who">'+p.n+'<small>'+p.r+'</small></div><span class="pill '+CLS[v]+'">'+TIME[v]+'</span></div>';
  });
  $('dayres').innerHTML='<h4>'+WDL[wd][0].toUpperCase()+WDL[wd].slice(1)+', '+fmtFull(r[0])+'</h4>'+
    '<div class="ex-sum" style="padding:0"><span class="pill s-n8">Limpeza no condomínio: '+l+'</span><span class="pill s-n8">Manutenção no condomínio: '+m+'</span></div>'+
    (r[7]?'<p class="legendnote"><b>'+r[7]+'</b></p>':'')+rows;
  $('dprev').disabled=dayIdx===0; $('dnext').disabled=dayIdx===DATA[opt].length-1;
}

/* contagem de fins de semana */
function renderCounts(){
  let h='<thead><tr><th>Pessoa</th><th>Sábados trabalhados</th><th>Domingos trabalhados</th><th>Fins de semana livres</th><th>Feriados em dia útil</th></tr></thead><tbody>';
  const cell=(n,t)=>'<td><span class="n">'+n+'</span> de '+t+'<div class="barbox"><div class="bar" style="width:'+Math.round(n/t*100)+'%"></div></div></td>';
  PEOPLE.forEach((p,pi)=>{
    let sab=0,dom=0,free=0,hol=0;
    for(let w=0;w<NW;w++){ const s=DATA[opt][w*7+5][2+pi], d=DATA[opt][w*7+6][2+pi]; if(s!=='Folga')sab++; if(d!=='Folga')dom++; if(s==='Folga'&&d==='Folga')free++; }
    DATA[opt].forEach(r=>{ if(r[7]&&r[7].startsWith('FERIADO')&&r[1]!=='Sáb'&&r[1]!=='Dom'&&r[2+pi]!=='Folga') hol++; });
    h+='<tr><td><b>'+p.n+'</b><br><span style="color:var(--muted);font-size:.85rem">'+p.r+'</span></td>'+cell(sab,NW)+cell(dom,NW)+cell(free,NW)+'<td><span class="n">'+hol+'</span></td></tr>';
  });
  $('wkcount').innerHTML=h+'</tbody>';
}

/* visões */
function setView(v){
  view=v;
  ['week','person','day'].forEach(k=>{ $('v-'+k).hidden=(k!==v); });
  document.querySelectorAll('#viewseg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v)));
  if(v==='person') renderMonth(); if(v==='day') renderDay();
}
function renderAll(){ if(!$('sched')) return; renderHeat(); renderSched(); renderCounts(); if(view==='person') renderMonth(); if(view==='day') renderDay(); }

document.querySelectorAll('#optseg button').forEach(b=>b.addEventListener('click',()=>{
  opt=+b.dataset.opt; try{localStorage.setItem('amvsOpt',opt)}catch(e){}
  document.querySelectorAll('#optseg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  renderAll();
}));
document.querySelectorAll('#viewseg button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
on('prev','click',()=>{ if(wk>0){wk--;renderSched();} });
on('next','click',()=>{ if(wk<NW-1){wk++;renderSched();} });
on('mprev','click',()=>{ if(mi>0){mi--;renderMonth();} });
on('mnext','click',()=>{ if(mi<MV.length-1){mi++;renderMonth();} });
on('dprev','click',()=>{ if(dayIdx>0){dayIdx--;renderDay();} });
on('dnext','click',()=>{ if(dayIdx<DATA[opt].length-1){dayIdx++;renderDay();} });
on('dayin','change',e=>{ const i=idxByDate[e.target.value]; if(i===undefined){ toast('A escala vai de 14/12/2026 a 30/05/2027.'); renderDay(); } else { dayIdx=i; renderDay(); } });
function todayKey(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
on('dtoday','click',()=>{ const i=idxByDate[todayKey()]; if(i===undefined){ toast('A escala começa em 14/12/2026. Mostrando o primeiro dia.'); dayIdx=0; } else dayIdx=i; renderDay(); });
{ const i=idxByDate[todayKey()]; dayIdx = i===undefined ? 0 : i; }

/* copiar */
on('copyResumo','click',()=>{
  const t='*Escala 5x2 – Queen Plaza (AMVS Facilities)*\n\n'+
   '• Todos folgam 2 dias em toda semana, sem corte de salário.\n'+
   '• Até 40h por semana nas semanas normais.\n'+
   '• Sábado, domingo e feriado: sempre 1 da limpeza e 1 da manutenção.\n'+
   '• Recomendação: Opção 2 (plantão de fim de semana de 8h, 40h para todos).\n'+
   '• Início previsto: 15/12/2026 (EC 141).\n\n'+
   'Escala completa: '+location.href.split('#')[0]+'\n\n'+
   'Proposta sujeita à validação com contador, jurídico e SIEMACO.';
  copyText(t,'copybox1','ta1');
});
on('copyPerson','click',()=>{
  const p=PEOPLE[person]; let t='*Escala de '+p.n+' – Queen Plaza (Opção '+opt+')*\n';
  for(let w=wk;w<Math.min(wk+4,NW);w++){
    const rows=weekRows(opt,w);
    t+='\nSemana '+fmt(rows[0][0])+' a '+fmt(rows[6][0])+' ('+weekHours(opt,w,person)+'h)\n'+rows.map((r,i)=>WD[i]+' '+fmt(r[0])+': '+TIME[r[2+person]].replace('Plantão, ','plantão ')).join('\n')+'\n';
  }
  t+='\nEscala completa: '+location.href.split('#')[0];
  copyText(t,'copybox2','ta2');
});

/* imprimir */
function doPrint(exOnly){
  if(exOnly) document.body.classList.add('print-ex');
  try{ window.print(); }catch(e){}
  setTimeout(()=>document.body.classList.remove('print-ex'),1500);
}
window.addEventListener('afterprint',()=>document.body.classList.remove('print-ex'));
on('printBtn','click',()=>doPrint(true));
on('printAll','click',()=>doPrint(false));

document.querySelectorAll('#optseg button').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.opt===opt)));
renderAll();
