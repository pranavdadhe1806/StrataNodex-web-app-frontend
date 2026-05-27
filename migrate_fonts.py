import os

SRC = os.path.join(os.path.dirname(__file__), 'src')

REPLACEMENTS = [
    ("'Poppins, sans-serif'", "'var(--font-main)'"),
    ('"Poppins, sans-serif"', "'var(--font-main)'"),
    ("'Inter, sans-serif'", "'var(--font-main)'"),
    ('"Inter, sans-serif"', "'var(--font-main)'"),
    ("'JetBrains Mono, monospace'", "'var(--font-main)'"),
    ('"JetBrains Mono, monospace"', "'var(--font-main)'"),
]

count = 0
for root, dirs, files in os.walk(SRC):
    for fname in files:
        if not (fname.endswith('.tsx') or fname.endswith('.ts')):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        for old, new in REPLACEMENTS:
            content = content.replace(old, new)
        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {fname}")
            count += 1

print(f"\nDone. {count} files updated.")
