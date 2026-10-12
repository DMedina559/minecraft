"""Build deterministic, verified Transfer UI behavior-pack archives."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PACKS = ("transfer_ui", "bsm_api_client", "transfer_ui_bsm")


def archive(entries: dict[str, bytes]) -> bytes:
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for name, content in sorted(entries.items()):
            item = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            item.create_system = 3
            item.external_attr = 0o100644 << 16
            package.writestr(item, content)
    return output.getvalue()


def pack_entries(raw: Path) -> tuple[dict[str, bytes], dict]:
    manifest = json.loads((raw / "manifest.json").read_text(encoding="utf-8"))
    script_modules = [module for module in manifest["modules"] if module["type"] == "script"]
    if len(script_modules) != 1:
        raise ValueError(f"{raw}: expected one script entry")
    entries = {}
    for path in sorted(raw.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"Symlinks are not allowed in packs: {path}")
        if path.is_file():
            entries[path.relative_to(raw).as_posix()] = path.read_bytes()
    entry = script_modules[0]["entry"]
    if entry not in entries:
        raise ValueError(f"Missing script entry: {entry}")
    if any(module["version"] != manifest["header"]["version"] for module in manifest["modules"]):
        raise ValueError(f"{raw}: module/header versions differ")
    return entries, manifest


def verify(content: bytes, expected: dict[str, bytes]) -> None:
    with zipfile.ZipFile(io.BytesIO(content)) as package:
        if package.testzip() is not None:
            raise ValueError("Archive CRC validation failed")
        if sorted(package.namelist()) != sorted(expected):
            raise ValueError("Archive contents do not match source")
        for name, source in expected.items():
            if package.read(name) != source:
                raise ValueError(f"Archive entry differs from source: {name}")


def build(output: Path, root: Path = ROOT) -> list[Path]:
    output.mkdir(parents=True, exist_ok=True)
    products = {}
    for name in PACKS:
        entries, manifest = pack_entries(root / "addons" / name / "raw")
        version = ".".join(map(str, manifest["header"]["version"]))
        filename = f"{name}-{version}.mcpack"
        content = archive(entries)
        verify(content, entries)
        products[filename] = content
    bundle_name = "transfer_ui_bsm_bundle.mcaddon"
    bundle = archive(products)
    verify(bundle, products)
    products[bundle_name] = bundle
    paths = []
    for filename, content in sorted(products.items()):
        path = output / filename
        path.write_bytes(content)
        paths.append(path)
    checksums = "".join(
        f"{hashlib.sha256(content).hexdigest()}  {name}\n"
        for name, content in sorted(products.items())
    )
    (output / "SHA256SUMS").write_text(checksums, encoding="utf-8")
    # The BSM authentication plugin/configuration stay outside Minecraft pack payloads.
    for name in PACKS:
        for source in sorted((root / "addons" / name).glob("*.example")):
            (output / f"{name}-{source.name}").write_bytes(source.read_bytes())
        readme = root / "addons" / name / "README.md"
        (output / f"{name}-README.md").write_bytes(readme.read_bytes())
    plugin = root / "addons" / "bsm_api_client" / "bsm_addon_api_bridge.py"
    (output / plugin.name).write_bytes(plugin.read_bytes())
    return paths


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "transfer-ui")
    args = parser.parse_args()
    for path in build(args.output):
        print(path.name)
