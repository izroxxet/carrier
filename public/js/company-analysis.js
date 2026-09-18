const { escapeHtml, request, showToast } = window.Carrier;
const state = { activities: [] };
const profileSummary = document.querySelector('#companyProfileSummary');
const comparisonBoard = document.querySelector('#comparisonBoard');

function count(category) { return state.activities.filter((item) => item.category === category).length; }
function renderProfile() {
  const metrics = [
    ['전체 경험', state.activities.length], ['프로젝트', count('프로젝트')],
    ['자격증', count('자격증')], ['대외활동', count('대외활동')],
    ['논문', count('논문')], ['어학·멘토링', count('어학연수') + count('멘토링')]
  ];
  profileSummary.innerHTML = metrics.map(([label, value]) => `<div class="profile-metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
}

document.querySelector('#companyCompareForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const company = document.querySelector('#companyName').value.trim();
  const role = document.querySelector('#targetRole').value.trim();
  const level = document.querySelector('#careerLevel').value;
  const rows = ['프로젝트', '자격증', '대외활동', '논문'].map((category) => `<div class="comparison-stat"><span>${category}</span><strong>${count(category)}개</strong></div>`).join('');
  comparisonBoard.classList.add('ready');
  comparisonBoard.innerHTML = `<div class="comparison-ready-head"><h2>${escapeHtml(company)} · ${escapeHtml(role)} 비교 리포트</h2><p>${escapeHtml(level)} 기준으로 비교할 준비가 됐습니다. 지원자 통계가 연결되면 동일 기준으로 자동 비교됩니다.</p></div><div class="comparison-columns"><section class="comparison-column"><h3>나의 현재 스펙</h3>${rows}</section><section class="comparison-column pending"><h3>지원자 비교군</h3><p class="pending-copy">아직 비교 데이터가 연결되지 않았습니다.<br />향후 익명 지원자 데이터나 채용 플랫폼 API를 연결할 영역입니다.</p></section></div>`;
  showToast('기업 비교 기준을 설정했습니다.');
});

async function loadProfile() {
  try { state.activities = await request('/api/specs'); renderProfile(); }
  catch (error) { profileSummary.innerHTML = `<div class="empty-state"><strong>데이터를 불러오지 못했습니다.</strong>${escapeHtml(error.message)}</div>`; }
}
loadProfile();
