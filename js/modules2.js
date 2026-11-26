'use strict';
/* Modul tambahan: form karyawan, kalender, tarif, penugasan, hak akses, statistik */
NAV.push(['kalender','Kalender'],['tarif','Tarif'],['penugasan','Penugasan'],['hakakses','Hak akses'],['statistik','Statistik']);
const opt=(a,v)=>a.map(x=>{const[val,t]=Array.isArray(x)?x:[x,x];return h('option',{value:val,selected:val===v},t)});
const inp=(v,t)=>h('input',{type:t||'text',value:v==null?'':v});
const divs=async()=>(await api('portalDivisiDaftar').catch(()=>({divisi:[]}))).divisi||[];
const dur=s=>{s=Math.max(0,s|0);return s>=3600?(s/3600|0)+'j '+(s%3600/60|0)+'m':s>=60?(s/60|0)+'m '+s%60+'d':s+'d'};

function formKar(k,done){const n=!k;k=k||{aktif:true};const P=Object.assign({divisi:[],status:[],statusNama:{},alasan:[]},window.PIL);
 const f={nama:inp(k.nama),nip:inp(k.nip),no:inp(k.noAbsen),jk:h('select',{},opt([['','—'],['L','Laki-laki'],['P','Perempuan']],k.jk||'')),dv:h('select',{},opt(['',...P.divisi],k.divisi||'')),jb:inp(k.jabatan),st:h('select',{},opt([['','—'],...P.status.map(s=>[s,s+' - '+(P.statusNama[s]||'')])],k.status||'')),tg:inp(k.tglMasuk,'date'),ak:h('select',{},opt([['ya','Aktif'],['tidak','Nonaktif']],k.aktif?'ya':'tidak')),tn:inp(k.tglNonaktif,'date'),al:h('select',{},opt(['',...P.alasan],k.alasan||'')),tj:inp(k.tujuan),kt:inp(k.keterangan)};
 const kirim=async(x,paksa)=>{const d={id:n?'':String(k.id).trim(),nama:f.nama.value.trim(),nip:f.nip.value,noAbsen:f.no.value.trim(),jk:f.jk.value,divisi:f.dv.value,jabatan:f.jb.value,status:f.st.value,tglMasuk:f.tg.value,keterangan:f.kt.value,aktif:f.ak.value==='ya',tglNonaktif:f.tn.value,alasan:f.al.value,tujuan:f.tj.value,paksa:!!paksa};
  if(!d.nama)return toast('Nama wajib diisi.',1);const r=await raw('karyawanSimpan',d);
  if(r&&r.ok){toast(n?'Karyawan ditambahkan.':'Perubahan disimpan.');x();done()}else if(r&&r.kode==='DUPLIKAT'){if(confirm(r.pesan+'\nTetap simpan?'))return kirim(x,1)}else toast((r&&r.pesan)||'Gagal menyimpan.',1)};
 modal(n?'Tambah karyawan':'Edit karyawan',h('div',{class:'fg'},fld('Nama',f.nama),fld('NIP',f.nip),fld('No. absen',f.no),fld('Jenis kelamin',f.jk),fld('Divisi',f.dv),fld('Jabatan',f.jb),fld('Status kerja',f.st),fld('Tanggal masuk',f.tg),fld('Keanggotaan',f.ak),fld('Tgl nonaktif',f.tn),fld('Alasan nonaktif',f.al),fld('Tujuan',f.tj),fld('Keterangan',f.kt)),[['Simpan',kirim,'p']])}

