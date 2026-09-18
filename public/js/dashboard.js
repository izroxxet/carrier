const { categoryMeta, escapeHtml, safeExternalUrl, safeAttachment, formatDate, period, request, showToast, readFile } = window.Carrier;
const state = { activities: [], category: 'all' };
const elements = {
  grid: document.querySelector('#activityGrid'), modal: document.querySelector('#activityModal'),
  detailModal: document.querySelector('#detailModal'), detailContent: document.querySelector('#detailContent'),
  form: document.querySelector('#activityForm'), categorySelect: document.querySelector('#categorySelect'),
  dynamicFields: document.querySelector('#dynamicFields'), formError: document.querySelector('#formError')
};

const detailLabels = {
  acquiredDate: '취득일', issuer: '발급기관', evidenceName: '증빙자료', startDate: '시작일', endDate: '종료일',
  role: '역할', activities: '활동 내용', organization: '기관/단체', award: '수상 내역', outputType: '결과물 유형', outputTitle: '결과물', outputLink: '결과물 링크',
  outputAward: '결과물 수상 내역', outputClassification: '프로젝트 분류', outputDate: '프로젝트 날짜', outputActivities: '프로젝트 주요 활동', outputGithubRepository: '프로젝트 GitHub', outputGithubUsername: '프로젝트 GitHub 아이디',
  outputPublishedDate: '논문 발행일', outputJournal: '학회/저널', outputPaperLink: '논문 결과물 링크', outputPaperFileName: '논문 결과물', publishedDate: '발행일', journal: '학회/저널', paperLink: '논문 링크',
  paperFileName: '논문 자료', region: '지역', institution: '기관', mentoringRole: '참여 역할', education: '교육 내용',
  company: '회사/소속', position: '직함', phone: '전화번호', email: '이메일', memo: '메모', cardFileName: '명함 이미지',
  evidenceImageName: '증빙자료', outputEvidenceImageName: '프로젝트 증빙자료'
};

const awardField = '<label class="field full"><span>수상 내역</span><input data-detail name="award" placeholder="예: 대상, 최우수상 (수상하지 않은 경우 비워두세요)" /></label>';
const evidenceImageField = '<label class="field full"><span>증빙자료 이미지</span><input type="file" accept="image/png,image/jpeg,image/webp" data-file-key="evidenceImageData" data-name-key="evidenceImageName" /></label>';

