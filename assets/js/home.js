function statusClass(status) {
  return ({ operationeel: 'status-ok', storing: 'status-down', onderhoud: 'status-warn', inrichting: 'status-info' })[status] || 'status-info';
}

async function renderHome() {
  const [announcements, statuses] = await Promise.all([
    ICT.getJson('data/announcements.json'),
    ICT.getJson('data/status.json')
  ]);

  const now = new Date();
  const visibleAnnouncements = announcements
    .filter((item) => ICT.schoolMatches(item.schools))
    .filter((item) => !item.expires || new Date(`${item.expires}T23:59:59`) >= now)
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, 3);

  const announcementTarget = document.querySelector('[data-home-announcements]');
  announcementTarget.innerHTML = visibleAnnouncements.length
    ? visibleAnnouncements.map((item) => `
      <article class="notice-card priority-${ICT.escapeHtml(item.priority)}">
        <div class="notice-meta"><span>${ICT.escapeHtml(ICT.formatDate(item.published))}</span><span>${ICT.escapeHtml(item.audiences.join(' · '))}</span></div>
        <h3>${ICT.escapeHtml(item.title)}</h3>
        <p>${ICT.escapeHtml(item.summary)}</p>
      </article>`).join('')
    : '<div class="empty-state"><h3>Geen actuele berichten</h3><p>Voor deze school staan geen openbare berichten klaar.</p></div>';

  const visibleStatuses = statuses.filter((item) => ICT.schoolMatches(item.schools)).slice(0, 4);
  const statusTarget = document.querySelector('[data-home-status]');
  statusTarget.innerHTML = visibleStatuses.map((item) => `
    <article class="status-row">
      <span class="status-dot ${statusClass(item.status)}" aria-hidden="true"></span>
      <div><strong>${ICT.escapeHtml(item.service)}</strong><p>${ICT.escapeHtml(item.message)}</p></div>
      <span class="status-label">${ICT.escapeHtml(item.status)}</span>
    </article>`).join('');
}

document.addEventListener('ict:school-change', () => renderHome().catch(console.error));