R.kalender=async v=>{
 const dl=await divs(),d1=inp(iso(new Date()),'date'),d2=inp('','date'),jn=h('select',{},opt([['libur','Libur'],['off','Off produksi']],'libur')),dv=h('select',{multiple:true,size:5},opt([['*','Semua divisi'],...dl],'*')),al=inp('');dv.options[0].selected=true;const box=h('div');
 const load=async()=>{const l=((await api('portalKalenderKerjaAmbil')).aturan||[]).slice().sort((a,b)=>String(b.tanggal).localeCompare(a.tanggal));
  box.replaceChildren(tbl(['Tanggal','Jenis','Divisi','Keterangan',''],l.map(x=>[dmy(dt(x.tanggal)),x.jenis==='off'?'Off produksi':'Libur',x.cakupan==='pegawai'?(x.noAbsen||[]).length+' karyawan':(x.divisi||[]).includes('*')||!(x.divisi||[]).length?'Semua':(x.divisi||[]).join(', '),x.alasan,h('button',{class:'b s d',on:{click:async()=>{if(!confirm('Hapus pengaturan ini?'))return;await api('portalKalenderKerjaHapus',{id:x.id});load()}}},'Hapus')])))};
 const simpan=async()=>{let p=[...dv.selectedOptions].map(o=>o.value);if(!p.length)return toast('Pilih divisi.',1);if(p.includes('*'))p=['*'];const a=d1.value,b=d2.value||a;if(!a||b<a)return toast('Rentang tanggal tidak valid.',1);
  const hr=[];for(let t=new Date(a+'T12:00:00');iso(t)<=b&&hr.length<31;t.setDate(t.getDate()+1))hr.push(iso(t));
  try{for(const t of hr)await api('portalKalenderKerjaSimpan',{data:{tanggal:t,jenis:jn.value,divisi:p,alasan:al.value||(jn.value==='off'?'Off produksi':'Libur perusahaan')}});toast(hr.length+' tanggal tersimpan.');load()}catch(e){toast(e.message,1)}};
 v.append(card('Tambah libur / off produksi',h('div',{class:'fg'},fld('Dari',d1),fld('Sampai (opsional)',d2),fld('Jenis',jn),fld('Keterangan',al),fld('Divisi (boleh banyak)',dv)),h('div',{style:'margin-top:10px'},h('button',{class:'b p',on:{click:simpan}},'Simpan'))),box);await load();
};

R.tarif=async v=>{
 const[kr,dl]=await Promise.all([api('karyawanDaftar'),divs()]),peg=(kr.daftar||[]).filter(k=>k.aktif&&k.noAbsen),box=h('div');
 const gh=inp('','number'),gl=inp('','number'),jn=h('select',{},opt([['divisi','Per divisi'],['pegawai','Per karyawan']],'divisi')),tg=h('select'),kh=inp('','number'),kl=inp('','number');
 const isiTg=()=>tg.replaceChildren(...(jn.value==='divisi'?opt(dl,''):opt(peg.map(k=>[k.noAbsen,k.nama+' · '+k.noAbsen]),'')));isiTg();jn.onchange=isiTg;
 const load=async()=>{const r=await api('portalTarifAmbil');gh.value=(r.global||{}).upahHarian||'';gl.value=(r.global||{}).tarifLemburPerJam||'';
  box.replaceChildren(tbl(['Jenis','Nama / divisi','Upah harian','Lembur / jam',''],(r.khusus||[]).map(x=>[x.cakupan==='pegawai'?'Karyawan':'Divisi',x.nama||x.kunci,x.upahHarian===''||x.upahHarian==null?'ikut bawaan':rp(x.upahHarian),x.tarifLemburPerJam===''||x.tarifLemburPerJam==null?'ikut bawaan':rp(x.tarifLemburPerJam),h('button',{class:'b s d',on:{click:async()=>{if(!confirm('Hapus tarif khusus?'))return;await api('portalTarifHapus',{data:{cakupan:x.cakupan,kunci:x.kunci}});load()}}},'Hapus')])))};
 const aksi=(fn)=>async()=>{try{toast((await fn()).pesan||'Tersimpan.');load()}catch(e){toast(e.message,1)}};
 v.append(card('Tarif global',h('div',{class:'fg'},fld('Upah harian (Rp)',gh),fld('Lembur per jam (Rp)',gl)),h('div',{style:'margin-top:10px'},h('button',{class:'b p',on:{click:aksi(()=>api('portalTarifSimpan',{data:{cakupan:'global',upahHarian:gh.value,tarifLemburPerJam:gl.value}}))}},'Simpan global'))),
  card('Tarif khusus',h('div',{class:'fg'},fld('Jenis',jn),fld('Target',tg),fld('Upah harian (Rp)',kh),fld('Lembur per jam (Rp)',kl)),h('div',{style:'margin-top:10px'},h('button',{class:'b p',on:{click:aksi(()=>{const k=peg.find(p=>p.noAbsen===tg.value);return api('portalTarifSimpan',{data:{cakupan:jn.value,kunci:tg.value,nama:jn.value==='divisi'?tg.value:(k?k.nama:''),divisi:jn.value==='divisi'?tg.value:(k?k.divisi:''),upahHarian:kh.value,tarifLemburPerJam:kl.value}})})}},'Simpan khusus'))),box);await load();
};