const fieldTemplates = {
  자격증: `<div class="form-grid">
    <label class="field full"><span>자격증 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="예: 정보처리기사" /></label>
    <label class="field"><span>취득일 <b>*</b></span><input data-detail name="acquiredDate" type="date" required /></label>
    <label class="field"><span>발급기관</span><input data-detail name="issuer" placeholder="발급기관" /></label>
    <label class="field full"><span>증빙자료</span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" data-file-key="evidenceData" data-name-key="evidenceName" /></label></div>`,
  대외활동: `<div class="form-grid">
    <label class="field full"><span>대외활동 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="활동 이름" /></label>
    <label class="field"><span>기관/단체</span><input data-detail name="organization" placeholder="주관 기관" /></label>
    <label class="field"><span>역할 <b>*</b></span><input data-detail name="role" required placeholder="예: 백엔드 개발자" /></label>
    <label class="field"><span>시작일 <b>*</b></span><input data-detail name="startDate" type="date" required /></label>
    <label class="field"><span>종료일 <b>*</b></span><input data-detail name="endDate" type="date" required /></label>
    <label class="field full"><span>활동 내용</span><textarea data-detail name="activities" placeholder="담당 업무와 배운 점"></textarea></label>
    ${awardField}
    ${evidenceImageField}
    <section class="output-box" id="outputBox"><label class="output-check"><input data-detail name="createOutput" id="createOutput" type="checkbox" value="true" /> 결과물도 별도 스펙으로 등록</label><div class="output-fields">
      <label class="field full"><span>결과물 유형</span><select data-detail name="outputType" id="outputType"><option>프로젝트</option><option>논문</option></select></label>
      <div class="output-specific-fields" id="outputSpecificFields"></div>
    </div></section></div>`,
  논문: `<div class="form-grid">
    <label class="field full"><span>논문 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="논문 제목" /></label>
    <label class="field"><span>발행일</span><input data-detail name="publishedDate" type="date" /></label>
    <label class="field"><span>학회/저널</span><input data-detail name="journal" placeholder="학회 또는 저널명" /></label>
    <label class="field full"><span>논문 링크</span><input data-detail name="paperLink" type="url" placeholder="https://..." /></label>
    <label class="field full"><span>논문 자료</span><input type="file" accept="application/pdf" data-file-key="paperFileData" data-name-key="paperFileName" /></label>
    ${awardField}</div>`,
  어학연수: `<div class="form-grid">
    <label class="field full"><span>프로그램 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="어학연수 프로그램" /></label>
    <label class="field"><span>지역 <b>*</b></span><input data-detail name="region" required placeholder="예: 캐나다 토론토" /></label>
    <label class="field"><span>교육기관</span><input data-detail name="institution" placeholder="학교 또는 기관" /></label>
    <label class="field"><span>시작일 <b>*</b></span><input data-detail name="startDate" type="date" required /></label>
    <label class="field"><span>종료일 <b>*</b></span><input data-detail name="endDate" type="date" required /></label>
    <label class="field full"><span>활동 내용</span><textarea data-detail name="activities" placeholder="수업, 현지 프로젝트, 문화 활동"></textarea></label>
    ${awardField}
    ${evidenceImageField}</div>`,
  멘토링: `<div class="form-grid">
    <label class="field full"><span>멘토링 이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="멘토링 프로그램" /></label>
    <label class="field"><span>참여 역할 <b>*</b></span><select data-detail name="mentoringRole" required><option value="">선택</option><option>멘토</option><option>멘티</option></select></label>
    <label class="field"><span>기관/단체</span><input data-detail name="organization" placeholder="운영 기관" /></label>
    <label class="field"><span>시작일</span><input data-detail name="startDate" type="date" /></label>
    <label class="field"><span>종료일</span><input data-detail name="endDate" type="date" /></label>
    <label class="field full"><span>교육 내용 <b>*</b></span><textarea data-detail name="education" required placeholder="교육하거나 배운 내용"></textarea></label>
    ${awardField}
    ${evidenceImageField}</div>`,
  연락처: `<div class="form-grid">
    <label class="field full"><span>이름 <b>*</b></span><input name="title" maxlength="100" required placeholder="명함 소유자 이름" /></label>
    <label class="field"><span>회사/소속</span><input data-detail name="company" placeholder="회사 또는 소속" /></label>
    <label class="field"><span>직함</span><input data-detail name="position" placeholder="직책 또는 직함" /></label>
    <label class="field"><span>전화번호</span><input data-detail name="phone" type="tel" placeholder="010-0000-0000" /></label>
    <label class="field"><span>이메일</span><input data-detail name="email" type="email" placeholder="name@example.com" /></label>
    <label class="field full"><span>메모</span><textarea data-detail name="memo" placeholder="만난 장소나 후속 연락 내용"></textarea></label>
    <label class="field full"><span>명함 이미지</span><input type="file" accept="image/png,image/jpeg,image/webp" data-file-key="cardFileData" data-name-key="cardFileName" /></label></div>`
};

