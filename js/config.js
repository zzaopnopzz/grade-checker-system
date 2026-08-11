const CONFIG = {
  API: {
    MAIN: 'https://script.google.com/macros/s/YOUR_MAIN_ID/exec',
    M1: 'https://script.google.com/macros/s/YOUR_M1_ID/exec',
    M2: 'https://script.google.com/macros/s/YOUR_M2_ID/exec',
    M3: 'https://script.google.com/macros/s/AKfycbzmcgBVFLrU3S21lUUHE-N8C-oyZC5TWhcdHy7C7CDFcGYE7WexnRk2qAIWEfAmSV6f/exec'
  },
  
  SUBJECTS: {
    social: {
      name: 'สังคมศึกษา',
      icon: '🌏',
      color: '#FF6B6B'
    }
  },
  
  GRADES: {
    '1': { name: 'มัธยมศึกษาปีที่ 1', rooms: ['1', '2'] },
    '2': { name: 'มัธยมศึกษาปีที่ 2', rooms: ['1', '2'] },
    '3': { name: 'มัธยมศึกษาปีที่ 3', rooms: ['1', '2'] }
  }
};

Commit changes
รอ 1-2 นาที ให้ GitHub Pages อัปเดต
2. แก้ไข enter-code.js (ป้องกันพิมพ์ชื่อมั่ว):
เปิดไฟล์ js/enter-code.js แล้วเพิ่มโค้ดนี้:

หาบรรทัดที่มี:

// ตัวแปรเก็บข้อมูล
let currentGrade = '';
let currentRoom = '';
let currentSubject = '';

เพิ่มตัวแปรนี้:

let selectedStudent = null; // เก็บข้อมูลนักเรียนที่เลือก

หาฟังก์ชัน displayStudentList แล้วแก้ไข:

function displayStudentList(students) {
  const listDiv = document.getElementById('studentList');
  listDiv.innerHTML = '';
  
  if (students.length === 0) {
    listDiv.style.display = 'none';
    return;
  }
  
  students.forEach(student => {
    const item = document.createElement('div');
    item.className = 'student-item';
    item.innerHTML = `
      <div class="student-code">${student.code}</div>
      <div class="student-name">${student.name}</div>
      <div class="student-number">เลขที่ ${student.number}</div>
    `;
    
    item.addEventListener('click', () => {
      selectedStudent = student; // บันทึกข้อมูลนักเรียนที่เลือก
      document.getElementById('studentCode').value = student.code;
      document.getElementById('studentName').value = student.name;
      hideStudentList();
    });
    
    listDiv.appendChild(item);
  });
  
  listDiv.style.display = 'block';
}

หาฟังก์ชัน input event listeners แล้วแก้ไข:

// เมื่อพิมพ์ในช่องรหัส
document.getElementById('studentCode').addEventListener('input', (e) => {
  selectedStudent = null; // เคลียร์การเลือกเมื่อพิมพ์ใหม่
  const query = e.target.value.trim();
  if (query.length >= 2) {
    searchStudents(query);
  } else {
    hideStudentList();
  }
});

// เมื่อพิมพ์ในช่องชื่อ
document.getElementById('studentName').addEventListener('input', (e) => {
  selectedStudent = null; // เคลียร์การเลือกเมื่อพิมพ์ใหม่
  const query = e.target.value.trim();
  if (query.length >= 2) {
    searchStudents(query);
  } else {
    hideStudentList();
  }
});

หาฟังก์ชัน submitBtn click event แล้วเพิ่มการตรวจสอบ:

document.getElementById('submitBtn').addEventListener('click', async () => {
  // ตรวจสอบว่าต้องเลือกจากรายชื่อ
  if (!selectedStudent) {
    showError('⚠️ กรุณาเลือกนักเรียนจากรายชื่อที่แสดง\n\nไม่สามารถพิมพ์ชื่อหรือรหัสเองได้');
    return;
  }

  const code = document.getElementById('studentCode').value.trim();
  const name = document.getElementById('studentName').value.trim();

  // ตรวจสอบว่ารหัสตรงกับที่เลือกหรือไม่
  if (code !== selectedStudent.code) {
    showError('⚠️ รหัสนักเรียนไม่ตรงกับที่เลือก\n\nกรุณาเลือกนักเรียนจากรายชื่อใหม่');
    selectedStudent = null;
    return;
  }

  // แสดง Loading
  showLoading();

  try {
    // เรียก API ดึงคะแนน
    const apiUrl = CONFIG.API[`M${currentGrade}`];
    const url = `${apiUrl}?action=getStudentScore&room=${currentRoom}&code=${code}&subject=${currentSubject}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      // บันทึกข้อมูลและไปหน้าแสดงคะแนน
      sessionStorage.setItem('studentData', JSON.stringify(data));
      window.location.href = 'score.html';
    } else {
      showError(data.message || 'ไม่พบข้อมูลนักเรียน');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง');
  } finally {
    hideLoading();
  }
});
