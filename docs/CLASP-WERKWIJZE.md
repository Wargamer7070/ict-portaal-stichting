# clasp-implementatie en releasewerkwijze

Deze repository is de enige bron voor de Apps Script-code. Bewerk `Code.gs`, `Config.gs`, `Index.html` en `appsscript.json` niet meer handmatig in de Apps Script-editor, behalve bij de eenmalige inrichting van een nieuw project.

## Doelarchitectuur

```text
featurebranch
    │
    ├── automatische validatie
    │
    ├── handmatige deployment naar DEV
    │      └── testen met leerling, medewerker, docent en account zonder rol
    │
    └── pull request naar main
           └── handmatig goedgekeurde deployment naar PROD
```

Gebruik twee losse Apps Script-projecten:

- `ICT-portaal VSZ DEV`
- `ICT-portaal VSZ PROD`

Gebruik ook twee losse technische Google Workspace-accounts. Geef ieder account alleen bewerkingsrechten op het bijbehorende Apps Script-project. Zo geeft een uitgelekt DEV-token geen toegang tot PROD.

## Eenmalige lokale installatie

### 1. Installeer Node.js

Gebruik Node.js 20 of nieuwer.

Controleer:

```powershell
node --version
npm --version
```

### 2. Haal de repository op

```powershell
git clone https://github.com/Wargamer7070/ict-portaal-stichting.git
cd ict-portaal-stichting
npm install
```

### 3. Zet de Apps Script API aan

Open met het technische DEV-account:

```text
https://script.google.com/home/usersettings
```

Schakel **Google Apps Script API** in.

### 4. Log lokaal in bij clasp

```powershell
npm run clasp:login
```

Log in met het technische DEV-account. `clasp` bewaart het OAuth-refresh-token in je gebruikersprofiel. Deel dit bestand nooit.

### 5. Maak de lokale DEV-configuratie

```powershell
Copy-Item .clasp.dev.example.json .clasp.dev.json
Copy-Item .env.clasp.example .env.clasp
```

Open `.clasp.dev.json` en plaats het Script ID van `ICT-portaal VSZ DEV`:

```json
{
  "scriptId": "HET_SCRIPT_ID",
  "rootDir": "workspace-auth"
}
```

Je vindt het Script ID in Apps Script onder **Projectinstellingen → ID's → Script-ID**.

Plaats in `.env.clasp` het deployment-ID van de bestaande DEV-webapp:

```text
APPS_SCRIPT_DEPLOYMENT_ID_DEV=HET_DEPLOYMENT_ID
```

Je vindt dit onder **Implementeren → Implementaties beheren**.

## Eenmalige inrichting per Apps Script-project

### 1. Maak de webapp-deployment handmatig

De eerste deployment maak je in de Apps Script-editor, omdat je daar de toegangsinstellingen vastlegt:

- Type: **Web-app**
- Uitvoeren als: **Gebruiker die de web-app opent**
- Toegang: alleen gebruikers binnen de juiste Workspace-organisatie

Daarna werkt `clasp` steeds dezelfde deployment bij. De `/exec`-URL blijft gelijk.

### 2. Stel Script Properties in

Open **Projectinstellingen → Script Properties** en voeg deze waarden toe.

#### DEV-voorbeeld

| Property | Waarde |
|---|---|
| `ENVIRONMENT` | `development` |
| `SCHOOL_ID` | `vszutphen` |
| `SCHOOL_NAME` | `De Vrijeschool Zutphen` |
| `SCHOOL_DOMAIN` | `vszutphen.nl` |
| `GROUP_STUDENT` | adres van de testleerlingengroep |
| `GROUP_STAFF` | adres van de testmedewerkersgroep |
| `GROUP_TEACHER` | adres van de testdocentengroep |
| `GROUP_ADMIN` | adres van de testbeheerdersgroep |
| `PUBLIC_PORTAL_URL` | `https://wargamer7070.github.io/ict-portaal-stichting/portalen.html?school=vszutphen` |
| `PUBLIC_MANUALS_URL` | `https://wargamer7070.github.io/ict-portaal-stichting/handleidingen.html?school=vszutphen` |
| `PUBLIC_STATUS_URL` | `https://wargamer7070.github.io/ict-portaal-stichting/status.html?school=vszutphen` |
| `CACHE_SECONDS` | `60` |
| `ACCESS_CACHE_VERSION` | `v1` |

Voor PROD gebruik je dezelfde keys, maar `ENVIRONMENT=production` en de echte groepen.

Voer in de Apps Script-editor één keer `getConfigurationStatus()` uit. De functie hoort een object met `configured: true` terug te geven.

Wanneer groepslidmaatschappen tijdens een test niet snel verversen, voer je `bumpAccessCacheVersion()` uit. Daarmee krijgen alle gebruikers een nieuwe cachesleutel.

