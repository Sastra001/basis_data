# ═══════════════════════════════════════════
# CONVERT.PY — Konverter dataset.xlsx → data.js
#
# Cara pakai:
#   pip install pandas openpyxl
#   python convert.py
#
# Output: assets/js/data.js (bagian DATASET diupdate)
# ═══════════════════════════════════════════

import pandas as pd
import json
import re

EXCEL_PATH  = 'dataset.xlsx'
OUTPUT_PATH = 'assets/js/data.js'

def extract_besson(df, start_row):
    result = {}
    for _, row in df.iloc[start_row:].iterrows():
        try:
            year  = int(row[1])
            nilai = float(row[2])
            rank  = float(row[3])
        except (ValueError, TypeError):
            break
        result[str(year)] = {'nilai': nilai, 'rank': rank}
    return result

def convert():
    xl = pd.read_excel(EXCEL_PATH, sheet_name=None, header=None)

    # ── Alternative ──────────────────────────────
    alt_df      = xl['Alternative']
    alternative = {}
    for _, row in alt_df.iloc[2:].iterrows():
        year = str(int(row[0]))
        alternative[year] = {
            'bitcoin': round(float(row[1]), 6),
            'forex':   round(float(row[2]), 6)
        }

    # ── Besson Rank ──────────────────────────────
    br_df  = xl['Besson Rank']
    rows   = br_df[0].tolist()
    starts = {}
    for i, val in enumerate(rows):
        if isinstance(val, str):
            if 'C1' in val: starts['c1'] = i + 1
            if 'C2' in val: starts['c2'] = i + 1
            if 'C3' in val: starts['c3'] = i + 1
            if 'C4' in val: starts['c4'] = i + 1
            if 'C5' in val: starts['c5'] = i + 1

    besson_by_year = {}
    for ckey, start in starts.items():
        data = extract_besson(br_df, start + 1)
        for year, vals in data.items():
            if year not in besson_by_year:
                besson_by_year[year] = {}
            besson_by_year[year][ckey] = vals

    # ── Distance Score ───────────────────────────
    ds_df          = xl['Distance Score']
    distance_score = {}
    for _, row in ds_df.iloc[3:].iterrows():
        try:
            year = str(int(row[1]))
        except (ValueError, TypeError):
            continue
        distance_score[year] = {
            'c1': round(float(row[2]), 4),
            'c2': round(float(row[3]), 4),
            'c3': round(float(row[4]), 4),
            'c4': round(float(row[5]), 4),
            'c5': round(float(row[6]), 4)
        }

    # ── Gabungkan ────────────────────────────────
    output = {
        'meta': {
            'assets': list(next(iter(alternative.values())).keys()),
            'years':  sorted(alternative.keys()),
            'kriteria': {
                'c1': {'nama': 'Pertumbuhan', 'bobot': 0.45},
                'c2': {'nama': 'Penurunan',   'bobot': 0.35},
                'c3': {'nama': 'Komunitas',   'bobot': 0.25},
                'c4': {'nama': 'Popularitas', 'bobot': 0.15},
                'c5': {'nama': 'Kerugian',    'bobot': 0.05}
            }
        },
        'alternative':   alternative,
        'bessonRank':    besson_by_year,
        'distanceScore': distance_score
    }

    json_str = json.dumps(output, separators=(',', ':'))

    # Baca data.js lama, ganti hanya bagian DATASET
    with open(OUTPUT_PATH, 'r') as f:
        content = f.read()

    new_line    = f'const DATASET = {json_str};'
    new_content = re.sub(r'const DATASET = \{.*?\};', new_line, content, flags=re.DOTALL)

    with open(OUTPUT_PATH, 'w') as f:
        f.write(new_content)

    print(f'✅ Berhasil update {OUTPUT_PATH}')
    print(f'   Tahun: {len(alternative)} | Aset: {output["meta"]["assets"]}')

if __name__ == '__main__':
    convert()
