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
  publicPortalUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/portalen.html?school=vszutphen'
});

function doGet() {
  const result = resolveCurrentUser_();
  const template = HtmlService.createTemplateFromFile('Index');
  template.result = result;
  template.config = CONFIG;

  return template.evaluate()
    .setTitle('Workspace-verificatie | ICT-portaal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function resolveCurrentUser_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) {
    return {
      allowed: false,
      reason: 'Geen Workspace-account vastgesteld. Open deze webapp met je schoolaccount.',
      email: '',
      schoolId: null,
      roles: []
    };
  }

  const domain = email.split('@')[1] || '';
  if (domain !== CONFIG.school.domain) {
    return {
      allowed: false,
      reason: `Dit account hoort niet bij ${CONFIG.school.domain}.`,
      email,
      schoolId: null,
      roles: []
    };
  }

  const memberships = new Set(
    GroupsApp.getGroups().map(group => String(group.getEmail()).toLowerCase())
  );

  const roles = [];
  if (memberships.has(CONFIG.groups.student)) roles.push('student');
  if (memberships.has(CONFIG.groups.staff)) roles.push('staff');
  if (memberships.has(CONFIG.groups.teacher)) roles.push('teacher');
  if (memberships.has(CONFIG.groups.admin)) roles.push('school_admin');

  const elevated = roles.some(role => ['staff', 'teacher', 'school_admin'].includes(role));
  if (elevated && !roles.includes('staff')) roles.push('staff');

  return {
    allowed: roles.length > 0,
    reason: roles.length > 0
      ? ''
      : 'Je account staat niet in een toegestane testgroep.',
    email,
    schoolId: CONFIG.school.id,
    schoolName: CONFIG.school.name,
    roles,
    groupCount: memberships.size
  };
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
