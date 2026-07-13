let allStatuses = [];
const labels = { operationeel: 'Operationeel', storing: 'Storing', onderhoud: 'Onderhoud', inrichting: 'Inrichting' };
const classes = { operationeel: 'status-ok', storing: 'status-down', onderhoud: 'status-warn', inrichting: 'status-info' };

function renderStatuses() {
  const visible = allStatuses.filter((item) => ICT.schoolMatches(item.schools));
  document.querySelector('[data-status-list]').innerHTML = visible.map((item) => `
    <article class="service-card">
      <div class="service-heading">
        <span class="status-dot ${classes[item.status] || 'status-info'}" aria-hidden="true"></span>
        <h2>${ICT.escapeHtml(item.service)}</h2>
        <span class="tag">${ICT.escapeHtml(labels[item.status] || item.status)}</span>
      </div>
      <p>${ICT.escapeHtml(item.message)}</p>
      <p class="muted">Bijgewerkt: ${ICT.escapeHtml(ICT.relativeDateTime(item.updated))}</p>
    </article>`).join('');
}

async function initStatus() {
  allStatuses = await ICT.getJson('data/status.json');
  renderStatuses();
}

document.addEventListener('ict:school-change', () => {
  if (allStatuses.length) renderStatuses();
  else initStatus().catch(console.error);
});
