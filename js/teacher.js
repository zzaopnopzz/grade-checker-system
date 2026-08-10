document.addEventListener('DOMContentLoaded',initTeacher);
let rows=[],roomDetail=null;
function initTeacher(){
if(sessionStorage.teacherAuth!=='true'){location.href='teacher-login.html';return}
const page=document.body.dataset.page;
$('#logoutBtn')&&($('#logoutBtn').onclick=()=>{sessionStorage.removeItem('teacherAuth');location.href='index.html'});
$('#subjectSelect')&&($('#subjectSelect').value=sessionStorage.subject||'social');
$('#subjectSelect')&&($('#subjectSelect').onchange=e=>{sessionStorage.subject=e.target.value;page==='teacher-room-detail'?loadRoom():loadDashboard()});
if(page==='teacher-dashboard'){$('#refreshDashboardBtn').onclick=loadDashboard;$('#exportDashboardBtn').onclick=exportDashboard;loadDashboard()}
if(page==='teacher-room-detail'){$('#refreshBtn').onclick=loadRoom;$('#exportRoomBtn').onclick=exportRoom;loadRoom()}
}
async function loadDashboard(){
loading('กำลังโหลดแดชบอร์ด...');const subject=$('#subjectSelect').value;sessionStorage.subject=subject;
try{
const ds=await Promise.all(['1','2','3'].map(g=>Api.get(g,{action:'getDashboardOverview',grade:g,subject}).catch(()=>({rooms:[]}))));
rows=CONFIG.ROOMS.map(r=>{const found=ds.flatMap(x=>x.rooms||[]).find(x=>String(x.classCode)===r.code||String(x.grade)===r.grade&&String(x.room)===r.room)||{};return{...r,count:num(found.count),avg:num(found.avgTotal),completion:num(found.hourlyCompletion),completed:num(found.completedHours),totalHours:num(found.totalHours)}});
renderDashboard();
}catch(e){$('#roomsOverview').innerHTML='<p class="bad">โหลดข้อมูลไม่สำเร็จ</p>'}finally{loaded()}
}
function renderDashboard(){
const total=rows.reduce((a,b)=>a+b.count,0),avg=rows.length?rows.reduce((a,b)=>a+b.avg,0)/rows.length:0,comp=rows.length?rows.reduce((a,b)=>a+b.completion,0)/rows.length:0;
$('#dashboardSummary').innerHTML=[stat('ห้องเรียน',rows.length,'🏫'),stat('นักเรียน',total,'👥'),stat('คะแนนเฉลี่ย',fmt(avg),'📊'),stat('ความก้าวหน้า',pct(comp),'⏱️')].join('');
$('#roomsOverview').innerHTML=rows.map(r=>`<div class="room-card" data-g="${r.grade}" data-r="${r.room}"><h3>${r.label}</h3><p>นักเรียน ${r.count} คน</p><p>คะแนนเฉลี่ย ${fmt(r.avg)}</p><div class="progress"><span style="width:${r.completion}%"></span></div><p>${pct(r.completion)} (${r.completed}/${r.totalHours})</p></div>`).join('');
$$('.room-card').forEach(x=>x.onclick=()=>location.href=`teacher-room-detail.html?grade=${x.dataset.g}&room=${x.dataset.r}`);
$('#dashboardTable').innerHTML=table(['ห้อง','นักเรียน','คะแนนเฉลี่ย','ความก้าวหน้า','ชั่วโมงครบ'],rows.map(r=>[r.label,r.count,fmt(r.avg),pct(r.completion),r.completed+'/'+r.totalHours]));
loadTop()
}
async function loadTop(){
const subject=$('#subjectSelect').value;let all=[];
for(const r of CONFIG.ROOMS){try{const d=await Api.get(r.grade,{action:'getRoomDetail',grade:r.grade,room:r.room,subject});(d.students||[]).forEach(s=>all.push({...s,label:r.label}))}catch(e){}}
all.sort((a,b)=>num(b.total)-num(a.total));all=all.slice(0,10);
$('#topStudents').innerHTML=table(['อันดับ','ห้อง','เลขที่','ชื่อ-สกุล','รวม','กลางภาค','เกรด'],all.map((s,i)=>[i+1,s.label,s.number,s.name,fmt(s.total),fmt(s.midterm),s.grade||'-']))
}
async function loadRoom(){
const p=new URLSearchParams(location.search),grade=p.get('grade')||sessionStorage.grade||'1',room=p.get('room')||sessionStorage.room||'1',subject=$('#subjectSelect').value;sessionStorage.grade=grade;sessionStorage.room=room;
loading('กำลังโหลดรายละเอียดห้อง...');
try{roomDetail=await Api.get(grade,{action:'getRoomDetail',grade,room,subject});renderRoom()}catch(e){$('#studentTable').innerHTML='<p class="bad">โหลดข้อมูลไม่สำเร็จ</p>'}finally{loaded()}
}
function renderRoom(){
const info=CONFIG.ROOMS.find(r=>r.grade===String(roomDetail.grade)&&r.room===String(roomDetail.room))||{};
const ss=roomDetail.students||[];$('#roomTitle').textContent=info.label||roomDetail.classLabel||'รายละเอียดห้องเรียน';
const avg=ss.length?ss.reduce((a,b)=>a+num(b.total),0)/ss.length:0;
$('#roomSummary').innerHTML=[stat('ห้อง',info.label||'-','🏫'),stat('นักเรียน',ss.length,'👥'),stat('คะแนนเฉลี่ย',fmt(avg),'📊'),stat('รายชั่วโมง',pct(roomDetail.hourlyCompletion||0),'⏱️')].join('');
const hs=roomDetail.hourlyStats||[];$('#hourlyStats').innerHTML=hs.map(h=>`<div class="hour-card"><b>${esc(h.title)}</b><p>${h.completed}/${h.total} (${pct(h.percent)})</p><div class="progress"><span style="width:${num(h.percent)}%"></span></div></div>`).join('')||'<p>ไม่มีข้อมูลรายชั่วโมง</p>';
const risk=ss.filter(s=>num(s.total)<50||num(s.midterm)<10);
$('#followStudents').innerHTML=table(['เลขที่','ชื่อ-สกุล','รวม','กลางภาค','สถานะ'],risk.map(s=>[s.number,s.name,fmt(s.total),fmt(s.midterm),'ติดตาม']));
$('#studentTable').innerHTML=table(['เลขที่','รหัส','ชื่อ-สกุล','รวม','กลางภาค','ปลายภาค','เกรด'],ss.map(s=>[s.number,s.code,s.name,fmt(s.total),fmt(s.midterm),fmt(s.finalExam),s.grade||'-']))
}
function stat(t,v,i){return `<div class="stat-card"><p>${i} ${esc(t)}</p><h2>${esc(v)}</h2></div>`}
function table(head,body){return `<table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function exportDashboard(){csvDownload([['ห้อง','นักเรียน','คะแนนเฉลี่ย','ความก้าวหน้า'],...rows.map(r=>[r.label,r.count,fmt(r.avg),pct(r.completion)])],'teacher-dashboard.csv')}
function exportRoom(){const ss=roomDetail?.students||[];csvDownload([['เลขที่','รหัส','ชื่อ','รวม','กลางภาค','ปลายภาค','เกรด'],...ss.map(s=>[s.number,s.code,s.name,fmt(s.total),fmt(s.midterm),fmt(s.finalExam),s.grade])],'teacher-room.csv')}
