# Beheer en uitbreiding

## Bericht toevoegen

Voeg een object toe aan `data/announcements.json`:

```json
{
  "id": "uniek-id",
  "title": "Titel",
  "summary": "Korte samenvatting",
  "body": "Volledige openbare tekst",
  "schools": ["vszutphen"],
  "audiences": ["Leerlingen", "Medewerkers"],
  "priority": "normaal",
  "published": "2026-07-13",
  "expires": ""
}
```

Geldige prioriteiten: `laag`, `normaal`, `hoog`.

## Handleiding toevoegen

Voeg een object toe aan `data/manuals.json`. Gebruik `status: "published"` en vul `url` in wanneer de handleiding online staat. Gebruik `status: "concept"` zolang de koppeling ontbreekt.

Plaats alleen documenten die openbaar gedeeld mogen worden. Een medewerkerstag maakt een document niet afgeschermd.

## Dienststatus aanpassen

Pas `data/status.json` aan. Gebruik een van deze statussen:

- `operationeel`
- `storing`
- `onderhoud`
- `inrichting`

Werk ook `updated` bij in ISO 8601-notatie.

## Nieuwe school toevoegen

Voeg een schoolobject toe aan `data/schools.json`:

```json
{
  "id": "nieuwe-school",
  "name": "Nieuwe school",
  "shortName": "Nieuwe school",
  "description": "ICT-informatie voor de nieuwe school.",
  "theme": {
    "primary": "#0f6f86",
    "accent": "#e76f2e"
  },
  "domains": ["voorbeeld.nl"],
  "portals": []
}
```

Vervang tijdelijke kleuren later door goedgekeurde huisstijlkleuren.

## Publicatiecontrole

Voer voor iedere publicatie uit:

```bash
python scripts/validate_site.py
```

Controleer daarna:

1. Schoolfilter op desktop en mobiel.
2. Zoekfunctie bij handleidingen.
3. Alle externe links.
4. Geen interne gegevens in bestanden of Git-geschiedenis.
5. Correcte datum en schooltoewijzing.