R.penugasan=async v=>{
 const q=inp('','search');q.placeholder='cari nama / no. absen';const box=h('div');let all=[],dl=[];
 const form=x=>{x=x||{};const f={nm:inp(x.nama),no:inp(x.noAbsen),kt:h('select',{},opt(['Perbantuan','Pinjaman','Rental','Koordinator Pusat'],x.kategori||'Perbantuan')),st:h('select',{},opt(['KT','HT','HL'],x.status||'HL')),dv:h('select',{},opt(['',...dl],x.divisi||'')),jb:inp(x.jabatan),m:inp(x.tglMulai,'date'),s:inp(x.tglSelesai,'date'),hk:h('select',{},opt([['TIDAK_DIBAYAR','HK tidak dibayar'],['DIBAYAR','HK dibayar']],x.skemaHK||'TIDAK_DIBAYAR')),ak:h('select',{},opt([['ya','Aktif'],['tidak','Nonaktif']],x.id&&!x.aktif?'tidak':'ya')),ke:inp(x.keterangan)};
  modal(x.id?'Edit tenaga penugasan':'Tambah tenaga penugasan',h('div',{class:'fg'},fld('Nama',f.nm),fld('No. absen',f.no),fld('Kategori',f.kt),fld('Status',f.st),fld('Divisi',f.dv),fld('Jabatan',f.jb),fld('Mulai',f.m),fld('Selesai',f.s),fld('Skema HK (Rental)',f.hk),fld('Status',f.ak),fld('Keterangan',f.ke)),[['Simpan',async c=>{const d={id:x.id||'',noAbsen:f.no.value.trim(),nama:f.nm.value.trim(),kategori:f.kt.value,status:f.st.value,divisi:f.dv.value,jabatan:f.jb.value.trim(),tglMulai:f.m.value,tglSelesai:f.s.value,skemaHK:f.hk.value,aktif:f.ak.value==='ya',keterangan:f.ke.value.trim()};if(!d.nama||!d.noAbsen||!d.divisi)return toast('Nama, no. absen, dan divisi wajib diisi.',1);toast((await api('tenagaPenugasanSimpan',{data:d})).pesan||'Tersimpan.');c();load()},'p']])};
 const draw=()=>{const s=q.value.toLowerCase();box.replaceChildren(tbl(['Nama','No.','Kategori','Divisi','Status','Akun',''],all.filter(x=>!s||(x.nama+' '+x.noAbsen).toLowerCase().includes(s)).map(x=>[x.nama,x.noAbsen,x.kategori,x.divisi,chip(x.aktif?'Aktif':'Nonaktif',x.aktif?'ok':'bad'),x.akunAda?'ada':h('button',{class:'b s',on:{click:async()=>{try{const a=await api('portalAkunBuat',{noAbsen:x.noAbsen,password:''});modal('Akun dibuat',h('p',{},x.nama+': ',h('b',{},a.passwordSementara)));load()}catch(e){toast(e.message,1)}}}},'Buat akun'),h('button',{class:'b s',on:{click:()=>form(x)}},'Edit')])))};
 const load=async()=>{const r=await api('tenagaPenugasanDaftar');all=r.daftar||[];dl=r.divisi||[];draw()};q.oninput=draw;
 v.append(h('div',{class:'tb'},q,h('button',{class:'b p',on:{click:()=>form()}},'+ Tambah tenaga')),box);await load();
};

