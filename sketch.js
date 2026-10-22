// ============================================
// BLOCK BUSTER - 90s RETRO ARCADE
// p5.js Web Editor — sketch.js only
// ============================================

let paddle;
let ball;
let bricks = [];
let particles = [];

let score = 0;
let maxScore = 0;
let lives = 3;
let level = 1;

let gameState = "ready";
// States: ready, playing, gameover, win

const CANVAS_W = 600;
const CANVAS_H = 700;

const PADDLE_W = 105;
const PADDLE_H = 13;
const PADDLE_Y = 640;

const BALL_RADIUS = 8;

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_W = 48;
const BRICK_H = 20;
const BRICK_GAP = 6;
const BRICK_TOP = 100;

const START_SPEED = 5;
const MAX_SPEED = 10;
const SPEED_PER_BRICK = 0.035;

const BRICK_COLORS = [
  "#ff4d6d",
  "#ff8c42",
  "#ffd166",
  "#06d6a0",
  "#4cc9f0",
  "#9b5de5"
];

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  textFont("monospace");

  paddle = {
    x: width / 2 - PADDLE_W / 2,
    y: PADDLE_Y,
    w: PADDLE_W,
    h: PADDLE_H,
    speed: 8
  };

  resetBall();
  createBricks();
}

function draw() {
  drawBackground();
  drawHUD();

  if (gameState === "ready") {
    drawBricks();
    drawPaddle();
    drawBall();
    drawReadyScreen();
  } else if (gameState === "playing") {
    updatePaddle();
    updateBall();
    updateParticles();

    drawBricks();
    drawPaddle();
    drawBall();
    drawParticles();

    checkWin();
  } else if (gameState === "gameover") {
    drawBricks();
    drawPaddle();
    drawGameOverScreen();
  } else if (gameState === "win") {
    drawBricks();
    drawPaddle();
    drawWinScreen();
  }
}

// ============================================
// BACKGROUND
// ============================================

function drawBackground() {
  background(10, 12, 30);

  // Retro grid
  stroke(30, 38, 68, 100);
  strokeWeight(1);

  for (let x = 0; x < width; x += 30) {
    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += 30) {
    line(0, y, width, y);
  }

  // Neon borders
  noFill();
  stroke(0, 220, 255, 180);
  strokeWeight(2);
  rect(8, 8, width - 16, height - 16, 8);

  noStroke();
}

// ============================================
// HUD
// ============================================

function drawHUD() {
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(15);

  fill("#4cc9f0");
  text("SCORE", 24, 35);

  fill("#ffffff");
  text(score, 24, 58);

  fill("#ffd166");
  text("MAX SCORE", 210, 35);

  fill("#ffffff");
  text(maxScore, 210, 58);

  fill("#ff4d6d");
  text("LIVES", 455, 35);

  fill("#ffffff");
  text(lives, 455, 58);

  fill("#9b5de5");
  text("LEVEL " + level, 455, 80);

  // Current ball speed
  fill("#9aa4c7");
  textSize(10);
  textAlign(LEFT, CENTER);
  text("BALL SPEED: " + getBallSpeed().toFixed(1), 24, 80);
}

// ============================================
// BRICKS
// ============================================

function createBricks() {
  bricks = [];

  const totalWidth =
    BRICK_COLS * BRICK_W +
    (BRICK_COLS - 1) * BRICK_GAP;

  const startX = (width - totalWidth) / 2;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: startX + col * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        color: BRICK_COLORS[row],
        alive: true
      });
    }
  }
}

function drawBricks() {
  for (let brick of bricks) {
    if (!brick.alive) continue;

    // Neon glow
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = brick.color;

    noStroke();
    fill(brick.color);
    rect(brick.x, brick.y, brick.w, brick.h, 4);

    drawingContext.shadowBlur = 0;

    // Highlight
    fill(255, 255, 255, 90);
    rect(brick.x + 4, brick.y + 3, brick.w - 8, 3, 2);
  }
}

// ============================================
// PADDLE
// ============================================

