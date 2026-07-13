#!/usr/bin/env python3
"""Validate JSON structure and local links without third-party packages."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        ERRORS.append(f"{path.relative_to(ROOT)}: {exc}")
        return None


def require_keys(item: dict, keys: set[str], source: str) -> None:
    missing = sorted(keys - item.keys())
    if missing:
        ERRORS.append(f"{source}: ontbrekende velden: {', '.join(missing)}")


def validate_data() -> set[str]:
    schools = load_json(ROOT / "data/schools.json") or []
    ids: set[str] = set()
    for index, school in enumerate(schools):
        source = f"data/schools.json[{index}]"
        require_keys(school, {"id", "name", "shortName", "description", "theme", "portals"}, source)
        school_id = school.get("id")
        if school_id in ids:
            ERRORS.append(f"{source}: dubbel school-id {school_id}")
        if school_id:
            ids.add(school_id)

    if "all" not in ids:
        ERRORS.append("data/schools.json: school-id 'all' ontbreekt")

    sources = {
        "data/announcements.json": {"id", "title", "summary", "body", "schools", "audiences", "priority", "published"},
        "data/manuals.json": {"id", "title", "summary", "category", "schools", "audiences", "url", "status"},
        "data/status.json": {"id", "service", "status", "message", "schools", "updated"},
    }
    for filename, required in sources.items():
        items = load_json(ROOT / filename) or []
        seen: set[str] = set()
        for index, item in enumerate(items):
            source = f"{filename}[{index}]"
            require_keys(item, required, source)
            item_id = item.get("id")
            if item_id in seen:
                ERRORS.append(f"{source}: dubbel id {item_id}")
            if item_id:
                seen.add(item_id)
            unknown = set(item.get("schools", [])) - ids
            if unknown:
                ERRORS.append(f"{source}: onbekende school-id's: {', '.join(sorted(unknown))}")
    return ids


def validate_html_links() -> None:
    attr_pattern = re.compile(r'''(?:href|src)=["']([^"']+)["']''')
    for html in ROOT.glob("*.html"):
        text = html.read_text(encoding="utf-8")
        if "<html lang=\"nl\"" not in text and "<html lang='nl'" not in text:
            ERRORS.append(f"{html.name}: lang=nl ontbreekt")
        if "<meta name=\"viewport\"" not in text:
            ERRORS.append(f"{html.name}: viewport-meta ontbreekt")
        for target in attr_pattern.findall(text):
            if target.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
                continue
            clean = target.split("?", 1)[0].split("#", 1)[0]
            if not clean:
                continue
            path = (html.parent / clean).resolve()
            try:
                path.relative_to(ROOT)
            except ValueError:
                ERRORS.append(f"{html.name}: link buiten project: {target}")
                continue
            if not path.exists():
                ERRORS.append(f"{html.name}: ontbrekend lokaal doel: {target}")


def main() -> int:
    validate_data()
    validate_html_links()
    if ERRORS:
        print("Validatie mislukt:")
        for error in ERRORS:
            print(f"- {error}")
        return 1
    print("Validatie geslaagd: JSON, school-id's en lokale links kloppen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
