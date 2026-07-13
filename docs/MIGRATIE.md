# Migratieplan

## Fase 1: openbare basis

Deze repository levert de stichtingbrede website met drie scholen, lokale gegevens en GitHub Pages-publicatie.

## Fase 2: bestaande openbare inhoud

1. Zet de bestaande wachtwoordhandleiding om naar een openbaar webdocument of PDF.
2. Koppel Google Authenticator-hulp.
3. Koppel de Nivo-handleidingen nadat de eigenaar de doelgroep en deelrechten heeft gecontroleerd.
4. Voeg geldige rooster- en portaal-URL's per school toe.
5. Migreer openbare aankondigingen uit de huidige Google Sheet.

## Fase 3: beheervriendelijke content

Kies één lichte beheerroute:

- Google Sheets voor berichten en status;
- Google Drive voor openbare handleidingen;
- een klein headless CMS voor beide.

Gebruik caching, schema-validatie en een lokale fallback.

## Fase 4: besloten portalen

Bouw een aparte applicatie voor leerlingen en medewerkers. Hergebruik de visuele stijl, maar voeg server-side autorisatie toe.

Aanmeldroute:

1. Gebruiker kiest school of komt via een schoolportaal.
2. Identity provider meldt de gebruiker aan.
3. Backend controleert issuer, audience, nonce en tokenhandtekening.
4. Backend leest school- en groepsrollen.
5. API retourneert alleen toegestane inhoud.

## Fase 5: beheeromgeving

Voeg een afgeschermde beheeromgeving toe met:

- berichtbeheer;
- handleidingmetadata;
- schooltoewijzing;
- doelgroepkeuze;
- publicatie- en vervaldatum;
- wijzigingslog;
- goedkeuringsstap voor medewerkersinhoud.
