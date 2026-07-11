(function(){
"use strict";

var STORAGE_KEY = "umakichiGame.records.v1";
var currentLevelId = 1;
var currentScore = 0;
var combo = 0;
var maxCombo = 0;
var runActive = false;
var resultProcessed = false;
var missOverlayWasActive = false;
var missedLabels = [];
var missCount = 0;
var resultSnapshot = null;

function createEmptyRecords(){
  return { version:1, levels:{} };
}

function normalizeRecord(record){
  record = record || {};
  return {
    bestScore: Number.isFinite(record.bestScore) ? Math.max(0, Math.floor(record.bestScore)) : 0,
    bestCombo: Number.isFinite(record.bestCombo) ? Math.max(0, Math.floor(record.bestCombo)) : 0,
    playCount: Number.isFinite(record.playCount) ? Math.max(0, Math.floor(record.playCount)) : 0
  };
}

function loadRecords(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return createEmptyRecords();
    var parsed = JSON.parse(raw);
    if(!parsed || typeof parsed !== "object") return createEmptyRecords();
    if(!parsed.levels || typeof parsed.levels !== "object") parsed.levels = {};
    parsed.version = 1;
    return parsed;
  }catch(e){
    return createEmptyRecords();
  }
}

function saveRecords(records){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }catch(e){}
}

function getLevelRecord(records, levelId){
  return normalizeRecord(records.levels[String(levelId)]);
}

function setLevelRecord(records, levelId, record){
  records.levels[String(levelId)] = normalizeRecord(record);
}

function getActiveLevelId(){
  var active = document.querySelector(".level-btn.active");
  var id = active ? parseInt(active.dataset.level, 10) : 1;
  return Number.isFinite(id) ? id : 1;
}

function ensureLevelRecords(){
  document.querySelectorAll(".level-btn").forEach(function(btn){
    var info = btn.querySelector(".level-info");
    var name = btn.querySelector(".level-name");
    if(!info && name){
      info = document.createElement("span");
      info.className = "level-info";
      name.parentNode.insertBefore(info, name);
      info.appendChild(name);
    }
    if(info && !info.querySelector(".level-record")){
      var record = document.createElement("span");
      record.className = "level-record";
      info.appendChild(record);
    }
  });
}

function updateLevelRecordDisplays(){
  var records = loadRecords();
  document.querySelectorAll(".level-btn").forEach(function(btn){
    var id = parseInt(btn.dataset.level, 10);
    var record = getLevelRecord(records, id);
    var el = btn.querySelector(".level-record");
    if(!el) return;
    if(record.playCount <= 0){
      el.textContent = "BEST -- / MAX --";
    }else{
      el.textContent = "BEST " + record.bestScore + " / MAX " + record.bestCombo;
    }
  });
}

function ensureComboHud(){
  var wrap = document.getElementById("hud-timer-wrap");
  if(!wrap || document.getElementById("hud-combo")) return;
  var el = document.createElement("div");
  el.id = "hud-combo";
  el.setAttribute("aria-live", "polite");
  wrap.appendChild(el);

  var gameArea = document.getElementById("game-area");
  if(gameArea && !document.getElementById("combo-milestone")){
    var milestone = document.createElement("div");
    milestone.id = "combo-milestone";
    gameArea.appendChild(milestone);
  }
}

function updateComboHud(){
  var el = document.getElementById("hud-combo");
  if(!el) return;
  el.classList.toggle("visible", combo >= 2);
  el.classList.toggle("hot", combo >= 5);
  el.classList.toggle("legend", combo >= 10);
  el.textContent = combo >= 2 ? combo + " COMBO" : "";
}

function showMilestone(text, className){
  var el = document.getElementById("combo-milestone");
  if(!el) return;
  el.className = "";
  el.textContent = text;
  void el.offsetWidth;
  el.className = "active " + (className || "");
}

function onCorrect(){
  combo++;
  if(combo > maxCombo) maxCombo = combo;
  updateComboHud();

  if(combo === 3) showMilestone("3 COMBO!", "good");
  else if(combo === 5) showMilestone("GREAT! 5 COMBO", "great");
  else if(combo === 10) showMilestone("馬肉通！10 COMBO", "excellent");
  else if(combo === 15) showMilestone("店長超え！15 COMBO", "legend");
}

