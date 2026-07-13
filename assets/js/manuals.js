let allManuals = [];

function manualMatches(manual) {
  const query = document.querySelector('[data-manual-search]').value.trim().toLowerCase();
  const audience = document.querySelector('[data-audience-filter]').value;
  const category = document.querySelector('[data-category-filter]').value;
  const haystack = [manual.title, manual.summary, manual.category, ...(manual.keywords || [])].join(' ').toLowerCase();
  return ICT.schoolMatches(manual.schools)
    && (!query || haystack.includes(query))
    && (!audience || manual.audiences.includes(audience))
    && (!category || manual.category === category);
}

function renderManuals() {
  const visible = allManuals.filter(manualMatches).sort((a, b) => a.title.localeCompare(b.title, 'nl'));
  const target = document.querySelector('[data-manual-list]');
  document.querySelector('[data-manual-count]').textContent = `${visible.length} ${visible.length === 1 ? 'handleiding' : 'handleidingen'}`;

  target.innerHTML = visible.length ? visible.map((manual) => {
    const live = manual.status === 'published' && manual.url;
    return `<article class="manual-card">
      <div class="manual-icon" aria-hidden="true">${manual.category === 'Account en beveiliging' ? '🔐' : manual.category === 'Roosters' ? '🗓️' : manual.category === 'Printen' ? '🖨️' : '📘'}</div>
      <div class="manual-content">
        <div class="tag-row"><span class="tag">${ICT.escapeHtml(manual.category)}</span>${!live ? '<span class="tag tag-muted">Wordt gekoppeld</span>' : ''}</div>
        <h2>${ICT.escapeHtml(manual.title)}</h2>
        <p>${ICT.escapeHtml(manual.summary)}</p>
        <p class="manual-audience">Voor: ${ICT.escapeHtml(manual.audiences.join(', '))}</p>
      </div>
      ${live ? `<a class="button button-small" href="${ICT.escapeHtml(manual.url)}" target="_blank" rel="noopener">Openen <span aria-hidden="true">↗</span></a>` : '<span class="button button-small button-disabled" aria-disabled="true">Nog niet beschikbaar</span>'}
    </article>`;
  }).join('') : '<div class="empty-state"><h2>Geen handleidingen gevonden</h2><p>Pas je zoekterm of filters aan.</p></div>';
}

async function initManuals() {
  allManuals = await ICT.getJson('data/manuals.json');
  const categories = [...new Set(allManuals.map((item) => item.category))].sort((a, b) => a.localeCompare(b, 'nl'));
  const categorySelect = document.querySelector('[data-category-filter]');
  categorySelect.insertAdjacentHTML('beforeend', categories.map((category) => `<option>${ICT.escapeHtml(category)}</option>`).join(''));
  document.querySelectorAll('[data-manual-search], [data-audience-filter], [data-category-filter]').forEach((control) => {
    control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', renderManuals);
  });
  renderManuals();
}

document.addEventListener('ict:school-change', () => {
  if (allManuals.length) renderManuals();
  else initManuals().catch(console.error);
});
