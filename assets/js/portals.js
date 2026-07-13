function renderPortals(school) {
  const target = document.querySelector('[data-portal-list]');
  if (school.id === 'all') {
    target.innerHTML = ICT.state.schools.filter((item) => item.id !== 'all').map((item) => `
      <button class="school-choice" type="button" data-choose-school="${ICT.escapeHtml(item.id)}">
        <span class="school-choice-mark" style="--choice-color:${ICT.escapeHtml(item.theme.primary)}"></span>
        <span><strong>${ICT.escapeHtml(item.name)}</strong><small>${ICT.escapeHtml(item.description)}</small></span>
        <span aria-hidden="true">→</span>
      </button>`).join('');
    target.querySelectorAll('[data-choose-school]').forEach((button) => button.addEventListener('click', () => ICT.setSchool(button.dataset.chooseSchool)));
    return;
  }

  target.innerHTML = school.portals.map((portal) => {
    const enabled = Boolean(portal.url);
    return `<article class="portal-card">
      <div class="portal-icon" aria-hidden="true">${portal.id === 'student' ? '🎓' : portal.id === 'staff' ? '🧑‍🏫' : '🗓️'}</div>
      <div><span class="tag">${ICT.escapeHtml(portal.audience)}</span><h2>${ICT.escapeHtml(portal.label)}</h2><p>${ICT.escapeHtml(portal.description)}</p></div>
      ${enabled ? `<a class="button" href="${ICT.escapeHtml(portal.url)}" target="_blank" rel="noopener">Open portaal <span aria-hidden="true">↗</span></a>` : '<span class="button button-disabled" aria-disabled="true">Koppeling volgt</span>'}
    </article>`;
  }).join('');
}

document.addEventListener('ict:school-change', (event) => renderPortals(event.detail));
