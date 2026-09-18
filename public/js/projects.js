const { escapeHtml, safeExternalUrl, formatDate, request, showToast } = window.Carrier;
const state = { projects: [] };
const elements = {
  list: document.querySelector('#projectList'),
  count: document.querySelector('#projectCount'),
  analysisForm: document.querySelector('#projectAnalysisForm'),
  analysisResult: document.querySelector('#projectAnalysisResult'),
  analysisError: document.querySelector('#labError'),
  modal: document.querySelector('#projectModal'),
  form: document.querySelector('#projectForm'),
  formError: document.querySelector('#projectFormError'),
  detailModal: document.querySelector('#projectDetailModal'),
  detailContent: document.querySelector('#projectDetailContent')
};

function renderProjects() {
  const projects = [...state.projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  elements.count.textContent = projects.length;
  if (!projects.length) {
    elements.list.innerHTML = '<div class="empty-state"><strong>등록된 프로젝트가 없어요.</strong>첫 프로젝트를 등록해 분석을 시작해 보세요.</div>';
    return;
  }
  elements.list.innerHTML = projects.map((project) => {
    const details = project.details || {};
    const canAnalyze = details.githubRepository && details.githubUsername;
    return `<article class="project-row" data-id="${escapeHtml(project.id)}">
      <span class="project-row-icon">&lt;/&gt;</span>
      <div class="project-row-main"><strong>${escapeHtml(project.title)}</strong><small>${escapeHtml(details.classification || '프로젝트')} · ${escapeHtml(formatDate(details.date) || '날짜 미등록')}${details.award ? ` · ${escapeHtml(details.award)}` : ''}</small></div>
      <div class="project-actions"><button class="detail" type="button">상세</button><button class="analyze" type="button" ${canAnalyze ? '' : 'disabled'}>AI 분석</button><button class="delete" type="button">삭제</button></div>
    </article>`;
  }).join('');
}

function setModal(open) {
  elements.modal.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) setTimeout(() => elements.form.elements.title.focus(), 50);
  else { elements.form.reset(); elements.formError.textContent = ''; }
}

async function analyzeRepository(repositoryUrl, username) {
  const submit = elements.analysisForm.querySelector('[type="submit"]');
  elements.analysisError.textContent = '';
  submit.disabled = true;
  submit.textContent = '커밋과 코드 분석 중…';
  elements.analysisResult.classList.remove('has-result');
  elements.analysisResult.innerHTML = '<div class="analysis-empty"><span>···</span><strong>GitHub 데이터를 불러오고 있습니다.</strong><p>최근 커밋의 변경 파일과 작성 코드를 확인하는 중입니다.</p></div>';
  try {
    const result = await request('/api/analyze-github', { method: 'POST', body: JSON.stringify({ repositoryUrl, username }) });
    elements.analysisResult.classList.add('has-result');
    elements.analysisResult.innerHTML = `<div class="analysis-result-head"><span>✦ AI 프로젝트 기여 분석</span><small>${escapeHtml(result.repository)} · 최근 ${result.commitCount}개 커밋</small></div><div class="analysis-result-body">${escapeHtml(result.analysis)}</div>`;
    showToast('프로젝트 커밋 분석을 완료했습니다.');
  } catch (error) {
    elements.analysisError.textContent = error.message;
    elements.analysisResult.innerHTML = '<div class="analysis-empty"><span>!</span><strong>분석을 완료하지 못했습니다.</strong><p>입력 정보와 서버의 API 키 설정을 확인해 주세요.</p></div>';
  } finally {
    submit.disabled = false;
    submit.textContent = '✦ 커밋 분석 시작';
  }
}

function openDetail(project) {
  const details = project.details || {};
  const fields = [
    ['분류', details.classification], ['날짜', formatDate(details.date)], ['수상', details.award],
    ['주요 활동', details.activities, 'wide'], ['GitHub 작성자', details.githubUsername]
  ].filter(([, value]) => value);
  const repository = safeExternalUrl(details.githubRepository);
  if (repository) fields.push(['GitHub 저장소', `<a href="${escapeHtml(repository)}" target="_blank" rel="noopener noreferrer">${escapeHtml(details.githubRepository)} ↗</a>`, 'wide', true]);
  elements.detailContent.innerHTML = `<span class="detail-badge">프로젝트</span><h2>${escapeHtml(project.title)}</h2><div class="project-detail-grid">${fields.map(([label, value, wide, html]) => `<div class="project-detail-row ${wide || ''}"><span>${label}</span><strong>${html ? value : escapeHtml(value)}</strong></div>`).join('')}</div>`;
  elements.detailModal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDetail() { elements.detailModal.hidden = true; document.body.style.overflow = ''; }

elements.analysisForm.addEventListener('submit', (event) => {
  event.preventDefault();
  analyzeRepository(document.querySelector('#labRepository').value.trim(), document.querySelector('#labUsername').value.trim());
});
document.querySelector('[data-open-project]').addEventListener('click', () => setModal(true));
document.querySelectorAll('[data-close-project]').forEach((button) => button.addEventListener('click', () => setModal(false)));
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) setModal(false); });

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault(); elements.formError.textContent = '';
  const submit = elements.form.querySelector('[type="submit"]'); submit.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(elements.form));
    const payload = { category: '프로젝트', title: values.title, details: {
      classification: values.classification, date: values.date, award: values.award,
      activities: values.activities, githubRepository: values.githubRepository, githubUsername: values.githubUsername
    } };
    const result = await request('/api/specs', { method: 'POST', body: JSON.stringify(payload) });
    state.projects.unshift(...result.items.filter((item) => item.category === '프로젝트'));
    renderProjects(); setModal(false); showToast('프로젝트를 등록했습니다.');
  } catch (error) { elements.formError.textContent = error.message; }
  finally { submit.disabled = false; }
});

elements.list.addEventListener('click', async (event) => {
  const row = event.target.closest('.project-row'); if (!row) return;
  const project = state.projects.find((item) => item.id === row.dataset.id); if (!project) return;
  if (event.target.closest('.analyze')) {
    document.querySelector('#labRepository').value = project.details?.githubRepository || '';
    document.querySelector('#labUsername').value = project.details?.githubUsername || '';
    window.scrollTo({ top: 170, behavior: 'smooth' });
    await analyzeRepository(project.details.githubRepository, project.details.githubUsername);
  } else if (event.target.closest('.delete')) {
    if (!window.confirm(`“${project.title}” 프로젝트를 삭제할까요?`)) return;
    try { await request(`/api/specs/${encodeURIComponent(project.id)}`, { method: 'DELETE' }); state.projects = state.projects.filter((item) => item.id !== project.id); renderProjects(); showToast('프로젝트를 삭제했습니다.'); }
    catch (error) { showToast(error.message); }
  } else {
    openDetail(project);
  }
});

document.querySelector('#closeProjectDetail').addEventListener('click', closeDetail);
elements.detailModal.addEventListener('click', (event) => { if (event.target === elements.detailModal) closeDetail(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (!elements.detailModal.hidden) closeDetail(); else if (!elements.modal.hidden) setModal(false); } });

async function loadProjects() {
  try { state.projects = (await request('/api/specs')).filter((item) => item.category === '프로젝트'); renderProjects(); }
  catch (error) { elements.list.innerHTML = `<div class="empty-state"><strong>프로젝트를 불러오지 못했습니다.</strong>${escapeHtml(error.message)}</div>`; }
}
loadProjects();
