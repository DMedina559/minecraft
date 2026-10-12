import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile

SOURCE = Path(__file__).resolve().parents[1] / "build_transfer_packs.py"
spec = importlib.util.spec_from_file_location("build_transfer_packs", SOURCE)
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PackBuildTests(unittest.TestCase):
    def test_builds_are_reproducible_and_match_current_sources(self):
        with tempfile.TemporaryDirectory() as directory:
            first = builder.build(Path(directory) / "first")
            second = builder.build(Path(directory) / "second")
            self.assertEqual(len(first), 4)
            for left, right in zip(first, second):
                self.assertEqual(left.read_bytes(), right.read_bytes())
            with zipfile.ZipFile(first[0]) as pack:
                self.assertIn("manifest.json", pack.namelist())
                self.assertIn("scripts/main.js", pack.namelist())
            with zipfile.ZipFile(Path(directory) / "first/transfer_ui_bsm_bundle.mcaddon") as bundle:
                self.assertEqual(len(bundle.namelist()), 3)
            self.assertTrue((Path(directory) / "first/bsm_addon_api_bridge.py").exists())

    def test_verification_rejects_modified_pack_bytes(self):
        expected = {"manifest.json": b"{}", "scripts/main.js": b"export const value=1;"}
        wrong = {**expected, "scripts/main.js": b"export const value=2;"}
        with self.assertRaisesRegex(ValueError, "differs from source"):
            builder.verify(builder.archive(wrong), expected)


if __name__ == "__main__":
    unittest.main()
