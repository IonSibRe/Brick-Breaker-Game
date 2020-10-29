// Canvas Elements
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// Constants
const GAME_HEIGHT = 800;
const GAME_WIDTH = 1000;
const GAME_STATES = {
    RUNNING: 1,
    PAUSED: 2,
    GAMEOVER: 3,
    GAMEWON: 4,
    NEXTLEVEL: 5,
};

// Globals
let loadedLevels = 1;
let levelIndex = 0;
let lives = 3;
let gamestate = GAME_STATES.RUNNING;
let score = 0;
let gameReset = false;

// Levels Array
const levels = [
    [
        [1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    ],
    [
        [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    ],
    [
        [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    ],
    // Bug Fix
    [[1]],
];

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // GameOver Check
    if (lives === 0) {
        gamestate = GAME_STATES.GAMEOVER;
    }

    // GameWon Check
    if (loadedLevels === levels.length) {
        gamestate = GAME_STATES.GAMEWON;
    }

    // New Level Check
    if (bricks.length === 0) {
        levelIndex++;
        loadedLevels++;
        gamestate = GAME_STATES.NEXTLEVEL;
    }

    // Reset Game
    if (gameReset === true) {
        resetGame();
    }

    // Default running state
    if (gamestate === GAME_STATES.RUNNING) {
        // Paddle
        createPaddle();
        newPosition();

        // Ball
        createBall();
        newPosBall();

        // Brick
        renderBricks();
        clearBrick();

        // Score
        drawScore();

        // Lives
        drawLives();

        // Levels
        drawLevels();
    }

    // New level
    if (gamestate === GAME_STATES.NEXTLEVEL) {
        createBricks();
        ball.x = 100;
        ball.y = 400;
        ball.speed += 2;
        // Fix ball angle whe new level is loaded
        ball.dy = ball.dy;
        gamestate = GAME_STATES.RUNNING;
    }

    // Paused
    if (gamestate === GAME_STATES.PAUSED) {
        pauseGame();
    }

    // GameOver
    if (gamestate === GAME_STATES.GAMEOVER) {
        gameOver();
    }

    // GameWon
    if (gamestate === GAME_STATES.GAMEWON) {
        gameWon();
    }

    // Next Frame
    requestAnimationFrame(gameLoop);
}

// ======================== Controls ========================
function inputControl(e) {
    // Paddle
    if (e.key === "ArrowRight" || e.key === "Right") {
        paddle.dx = paddle.speed;
    } else if (e.key === "ArrowLeft" || e.key === "Left") {
        paddle.dx = -paddle.speed;
    }

    // Pause
    if (e.key === "Esc" || e.key === "Escape") {
        if (gamestate === GAME_STATES.PAUSED) {
            gamestate = GAME_STATES.RUNNING;
        } else {
            gamestate = GAME_STATES.PAUSED;
        }
    }

    // Reset Game
    if (e.key === "r" && gamestate === GAME_STATES.GAMEWON) {
        gameReset = true;
    }

    if (e.key === "r" && gamestate === GAME_STATES.GAMEOVER) {
        gameReset = true;
    }
}

// ======================== Paddle ========================

const paddle = {
    w: 120,
    h: 30,
    x: canvas.width / 2 - 60,
    y: canvas.height - 40,
    speed: 7,
    dx: 0,
};

function createPaddle() {
    ctx.fillStyle = "#2286f8";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}

function newPosition() {
    paddle.x += paddle.dx;

    paddleCollisionDetection();
}

function paddleStop(e) {
    switch (e.key) {
        case "ArrowLeft":
        case "Left":
            if (paddle.dx < 0) {
                paddle.dx = 0;
            }
            break;
        case "ArrowRight":
        case "Right":
            if (paddle.dx > 0) {
                paddle.dx = 0;
            }
            break;
    }
}

function paddleCollisionDetection() {
    if (paddle.x <= 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.w >= canvas.width) {
        paddle.x = canvas.width - paddle.w;
    }
}

// ======================== Ball ========================
const ball = {
    w: 32,
    h: 32,
    x: 100,
    y: 400,
    speed: 7,
    dx: 5,
    dy: 5,
};

const ballImg = document.querySelector("#ball_img");

function createBall() {
    ctx.drawImage(ballImg, ball.x, ball.y, ball.w, ball.h);
}

function newPosBall() {
    ballCollisionDetection();
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballCollisionDetection() {
    // Left & Right
    if (ball.x <= 0 || ball.x + ball.w >= canvas.width) {
        ball.dx = -ball.dx;
    }

    // Top
    if (ball.y <= 0) {
        ball.dy = -ball.dy;
    }

    // Bottom
    if (ball.y + ball.h >= canvas.height) {
        ball.x = 100;
        ball.y = 400;
        lives--;
    }

    // Collision with paddle
    if (collisionDetection(ball, paddle)) {
        ball.dy = -ball.dy;
        ball.y = paddle.y - paddle.h;
    }

    // Collision with bricks {
    bricks.forEach((brick) => {
        if (collisionDetection(ball, brick)) {
            ball.dy = -ball.dy;
            brick.delete = true;
            score += 10;
        }
    });
}

function collisionDetection(obj1, obj2) {
    return (
        obj1.y + obj1.h >= obj2.y &&
        obj1.y <= obj2.y + obj2.h &&
        obj1.x + obj1.w >= obj2.x &&
        obj1.x <= obj2.x + obj2.w
    );
}

// ======================== Bricks ========================
let bricks = [];

// Create all bricks
function createBricks() {
    levels[levelIndex].forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            if (col !== 0) {
                bricks.push({
                    w: 60,
                    h: 30,
                    x: 45 + colIndex * 65,
                    y: 70 + rowIndex * 40,
                    delete: false,
                });
            }
        });
    });
}

// Render bricks
function renderBricks() {
    bricks.forEach((brick) => {
        ctx.fillStyle = "#2286f8";
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    });
}

// Filter out hit bricks
function clearBrick() {
    bricks = bricks.filter((brick) => !brick.delete);
}

createBricks();

// ======================== Score & Level & Lives ========================
function drawScore() {
    ctx.font = "25px Arial";
    ctx.fillStyle = "#2286f8";
    ctx.fillText(`Score: ${score}`, GAME_WIDTH - 100, 35);
}

function drawLives() {
    ctx.font = "25px Arial";
    ctx.fillStyle = "#2286f8";
    ctx.textAlign = "center";
    ctx.fillText(`Lives: ${lives}`, GAME_WIDTH / 2, 35);
}

function drawLevels() {
    ctx.font = "25px Arial";
    ctx.fillStyle = "#2286f8";
    ctx.fillText(`Level: ${levelIndex + 1}`, 87.5, 35);
}

// ======================== Game states ========================

// Game Win
function gameWon() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#22f894";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.font = "70px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("You Won!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Press R to reset", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
}

// Game Over
function gameOver() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.font = "70px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Press R to reset", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
}

// Game Pause
function pauseGame() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.font = "70px Arial";
    ctx.fillStyle = "#2286f8";
    ctx.textAlign = "center";
    ctx.fillText("Paused", GAME_WIDTH / 2, GAME_HEIGHT / 2);
}

// Reset Game
function resetGame() {
    levelIndex = 0;
    loadedLevels = 1;
    lives = 3;
    gameReset = false;
    createBricks();
    gamestate = GAME_STATES.RUNNING;
}

// Event Listeners
document.addEventListener("keydown", inputControl);
document.addEventListener("keyup", paddleStop);

gameLoop();
