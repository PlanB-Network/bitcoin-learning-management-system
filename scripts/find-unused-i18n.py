# Before running the script, change LOCALES_DIR and SRC_DIR to match the corresponding app (or simply move the script to the app folder)
# TODO : improve this script to handle dynamic keys (e.g. t(`some.prefix.${variable}`))

import os
import json

LOCALES_DIR = "./public/locales"   # folder containing JSON translation files
SRC_DIR = "./src"               # folder where the code to check is
OUTPUT_FILE = "unused_i18n_keys.txt"

def extract_keys(data, prefix=""):
    """Recursively extract dot-separated keys from nested dicts"""
    keys = []
    for k, v in data.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.extend(extract_keys(v, full_key))
        else:
            keys.append(full_key)
    return keys


def get_all_locale_keys():
    """Get all i18n keys from locale JSON files"""
    keys = set()
    for filename in os.listdir(LOCALES_DIR):
        if not filename.endswith("en.json"):
            continue
        filepath = os.path.join(LOCALES_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                for key in extract_keys(data):
                    keys.add(key)
            except json.JSONDecodeError as e:
                print(f"⚠️ JSON error in {filename}: {e}")
    return keys


def is_key_used(key, directory):
    """Recursively check if a key is used in any file under a directory"""
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith((".js", ".jsx", ".ts", ".tsx", ".mdx")):
                continue
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if key in content:
                        return True
            except (UnicodeDecodeError, FileNotFoundError):
                pass
    return False


def main():
    print("🔍 Extracting translation keys...")
    all_keys = get_all_locale_keys()
    print(f"Found {len(all_keys)} total keys.\n")

    unused_keys = []
    checked = 0

    for key in sorted(all_keys):
        checked += 1
        if not is_key_used(key, SRC_DIR):
            unused_keys.append(key)
        if checked % 50 == 0:
            print(f"Checked {checked} keys...")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("\n".join(unused_keys))

    print(f"\n✅ Done! Found {len(unused_keys)} unused keys.")
    print(f"📄 Output saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
