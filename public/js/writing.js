const { escapeHtml, request, showToast } = window.Carrier;
const state = { activities: [], report: null, meta: {}, writings: [], currentWritingId: null };
const elements = {
  form: document.querySelector('#writingForm'),
  result: document.querySelector('#writingResult'),
  profile: document.querySelector('#writingProfile'),
  status: document.querySelector('#writingStatus'),
  error: document.querySelector('#writingError'),
  button: document.querySelector('#generateButton'),
  history: document.querySelector('#writingHistory'),
  historyCount: document.querySelector('#writingHistoryCount')
};

function asArray(value) { return Array.isArray(value) ? value : []; }
function text(value, fallback = '') { return typeof value === 'string' && value.trim() ? value.trim() : fallback; }
function count(category) { return state.activities.filter((item) => item.category === category).length; }

function formatSavedDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function safeFileName(value) {
  return text(value, 'Carrier_지원서').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
}

function renderProfile() {
  const careerItems = state.activities.filter((item) => item.category !== '연락처');
  const metrics = [
    ['전체 스펙', careerItems.length], ['프로젝트', count('프로젝트')],
    ['자격증', count('자격증')], ['대외활동', count('대외활동')],
    ['논문', count('논문')], ['기타 경험', count('어학연수') + count('멘토링')]
  ];
  elements.profile.innerHTML = metrics.map(([label, value]) => `<div class="profile-chip"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`).join('');
}

