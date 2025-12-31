class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER, VICTORY

        // Systems
        this.input = new InputHandler(this.canvas);
        this.sound = new SoundManager();
        this.player = new Player(this);
        this.bullets = new BulletManager(this);
        this.brain = new BrainTaskManager(this);
        this.brain = new BrainTaskManager(this);
        this.typing = new TypingLogic(this);
        this.ranking = new RankingManager();

        this.frameTimer = 0;
        this.bulletSpeedModifier = 1.0;
        this.freezeTimer = 0;
        this.spawnEnabled = true;

        // UI Elements
        this.ui = {
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            victoryScreen: document.getElementById('victory-screen'),
            hud: document.getElementById('hud'),
            hp: document.getElementById('hp-display'),
            lives: document.getElementById('lives-display'),
            bossHp: document.getElementById('boss-hp'),
            currentTask: document.getElementById('current-task'),
            startBtn: document.getElementById('start-btn'),
            retryBtn: document.getElementById('retry-btn')
        };

        this.bindEvents();

        // Initialize Ranking UI
        const nameInput = document.getElementById('player-name-input');
        nameInput.value = this.ranking.playerName;
        nameInput.addEventListener('change', (e) => {
            this.ranking.playerName = e.target.value || this.ranking.generateRandomName();
        });

        this.loadRanking();

        // Start Loop
        requestAnimationFrame(this.loop.bind(this));
    }

    async loadRanking() {
        const data = await this.ranking.fetchRanking();
        // Update Table
        const tbody = document.getElementById('ranking-body');
        tbody.innerHTML = "";

        data.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i + 1}</td><td>${row.name}</td><td>${row.time}</td><td>${row.lives}</td>`;
            tbody.appendChild(tr);
        });

        if (data.length === 0) tbody.innerHTML = "<tr><td colspan='4'>No Data/Error</td></tr>";
    }

    bindEvents() {
        this.ui.startBtn.addEventListener('click', () => this.start());
        this.ui.retryBtn.addEventListener('click', () => this.restart());
    }

    start() {
        this.state = 'PLAYING';
        this.resetGame();

        // UI Updates
        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.victoryScreen.classList.add('hidden');
        this.ui.hud.classList.remove('hidden');

        // Start Audio
        // Start Audio
        this.sound.playRandomBgm();

        this.bossHpCurrent = 100;
        this.updateBossUi();

        // TEST: Start all modes

        // TEST: Start all modes
        this.brain.startTask('RPS');
        this.typing.startQuestion();
    }

    resetGame() {
        this.player.reset();
        this.bullets.clear();
        // TODO: Reset Boss / Stage
    }

    restart() {
        this.start(); // For now just restart fully
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.state === 'PLAYING') {
            this.update(deltaTime);
            this.render();
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            this.bullets.draw(this.ctx); // Reuse draw just to keep them visible? No, render handles draw.
            // When frozen, bullets don't move.
            this.bullets.update(0, 0); // dt=0

            this.player.update(this.input);
            this.brain.update();
            this.typing.update(deltaTime);
            this.checkCollisions();
            return;
        }

        this.frameTimer++;

        this.player.update(this.input);
        this.bullets.update(deltaTime, this.bulletSpeedModifier);
        this.brain.update(deltaTime);
        this.typing.update(deltaTime);

        // Danmaku Patterns
        if (this.spawnEnabled) {
            if (this.frameTimer % 180 === 0) this.bullets.spawnSpiral(this.width / 2, 200);
            if (this.frameTimer % 60 === 0) this.bullets.spawnRain();
            if (this.frameTimer % 90 === 0) this.bullets.spawnAimed(this.width / 2, 50, this.player.x, this.player.y);
        }

        // Collision Checks
        this.checkCollisions();

        // Update UI
        this.ui.hp.textContent = Math.floor(this.player.hp) + "%";
        this.ui.lives.textContent = "❤".repeat(this.player.lives);
    }

    applyEffect(effect) {
        console.log("Effect:", effect);

        switch (effect) {
            case 'FREEZE':
                this.freezeTimer = 300; // 5 seconds
                break;
            case 'FIRE':
                this.bullets.transformToRedAndClear(this.player.x, this.player.y, 150);
                break;
            case 'WIND':
                this.bullets.repel(this.player.x, this.player.y);
                break;
            case 'BOMB':
                this.damageBoss(10);
                break;
            case 'HIDE':
                const hideBox = document.getElementById('hide-box');
                if (hideBox) hideBox.classList.remove('hidden');
                break;
            case 'SHOW':
                const showBox = document.getElementById('hide-box');
                if (showBox) showBox.classList.add('hidden');
                break;
            case 'SLOW':
                this.bullets.accelAll(0.5);
                break;
            case 'FAST':
                this.bullets.accelAll(1.5);
                break;
            case 'HEAL':
                this.player.hp = Math.min(100, this.player.hp + 30);
                break;
            case 'BLOCK':
                this.bullets.spawnBlock(this.player.x, this.player.y - 60);
                break;
        }
    }

    damageBoss(amount) {
        this.bossHpCurrent = Math.max(0, this.bossHpCurrent - amount);
        this.updateBossUi();

        if (this.bossHpCurrent <= 0) {
            // Victory for this phase/boss
            this.state = 'VICTORY';
            this.ui.victoryScreen.classList.remove('hidden');

            // Calc Score
            // Time elapsed? We didn't strictly track "start time" but we have frameTimer?
            // frameTimer is reset on init? Yes.
            const seconds = Math.floor(this.frameTimer / 60);
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            const timeStr = `${m}:${s}`;

            document.getElementById('final-score').innerText = `Time: ${timeStr} | Lives: ${this.player.lives}`;

            this.ranking.submitScore(timeStr, this.player.lives);
        }
    }

    updateBossUi() {
        this.ui.bossHp.textContent = Math.floor(this.bossHpCurrent) + "%";
    }

    checkCollisions() {
        // Player vs Bullets
        const hitBullet = this.bullets.checkCollision(this.player);
        if (hitBullet) {
            this.player.takeDamage(10); // Arbitrary damage
            hitBullet.active = false; // Destroy bullet
            // Sound effect
        }
    }

    render() {
        // Clear screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Slight trail effect?
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Background (optional)

        // Render Systems
        this.brain.draw(this.ctx);
        this.player.draw(this.ctx);
        this.bullets.draw(this.ctx);
    }
}
