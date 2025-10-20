/* ---------- Utilities ---------- */
const LS_KEY = 'sms_students_v1';

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function loadStudents(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? []; }
  catch { return []; }
}
function saveStudents(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function getParam(name){
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

/* ---------- Seed demo data ---------- */
(function seedIfEmpty(){
  const data = loadStudents();
  if (data.length === 0) {
    saveStudents([
      {id:uid(), code:'66010001', firstName:'Somchai', lastName:'Jaidee', major:'IT', phone:'0812345678', email:'somchai@example.com'},
      {id:uid(), code:'66010002', firstName:'Suda', lastName:'Meechai', major:'CS', phone:'0891112222', email:'suda@example.com'}
    ]);
  }
})();

/* ---------- Add/Edit Student ---------- */
(function initAddPage(){
  const form = $('#student-form');
  if(!form) return;

  const id = getParam('id');
  const title = $('#form-title');
  const msg = $('#form-msg');

  if (id) {
    title.textContent = 'แก้ไขข้อมูลนักศึกษา';
    const list = loadStudents();
    const stu = list.find(s => s.id === id);
    if (stu) {
      $('#studentId').value = stu.id;
      $('#code').value = stu.code;
      $('#firstName').value = stu.firstName;
      $('#lastName').value = stu.lastName;
      $('#major').value = stu.major;
      $('#phone').value = stu.phone;
      $('#email').value = stu.email;
    }
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const code = $('#code').value.trim();
    const firstName = $('#firstName').value.trim();
    const lastName = $('#lastName').value.trim();
    const major = $('#major').value.trim();
    const phone = $('#phone').value.trim();
    const email = $('#email').value.trim();
    const editingId = $('#studentId').value || null;

    if(!code || !firstName || !lastName || !major || !phone || !email){
      msg.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      msg.style.color = '#ffd1a6';
      return;
    }

    const list = loadStudents();

    if (editingId){
      const idx = list.findIndex(s => s.id === editingId);
      if (idx !== -1){
        list[idx] = {id: editingId, code, firstName, lastName, major, phone, email};
        saveStudents(list);
        msg.textContent = 'บันทึกการแก้ไขสำเร็จ ✓';
        msg.style.color = '#b5ffb0';
        setTimeout(()=> location.href='students.html', 600);
        return;
      }
    }

    list.push({id: uid(), code, firstName, lastName, major, phone, email});
    saveStudents(list);
    form.reset();
    msg.textContent = 'เพิ่มข้อมูลสำเร็จ ✓';
    msg.style.color = '#b5ffb0';
  });
})();

/* ---------- List Page ---------- */
(function initListPage(){
  const tbody = $('#tbody');
  const empty = $('#empty');
  if(!tbody) return;

  function render(filterText=''){
    const list = loadStudents();
    const q = filterText.toLowerCase().trim();
    const filtered = list.filter(s =>
      [s.code, s.firstName, s.lastName, s.major, s.phone, s.email]
      .join(' ').toLowerCase().includes(q)
    );

    tbody.innerHTML = '';
    if(filtered.length === 0){
      empty.style.display = '';
      return;
    } else empty.style.display = 'none';

    for (const s of filtered){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.code}</td>
        <td>${s.firstName} ${s.lastName}</td>
        <td>${s.major}</td>
        <td>${s.phone}</td>
        <td>${s.email}</td>
        <td class="center">
          <a class="btn" href="add-student.html?id=${encodeURIComponent(s.id)}">✏️ แก้ไข</a>
          <button class="btn danger" data-del="${s.id}">ลบ</button>
        </td>`;
      tbody.appendChild(tr);
    }
  }

  render();

  $('#search')?.addEventListener('input', e=> render(e.target.value));

  tbody.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-del]');
    if(!btn) return;
    const id = btn.dataset.del;
    if(confirm('ยืนยันการลบข้อมูลนี้หรือไม่?')){
      const list = loadStudents().filter(s => s.id !== id);
      saveStudents(list);
      render($('#search').value);
    }
  });

  $('#export-json')?.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(loadStudents(), null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students.json'; a.click();
    URL.revokeObjectURL(url);
  });

  $('#clear-all')?.addEventListener('click', ()=>{
    if(confirm('ลบข้อมูลทั้งหมดในระบบ (localStorage)?')){
      saveStudents([]); render('');
    }
  });
})();

/* ---------- Popup Welcome ---------- */
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('welcomeModal');
  const closeBtn = document.getElementById('closeModal');
  if (modal) modal.style.display = 'flex';

  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });
});