function updatePaddle() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    paddle.x -= paddle.speed;
  }

  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    paddle.x += paddle.speed;
  }

  // Mouse control
  if (mouseIsPressed) {
    paddle.x = mouseX - paddle.w / 2;
  }

  paddle.x = constrain(paddle.x, 12, width - paddle.w - 12);
}

function drawPaddle() {
  drawingContext.shadowBlur = 18;
  drawingContext.shadowColor = "#4cc9f0";

  noStroke();
  fill("#4cc9f0");
  rect(paddle.x, paddle.y, paddle.w, paddle.h, 7);

  drawingContext.shadowBlur = 0;

  fill(255, 255, 255, 150);
  rect(paddle.x + 8, paddle.y + 2, paddle.w - 16, 3, 2);
}

// ============================================
// BALL
// ============================================

function resetBall() {
  ball = {
    x: width / 2,
    y: PADDLE_Y - 20,
    vx: random() < 0.5 ? -3 : 3,
    vy: -4,
    r: BALL_RADIUS,
    speed: START_SPEED
  };
}

function getBallSpeed() {
  // Speed rises with score and is capped.
  return min(
    START_SPEED + score * SPEED_PER_BRICK,
    MAX_SPEED
  );
}

function updateBall() {
  // Keep the direction, but increase the magnitude
  // as the score grows.
  let targetSpeed = getBallSpeed();
  let currentMagnitude = sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

  if (currentMagnitude > 0) {
    ball.vx = (ball.vx / currentMagnitude) * targetSpeed;
    ball.vy = (ball.vy / currentMagnitude) * targetSpeed;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Left and right walls
  if (ball.x - ball.r <= 12) {
    ball.x = 12 + ball.r;
    ball.vx = abs(ball.vx);
  }

  if (ball.x + ball.r >= width - 12) {
    ball.x = width - 12 - ball.r;
    ball.vx = -abs(ball.vx);
  }

  // Top wall
  if (ball.y - ball.r <= 12) {
    ball.y = 12 + ball.r;
    ball.vy = abs(ball.vy);
  }

  // Paddle collision
  if (
    ball.vy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y - ball.r <= paddle.y + paddle.h &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w
  ) {
    ball.y = paddle.y - ball.r;

    // Hit position determines the bounce angle.
    let hitPosition =
      (ball.x - (paddle.x + paddle.w / 2)) /
      (paddle.w / 2);

    hitPosition = constrain(hitPosition, -1, 1);

    let angle = hitPosition * radians(65);
    let speed = getBallSpeed();

    ball.vx = speed * sin(angle);
    ball.vy = -speed * cos(angle);

    createParticles(ball.x, ball.y, "#4cc9f0", 8);
  }

  // Brick collisions
  for (let brick of bricks) {
    if (!brick.alive) continue;

    if (circleRectCollision(ball, brick)) {
      brick.alive = false;

      // Score points for every brick destroyed.
      score += 10;
      maxScore = max(maxScore, score);

      // Bounce away from the brick.
      let previousX = ball.x - ball.vx;
      let previousY = ball.y - ball.vy;

      if (
        previousX + ball.r <= brick.x ||
        previousX - ball.r >= brick.x + brick.w
      ) {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }

      createParticles(
        brick.x + brick.w / 2,
        brick.y + brick.h / 2,
        brick.color,
        12
      );

      // One brick per frame prevents repeated scoring
      // from a single collision.
      break;
    }
  }

  // Ball falls below the paddle
  if (ball.y - ball.r > height) {
    lives--;

    if (lives <= 0) {
      gameState = "gameover";
      maxScore = max(maxScore, score);
    } else {
      resetBall();
      gameState = "ready";
    }
  }
}

function circleRectCollision(circle, rectObj) {
  let closestX = constrain(
    circle.x,
    rectObj.x,
    rectObj.x + rectObj.w
  );

  let closestY = constrain(
    circle.y,
    rectObj.y,
    rectObj.y + rectObj.h
  );

  let dx = circle.x - closestX;
  let dy = circle.y - closestY;

  return dx * dx + dy * dy <= circle.r * circle.r;
}

function drawBall() {
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = "#ffffff";

  noStroke();
  fill("#ffffff");
  circle(ball.x, ball.y, ball.r * 2);

  drawingContext.shadowBlur = 0;

  fill(100, 220, 255, 100);
  circle(ball.x - 2, ball.y - 2, ball.r);
}

// ============================================
// PARTICLES
// ============================================

function createParticles(x, y, particleColor, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      life: random(15, 30),
      maxLife: 30,
      color: particleColor,
      size: random(2, 5)
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life--;
  }

  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  noStroke();

  for (let p of particles) {
    let alpha = map(p.life, 0, p.maxLife, 0, 255);

    let c = color(p.color);
    c.setAlpha(alpha);

    fill(c);
    circle(p.x, p.y, p.size);
  }
}

