let allAnnouncements = [];

function renderAnnouncements() {
  const target = document.querySelector('[data-announcement-list]');
  const visible = allAnnouncements
    .filter((item) => ICT.schoolMatches(item.schools))
    .sort((a, b) => b.published.localeCompare(a.published));

  target.innerHTML = visible.length ? visible.map((item) => `
    <article class="announcement-card priority-${ICT.escapeHtml(item.priority)}">
      <div class="announcement-date"><span>${ICT.escapeHtml(ICT.formatDate(item.published))}</span><span class="tag">${ICT.escapeHtml(item.priority)}</span></div>
      <h2>${ICT.escapeHtml(item.title)}</h2>
      <p class="lead-small">${ICT.escapeHtml(item.summary)}</p>
      <p>${ICT.escapeHtml(item.body)}</p>
      <div class="tag-row">${item.audiences.map((audience) => `<span class="tag tag-muted">${ICT.escapeHtml(audience)}</span>`).join('')}</div>
    </article>`).join('') : '<div class="empty-state"><h2>Geen berichten</h2><p>Voor deze school staan geen openbare mededelingen klaar.</p></div>';
}

async function initAnnouncements() {
  allAnnouncements = await ICT.getJson('data/announcements.json');
  renderAnnouncements();
}

document.addEventListener('ict:school-change', () => {
  if (allAnnouncements.length) renderAnnouncements();
  else initAnnouncements().catch(console.error);
});
