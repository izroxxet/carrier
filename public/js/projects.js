const { escapeHtml, safeExternalUrl, safeAttachment, formatDate, request, showToast, readFile } = window.Carrier;
const state = { projects: [], activitiesText: '', editingId: null, pendingAnalysis: '', lastAnalysis: null };
const elements = {
  list: document.querySelector('#projectList'),
  count: document.querySelector('#projectCount'),
  analysisForm: document.querySelector('#projectAnalysisForm'),
  analysisResult: document.querySelector('#projectAnalysisResult'),
  analysisError: document.querySelector('#labError'),
  modal: document.querySelector('#projectModal'),
  form: document.querySelector('#projectForm'),
  formError: document.querySelector('#projectFormError'),
  modalTitle: document.querySelector('#projectModalTitle'),
  submitButton: document.querySelector('#projectSubmitButton'),
  detailModal: document.querySelector('#projectDetailModal'),
  detailContent: document.querySelector('#projectDetailContent')
};

function repositoryKey(value = '') {
  return value.trim().replace(/\.git$/i, '').replace(/\/$/, '').toLowerCase();
}

function findProjectForAnalysis(repositoryUrl, username) {
  const repository = repositoryKey(repositoryUrl);
  const user = username.trim().toLowerCase();
  return state.projects.find((project) => repositoryKey(project.details?.githubRepository) === repository
    && (project.details?.githubUsername || '').trim().toLowerCase() === user);
}

function parseSavedAnalysis(value) {
  if (!value) return null;
  try { return JSON.parse(value); }
  catch { return { legacyText: value }; }
}

