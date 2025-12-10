let img;
let particles = [];
let faucetX, faucetY;

let waterSound;
let soundOn = false;

function preload() {
    img = loadImage("sink.png");
    waterSound = loadSound("Drip by Drip.mp3");
}

function setup() {
    // 自动获取 item1 的大小
    const container = document.getElementById("item1");
    let w = container.clientWidth;
    let h = container.clientHeight;

    // 创建与格子尺寸相同的画布
    let cnv = createCanvas(w, h);
    cnv.parent("item1");

    // 使 canvas 随着格子调整大小
    window.addEventListener("resize", () => {
        let newW = container.clientWidth;
        let newH = container.clientHeight;
        resizeCanvas(newW, newH);
        img.resize(newW, newH);
    });

    img.resize(w, h);

    cnv.mousePressed(toggleSound);

    faucetX = width * 0.33;  
    faucetY = height * 0.42;

    imageMode(CORNER);
    noStroke();
    textAlign(CENTER, CENTER);
}

function draw() {
    background(0);
    image(img, 0, 0);

    for (let i = 0; i < 2; i++) {
        particles.push(new Particle());
    }

    if (particles.length > 2000) particles.splice(0, 200);

    for (let p of particles) {
        p.update();
        p.display();
    }
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = faucetX + random(-10, 10);
        this.y = faucetY + random(-5, 5);

        this.vx = random(-0.4, 0.4);
        this.vy = random(2, 5);

        let words = ["water", "H₂O", "水"];
        this.txt = random(words);

        this.c = random([
            color(0, 255, 255),
            color(0, 150, 255),
            color(200, 240, 255)
        ]);

        this.size = random(width * 0.015, width * 0.025);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        this.x += sin(frameCount * 0.02 + this.y * 0.03) * 0.3;

        if (this.y > height) this.reset();
    }

    display() {
        fill(this.c);
        textSize(this.size);
        text(this.txt, this.x, this.y);
    }
}

function toggleSound() {
    if (soundOn) {
        waterSound.stop();
        soundOn = false;
    } else {
        waterSound.loop();
        soundOn = true;
    }
}
