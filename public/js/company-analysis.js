const { escapeHtml, request, showToast } = window.Carrier;
const state = { activities: [] };
const profileSummary = document.querySelector('#companyProfileSummary');
const comparisonBoard = document.querySelector('#comparisonBoard');
const sourceStatus = document.querySelector('#sourceStatus');
const analyzeButton = document.querySelector('#analyzeButton');

function count(category) { return state.activities.filter((item) => item.category === category).length; }
function asArray(value) { return Array.isArray(value) ? value : []; }
function text(value, fallback = '') {
  if (value === null || value === undefined || value === '') return fallback;
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function renderProfile() {
  const metrics = [
    ['전체 경험', state.activities.filter((item) => item.category !== '연락처').length], ['프로젝트', count('프로젝트')],
    ['자격증', count('자격증')], ['대외활동', count('대외활동')],
    ['논문', count('논문')], ['어학·멘토링', count('어학연수') + count('멘토링')]
  ];
  profileSummary.innerHTML = metrics.map(([label, value]) => `<div class="profile-metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
}

function renderStringList(items, emptyMessage) {
  if (!asArray(items).length) return `<p class="analysis-muted">${escapeHtml(emptyMessage)}</p>`;
  return `<ul class="analysis-list">${items.map((item) => `<li>${escapeHtml(text(item))}</li>`).join('')}</ul>`;
}

function renderMissingItems(items) {
  if (!asArray(items).length) return '<p class="analysis-muted">명시적으로 확인된 부족 항목이 없습니다.</p>';
  return `<div class="missing-list">${items.map((item) => {
    const priority = text(item?.priority, '확인');
    const priorityClass = priority === '높음' ? 'high' : priority === '중간' ? 'medium' : 'low';
    return `<article class="missing-item">
      <div><strong>${escapeHtml(text(item?.name, '보완 항목'))}</strong><span class="priority ${priorityClass}">${escapeHtml(priority)}</span></div>
      <p>${escapeHtml(text(item?.reason, '공고 요건과 내 스펙을 직접 확인해 주세요.'))}</p>
      ${item?.recommendation ? `<small>${escapeHtml(text(item.recommendation))}</small>` : ''}
    </article>`;
  }).join('')}</div>`;
}

function renderStrengths(items) {
  if (!asArray(items).length) return '<p class="analysis-muted">명시적으로 확인된 강점이 없습니다.</p>';
  return `<ul class="matched-list">${items.map((item) => `<li><strong>${escapeHtml(text(item?.name, '강점'))}</strong><span>${escapeHtml(text(item?.evidence, '근거 없음'))}</span></li>`).join('')}</ul>`;
}

function renderAnalysis(result) {
  const analysis = result.analysis || {};
  const meta = result.meta || {};
  const rawScore = Number(analysis.matchScore);
  const score = Number.isFinite(rawScore) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 0;
  const target = analysis.target || {};
  comparisonBoard.classList.add('ready');
  comparisonBoard.innerHTML = `<div class="analysis-report">
    <header class="report-head"><div><span>AI CAREER FIT REPORT</span><h2>${escapeHtml(text(analysis.summary, '기업·직무 적합도 분석 결과'))}</h2><p>${escapeHtml(text(target.company, '기업 미지정'))} · ${escapeHtml(text(target.role, '직무 미지정'))} · ${escapeHtml(text(target.careerLevel, '경력 미지정'))}</p></div><div class="match-score"><strong>${score}</strong><span>적합도</span></div></header>
    <section class="analysis-section strength-section"><h3>내 스펙의 강점</h3>${renderStrengths(analysis.strengths)}</section>
    <div class="report-summary-grid">
      <section><h3>부족한 스펙</h3>${renderMissingItems(analysis.missingSpecs)}</section>
      <section><h3>추천 행동</h3>${renderStringList(analysis.recommendations, '추천 행동이 생성되지 않았습니다.')}</section>
    </div>
    ${asArray(analysis.assumptions).length ? `<div class="analysis-caveat"><strong>분석 기준 및 한계</strong>${renderStringList(analysis.assumptions, '')}</div>` : ''}
    <p class="privacy-result">분석에 커리어 ${Number(meta.profileItems) || 0}건을 사용했습니다. 연락처 ${Number(meta.excludedContacts) || 0}건과 사진·첨부 데이터는 전송하지 않았습니다.</p>
  </div>`;
}

document.querySelector('#companyCompareForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const companyName = document.querySelector('#companyName').value.trim();
  const targetRole = document.querySelector('#targetRole').value.trim();
  if (!companyName && !targetRole) {
    showToast('기업명 또는 목표 직무 중 하나 이상을 입력해 주세요.');
    return;
  }
  analyzeButton.disabled = true;
  analyzeButton.textContent = '내 스펙 분석 중…';
  comparisonBoard.classList.add('ready');
  comparisonBoard.innerHTML = '<div class="analysis-loading"><span></span><strong>기업·직무와 내 스펙을 비교하고 있습니다.</strong><p>Mindlogic AI가 강점과 부족한 역량을 분석합니다.</p></div>';
  requestAnimationFrame(() => comparisonBoard.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  try {
    const result = await request('/api/company-analysis', {
      method: 'POST',
      body: JSON.stringify({
        companyName,
        targetRole,
        careerLevel: document.querySelector('#careerLevel').value,
        jobDescription: document.querySelector('#jobDescription').value.trim()
      })
    });
    renderAnalysis(result);
    showToast('기업·직무 적합도 분석이 완료되었습니다.');
  } catch (error) {
    comparisonBoard.innerHTML = `<div class="comparison-empty error"><span>⚠️</span><strong>분석을 완료하지 못했습니다.</strong><p>${escapeHtml(error.message)}</p><small>.env의 MINDLOGIC_API_KEY와 MINDLOGIC_MODEL 설정을 확인해 주세요.</small></div>`;
    showToast(error.message);
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = '내 스펙 분석하기';
  }
});

async function loadStatus() {
  try {
    const status = await request('/api/company-analysis/status');
    sourceStatus.textContent = status.configured ? `${status.expectedModel} 설정 완료` : '환경변수 설정 필요';
    sourceStatus.classList.toggle('connected', status.configured);
    sourceStatus.classList.toggle('error', !status.configured);
  } catch {
    sourceStatus.textContent = '상태 확인 실패';
    sourceStatus.classList.add('error');
  }
}

async function loadProfile() {
  try { state.activities = await request('/api/specs'); renderProfile(); }
  catch (error) { profileSummary.innerHTML = `<div class="empty-state"><strong>데이터를 불러오지 못했습니다.</strong>${escapeHtml(error.message)}</div>`; }
}

loadStatus();
loadProfile();
