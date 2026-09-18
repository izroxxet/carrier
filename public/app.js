const state = { activities: [], category: 'all' };
const elements = {
  grid: document.querySelector('#activityGrid'),
  modal: document.querySelector('#activityModal'),
  detailModal: document.querySelector('#detailModal'),
  detailContent: document.querySelector('#detailContent'),
  form: document.querySelector('#activityForm'),
  categorySelect: document.querySelector('#categorySelect'),
  dynamicFields: document.querySelector('#dynamicFields'),
  formError: document.querySelector('#formError'),
  toast: document.querySelector('#toast'),
  sidebar: document.querySelector('#sidebar')
};

const categoryMeta = {
  프로젝트: { symbol: '</>', subtitle: 'PROJECT' },
  자격증: { symbol: 'CERT', subtitle: 'CERTIFICATE' },
  대외활동: { symbol: 'ACT', subtitle: 'EXTERNAL ACTIVITY' },
  논문: { symbol: 'DOC', subtitle: 'PAPER' },
  어학연수: { symbol: 'A+', subtitle: 'LANGUAGE PROGRAM' },
  멘토링: { symbol: '1:1', subtitle: 'MENTORING' },
  연락처: { symbol: 'CARD', subtitle: 'CONTACT' }
};

const detailLabels = {
  classification: '분류', date: '프로젝트 날짜', award: '수상', activities: '활동 내용',
  githubRepository: 'GitHub 저장소', githubUsername: 'GitHub 작성자', acquiredDate: '취득일',
  issuer: '발급기관', evidenceName: '증빙자료', startDate: '시작일', endDate: '종료일',
  role: '역할', organization: '기관/단체', outputType: '결과물 유형', outputTitle: '결과물',
  outputLink: '결과물 링크', publishedDate: '발행일', journal: '학회/저널', paperLink: '논문 링크',
  paperFileName: '논문 자료', region: '지역', institution: '기관', mentoringRole: '참여 역할',
  education: '교육 내용', company: '회사/소속', position: '직함', phone: '전화번호',
  email: '이메일', memo: '메모', cardFileName: '명함 이미지'
};

