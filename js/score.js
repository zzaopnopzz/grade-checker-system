function displayStudentScore(data) {
  console.log('📊 แสดงคะแนน:', data);
  
  // แสดงชื่อนักเรียน
  document.getElementById('studentName').textContent = data.student.name;
  
  // แสดงคะแนนหน่วย
  if (data.units && data.units.length > 0) {
    const unitsHtml = data.units.map(u => 
      `<div class="score-item">
        <span>${u.title}</span>
        <span>${u.score}/${u.fullScore}</span>
      </div>`
    ).join('');
    document.getElementById('unitsContainer').innerHTML = unitsHtml;
  }
  
  // แสดงคะแนนรายชั่วโมง
  if (data.hourly && data.hourly.length > 0) {
    const hourlyHtml = data.hourly.map(h => 
      `<div class="score-item">
        <span>${h.title}</span>
        <span>${h.score}</span>
      </div>`
    ).join('');
    document.getElementById('hourlyContainer').innerHTML = hourlyHtml;
  }
  
  // แสดงคะแนนสรุป
  if (data.gradeSummary) {
    document.getElementById('beforeMidterm').textContent = data.gradeSummary.beforeMidterm;
    document.getElementById('midterm').textContent = data.gradeSummary.midterm;
    document.getElementById('total').textContent = data.gradeSummary.total;
    document.getElementById('grade').textContent = data.gradeSummary.grade;
  }
}