function outputFieldsTemplate(type) {
  if (type === '논문') return `
    <label class="field full"><span>논문 이름 <b>*</b></span><input data-detail data-output-required name="outputTitle" maxlength="100" placeholder="논문 제목" /></label>
    <label class="field"><span>발행일</span><input data-detail name="outputPublishedDate" type="date" /></label>
    <label class="field"><span>학회/저널</span><input data-detail name="outputJournal" placeholder="학회 또는 저널명" /></label>
    <label class="field full"><span>논문 링크</span><input data-detail name="outputPaperLink" type="url" placeholder="https://..." /></label>
    <label class="field full"><span>논문 자료</span><input type="file" accept="application/pdf" data-file-key="outputPaperFileData" data-name-key="outputPaperFileName" /><small class="output-help">논문 링크 또는 PDF 파일 중 하나 이상을 등록해 주세요.</small></label>
    <label class="field full"><span>논문 수상 내역</span><input data-detail name="outputAward" placeholder="논문으로 받은 상이 있는 경우에만 입력" /></label>`;
  return `
    <label class="field full"><span>프로젝트 이름 <b>*</b></span><input data-detail data-output-required name="outputTitle" maxlength="100" placeholder="프로젝트 이름" /></label>
    <label class="field"><span>분류</span><select data-detail name="outputClassification"><option value="">선택</option><option>개인 프로젝트</option><option>팀 프로젝트</option><option>공모전</option><option>학업 프로젝트</option><option>오픈소스</option></select></label>
    <label class="field"><span>날짜 <b>*</b></span><input data-detail data-output-required name="outputDate" type="date" /></label>
    <label class="field full"><span>주요 활동 <b>*</b></span><textarea data-detail data-output-required name="outputActivities" placeholder="담당 역할과 구현 내용"></textarea></label>
    <label class="field"><span>GitHub 저장소 <b>*</b></span><input data-detail data-output-required name="outputGithubRepository" type="url" placeholder="https://github.com/owner/repo" /></label>
    <label class="field"><span>내 GitHub 아이디 <b>*</b></span><input data-detail data-output-required name="outputGithubUsername" placeholder="commit author username" /></label>
    <label class="field full"><span>프로젝트 수상 내역</span><input data-detail name="outputAward" placeholder="프로젝트로 받은 상이 있는 경우에만 입력" /></label>
    <label class="field full"><span>프로젝트 증빙자료 이미지</span><input type="file" accept="image/png,image/jpeg,image/webp" data-file-key="outputEvidenceImageData" data-name-key="outputEvidenceImageName" /></label>`;
}

function setOutputRequired(enabled) {
  elements.dynamicFields.querySelectorAll('[data-output-required]').forEach((input) => { input.required = enabled; });
}

function renderOutputSpecificFields(type = '프로젝트', enabled = false) {
  const container = elements.dynamicFields.querySelector('#outputSpecificFields');
  if (!container) return;
  container.innerHTML = outputFieldsTemplate(type);
  setOutputRequired(enabled);
}

function cardContent(activity) {
  const d = activity.details || {};
  const base = { subtitle: '', date: period(d), description: '', tags: [], image: '' };
  if (activity.category === '자격증') return { ...base, subtitle: d.issuer, description: d.evidenceName ? '증빙자료가 등록되어 있습니다.' : '취득한 자격증 기록', tags: [d.evidenceName && '증빙자료'] };
  if (activity.category === '대외활동') return { ...base, subtitle: d.organization, description: d.activities, tags: [d.role, d.outputTitle, d.evidenceImageName && '증빙자료'] };
  if (activity.category === '논문') return { ...base, subtitle: d.journal, description: d.paperFileName ? '논문 자료가 등록되어 있습니다.' : '연구 및 논문 기록', tags: [d.paperLink && '논문 링크', d.paperFileName && 'PDF'] };
  if (activity.category === '어학연수') return { ...base, subtitle: d.institution, description: d.activities, tags: [d.region, d.evidenceImageName && '증빙자료'] };
  if (activity.category === '멘토링') return { ...base, subtitle: d.organization, description: d.education, tags: [d.mentoringRole, d.evidenceImageName && '증빙자료'] };
  return { ...base, subtitle: [d.company, d.position].filter(Boolean).join(' · '), description: d.memo || d.email || d.phone, tags: [d.phone, d.email], image: safeAttachment(d.cardFileData) };
}

function renderSummary() {
  const count = (category) => state.activities.filter((item) => item.category === category).length;
  const values = { awardCount: state.activities.filter((item) => item.category !== '프로젝트' && Boolean(item.details?.award)).length, projectCount: count('프로젝트'), certificateCount: count('자격증'), externalCount: count('대외활동'), paperCount: count('논문'), languageCount: count('어학연수'), mentoringCount: count('멘토링'), contactCount: count('연락처') };
  Object.entries(values).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value; });
}

