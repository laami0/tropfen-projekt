const menuWidth = 300;

let lineColor      = 255;    
let lineWeight     = 2;
let lineSpacing    = 60;

let nextRadius     = 15;
let nextSpeed      = 2;
let nextHalfWidth  = 60 / 2;

let bumps         = [];
let verticalBumps = [];
let lineYs        = [];

let graySlider, weightSlider, spacingSlider;
let radiusSlider, speedSlider, widthSlider, widthControl;
let styleBtn, orientBtn;

const music = new Audio('gentle-rain-for-relaxation-and-sleep-337279.mp3');

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();

  graySlider    = select('#graySlider');
  weightSlider  = select('#weightSlider');
  spacingSlider = select('#spacingSlider');
  radiusSlider  = select('#bumpRadiusSlider');
  speedSlider   = select('#speedSlider');
  widthSlider   = select('#bumpWidthSlider');
  widthControl  = select('#widthControl');
  orientBtn     = select('#orientBtn');

  graySlider.input(() => {
    let v = Number(graySlider.value());
    lineColor = map(v, 0, 100, 255, 50);
  });

  weightSlider.input(() => lineWeight = Number(weightSlider.value()));
  spacingSlider.input(() => {
    lineSpacing = Number(spacingSlider.value());
    resetLines();
  });

  radiusSlider.input(() => nextRadius = Number(radiusSlider.value()));
  speedSlider.input(()  => nextSpeed  = Number(speedSlider.value()));
  widthSlider.input(()  => nextHalfWidth = Number(widthSlider.value())/2);

  resetLines();
}

function draw() {
  background(0);

  stroke(lineColor);
  strokeWeight(lineWeight);
  for (let y of lineYs) {
    line(menuWidth, y, width, y);
  }

  verticalBumps.forEach(vb => { vb.update(); vb.display(); });  
}

function mouseReleased() {
  if (mouseX < menuWidth) return;
  for (let i = 0; i < lineYs.length; i++) {
    if (abs(mouseY - lineYs[i]) < 10) {
      verticalBumps.push(new VerticalBump(i, mouseX, nextRadius, nextHalfWidth, nextSpeed));
      spieleAusschnitt();
      break;
    }
  }
}

function resetLines() {
  lineYs = [];
  for (let y = lineSpacing; y < height; y += lineSpacing) {
    lineYs.push(y);
  }
}

class VerticalBump {
  constructor(lineIndex, x, maxR, halfW, speed) {
    this.lineIndex  = lineIndex;
    this.x          = x;
    this.maxRadius  = maxR;
    this.halfWidth  = halfW;
    this.growSpeed  = speed;
    this.vertRadius = 0;
    this.inhalt;
    this.setStyle();
  }

  setStyle() {
    this.inhalt = color(random(0,50), random(50,150), random(200,255), 200);
    this.useStroke = false;
  }

  update() {
    this.vertRadius += this.growSpeed;
    if (this.vertRadius >= this.maxRadius) {
      this.vertRadius = 0;
      let rest = (this.maxRadius % lineSpacing)> 0.5 ? 1 : 0;
      let gesprungendeLinien = ((this.maxRadius - (this.maxRadius % lineSpacing)) / lineSpacing) + rest;
      gesprungendeLinien = gesprungendeLinien==0 ? 1 : gesprungendeLinien;
      this.lineIndex  = (this.lineIndex + gesprungendeLinien) % lineYs.length;
      spieleAusschnitt();
    }
  }

  display() {
    let y0 = lineYs[this.lineIndex];
    if (y0 === undefined) return;

    let dispV = this.vertRadius;

    // Füllung
    noStroke();
    fill(this.inhalt);
    arc(this.x, y0, this.halfWidth * 2, dispV * 2, 0, PI);
  }
}

function spieleAusschnitt() {
  const audio = new Audio('water-drops-26638.mp3');
  audio.volume = 1;
  audio.currentTime = 0.6;
  audio.play();

  setTimeout(() => {
    audio.pause();
  }, 1040);  
}

function starteMusik() {
  music.volume = 0.5;
  music.play();
}

