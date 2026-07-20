const ROLE_LABELS = Object.freeze({
  student: 'Leerling',
  staff: 'Medewerker',
  teacher: 'Docent',
  school_admin: 'Schoolbeheerder'
});

function doGet(e) {
  let config = getSafeFallbackConfig_();
  let access;

  try {
    config = getConfig_();
    access = resolveCurrentUser_(config);
  } catch (error) {
    console.error(error);
    access = deniedResult_(
      '',
      'Het portaal is niet volledig geconfigureerd of de Workspace-controle kon niet worden uitgevoerd.'
    );
  }

  const requestedView = String((e && e.parameter && e.parameter.view) || '').trim().toLowerCase();
  const portal = buildPortalModel_(access, requestedView, config);
  const template = HtmlService.createTemplateFromFile('Index');
  template.access = access;
  template.portal = portal;
  template.config = config;
  template.roleLabels = ROLE_LABELS;

  return template.evaluate()
    .setTitle(access.allowed ? `${portal.title} | ICT-portaal` : 'Geen toegang | ICT-portaal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function resolveCurrentUser_(config) {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) {
    return deniedResult_('', 'Geen Workspace-account vastgesteld. Open deze webapp met je schoolaccount.');
  }

  const domain = email.split('@')[1] || '';
  if (domain !== config.school.domain) {
    return deniedResult_(email, `Dit account hoort niet bij ${config.school.domain}.`);
  }

  const cache = CacheService.getUserCache();
  const cacheKey = `access-${config.accessCacheVersion}-${email}`;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const memberships = new Set(
    GroupsApp.getGroups().map(group => String(group.getEmail()).trim().toLowerCase())
  );

  const roles = [];
  if (memberships.has(config.groups.student)) roles.push('student');
  if (memberships.has(config.groups.staff)) roles.push('staff');
  if (memberships.has(config.groups.teacher)) roles.push('teacher');
  if (memberships.has(config.groups.admin)) roles.push('school_admin');

  const elevated = roles.some(role => ['staff', 'teacher', 'school_admin'].includes(role));
  if (elevated && !roles.includes('staff')) roles.push('staff');

  const result = roles.length
    ? {
        allowed: true,
        reason: '',
        email,
        schoolId: config.school.id,
        schoolName: config.school.name,
        roles,
        elevated
      }
    : deniedResult_(email, 'Je account staat niet in een toegestane groep.');

  cache.put(cacheKey, JSON.stringify(result), config.cacheSeconds);
  return result;
}

function deniedResult_(email, reason) {
  return {
    allowed: false,
    reason,
    email,
    schoolId: null,
    schoolName: '',
    roles: [],
    elevated: false
  };
}

function buildPortalModel_(access, requestedView, config) {
  if (!access.allowed) return null;

  const views = [
    { id: 'student', label: 'Leerlingen' }
  ];

  if (access.elevated) {
    views.push({ id: 'staff', label: 'Medewerkers en docenten' });
  }

  const allowedViewIds = views.map(view => view.id);
  const defaultView = access.elevated ? 'staff' : 'student';
  const activeView = allowedViewIds.includes(requestedView) ? requestedView : defaultView;
  const content = getPortalContent_(config)[activeView];

  return {
    activeView,
    views,
    title: content.title,
    eyebrow: content.eyebrow,
    intro: content.intro,
    sections: content.sections
  };
}

function getPortalContent_(config) {
  return {
    student: {
      eyebrow: 'Beveiligde leerlingomgeving',
      title: 'Leerlingenportaal',
      intro: `Je ziet hier alleen informatie voor leerlingen van ${config.school.name}.`,
      sections: [
        {
          id: 'student-test',
          label: 'Leerlingen',
          description: 'Afgeschermde testinhoud',
          items: [
            {
              title: 'Leerlingtoegang werkt',
              text: 'Dit bericht wordt alleen aan leerlingen en medewerkers getoond. Het staat niet op GitHub Pages.',
              badge: 'Test geslaagd',
              url: ''
            },
            {
              title: 'Openbare handleidingen',
              text: `Open de algemene ICT-handleidingen voor ${config.school.name}.`,
              badge: 'Openbaar',
              url: config.publicManualsUrl,
              external: true
            },
            {
              title: 'Dienststatus',
              text: 'Bekijk bekende storingen en onderhoud aan ICT-diensten.',
              badge: 'Openbaar',
              url: config.publicStatusUrl,
              external: true
            }
          ]
        }
      ]
    },
    staff: {
      eyebrow: 'Beveiligde medewerkersomgeving',
      title: 'Medewerkersportaal',
      intro: 'Je ziet medewerkers-, docenten- en leerlinginformatie. Leerlingen ontvangen deze inhoud niet.',
      sections: [
        {
          id: 'staff-test',
          label: 'Medewerkers',
          description: 'Informatie voor medewerkers en docenten',
          items: [
            {
              title: 'Medewerkerstoegang werkt',
              text: 'Dit testbericht wordt alleen verzonden aan accounts met het beveiligingsniveau medewerker.',
              badge: 'Afgeschermd',
              url: ''
            }
          ]
        },
        {
          id: 'teacher-test',
          label: 'Docenten',
          description: 'Aparte inhoudscategorie binnen hetzelfde beveiligingsniveau',
          items: [
            {
              title: 'Docentencategorie werkt',
              text: 'Docenten en medewerkers delen hetzelfde beveiligingsniveau. De categorie blijft apart zichtbaar.',
              badge: 'Afgeschermd',
              url: ''
            }
          ]
        },
        {
          id: 'student-access',
          label: 'Leerlingen',
          description: 'Medewerkers mogen leerlinginformatie raadplegen',
          items: [
            {
              title: 'Open de leerlingenweergave',
              text: 'Controleer dezelfde beveiligde informatie die leerlingen te zien krijgen.',
              badge: 'Beveiligd',
              url: '?view=student',
              external: false
            }
          ]
        }
      ]
    }
  };
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
