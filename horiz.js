const menuWidth = 300;

let lineColor      = 255;
let lineWeight     = 2;
let lineSpacing    = 60;

let nextRadius     = 15;
let nextSpeed      = 2;
let nextHalfWidth  = 60 / 2;

let tanA = 0, ux = 0, uy = 1; 

let graySlider, weightSlider, spacingSlider;
let radiusSlider, speedSlider, widthSlider, widthControl, tiltInput;
let styleBtn, orientBtn;

const music = new Audio('gentle-rain-for-relaxation-and-sleep-337279.mp3');

let masterInput;
let lineYs = [], bumps = [];

// Parameter-Ranges:
let speedMin, speedMax, tiltMin, tiltMax;

function mouseReleased() {
  // 1) Roh-Koordinaten in Canvas-Space
  const mx = mouseX;
  const my = mouseY;

  // 2) Tilt-Winkel in Radiant
  const angle = radians(+tiltInput);

  // 3) Verschiebe Ursprung in die Mitte & inverse Rotation
  const cx = width  / 2;
  const cy = height / 2;
  const dx = mx - cx;
  const dy = my - cy;
  // inverse Rotationsmatrix:
  const x0 = dx * cos(angle) + dy * sin(angle) + cx;
  const y0 = -dx * sin(angle) + dy * cos(angle) + cy;

  // 4) Auf die Linie projizieren
  //    Threshold passt Du je nach Abstand an (hier 10 px)
  const thresh = 10;
  for (let i = 0; i < lineYs.length; i++) {
    if (abs(y0 - lineYs[i]) < thresh) {
      spieleAusschnitt();
      // 5) Bump erzeugen und X-Start überschreiben
      const b = new SinusBump(i);
      b.x = x0;
      bumps.push(b);
      break;
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();

  masterInput   = select('#masterSlider');
  graySlider    = select('#graySlider');
  weightSlider  = select('#weightSlider');
  spacingSlider = select('#spacingSlider');
  radiusSlider  = select('#bumpRadiusSlider');
  widthControl  = select('#widthControl');

  graySlider.input(() => {
    let v = Number(graySlider.value());
    lineColor = map(v, 0, 100, 255, 50);
  });

  weightSlider.input(() => lineWeight = Number(weightSlider.value()));

  spacingSlider.input(() => {
    lineSpacing = Number(spacingSlider.value());
    resetLines();
  });

  masterInput.input(()  => {
    let speed =  Number(masterInput.value())/10;
    let winkel = (Number(masterInput.value())/100)*45;
    tiltInput = winkel;
    nextSpeed  = speed;
    bumps.forEach(b => b.speed = nextSpeed);
  });

  radiusSlider.input(() => nextRadius = Number(radiusSlider.value()));

  resetLines();
}

function draw() {
  background(0);

  // 1) Winkel in Radiant
  const angleRad = radians(+tiltInput);

  // 2) Steuerung der Transformation:
  push();
    // a) Verschiebe Ursprung ins Zentrum der Canvas
    translate(width/2, height/2);
    // b) Drehung um den Mittelpunkt
    rotate(angleRad);
    // c) Ziehe das Ganze wieder so zurück, dass deine Linien 
    //    an der gleichen Y-Abstände-Position stehen:
    translate(-width/2, -height/2);

    // 3) Jetzt zeichnest du horizontal Lines wie früher,
    //    aber sie erscheinen gekippt um die Mitte:
    stroke(100);
    stroke(lineColor);
    strokeWeight(+weightSlider.value());
    for (let y0 of lineYs) {
      line(menuWidth, y0, width, y0);
    }

    // 4) Bumps ebenfalls im transformierten Koordinatensystem:
    bumps.forEach(b => {
      b.update();
      b.display();  // display() arbeitet nach wie vor in x,y
    });
  pop();
}
/*
function mousePressed() {
  if (mouseX < menuWidth) return;
  for (let i = 0; i < lineYs.length; i++) {
    if (abs(mouseY - lineYs[i]) < 10) {
      bumps.push(new SinusBump(i, mouseX, nextRadius, nextSpeed));
      break;
    }
  }
}
*/
function resetLines() {
  lineYs = [];
  for (let y = lineSpacing; y < height; y += lineSpacing) {
    lineYs.push(y);
  }
}

class SinusBump {
  constructor(lineIndex) {
    this.lineIndex = lineIndex;
    this.radius    = +radiusSlider.value();
    this.speed     = +Number(masterInput.value())/10;
    this.x         = -PI * this.radius / 2;

    // als Array speichern:
    this.col = [random(0,50), random(50,150), random(200,255),// B
      200             // Alpha
    ];
  }

  update() {
    const w = PI * this.radius;
    this.x += this.speed;
    if (this.x > width + w) this.x = -w;
  }

  display() {
    let y0 = lineYs[this.lineIndex];
    if (y0 === undefined) return;

    const dispR = this.radius;
    const w     = PI * dispR;
    let baseY0 = y0 - (dispR - this.radius);

    // ––––– Sichtbarkeits-Check –––––
    // Wenn der gesamte Bump links oder rechts komplett außerhalb des Canvas ist,
    // überspringe das Zeichnen:
    if (this.x + w < 0 || this.x > width) {
      return;
    }

    noStroke();
    fill(...this.col);
    beginShape();
      // linke Ecke
      vertex(menuWidth, baseY0);
      for (let x = menuWidth; x <= width; x += 2) {
        const off = (x >= this.x && x <= this.x + w)
          ? sin(map(x - this.x, 0, w, PI, 0)) * dispR
          : 0;
        const bx = x;
        const by = baseY0 + x * tanA;
        const vx = bx + ux * off;
        const vy = by + uy * off;
        vertex(vx, vy);
      }
      // rechte Ecke
      vertex(width, baseY0 + width * tanA);
    endShape(CLOSE);
  }
}

function starteMusik() {
  music.volume = 0.5;
  music.play();
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