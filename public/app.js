const state = { specs: [], status: 'all', category: 'all', search: '' };
const elements = {
  list: document.querySelector('#specList'), modal: document.querySelector('#specModal'),
  form: document.querySelector('#specForm'), formError: document.querySelector('#formError'),
  toast: document.querySelector('#toast'), sidebar: document.querySelector('#sidebar')
};
const categoryMeta = {
  자격증: { icon: '▣', label: 'CERTIFICATE' }, 어학: { icon: 'A', label: 'LANGUAGE' },
  프로젝트: { icon: '◆', label: 'PROJECT' }, 교육: { icon: '▤', label: 'EDUCATION' }, 수상: { icon: '★', label: 'AWARD' }
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
function formatDate(date) {
  if (!date) return '목표일 미정';
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`));
}
async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || '요청을 처리하지 못했습니다.');
  return result;
}

function renderSummary() {
  const total = state.specs.length;
  const completed = state.specs.filter((spec) => spec.status === '완료').length;
  const ongoing = state.specs.filter((spec) => spec.status === '진행 중').length;
  const planned = state.specs.filter((spec) => spec.status === '계획').length;
  const progress = total ? Math.round(state.specs.reduce((sum, spec) => sum + Number(spec.progress), 0) / total) : 0;
  document.querySelector('#completedCount').textContent = completed;
  document.querySelector('#ongoingCount').textContent = ongoing;
  document.querySelector('#plannedCount').textContent = planned;
  document.querySelector('#totalCount').textContent = total;
  document.querySelector('#navCount').textContent = total;
  document.querySelector('#allBadge').textContent = total;
  document.querySelector('#heroProgress').textContent = `${progress}%`;
  document.querySelector('#heroProgressRing').style.strokeDashoffset = 314.16 * (1 - progress / 100);
}

function renderList() {
  const filtered = state.specs.filter((spec) => {
    const query = state.search.toLocaleLowerCase('ko');
    return (state.status === 'all' || spec.status === state.status) &&
      (state.category === 'all' || spec.category === state.category) &&
      (!query || `${spec.title} ${spec.note}`.toLocaleLowerCase('ko').includes(query));
  });
  if (!filtered.length) {
    elements.list.innerHTML = '<div class="empty-state"><strong>조건에 맞는 스펙이 없어요.</strong>검색어나 필터를 바꾸거나 새 스펙을 추가해 보세요.</div>';
    return;
  }
  elements.list.innerHTML = filtered.map((spec) => {
    const meta = categoryMeta[spec.category] || { icon: '•', label: 'ETC' };
    return `<article class="spec-item" data-id="${escapeHtml(spec.id)}">
      <div class="spec-title-cell"><div class="category-icon">${meta.icon}</div><div><strong>${escapeHtml(spec.title)}</strong><small>${meta.label} · ${escapeHtml(spec.note || '메모 없음')}</small></div></div>
      <select class="status-select" data-status="${escapeHtml(spec.status)}" aria-label="${escapeHtml(spec.title)} 상태 변경">${['계획', '진행 중', '완료'].map((status) => `<option ${status === spec.status ? 'selected' : ''}>${status}</option>`).join('')}</select>
      <div class="progress-cell"><div class="progress-bar"><i style="width:${Number(spec.progress)}%"></i></div><span>${Number(spec.progress)}%</span></div>
      <div class="due-date"><strong>목표일</strong>${formatDate(spec.dueDate)}</div>
      <button class="delete-button" type="button" aria-label="${escapeHtml(spec.title)} 삭제">×</button></article>`;
  }).join('');
}
function render() { renderSummary(); renderList(); }
function showToast(message) {
  elements.toast.textContent = message; elements.toast.classList.add('show'); clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove('show'), 2200);
}
function setModal(open) {
  elements.modal.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  if (open) setTimeout(() => elements.form.elements.title.focus(), 50);
  else { elements.form.reset(); elements.formError.textContent = ''; }
}
async function loadSpecs() {
  try { state.specs = await request('/api/specs'); render(); }
  catch (error) { elements.list.innerHTML = `<div class="empty-state"><strong>데이터를 불러오지 못했습니다.</strong>${escapeHtml(error.message)}</div>`; }
}

document.querySelectorAll('[data-open-modal]').forEach((button) => button.addEventListener('click', () => setModal(true)));
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => setModal(false)));
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) setModal(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !elements.modal.hidden) setModal(false); });
document.querySelectorAll('.filter-tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-tab').forEach((tab) => tab.classList.remove('active')); button.classList.add('active');
  state.status = button.dataset.status; renderList();
}));
document.querySelector('#categoryFilter').addEventListener('change', (event) => { state.category = event.target.value; renderList(); });
document.querySelector('#searchInput').addEventListener('input', (event) => { state.search = event.target.value.trim(); renderList(); });
document.querySelector('#menuButton').addEventListener('click', () => elements.sidebar.classList.toggle('open'));
document.querySelectorAll('.nav-item').forEach((link) => link.addEventListener('click', () => elements.sidebar.classList.remove('open')));

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault(); elements.formError.textContent = '';
  const submitButton = elements.form.querySelector('[type="submit"]'); submitButton.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(elements.form)); values.progress = Number(values.progress);
    const spec = await request('/api/specs', { method: 'POST', body: JSON.stringify(values) });
    state.specs.unshift(spec); render(); setModal(false); showToast('새 스펙을 추가했습니다.');
  } catch (error) { elements.formError.textContent = error.message; }
  finally { submitButton.disabled = false; }
});

elements.list.addEventListener('change', async (event) => {
  if (!event.target.matches('.status-select')) return;
  const spec = state.specs.find((entry) => entry.id === event.target.closest('.spec-item').dataset.id);
  const previousStatus = spec.status;
  try {
    const update = { status: event.target.value }; if (update.status === '완료') update.progress = 100;
    Object.assign(spec, await request(`/api/specs/${encodeURIComponent(spec.id)}`, { method: 'PATCH', body: JSON.stringify(update) }));
    render(); showToast('상태를 변경했습니다.');
  } catch (error) { event.target.value = previousStatus; showToast(error.message); }
});

elements.list.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-button'); if (!button) return;
  const spec = state.specs.find((entry) => entry.id === button.closest('.spec-item').dataset.id);
  if (!window.confirm(`“${spec.title}” 항목을 삭제할까요?`)) return;
  try {
    await request(`/api/specs/${encodeURIComponent(spec.id)}`, { method: 'DELETE' });
    state.specs = state.specs.filter((entry) => entry.id !== spec.id); render(); showToast('스펙을 삭제했습니다.');
  } catch (error) { showToast(error.message); }
});

loadSpecs();
