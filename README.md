# Stichtingbreed ICT-portaal

Een zelfstandige ICT-website voor:

- De Vrijeschool Zutphen
- De Berkel
- De Zonnewende

De openbare site draait op GitHub Pages en gebruikt één codebasis voor alle scholen. Bezoekers kiezen hun school. De pagina filtert daarna openbare berichten, handleidingen, dienststatus en portaalverwijzingen.

## Belangrijk beveiligingsprincipe

GitHub Pages levert openbare statische bestanden. Plaats daarom nooit medewerkersdocumenten, persoonsgegevens, wachtwoorden, API-sleutels, OAuth-secrets of andere interne gegevens in deze repository.

De beveiligde portalen draaien als aparte Google Apps Script-webapps. Medewerkers en docenten delen hetzelfde beveiligingsniveau. Hun inhoudscategorieën blijven apart. Medewerkers mogen leerlinginhoud zien; leerlingen krijgen nooit medewerkersinhoud.

## Structuur

```text
.
├── index.html
├── handleidingen.html
├── aankondigingen.html
├── status.html
├── portalen.html
├── over.html
├── data/
├── assets/
├── workspace-auth/
│   ├── Code.gs
│   ├── Config.gs
│   ├── Index.html
│   └── appsscript.json
├── scripts/
│   ├── validate_site.py
│   ├── validate-apps-script.mjs
│   ├── run-clasp.mjs
│   └── deploy-apps-script.mjs
├── docs/
└── .github/workflows/
```

## Lokaal bekijken

Open de openbare site via een lokale webserver. Rechtstreeks openen via `file://` blokkeert het laden van JSON in veel browsers.

```bash
python -m http.server 8080
```

Open daarna `http://localhost:8080`.

## School toevoegen

1. Voeg de school toe aan `data/schools.json`.
2. Kies een uniek `id`, bijvoorbeeld `nieuwe-school`.
3. Voeg portaalverwijzingen en themakleuren toe.
4. Gebruik het school-id in `schools` binnen de andere JSON-bestanden.
5. Voer `python scripts/validate_site.py` uit.

De bestaande pagina's en schoolkiezer nemen de school automatisch over.

## Inhoud beheren

- Berichten: `data/announcements.json`
- Handleidingen: `data/manuals.json`
- Dienststatus: `data/status.json`
- Scholen en portalen: `data/schools.json`
- Algemene instellingen: `data/site.json`

Gebruik `"schools": ["all"]` voor stichtingbrede inhoud.

## GitHub Pages

De workflow in `.github/workflows/pages.yml` valideert en publiceert de openbare site na iedere wijziging op `main`.

In de repository-instellingen moet **Pages → Build and deployment → Source** op **GitHub Actions** staan.

De verwachte URL is:

`https://wargamer7070.github.io/ict-portaal-stichting/`

## Apps Script ontwikkelen en publiceren

De beveiligde Workspace-webapp staat in `workspace-auth/`. Updates lopen via `clasp`; handmatig knippen en plakken in de Apps Script-editor is niet meer nodig.

Gebruik lokaal:

```powershell
npm install
npm run clasp:login
npm run push:dev
npm run deploy:dev
```

DEV en PROD gebruiken aparte Apps Script-projecten, deployment-ID's, technische accounts en Script Properties. GitHub Actions verzorgt handmatige DEV-deployments vanaf een gekozen branch en beschermde PROD-deployments vanaf `main`.

Lees de [volledige clasp- en releasewerkwijze](docs/CLASP-WERKWIJZE.md).

## Bestaande bronnen migreren

De oude website gebruikte onder meer:

- Google Sheets voor aankondigingen;
- Google Drive en Apps Script voor handleidingen;
- PHP-sessies voor rolcontrole;
- Google OAuth en groepsmapping;
- een apart rooster op `roostervszutphen.nl`.

De publieke gegevens staan eerst lokaal. Een latere koppeling met Sheets of Drive mag alleen openbare gegevens leveren. De Workspace-groepslogica blijft in de beveiligde Apps Script-webapp.

## Documentatie

- [Architectuur](docs/ARCHITECTUUR.md)
- [Beheer en uitbreiding](docs/BEHEER.md)
- [Beveiliging](docs/BEVEILIGING.md)
- [clasp en releases](docs/CLASP-WERKWIJZE.md)
- [Migratieplan](docs/MIGRATIE.md)
