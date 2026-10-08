"""Overture Maps Places を青山学院大学 青山キャンパス周辺だけ取得し、
Web 地図用の軽量 GeoJSON に変換するスクリプト。

使い方（リポジトリのルートで実行）:
    python -m venv .venv
    .venv/Scripts/python -m pip install overturemaps   # Windows
    .venv/Scripts/python scripts/fetch_places.py

公式の overturemaps Python Client (record_batch_reader) を使う。
CLI の `overturemaps download` は内部で shapely を読み込むが、
環境によっては OS のアプリ制御で shapely の DLL がブロックされるため、
pyarrow だけで動く Python Client を使い、Point の WKB は自前で読む。
"""

import json
import struct
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import overturemaps.core as overture

# 取得範囲 (bbox): 西経度, 南緯度, 東経度, 北緯度
# 青山キャンパス (35.6606, 139.7104) を中心に約 2km 四方
BBOX = (139.6997, 35.6518, 139.7217, 35.6698)

ROOT = Path(__file__).resolve().parent.parent
OUT_GEOJSON = ROOT / "docs" / "data" / "aoyama_places.geojson"
OUT_META = ROOT / "docs" / "data" / "metadata.json"


def wkb_point(buf):
    """WKB (Well-Known Binary) の Point から (lon, lat) を取り出す。"""
    byte_order = "<" if buf[0] == 1 else ">"
    geom_type = struct.unpack(byte_order + "I", buf[1:5])[0]
    if geom_type != 1:
        raise ValueError(f"Point 以外のジオメトリ: type={geom_type}")
    return struct.unpack(byte_order + "dd", buf[5:21])


def to_feature(row):
    lon, lat = wkb_point(row["geometry"])
    names = row.get("names") or {}
    taxonomy = row.get("taxonomy") or {}
    hierarchy = taxonomy.get("hierarchy") or []
    addresses = row.get("addresses") or []
    websites = row.get("websites") or []
    sources = [
        {
            "dataset": s.get("dataset"),
            "license": s.get("license"),
        }
        for s in (row.get("sources") or [])
    ]
    name_en = None
    for rule in names.get("rules") or []:
        if rule.get("variant") == "language" and rule.get("language") == "en":
            name_en = rule.get("value")
            break

    confidence = row.get("confidence")
    properties = {
        "id": row["id"],  # GERS ID
        "name": names.get("primary"),
        "name_en": name_en,
        "basic_category": row.get("basic_category"),
        "taxonomy_primary": taxonomy.get("primary"),
        "taxonomy_hierarchy": " > ".join(hierarchy) if hierarchy else None,
        "group": hierarchy[0] if hierarchy else "uncategorized",
        "confidence": round(confidence, 3) if confidence is not None else None,
        "operating_status": row.get("operating_status"),
        "address": addresses[0].get("freeform") if addresses else None,
        "website": websites[0] if websites else None,
        "sources": sources,
    }
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [round(lon, 7), round(lat, 7)]},
        # 値が無い項目は省いてファイルを軽くする
        "properties": {k: v for k, v in properties.items() if v is not None},
    }


def main():
    release = overture.get_latest_release()
    print(f"Overture release: {release}")
    print(f"bbox: {BBOX}")

    reader = overture.record_batch_reader("place", bbox=BBOX, release=release, stac=True)
    if reader is None:
        raise SystemExit("データを取得できませんでした")
    rows = reader.read_all().to_pylist()
    print(f"取得件数: {len(rows)}")

    features = [to_feature(r) for r in rows]
    features.sort(key=lambda f: f["properties"]["id"])  # 差分が見やすいよう並びを固定

    OUT_GEOJSON.parent.mkdir(parents=True, exist_ok=True)
    geojson = {"type": "FeatureCollection", "features": features}
    OUT_GEOJSON.write_text(
        json.dumps(geojson, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    datasets = Counter(
        s["dataset"] for f in features for s in f["properties"]["sources"]
    )
    licenses = Counter(
        f'{s["dataset"]} ({s["license"]})'
        for f in features
        for s in f["properties"]["sources"]
    )
    meta = {
        "release": release,
        "theme": "places",
        "type": "place",
        "bbox": BBOX,
        "feature_count": len(features),
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "datasets": dict(datasets.most_common()),
        "licenses": dict(licenses.most_common()),
        "groups": dict(Counter(f["properties"]["group"] for f in features).most_common()),
    }
    OUT_META.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    size_mb = OUT_GEOJSON.stat().st_size / 1024 / 1024
    print(f"出力: {OUT_GEOJSON.relative_to(ROOT)} ({size_mb:.1f} MB)")
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
