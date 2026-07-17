const CONFIG = Object.freeze({
  school: {
    id: 'vszutphen',
    name: 'De Vrijeschool Zutphen',
    domain: 'vszutphen.nl'
  },
  groups: {
    student: 'vsz-leerlingen@vszutphen.nl',
    staff: 'vsz-medewerkers@vszutphen.nl',
    teacher: 'vsz-docenten@vszutphen.nl',
    admin: 'vsz-schoolbeheerders@vszutphen.nl'
  },
  publicPortalUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/portalen.html?school=vszutphen',
  publicManualsUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/handleidingen.html?school=vszutphen',
  publicStatusUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/status.html?school=vszutphen',
  cacheSeconds: 60,
  accessCacheVersion: 'v2'
});

const ROLE_LABELS = Object.freeze({
  student: 'Leerling',
  staff: 'Medewerker',
  teacher: 'Docent',
  school_admin: 'Schoolbeheerder'
});

function doGet(e) {
  let access;

  try {
    access = resolveCurrentUser_();
  } catch (error) {
    console.error(error);
    access = deniedResult_(
      '',
      'De Workspace-controle kon niet worden uitgevoerd. Probeer het later opnieuw.'
    );
  }

  const requestedView = String((e && e.parameter && e.parameter.view) || '').trim().toLowerCase();
  const portal = buildPortalModel_(access, requestedView);
  const template = HtmlService.createTemplateFromFile('Index');
  template.access = access;
  template.portal = portal;
  template.config = CONFIG;
  template.roleLabels = ROLE_LABELS;

  return template.evaluate()
    .setTitle(access.allowed ? `${portal.title} | ICT-portaal` : 'Geen toegang | ICT-portaal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function resolveCurrentUser_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) {
    return deniedResult_('', 'Geen Workspace-account vastgesteld. Open deze webapp met je schoolaccount.');
  }

  const domain = email.split('@')[1] || '';
  if (domain !== CONFIG.school.domain) {
    return deniedResult_(email, `Dit account hoort niet bij ${CONFIG.school.domain}.`);
  }

  const cache = CacheService.getUserCache();
  const cacheKey = `access-${CONFIG.accessCacheVersion}-${email}`;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const memberships = new Set(
    GroupsApp.getGroups().map(group => String(group.getEmail()).trim().toLowerCase())
  );

  const roles = [];
  if (memberships.has(CONFIG.groups.student)) roles.push('student');
  if (memberships.has(CONFIG.groups.staff)) roles.push('staff');
  if (memberships.has(CONFIG.groups.teacher)) roles.push('teacher');
  if (memberships.has(CONFIG.groups.admin)) roles.push('school_admin');

  const elevated = roles.some(role => ['staff', 'teacher', 'school_admin'].includes(role));
  if (elevated && !roles.includes('staff')) roles.push('staff');

  const result = roles.length
    ? {
        allowed: true,
        reason: '',
        email,
        schoolId: CONFIG.school.id,
        schoolName: CONFIG.school.name,
        roles,
        elevated
      }
    : deniedResult_(email, 'Je account staat niet in een toegestane groep.');

  cache.put(cacheKey, JSON.stringify(result), CONFIG.cacheSeconds);
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

function buildPortalModel_(access, requestedView) {
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
  const content = getPortalContent_()[activeView];

  return {
    activeView,
    views,
    title: content.title,
    eyebrow: content.eyebrow,
    intro: content.intro,
    sections: content.sections
  };
}

function getPortalContent_() {
  return {
    student: {
      eyebrow: 'Beveiligde leerlingomgeving',
      title: 'Leerlingenportaal',
      intro: 'Je ziet hier alleen informatie voor leerlingen van De Vrijeschool Zutphen.',
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
              text: 'Open de algemene ICT-handleidingen voor De Vrijeschool Zutphen.',
              badge: 'Openbaar',
              url: CONFIG.publicManualsUrl,
              external: true
            },
            {
              title: 'Dienststatus',
              text: 'Bekijk bekende storingen en onderhoud aan ICT-diensten.',
              badge: 'Openbaar',
              url: CONFIG.publicStatusUrl,
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