function onMiss(){
  missCount++;
  if(combo >= 3) showMilestone("COMBO BREAK", "break");
  combo = 0;
  updateComboHud();

  var small = document.getElementById("gameover-small");
  var text = small ? small.textContent : "";
  var match = text.match(/「(.+?)」/);
  if(match && match[1] && missedLabels.indexOf(match[1]) === -1){
    missedLabels.push(match[1]);
  }
}

function resetRun(){
  currentLevelId = getActiveLevelId();
  currentScore = 0;
  combo = 0;
  maxCombo = 0;
  runActive = true;
  resultProcessed = false;
  missedLabels = [];
  missCount = 0;
  resultSnapshot = null;
  missOverlayWasActive = false;
  updateComboHud();
}

function ensureResultRecords(){
  var panel = document.querySelector(".result-panel");
  var score = document.getElementById("result-score");
  if(panel && score && !document.getElementById("result-records")){
    var block = document.createElement("div");
    block.id = "result-records";
    block.innerHTML =
      '<div id="result-record-badge"></div>' +
      '<div class="result-record-grid">' +
        '<div><span>BEST</span><strong id="result-best-score">0</strong></div>' +
        '<div><span>MAX COMBO</span><strong id="result-max-combo">0</strong></div>' +
      '</div>' +
      '<div id="result-goal"></div>';
    score.insertAdjacentElement("afterend", block);
  }

  var home = document.getElementById("btn-result-home");
  if(home){
    home.textContent = "TOPに戻る";
    home.classList.remove("btn-ghost");
    home.classList.add("result-home-button");
  }
}

function updateOrderHook(){
  var hook = document.querySelector(".trivia-hook");
  if(!hook) return;
  if(missedLabels.length){
    hook.textContent = "今回まちがえた「" + missedLabels[0] + "」。実物を見ながら答え合わせ！スタッフに聞いてみよう。";
  }else if(missCount > 0){
    hook.textContent = "惜しい！もう一度挑戦して、次はノーミスを目指そう。";
  }else{
    hook.textContent = "ノーミス！次は実物の食べ比べに挑戦してみよう。";
  }
}

function processResult(){
  if(resultProcessed) return;
  resultProcessed = true;

  // 最後の正解直後に時間切れになった場合でも、MutationObserverの通知前に
  // 結果画面が開く可能性があるため、HUDの値との差分をここで補完する。
  var scoreEl = document.getElementById("hud-score");
  var parsedScore = scoreEl ? parseInt(scoreEl.textContent.replace(/\D/g, ""), 10) : currentScore;
  if(Number.isFinite(parsedScore) && parsedScore > currentScore){
    for(var i = currentScore; i < parsedScore; i++) onCorrect();
  }
  if(Number.isFinite(parsedScore)) currentScore = parsedScore;
  runActive = false;

  var records = loadRecords();
  var previous = getLevelRecord(records, currentLevelId);
  var isNewBestScore = currentScore > previous.bestScore;
  var isNewBestCombo = maxCombo > previous.bestCombo;
  var next = {
    bestScore: Math.max(previous.bestScore, currentScore),
    bestCombo: Math.max(previous.bestCombo, maxCombo),
    playCount: previous.playCount + 1
  };
  setLevelRecord(records, currentLevelId, next);
  saveRecords(records);

  resultSnapshot = {
    levelId: currentLevelId,
    score: currentScore,
    maxCombo: maxCombo,
    isNewBestScore: isNewBestScore,
    isNewBestCombo: isNewBestCombo
  };

  var bestEl = document.getElementById("result-best-score");
  var comboEl = document.getElementById("result-max-combo");
  var badgeEl = document.getElementById("result-record-badge");
  var goalEl = document.getElementById("result-goal");
  if(bestEl) bestEl.textContent = next.bestScore;
  if(comboEl) comboEl.textContent = maxCombo;

  if(badgeEl){
    badgeEl.className = "";
    if(isNewBestScore){
      badgeEl.textContent = "NEW RECORD!";
      badgeEl.className = "show new-score";
    }else if(isNewBestCombo){
      badgeEl.textContent = "COMBO RECORD!";
      badgeEl.className = "show new-combo";
    }else{
      badgeEl.textContent = "";
    }
  }

  if(goalEl){
    if(isNewBestScore){
      goalEl.textContent = "自己ベスト更新！次は " + (currentScore + 1) + " 点を目指そう。";
    }else if(previous.bestScore > currentScore){
      goalEl.textContent = "BESTまであと " + (previous.bestScore - currentScore) + " 点！";
    }else{
      goalEl.textContent = "自己ベストタイ！もう一度更新を狙おう。";
    }
  }

  updateOrderHook();
  updateLevelRecordDisplays();
}

