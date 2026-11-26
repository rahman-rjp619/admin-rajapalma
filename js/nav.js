'use strict';
/* Menu digabung: tiap modul induk punya submenu (tab) di dalamnya. Hash: #induk/sub */
const O=Object.assign({},R);
function grp(id,items){return async(box,sub)=>{const cur=items.find(i=>i[0]===sub)||items[0];
 box.append(h('div',{class:'tb tabs'},items.map(i=>h('a',{href:'#'+id+'/'+i[0],class:'b'+(i===cur?' p':'')},i[1]))));
 const c=h('div');box.append(c);try{await cur[2](c)}catch(e){if(e.message!=='SESI_HABIS')c.replaceChildren(h('p',{class:'err'},e.message))}}}
['karyawan','absensi','lembur','rekapan','approval','kalender','tarif','penugasan','hakakses','statistik','akun'].forEach(k=>delete R[k]);
R.karyawan=grp('karyawan',[['data','Data karyawan',O.karyawan],['penugasan','Tenaga penugasan',O.penugasan],['persetujuan','Persetujuan',O.approval]]);
R.kehadiran=grp('kehadiran',[['absensi','Absensi',O.absensi],['lembur','Lembur',O.lembur],['rekapan','Rekapan gaji',O.rekapan],['kalender','Kalender libur',O.kalender],['tarif','Tarif upah',O.tarif]]);
R.akun=grp('akun',[['akun','Akun login',O.akun],['hak','Hak akses',O.hakakses],['statistik','Statistik portal',O.statistik]]);
NAV.length=0;NAV.push(['beranda','Beranda'],['karyawan','Karyawan'],['kehadiran','Absensi & Gaji'],['akun','Akun & Akses']);