const fieldTemplates = {
  프로젝트: `
    <div class="form-grid">
      <label class="field full"><span>프로젝트 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="프로젝트 이름을 입력하세요" /></label>
      <label class="field"><span>분류</span><select data-detail name="classification"><option value="">선택</option><option>개인 프로젝트</option><option>팀 프로젝트</option><option>공모전</option><option>학업 프로젝트</option><option>오픈소스</option></select></label>
      <label class="field"><span>날짜 <b>*</b></span><input data-detail name="date" type="date" required /></label>
      <label class="field full"><span>수상 내역</span><input data-detail name="award" placeholder="예: 대상, 우수상 (없으면 비워두세요)" /></label>
      <label class="field full"><span>주요 활동 <b>*</b></span><textarea data-detail name="activities" required placeholder="담당한 역할과 구현 내용을 적어주세요."></textarea></label>
      <label class="field"><span>GitHub 저장소</span><input data-detail name="githubRepository" type="url" placeholder="https://github.com/owner/repo" /></label>
      <label class="field"><span>내 GitHub 아이디</span><input data-detail name="githubUsername" placeholder="커밋 작성자 아이디" /></label>
      <section class="ai-panel">
        <div class="ai-panel-header"><div><strong>✦ GitHub 커밋 AI 분석</strong><small>내 커밋의 변경 파일과 코드를 중심으로 기여를 분석합니다.</small></div><button class="analyze-button" id="analyzeButton" type="button">AI로 분석하기</button></div>
        <input data-detail name="aiAnalysis" id="aiAnalysis" type="hidden" />
        <div class="ai-result" id="aiResult"></div>
      </section>
    </div>`,
  자격증: `
    <div class="form-grid">
      <label class="field full"><span>자격증 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="예: 정보처리기사" /></label>
      <label class="field"><span>취득일 <b>*</b></span><input data-detail name="acquiredDate" type="date" required /></label>
      <label class="field"><span>발급기관</span><input data-detail name="issuer" placeholder="발급기관" /></label>
      <label class="field full"><span>증빙자료</span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" data-file-key="evidenceData" data-name-key="evidenceName" /></label>
    </div>`,
  대외활동: `
    <div class="form-grid">
      <label class="field full"><span>대외활동 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="활동 이름을 입력하세요" /></label>
      <label class="field"><span>기관/단체</span><input data-detail name="organization" placeholder="주관 기관" /></label>
      <label class="field"><span>역할 <b>*</b></span><input data-detail name="role" required placeholder="예: 백엔드 개발자" /></label>
      <label class="field"><span>시작일 <b>*</b></span><input data-detail name="startDate" type="date" required /></label>
      <label class="field"><span>종료일 <b>*</b></span><input data-detail name="endDate" type="date" required /></label>
      <label class="field full"><span>활동 내용</span><textarea data-detail name="activities" placeholder="담당 업무와 배운 점을 적어주세요."></textarea></label>
      <section class="output-box" id="outputBox">
        <label class="output-check"><input data-detail name="createOutput" id="createOutput" type="checkbox" value="true" /> 이 활동의 결과물도 별도 스펙으로 등록</label>
        <div class="output-fields">
          <label class="field"><span>결과물 유형</span><select data-detail name="outputType"><option>프로젝트</option><option>논문</option></select></label>
          <label class="field"><span>결과물 이름</span><input data-detail name="outputTitle" placeholder="결과물 제목" /></label>
          <label class="field full"><span>결과물 링크</span><input data-detail name="outputLink" type="url" placeholder="GitHub 또는 논문 링크" /></label>
        </div>
      </section>
    </div>`,
  논문: `
    <div class="form-grid">
      <label class="field full"><span>논문 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="논문 제목을 입력하세요" /></label>
      <label class="field"><span>발행일</span><input data-detail name="publishedDate" type="date" /></label>
      <label class="field"><span>학회/저널</span><input data-detail name="journal" placeholder="학회 또는 저널명" /></label>
      <label class="field full"><span>논문 링크</span><input data-detail name="paperLink" type="url" placeholder="https://..." /></label>
      <label class="field full"><span>논문 자료</span><input type="file" accept="application/pdf" data-file-key="paperFileData" data-name-key="paperFileName" /></label>
    </div>`,
  어학연수: `
    <div class="form-grid">
      <label class="field full"><span>프로그램 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="어학연수 프로그램 이름" /></label>
      <label class="field"><span>지역 <b>*</b></span><input data-detail name="region" required placeholder="예: 캐나다 토론토" /></label>
      <label class="field"><span>교육기관</span><input data-detail name="institution" placeholder="학교 또는 기관" /></label>
      <label class="field"><span>시작일 <b>*</b></span><input data-detail name="startDate" type="date" required /></label>
      <label class="field"><span>종료일 <b>*</b></span><input data-detail name="endDate" type="date" required /></label>
      <label class="field full"><span>활동 내용</span><textarea data-detail name="activities" placeholder="수업, 현지 프로젝트, 문화 활동 등을 적어주세요."></textarea></label>
    </div>`,
  멘토링: `
    <div class="form-grid">
      <label class="field full"><span>멘토링 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="멘토링 프로그램 이름" /></label>
      <label class="field"><span>참여 역할 <b>*</b></span><select data-detail name="mentoringRole" required><option value="">선택</option><option>멘토</option><option>멘티</option></select></label>
      <label class="field"><span>기관/단체</span><input data-detail name="organization" placeholder="운영 기관" /></label>
      <label class="field"><span>시작일</span><input data-detail name="startDate" type="date" /></label>
      <label class="field"><span>종료일</span><input data-detail name="endDate" type="date" /></label>
      <label class="field full"><span>교육 내용 <b>*</b></span><textarea data-detail name="education" required placeholder="교육하거나 배운 내용을 적어주세요."></textarea></label>
    </div>`,
  연락처: `
    <div class="form-grid">
      <label class="field full"><span>이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="명함 소유자 이름" /></label>
      <label class="field"><span>회사/소속</span><input data-detail name="company" placeholder="회사 또는 소속" /></label>
      <label class="field"><span>직함</span><input data-detail name="position" placeholder="직책 또는 직함" /></label>
      <label class="field"><span>전화번호</span><input data-detail name="phone" type="tel" placeholder="010-0000-0000" /></label>
      <label class="field"><span>이메일</span><input data-detail name="email" type="email" placeholder="name@example.com" /></label>
      <label class="field full"><span>메모</span><textarea data-detail name="memo" placeholder="만난 장소나 후속 연락 내용을 적어주세요."></textarea></label>
      <label class="field full"><span>명함 이미지</span><input type="file" accept="image/png,image/jpeg,image/webp" data-file-key="cardFileData" data-name-key="cardFileName" /></label>
    </div>`
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
function safeExternalUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function safeAttachment(value) {
  return /^data:(application\/pdf|image\/(png|jpeg|webp));base64,[a-z0-9+/=]+$/i.test(value || '') ? value : '';
}
function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
function period(details) {
  if (details.startDate || details.endDate) return [formatDate(details.startDate), formatDate(details.endDate)].filter(Boolean).join(' – ');
  return formatDate(details.date || details.acquiredDate || details.publishedDate);
}
async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || '요청을 처리하지 못했습니다.');
  return result;
}