function renderActivities() {
  const activities = [...state.activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((item) => item.category !== '프로젝트')
    .filter((item) => state.category === 'all' || (state.category === '수상' ? Boolean(item.details?.award) : item.category === state.category));
  if (!activities.length) {
    elements.grid.innerHTML = '<div class="empty-state"><strong>등록된 활동이 없어요.</strong>새로운 활동을 추가해 커리어 기록을 시작해 보세요.</div>';
    return;
  }
  elements.grid.innerHTML = activities.map((activity) => {
    const meta = categoryMeta[activity.category] || { symbol: '📌', subtitle: 'ACTIVITY' };
    const content = cardContent(activity);
    const hasAward = Boolean(activity.details?.award);
    const symbol = content.image ? `<div class="card-symbol has-image"><img src="${content.image}" alt="명함 미리보기" /></div>` : `<div class="card-symbol">${meta.symbol}</div>`;
    return `<article class="activity-card${hasAward ? ' has-award' : ''}" data-id="${escapeHtml(activity.id)}" data-category="${escapeHtml(activity.category)}"><div class="card-top"><div class="card-badges"><span class="category-badge">${escapeHtml(activity.category)}</span>${hasAward ? '<span class="award-badge">🏆 수상</span>' : ''}</div>${symbol}</div><h3>${escapeHtml(activity.title)}</h3><p class="card-subtitle">${escapeHtml(content.subtitle || meta.subtitle)}</p><p class="card-date">${escapeHtml(content.date || `등록 ${new Date(activity.createdAt).toLocaleDateString('ko-KR')}`)}</p><p class="card-description">${escapeHtml(content.description || '상세 내용을 확인해 보세요.')}</p><div class="card-tags">${content.tags.filter(Boolean).slice(0, 3).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('')}</div><div class="card-actions"><button class="view" type="button" aria-label="상세 보기">👁️</button><button class="delete" type="button" aria-label="삭제">🗑️</button></div>${hasAward ? '<span class="award-ribbon">🏆 수상한 활동</span>' : ''}</article>`;
  }).join('');
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll('.category-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.category === category));
  renderActivities();
}
function renderFields(category) {
  elements.dynamicFields.innerHTML = fieldTemplates[category] || '<div class="form-placeholder"><span>🗂️</span><p>분류를 선택하면 필요한 입력 항목이 나타납니다.</p></div>';
  if (category === '대외활동') renderOutputSpecificFields('프로젝트', false);
}
function setModal(open, category = '') {
  elements.modal.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  if (open) { elements.categorySelect.value = category; renderFields(category); setTimeout(() => (elements.form.querySelector('input[name="title"]') || elements.categorySelect).focus(), 50); }
  else { elements.form.reset(); renderFields(''); elements.formError.textContent = ''; }
}
async function formPayload() {
  const details = {};
  elements.dynamicFields.querySelectorAll('[data-detail]').forEach((input) => { details[input.name] = input.type === 'checkbox' ? (input.checked ? input.value : '') : input.value.trim(); });
  for (const input of elements.dynamicFields.querySelectorAll('[data-file-key]')) {
    const file = input.files[0];
    if (file) { details[input.dataset.fileKey] = await readFile(file); details[input.dataset.nameKey] = file.name; }
  }
  return { category: elements.categorySelect.value, title: elements.form.querySelector('input[name="title"]')?.value.trim(), details };
}

function detailValue(key, value, details) {
  if (['outputLink', 'outputGithubRepository', 'outputPaperLink', 'paperLink'].includes(key)) { const href = safeExternalUrl(value); return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)} ↗</a>` : escapeHtml(value); }
  if (['acquiredDate', 'publishedDate', 'startDate', 'endDate', 'outputDate', 'outputPublishedDate'].includes(key)) return escapeHtml(formatDate(value));
  const attachments = { evidenceName: 'evidenceData', evidenceImageName: 'evidenceImageData', outputEvidenceImageName: 'outputEvidenceImageData', paperFileName: 'paperFileData', outputPaperFileName: 'outputPaperFileData', cardFileName: 'cardFileData' };
  if (attachments[key]) { const href = safeAttachment(details[attachments[key]]); return href ? `<a href="${href}" download="${escapeHtml(value)}">${escapeHtml(value)} 다운로드</a>` : escapeHtml(value); }
  return escapeHtml(value);
}
function openDetail(activity) {
  const details = activity.details || {};
  const hidden = new Set(['evidenceData', 'evidenceImageData', 'outputEvidenceImageData', 'paperFileData', 'outputPaperFileData', 'cardFileData', 'createOutput']);
  const rows = Object.entries(details).filter(([key, value]) => value && !hidden.has(key)).map(([key, value]) => `<div class="detail-row${['activities', 'education', 'memo', 'award', 'outputAward', 'outputActivities'].includes(key) ? ' wide' : ''}"><span>${escapeHtml(detailLabels[key] || key)}</span><strong>${detailValue(key, value, details)}</strong></div>`).join('');
  elements.detailContent.innerHTML = `<span class="detail-category">${escapeHtml(activity.category)}</span><h2 id="detailTitle">${escapeHtml(activity.title)}</h2><span class="detail-created">${new Date(activity.createdAt).toLocaleString('ko-KR')} 등록</span><div class="detail-list">${rows}</div>`;
  elements.detailModal.hidden = false; document.body.style.overflow = 'hidden';
}
function closeDetail() { elements.detailModal.hidden = true; document.body.style.overflow = ''; }

document.querySelectorAll('[data-open-modal]').forEach((button) => button.addEventListener('click', () => setModal(true)));
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => setModal(false)));
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) setModal(false); });
elements.categorySelect.addEventListener('change', (event) => renderFields(event.target.value));
elements.dynamicFields.addEventListener('change', (event) => {
  if (event.target.id === 'createOutput') {
    document.querySelector('#outputBox').classList.toggle('enabled', event.target.checked);
    setOutputRequired(event.target.checked);
  }
  if (event.target.id === 'outputType') {
    renderOutputSpecificFields(event.target.value, Boolean(document.querySelector('#createOutput')?.checked));
  }
});
document.querySelectorAll('.category-tab').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.category)));

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault(); elements.formError.textContent = '';
  const submit = elements.form.querySelector('[type="submit"]'); submit.disabled = true;
  try {
    const payload = await formPayload();
    if (payload.category === '대외활동' && payload.details.createOutput === 'true' && payload.details.outputType === '논문'
      && !payload.details.outputPaperLink && !payload.details.outputPaperFileData) {
      throw new Error('논문 결과물의 링크를 입력하거나 PDF 파일을 첨부해 주세요.');
    }
    const result = await request('/api/specs', { method: 'POST', body: JSON.stringify(payload) });
    state.activities.unshift(...result.items); renderSummary(); renderActivities(); setModal(false);
    showToast(result.items.length > 1 ? '활동과 결과물을 함께 등록했습니다.' : '새로운 활동을 등록했습니다.');
  } catch (error) { elements.formError.textContent = error.message; }
  finally { submit.disabled = false; }
});

elements.grid.addEventListener('click', async (event) => {
  const card = event.target.closest('.activity-card'); if (!card) return;
  const activity = state.activities.find((item) => item.id === card.dataset.id);
  if (event.target.closest('.delete')) {
    if (!window.confirm(`“${activity.title}” 기록을 삭제할까요?`)) return;
    try { await request(`/api/specs/${encodeURIComponent(activity.id)}`, { method: 'DELETE' }); state.activities = state.activities.filter((item) => item.id !== activity.id); renderSummary(); renderActivities(); showToast('활동을 삭제했습니다.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  openDetail(activity);
});
document.querySelector('#closeDetail').addEventListener('click', closeDetail);
elements.detailModal.addEventListener('click', (event) => { if (event.target === elements.detailModal) closeDetail(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (!elements.detailModal.hidden) closeDetail(); else if (!elements.modal.hidden) setModal(false); } });

async function loadActivities() {
  try {
    state.activities = await request('/api/specs'); renderSummary();
    if (location.hash === '#contacts') setCategory('연락처'); else renderActivities();
  } catch (error) { elements.grid.innerHTML = `<div class="empty-state"><strong>데이터를 불러오지 못했습니다.</strong>${escapeHtml(error.message)}</div>`; }
}
loadActivities();
