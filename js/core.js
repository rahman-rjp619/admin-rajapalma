'use strict';
const $=s=>document.querySelector(s),C=window.CFG,S={token:sessionStorage.getItem(C.KEY)},R={};
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const n in a){const v=a[n];if(n==='on')for(const x in v)e.addEventListener(x,v[x]);else if(n==='class')e.className=v;else if(v!=null&&v!==false)e.setAttribute(n,v===true?'':v)}k.flat().forEach(c=>c!=null&&e.append(c));return e};
const html=s=>{const d=h('div');d.innerHTML=s;return d},esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const p2=n=>('0'+n).slice(-2),iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()),dmy=v=>String(v||'').split('-').reverse().join('/'),rp=n=>'Rp '+Math.round(+n||0).toLocaleString('id-ID');
const dt=v=>{v=String(v||'');let m=v.match(/^\d{4}-\d\d-\d\d/);if(m)return m[0];m=v.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);return m?m[3]+'-'+p2(m[2])+'-'+p2(m[1]):v};
const bulan=()=>{const n=new Date();return[iso(new Date(n.getFullYear(),n.getMonth(),1)),iso(new Date(n.getFullYear(),n.getMonth()+1,0))]};
const kat=s=>!s||/perlu dicek|anomali/i.test(s)?'cek':/^(hadir|dinas luar)$/i.test(s)?'hadir':'lain';
const tbl=(hd,rows)=>h('div',{class:'tw'},h('table',{},h('thead',{},h('tr',{},hd.map(x=>h('th',{},x)))),h('tbody',{},rows.length?rows.map(r=>h('tr',{},r.map(c=>h('td',{},c==null||c===''?'—':c)))):h('tr',{},h('td',{colspan:hd.length,class:'mut'},'Tidak ada data.')))));
const card=(t,...k)=>h('section',{class:'cd'},h('h3',{},t),k),kpi=(l,v)=>h('div',{class:'kpi'},h('small',{},l),h('b',{},String(v))),fld=(l,i)=>h('label',{class:'f'},h('span',{},l),i);
const chip=(t,c)=>h('span',{class:'ch2 '+(c||'')},t);
function toast(m,e){const t=h('div',{class:'t'+(e?' e':'')},m);$('#toast').append(t);setTimeout(()=>t.remove(),4500)}
function modal(title,body,btns=[]){const o=h('div',{class:'ov'}),x=()=>o.remove();o.append(h('div',{class:'md'},h('h3',{},title),h('div',{class:'mb'},body),h('div',{class:'mf'},h('button',{class:'b',on:{click:x}},'Tutup'),btns.map(([t,f,c])=>h('button',{class:'b '+(c||''),on:{click:async()=>{try{await f(x)}catch(e){e.message!=='SESI_HABIS'&&toast(e.message,1)}}}},t)))));o.addEventListener('mousedown',e=>e.target===o&&x());document.body.append(o);return x}
/* Grafik SVG ringan */
function bars(d){const m=Math.max(1,...d.map(x=>x.v)),w=100/Math.max(d.length,1);return html('<svg viewBox="0 0 100 46" class="ch">'+d.map((x,i)=>{const k=x.v/m*32;return `<rect x="${i*w+w*.15}" y="${37-k}" width="${w*.7}" height="${k}" rx="1" fill="var(--k${i%4})"/><text x="${i*w+w/2}" y="${35.5-k}" font-size="2.7" text-anchor="middle" fill="var(--ink)">${x.v||''}</text><text x="${i*w+w/2}" y="42" font-size="2.6" text-anchor="middle" fill="var(--mut)">${esc(x.l)}</text>`}).join('')+'</svg>')}
function donut(p){const t=p.reduce((a,x)=>a+x.v,0);let o=25;const c='<circle cx="21" cy="21" r="15.9155" fill="none" stroke-width="5" ';return h('div',{class:'dw'},html('<svg viewBox="0 0 42 42" class="dn">'+c+'stroke="var(--ln)"/>'+p.map(x=>{const l=t?x.v/t*100:0,s=c+`stroke="${x.c}" stroke-dasharray="${l} ${100-l}" stroke-dashoffset="${o}"/>`;o-=l;return s}).join('')+`<text x="21" y="23" text-anchor="middle" font-size="7" fill="var(--ink)">${t}</text></svg>`),h('div',{class:'lg'},p.map(x=>html(`<span><i style="background:${x.c}"></i>${esc(x.l)} ${x.v}</span>`).firstChild)))}
/* API (jalur backend tidak berubah) */
async function raw(aksi,param){let r;try{r=await(await fetch(C.GAS_URL,{method:'POST',body:JSON.stringify({aksi,token:S.token,param:param||{}})})).json()}catch(e){throw Error('Gagal terhubung ke server.')}
 if(r&&r.pesan==='SESI_HABIS'){logout(1);throw Error('SESI_HABIS')}return r}
