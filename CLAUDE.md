# UmakichiGame — 作業ルール

馬肉専門店「ウマキチ都立家政店」のLINEリッチメニュー用スマホゲーム。GitHub Pagesでそのまま配信（ビルドツールなし）。

## ファイル構成

- `index.html` — 画面のHTML構造 + `<link>` でCSSを読み込み + 本体JS（`<script>` 内、単一のIIFEでラップ）
- `css/style.css` — 見た目・レイアウト・アニメーションのCSS全体
- `images/` — 部位写真・部位図など（コード内で `images/xxx.png` の相対パスで参照）
- `js/`（将来分離予定。現時点ではまだ存在しない） — データ定数やゲーム本体JSをこの下に分離していく計画

現状、JSはまだ index.html に残っている。データ定数（ASSETS/LABELS/LEARN_ORDER/LEARN_DATA/CORNER_DIR_LABELS/OUT_OF_TARGET_LABEL/LEVELS/TRIVIA など）とゲーム本体ロジックが密結合しているため、分離は段階的に行う方針。

## 最重要ルール: 最小diffを徹底する

過去に「小さな修正のつもりが全体整形・圧縮・インデント変更で巨大diffになる」事故が発生している。これを防ぐため:

- **修正は対象箇所のみを部分編集する**（該当行・該当ブロックだけを変更し、周辺の無関係な行には触れない）
- **ファイル全体の再生成・再整形・minify・quote統一・インデント変更をしない**（機能要求で明示的に依頼された場合を除く）
- 1つの修正コミットの中に「機能修正」と「無関係な整形変更」を混在させない
- コミット前に必ず `git diff --stat` と `git diff` の中身を確認し、意図した箇所以外が変更されていないかチェックする
- 大きな構成変更（ファイル分割など）を行う場合も、1ステップずつ小さく進め、各ステップでdiffが機械的に検証可能（例: 抽出前後の内容が `diff` で完全一致する）であることを確認してから次に進む

## 検証手順（変更後は必ず実施）

1. 埋め込みJSの構文チェック:
   ```
   node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script>([\s\S]*)<\/script>/); new Function(m[1]); console.log('JS SYNTAX OK');"
   ```
2. ローカルサーバーで配信して確認: `python -m http.server 8000` → ブラウザ or DevToolsモバイルエミュレーションで実際に操作
   - スタート画面 → カウントダウン → Lv.1 / Lv.2 プレイ → 結果画面（学習パネル含む）→ 店員確認画面 のひと通りの導線
3. push後、公開URL（https://fukunaga0717.github.io/UmakichiGame/）で反映を確認（GitHub Pagesのビルド反映には数十秒〜数分かかることがある）

## その他

- GitHub Pagesはプロジェクトサイト（ベースURLが `/UmakichiGame/` 配下）。`css/style.css` や `images/xxx.png` のような相対パス参照はそのまま解決されるので、絶対パス（`/css/style.css` 等）は使わない
- 画像は「絵文字→画像」のフォールバック方式。`images/` に該当ファイル名のPNGを置くだけで自動的に画像表示に切り替わる仕様を維持する
