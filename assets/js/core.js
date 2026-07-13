const ICT = (() => {
  const cache = new Map();
  const state = { schoolId: localStorage.getItem('ict-school') || 'all', schools: [] };

  async function getJson(url) {
    if (cache.has(url)) return cache.get(url);
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Kon ${url} niet laden (${response.status}).`);
    const data = await response.json();
    cache.set(url, data);
    return data;
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function schoolMatches(itemSchools = [], schoolId = state.schoolId) {
    return schoolId === 'all' || itemSchools.includes('all') || itemSchools.includes(schoolId);
  }

  function formatDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(`${value}T12:00:00`));
  }

  function relativeDateTime(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
  }

  function setSchool(id) {
    state.schoolId = state.schools.some((school) => school.id === id) ? id : 'all';
    localStorage.setItem('ict-school', state.schoolId);
    const school = state.schools.find((entry) => entry.id === state.schoolId) || state.schools[0];
    document.documentElement.style.setProperty('--school-primary', school.theme.primary);
    document.documentElement.style.setProperty('--school-accent', school.theme.accent);
    document.querySelectorAll('[data-school-name]').forEach((node) => { node.textContent = school.shortName; });
    document.querySelectorAll('[data-school-description]').forEach((node) => { node.textContent = school.description; });
    document.querySelectorAll('[data-school-select]').forEach((select) => { select.value = school.id; });
    document.dispatchEvent(new CustomEvent('ict:school-change', { detail: school }));
  }

  async function initShell() {
    const site = await getJson('data/site.json');
    state.schools = await getJson(site.dataSources.schools);

    const select = document.querySelector('[data-school-select]');
    if (select) {
      select.innerHTML = state.schools.map((school) =>
        `<option value="${escapeHtml(school.id)}">${escapeHtml(school.name)}</option>`
      ).join('');
      select.addEventListener('change', (event) => setSchool(event.target.value));
    }

    const params = new URLSearchParams(location.search);
    const requestedSchool = params.get('school');
    setSchool(requestedSchool || state.schoolId);

    document.querySelector('[data-menu-toggle]')?.addEventListener('click', (event) => {
      const nav = document.querySelector('[data-main-nav]');
      const open = nav.classList.toggle('is-open');
      event.currentTarget.setAttribute('aria-expanded', String(open));
    });

    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
    });

    document.querySelectorAll('[data-current-year]').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  return { state, getJson, escapeHtml, schoolMatches, formatDate, relativeDateTime, setSchool, initShell };
})();

document.addEventListener('DOMContentLoaded', () => {
  ICT.initShell().catch((error) => {
    console.error(error);
    document.querySelector('[data-page-error]')?.removeAttribute('hidden');
  });
});
