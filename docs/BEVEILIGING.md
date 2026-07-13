# Beveiliging

## GitHub Pages is openbaar

Iedereen die de website bezoekt, kan de HTML-, JavaScript- en JSON-bestanden opvragen. Verbergen met CSS, JavaScript, een knop of een doelgroepfilter geeft geen beveiliging.

Plaats nooit in deze repository:

- medewerkersberichten die leerlingen niet mogen zien;
- persoonsgegevens;
- wachtwoorden of herstelcodes;
- OAuth-client secrets;
- service-accountbestanden;
- API-tokens;
- interne Drive-links zonder passende toegangscontrole;
- documenten met leerling- of personeelsinformatie.

## Gewenste productiecontrole

Gebruik voor besloten portalen:

- HTTPS;
- OpenID Connect via Google Workspace of Microsoft Entra ID;
- server-side sessies;
- groepsmapping per school en rol;
- deny-by-default;
- server-side filtering;
- auditlogging;
- korte sessieduur en veilige cookies;
- geen geheimen in de webroot of repository.

## Toegangsregel

De server bepaalt toegang, nooit de browser.

- `student` ontvangt openbare en leerlinginhoud.
- `staff` ontvangt openbare, leerling- en medewerkersinhoud.
- `admin` ontvangt beheergegevens binnen de eigen beheerscope.

Een school-id beperkt de gegevens verder. Een medewerker van school A krijgt niet automatisch interne inhoud van school B.

## Google Groups en Entra ID

Gebruik groepen als bron voor rollen. Voorbeelden:

- `school-leerlingen@...` → student
- `school-medewerkers@...` → staff
- `school-docenten@...` → teacher + staff
- `school-ict-beheer@...` → admin + staff

Controleer groepslidmaatschap op de server. Vertrouw niet op een e-mailadres of domein als enige rolcontrole.
