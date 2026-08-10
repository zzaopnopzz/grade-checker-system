document.addEventListener('DOMContentLoaded',initMain);
let selectedStudent=null;
function initMain(){
const page=document.body.dataset.page;
if(page==='home')home();
if(page==='select-room')selectRoom();
if(page==='enter-code')enterCode();
if(page==='teacher-login')teacherLogin();
}
function qs(){return new URLSearchParams(location.search)}
function home(){
$('#teacherSiteBtn').href=CONFIG.LINKS.TEACHER_SITE;$('#youtubeBtn').href=CONFIG.LINKS.YOUTUBE;
Api.main({action:'getNews'}).then(d=>{
const news=(d.news||[]).filter(n=>n.text);
if(news.length){$('#newsTicker').innerHTML=news.map(n=>n.link?`<a href="${esc(n.link)}" target="_blank">${esc(n.text)}</a>`:esc(n.text)).join(' • ');
$('#newsList').innerHTML=news.map(n=>`<div class="news-item">${n.link?`<a href="${esc(n.link)}" target="_blank">${esc(n.text)}</a>`:esc(n.text)}</div>`).join('')}
}).catch(()=>{})
}
function selectRoom(){
const subject=qs().get('subject')||sessionStorage.subject||'social';sessionStorage.subject=subject;
$('#subjectTitle').textContent=CONFIG.SUBJECTS[subject]||subject;
$('#roomGrid').innerHTML=CONFIG.ROOMS.map(r=>`<a class="room-card" href="enter-code.html?subject=${subject}&grade=${r.grade}&room=${r.room}"><h3>${r.label}</h3><p>ห้อง ${r.code}</p></a>`).join('')
}
function enterCode(){
const subject=qs().get('subject')||sessionStorage.subject||'social';
const grade=qs().get('grade')||sessionStorage.grade||'1';
const room=qs().get('room')||sessionStorage.room||'1';
sessionStorage.subject=subject;sessionStorage.grade=grade;sessionStorage.room=room;
const info=CONFIG.ROOMS.find(r=>r.grade===grade&&r.room===room);
$('#roomTitle').textContent=(CONFIG.SUBJECTS[subject]||subject)+' '+(info?info.label:'ม.'+grade+'/'+room);
$('#nameSearch').addEventListener('input',async e=>{
const q=e.target.value.trim();selectedStudent=null;
if(q.length<2){$('#studentResults').innerHTML='';return}
try{const d=await Api.get(grade,{action:'searchStudents',grade,room,subject,q});
$('#studentResults').innerHTML=(d.students||[]).map((s,i)=>`<div class="result-item" data-i="${i}">${esc(s.number||'')} ${esc(s.name)} <small>${esc(s.code||'')}</small></div>`).join('');
$$('.result-item').forEach(el=>el.onclick=()=>{selectedStudent=(d.students||[])[el.dataset.i];$$('.result-item').forEach(x=>x.classList.remove('selected'));el.classList.add('selected')})
}catch(err){$('#studentResults').innerHTML='<p class="bad">โหลดรายชื่อไม่สำเร็จ</p>'}
});
$('#loginStudentBtn').onclick=()=>{
const code=$('#studentCode').value.trim();const msg=$('#loginMsg');msg.textContent='';
if(!code){msg.textContent='กรุณากรอกรหัสนักเรียน';return}
sessionStorage.studentCode=code;if(selectedStudent)sessionStorage.studentName=selectedStudent.name;
location.href=`score.html?subject=${subject}&grade=${grade}&room=${room}&code=${encodeURIComponent(code)}`
}
}
function teacherLogin(){
$('#teacherLoginBtn').onclick=async()=>{
const code=$('#teacherCode').value.trim();const msg=$('#teacherLoginMsg');msg.textContent='';
let valid=code===CONFIG.DEFAULT_TEACHER_CODE;
try{const d=await Api.main({action:'getTeacherCode'});if(d.code)valid=code===String(d.code)}catch(e){}
if(valid){sessionStorage.teacherAuth='true';location.href='teacher-dashboard.html'}else msg.textContent='รหัสครูไม่ถูกต้อง'
}
}
