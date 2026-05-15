// ── MENU SCENE ───────────────────────────────────
class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    preload() {
        this.load.image('sky_background',     'assets/images/sky_background.png');
        this.load.image('goldie1',            'assets/images/goldie1.png');
        this.load.image('goldie2',            'assets/images/goldie2.png');
        this.load.image('goldie3',            'assets/images/goldie3.png');
        this.load.image('goldie4',            'assets/images/goldie4.png');
        this.load.image('logo_mcdonalds',     'assets/images/logo_mcdonalds.png');
        this.load.image('logo_tmk',           'assets/images/logo_tmk.png');
    }

    create() {
        // ── BACKGROUND ───────────────────────────
        this.add.image(240, 427, 'sky_background').setDisplaySize(480, 854);
        
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

        this.add.text(240, 463, '👆  Swipe Up to Jump over obstacles', {
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
        this.input.on('pointerdown', () => { this.scene.start('GameScene'); });
        this.input.keyboard.on('keydown-SPACE', () => { this.scene.start('GameScene'); });
    }

    update(time, delta) {
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
const FALCON_Y = 665;

const cityObstacles = ['car', 'cart', 'coffee'];
const OBS_H = { car: 415, cart: 797, coffee: 845, camel: 883, falcon: 734 };

GameScene.prototype.preload = function() {
    this.load.image('sky_background',    'assets/images/sky_background.png');
    this.load.image('street',            'assets/images/street.png');
    this.load.image('zane_run1',         'assets/images/zane_run1.png');
    this.load.image('zane_run2',         'assets/images/zane_run2.png');
    this.load.image('zane_run3',         'assets/images/zane_run3.png');
    this.load.image('zane_run4',         'assets/images/zane_run4.png');
    this.load.image('zane_jump',         'assets/images/zane_jump.png');
    this.load.image('zane_duck',         'assets/images/zane_duck.png');
    this.load.image('zane_hit',          'assets/images/zane_hit.png');
    this.load.image('car',               'assets/images/car.png');
    this.load.image('cart',              'assets/images/cart.png');
    this.load.image('coffee',            'assets/images/coffee.png');
    this.load.image('camel',             'assets/images/camel.png');
    this.load.image('falcon',            'assets/images/falcon.png');
    this.load.image('happymeal',         'assets/images/happymeal.png');
    this.load.image('heart',             'assets/images/heart.png');
    this.load.image('goldie1',           'assets/images/goldie1.png');
    this.load.image('goldie2',           'assets/images/goldie2.png');
    this.load.image('goldie3',           'assets/images/goldie3.png');
    this.load.image('goldie4',           'assets/images/goldie4.png');
    this.load.image('logo_mcdonalds',    'assets/images/logo_mcdonalds.png');
    this.load.image('logo_tmk',         'assets/images/logo_tmk.png');
    this.load.image('balloon_happymeal', 'assets/images/balloon_happymeal.png');
    this.load.image('balloon_fries',     'assets/images/balloon_fries.png');
    this.load.image('balloon_m',         'assets/images/balloon_m.png');
}

GameScene.prototype.create = function() {

    // ── RESET ALL VARIABLES ON RESTART ───────────
    lives = 3;
    goldieDistance = 1000;
    isGameOver = false;
    isInvincible = false;
    gameSpeed = 250;
    spawnTimer = 0;
    spawnDelay = 2000;
    happyMealTimer = 0;
    happyMealDelay = 4000;
    timeLeft = 300;
    zaneState = 'run';
    runFrame = 1;
    runTimer = 0;
    goldieFrame = 1;
    goldieTimer = 0;
    lastObstacleHadMeals = false;

    // ── LAYER 1: SKY BACKGROUND ──────────────────
    // Two copies scrolling slowly — edges are plain sky so seamless
    this.bgCity1 = this.add.image(240, 385, 'sky_background').setDisplaySize(700, 854).setDepth(0);
    this.bgCity2 = this.add.image(939, 385, 'sky_background').setDisplaySize(700, 854).setDepth(0).setFlipX(true);

    // ── LAYER 2: ATMOSPHERE OVERLAYS ─────────────
    // Colored rectangles fading in/out over 5 minutes
    this.warmGlow   = this.add.rectangle(240, 427, 480, 854, 0xFFAA00, 0).setDepth(1);
    this.sunsetGlow = this.add.rectangle(240, 427, 480, 854, 0xFF4400, 0).setDepth(1);
    this.neonGlow   = this.add.rectangle(240, 427, 480, 854, 0x220066, 0).setDepth(1);

    // ── LAYER 4: SPARKLE PARTICLES ───────────────
    this.sparkles = [];
    for (let i = 0; i < 15; i++) {
        let spark = this.add.text(
            Phaser.Math.Between(20, 460),
            Phaser.Math.Between(100, 750),
            '✦',
            { fontSize: Phaser.Math.Between(8, 18) + 'px', fill: '#FFD700' }
        ).setAlpha(Phaser.Math.FloatBetween(0.1, 0.6)).setDepth(2);

        this.tweens.add({
            targets: spark,
            y: spark.y - Phaser.Math.Between(80, 200),
            alpha: 0,
            duration: Phaser.Math.Between(2000, 4000),
            delay: Phaser.Math.Between(0, 3000),
            repeat: -1,
            repeatDelay: Phaser.Math.Between(1000, 3000),
            onRepeat: () => {
                spark.x = Phaser.Math.Between(20, 460);
                spark.y = Phaser.Math.Between(500, 800);
                spark.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
            }
        });
        this.sparkles.push(spark);
    }

    // ── LAYER 5: FLOATING BALLOONS ───────────────
    const balloonTypes = ['balloon_happymeal', 'balloon_fries', 'balloon_m'];
    this.balloons = [];
    balloonTypes.forEach((type, i) => {
        let balloon = this.add.image(
            Phaser.Math.Between(50, 430),
            Phaser.Math.Between(150, 500),
            type
        ).setScale(0.25 + i * 0.05).setAlpha(0.7).setDepth(2);

        this.tweens.add({
            targets: balloon,
            x: balloon.x + Phaser.Math.Between(300, 500),
            y: balloon.y - Phaser.Math.Between(50, 150),
            alpha: 0,
            duration: Phaser.Math.Between(12000, 20000),
            delay: i * 4000,
            repeat: -1,
            onRepeat: () => {
                balloon.x = Phaser.Math.Between(-50, -10);
                balloon.y = Phaser.Math.Between(200, 600);
                balloon.setAlpha(0.7);
            }
        });
        this.balloons.push(balloon);
    });

    // ── LAYER 6: CITY GLOW ───────────────────────
    this.cityGlow = this.add.rectangle(240, 720, 480, 200, 0xFFAA00, 0.08).setDepth(1);
    this.tweens.add({
        targets: this.cityGlow,
        alpha: 0.15,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

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
    goldieSprite = this.add.image(380, 759, 'goldie1')
        .setScale(0.10).setDepth(4).setFlipX(false);

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
    this.input.keyboard.on('keydown-SPACE', () => { jumpZane(); });
    this.input.keyboard.on('keydown-UP',    () => { jumpZane(); });
    this.input.keyboard.on('keydown-DOWN',  () => { startDuck(); });
    this.input.keyboard.on('keyup-DOWN',    () => { stopDuck(); });

    let touchStartY = 0;
    let touchStartTime = 0;
    const SWIPE_THRESHOLD = 30;

    this.input.on('pointerdown', (ptr) => {
        touchStartY = ptr.y;
        touchStartTime = Date.now();
    });

    this.input.on('pointerup', (ptr) => {
        const swipeDistance = ptr.y - touchStartY;
        const swipeTime = Date.now() - touchStartTime;
        if (swipeTime < 300) {
            if (swipeDistance < -SWIPE_THRESHOLD) {
                jumpZane();
            } else if (swipeDistance > SWIPE_THRESHOLD) {
                startDuck();
                setTimeout(() => { stopDuck(); }, 600);
            }
        }
    });
}

// ── JUMP ─────────────────────────────────────────
function jumpZane() {
    if (isGameOver) return;
    if (zaneState === 'run') {
        zane.body.setVelocityY(-720);
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
        key = cityObstacles[Phaser.Math.Between(0, cityObstacles.length - 1)];
        if      (key === 'car')    obsScale = 0.14;
        else if (key === 'cart')   obsScale = 0.10;
        else if (key === 'coffee') obsScale = 0.08;
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
        if (!hasHit) { hasHit = true; hitObstacle(scene, key); }
    });

    // ── HAPPY MEALS — cooldown + 40% chance ──────
    if (lastObstacleHadMeals) {
        lastObstacleHadMeals = false;
    } else if (Phaser.Math.Between(1, 100) <= 40) {
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
function spawnHappyMeals(scene, type, obsX) {
    const HM_SCALE = 0.07;
    const groundY = GROUND_Y - (769 * HM_SCALE / 2);
    let positions = [];

    if (type === 'straight') {
        const spacing = 60;
        positions = [
            { x: obsX - spacing, y: groundY, airMeal: false },
            { x: obsX,           y: groundY, airMeal: false },
            { x: obsX + spacing, y: groundY, airMeal: false },
        ];
    } else if (type === 'arc') {
        const peakY = 665, midY = 700, lowY = 740, spacing = 80;
        positions = [
            { x: obsX - spacing * 2, y: lowY,  airMeal: false },
            { x: obsX - spacing * 1, y: midY,  airMeal: true  },
            { x: obsX,               y: peakY, airMeal: true  },
            { x: obsX + spacing * 1, y: midY,  airMeal: true  },
            { x: obsX + spacing * 2, y: lowY,  airMeal: false },
        ];
    }

    positions.forEach(({ x, y, airMeal }) => {
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
            if (!collected) {
                if (airMeal && zaneState !== 'jump') return;
                collected = true;
                collectHappyMeal(scene, hm);
            }
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
function hitObstacle(scene, obstacleKey) {
    if (isGameOver || isInvincible) return;
    if (zaneState === 'duck' && obstacleKey === 'falcon') return;

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

    // ── LAYER 1: SKY SCROLL ──────────────────────
    this.bgCity1.x -= 0.3;
    this.bgCity2.x -= 0.3;
    if (this.bgCity1.x < -350) this.bgCity1.x = this.bgCity2.x + 699;
    if (this.bgCity2.x < -350) this.bgCity2.x = this.bgCity1.x + 699;

    // ── LAYER 2: ATMOSPHERE OVERLAYS ─────────────
    // Day → Golden hour → Sunset → Neon night over 5 minutes
    const elapsed = 300 - timeLeft;
    if (elapsed < 100) {
        this.warmGlow.setAlpha(0);
        this.sunsetGlow.setAlpha(0);
        this.neonGlow.setAlpha(0);
    } else if (elapsed < 150) {
        const p = (elapsed - 100) / 50;
        this.warmGlow.setAlpha(p * 0.25);
        this.sunsetGlow.setAlpha(0);
        this.neonGlow.setAlpha(0);
    } else if (elapsed < 200) {
        this.warmGlow.setAlpha(0.25);
        this.sunsetGlow.setAlpha(0);
        this.neonGlow.setAlpha(0);
    } else if (elapsed < 250) {
        const p = (elapsed - 200) / 50;
        this.warmGlow.setAlpha(0.25 * (1-p));
        this.sunsetGlow.setAlpha(p * 0.20);
        this.neonGlow.setAlpha(0);
    } else {
        const p = Math.min(1, (elapsed - 250) / 50);
        this.warmGlow.setAlpha(0);
        this.sunsetGlow.setAlpha(0.20 * (1-p));
        this.neonGlow.setAlpha(p * 0.35);
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
    const gProgress = 1 - (goldieDistance - 50) / 950;
    const goldieX = 420 - gProgress * 140;
    const goldieScale = 0.08 + gProgress * 0.06;
    goldieSprite.setPosition(goldieX, 759);
    goldieSprite.setScale(goldieScale);
    goldieTimer += delta;
    if (goldieTimer >= GOLDIE_FRAME_DELAY) {
        goldieTimer = 0;
        goldieFrame = goldieFrame >= 4 ? 1 : goldieFrame + 1;
        goldieSprite.setTexture('goldie' + goldieFrame);
    }

    // ── SPAWN ─────────────────────────────────────
    spawnTimer += delta;
    if (spawnTimer > spawnDelay) {
        spawnObstacle(this);
        spawnTimer = 0;
        gameSpeed = Math.min(450, gameSpeed + 3);
        const spawnFloor = timeLeft < 90 ? 1000 : 1500;
        spawnDelay = Math.max(spawnFloor, spawnDelay - 30);
    }

    // ── CLEANUP ───────────────────────────────────
    obstacles.getChildren().forEach(obs => { if (obs.x < -150) obs.destroy(); });
    happyMeals.getChildren().forEach(hm  => { if (hm.x  < -150) hm.destroy(); });
}

// ── CONFIG & BOOT ────────────────────────────────
const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 854,
    backgroundColor: '#1a1a2e',
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