function cardContent(activity) {
  const d = activity.details || {};
  const base = { subtitle: '', date: period(d), description: '', tags: [], image: '' };
  if (activity.category === '프로젝트') return { ...base, subtitle: d.classification, description: d.activities, tags: [d.award, d.githubUsername && `@${d.githubUsername}`, d.aiAnalysis && 'AI 분석 완료'] };
  if (activity.category === '자격증') return { ...base, subtitle: d.issuer, description: d.evidenceName ? '증빙자료가 등록되어 있습니다.' : '취득한 자격증 기록', tags: [d.evidenceName && '증빙자료'] };
  if (activity.category === '대외활동') return { ...base, subtitle: d.organization, description: d.activities, tags: [d.role, d.outputTitle] };
  if (activity.category === '논문') return { ...base, subtitle: d.journal, description: d.paperFileName ? '논문 자료가 등록되어 있습니다.' : '연구 및 논문 기록', tags: [d.paperLink && '논문 링크', d.paperFileName && 'PDF'] };
  if (activity.category === '어학연수') return { ...base, subtitle: d.institution, description: d.activities, tags: [d.region] };
  if (activity.category === '멘토링') return { ...base, subtitle: d.organization, description: d.education, tags: [d.mentoringRole] };
  return { ...base, subtitle: [d.company, d.position].filter(Boolean).join(' · '), description: d.memo || d.email || d.phone, tags: [d.phone, d.email], image: safeAttachment(d.cardFileData) };
}

function renderSummary() {
  document.querySelector('#totalCount').textContent = state.activities.length;
  document.querySelector('#projectCount').textContent = state.activities.filter((item) => item.category === '프로젝트').length;
  document.querySelector('#certificateCount').textContent = state.activities.filter((item) => item.category === '자격증').length;
  document.querySelector('#paperCount').textContent = state.activities.filter((item) => item.category === '논문').length;
}