function buildShareText(){
  var snapshot = resultSnapshot || {
    levelId: currentLevelId,
    score: currentScore,
    maxCombo: maxCombo,
    isNewBestScore: false
  };
  var recordText = snapshot.isNewBestScore ? "自己ベスト" : "";
  return "【ウマキチ都立家政店】馬刺仕分け Lv." + snapshot.levelId + "で" + recordText + snapshot.score + "点！最大" + snapshot.maxCombo + "コンボ達成🐴 あなたは馬刺しを見分けられる？";
}

function bindShareButtons(){
  var gameUrl = typeof PLACEHOLDER_URL === "string" ? PLACEHOLDER_URL : location.href;
  var x = document.getElementById("btn-share-x");
  var line = document.getElementById("btn-share-line");

  if(x){
    x.addEventListener("click", function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      var url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(buildShareText())
        + "&url=" + encodeURIComponent(gameUrl)
        + "&hashtags=" + encodeURIComponent("ウマキチ都立家政店,馬刺仕分け");
      window.open(url, "_blank");
    }, true);
  }

  if(line){
    line.addEventListener("click", function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      var url = "https://social-plugins.line.me/lineit/share?url="
        + encodeURIComponent(gameUrl) + "&text=" + encodeURIComponent(buildShareText());
      window.open(url, "_blank");
    }, true);
  }
}

function observeScore(){
  var el = document.getElementById("hud-score");
  if(!el) return;
  var observer = new MutationObserver(function(){
    var next = parseInt(el.textContent.replace(/\D/g, ""), 10);
    if(!Number.isFinite(next)) return;
    if(runActive && next > currentScore){
      for(var i = currentScore; i < next; i++) onCorrect();
    }
    currentScore = next;
  });
  observer.observe(el, { childList:true, characterData:true, subtree:true });
}

function observeMisses(){
  var overlay = document.getElementById("gameover-overlay");
  if(!overlay) return;
  var observer = new MutationObserver(function(){
    var active = overlay.classList.contains("active");
    if(runActive && active && !missOverlayWasActive) onMiss();
    missOverlayWasActive = active;
  });
  observer.observe(overlay, { attributes:true, attributeFilter:["class"] });
}

function observeResultScreen(){
  var screen = document.getElementById("screen-result");
  if(!screen) return;
  var wasActive = screen.classList.contains("active");
  var observer = new MutationObserver(function(){
    var active = screen.classList.contains("active");
    if(active && !wasActive) processResult();
    wasActive = active;
  });
  observer.observe(screen, { attributes:true, attributeFilter:["class"] });
}

function bindRunStarts(){
  var start = document.getElementById("start-btn");
  var retry = document.getElementById("btn-retry");
  if(start) start.addEventListener("click", resetRun);
  if(retry) retry.addEventListener("click", resetRun);

  document.querySelectorAll(".level-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      currentLevelId = parseInt(btn.dataset.level, 10) || 1;
    });
  });
}

function init(){
  ensureLevelRecords();
  ensureComboHud();
  ensureResultRecords();
  updateLevelRecordDisplays();
  bindRunStarts();
  bindShareButtons();
  observeScore();
  observeMisses();
  observeResultScreen();
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", init, { once:true });
}else{
  setTimeout(init, 0);
}

})();
