
// Shared logic for index.html & admin.html
const STORAGE_KEY = 'svc_data_v1';

function defaultData(){
  return {
    services:[
      {id:1,name:'Instagram Followers',price:1200,accounts:['https://instagram.com/sample1','https://instagram.com/sample2']},
      {id:2,name:'TikTok Likes',price:900,accounts:['https://tiktok.com/@sampleA','https://tiktok.com/@sampleB']}
    ],
    paymentInfo:'Bank: Zenith Bank\nAcct name: John Doe\nAcct number: 1234567890',
    waLink:'https://wa.me/2348012345678'
  }
}

function readData(){ try{ const raw = localStorage.getItem(STORAGE_KEY); if(!raw) return defaultData(); return JSON.parse(raw)}catch(e){return defaultData()} }
function writeData(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

/* ------------------ CUSTOMER RENDER ------------------ */
function renderServicesCustomer(){
  const data = readData();
  const grid = document.getElementById('servicesGrid'); if(!grid) return;
  grid.innerHTML = '';
  data.services.forEach(s=>{
    const wrap = document.createElement('div'); wrap.className='card';
    const btn = document.createElement('button'); btn.className='service-btn';
    btn.innerHTML = `<span class="title">${escapeHtml(s.name)}</span><span class="price">₦${escapeHtml(String(s.price))}</span>`;
    btn.addEventListener('click', ()=> openModalForService(s.id));
    wrap.appendChild(btn); grid.appendChild(wrap);
  });
}

/* ------------------ MODAL & PAYMENT FLOW ------------------ */
function openModalForService(id) {
  const data = readData();
  const svc = data.services.find(x => x.id === id);
  if (!svc) return alert('Service not found');

  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const sub = document.getElementById('modalSub');
  const acctList = document.getElementById('acctList');

  title.textContent = svc.name;
  sub.textContent = `(Price: ₦${svc.price}) Tap any link below to preview before paying.`;

  acctList.innerHTML = '';

  // ✅ Show clickable links immediately
  svc.accounts.forEach((a, idx) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a;
    link.textContent = a;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "clickable-link";
    li.appendChild(link);
    acctList.appendChild(li);
  });

  // Buttons
  const makeBtn = document.getElementById('makePayment');
  const paidBtn = document.getElementById('paidBtn');
  makeBtn.style.display = 'inline-block';
  paidBtn.style.display = 'none';
  makeBtn.disabled = false;
  paidBtn.disabled = false;

  makeBtn.onclick = function () {
    const dataNow = readData();
    const info = document.createElement('div');
    info.className = 'card';
    info.style.marginTop = '12px';
    info.innerHTML = `<pre style="white-space:pre-wrap;margin:0">${escapeHtml(dataNow.paymentInfo || 'No payment info set')}</pre>`;
    acctList.parentElement.insertBefore(info, acctList.nextSibling);

    makeBtn.style.display = 'none';
    paidBtn.style.display = 'inline-block';
    paidBtn.disabled = true;

    let secs = 30;
    paidBtn.textContent = 'Please wait ' + secs + 's';
    const t = setInterval(() => {
      secs--;
      if (secs > 0) {
        paidBtn.textContent = 'Please wait ' + secs + 's';
      } else {
        clearInterval(t);
        paidBtn.textContent = "I've Paid";
        paidBtn.disabled = false;
      }
    }, 1000);

    paidBtn.onclick = function () {
      const d = readData();
      if (!d.waLink) return alert('Admin WhatsApp link not set');
      window.open(d.waLink, '_blank');
    };
  };

  document.getElementById('closeModal').onclick = closeModal;
  modal.style.display = 'flex';
}

function closeModal(){ const modal = document.getElementById('modal'); if(modal) { modal.style.display='none'; const acctList = document.getElementById('acctList'); acctList && (acctList.innerHTML=''); const info = acctList && acctList.parentElement.querySelector('.card'); if(info) info.remove(); } }

/* ------------------ ADMIN RENDER & CRUD ------------------ */
function populateAdminList(){
  const data = readData(); const list = document.getElementById('adminServicesList'); if(!list) return;
  list.innerHTML='';
  data.services.forEach(s=>{
    const row = document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.marginBottom='8px';
    row.innerHTML = `<div><strong>${escapeHtml(s.name)}</strong><div class="muted small">₦${escapeHtml(String(s.price))} — ${s.accounts.length} accounts</div></div>`;
    const controls = document.createElement('div');
    const edit = document.createElement('button'); edit.className='btn small'; edit.textContent='Edit'; edit.style.marginRight='8px';
    edit.onclick = ()=>{ const newName = prompt('Service name', s.name); if(!newName) return; const newPrice = prompt('Price (₦)', s.price); const newAccounts = prompt('Accounts (comma separated)', s.accounts.join(', ')); s.name=newName; s.price=Number(newPrice)||0; s.accounts = newAccounts ? newAccounts.split(',').map(x=>x.trim()).filter(Boolean):[]; writeData(data); populateAdminList(); renderServicesCustomer(); }
    const del = document.createElement('button'); del.className='btn small ghost'; del.textContent='Delete'; del.onclick = ()=>{ if(!confirm('Delete this service?')) return; data.services = data.services.filter(x=>x.id!==s.id); writeData(data); populateAdminList(); renderServicesCustomer(); }
    controls.appendChild(edit); controls.appendChild(del); row.appendChild(controls); list.appendChild(row);
  });
}

function wireAdminActions(){
  const addBtn = document.getElementById('addSvc'); if(addBtn){ addBtn.onclick = ()=>{
    const name = document.getElementById('svcName').value.trim(); const price = Number(document.getElementById('svcPrice').value)||0; const accountsRaw = document.getElementById('svcAccounts').value.trim(); if(!name) return alert('Service name required');
    const accounts = accountsRaw ? accountsRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const data = readData(); const id = Date.now(); data.services.push({id,name,price,accounts}); writeData(data); document.getElementById('svcName').value=''; document.getElementById('svcPrice').value=''; document.getElementById('svcAccounts').value=''; populateAdminList(); renderServicesCustomer(); alert('Service added'); }}

  const saveContact = document.getElementById('saveContact'); if(saveContact){ saveContact.onclick = ()=>{ const data = readData(); data.paymentInfo = document.getElementById('paymentInfo').value; data.waLink = document.getElementById('waLink').value.trim(); writeData(data); alert('Saved'); } }
}

/* ------------------ Utilities & init ------------------ */
function escapeHtml(str){ return String(str||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function initCustomerPage(){ renderServicesCustomer();
  // modal close by clicking outside
  const modal = document.getElementById('modal'); modal && modal.addEventListener('click',(e)=>{ if(e.target === modal) closeModal(); });
}

function initAdminPage(){ const data = readData(); document.getElementById('paymentInfo').value = data.paymentInfo || ''; document.getElementById('waLink').value = data.waLink || ''; populateAdminList(); wireAdminActions(); }

// Auto-detect which page
if(typeof window !== 'undefined'){
  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('servicesGrid')) initCustomerPage();
    if(document.getElementById('adminServicesList')) initAdminPage();
  });
}