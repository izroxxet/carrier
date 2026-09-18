(function initializeCarrier() {
  const categoryMeta = {
    프로젝트: { symbol: '💻', subtitle: 'PROJECT' },
    자격증: { symbol: '📜', subtitle: 'CERTIFICATE' },
    대외활동: { symbol: '🚀', subtitle: 'EXTERNAL ACTIVITY' },
    논문: { symbol: '📄', subtitle: 'PAPER' },
    어학연수: { symbol: '🌍', subtitle: 'LANGUAGE PROGRAM' },
    멘토링: { symbol: '🤝', subtitle: 'MENTORING' },
    연락처: { symbol: '💼', subtitle: 'CONTACT' }
  };

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function safeExternalUrl(value) {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function safeAttachment(value) {
    return /^data:(application\/pdf|image\/(png|jpeg|webp));base64,[a-z0-9+/=]+$/i.test(value || '') ? value : '';
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  function period(details = {}) {
    if (details.startDate || details.endDate) return [formatDate(details.startDate), formatDate(details.endDate)].filter(Boolean).join(' – ');
    return formatDate(details.date || details.acquiredDate || details.publishedDate);
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || '요청을 처리하지 못했습니다.');
    return result;
  }

  function showToast(message) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function readFile(file) {
    if (!file) return Promise.resolve('');
    if (file.size > 2 * 1024 * 1024) return Promise.reject(new Error('첨부파일은 항목당 최대 2MB까지 저장할 수 있습니다.'));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('첨부파일을 읽지 못했습니다.'));
      reader.readAsDataURL(file);
    });
  }

  const activePage = document.body.dataset.page || 'dashboard';
  const sidebar = document.querySelector('#sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <a class="brand" href="/index.html" aria-label="Carrier 홈">Carrier<span>.</span></a>
      <nav class="main-nav" aria-label="주 메뉴">
        <a class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" href="/index.html"><span class="nav-icon">🏠</span><span>대시보드 · 내 커리어</span></a>
        <a class="nav-item ${activePage === 'projects' ? 'active' : ''}" href="/projects.html"><span class="nav-icon">💻</span><span>프로젝트</span></a>
        <a class="nav-item ${activePage === 'company' ? 'active' : ''}" href="/company-analysis.html"><span class="nav-icon">🎯</span><span>기업 분석</span></a>
        <a class="nav-item ${activePage === 'writing' ? 'active' : ''}" href="/writing.html"><span class="nav-icon">✍️</span><span>글 작성</span></a>
      </nav>
      <div class="sidebar-banner"><span>더 나은 커리어를 위해</span><strong>지금, 한 걸음 더.</strong><p>Build your next chapter<br />with Carrier.</p><div class="mountains"><i></i><i></i><i></i></div></div>`;
  }

  const menuButton = document.querySelector('#menuButton');
  menuButton?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  sidebar?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => sidebar.classList.remove('open')));

  window.Carrier = {
    categoryMeta, escapeHtml, safeExternalUrl, safeAttachment,
    formatDate, period, request, showToast, readFile
  };
})();
