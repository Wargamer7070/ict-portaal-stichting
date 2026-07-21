# Google Workspace-portaal voor De Vrijeschool Zutphen

Deze Google Apps Script-webapp vormt de beveiligde toegangspoort naast de openbare GitHub Pages-website.

De webapp:

- stelt het actieve Workspace-account vast;
- controleert directe Google-groepslidmaatschappen;
- kent school- en applicatierollen toe;
- levert alleen inhoud terug die bij het beveiligingsniveau hoort;
- toont leerlingen en medewerkers ieder een eigen scherm.

## Bestanden

- `Code.gs`: autorisatie, rollen en server-side inhoudsfiltering.
- `Config.gs`: leest en valideert Script Properties.
- `Index.html`: beveiligde interface.
- `appsscript.json`: runtime en minimale OAuth-scopes.

## Configuratie

Groepsadressen en schoolspecifieke URL's staan niet in de code. Stel ze één keer per DEV- of PROD-project in via **Projectinstellingen → Script Properties**.

Verplichte properties:

- `ENVIRONMENT`
- `SCHOOL_ID`
- `SCHOOL_NAME`
- `SCHOOL_DOMAIN`
- `GROUP_STUDENT`
- `GROUP_STAFF`
- `GROUP_TEACHER`
- `GROUP_ADMIN`
- `PUBLIC_PORTAL_URL`
- `PUBLIC_MANUALS_URL`
- `PUBLIC_STATUS_URL`

Optioneel:

- `CACHE_SECONDS`, standaard `60`;
- `ACCESS_CACHE_VERSION`, standaard `v1`.

Voer `getConfigurationStatus()` uit in de Apps Script-editor om de configuratie te controleren. Voer `bumpAccessCacheVersion()` uit wanneer je na groepswijzigingen direct een nieuwe autorisatiecontrole wilt afdwingen.

## Rollenmodel

| Workspace-groep | Applicatierollen | Toegang |
|---|---|---|
| Leerlingen | `student` | Alleen leerlingenweergave |
| Medewerkers | `staff` | Medewerkers- en leerlingenweergave |
| Docenten | `teacher`, `staff` | Medewerkers- en leerlingenweergave |
| Schoolbeheerders | `school_admin`, `staff` | Medewerkers- en leerlingenweergave |

Docenten en medewerkers delen hetzelfde beveiligingsniveau. De inhoudscategorieën **Medewerkers** en **Docenten** blijven apart.

## Server-side scheiding

`buildPortalModel_()` bepaalt welke weergave de gebruiker ontvangt.

Een leerling ontvangt alleen het model voor `student`. Medewerkers- en docentengegevens staan niet verborgen in de HTML; de server stuurt deze gegevens niet naar de browser.

## Bijwerken

Gebruik voortaan `clasp` vanuit de repository:

```powershell
npm run push:dev
npm run deploy:dev
```

Voor GitHub Actions en productie-uitrol lees je [`docs/CLASP-WERKWIJZE.md`](../docs/CLASP-WERKWIJZE.md).

## Testmatrix

| Test | Verwacht resultaat |
|---|---|
| Leerling opent standaard-URL | Leerlingenportaal |
| Leerling opent `?view=staff` | Leerlingenportaal; geen medewerkersinhoud |
| Medewerker opent standaard-URL | Medewerkersportaal |
| Medewerker opent `?view=student` | Leerlingenportaal |
| Account zonder groep | Geen toegang |

Controleer bij de leerlingtest ook de paginabron. Teksten als `Medewerkerstoegang werkt` en `Docentencategorie werkt` horen daar niet in voor te komen.

## Beveiligingsgrens

GitHub Pages blijft volledig openbaar. Alleen de Apps Script-webapp vormt de afgeschermde omgeving.

Plaats nooit in GitHub:

- persoonsgegevens;
- medewerkersdocumenten;
- wachtwoorden;
- OAuth-geheimen;
- serviceaccount-sleutels;
- interne links die niet openbaar mogen worden.
