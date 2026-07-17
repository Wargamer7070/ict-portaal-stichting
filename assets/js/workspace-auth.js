async function renderWorkspaceAuth() {
  const target = document.querySelector('[data-auth-test]');
  const config = await ICT.getJson('data/workspace-auth.json');
  const selectedSchool = ICT.state.schoolId;
  const enabled = config.enabledSchools.includes(selectedSchool);

  if (selectedSchool === 'all') {
    target.innerHTML = '<h2>Kies eerst De Vrijeschool Zutphen</h2><p class="muted">Het eerste beveiligde portaal staat alleen voor deze school aan.</p>';
    return;
  }

  if (!enabled) {
    target.innerHTML = '<h2>Nog niet beschikbaar voor deze school</h2><p class="muted">De Workspace-koppeling staat voorlopig alleen aan voor De Vrijeschool Zutphen.</p>';
    return;
  }

  if (!config.webAppUrl) {
    target.innerHTML = `<h2>Apps Script-URL ontbreekt</h2>
      <p>De portaalcode staat klaar, maar de Workspace-webapp moet nog worden geïmplementeerd.</p>
      <p class="muted">Plaats daarna de /exec-URL in <code>data/workspace-auth.json</code>.</p>`;
    return;
  }

  target.innerHTML = `<h2>Open je beveiligde schoolportaal</h2>
    <p>Google controleert je account en toont alleen de weergaven die bij je rol horen. Gebruik een account binnen ${ICT.escapeHtml(config.testDomain)}.</p>
    <a class="button" href="${ICT.escapeHtml(config.webAppUrl)}" target="_blank" rel="noopener">Open beveiligd portaal <span aria-hidden="true">↗</span></a>`;
}

document.addEventListener('ict:school-change', () => {
  renderWorkspaceAuth().catch((error) => {
    console.error(error);
    document.querySelector('[data-page-error]')?.removeAttribute('hidden');
  });
});
