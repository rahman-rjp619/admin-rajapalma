'use strict';
const ST=['Hadir','Izin','Sakit','Dinas Luar','Cuti','Libur','Alpa','Perlu Dicek','Perlu Dicek / Anomali'];
const warna={hadir:'var(--ac)',cek:'var(--wr)',lain:'var(--c2)'};
const stChip=s=>chip(kat(s)==='cek'?'Perlu dicek':s,kat(s)==='hadir'?'ok':kat(s)==='cek'?'wr':'');
const rentang=(a,b)=>{const t=h('div',{class:'tb'});const i1=h('input',{type:'date',value:a}),i2=h('input',{type:'date',value:b});return{i1,i2,t}};

R.beranda=async v=>{
 const t=Date.now(),to=iso(new Date(t)),from=iso(new Date(t-13*864e5));
 const[a,ap,sv]=await Promise.all([api('portalAbsensiAdminDaftar',{dari:from,sampai:to,cari:''}),api('approvalJumlahMenunggu').catch(()=>({jumlah:0})),api('ringkasan').catch(()=>null)]);
 const rows=a.data||[],by={};for(let i=0;i<14;i++)by[iso(new Date(t-(13-i)*864e5))]=0;
 rows.forEach(r=>{const d=dt(r.tanggal);if(d in by)by[d]++});
 const c={hadir:0,cek:0,lain:0};rows.filter(r=>dt(r.tanggal)===to).forEach(r=>c[kat(r.status)]++);
 const s=sv&&sv.data;
 v.append(h('div',{class:'kp'},kpi('Hadir hari ini',c.hadir),kpi('Perlu dicek',c.cek),kpi('Izin / sakit / cuti',c.lain),kpi('Menunggu persetujuan',ap.jumlah||0)),
  h('div',{class:'g2'},card('Catatan absensi 14 hari',bars(Object.keys(by).map(d=>({l:d.slice(8),v:by[d]})))),card('Komposisi hari ini',donut([{l:'Hadir',v:c.hadir,c:warna.hadir},{l:'Dicek',v:c.cek,c:warna.cek},{l:'Lainnya',v:c.lain,c:warna.lain}]))),
  card('Server',s?h('dl',{},h('dt',{},'status'),h('dd',{class:'ok'},'● terhubung'),h('dt',{},'karyawan'),h('dd',{},String(s.karyawan)),h('dt',{},'antrean approval'),h('dd',{},String(s.approvalMenunggu)),h('dt',{},'waktu server'),h('dd',{},String(s.waktu))):h('p',{class:'bad'},'● tidak ada respons dari backend')));
};

function formAbsen(r,done){const n=!r;r=r||{tanggal:iso(new Date()),status:'Hadir'};
 const f={d:h('input',{type:'date',value:dt(r.tanggal)}),no:h('input',{value:r.noAbsen||'',placeholder:'no. absen'}),m:h('input',{type:'time',value:r.jamMasuk||''}),p:h('input',{type:'time',value:r.jamPulang||''}),st:h('select',{},ST.map(x=>h('option',{value:x,selected:x===r.status},x))),k:h('input',{value:r.keterangan||''})};
 modal(n?'Input absensi':'Edit absensi',h('div',{class:'fg'},fld('Tanggal',f.d),fld('No. absen',f.no),fld('Jam masuk',f.m),fld('Jam pulang',f.p),fld('Status',f.st),fld('Keterangan',f.k)),[
  ['Simpan',async x=>{const data={tanggal:f.d.value,noAbsen:f.no.value.trim(),jamMasuk:f.m.value,jamPulang:f.p.value,status:f.st.value,keterangan:f.k.value.trim()};
   if(!data.tanggal||!data.noAbsen)return toast('Tanggal dan no. absen wajib diisi.',1);
   if(!n)Object.assign(data,{row:r.row,tanggalLama:r.tanggal,noLama:r.noAbsen});
   let res=await raw('portalAbsensiAdminSimpan',{data});
   if(res&&res.kode==='DUPLIKAT'&&confirm('Absensi untuk tanggal & no. absen ini sudah ada. Perbarui?'))res=await raw('portalAbsensiAdminSimpan',{data:{...data,perbarui:true}});
   if(res&&res.ok){toast(res.pesan||'Tersimpan.');x();done()}else toast((res&&res.pesan)||'Gagal menyimpan.',1)},'p'],
  ...(n?[]:[['Hapus',async x=>{if(!confirm('Hapus catatan ini?'))return;await api('portalAbsensiAdminHapus',{row:r.row,tanggalLama:r.tanggal,noLama:r.noAbsen});toast('Dihapus.');x();done()},'d']])])}