function renderList(items, emptyMessage) {
  const values = asArray(items).map((item) => text(item)).filter(Boolean);
  return `<ul>${(values.length ? values : [emptyMessage]).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function reportAsText(report) {
  const target = report.target || {};
  const sections = asArray(report.sections);
  const lines = [
    `${text(target.company, '지원 기업')} ${text(target.role, '지원 직무')} ${text(target.applicationType, '지원서')}`,
    '',
    ...sections.flatMap((section, index) => [
      `${index + 1}. ${text(section.title, '지원 문항')}`,
      text(section.question),
      '',
      text(section.answer),
      ''
    ])
  ];
  return lines.join('\n').trim();
}

async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value);
    showToast(successMessage);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast(successMessage);
  }
}

function renderReport(result) {
  const report = result.report || {};
  const meta = result.meta || {};
  const target = report.target || {};
  const basis = report.formBasis || {};
  const strategy = report.writingStrategy || {};
  const review = report.review || {};
  const sections = asArray(report.sections);
  state.report = report;
  state.meta = meta;
  elements.result.classList.add('ready');
  elements.result.innerHTML = `<article class="writing-report">
    <header class="report-header"><div><span class="report-label">AI APPLICATION REPORT</span><h2>${escapeHtml(text(report.summary, '지원서 초안이 완성되었습니다.'))}</h2><p>${escapeHtml(text(target.company, '기업 미지정'))} · ${escapeHtml(text(target.role, '직무 미지정'))} · ${escapeHtml(text(target.applicationType, '지원서'))}</p></div><div class="report-actions"><button class="copy-all-button" type="button" data-copy-all>전체 복사</button><button class="copy-all-button" type="button" data-export-word>Word 출력</button><button class="save-writing-button" type="button" data-save-writing ${state.currentWritingId ? 'disabled' : ''}>${state.currentWritingId ? '저장됨' : '글 저장'}</button></div></header>
    <div class="basis-bar"><span>${escapeHtml(text(basis.source, '양식 기준'))}</span><div>${escapeHtml(text(basis.note, '입력 내용을 기준으로 지원서 구조를 구성했습니다.'))}</div></div>
    <section class="strategy-grid">
      <div class="strategy-item"><span>톤앤매너</span><strong>${escapeHtml(text(strategy.tone, '지원 직무에 맞는 전문적인 어조'))}</strong></div>
      <div class="strategy-item"><span>핵심 메시지</span><strong>${escapeHtml(text(strategy.keyMessage, '등록된 경험을 직무 역량과 연결'))}</strong></div>
      <div class="strategy-item"><span>선택한 근거</span><strong>${escapeHtml(asArray(strategy.evidenceTitles).map((item) => text(item)).filter(Boolean).join(' · ') || '등록 스펙 기반')}</strong></div>
    </section>
    <section class="draft-sections">${sections.map((section, index) => {
      const answer = text(section?.answer, '답변이 생성되지 않았습니다.');
      return `<article class="draft-card"><header class="draft-card-head"><div><span class="draft-number">SECTION ${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(text(section?.title, `문항 ${index + 1}`))}</h3><p class="draft-question">${escapeHtml(text(section?.question, '자유 형식'))}</p></div><button class="copy-section" type="button" data-copy-section="${index}">답변 복사</button></header><p class="draft-intent"><strong>작성 의도</strong> · ${escapeHtml(text(section?.intent, '직무 적합성과 경험을 연결합니다.'))}</p><div class="draft-answer">${escapeHtml(answer)}</div><small class="draft-count">공백 포함 ${[...answer].length}자</small></article>`;
    }).join('') || '<div class="result-empty"><strong>생성된 문항이 없습니다.</strong></div>'}</section>
    <section class="review-grid">
      <article class="review-card"><h3>초안의 강점</h3>${renderList(review.strengths, '등록된 경험을 기반으로 작성했습니다.')}</article>
      <article class="review-card"><h3>수정 시 주의</h3>${renderList(review.cautions, '제출 전 문항과 분량을 확인해 주세요.')}</article>
      <article class="review-card"><h3>사실 확인</h3>${renderList(review.factChecks, '추가로 확인할 사실이 없습니다.')}</article>
    </section>
    ${asArray(report.assumptions).length ? `<div class="basis-bar"><span>가정</span><div>${escapeHtml(report.assumptions.map((item) => text(item)).filter(Boolean).join(' · '))}</div></div>` : ''}
    <p class="report-foot">커리어 ${Number(meta.profileItems) || 0}건 사용 · 연락처 ${Number(meta.excludedContacts) || 0}건 및 첨부파일 제외 · ${escapeHtml(text(meta.expectedModel, 'AI 모델'))}</p>
  </article>`;
}

function renderHistory() {
  elements.historyCount.textContent = state.writings.length;
  if (!state.writings.length) {
    elements.history.innerHTML = '<div class="history-empty">아직 저장한 글이 없습니다. AI 결과에서 ‘글 저장’을 눌러 보관해 보세요.</div>';
    return;
  }
  elements.history.innerHTML = state.writings.map((writing) => `<article class="history-item" data-id="${escapeHtml(writing.id)}">
    <div class="history-main"><span>${escapeHtml(text(writing.applicationType, '지원서'))}</span><strong>${escapeHtml(text(writing.title, '저장된 AI 지원서'))}</strong><small>${escapeHtml(formatSavedDate(writing.createdAt))} · ${asArray(writing.report?.sections).length}개 문항</small></div>
    <div class="history-actions"><button type="button" data-open-writing>다시 보기</button><button type="button" data-word-writing>Word</button><button class="danger" type="button" data-delete-writing>삭제</button></div>
  </article>`).join('');
}

async function loadWritings() {
  try {
    state.writings = await request('/api/writings');
    renderHistory();
  } catch (error) {
    elements.history.innerHTML = `<div class="history-empty error">${escapeHtml(error.message)}</div>`;
  }
}

async function saveCurrentWriting() {
  if (!state.report || state.currentWritingId) return;
  const target = state.report.target || {};
  const button = elements.result.querySelector('[data-save-writing]');
  if (button) { button.disabled = true; button.textContent = '저장 중…'; }
  try {
    const saved = await request('/api/writings', {
      method: 'POST',
      body: JSON.stringify({
        title: [target.company, target.role, target.applicationType].filter(Boolean).join(' · '),
        companyName: target.company,
        targetRole: target.role,
        applicationType: target.applicationType,
        report: state.report,
        meta: state.meta
      })
    });
    state.currentWritingId = saved.id;
    state.writings.unshift(saved);
    renderHistory();
    if (button) button.textContent = '저장됨';
    showToast('AI 지원서를 저장했습니다.');
  } catch (error) {
    if (button) { button.disabled = false; button.textContent = '글 저장'; }
    showToast(error.message);
  }
}

async function exportWord(report = state.report, title = '') {
  if (!report) return;
  const target = report.target || {};
  const documentTitle = title || [target.company, target.role, target.applicationType].filter(Boolean).join(' · ');
  try {
    const response = await fetch('/api/writings/export-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: documentTitle, report })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Word 문서를 생성하지 못했습니다.');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${safeFileName(documentTitle)}.docx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Word 문서를 내려받았습니다.');
  } catch (error) {
    showToast(error.message);
  }
}

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.error.textContent = '';
  const companyName = document.querySelector('#companyName').value.trim();
  const targetRole = document.querySelector('#targetRole').value.trim();
  if (!companyName || !targetRole) {
    elements.error.textContent = '기업명과 지원 직무를 모두 입력해 주세요.';
    return;
  }
  elements.button.disabled = true;
  elements.button.textContent = '지원서 작성 중…';
  elements.result.classList.add('ready');
  elements.result.innerHTML = '<div class="writing-loading"><i></i><strong>내 경험에서 적합한 근거를 고르고 있습니다.</strong><p>Mindlogic AI가 지원 양식과 톤에 맞춰 문항별 답변을 작성합니다.</p></div>';
  requestAnimationFrame(() => elements.result.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  try {
    const result = await request('/api/writing/generate', {
      method: 'POST',
      body: JSON.stringify({
        companyName,
        targetRole,
        applicationType: document.querySelector('#applicationType').value,
        careerLevel: document.querySelector('#careerLevel').value,
        tone: document.querySelector('#tone').value,
        answerLength: document.querySelector('#answerLength').value,
        jobDescription: document.querySelector('#jobDescription').value.trim(),
        formQuestions: document.querySelector('#formQuestions').value.trim(),
        additionalRequest: document.querySelector('#additionalRequest').value.trim()
      })
    });
    state.currentWritingId = null;
    renderReport(result);
    showToast('지원서 초안과 검토 리포트를 만들었습니다.');
  } catch (error) {
    elements.result.innerHTML = `<div class="result-empty error"><span>⚠️</span><strong>지원서를 만들지 못했습니다.</strong><p>${escapeHtml(error.message)}</p></div>`;
    elements.error.textContent = error.message;
  } finally {
    elements.button.disabled = false;
    elements.button.textContent = '✨ 지원서 초안 만들기';
  }
});

elements.result.addEventListener('click', (event) => {
  if (event.target.closest('[data-save-writing]')) {
    saveCurrentWriting();
    return;
  }
  if (event.target.closest('[data-export-word]')) {
    exportWord();
    return;
  }
  if (event.target.closest('[data-copy-all]') && state.report) {
    copyText(reportAsText(state.report), '전체 답변을 복사했습니다.');
    return;
  }
  const sectionButton = event.target.closest('[data-copy-section]');
  if (!sectionButton || !state.report) return;
  const section = asArray(state.report.sections)[Number(sectionButton.dataset.copySection)];
  if (section) copyText(text(section.answer), '문항 답변을 복사했습니다.');
});

elements.history.addEventListener('click', async (event) => {
  const item = event.target.closest('.history-item');
  if (!item) return;
  const writing = state.writings.find((entry) => entry.id === item.dataset.id);
  if (!writing) return;
  if (event.target.closest('[data-open-writing]')) {
    state.currentWritingId = writing.id;
    renderReport({ report: writing.report, meta: writing.meta });
    elements.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('저장된 글을 불러왔습니다.');
    return;
  }
  if (event.target.closest('[data-word-writing]')) {
    await exportWord(writing.report, writing.title);
    return;
  }
  if (!event.target.closest('[data-delete-writing]')) return;
  if (!window.confirm(`“${writing.title}” 글을 삭제할까요?`)) return;
  try {
    await request(`/api/writings/${encodeURIComponent(writing.id)}`, { method: 'DELETE' });
    state.writings = state.writings.filter((entry) => entry.id !== writing.id);
    if (state.currentWritingId === writing.id) state.currentWritingId = null;
    renderHistory();
    showToast('저장된 글을 삭제했습니다.');
  } catch (error) { showToast(error.message); }
});

async function loadStatus() {
  try {
    const status = await request('/api/writing/status');
    elements.status.textContent = status.configured ? `${status.expectedModel} 연결` : 'API 키 필요';
    elements.status.classList.toggle('connected', status.configured);
    elements.status.classList.toggle('error', !status.configured);
  } catch {
    elements.status.textContent = '상태 확인 실패';
    elements.status.classList.add('error');
  }
}

async function loadProfile() {
  try { state.activities = await request('/api/specs'); renderProfile(); }
  catch (error) { elements.profile.innerHTML = `<span>${escapeHtml(error.message)}</span>`; }
}

loadStatus();
loadProfile();
loadWritings();
