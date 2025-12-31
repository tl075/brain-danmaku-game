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
                type: 'normal',
                dying: false,
                dieTimer: 0
            });
        }

        this.blocks = []; // Array of {x, y, w, h, timer}
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
            bullet.dying = false;
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

    update(deltaTime, speedMod = 1.0) {
        const timeScale = (deltaTime / 16.66) * speedMod;

        // Update Blocks
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].timer -= deltaTime;
            if (this.blocks[i].timer <= 0) {
                this.blocks.splice(i, 1);
                i--;
            }
        }

        for (const b of this.pool) {
            if (b.active) {
                if (b.dying) {
                    b.dieTimer -= deltaTime;
                    if (b.dieTimer <= 0) b.active = false;
                    continue;
                }

                b.x += b.vx * timeScale;
                b.y += b.vy * timeScale;

                // Check collisions with blocks
                if (!b.dying) {
                    for (const blk of this.blocks) {
                        // Simple AABB vs Point/Circle
                        // Block is centered? Let's assume w,h is full width/height
                        if (b.x >= blk.x - blk.w / 2 && b.x <= blk.x + blk.w / 2 &&
                            b.y >= blk.y - blk.h / 2 && b.y <= blk.y + blk.h / 2) {
                            b.active = false; // Destroy bullet
                            // Spark effect?
                            break;
                        }
                    }
                }

                if (b.x < -100 || b.x > this.game.width + 100 ||
                    b.y < -100 || b.y > this.game.height + 100) {
                    b.active = false;
                }
            }
        }
    }

    transformToRedAndClear(px, py, radius) {
        const rSq = radius * radius;
        for (const b of this.pool) {
            if (b.active && !b.dying) {
                const dx = b.x - px;
                const dy = b.y - py;
                if (dx * dx + dy * dy < rSq) {
                    b.dying = true;
                    b.dieTimer = 1000;
                    b.color = '#f00';
                    b.r += 2;
                }
            }
        }
    }

    repel(px, py) {
        for (const b of this.pool) {
            if (b.active) {
                // Calculate vector from player to bullet
                let dx = b.x - px;
                let dy = b.y - py;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) { dx = 1; dist = 1; }

                // Normalize and Apply speed
                const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 2;
                b.vx = (dx / dist) * speed * 2; // Faster away
                b.vy = (dy / dist) * speed * 2;
            }
        }
    }

    accelAll(factor) {
        for (const b of this.pool) {
            if (b.active) {
                b.vx *= factor;
                b.vy *= factor;
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

    spawnBlock(x, y) {
        this.blocks.push({
            x: x,
            y: y,
            w: 100,
            h: 40,
            timer: 5000 // 5 seconds
        });
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
            if (b.active && !b.dying) {
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
        // Draw Blocks
        ctx.fillStyle = 'cyan';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        for (const blk of this.blocks) {
            ctx.fillRect(blk.x - blk.w / 2, blk.y - blk.h / 2, blk.w, blk.h);
            ctx.strokeRect(blk.x - blk.w / 2, blk.y - blk.h / 2, blk.w, blk.h);
        }

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