R.absensi=async v=>{
 const[a,b]=bulan(),{i1,i2}=rentang(a,b),q=h('input',{type:'search',placeholder:'cari nama / no. absen'}),sf=h('select',{},[['','Semua status'],['hadir','Hadir'],['cek','Perlu dicek'],['lain','Izin/sakit/lainnya']].map(x=>h('option',{value:x[0]},x[1]))),box=h('div');let rows=[];
 const draw=()=>{const s=q.value.toLowerCase(),l=rows.filter(r=>(!s||(r.nama+' '+r.noAbsen).toLowerCase().includes(s))&&(!sf.value||kat(r.status)===sf.value));
  const c={hadir:0,cek:0,lain:0};l.forEach(r=>c[kat(r.status)]++);
  box.replaceChildren(h('div',{class:'g2'},card('Ringkasan',h('p',{class:'mut'},l.length+' catatan pada periode ini')),card('Status',donut([{l:'Hadir',v:c.hadir,c:warna.hadir},{l:'Dicek',v:c.cek,c:warna.cek},{l:'Lainnya',v:c.lain,c:warna.lain}]))),
   tbl(['Tanggal','Nama','No.','Masuk','Pulang','Status',''],l.slice(0,300).map(r=>[dmy(dt(r.tanggal)),r.nama,r.noAbsen,r.jamMasuk,r.jamPulang,stChip(r.status),h('button',{class:'b s',on:{click:()=>formAbsen(r,load)}},'Edit')])),l.length>300?h('p',{class:'mut'},'Menampilkan 300 pertama; persempit periode.'):null)};
 const load=async()=>{box.textContent='Memuat…';try{rows=(await api('portalAbsensiAdminDaftar',{dari:i1.value,sampai:i2.value,cari:''})).data||[];draw()}catch(e){if(e.message!=='SESI_HABIS')box.textContent=e.message}};
 [i1,i2].forEach(i=>i.onchange=load);q.oninput=draw;sf.onchange=draw;
 v.append(h('div',{class:'tb'},i1,i2,q,sf,h('button',{class:'b p',on:{click:()=>formAbsen(null,load)}},'+ Input manual')),box);load();
};

R.karyawan=async v=>{
 const r=await api('karyawanDaftar'),all=r.daftar||[];window.PIL=r.pilihan;const q=h('input',{type:'search',placeholder:'cari nama / NIP / no. absen'}),non=h('input',{type:'checkbox',style:'width:auto;min-height:0'}),box=h('div');
 const draw=()=>{const s=q.value.toLowerCase(),l=all.filter(k=>(k.aktif||non.checked)&&(!s||(k.nama+' '+k.nip+' '+k.noAbsen).toLowerCase().includes(s))).sort((x,y)=>String(x.nama).localeCompare(y.nama,'id'));
  const dv={};l.filter(k=>k.aktif).forEach(k=>{const d=k.divisi||'—';dv[d]=(dv[d]||0)+1});const top=Object.entries(dv).sort((x,y)=>y[1]-x[1]).slice(0,8);
  box.replaceChildren(h('div',{class:'kp'},kpi('Ditampilkan',l.length),kpi('Aktif',all.filter(k=>k.aktif).length),kpi('Nonaktif',all.filter(k=>!k.aktif).length)),
   card('Karyawan aktif per divisi (8 teratas)',bars(top.map(x=>({l:x[0].slice(0,7),v:x[1]})))),
   tbl(['Nama','Divisi','Status','No.',''],l.slice(0,300).map(k=>[k.nama+(k.aktif?'':' (nonaktif)'),k.divisi,k.status,k.noAbsen,h('button',{class:'b s',on:{click:()=>detail(k)}},'Detail')])))};
 const detail=k=>{const dl=h('dl',{},[['Nama',k.nama],['NIP',k.nip],['No. absen',k.noAbsen],['Divisi',k.divisi],['Jabatan',k.jabatan],['Status',k.status],['Tgl masuk',dmy(k.tglMasuk)],['Aktif',k.aktif?'ya':'tidak '+(k.alasan||'')]].flatMap(x=>[h('dt',{},x[0]),h('dd',{},x[1]||'—')])),priv=h('div');
  modal('Profil karyawan',h('div',{},dl,priv),[['Edit',x=>{x();formKar(k,route)}],['Data pribadi',async()=>{const d=(await api('rahasiaLihat',{id:k.id})).data;priv.replaceChildren(h('hr'),h('dl',{},[['NIK',d.nik],['K/TK',d.kTk],['Tempat lahir',d.tempatLahir],['Tgl lahir',dmy(d.tglLahir)],['No. HP',d.noHp]].flatMap(x=>[h('dt',{},x[0]),h('dd',{},x[1]||'—')])))}],
   ['Hapus',async x=>{if(!confirm('Hapus '+k.nama+' secara permanen? Akun portal ikut terhapus.'))return;await api('karyawanHapus',{id:k.id});all.splice(all.indexOf(k),1);toast('Karyawan dihapus.');x();draw()},'d']])};
 q.oninput=draw;non.onchange=draw;v.append(h('div',{class:'tb'},q,h('button',{class:'b p',on:{click:()=>formKar(null,route)}},'+ Tambah'),h('label',{class:'f',style:'flex:0 0 auto;grid-auto-flow:column;align-items:center'},non,'tampilkan nonaktif')),box);draw();
};

