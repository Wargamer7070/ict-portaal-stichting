const CONFIG_PROPERTY_NAMES = Object.freeze({
  environment: 'ENVIRONMENT',
  schoolId: 'SCHOOL_ID',
  schoolName: 'SCHOOL_NAME',
  schoolDomain: 'SCHOOL_DOMAIN',
  groupStudent: 'GROUP_STUDENT',
  groupStaff: 'GROUP_STAFF',
  groupTeacher: 'GROUP_TEACHER',
  groupAdmin: 'GROUP_ADMIN',
  publicPortalUrl: 'PUBLIC_PORTAL_URL',
  publicManualsUrl: 'PUBLIC_MANUALS_URL',
  publicStatusUrl: 'PUBLIC_STATUS_URL',
  cacheSeconds: 'CACHE_SECONDS',
  accessCacheVersion: 'ACCESS_CACHE_VERSION'
});

function getConfig_() {
  const properties = PropertiesService.getScriptProperties().getProperties();
  const required = [
    CONFIG_PROPERTY_NAMES.environment,
    CONFIG_PROPERTY_NAMES.schoolId,
    CONFIG_PROPERTY_NAMES.schoolName,
    CONFIG_PROPERTY_NAMES.schoolDomain,
    CONFIG_PROPERTY_NAMES.groupStudent,
    CONFIG_PROPERTY_NAMES.groupStaff,
    CONFIG_PROPERTY_NAMES.groupTeacher,
    CONFIG_PROPERTY_NAMES.groupAdmin,
    CONFIG_PROPERTY_NAMES.publicPortalUrl,
    CONFIG_PROPERTY_NAMES.publicManualsUrl,
    CONFIG_PROPERTY_NAMES.publicStatusUrl
  ];

  const missing = required.filter(key => !String(properties[key] || '').trim());
  if (missing.length) {
    throw new Error(`Ontbrekende Script Properties: ${missing.join(', ')}`);
  }

  const cacheSeconds = parseIntegerInRange_(
    properties[CONFIG_PROPERTY_NAMES.cacheSeconds],
    60,
    1,
    21600
  );

  return Object.freeze({
    environment: normalizeEnvironment_(properties[CONFIG_PROPERTY_NAMES.environment]),
    school: Object.freeze({
      id: String(properties[CONFIG_PROPERTY_NAMES.schoolId]).trim(),
      name: String(properties[CONFIG_PROPERTY_NAMES.schoolName]).trim(),
      domain: normalizeDomain_(properties[CONFIG_PROPERTY_NAMES.schoolDomain])
    }),
    groups: Object.freeze({
      student: normalizeEmail_(properties[CONFIG_PROPERTY_NAMES.groupStudent]),
      staff: normalizeEmail_(properties[CONFIG_PROPERTY_NAMES.groupStaff]),
      teacher: normalizeEmail_(properties[CONFIG_PROPERTY_NAMES.groupTeacher]),
      admin: normalizeEmail_(properties[CONFIG_PROPERTY_NAMES.groupAdmin])
    }),
    publicPortalUrl: validateHttpsUrl_(properties[CONFIG_PROPERTY_NAMES.publicPortalUrl], 'PUBLIC_PORTAL_URL'),
    publicManualsUrl: validateHttpsUrl_(properties[CONFIG_PROPERTY_NAMES.publicManualsUrl], 'PUBLIC_MANUALS_URL'),
    publicStatusUrl: validateHttpsUrl_(properties[CONFIG_PROPERTY_NAMES.publicStatusUrl], 'PUBLIC_STATUS_URL'),
    cacheSeconds,
    accessCacheVersion: String(
      properties[CONFIG_PROPERTY_NAMES.accessCacheVersion] || 'v1'
    ).trim()
  });
}

function getSafeFallbackConfig_() {
  return Object.freeze({
    environment: 'unknown',
    school: Object.freeze({ id: '', name: 'ICT-portaal', domain: '' }),
    groups: Object.freeze({ student: '', staff: '', teacher: '', admin: '' }),
    publicPortalUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/portalen.html',
    publicManualsUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/handleidingen.html',
    publicStatusUrl: 'https://wargamer7070.github.io/ict-portaal-stichting/status.html',
    cacheSeconds: 60,
    accessCacheVersion: 'fallback'
  });
}

function normalizeEnvironment_(value) {
  const environment = String(value || '').trim().toLowerCase();
  if (!['development', 'production'].includes(environment)) {
    throw new Error('ENVIRONMENT moet development of production zijn.');
  }
  return environment;
}

function normalizeDomain_(value) {
  const domain = String(value || '').trim().toLowerCase().replace(/^@/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    throw new Error('SCHOOL_DOMAIN bevat geen geldig domein.');
  }
  return domain;
}

function normalizeEmail_(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Ongeldig groepsadres: ${email || '(leeg)'}`);
  }
  return email;
}

function validateHttpsUrl_(value, propertyName) {
  const url = String(value || '').trim();
  if (!/^https:\/\//i.test(url)) {
    throw new Error(`${propertyName} moet met https:// beginnen.`);
  }
  return url;
}

function parseIntegerInRange_(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function getConfigurationStatus() {
  const config = getConfig_();
  return {
    configured: true,
    environment: config.environment,
    schoolId: config.school.id,
    schoolDomain: config.school.domain,
    cacheSeconds: config.cacheSeconds,
    accessCacheVersion: config.accessCacheVersion
  };
}

function bumpAccessCacheVersion() {
  const version = `v${Date.now()}`;

  PropertiesService.getScriptProperties().setProperty(
    CONFIG_PROPERTY_NAMES.accessCacheVersion,
    version
  );

  return version;
}
