/* ---------------- データ定義 ---------------- */
var ASSETS = {
  akami:    { emoji:"🥩", img:"images/akami.png" },
  tategami: { emoji:"🤍", img:"images/tategami.png" },
  futagoe:  { emoji:"🥓", img:"images/futaego.png" },
  hatsu:    { emoji:"🫀", img:"images/hatsu.png" },
  tan:      { emoji:"👅", img:"images/tan.png" },
  karubi:   { emoji:"🥩", img:"images/karubi.png" },
  reba:     { emoji:"🫀", img:"images/reba.png" },
  shimofuri:{ emoji:"🥩", img:"images/shimofuri.png" },
  tencho:   { emoji:"🧑‍🍳", img:"images/tencho.png" },
  shippo:         { emoji:"🃏", img:null },
  hizume:         { emoji:"🃏", img:null },
  hanasaki:       { emoji:"🃏", img:null },
  tategami_extra: { emoji:"🃏", img:null }
};

var LABELS = {
  akami:"赤身", tategami:"タテガミ", futagoe:"フタエゴ", hatsu:"ハツ", tan:"タン", karubi:"カルビ", reba:"レバー", shimofuri:"霜降り",
  tencho:"店長",
  shippo:"尻尾トロ", hizume:"ヒヅメステーキ", hanasaki:"鼻先スジ", tategami_extra:"たてがみエキストラ"
};

var LEARN_ORDER = ["akami","tategami","futagoe","hatsu","tan","karubi","reba","shimofuri"];
var LEARN_DATA = {
  akami: {
    label:"赤身",
    image:"images/akami.png",
    trivia:"馬刺しの基本部位。脂が少なく、さっぱりした甘みが特徴です。",
    tip:"赤くて脂の白い筋が少ないものは赤身系。まずはこれを基準に覚えるのがおすすめ。"
  },
  tategami: {
    label:"タテガミ",
    image:"images/tategami.png",
    trivia:"首まわりの白い脂身。コリコリした食感で、赤身と合わせると甘みが引き立ちます。",
    tip:"白っぽく脂身中心に見えるものはタテガミ。赤身と見た目が大きく違います。"
  },
  futagoe: {
    label:"フタエゴ",
    image:"images/futaego.png",
    trivia:"あばら周りの希少部位。赤身と脂が層になっているのが特徴です。",
    tip:"赤と白の縞模様が見えたらフタエゴを疑う。白い帯が規則的に入るのがポイント。"
  },
  hatsu: {
    label:"ハツ",
    image:"images/hatsu.png",
    trivia:"心臓の部位。歯切れのよい食感が特徴で、炙ると香ばしさが増します。",
    tip:"やや濃い赤色で、つやと弾力がありそうな見た目ならハツ。"
  },
  tan: {
    label:"タン",
    image:"images/tan.png",
    trivia:"しっかりした食感と旨みがある人気部位。炙りで香りが立ちます。",
    tip:"細長く、きめが細かい見た目がヒント。赤身よりも独特の質感があります。"
  },
  karubi: {
    label:"カルビ",
    image:"images/karubi.png",
    trivia:"脂の甘みを楽しめる濃厚な部位。赤身よりリッチな味わいです。",
    tip:"赤身より脂が多く、白い差しが目立つものはカルビ系。"
  },
  reba: {
    label:"レバー",
    image:"images/reba.png",
    trivia:"独特のねっとり感と濃厚な旨みが特徴。見た目も味も個性が強い部位です。",
    tip:"つやのある濃い色味で、なめらかそうに見えるものはレバーを疑う。"
  },
  shimofuri: {
    label:"霜降り",
    image:"images/shimofuri.png",
    trivia:"脂の入り方が美しい人気部位。口どけの良さが魅力です。",
    tip:"白い差しが全体に細かく入っていれば霜降り。赤身より華やかな見た目です。"
  }
};

var CORNER_DIR_LABELS = { TL:"左上", TR:"右上", BL:"左下", BR:"右下" };
var OUT_OF_TARGET_LABEL = "対象外";

var LEVELS = [
  {
    id:1,
    timeMs:30000,
    targets:[
      { key:"akami",    label:"赤身",     corner:"TL", trap:false },
      { key:"tategami", label:"タテガミ", corner:"TR", trap:false },
      { key:"futagoe",  label:"フタエゴ", corner:"BL", trap:false },
      { key:"tencho",   label:"店長",     corner:"BR", trap:true  }
    ],
    // 出題の重み(店長は出現率低め・トラップ)
    weightedKeys:["akami","akami","akami","tategami","tategami","tategami","futagoe","futagoe","futagoe","tencho"]
  },
  {
    id:2,
    timeMs:30000,
    bossKey:"tencho",
    // 実在部位プール(毎ゲーム開始時にここから3つをシャッフルして採用)
    cutPool:["akami","tategami","futagoe","hatsu","tan","karubi","reba","shimofuri"]
  },
  {
    id:3,
    timeMs:30000,
    bossKey:"tencho",
    cardAutoAdvanceMs:1000,
    // 実在部位プール(毎ゲーム開始時にここから3つをシャッフルして採用)
    cutPool:["akami","tategami","futagoe","hatsu","tan","karubi","reba","shimofuri"]
  }
];

var PLACEHOLDER_URL = "https://fukunaga0717.github.io/UmakichiGame/";

// 結果画面の豆知識
var TRIVIA = [
  "赤身は低脂肪・高タンパク。さっぱりした甘みで生姜醤油と好相性。",
  "タテガミは首の下にある白い脂身。コリコリ食感で、赤身と一緒に食べると最強コンビ。",
  "フタエゴはあばら周りの希少部位。脂の甘みが濃厚で、部位の中でも特に貴重。",
  "ハツは歯切れのよい食感が特徴。炙ると香ばしさが増して酒のつまみに強い。",
  "タンはしっかりした食感と旨みが特徴。炙りで香りが立つ人気部位。",
  "カルビは脂の甘みを楽しめる部位。赤身とは違う濃厚さが魅力。",
  "霜降りは脂の入り方が美しい人気部位。口どけの良さが魅力。",
  "馬肉が「桜肉」と呼ばれるのは、切った時の断面が桜色をしているから。",
  "衛生管理された馬刺し用の馬肉は、生食文化のある数少ない肉のひとつ。新鮮さと管理が大事。",
  "馬肉は牛肉・豚肉に比べて低カロリー・低脂質なのに鉄分は豊富。ヘルシー志向のお客さんにもおすすめ。",
  "馬肉は栄養価の高さから「薬食い」とも呼ばれ、古くから滋養強壮の食材とされてきた。",
  "店長は部位ではありません。お会計はしっかりお願いします。",
  "Lv.2では、皿に表示されていない部位は対象外。画像だけで見分けられたらかなりの馬肉通。"
];

/* ---------------- 再挑戦促進機能の読み込み ---------------- */
(function(){
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/engagement.css";
  document.head.appendChild(link);

  var script = document.createElement("script");
  script.src = "js/engagement.js";
  document.head.appendChild(script);
})();
