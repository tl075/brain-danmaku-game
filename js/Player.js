class Player {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        this.hitboxRadius = 4; // Tiny hitbox for core
        this.visualRadius = 8;
        this.hp = 100;
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
    }

    update(input) {
        const pos = input.getPosition();
        // Instant mouse follow
        this.x = pos.x;
        this.y = pos.y;

        // Clamp to screen
        this.x = Math.max(this.visualRadius, Math.min(this.game.width - this.visualRadius, this.x));
        this.y = Math.max(this.visualRadius, Math.min(this.game.height - this.visualRadius, this.y));

        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnerable) return;

        this.hp -= amount;
        if (this.hp <= 0) {
            this.lives--;
            if (this.lives < 0) {
                this.game.state = 'GAMEOVER';
                this.game.ui.gameOverScreen.classList.remove('hidden');
                // stop game loop logic for cleanliness? or just let it run behind
            } else {
                this.hp = 100; // Reset HP for checking point
                this.invulnerable = true;
                this.invulnerableTimer = 120; // 2 seconds at 60fps
                // TODO: Maybe reset position or clear bullets?
                this.game.bullets.clear(); // Safety clear
            }
        }
    }

    draw(ctx) {
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) return; // Blink

        // Draw Player Hull
        ctx.beginPath();
        ctx.fillStyle = '#0ff';
        ctx.arc(this.x, this.y, this.visualRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Draw Hitbox (Red Dot)
        ctx.beginPath();
        ctx.fillStyle = '#f00';
        ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}
