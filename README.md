# Stichtingbreed ICT-portaal

Een zelfstandige, statische ICT-website voor:

- De Vrijeschool Zutphen
- De Berkel
- De Zonnewende

De site draait op GitHub Pages en gebruikt één codebasis voor alle scholen. Bezoekers kiezen hun school. De pagina filtert daarna openbare berichten, handleidingen, dienststatus en portaalverwijzingen.

## Belangrijk beveiligingsprincipe

GitHub Pages levert openbare statische bestanden. Plaats daarom nooit medewerkersdocumenten, persoonsgegevens, wachtwoorden, API-sleutels, OAuth-secrets of andere interne gegevens in deze repository.

Leerlingen- en medewerkersportalen horen achter een aparte authenticatielaag met Google Workspace of Microsoft Entra ID. Medewerkers en docenten delen hetzelfde beveiligingsniveau. Hun inhoudscategorieën blijven wel apart. Medewerkers mogen leerlinginhoud zien; leerlingen krijgen nooit medewerkersinhoud.

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
│   ├── site.json
│   ├── schools.json
│   ├── announcements.json
│   ├── manuals.json
│   └── status.json
├── assets/
│   ├── css/styles.css
│   ├── js/
│   └── images/
├── docs/
├── scripts/validate_site.py
└── .github/workflows/pages.yml
```

## Lokaal bekijken

Open de site via een lokale webserver. Rechtstreeks openen via `file://` blokkeert het laden van JSON in veel browsers.

```bash
python -m http.server 8080
```

Open daarna `http://localhost:8080`.

## School toevoegen

1. Voeg de school toe aan `data/schools.json`.
2. Kies een uniek `id`, bijvoorbeeld `nieuwe-school`.
3. Voeg portaalverwijzingen en tijdelijke themakleuren toe.
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

De workflow in `.github/workflows/pages.yml` valideert en publiceert de site na iedere wijziging op `main`.

In de repository-instellingen moet **Pages > Build and deployment > Source** op **GitHub Actions** staan.

De verwachte URL is:

`https://wargamer7070.github.io/ict-portaal-stichting/`

## Bestaande bronnen migreren

De oude website gebruikte onder meer:

- Google Sheets voor aankondigingen
- Google Drive en Apps Script voor handleidingen
- PHP-sessies voor rolcontrole
- Google OAuth en groepsmapping
- een apart rooster op `roostervszutphen.nl`

Deze repository start schoon. De publieke gegevens staan eerst lokaal. Een latere koppeling met Sheets of Drive moet alleen openbare gegevens leveren. De OAuth- en groepslogica verhuist naar een aparte beveiligde applicatie, niet naar GitHub Pages.

## Documentatie

- [Architectuur](docs/ARCHITECTUUR.md)
- [Beheer en uitbreiding](docs/BEHEER.md)
- [Beveiliging](docs/BEVEILIGING.md)
- [Migratieplan](docs/MIGRATIE.md)