function renderActivities() {
  const activities = [...state.activities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((item) => state.category === 'all' || item.category === state.category);
  if (!activities.length) {
    elements.grid.innerHTML = '<div class="empty-state"><strong>아직 등록된 활동이 없어요.</strong>새로운 활동을 추가해 커리어 기록을 시작해 보세요.</div>';
    return;
  }
  elements.grid.innerHTML = activities.map((activity) => {
    const meta = categoryMeta[activity.category] || { symbol: '•', subtitle: 'ACTIVITY' };
    const content = cardContent(activity);
    const symbol = content.image ? `<div class="card-symbol has-image"><img src="${content.image}" alt="명함 미리보기" /></div>` : `<div class="card-symbol">${meta.symbol}</div>`;
    return `<article class="activity-card" data-id="${escapeHtml(activity.id)}" data-category="${escapeHtml(activity.category)}">
      <div class="card-top"><span class="category-badge">${escapeHtml(activity.category)}</span>${symbol}</div>
      <h3>${escapeHtml(activity.title)}</h3><p class="card-subtitle">${escapeHtml(content.subtitle || meta.subtitle)}</p>
      <p class="card-date">${escapeHtml(content.date || `등록 ${new Date(activity.createdAt).toLocaleDateString('ko-KR')}`)}</p>
      <p class="card-description">${escapeHtml(content.description || '상세 내용을 확인해 보세요.')}</p>
      <div class="card-tags">${content.tags.filter(Boolean).slice(0, 3).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="card-actions"><button class="view" type="button" aria-label="상세 보기">↗</button><button class="delete" type="button" aria-label="삭제">×</button></div>
    </article>`;
  }).join('');
}
function render() { renderSummary(); renderActivities(); }

function setCategory(category) {
  state.category = category;
  document.querySelectorAll('.category-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.category === category));
  renderActivities();
  document.querySelector('#activities').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function showToast(message) {
  elements.toast.textContent = message; elements.toast.classList.add('show'); clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove('show'), 2300);
}
function setModal(open, category = '') {
  elements.modal.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    elements.categorySelect.value = category;
    renderFields(category);
    setTimeout(() => (elements.form.querySelector('input[name="title"]') || elements.categorySelect).focus(), 50);
  } else {
    elements.form.reset(); renderFields(''); elements.formError.textContent = '';
  }
}
function renderFields(category) {
  elements.dynamicFields.innerHTML = fieldTemplates[category] || '<div class="form-placeholder"><span>＋</span><p>분류를 선택하면 필요한 입력 항목이 나타납니다.</p></div>';
}

function readFile(file) {
  if (!file) return Promise.resolve('');
  if (file.size > 2 * 1024 * 1024) return Promise.reject(new Error('첨부파일은 2MB 이하만 등록할 수 있습니다.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('첨부파일을 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

async function formPayload() {
  const title = elements.form.querySelector('input[name="title"]')?.value.trim();
  const details = {};
  elements.dynamicFields.querySelectorAll('[data-detail]').forEach((input) => {
    details[input.name] = input.type === 'checkbox' ? (input.checked ? input.value : '') : input.value.trim();
  });
  for (const input of elements.dynamicFields.querySelectorAll('[data-file-key]')) {
    const file = input.files[0];
    if (file) {
      details[input.dataset.fileKey] = await readFile(file);
      details[input.dataset.nameKey] = file.name;
    }
  }
  return { category: elements.categorySelect.value, title, details };
}

async function analyzeCommits() {
  const repositoryUrl = elements.form.elements.githubRepository?.value.trim();
  const username = elements.form.elements.githubUsername?.value.trim();
  const button = document.querySelector('#analyzeButton');
  const resultBox = document.querySelector('#aiResult');
  if (!repositoryUrl || !username) {
    elements.formError.textContent = 'GitHub 저장소 주소와 내 GitHub 아이디를 먼저 입력해 주세요.';
    return;
  }
  button.disabled = true; button.textContent = '커밋 분석 중…'; elements.formError.textContent = '';
  try {
    const result = await request('/api/analyze-github', { method: 'POST', body: JSON.stringify({ repositoryUrl, username }) });
    document.querySelector('#aiAnalysis').value = result.analysis;
    resultBox.textContent = `${result.repository} · 최근 ${result.commitCount}개 커밋 분석\n\n${result.analysis}`;
    resultBox.classList.add('visible');
    showToast('GitHub 커밋 분석을 완료했습니다.');
  } catch (error) {
    elements.formError.textContent = error.message;
  } finally {
    button.disabled = false; button.textContent = '다시 분석하기';
  }
}

function detailValue(key, value, details) {
  const linkKeys = ['githubRepository', 'outputLink', 'paperLink'];
  if (linkKeys.includes(key)) {
    const href = safeExternalUrl(value);
    return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)} ↗</a>` : escapeHtml(value);
  }
  if (['date', 'acquiredDate', 'publishedDate', 'startDate', 'endDate'].includes(key)) return escapeHtml(formatDate(value));
  const attachments = { evidenceName: 'evidenceData', paperFileName: 'paperFileData', cardFileName: 'cardFileData' };
  if (attachments[key]) {
    const href = safeAttachment(details[attachments[key]]);
    return href ? `<a href="${href}" download="${escapeHtml(value)}">${escapeHtml(value)} 다운로드</a>` : escapeHtml(value);
  }
  return escapeHtml(value);
}

function openDetail(activity) {
  const details = activity.details || {};
  const hidden = new Set(['aiAnalysis', 'evidenceData', 'paperFileData', 'cardFileData', 'createOutput']);
  const rows = Object.entries(details).filter(([key, value]) => value && !hidden.has(key)).map(([key, value]) => {
    const wide = ['activities', 'education', 'memo'].includes(key) ? ' wide' : '';
    return `<div class="detail-row${wide}"><span>${escapeHtml(detailLabels[key] || key)}</span><strong>${detailValue(key, value, details)}</strong></div>`;
  }).join('');
  const analysis = details.aiAnalysis ? `<section class="analysis-detail"><h3>✦ GitHub 커밋 AI 분석</h3><p>${escapeHtml(details.aiAnalysis)}</p></section>` : '';
  elements.detailContent.innerHTML = `<span class="detail-category">${escapeHtml(activity.category)}</span><h2 id="detailTitle">${escapeHtml(activity.title)}</h2><span class="detail-created">${new Date(activity.createdAt).toLocaleString('ko-KR')} 등록</span><div class="detail-list">${rows}${analysis}</div>`;
  elements.detailModal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDetail() { elements.detailModal.hidden = true; document.body.style.overflow = ''; }

async function loadActivities() {
  try { state.activities = await request('/api/specs'); render(); }
  catch (error) { elements.grid.innerHTML = `<div class="empty-state"><strong>데이터를 불러오지 못했습니다.</strong>${escapeHtml(error.message)}</div>`; }
}

document.querySelectorAll('[data-open-modal]').forEach((button) => button.addEventListener('click', () => setModal(true)));
document.querySelector('[data-open-contact]').addEventListener('click', () => setModal(true, '연락처'));
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => setModal(false)));
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) setModal(false); });
elements.categorySelect.addEventListener('change', (event) => renderFields(event.target.value));
elements.dynamicFields.addEventListener('change', (event) => {
  if (event.target.id === 'createOutput') document.querySelector('#outputBox').classList.toggle('enabled', event.target.checked);
});
elements.dynamicFields.addEventListener('click', (event) => { if (event.target.id === 'analyzeButton') analyzeCommits(); });

document.querySelectorAll('.category-tab').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.category)));
document.querySelectorAll('.nav-item[data-filter]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active')); button.classList.add('active');
  setCategory(button.dataset.filter); elements.sidebar.classList.remove('open');
}));
document.querySelector('[data-filter-shortcut]').addEventListener('click', () => setCategory('all'));
document.querySelector('#menuButton').addEventListener('click', () => elements.sidebar.classList.toggle('open'));

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault(); elements.formError.textContent = '';
  const submit = elements.form.querySelector('[type="submit"]'); submit.disabled = true;
  try {
    const payload = await formPayload();
    if (!payload.category) throw new Error('활동 분류를 선택해 주세요.');
    const result = await request('/api/specs', { method: 'POST', body: JSON.stringify(payload) });
    state.activities.unshift(...result.items); render(); setModal(false);
    showToast(result.items.length > 1 ? '활동과 결과물 스펙을 함께 등록했습니다.' : '새로운 활동을 등록했습니다.');
  } catch (error) { elements.formError.textContent = error.message; }
  finally { submit.disabled = false; }
});

elements.grid.addEventListener('click', async (event) => {
  const card = event.target.closest('.activity-card');
  if (!card) return;
  const activity = state.activities.find((item) => item.id === card.dataset.id);
  if (event.target.closest('.delete')) {
    if (!window.confirm(`“${activity.title}” 기록을 삭제할까요?`)) return;
    try {
      await request(`/api/specs/${encodeURIComponent(activity.id)}`, { method: 'DELETE' });
      state.activities = state.activities.filter((item) => item.id !== activity.id); render(); showToast('활동을 삭제했습니다.');
    } catch (error) { showToast(error.message); }
    return;
  }
  if (event.target.closest('.view') || !event.target.closest('.card-actions')) openDetail(activity);
});

document.querySelector('#closeDetail').addEventListener('click', closeDetail);
elements.detailModal.addEventListener('click', (event) => { if (event.target === elements.detailModal) closeDetail(); });
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!elements.detailModal.hidden) closeDetail(); else if (!elements.modal.hidden) setModal(false);
});

loadActivities();
