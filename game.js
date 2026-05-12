// ── MENU SCENE ───────────────────────────────────
class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    preload() {
        this.load.image('background_city',    'assets/images/background_city.png');
        this.load.image('goldie1',            'assets/images/goldie1.png');
        this.load.image('goldie2',            'assets/images/goldie2.png');
        this.load.image('goldie3',            'assets/images/goldie3.png');
        this.load.image('goldie4',            'assets/images/goldie4.png');
        this.load.image('logo_mcdonalds',     'assets/images/logo_mcdonalds.png');
        this.load.image('logo_tmk',           'assets/images/logo_tmk.png');
    }

    create() {
        // ── BACKGROUND ───────────────────────────
        this.add.image(240, 427, 'background_city').setDisplaySize(480, 854);

        // ── DARK OVERLAY ─────────────────────────
        this.add.rectangle(240, 427, 480, 854, 0x000000, 0.45);

        // ── TITLE ────────────────────────────────
        this.add.text(240, 100, 'Zane & Goldie', {
            fontSize: '42px', fill: '#FFD700', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(240, 155, 'Chase Your Dream! 🌟', {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // ── GOLDIE ANIMATED ──────────────────────
        this.menuGoldie = this.add.image(240, 310, 'goldie1')
            .setScale(0.18)
            .setFlipX(false);

        this.goldieFrame = 1;
        this.goldieTimer = 0;

        // ── HOW TO PLAY ──────────────────────────
        this.add.rectangle(240, 490, 400, 160, 0x000000, 0.6).setStrokeStyle(2, 0xFFD700);

        this.add.text(240, 430, 'HOW TO PLAY', {
            fontSize: '18px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(240, 463, '👆  Tap to Jump over obstacles', {
            fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(240, 493, '👇  Swipe Down to Duck under falcon', {
            fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(240, 523, '🍱  Collect Happy Meals for fun!', {
            fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // ── TAP TO START BUTTON ───────────────────
        const btn = this.add.rectangle(240, 630, 280, 65, 0xDA0000)
            .setStrokeStyle(3, 0xFFD700)
            .setInteractive({ useHandCursor: true });

        this.add.text(240, 630, '▶  TAP TO START', {
            fontSize: '24px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Button pulse animation
        this.tweens.add({
            targets: btn, scaleX: 1.05, scaleY: 1.05,
            duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // ── LOGOS ────────────────────────────────
        this.add.image(100, 790, 'logo_mcdonalds').setDisplaySize(80, 80);
        this.add.image(380, 790, 'logo_tmk').setDisplaySize(80, 80);

        this.add.text(240, 790, '×', {
            fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // ── 3 HEARTS PREVIEW ─────────────────────
        this.add.text(240, 710, '❤️ ❤️ ❤️   5:00 ⏱️', {
            fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        // ── START ON TAP ANYWHERE ────────────────
        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }

    update(time, delta) {
        // Animate Goldie in menu
        this.goldieTimer += delta;
        if (this.goldieTimer > 150) {
            this.goldieTimer = 0;
            this.goldieFrame = this.goldieFrame >= 4 ? 1 : this.goldieFrame + 1;
            this.menuGoldie.setTexture('goldie' + this.goldieFrame);
        }
    }
}

// ── GAME SCENE ───────────────────────────────────
class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }
}


// ── GAME STATE ────────────────────────────────────
let zane;
let groundPlatform;
let obstacles;
let happyMeals;
let timerText;
let goldieText;
let goldieSprite;
let heartImages = [];
let lives = 3;
let goldieDistance = 1000;
let isGameOver = false;
let isInvincible = false;
let gameSpeed = 250;
let spawnTimer = 0;
let spawnDelay = 2000;
let happyMealTimer = 0;
let happyMealDelay = 4000;
let currentWorld = 'city';
let timeLeft = 300;

// ── ZANE STATE MACHINE ────────────────────────────
let zaneState = 'run';
let runFrame = 1;
let runTimer = 0;
const RUN_FRAME_DELAY = 120;

// ── HAPPY MEAL COOLDOWN ──────────────────────────
let lastObstacleHadMeals = false;

// ── GOLDIE ANIMATION ──────────────────────────────
let goldieFrame = 1;
let goldieTimer = 0;
const GOLDIE_FRAME_DELAY = 150;

// ── LAYOUT ───────────────────────────────────────
const GROUND_Y = 810;
const ZANE_SCALE = 0.20;
const ZANE_Y = 740;
const FALCON_Y = 680;

const cityObstacles   = ['car', 'cart', 'coffee'];
const desertObstacles = ['camel', 'coffee'];

const OBS_H = { car: 415, cart: 797, coffee: 845, camel: 883, falcon: 734 };

GameScene.prototype.preload = function() {
    this.load.image('background_city',       'assets/images/background_city.png');
    this.load.image('background_transition', 'assets/images/background_transition.png');
    this.load.image('background_desert',     'assets/images/background_desert.png');
    this.load.image('street',    'assets/images/street.png');
    this.load.image('zane_run1', 'assets/images/zane_run1.png');
    this.load.image('zane_run2', 'assets/images/zane_run2.png');
    this.load.image('zane_run3', 'assets/images/zane_run3.png');
    this.load.image('zane_run4', 'assets/images/zane_run4.png');
    this.load.image('zane_jump', 'assets/images/zane_jump.png');
    this.load.image('zane_duck', 'assets/images/zane_duck.png');
    this.load.image('zane_hit',  'assets/images/zane_hit.png');
    this.load.image('car',       'assets/images/car.png');
    this.load.image('cart',      'assets/images/cart.png');
    this.load.image('coffee',    'assets/images/coffee.png');
    this.load.image('camel',     'assets/images/camel.png');
    this.load.image('falcon',    'assets/images/falcon.png');
    this.load.image('happymeal', 'assets/images/happymeal.png');
    this.load.image('heart',     'assets/images/heart.png');
    // ── GOLDIE 4 FRAMES ──────────────────────────
    this.load.image('goldie1',   'assets/images/goldie1.png');
    this.load.image('logo_mcdonalds', 'assets/images/logo_mcdonalds.png');
    this.load.image('logo_tmk',       'assets/images/logo_tmk.png');
    this.load.image('goldie2',   'assets/images/goldie2.png');
    this.load.image('goldie3',   'assets/images/goldie3.png');
    this.load.image('goldie4',   'assets/images/goldie4.png');
}

GameScene.prototype.create = function() {

    // ── BACKGROUNDS ──────────────────────────────
    this.bgCity1 = this.add.image(240, 380, 'background_city').setDisplaySize(700, 854).setDepth(0);
    this.bgCity2 = this.add.image(939, 380, 'background_city').setDisplaySize(700, 854).setDepth(0).setFlipX(true);
    this.bgTransition = this.add.image(240, 427, 'background_transition').setDisplaySize(480, 854).setDepth(1).setAlpha(0);
    this.bgDesert1 = this.add.image(240, 427, 'background_desert').setDisplaySize(480, 854).setDepth(1).setAlpha(0);
    this.bgDesert2 = this.add.image(720, 427, 'background_desert').setDisplaySize(480, 854).setDepth(1).setAlpha(0).setFlipX(true);

    // ── STREET ───────────────────────────────────
    this.street1 = this.add.image(240,  820, 'street').setDisplaySize(480, 60).setDepth(2);
    this.street2 = this.add.image(720,  820, 'street').setDisplaySize(480, 60).setDepth(2).setFlipX(true);
    this.street3 = this.add.image(1200, 820, 'street').setDisplaySize(480, 60).setDepth(2);

    // ── GROUND PLATFORM ──────────────────────────
    let gfx = this.add.graphics();
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(0, 0, 480, 20);
    gfx.generateTexture('groundTex', 480, 20);
    gfx.destroy();
    groundPlatform = this.physics.add.staticImage(240, GROUND_Y + 10, 'groundTex');
    groundPlatform.setAlpha(0);
    groundPlatform.refreshBody();
    groundPlatform.setDepth(3);

    // ── GOLDIE ───────────────────────────────────
    // Goldie runs ahead of Zane on the street, same ground level
    // goldie images: 1024x1024, scale 0.10 → display ~102px
    // Center Y = GROUND_Y - (1024 * 0.10 / 2) = 810 - 51 = 759
    goldieSprite = this.add.image(380, 759, 'goldie1')
        .setScale(0.10)
        .setDepth(4)
        .setFlipX(false); // facing left = running away from Zane

    // ── ZANE ─────────────────────────────────────
    zane = this.physics.add.sprite(80, ZANE_Y, 'zane_run1');
    zane.setScale(ZANE_SCALE);
    zane.setBounce(0);
    zane.setCollideWorldBounds(true);
    zane.setDepth(5);
    zane.body.setSize(zane.width * 0.6, zane.height);
    zane.body.setOffset(zane.width * 0.2, 0);

    this.physics.add.collider(zane, groundPlatform);

    // ── GROUPS ───────────────────────────────────
    obstacles  = this.add.group();
    happyMeals = this.add.group();

    // ── HEARTS UI ────────────────────────────────
    heartImages = [];
    for (let i = 0; i < 3; i++) {
        heartImages.push(
            this.add.image(360 + i * 36, 28, 'heart').setDisplaySize(30, 30).setDepth(10)
        );
    }

    // ── TIMER ────────────────────────────────────
    timerText = this.add.text(240, 20, '5:00', {
        fontSize: '28px', fill: '#ffffff', fontFamily: 'Arial',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0).setDepth(10);

    // ── GOLDIE TEXT ──────────────────────────────
    goldieText = this.add.text(20, 20, 'Goldie: 1000m 🪙', {
        fontSize: '20px', fill: '#FFD700', fontFamily: 'Arial',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setDepth(10);

    // ── INPUT ────────────────────────────────────
    // ── KEYBOARD CONTROLS ────────────────────────
    this.input.keyboard.on('keydown-SPACE', () => { jumpZane(); });
    this.input.keyboard.on('keydown-UP',    () => { jumpZane(); });
    this.input.keyboard.on('keydown-DOWN',  () => { startDuck(); });
    this.input.keyboard.on('keyup-DOWN',    () => { stopDuck(); });

    // ── MOBILE TOUCH CONTROLS ─────────────────────
    // Track touch start position to detect swipe direction
    let touchStartY = 0;
    let touchStartTime = 0;
    const SWIPE_THRESHOLD = 30; // px — minimum swipe distance

    this.input.on('pointerdown', (ptr) => {
        touchStartY = ptr.y;
        touchStartTime = Date.now();
    });

    this.input.on('pointerup', (ptr) => {
        const swipeDistance = ptr.y - touchStartY;
        const swipeTime = Date.now() - touchStartTime;

        if (swipeDistance > SWIPE_THRESHOLD && swipeTime < 300) {
            // ── SWIPE DOWN → DUCK ─────────────────
            startDuck();
            // Auto stand after 600ms (simulate keyup)
            setTimeout(() => { stopDuck(); }, 600);
        } else if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) {
            // ── TAP → JUMP ────────────────────────
            jumpZane();
        }
    });
}

// ── JUMP ─────────────────────────────────────────
function jumpZane() {
    if (isGameOver) return;
    if (zaneState === 'run') {
        zane.body.setVelocityY(-800);
        zaneState = 'jump';
        zane.setTexture('zane_jump');
    }
}

// ── DUCK ─────────────────────────────────────────
function startDuck() {
    if (isGameOver) return;
    if (zaneState === 'run') {
        zaneState = 'duck';
        zane.setTexture('zane_duck');
        zane.setScale(ZANE_SCALE * 1.6);
    }
}

function stopDuck() {
    if (isGameOver) return;
    if (zaneState === 'duck') {
        zaneState = 'run';
        runFrame = 1;
        zane.setTexture('zane_run1');
        zane.setScale(ZANE_SCALE);
    }
}

// ── SPAWN OBSTACLE ───────────────────────────────
function spawnObstacle(scene) {
    const isAir = Phaser.Math.Between(0, 3) === 0;
    let key, obsScale, spawnY;

    if (isAir) {
        key = 'falcon';
        obsScale = 0.10;
        spawnY = FALCON_Y;
    } else {
        key = (currentWorld === 'city' || currentWorld === 'transition')
            ? cityObstacles[Phaser.Math.Between(0, cityObstacles.length - 1)]
            : desertObstacles[Phaser.Math.Between(0, desertObstacles.length - 1)];

        if      (key === 'car')    obsScale = 0.14;
        else if (key === 'cart')   obsScale = 0.10;
        else if (key === 'coffee') obsScale = 0.08;
        else if (key === 'camel')  obsScale = 0.10;
        else                       obsScale = 0.10;

        const h = OBS_H[key] || 800;
        spawnY = GROUND_Y - (h * obsScale / 2);
    }

    let obs = scene.physics.add.sprite(520, spawnY, key);
    obs.setScale(obsScale);
    obs.body.setAllowGravity(false);
    obs.body.setImmovable(true);
    obs.body.setVelocityX(-gameSpeed);
    obs.setDepth(6);
    obstacles.add(obs);

    if (key === 'falcon') {
        obs.body.setSize(909 * 0.30, 734 * 0.30);
        obs.body.setOffset(909 * 0.35, 734 * 0.30);
    }

    let hasHit = false;
    scene.physics.add.overlap(zane, obs, () => {
        if (!hasHit) { hasHit = true; hitObstacle(scene); }
    });

    // ── HAPPY MEALS — cooldown rule + 40% random chance ─
    // Never two consecutive obstacles with happy meals
    if (lastObstacleHadMeals) {
        // Last obstacle had meals — force skip this one
        lastObstacleHadMeals = false;
    } else if (Phaser.Math.Between(1, 100) <= 40) {
        // 40% chance — spawn happy meals
        lastObstacleHadMeals = true;
        if (key === 'falcon') {
            spawnHappyMeals(scene, 'straight', 520);
        } else {
            spawnHappyMeals(scene, 'arc', 520);
        }
    } else {
        lastObstacleHadMeals = false;
    }
}

// ── SPAWN HAPPY MEALS ────────────────────────────
// type: 'straight' = ground line under falcon (3 centered)
//       'arc'      = 3 box arc over ground obstacle
// obsX: x position of the obstacle
function spawnHappyMeals(scene, type, obsX) {
    const HM_SCALE = 0.07;
    const groundY = GROUND_Y - (769 * HM_SCALE / 2);
    let positions = [];

    if (type === 'straight') {
        // ── FALCON: 3 boxes centered under falcon ─
        // Start just before falcon, end just after
        const spacing = 60;
        positions = [
            { x: obsX - spacing, y: groundY }, // just before falcon
            { x: obsX,           y: groundY }, // under falcon center
            { x: obsX + spacing, y: groundY }, // just after falcon
        ];

    } else if (type === 'arc') {
        // ── GROUND OBSTACLE: 5 box symmetrical arc ─
        // Middle box centered above obstacle
        // 2 rising before, 2 falling after
        const peakY   = 665;  // top — above obstacle
        const midY    = 700;  // mid height
        const lowY    = 740;  // low — near ground
        const spacing = 80;   // horizontal spacing
        positions = [
            { x: obsX - spacing * 2, y: lowY  }, // far left  — "start jump!"
            { x: obsX - spacing * 1, y: midY  }, // rising
            { x: obsX,               y: peakY }, // CENTER — above obstacle
            { x: obsX + spacing * 1, y: midY  }, // falling
            { x: obsX + spacing * 2, y: lowY  }, // far right — "land here!"
        ];
    }

    positions.forEach(({ x, y }) => {
        if (isGameOver) return;
        let hm = scene.physics.add.sprite(x, y, 'happymeal');
        hm.setScale(HM_SCALE);
        hm.body.setAllowGravity(false);
        hm.body.setImmovable(true);
        hm.body.setVelocityX(-gameSpeed);
        hm.setDepth(6);
        happyMeals.add(hm);

        let collected = false;
        scene.physics.add.overlap(zane, hm, () => {
            if (!collected) { collected = true; collectHappyMeal(scene, hm); }
        });
    });
}

// ── COLLECT HAPPY MEAL ───────────────────────────
function collectHappyMeal(scene, hm) {
    if (!hm || !hm.active) return;
    const x = hm.x, y = hm.y;
    hm.destroy();
    let pop = scene.add.text(x, y - 20, '🍟 Yay!', {
        fontSize: '20px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);
    scene.tweens.add({
        targets: pop, y: pop.y - 50, alpha: 0, duration: 800,
        onComplete: () => pop.destroy()
    });
}

// ── HIT OBSTACLE ─────────────────────────────────
function hitObstacle(scene) {
    if (isGameOver || isInvincible) return;
    if (zaneState === 'duck') return;

    lives--;
    if (heartImages[lives]) heartImages[lives].setAlpha(0.15);
    if (lives <= 0) { showGameOver(scene, 'no-lives'); return; }

    isInvincible = true;
    scene.tweens.add({
        targets: zane, alpha: 0, duration: 150, yoyo: true, repeat: 6,
        onComplete: () => { zane.setAlpha(1); isInvincible = false; }
    });
}

// ── GAME OVER ────────────────────────────────────
function showGameOver(scene, reason) {
    isGameOver = true;
    scene.physics.pause();
    zaneState = 'hit';
    zane.setTexture('zane_hit');

    scene.add.rectangle(240, 427, 440, 340, 0x000000, 0.88).setDepth(11);
    scene.add.text(240, 290, '🌟 Goldie Escaped! 🌟', {
        fontSize: '26px', fill: '#FFD700', fontFamily: 'Arial',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(12);

    const msg = reason === 'no-lives'
        ? 'You ran out of lives!\nTry again!'
        : "Time's up!\nGet a new Happy Meal\nto continue the chase!";

    scene.add.text(240, 385, msg, {
        fontSize: '21px', fill: '#ffffff', fontFamily: 'Arial',
        align: 'center', wordWrap: { width: 400 }
    }).setOrigin(0.5).setDepth(12);
    scene.add.text(240, 490, 'Tap to try again', {
        fontSize: '20px', fill: '#FFD700', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(12);
    scene.add.text(240, 525, 'The Millionaire Kid © 2026', {
        fontSize: '13px', fill: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(12);

    scene.time.delayedCall(800, () => {
        scene.input.on('pointerdown', () => scene.scene.start('MenuScene'));
        scene.input.keyboard.on('keydown-SPACE', () => scene.scene.start('MenuScene'));
    });
}

// ── UPDATE ───────────────────────────────────────
GameScene.prototype.update = function(time, delta) {
    if (isGameOver) return;

    // ── TIMER ────────────────────────────────────
    timeLeft -= delta / 1000;
    if (timeLeft <= 0) { showGameOver(this, 'timeout'); return; }
    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    timerText.setText(mins + ':' + (secs < 10 ? '0' : '') + secs);
    if (timeLeft <= 30) timerText.setStyle({ fill: '#FF0000', fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 });

    // ── WORLD CYCLE (loops every 100s across 5 minutes) ──
    // 0-40s  → City        (obstacles ON)
    // 40-50s → Transition  (obstacles OFF - player break)
    // 50-90s → Desert      (obstacles ON)
    // 90-100s→ Reversed transition back to City (obstacles OFF)
    const elapsed = 300 - timeLeft;
    const cyclePos = elapsed % 100;
    let inTransition = false;

    if (cyclePos < 40) {
        // ── CITY ─────────────────────────────────
        currentWorld = 'city';
        this.bgCity1.setAlpha(1); this.bgCity2.setAlpha(1);
        this.bgTransition.setAlpha(0);
        this.bgDesert1.setAlpha(0); this.bgDesert2.setAlpha(0);
        this.bgCity1.x -= 0.5; this.bgCity2.x -= 0.5;
        if (this.bgCity1.x < -350) this.bgCity1.x = this.bgCity2.x + 699;
        if (this.bgCity2.x < -350) this.bgCity2.x = this.bgCity1.x + 699;

    } else if (cyclePos < 50) {
        // ── CITY → TRANSITION ────────────────────
        currentWorld = 'transition';
        inTransition = true;
        const p = (cyclePos - 40) / 10;
        this.bgCity1.setAlpha(1-p); this.bgCity2.setAlpha(1-p);
        this.bgTransition.setAlpha(p);
        this.bgDesert1.setAlpha(0); this.bgDesert2.setAlpha(0);

    } else if (cyclePos < 90) {
        // ── DESERT ───────────────────────────────
        currentWorld = 'desert';
        this.bgCity1.setAlpha(0); this.bgCity2.setAlpha(0);
        this.bgTransition.setAlpha(0);
        this.bgDesert1.setAlpha(1); this.bgDesert2.setAlpha(1);

    } else {
        // ── DESERT → TRANSITION → CITY (reversed) ─
        currentWorld = 'transition';
        inTransition = true;
        const p = (cyclePos - 90) / 10;
        this.bgDesert1.setAlpha(1-p); this.bgDesert2.setAlpha(1-p);
        this.bgTransition.setAlpha(1 - Math.abs(p - 0.5) * 2);
        this.bgCity1.setAlpha(p); this.bgCity2.setAlpha(p);
    }

    // ── STREET SCROLL ────────────────────────────
    this.street1.x -= 4; this.street2.x -= 4; this.street3.x -= 4;
    if (this.street1.x < -240) { this.street1.x = this.street3.x + 480; this.street1.setFlipX(false); }
    if (this.street2.x < -240) { this.street2.x = this.street1.x + 480; this.street2.setFlipX(true); }
    if (this.street3.x < -240) { this.street3.x = this.street2.x + 480; this.street3.setFlipX(false); }

    // ── ZANE STATE MACHINE ────────────────────────
    if (zaneState === 'jump') {
        if (zane.body.blocked.down && zane.body.velocity.y === 0) {
            zaneState = 'run';
            runFrame = 1;
            zane.setTexture('zane_run1');
            zane.setScale(ZANE_SCALE);
        }
    } else if (zaneState === 'run') {
        runTimer += delta;
        if (runTimer >= RUN_FRAME_DELAY) {
            runTimer = 0;
            runFrame = runFrame >= 4 ? 1 : runFrame + 1;
            zane.setTexture('zane_run' + runFrame);
        }
    }

    // ── GOLDIE ANIMATION & POSITION ──────────────
    const progress = (300 - timeLeft) / 300;
    goldieDistance = Math.max(50, Math.floor(1000 - progress * 950));
    goldieText.setText('Goldie: ' + goldieDistance + 'm 🪙');

    // Goldie gets closer (moves left toward Zane) as distance decreases
    // Starts at X=420, gets as close as X=280 (just ahead of Zane at X=80)
    const gProgress = 1 - (goldieDistance - 50) / 950;
    const goldieX = 420 - gProgress * 140;
    const goldieScale = 0.08 + gProgress * 0.06; // grows as it gets closer
    goldieSprite.setPosition(goldieX, 759);
    goldieSprite.setScale(goldieScale);

    // Cycle Goldie run frames
    goldieTimer += delta;
    if (goldieTimer >= GOLDIE_FRAME_DELAY) {
        goldieTimer = 0;
        goldieFrame = goldieFrame >= 4 ? 1 : goldieFrame + 1;
        goldieSprite.setTexture('goldie' + goldieFrame);
    }

    // ── SPAWN ─────────────────────────────────────
    // No obstacles during transition — player gets a break
    if (!inTransition) {
        spawnTimer += delta;
        if (spawnTimer > spawnDelay) {
            spawnObstacle(this);
            spawnTimer = 0;
            gameSpeed += 5;
            spawnDelay = Math.max(900, spawnDelay - 40);
        }
    } else {
        spawnTimer = 0; // reset so no burst after transition

        // ── TRANSITION: 50% chance straight line every 3s ──
        happyMealTimer += delta;
        if (happyMealTimer > 3000) {
            happyMealTimer = 0;
            if (Phaser.Math.Between(1, 100) <= 50) {
                spawnHappyMeals(this, 'straight', 520);
            }
        }
    }

    // Happy meals now spawn with obstacles

    // ── CLEANUP ───────────────────────────────────
    obstacles.getChildren().forEach(obs => { if (obs.x < -150) obs.destroy(); });
    happyMeals.getChildren().forEach(hm  => { if (hm.x  < -150) hm.destroy(); });
}
// ── CONFIG & BOOT (must be after all scene classes) ──
const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 854,
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 480,
        height: 854,
        parent: document.body,
        fullscreenTarget: document.body
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1400 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);