## Dagelijks lokaal werken

### Code ophalen uit Apps Script

Alleen gebruiken wanneer iemand bewust in de Apps Script-editor heeft gewerkt:

```powershell
npm run pull:dev
```

Controleer daarna altijd `git diff`. Een pull vervangt lokale bestanden.

### Lokale code naar DEV sturen

```powershell
npm run push:dev
```

Dit werkt de projectcode bij, maar maakt geen nieuwe versioned deployment. Gebruik deze opdracht samen met de `/dev`-test-URL voor een snelle ontwikkelaarscontrole.

### Automatisch pushen tijdens bewerken

```powershell
npm run watch:dev
```

Stop met `Ctrl+C`.

### DEV als vaste `/exec`-versie publiceren

```powershell
npm run deploy:dev
```

Deze opdracht voert achtereenvolgens uit:

1. Apps Script-validatie;
2. `clasp push --force`;
3. nieuwe onveranderlijke Apps Script-versie;
4. update van de bestaande DEV-deployment.

### Apps Script-editor openen

```powershell
npm run open:dev
```

### Deployments bekijken

```powershell
npm run deployments:dev
```

## GitHub Actions inrichten

Maak in GitHub onder **Settings → Environments** twee environments:

- `development`
- `production`

### Secrets voor `development`

| Secret | Inhoud |
|---|---|
| `CLASPRC_JSON` | volledige inhoud van het clasp-inlogbestand van het technische DEV-account |
| `CLASP_JSON` | `{"scriptId":"DEV_SCRIPT_ID","rootDir":"workspace-auth"}` |
| `APPS_SCRIPT_DEPLOYMENT_ID` | deployment-ID van de DEV-webapp |

### Secrets voor `production`

Gebruik dezelfde namen, maar waarden van het technische PROD-account en PROD-project.

Het clasp-inlogbestand staat doorgaans in je gebruikersprofiel als `.clasprc.json`. Behandel de inhoud als een wachtwoord. Plaats het nooit in Git, een issue, chatbericht of logbestand.

### Productie beschermen

Stel bij het environment `production` in:

- verplichte reviewer;
- voorkom zelfgoedkeuring wanneer een tweede beheerder beschikbaar is;
- deployment branches: alleen `main`.

Environment-secrets komen pas beschikbaar nadat de deployment is goedgekeurd.

## GitHub-werkwijze

### 1. Maak een featurebranch

```powershell
git switch main
git pull
git switch -c feature/naam-van-wijziging
```

### 2. Werk en valideer

```powershell
npm run check
```

### 3. Push je branch

```powershell
git add .
git commit -m "Beschrijf de wijziging"
git push -u origin feature/naam-van-wijziging
```

### 4. Deploy dezelfde branch naar DEV

Open in GitHub:

```text
Actions → Deploy Apps Script DEV → Run workflow
```

Vul bij `ref` de branchnaam in. De workflow uploadt exact die branch naar het DEV-project en werkt de vaste DEV-URL bij.

### 5. Voer de testmatrix uit

| Account | Verwacht |
|---|---|
| Leerling | alleen leerlingenweergave |
| Leerling met `?view=staff` | nog steeds leerlingenweergave |
| Medewerker | medewerkers- en leerlingenweergave |
| Docent | medewerkersweergave met aparte docentencategorie |
| Account zonder groep | geen toegang |

### 6. Voeg de pull request samen

Voeg pas samen wanneer de DEV-test slaagt en de automatische validatie groen is.

### 7. Publiceer PROD

Open:

```text
Actions → Deploy Apps Script PROD → Run workflow
```

De workflow gebruikt altijd `main`. GitHub wacht eerst op goedkeuring van het `production` environment en werkt daarna de bestaande PROD-deployment bij.

## Terugrollen

Apps Script-versies zijn onveranderlijk. Bij een fout kun je in **Implementeren → Implementaties beheren** de bestaande deployment terugzetten naar een eerdere versie. De URL blijft gelijk.

Na een terugrol:

1. herstel de fout in Git;
2. maak een nieuwe commit;
3. test opnieuw in DEV;
4. publiceer daarna een nieuwe PROD-versie.

## Veiligheidsregels

- Bewerk productiecode niet rechtstreeks in de Apps Script-editor.
- Commit nooit `.clasprc.json`, `.clasp.json`, `.clasp.dev.json`, `.clasp.prod.json` of `.env.clasp`.
- Gebruik aparte Google-accounts en aparte OAuth-tokens voor DEV en PROD.
- Laat PROD alleen vanuit `main` uitrollen.
- Bewaar groepsadressen en schoolspecifieke configuratie in Script Properties.
- Maak de eerste webapp-deployment handmatig met de juiste `execute as`- en toegangsinstellingen.
- Roteer clasp-tokens wanneer een technisch account, laptop of beheerder verandert.
