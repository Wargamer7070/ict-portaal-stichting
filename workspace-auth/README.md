# Google Workspace-portaal voor De Vrijeschool Zutphen

Deze Google Apps Script-webapp vormt de beveiligde toegangspoort naast de openbare GitHub Pages-website.

De webapp:

- stelt het actieve Workspace-account vast;
- controleert directe Google-groepslidmaatschappen;
- kent school- en applicatierollen toe;
- levert alleen inhoud terug die bij het beveiligingsniveau hoort;
- toont leerlingen en medewerkers ieder een eigen scherm.

## Groepen

Controleer bovenaan `Code.gs` deze adressen:

- `vsz-leerlingen@vszutphen.nl`
- `vsz-medewerkers@vszutphen.nl`
- `vsz-docenten@vszutphen.nl`
- `vsz-schoolbeheerders@vszutphen.nl`

Gebruik directe groepsleden. Lidmaatschap via een onderliggende groep telt niet mee binnen deze opzet.

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

Een leerling ontvangt alleen het model voor `student`. Medewerkers- en docentengegevens staan bij een leerling dus niet verborgen in de HTML. De server stuurt deze gegevens niet naar de browser.

Een medewerker, docent of schoolbeheerder ontvangt:

- de medewerkersweergave;
- de docentencategorie;
- toegang tot de leerlingenweergave.

## Apps Script bijwerken

1. Open het bestaande project `ICT-portaal Workspace-test`.
2. Vervang `Code.gs` door `workspace-auth/Code.gs` uit deze branch.
3. Vervang `Index.html` door `workspace-auth/Index.html` uit deze branch.
4. Sla beide bestanden op.
5. Kies **Implementeren → Implementaties beheren**.
6. Open de bestaande webapp-implementatie.
7. Kies **Bewerken**.
8. Kies bij versie **Nieuwe versie**.
9. Laat **Uitvoeren als: gebruiker die de web-app opent** staan.
10. Laat toegang beperkt tot jullie Workspace-domein.
11. Klik op **Implementeren**.

De bestaande `/exec`-URL blijft bij een nieuwe versie gelijk.

## Testmatrix

Test na iedere implementatie minimaal deze vier situaties:

| Test | Verwacht resultaat |
|---|---|
| Leerling opent standaard-URL | Leerlingenportaal |
| Leerling opent `?view=staff` | Leerlingenportaal; geen medewerkersinhoud |
| Medewerker opent standaard-URL | Medewerkersportaal |
| Medewerker opent `?view=student` | Leerlingenportaal |
| Account zonder groep | Geen toegang |

Controleer bij de leerlingtest ook de paginabron en browsertools. Teksten als `Medewerkerstoegang werkt` en `Docentencategorie werkt` horen daar niet in voor te komen.

## Huidige inhoud

De huidige kaarten bevatten veilige testinhoud en openbare koppelingen. Plaats nog geen echte medewerkersinformatie in de openbare GitHub-repository.

De volgende inhoudsfase hoort gegevens uit een beveiligde bron binnen Google Workspace te lezen, bijvoorbeeld afzonderlijke Drive-mappen of gegevensbronnen met passende groepsrechten.

## Beveiligingsgrens

GitHub Pages blijft volledig openbaar. Alleen de Apps Script-webapp vormt de afgeschermde omgeving.

Plaats nooit in GitHub:

- persoonsgegevens;
- medewerkersdocumenten;
- wachtwoorden;
- OAuth-geheimen;
- serviceaccount-sleutels;
- interne links die niet openbaar mogen worden.