function inferredClassification(projectType = '') {
  if (projectType.includes('오픈소스')) return '오픈소스';
  if (projectType.includes('팀')) return '팀 프로젝트';
  if (projectType.includes('학업')) return '학업 프로젝트';
  if (projectType.includes('공모전')) return '공모전';
  if (projectType.includes('개인')) return '개인 프로젝트';
  return '';
}

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
      <span class="project-row-icon">💻</span>
      <div class="project-row-main"><strong>${escapeHtml(project.title)}</strong><small>${escapeHtml(details.classification || '프로젝트')} · ${escapeHtml(formatDate(details.date) || '날짜 미등록')}${details.award ? ` · ${escapeHtml(details.award)}` : ''}</small></div>
      <div class="project-actions"><button class="detail" type="button">상세</button><button class="analyze" type="button" ${canAnalyze ? '' : 'disabled'}>AI 분석</button><button class="delete" type="button">삭제</button></div>
    </article>`;
  }).join('');
}

function setModal(open, project = null, prefill = null) {
  elements.modal.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    elements.form.reset();
    elements.formError.textContent = '';
    state.editingId = project?.id || null;
    state.pendingAnalysis = prefill?.aiAnalysis || '';
    elements.modalTitle.textContent = project ? '프로젝트 수정' : '프로젝트 등록';
    elements.submitButton.textContent = project ? '수정하기' : '등록하기';
    const source = project ? { title: project.title, ...(project.details || {}) } : (prefill || {});
    Object.entries(source).forEach(([name, value]) => {
      const field = elements.form.elements[name];
      if (field && typeof value === 'string') field.value = value;
    });
    document.querySelector('#projectEvidenceStatus').textContent = source.evidenceImageName
      ? `현재 파일: ${source.evidenceImageName} · 새 이미지를 선택하면 교체됩니다.`
      : '첨부파일은 항목당 최대 2MB까지 저장할 수 있습니다.';
    setTimeout(() => elements.form.elements.title.focus(), 50);
  } else {
    elements.form.reset();
    elements.formError.textContent = '';
    state.editingId = null;
    state.pendingAnalysis = '';
  }
}

async function analyzeRepository(repositoryUrl, username, projectId = null) {
  const submit = elements.analysisForm.querySelector('[type="submit"]');
  const linkedProject = projectId
    ? state.projects.find((project) => project.id === projectId)
    : findProjectForAnalysis(repositoryUrl, username);
  elements.analysisError.textContent = '';
  state.activitiesText = '';
  submit.disabled = true;
  submit.textContent = '커밋과 코드 분석 중…';
  elements.analysisResult.classList.remove('has-result');
  elements.analysisResult.innerHTML = '<div class="analysis-empty analysis-loading"><span>⏳</span><strong>저장소와 내 커밋을 분석하고 있습니다.</strong><p>README, 기술 구성, 최근 커밋의 변경 파일과 코드를 확인합니다.</p></div>';
  requestAnimationFrame(() => elements.analysisResult.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  try {
    const result = await request('/api/analyze-github', { method: 'POST', body: JSON.stringify({ repositoryUrl, username }) });
    const analysis = result.analysis || {};
    const techStack = Array.isArray(analysis.techStack) ? analysis.techStack : [];
    const keyActivities = Array.isArray(analysis.keyActivities) ? analysis.keyActivities : [];
    const evidence = Array.isArray(analysis.commitEvidence) ? analysis.commitEvidence : [];
    const limitations = Array.isArray(analysis.limitations) ? analysis.limitations : [];
    state.activitiesText = result.activitiesText || '';
    const savedPayload = { ...result, savedAt: new Date().toISOString() };
    state.lastAnalysis = { result: savedPayload, repositoryUrl, username, projectId: linkedProject?.id || null };
    let analysisSaved = false;
    if (linkedProject) {
      try {
        const updated = await request(`/api/specs/${encodeURIComponent(linkedProject.id)}`, {
          method: 'PATCH', body: JSON.stringify({ details: { aiAnalysis: JSON.stringify(savedPayload) } })
        });
        state.projects = state.projects.map((project) => project.id === updated.id ? updated : project);
        renderProjects();
        analysisSaved = true;
      } catch (saveError) {
        showToast(`분석은 완료됐지만 저장하지 못했습니다: ${saveError.message}`);
      }
    }
    elements.analysisResult.classList.add('has-result');
    elements.analysisResult.innerHTML = `
      <div class="analysis-result-head"><span>✨ AI 프로젝트 기여 분석 ${analysisSaved ? '· 프로젝트 상세에 저장됨' : ''}</span><small>${escapeHtml(result.repository)} · ${escapeHtml(result.username)} · 최근 ${result.commitCount}개 커밋 · ${escapeHtml(result.model)}</small></div>
      <div class="project-analysis-summary">
        <div><span class="result-kicker">PROJECT</span><h2>${escapeHtml(analysis.projectName || result.repository)}</h2><p>${escapeHtml(analysis.projectSummary || '프로젝트 설명을 확인하지 못했습니다.')}</p></div>
        <span class="project-type">${escapeHtml(analysis.projectType || '분류 확인 필요')}</span>
      </div>
      ${techStack.length ? `<div class="tech-stack">${techStack.map((technology) => `<span>${escapeHtml(technology)}</span>`).join('')}</div>` : ''}
      <div class="analysis-grid">
        <section class="result-card"><h3>내 역할</h3><p>${escapeHtml(analysis.roleSummary || '커밋에서 역할을 확인하지 못했습니다.')}</p></section>
        <section class="result-card"><h3>핵심 기여</h3><p>${escapeHtml(analysis.contributionSummary || '커밋에서 기여 내용을 확인하지 못했습니다.')}</p></section>
      </div>
      <section class="activities-copy-card">
        <div class="copy-card-head"><div><span>PROJECT ACTIVITIES</span><h3>프로젝트 주요 활동</h3></div><div class="result-action-buttons"><button type="button" class="copy-activities-button secondary-copy" data-copy-activities ${state.activitiesText ? '' : 'disabled'}>주요 활동 복사</button>${linkedProject ? '' : '<button type="button" class="copy-activities-button" data-fill-project>프로젝트 등록 폼 채우기</button>'}</div></div>
        <pre>${escapeHtml(state.activitiesText || keyActivities.map((activity) => `- ${activity}`).join('\n') || '복사할 주요 활동이 생성되지 않았습니다.')}</pre>
      </section>
      <section class="portfolio-line"><span>포트폴리오 한 문장</span><p>${escapeHtml(analysis.portfolioSentence || '생성된 문장이 없습니다.')}</p></section>
      ${evidence.length ? `<section class="evidence-section"><h3>커밋 근거</h3><div class="evidence-list">${evidence.map((item) => `<article><code>${escapeHtml(item.sha || '')}</code><div><strong>${escapeHtml(item.message || '커밋')}</strong><p>${escapeHtml(item.evidence || '')}</p></div></article>`).join('')}</div></section>` : ''}
      ${limitations.length ? `<p class="analysis-limitations">분석 한계 · ${limitations.map((item) => escapeHtml(item)).join(' · ')}</p>` : ''}`;
    showToast(analysisSaved ? '분석을 완료하고 프로젝트 상세에 저장했습니다.' : '프로젝트 커밋 분석을 완료했습니다.');
  } catch (error) {
    elements.analysisError.textContent = error.message;
    elements.analysisResult.innerHTML = '<div class="analysis-empty"><span>⚠️</span><strong>분석을 완료하지 못했습니다.</strong><p>입력 정보와 서버의 API 키 설정을 확인해 주세요.</p></div>';
  } finally {
    submit.disabled = false;
    submit.textContent = '✨ 프로젝트 · 커밋 분석 시작';
  }
}

async function copyActivities() {
  if (!state.activitiesText) return;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(state.activitiesText);
    else {
      const textarea = document.createElement('textarea');
      textarea.value = state.activitiesText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    showToast('주요 활동을 복사했습니다. 프로젝트 등록 폼에 붙여넣으세요.');
  } catch { showToast('복사하지 못했습니다. 텍스트를 직접 선택해 주세요.'); }
}

function fillProjectFormFromAnalysis() {
  const payload = state.lastAnalysis;
  if (!payload) return;
  const analysis = payload.result.analysis || {};
  setModal(true, null, {
    title: analysis.projectName || payload.result.repository || '',
    classification: inferredClassification(analysis.projectType || ''),
    activities: payload.result.activitiesText || '',
    githubRepository: payload.repositoryUrl,
    githubUsername: payload.username,
    aiAnalysis: JSON.stringify(payload.result)
  });
  showToast('분석 결과로 입력 가능한 항목을 채웠습니다. 날짜를 확인해 등록하세요.');
}

function savedAnalysisMarkup(saved) {
  if (!saved) return '';
  if (saved.legacyText) return `<div class="saved-analysis-text">${escapeHtml(saved.legacyText)}</div>`;
  const analysis = saved.analysis || {};
  const activities = Array.isArray(analysis.keyActivities) ? analysis.keyActivities : [];
  const evidence = Array.isArray(analysis.commitEvidence) ? analysis.commitEvidence : [];
  return `<div class="saved-analysis-content">
    <div class="saved-analysis-meta"><span>${escapeHtml(saved.model || 'AI')}</span><small>${escapeHtml(saved.repository || '')} · 최근 ${Number(saved.commitCount) || 0}개 커밋</small></div>
    <h3>${escapeHtml(analysis.projectSummary || '저장된 프로젝트 분석')}</h3>
    <div class="saved-analysis-grid"><div><span>분석된 역할</span><p>${escapeHtml(analysis.roleSummary || '')}</p></div><div><span>핵심 기여</span><p>${escapeHtml(analysis.contributionSummary || '')}</p></div></div>
    ${activities.length ? `<div class="saved-activities"><span>AI 주요 활동</span><ul>${activities.map((activity) => `<li>${escapeHtml(activity)}</li>`).join('')}</ul></div>` : ''}
    ${analysis.portfolioSentence ? `<div class="saved-portfolio"><span>포트폴리오 문장</span><p>${escapeHtml(analysis.portfolioSentence)}</p></div>` : ''}
    ${evidence.length ? `<details><summary>커밋 근거 ${evidence.length}개</summary><ul>${evidence.map((item) => `<li><code>${escapeHtml(item.sha || '')}</code> ${escapeHtml(item.evidence || item.message || '')}</li>`).join('')}</ul></details>` : ''}
  </div>`;
}

function openDetail(project) {
  const details = project.details || {};
  const fields = [
    ['분류', details.classification], ['날짜', formatDate(details.date)], ['수상', details.award],
    ['주요 활동', details.activities, 'wide'], ['GitHub 작성자', details.githubUsername]
  ].filter(([, value]) => value);
  const repository = safeExternalUrl(details.githubRepository);
  if (repository) fields.push(['GitHub 저장소', `<a href="${escapeHtml(repository)}" target="_blank" rel="noopener noreferrer">${escapeHtml(details.githubRepository)} ↗</a>`, 'wide', true]);
  const evidenceImage = safeAttachment(details.evidenceImageData);
  if (evidenceImage) fields.push(['증빙자료', `<a href="${evidenceImage}" download="${escapeHtml(details.evidenceImageName || 'project-evidence')}">${escapeHtml(details.evidenceImageName || '증빙자료 이미지')} 다운로드</a>`, 'wide', true]);
  const savedAnalysis = parseSavedAnalysis(details.aiAnalysis);
  elements.detailContent.dataset.projectId = project.id;
  elements.detailContent.innerHTML = `<span class="detail-badge">프로젝트</span><h2>${escapeHtml(project.title)}</h2><div class="project-detail-grid">${fields.map(([label, value, wide, html]) => `<div class="project-detail-row ${wide || ''}"><span>${label}</span><strong>${html ? value : escapeHtml(value)}</strong></div>`).join('')}</div>
    <div class="detail-actions"><button class="secondary-button" type="button" data-edit-project>프로젝트 수정</button>${savedAnalysis ? '<button class="primary-button" type="button" data-toggle-saved-analysis>저장된 AI 분석 보기</button>' : ''}</div>
    ${savedAnalysis ? `<section class="saved-analysis-panel" id="savedAnalysisPanel" hidden>${savedAnalysisMarkup(savedAnalysis)}</section>` : ''}`;
  elements.detailModal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDetail() { elements.detailModal.hidden = true; document.body.style.overflow = ''; }

elements.analysisForm.addEventListener('submit', (event) => {
  event.preventDefault();
  analyzeRepository(document.querySelector('#labRepository').value.trim(), document.querySelector('#labUsername').value.trim());
});
elements.analysisResult.addEventListener('click', (event) => {
  if (event.target.closest('[data-copy-activities]')) copyActivities();
  if (event.target.closest('[data-fill-project]')) fillProjectFormFromAnalysis();
});
document.querySelector('[data-open-project]').addEventListener('click', () => setModal(true));
document.querySelectorAll('[data-close-project]').forEach((button) => button.addEventListener('click', () => setModal(false)));
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) setModal(false); });

elements.detailContent.addEventListener('click', (event) => {
  const project = state.projects.find((item) => item.id === elements.detailContent.dataset.projectId);
  if (!project) return;
  if (event.target.closest('[data-edit-project]')) {
    closeDetail();
    setModal(true, project);
    return;
  }
  const toggle = event.target.closest('[data-toggle-saved-analysis]');
  if (toggle) {
    const panel = elements.detailContent.querySelector('#savedAnalysisPanel');
    panel.hidden = !panel.hidden;
    toggle.textContent = panel.hidden ? '저장된 AI 분석 보기' : '저장된 AI 분석 닫기';
  }
});

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault(); elements.formError.textContent = '';
  const submit = elements.form.querySelector('[type="submit"]'); submit.disabled = true;
  try {
    const editingId = state.editingId;
    const values = Object.fromEntries(new FormData(elements.form));
    const evidenceFile = elements.form.elements.evidenceImage.files[0];
    const evidenceDetails = evidenceFile ? {
      evidenceImageName: evidenceFile.name,
      evidenceImageData: await readFile(evidenceFile)
    } : {};
    const payload = { category: '프로젝트', title: values.title, details: {
      classification: values.classification, date: values.date, award: values.award,
      activities: values.activities, githubRepository: values.githubRepository, githubUsername: values.githubUsername,
      ...evidenceDetails,
      ...(state.pendingAnalysis ? { aiAnalysis: state.pendingAnalysis } : {})
    } };
    if (editingId) {
      const updated = await request(`/api/specs/${encodeURIComponent(editingId)}`, { method: 'PATCH', body: JSON.stringify(payload) });
      state.projects = state.projects.map((project) => project.id === updated.id ? updated : project);
      renderProjects(); setModal(false); showToast('프로젝트를 수정했습니다.');
    } else {
      const result = await request('/api/specs', { method: 'POST', body: JSON.stringify(payload) });
      state.projects.unshift(...result.items.filter((item) => item.category === '프로젝트'));
      renderProjects(); setModal(false); showToast('프로젝트를 등록했습니다.');
    }
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
    await analyzeRepository(project.details.githubRepository, project.details.githubUsername, project.id);
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
