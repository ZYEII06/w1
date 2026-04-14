/**
 * p5_audio_visualizer
 * 描述：結合 p5.js 與 p5.sound，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形移動反彈，大小隨音量縮放。
 */

// --- 全域變數 (Global Variables) ---

// 用來儲存畫面上所有多邊形物件的陣列
let shapes = [];

// 用來儲存水泡物件的陣列
let bubbles = [];

// 儲存載入的音樂檔案
let song;

// p5.Amplitude 物件，用來解析音樂的音量振幅
let amplitude;

// 外部定義的二維陣列，做為多邊形頂點的基礎座標 (這裡定義一個簡單的六邊形)
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];


function preload() {
  // 使用 loadSound() 載入音檔
  // 注意：請確保專案目錄下有此檔案，或替換為有效的音檔 URL
  song = loadSound('midnight-quirk-255361.mp3');
}

// --- 初始化 (Setup) ---
function setup() {
  // 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 將變數 amplitude 初始化
  amplitude = new p5.Amplitude();

  // 播放音樂並設定為循環 (Loop)
  // 注意：部分瀏覽器可能會阻擋自動播放，需透過點擊觸發
  // if (song.isLoaded()) {
  //   song.loop();
  // }

  // 使用 for 迴圈產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    
    // 隨機產生一個倍率，讓每個形狀有不同的大小，但保持比例
    let multiplier = random(10, 30);

    // 處理 points：透過 map() 讀取全域陣列 points，產生變形後的頂點
    let shapePoints = points.map(pt => {
      return [pt[0] * multiplier, pt[1] * multiplier];
    });

    // 定義形狀物件結構
    let newShape = {
      x: random(windowWidth),      // 0 到 windowWidth 之間的隨機亂數
      y: random(windowHeight),     // 0 到 windowHeight 之間的隨機亂數
      dx: random(-3, 3),           // X 軸水平移動速度
      dy: random(-3, 3),           // Y 軸垂直移動速度
      scale: random(1, 10),        // 1 到 10 之間的隨機亂數 (物件固有縮放屬性)
      color: color(random(255), random(255), random(255)), // 隨機生成的 RGB 顏色
      points: shapePoints          // 變形後的頂點陣列
    };

    // 將物件 push 到 shapes 陣列中
    shapes.push(newShape);
  }
}

// --- 繪圖迴圈 (Draw) ---
function draw() {
  // 設定背景顏色
  background('#ffcdb2');

  // --- 產生由下而上的水泡 ---
  // 隨機產生水泡
  if (random(1) < 0.1) {
    bubbles.push({
      x: random(width),
      y: height + 10,
      size: random(5, 20),
      speed: random(1, 3),
      popY: random(0, height * 0.8) // 隨機爆破位置
    });
  }

  // 更新並繪製水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.y -= b.speed;
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    circle(b.x, b.y, b.size);
    pop();
    if (b.y < b.popY) {
      bubbles.splice(i, 1);
    }
  }

  // 設定邊框粗細
  strokeWeight(2);

  // 取得當前音量大小 (0 到 1)
  let level = amplitude.getLevel();

  // 將 level 映射到 (0.5, 2) 的範圍，做為音量縮放倍率
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 使用 for...of 迴圈走訪 shapes 陣列
  for (let shape of shapes) {
    
    // --- 位置更新 ---
    shape.x += shape.dx;
    shape.y += shape.dy;

    // --- 邊緣反彈檢查 ---
    // 若 x 超出邊界，反轉 dx
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
      shape.color = color(random(255), random(255), random(255)); // 隨機改變顏色
      let newMultiplier = random(10, 30); // 隨機改變大小倍率
      shape.points = points.map(pt => [pt[0] * newMultiplier, pt[1] * newMultiplier]); // 更新頂點
    }
    // 若 y 超出邊界，反轉 dy
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
      shape.color = color(random(255), random(255), random(255)); // 隨機改變顏色
      let newMultiplier = random(10, 30); // 隨機改變大小倍率
      shape.points = points.map(pt => [pt[0] * newMultiplier, pt[1] * newMultiplier]); // 更新頂點
    }

    // --- 設定外觀 ---
    fill(shape.color);
    stroke(shape.color);

    // --- 座標轉換與縮放 ---
    push(); // 儲存當前繪圖狀態
    
    translate(shape.x, shape.y); // 將原點移動到形狀座標    

    // 如果元件往右移動 (dx > 0)，則水平翻轉
    const finalScaleX = shape.dx > 0 ? -sizeFactor : sizeFactor;
    scale(finalScaleX, -sizeFactor); // 依照音量縮放、垂直翻轉，並根據方向左右翻轉
    
    // --- 繪製多邊形 ---
    beginShape();
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]); // 畫出所有頂點
    }
    endShape(CLOSE); // 封閉圖形

    // --- 狀態還原 ---
    pop(); // 還原座標系
  }
}

// --- 額外輔助：視窗大小改變時調整畫布 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- 額外輔助：點擊畫面播放/暫停 (解決瀏覽器自動播放限制) ---
function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}