R.lembur=async v=>{
 const[a,b]=bulan(),{i1,i2}=rentang(a,b),box=h('div');
 const load=async()=>{box.textContent='Memuat…';try{const r=await api('portalLemburDaftar',{cari:'',divisi:'',dari:i1.value,sampai:i2.value}),m={};
  (r.data||[]).forEach(x=>{const k=x.no_absen||x.nama,o=m[k]||(m[k]={n:x.nama,d:x.divisi,no:x.no_absen,j:0,h:0});(x.rincian_harian||[]).forEach(y=>{const t=dt(y.tanggal),j=+y.jam||0;if(j>0&&t>=i1.value&&t<=i2.value){o.j+=j;o.h++}})});
  const l=Object.values(m).filter(x=>x.j>0).sort((p,q)=>q.j-p.j),tot=l.reduce((s,x)=>s+x.j,0);
  box.replaceChildren(h('div',{class:'kp'},kpi('Karyawan lembur',l.length),kpi('Total jam',+tot.toFixed(1))),card('10 jam lembur tertinggi',bars(l.slice(0,10).map(x=>({l:String(x.n).split(' ')[0].slice(0,6),v:+x.j.toFixed(1)})))),tbl(['Nama','Divisi','No.','Hari','Jam'],l.map(x=>[x.n,x.d,x.no,x.h,+x.j.toFixed(2)])))}catch(e){if(e.message!=='SESI_HABIS')box.textContent=e.message}};
 [i1,i2].forEach(i=>i.onchange=load);v.append(h('div',{class:'tb'},i1,i2),box);load();
};

R.rekapan=async v=>{
 const[a,b]=bulan(),{i1,i2}=rentang(a,b),box=h('div'),sv=h('button',{class:'b p',disabled:true,on:{click:async()=>{if(!confirm('Simpan snapshot rekapan periode ini? Karyawan akan melihatnya di portal.'))return;sv.disabled=true;try{const r=await api('portalRekapanHitungSimpan',{dari:i1.value,sampai:i2.value});toast(r.pesan||'Snapshot tersimpan.')}catch(e){toast(e.message,1)}sv.disabled=false}}},'Simpan snapshot');
 const load=async()=>{if(!i1.value||i1.value>i2.value)return toast('Rentang tanggal tidak valid.',1);box.textContent='Menghitung…';sv.disabled=true;try{const r=await api('portalRekapanPreview',{dari:i1.value,sampai:i2.value}),l=r.data||[];
  const g=l.reduce((s,x)=>s+(+x.nominal_gaji||0),0),lb=l.reduce((s,x)=>s+(+x.nominal_lembur||0),0);sv.disabled=!l.length;
  box.replaceChildren(h('div',{class:'g2'},h('div',{class:'kp',style:'grid-template-columns:1fr 1fr;margin:0'},kpi('Karyawan',l.length),kpi('Grand total',rp(g+lb)),kpi('Gaji pokok',rp(g)),kpi('Lembur',rp(lb))),card('Komposisi',donut([{l:'Gaji',v:Math.round(g),c:'var(--ac)'},{l:'Lembur',v:Math.round(lb),c:'var(--wr)'}]))),
   tbl(['Nama','Divisi','Status','Hadir','Gaji pokok','Jam lembur','Lembur','Total'],l.map(x=>[x.nama,x.divisi,x.status,x.tanpa_gaji_harian?'—':x.hari_dibayar,rp(x.nominal_gaji),(+x.jam_lembur).toFixed(2),rp(x.nominal_lembur),rp(x.total_nominal)])))}catch(e){if(e.message!=='SESI_HABIS')box.textContent=e.message}};
 v.append(h('div',{class:'tb'},i1,i2,h('button',{class:'b',on:{click:load}},'Hitung preview'),sv),box);load();
};

