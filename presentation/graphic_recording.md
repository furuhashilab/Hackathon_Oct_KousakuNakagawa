# グラレコ素材

5 つのコマで描く想定です。1 コマ 1 メッセージ、文字は少なめ。

---

## Before

**「Overture Maps、名前は聞くけど触ったことない」**

- SotM Asia / FOSS4G で何度も登場
- OSM と何が違う？ 企業データってどう混ざってる？
- 絵: 頭の上に「？」がいくつも浮かんでいる自分

## Try

**「青山キャンパスのまわりだけ、取ってみた」**

- bbox で約 2km 四方だけ切り出し
- 公式 Python ツールで 13,322 件
- 途中で Windows のセキュリティに止められる → 別ルートで突破
- 絵: 地球から四角くくり抜いた青山の地図

## Find

**「1 件ずつに“素性”が書いてある」**

- confidence … 本当にある確からしさ（でも Foursquare は全部 0.77）
- GERS ID … 毎月またいで使える固有番号
- sources … Meta 8 割 / Foursquare 15% / ライセンスも 1 件ごと
- 山岳部が「山」に!?
- 絵: POI のピンに名札（ID・点数・出身地）が付いている

## Output

**「MapLibre で Web 地図にして公開」**

- クリックで中身が見られる
- カテゴリ・confidence で絞り込み
- GitHub Pages で公開、ライセンスも整理
- 絵: スマホと PC に地図、カラフルな点

## Next

**「GERS ID で“時間”を見たい」**

- 別リリースと比べて、できた店・なくなった店
- OSM と重ねて比べる
- 絵: カレンダーと、点が増えたり消えたりする地図

---

URL: https://furuhashilab.github.io/Hackathon_Oct_KousakuNakagawa/
