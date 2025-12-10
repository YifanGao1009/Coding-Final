let bgImg;
let video;
let stars = [];
const NUM_STARS = 1200; 
let lightPos; 
let isLightOn = false; 
const LIGHT_THRESHOLD = 245; 
let candleCenter; 
const vScale = 8; 

let theMeteor;
const BASE_WIDTH = 600; 
let canvasWidth, canvasHeight;

let fireSound;
let soundOn = false;

function preload() {
  bgImg = loadImage('light.jpg'); 
  fireSound = loadSound('fire.mp3');
}

function setup() {
  canvasWidth = BASE_WIDTH;
  canvasHeight = BASE_WIDTH * (bgImg.height / bgImg.width);
  let cnv = createCanvas(canvasWidth, canvasHeight);
  
  cnv.style('display', 'block');
  cnv.style('margin', 'auto');
  cnv.style('position', 'absolute');
  cnv.style('top', '50%');
  cnv.style('left', '50%');
  cnv.style('transform', 'translate(-50%, -50%)');

  bgImg.resize(canvasWidth, canvasHeight);
  
  candleCenter = createVector(width / 2, height / 2.8); 

  video = createCapture(VIDEO);
  video.size(width / vScale, height / vScale);
  video.hide();

  lightPos = createVector(width / 2, height / 2);

  for (let i = 0; i < NUM_STARS; i++) {
    stars.push(new SmartStar());
  }
  
  theMeteor = new MeteorSystem();
}

function draw() {
  background(bgImg);

  video.loadPixels();
  let brightestVal = 0;
  let bX = 0;
  let bY = 0;

  if (video.pixels.length > 0) {
    for (let y = 0; y < video.height; y++) {
      for (let x = 0; x < video.width; x++) {
        let index = (x + y * video.width) * 4;
        let r = video.pixels[index];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];
        let bright = (r + g + b) / 3;

        if (bright > brightestVal) {
          brightestVal = bright;
          bX = video.width - 1 - x;
          bY = y;
        }
      }
    }
  }

  isLightOn = brightestVal > LIGHT_THRESHOLD;

  if (isLightOn) {
    let targetX = bX * vScale;
    let targetY = bY * vScale;
    
    lightPos.x = lerp(lightPos.x, targetX, 0.15);
    lightPos.y = lerp(lightPos.y, targetY, 0.15);
    
    theMeteor.update(lightPos);
    theMeteor.display();
  } else {
    theMeteor.reset();
  }

  for (let s of stars) {
    s.update(isLightOn, lightPos);
    s.display();
  }
}


function mousePressed() {
  if (soundOn) {
    fireSound.stop();
    soundOn = false;
  } else {
    fireSound.loop();
    soundOn = true;
  }
}


class SmartStar {
  constructor() {
    this.angle = random(TWO_PI); 
    this.orbitRadius = random(30, 120); 
    this.speed = random(0.005, 0.02) * (random() > 0.5 ? 1 : -1); 
    this.pos = createVector(0, 0); 
    this.calculateOrbitPos(); 
    this.size = random(1.0, 3.5); 
    this.blinkOffset = random(TWO_PI); 
    this.followSpeed = random(0.02, 0.2);
  }
  calculateOrbitPos() {
    let tx = candleCenter.x + cos(this.angle) * this.orbitRadius;
    let ty = candleCenter.y + sin(this.angle) * (this.orbitRadius * 0.6);
    this.pos.set(tx, ty); 
  }
  getOrbitTarget() {
    let tx = candleCenter.x + cos(this.angle) * this.orbitRadius;
    let ty = candleCenter.y + sin(this.angle) * (this.orbitRadius * 0.6);
    return createVector(tx, ty);
  }
  update(active, target) {
    if (active) {
      let destX = target.x + random(-50, 50);
      let destY = target.y + random(-50, 50);
      this.pos.x = lerp(this.pos.x, destX, this.followSpeed);
      this.pos.y = lerp(this.pos.y, destY, this.followSpeed);
    } else {
      this.angle += this.speed;
      let orbitPos = this.getOrbitTarget();
      this.pos.x = lerp(this.pos.x, orbitPos.x, 0.05);
      this.pos.y = lerp(this.pos.y, orbitPos.y, 0.05);
    }
  }
  display() {
    noStroke();
    let alpha = map(sin(frameCount * 0.05 + this.blinkOffset), -1, 1, 50, 200);
    if (isLightOn) {
        if (this.followSpeed > 0.1) {
            fill(255, 255, 255, 255); 
        } else {
            fill(255, 200, 100, random(150, 220)); 
        }
    } else {
        fill(255, 255, 200, alpha); 
    }
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class MeteorSystem {
  constructor() {
    this.pos = createVector(-100, -100);
    this.particles = []; 
  }
  reset() {
    this.pos = createVector(-100, -100);
    this.particles = [];
  }
  update(target) {
    if (this.pos.x < -50) this.pos = target.copy();
    this.pos.x = lerp(this.pos.x, target.x, 0.25); 
    this.pos.y = lerp(this.pos.y, target.y, 0.25);
    for (let i = 0; i < 8; i++) {
      this.particles.push(new TailParticle(this.pos.x, this.pos.y));
    }
  }
  display() {
    push();
    blendMode(ADD); 
    noStroke();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      p.display();
      if (p.isDead()) this.particles.splice(i, 1);
    }
    pop();
  }
}

class TailParticle {
  constructor(x, y) {
    this.pos = createVector(x + random(-40, 40), y + random(-40, 40));
    this.life = 255; 
    this.size = random(3, 8); 
    this.vel = p5.Vector.random2D().mult(4.0); 
  }
  update() {
    this.pos.add(this.vel);
    this.life -= 10; 
    this.size *= 0.95;
  }
  display() {
    fill(255, 120, 50, this.life); 
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  isDead() { return this.life < 0; }
}