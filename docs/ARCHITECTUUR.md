# Architectuur

## 1. Openbare laag

GitHub Pages host de openbare website. Deze laag bevat:

- algemene ICT-informatie;
- openbare aankondigingen;
- openbare handleidingen;
- openbare storingsmeldingen;
- links naar externe, beveiligde portalen.

De website gebruikt gewone HTML, CSS en JavaScript. Er is geen framework en geen buildstap nodig.

## 2. Gegevensmodel

Alle pagina's lezen dezelfde databronnen:

- `schools.json`: scholen, thema en portaalverwijzingen;
- `announcements.json`: openbare berichten;
- `manuals.json`: openbare handleidingen;
- `status.json`: dienststatus;
- `site.json`: algemene configuratie.

Ieder inhoudsitem heeft een lijst `schools`. Het id `all` maakt een item stichtingbreed.

## 3. Beveiligde laag

De beveiligde portalen horen buiten GitHub Pages. Een geschikte productieopzet bestaat uit:

1. Google Workspace of Microsoft Entra ID voor aanmelden.
2. Server-side controle van school en groepslidmaatschap.
3. Een API die alleen toegestane gegevens terugstuurt.
4. Logging van mislukte toegang en beheermutaties.

Rollen:

| Categorie | Beveiligingsniveau | Ziet leerlinginhoud | Ziet medewerkersinhoud |
|---|---:|---:|---:|
| Leerling | student | ja | nee |
| Medewerker | staff | ja | ja |
| Docent | staff | ja | ja |
| Schoolbeheerder | admin | ja | ja |
| Stichtingbeheerder | admin | ja | ja |

Docent en medewerker blijven aparte inhoudscategorieën, maar delen technisch niveau `staff`.

## 4. Toekomstige publieke databronnen

Voor eenvoudig beheer kunnen openbare gegevens later uit Google Sheets of Google Drive komen. Gebruik dan één kleine adapter die JSON levert. Stel CORS, caching en foutafhandeling in. Sla geen gevoelige gegevens in deze bron op.

Een veilige grens blijft leidend:

- openbare content: GitHub Pages of publieke JSON-API;
- afgeschermde content: server-side API na geverifieerde login.

## 5. Uitbreidbaarheid

Een nieuwe school vereist geen nieuwe HTML-pagina. Voeg de school toe aan `schools.json` en gebruik het school-id in de inhoudsbestanden. De schoolkiezer, filtering en themakleuren werken daarna direct.
