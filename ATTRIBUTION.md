# Attribution / 出典とライセンス

このリポジトリには「自分で作ったもの」と「外部から取得したデータ」が含まれています。
それぞれライセンスが異なるので、ここで整理します。

## 1. 自作部分 — CC BY 4.0

| 対象 | ライセンス |
| --- | --- |
| `docs/index.html`, `docs/css/`, `docs/js/`（Web 地図のコード・文章・デザイン） | CC BY 4.0 |
| `scripts/`（データ取得・変換スクリプト） | CC BY 4.0 |
| `README.md`, `presentation/` などの文章 | CC BY 4.0 |
| `docs/images/` のスクリーンショット（自作部分） | CC BY 4.0（※写っている地図・データは下記の各ライセンス） |

© 2026 Kousaku Nakagawa (FuruhashiLab) — [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)（全文: [LICENSE](LICENSE)）

## 2. Overture Maps Places データ — 元のライセンスに従う

`docs/data/aoyama_places.geojson` と `docs/data/metadata.json` は
**Overture Maps Foundation** の Places テーマ（リリース `2026-09-23.1`）から切り出したデータです。
**このデータには CC BY 4.0 は適用されません。**

> Overture Maps Foundation, overturemaps.org

Overture の [Attribution ガイド](https://docs.overturemaps.org/attribution/) によると、Places は提供元ごとにライセンスが異なります。
各 POI の `sources` 項目に、その POI がどの提供元から来たか（`dataset`）と、そのライセンス（`license`）が記録されています。

| 提供元 (`dataset`) | 件数（本データ内） | ライセンス | 表示・同梱しているもの |
| --- | ---: | --- | --- |
| meta | 10,608 | CDLA Permissive 2.0 | [LICENSES/CDLA-Permissive-2.0.txt](LICENSES/CDLA-Permissive-2.0.txt) |
| Foursquare | 2,030 | Apache 2.0 | [LICENSES/Apache-2.0.txt](LICENSES/Apache-2.0.txt), [LICENSES/FOURSQUARE_NOTICE.txt](LICENSES/FOURSQUARE_NOTICE.txt) |
| Microsoft | 366 | CDLA Permissive 2.0 | 同上 CDLA |
| AllThePlaces | 309 | CC0 1.0 | [LICENSES/CC0-1.0.txt](LICENSES/CC0-1.0.txt) |
| DAC | 5 | CDLA Permissive 2.0 | 同上 CDLA |
| PinMeTo | 4 | CDLA Permissive 2.0 | 同上 CDLA |
| Overture / Overture-signals（confidence 等の算出） | 全件 | CDLA Permissive 2.0 | 同上 CDLA |

### Foursquare（Apache 2.0）について

> Copyright 2026 Foursquare Labs, Inc. All rights reserved. Available under Apache 2.0.
> Foursquare data was transformed to the Overture schema.

Apache 2.0 と Foursquare の NOTICE に従い、ライセンス全文と NOTICE 全文を同梱し、
変更内容を [NOTICE](NOTICE) に記載しています。

### 加工内容（変更の告知）

- bbox `139.6997, 35.6518, 139.7217, 35.6698`（青山キャンパス周辺 約 2km 四方）で切り出し
- GeoParquet から GeoJSON に変換
- 表示に必要な項目（`id`, `names.primary`, 英語名, `basic_category`, `taxonomy`, `confidence`（小数第3位に丸め）, `operating_status`, 最初の住所, 最初の Web サイト, `sources` の `dataset` / `license`）だけを残した
- 値そのものの書き換えはしていない

### GitHub Pages での表示

Web 地図ではデータと一緒に次のファイルも公開しています。

- `docs/data/licenses/` … CDLA / Apache 2.0 / CC0 の全文、Foursquare NOTICE、NOTICE
- 地図右下の表示: 「© Overture Maps Foundation」
- パネルの「出典」タブ: 提供元ごとのライセンスと件数

## 3. 背景地図

- [地理院タイル（淡色地図）](https://maps.gsi.go.jp/development/ichiran.html) 国土地理院

閲覧時にタイルを読み込んで表示しているだけで、このリポジトリにはタイル画像を含めていません（スクリーンショットを除く）。

## 4. 使用ライブラリ

| ライブラリ | ライセンス |
| --- | --- |
| [MapLibre GL JS](https://maplibre.org/) v6.13.0（CDN から読み込み） | BSD-3-Clause |
| [overturemaps-py](https://github.com/OvertureMaps/overturemaps-py) v1.0.2（データ取得時のみ） | MIT |