async function api(aksi,param){const r=await raw(aksi,param);if(!r||!r.ok)throw Error((r&&r.pesan)||'Permintaan gagal.');return r}
/* Sesi & kerangka */
const NAV=[['beranda','Beranda'],['absensi','Absensi'],['karyawan','Karyawan'],['lembur','Lembur'],['rekapan','Rekapan'],['approval','Persetujuan'],['akun','Akun']];
function logout(expired){const t=S.token;S.token=null;sessionStorage.removeItem(C.KEY);if(t)fetch(C.GAS_URL,{method:'POST',body:JSON.stringify({aksi:'keluar',token:t,param:{}})}).catch(()=>{});$('#app').hidden=true;$('#login').hidden=false;$('#err').textContent=expired?'Sesi habis. Silakan masuk lagi.':'';$('#view').replaceChildren()}
function bukaApp(){$('#login').hidden=true;$('#app').hidden=false;$('#nav').replaceChildren(...NAV.map(n=>h('a',{href:'#'+n[0],'data-id':n[0]},n[1])));route()}
async function route(){const[p,sub]=location.hash.slice(1).split('/'),id=R[p]?p:'beranda';document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.id===id));const v=$('#view'),box=h('div',{},h('p',{class:'mut'},'Memuat…'));v.replaceChildren(h('h2',{},'~/'+id+(sub&&R[p]?'/'+sub:'')),box);v.scrollTop=0;try{box.replaceChildren();await R[id](box,sub)}catch(e){if(e.message!=='SESI_HABIS'){box.replaceChildren(h('p',{class:'err'},e.message))}}}
function boot(){
 const tick=()=>{$('#clock').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'medium',timeStyle:'medium',hour12:false}).format(new Date())};tick();setInterval(tick,1000);
 $('#th').onclick=()=>{const t=document.documentElement.dataset.t==='dark'?'light':'dark';document.documentElement.dataset.t=t;try{localStorage.t=t}catch(e){}};
 const PL=['matrix','dracula','amber','nord'];$('#pl').onclick=()=>{const d=document.documentElement,n=PL[(PL.indexOf(d.dataset.p)+1)%PL.length];d.dataset.p=n;try{localStorage.p=n}catch(e){}toast('Palet: '+n)};$('#out').onclick=()=>logout();addEventListener('hashchange',()=>!$('#app').hidden&&route());
 $('#lf').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;$('#err').textContent='';try{const r=await raw('login',{kode:$('#kode').value});if(!r||!r.ok)throw Error((r&&r.pesan)||'Login gagal.');if(r.peran!=='admin'){fetch(C.GAS_URL,{method:'POST',body:JSON.stringify({aksi:'keluar',token:r.token,param:{}})}).catch(()=>{});throw Error('Akun ini bukan admin.')}S.token=r.token;sessionStorage.setItem(C.KEY,r.token);$('#kode').value='';bukaApp()}catch(x){$('#err').textContent=x.message}b.disabled=false};
 if(S.token)api('sesiInfo').then(r=>r.peran==='admin'?bukaApp():logout()).catch(()=>{})
}