R.approval=async v=>{
 const tab=h('select',{},[['menunggu','Menunggu'],['approve','Disetujui'],['reject','Ditolak'],['','Semua']].map(x=>h('option',{value:x[0]},x[1]))),box=h('div');
 const load=async()=>{box.textContent='Memuat…';try{const l=(await api('approvalDaftar',{status:tab.value})).data||[];
  box.replaceChildren(...(l.length?l.map(a=>{const keputusan=h('input',{placeholder:'catatan (opsional)'}),dec=(ak)=>async()=>{if(!confirm((ak==='approve'?'Setujui':'Tolak')+' pengajuan ini?'))return;try{toast((await api('approvalPutuskan',{idPengajuan:a.idPengajuan,aksi:ak,catatan:keputusan.value})).pesan||'Tersimpan.');load()}catch(e){toast(e.message,1)}};
   return card((a.namaKaryawan||'Karyawan')+' · '+a.idPengajuan,h('p',{class:'mut'},(a.dibuat||'')+' oleh '+(a.diajukanOleh||'-')+' '),chip(a.status==='approve'?'Disetujui':a.status==='reject'?'Ditolak':'Menunggu',a.status==='approve'?'ok':a.status==='reject'?'bad':'wr'),
    tbl(['Field','Lama','Baru'],(a.fieldBerubah||[]).map(k=>[k,(a.dataLama||{})[k],(a.dataBaru||{})[k]])),
    a.status==='menunggu'?h('div',{class:'tb',style:'margin:10px 0 0'},keputusan,h('button',{class:'b p',on:{click:dec('approve')}},'Setujui'),h('button',{class:'b d',on:{click:dec('reject')}},'Tolak')):null)}):[h('p',{class:'mut'},'Tidak ada pengajuan.')]))}catch(e){if(e.message!=='SESI_HABIS')box.textContent=e.message}};
 tab.onchange=load;v.append(h('div',{class:'tb'},tab),box);load();
};

R.akun=async v=>{
 const q=h('input',{type:'search',placeholder:'cari nama / no. absen'}),box=h('div');let all=[];
 const load=async()=>{all=(await api('portalAkunDaftar')).daftar||[];draw()};
 const draw=()=>{const s=q.value.toLowerCase(),l=all.filter(a=>!s||(a.nama+' '+a.noAbsen).toLowerCase().includes(s)),ak=all.filter(a=>a.aktif).length;
  box.replaceChildren(h('div',{class:'g2'},h('div',{class:'kp',style:'margin:0'},kpi('Total akun',all.length),kpi('Aktif',ak),kpi('Nonaktif',all.length-ak)),card('Status akun',donut([{l:'Aktif',v:ak,c:'var(--ac)'},{l:'Nonaktif',v:all.length-ak,c:'var(--er)'}]))),
   tbl(['Nama','No. absen','Status','Password',''],l.slice(0,200).map(a=>[a.nama,a.noAbsen,chip(a.aktif?'Aktif':'Nonaktif',a.aktif?'ok':'bad'),a.wajibGantiPassword?'perlu ganti':'sudah diganti',
    h('div',{style:'display:flex;gap:6px'},h('button',{class:'b s',on:{click:async()=>{if(!confirm('Reset password '+a.nama+'?'))return;try{const r=await api('portalAkunReset',{id:a.id});modal('Password sementara',h('p',{},a.nama+': ',h('b',{},r.passwordSementara),h('br'),h('span',{class:'mut'},'Catat sekarang, hanya ditampilkan sekali.')))}catch(e){toast(e.message,1)}}}},'Reset'),
     h('button',{class:'b s',on:{click:async()=>{try{toast((await api('portalAkunStatus',{id:a.id,aktif:!a.aktif})).pesan);load()}catch(e){toast(e.message,1)}}}},a.aktif?'Nonaktifkan':'Aktifkan'))])))};
 q.oninput=draw;v.append(h('div',{class:'tb'},q),box);await load();
};
