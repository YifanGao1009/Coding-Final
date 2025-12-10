let img;
let flowers = [];
let raindrops = [];
let rainActive = true;
let autoFlowerStarted = false;

let bgMusic;
let soundOn = false; // 新增：声音状态

function preload() {
  img = loadImage("balcony.jpg");
  bgMusic = loadSound("flowers.mp3");
}

function setup() {
  createCanvas(900, 650);
  imageMode(CORNER);

  // ❌ 删除自动开启音频的 userStartAudio()
  // userStartAudio();

  for (let i = 0; i < 150; i++) {
    raindrops.push(new Rain());
  }

  // ❌ 不自动播放音乐，只切换标志位
  setTimeout(() => {
    rainActive = false;
    autoFlowerStarted = true;
  }, 3000);
}

function draw() {
  background(0);
  image(img, 0, 0, width, height);

  if (rainActive) {
    for (let r of raindrops) {
      r.update();
      r.display();
    }
  }

  if (autoFlowerStarted && flowers.length < 50 && frameCount % 20 === 0) {
    let x = random(150, 750);
    let y = random(490, 490);
    flowers.push(new Flower(x, y));
  }

  for (let f of flowers) {
    f.update();
    f.display();
  }
}

// ⭐ 点击后才开启声音
function mousePressed() {
  if (!soundOn) {
    // 浏览器需要点击后才能启用音频环境
    getAudioContext().resume();

    bgMusic.loop();
    bgMusic.setVolume(0.5);
    soundOn = true;
  } else {
    bgMusic.pause();
    soundOn = false;
  }
}

// ------------------ 雨 ------------------
class Rain {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-200, -50);
    this.vy = random(4, 7);
    this.alpha = random(100, 200);
  }

  update() {
    this.y += this.vy;
    if (this.y > height) this.reset();
  }

  display() {
    stroke(180, 200, 255, this.alpha);
    strokeWeight(2);
    line(this.x, this.y, this.x, this.y + 10);
  }
}

// ------------------ 花 ------------------
class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.stemHeight = 0;
    this.maxStem = random(220, 320);

    this.windSpeed = random(0.01, 0.05);
    this.windAmount = random(10, 18);

    this.petalColors = [
      color(255, 120, 140),
      color(255, 80, 60),
      color(255, 220, 0),
      color(80, 180, 255),
      color(160, 100, 255),
      color(255, 180, 80),
      color(255, 255, 255)
    ];
    this.petalColor = random(this.petalColors);

    this.centerColor = random([
      color(255, 0, 70),
      color(255, 160, 0),
      color(255, 230, 0),
      color(160, 0, 255),
      color(0, 150, 255)
    ]);

    this.petalSize = random(40, 50);
  }

  update() {
    if (this.stemHeight < this.maxStem) {
      this.stemHeight += 2;
    }
  }

  display() {
    push();

    let sway = sin(frameCount * this.windSpeed) * this.windAmount;

    stroke(60, 200, 90);
    strokeWeight(5);
    line(this.x, this.y, this.x + sway, this.y - this.stemHeight);

    let fx = this.x + sway;
    let fy = this.y - this.stemHeight;

    noStroke();
    fill(this.petalColor);

    for (let a = 0; a < 8; a++) {
      let ang = TWO_PI * (a / 8);
      ellipse(
        fx + cos(ang) * 28,
        fy + sin(ang) * 28,
        this.petalSize,
        this.petalSize
      );
    }

    fill(this.centerColor);
    ellipse(fx, fy, 35, 35);

    pop();
  }
}

