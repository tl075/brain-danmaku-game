class BulletManager {
    constructor(game) {
        this.game = game;
        this.bullets = [];
        this.pool = [];
        this.maxBullets = 2000;

        // Initialize Pool
        for (let i = 0; i < this.maxBullets; i++) {
            this.pool.push({
                active: false,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                r: 4,
                color: '#fff',
                type: 'normal'
            });
        }
    }

    spawnBullet(x, y, vx, vy, color = '#f00', r = 4) {
        // Find first inactive bullet
        const bullet = this.pool.find(b => !b.active);
        if (bullet) {
            bullet.active = true;
            bullet.x = x;
            bullet.y = y;
            bullet.vx = vx;
            bullet.vy = vy;
            bullet.color = color;
            bullet.r = r;
        }
    }

    clear() {
        this.pool.forEach(b => b.active = false);
    }

    clearArea(x, y, radius) {
        const rSq = radius * radius;
        for (const b of this.pool) {
            if (b.active) {
                const dx = b.x - x;
                const dy = b.y - y;
                if (dx * dx + dy * dy < rSq) {
                    b.active = false;
                    // Optional: Spawn visual effect for cancelled bullet
                }
            }
        }
    }

    update(deltaTime) {
        const timeScale = deltaTime / 16.66;
        for (const b of this.pool) {
            if (b.active) {
                b.x += b.vx * timeScale;
                b.y += b.vy * timeScale;

                if (b.x < -50 || b.x > this.game.width + 50 ||
                    b.y < -50 || b.y > this.game.height + 50) {
                    b.active = false;
                }
            }
        }
    }

    spawnSpiral(cx, cy, bulletCount = 20, speed = 2) {
        const step = (Math.PI * 2) / bulletCount;
        for (let i = 0; i < bulletCount; i++) {
            const angle = step * i + (Date.now() / 1000); // Rotate over time
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.spawnBullet(cx, cy, vx, vy, '#f0f');
        }
    }

    spawnRain() {
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.game.width;
            this.spawnBullet(x, -10, 0, 2 + Math.random(), '#0ff');
        }
    }

    spawnAimed(sourceX, sourceY, targetX, targetY, speed = 4) {
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        this.spawnBullet(sourceX, sourceY, vx, vy, '#ff0');
    }

    checkCollision(player) {
        // Circle collision
        // Optimization: Filtering active bullets first is maybe slower than just checking if active inside loop
        const pR = player.hitboxRadius;

        for (const b of this.pool) {
            if (b.active) {
                const dx = b.x - player.x;
                const dy = b.y - player.y;
                const distSq = dx * dx + dy * dy;
                const rSum = b.r + pR;

                if (distSq < rSum * rSum) {
                    return b;
                }
            }
        }
        return null;
    }

    draw(ctx) {
        ctx.fillStyle = '#fff'; // Default
        // If we want colored bullets, we might batch them by color or just change fillStyle
        // Changing state is expensive, but for < 2000 bullets might be okay.

        // Optimization: Batch rendering?
        // Let's just draw loops for now.

        for (const b of this.pool) {
            if (b.active) {
                ctx.beginPath();
                ctx.fillStyle = b.color;
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}