// ============================================
// READY SCREEN
// ============================================

function drawReadyScreen() {
  noStroke();
  fill(5, 8, 25, 210);
  rect(45, 285, width - 90, 150, 12);

  textAlign(CENTER, CENTER);

  fill("#4cc9f0");
  textSize(27);
  text("BLOCK BUSTER", width / 2, 320);

  fill("#ffffff");
  textSize(14);
  text("PRESS SPACE OR CLICK TO PLAY", width / 2, 365);

  fill("#9aa4c7");
  textSize(11);
  text("MOVE: MOUSE OR LEFT / RIGHT ARROWS", width / 2, 395);
}

// ============================================
// GAME OVER
// ============================================

function drawGameOverScreen() {
  noStroke();
  fill(5, 8, 25, 235);
  rect(45, 235, width - 90, 250, 14);

  textAlign(CENTER, CENTER);

  fill("#ff4d6d");
  textSize(35);
  text("GAME OVER", width / 2, 275);

  fill("#ffffff");
  textSize(17);
  text("FINAL SCORE: " + score, width / 2, 330);

  fill("#ffd166");
  textSize(19);
  text("MAX SCORE: " + maxScore, width / 2, 370);

  if (score >= maxScore && score > 0) {
    fill("#06d6a0");
    textSize(12);
    text("NEW HIGH SCORE!", width / 2, 402);
  }

  fill("#9aa4c7");
  textSize(13);
  text("PRESS SPACE OR CLICK TO RESTART", width / 2, 445);
}

// ============================================
// WIN SCREEN
// ============================================

function checkWin() {
  let remaining = bricks.filter(brick => brick.alive).length;

  if (remaining === 0) {
    gameState = "win";
    maxScore = max(maxScore, score);
  }
}

function drawWinScreen() {
  noStroke();
  fill(5, 8, 25, 235);
  rect(45, 235, width - 90, 250, 14);

  textAlign(CENTER, CENTER);

  fill("#06d6a0");
  textSize(34);
  text("YOU WIN!", width / 2, 280);

  fill("#ffffff");
  textSize(18);
  text("FINAL SCORE: " + score, width / 2, 335);

  fill("#ffd166");
  textSize(19);
  text("MAX SCORE: " + maxScore, width / 2, 375);

  fill("#9aa4c7");
  textSize(13);
  text("PRESS SPACE OR CLICK TO PLAY AGAIN", width / 2, 440);
}

// ============================================
// INPUT
// ============================================

function keyPressed() {
  if (key === " " || keyCode === ENTER) {
    if (gameState === "ready") {
      gameState = "playing";
    } else if (gameState === "gameover" || gameState === "win") {
      restartGame();
    }

    return false;
  }

  if (key === "p" || key === "P") {
    if (gameState === "playing") {
      gameState = "paused";
    } else if (gameState === "paused") {
      gameState = "playing";
    }
  }
}

function mousePressed() {
  if (gameState === "ready") {
    gameState = "playing";
  } else if (gameState === "gameover" || gameState === "win") {
    restartGame();
  }
}

function restartGame() {
  score = 0;
  lives = 3;
  level = 1;

  particles = [];

  paddle.x = width / 2 - paddle.w / 2;

  createBricks();
  resetBall();

  gameState = "ready";
}