const HM=[['profil','Data pribadi',['lihat']],['karyawan','Karyawan',['lihat','edit'],1],['absensi','Absensi',['lihat','tambah','edit','hapus'],1],['disiplin','Disiplin',['lihat','tambah','edit','hapus'],1],['sop','SOP',['lihat']],['lembur','Lembur',['lihat'],1],['rekapan','Rekapan',['lihat'],1]];
async function hakModal(a){const[r,dl]=await Promise.all([api('portalHakAksesAmbil',{id:a.id}),divs()]),cur={};(r.hak||[]).forEach(x=>cur[x.menuId]=x);
 const ed=HM.map(([id,nm,iz,cp])=>{const c=cur[id]||{cakupan:'sendiri',divisi:[]},cb={};const cs=cp?h('select',{},opt([['sendiri','Data sendiri'],['divisi','Per divisi'],['semua','Semua karyawan']],c.cakupan||'sendiri')):null,dv=cp?h('select',{multiple:true,size:4},opt(dl,'')):null;if(dv)[...dv.options].forEach(o=>o.selected=(c.divisi||[]).includes(o.value));
  const sh=()=>dv&&(dv.style.display=cs.value==='divisi'?'':'none');if(cs){cs.onchange=sh;sh()}
  const row=h('div',{style:'padding:8px 0;border-bottom:1px solid var(--ln);display:grid;gap:6px'},h('b',{},nm),h('div',{style:'display:flex;flex-wrap:wrap;gap:12px'},iz.map(z=>h('label',{},cb[z]=h('input',{type:'checkbox',checked:!!c[z],style:'width:auto;min-height:0'}),' '+z))),cs,dv);
  return{id,cb,cs,dv,row}});
 modal('Hak akses · '+(r.nama||a.noAbsen),h('div',{},ed.map(e=>e.row)),[['Simpan',async x=>{const hak=ed.map(e=>{const n={menuId:e.id,cakupan:e.cs?e.cs.value:'sendiri'};['lihat','tambah','edit','hapus'].forEach(z=>n[z]=!!(e.cb[z]&&e.cb[z].checked));if(e.dv&&n.cakupan==='divisi')n.divisi=[...e.dv.selectedOptions].map(o=>o.value);return n});toast((await api('portalHakAksesSimpan',{id:a.id,hak})).pesan||'Hak akses disimpan.');x()},'p']])}
R.hakakses=async v=>{const all=(await api('portalAkunDaftar')).daftar||[],q=inp('','search'),box=h('div');q.placeholder='cari nama / no. absen';
 const draw=()=>{const s=q.value.toLowerCase();box.replaceChildren(tbl(['Nama','No. absen','Status',''],all.filter(a=>!s||(a.nama+' '+a.noAbsen).toLowerCase().includes(s)).slice(0,200).map(a=>[a.nama,a.noAbsen,chip(a.aktif?'Aktif':'Nonaktif',a.aktif?'ok':'bad'),h('button',{class:'b s',on:{click:()=>hakModal(a).catch(e=>toast(e.message,1))}},'Atur')])))};q.oninput=draw;v.append(h('div',{class:'tb'},q),box);draw()};

let tmStat;R.statistik=async v=>{const box=h('div');v.append(box);clearInterval(tmStat);
 const load=async()=>{const r=await api('portalAnalyticsAmbil'),x=r.ringkasan||{},l=(r.riwayat||[]).slice(0,30);
  box.replaceChildren(h('div',{class:'kp'},kpi('Pengunjung unik hari ini',x.pengunjungUnik||0),kpi('Login hari ini',x.loginHariIni||x.kunjunganHariIni||0),kpi('Sesi aktif',x.sesiAktif||0),kpi('Rata-rata durasi',dur(x.rataDurasiDetik)),kpi('Durasi terlama',dur(x.durasiTerpanjangDetik))),
   card('Riwayat sesi Portal Karyawan (auto-refresh 60 dtk)',tbl(['Nama','No.','Masuk','Aktivitas terakhir','Durasi','Status'],l.map(a=>[a.nama,a.noAbsen,a.mulai,a.aktivitasTerakhir,dur(a.durasiDetik),chip(a.status==='aktif'?'Aktif':'Selesai '+(a.alasanSelesai||''),a.status==='aktif'?'ok':'')]))))};
 await load();tmStat=setInterval(()=>{if(location.hash==='#akun/statistik'&&!document.hidden)load().catch(()=>{});else if(location.hash!=='#akun/statistik')clearInterval(tmStat)},60000)};
