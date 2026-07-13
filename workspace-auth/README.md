# Google Workspace-verificatie testen

Deze test gebruikt een aparte Google Apps Script-webapp. GitHub Pages blijft openbaar. De Apps Script-webapp stelt het actieve Workspace-account vast en leest alleen de Google-groepen waarvan deze gebruiker lid is.

## Standaard testgroepen

Maak in Google Admin of Google Groups deze groepen aan, of pas de adressen bovenaan `Code.gs` aan:

- `vsz-leerlingen@vszutphen.nl`
- `vsz-medewerkers@vszutphen.nl`
- `vsz-docenten@vszutphen.nl`
- `vsz-schoolbeheerders@vszutphen.nl`

Voeg minimaal één leerlingtestaccount en één medewerkerstestaccount toe.

## Apps Script aanmaken

1. Open `script.google.com` met een beheeraccount binnen `vszutphen.nl`.
2. Maak een nieuw project met de naam `ICT-portaal Workspace-test`.
3. Vervang de inhoud van `Code.gs` door `workspace-auth/Code.gs` uit deze repository.
4. Voeg een HTML-bestand met de naam `Index` toe en plak `workspace-auth/Index.html`.
5. Open **Projectinstellingen** en schakel **Manifestbestand appsscript.json weergeven in editor** in.
6. Vervang het manifest door `workspace-auth/appsscript.json`.
7. Controleer in `Code.gs` het schooldomein en de vier groepsadressen.

## Testdeployment

1. Kies **Implementeren → Nieuwe implementatie**.
2. Kies type **Web-app**.
3. Gebruik als beschrijving `Workspace verificatietest`.
4. Kies bij uitvoeren als: **Gebruiker die de web-app opent**.
5. Kies bij toegang: alleen gebruikers binnen jullie Google Workspace-domein.
6. Implementeer en kopieer de `/exec`-URL.
7. Open de URL eerst zelf en geef toestemming voor het lezen van je account-e-mailadres en groepslidmaatschappen.

## GitHub-site koppelen

Plaats de `/exec`-URL in `data/workspace-auth.json`:

```json
{
  "mode": "apps-script",
  "webAppUrl": "https://script.google.com/a/macros/vszutphen.nl/s/IMPLEMENTATIE-ID/exec",
  "enabledSchools": ["vszutphen"],
  "testDomain": "vszutphen.nl",
  "cacheSeconds": 60,
  "status": "test"
}
```

Na samenvoegen naar `main` publiceert GitHub Pages de wijziging automatisch.

## Verwachte testuitkomsten

| Account | Groepen | Verwachte rollen |
|---|---|---|
| Leerlingtest | leerlingen | `student` |
| Medewerkertest | medewerkers | `staff` |
| Docenttest | docenten | `teacher`, `staff` |
| Schoolbeheerder | schoolbeheerders | `school_admin`, `staff` |
| Account buiten domein | geen | geen toegang |
| Domeinaccount zonder groep | geen | geen toegang |

## Beveiligingsgrens

De GitHub-repository bevat geen afgeschermde documenten. De Apps Script-webapp toont in deze test alleen de vastgestelde school en rollen. Plaats medewerkersinhoud pas achter deze webapp of achter een latere backend die dezelfde controle bij ieder verzoek uitvoert.
