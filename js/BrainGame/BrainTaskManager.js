class BrainTaskManager {
    constructor(game) {
        this.game = game;
        this.currentMode = null; // 'RPS', 'COLOR', 'COUNT'
        this.instructionDiv = document.getElementById('instruction-text');
        this.countingBox = document.getElementById('counting-box');

        this.targets = []; // Array of objects {x, y, r, type, label}
        this.timer = 0;
        this.state = 'IDLE'; // IDLE, ACTIVE, RESOLVING
    }

    startTask(mode) {
        this.currentMode = mode;
        this.targets = [];
        this.state = 'ACTIVE';
        document.getElementById('brain-instruction').classList.remove('hidden');

        if (mode === 'RPS') this.setupRPS();
        if (mode === 'COLOR') this.setupColor();
        if (mode === 'COUNT') this.setupCount();
    }

    setupRPS() {
        // 0: Gu, 1: Choki, 2: Pa
        const hands = ['グー', 'チョキ', 'パー'];
        const handIcons = ['👊', '✌', '✋'];

        // Instructions: Win, Lose, Draw, Don't Win, Don't Lose
        const types = ['勝て', '負けろ', 'あいこ', '勝つな', '負けるな'];

        const cpuMove = Math.floor(Math.random() * 3);
        const instructionId = Math.floor(Math.random() * types.length);

        const text = `${handIcons[cpuMove]} に ${types[instructionId]}!`;
        this.instructionDiv.innerText = text;
        this.instructionDiv.style.color = '#fff';

        // Set correct answers based on logic
        // ... Logic is complex, doing simple version first
        this.targetLogic = { cpu: cpuMove, instr: instructionId };

        // Spawn 3 targets
        [0, 1, 2].forEach(i => {
            this.spawnTarget(handIcons[i], i);
        });
    }

    setupColor() {
        const colors = ['red', 'blue', 'yellow', 'black'];
        const texts = ['あか', 'あお', 'きいろ', 'くろ'];
        const textColors = ['#f00', '#00f', '#ff0', '#fff']; // CSS colors

        const targetColorIdx = Math.floor(Math.random() * 4);
        const wrongTextIdx = Math.floor(Math.random() * 4);

        // "Red Text" (meaning the color of the ink) vs "Text saying 'Red'"
        // Spec: "Blue text matching 'Red'" -> Match the Color or the Meaning?
        // Spec says: "色付き文字は赤色できいろと出てきたら赤色のマークに" (If Red text says 'Yellow', hit Red mark)
        // So User must ignore the TEXT content and match the INK COLOR.

        this.instructionDiv.innerHTML = `<span style="color:${textColors[targetColorIdx]}">${texts[wrongTextIdx]}</span>`;

        this.targetLogic = { correctColorIdx: targetColorIdx };

        [0, 1, 2, 3].forEach(i => {
            this.spawnTarget('■', i, textColors[i]);
        });
    }

    setupCount() {
        this.instructionDiv.innerText = "数えろ！";
        this.countingBox.classList.remove('hidden');
        this.countData = { inside: 0 };

        // Animation simulation
        let step = 0;
        const interval = setInterval(() => {
            step++;
            // Simulate bullets going in/out
            if (Math.random() > 0.3) {
                // Add
                this.countData.inside++;
                // Visual effect (TODO)
            } else {
                if (this.countData.inside > 0) this.countData.inside--;
            }
            this.instructionDiv.innerText = `...`; // Hide count

            if (step > 10) {
                clearInterval(interval);
                this.instructionDiv.innerText = "答えは？";
                this.countingBox.classList.add('hidden');

                // Spawn number targets around correct answer
                const ans = this.countData.inside;
                const options = new Set([ans, ans + 1, ans - 1]);
                while (options.size < 3) options.add(Math.floor(Math.random() * 10));

                Array.from(options).forEach((opt, i) => {
                    this.spawnTarget(opt.toString(), opt);
                });
            }
        }, 500);
    }

    spawnTarget(label, value, color) {
        this.targets.push({
            x: 100 + Math.random() * (this.game.width - 200),
            y: 100 + Math.random() * (this.game.height - 200),
            r: 30,
            label: label,
            value: value,
            color: color || '#fff'
        });
    }

    update() {
        if (this.state !== 'ACTIVE') return;

        // Check collision with targets
        const p = this.game.player;

        for (let i = 0; i < this.targets.length; i++) {
            const t = this.targets[i];
            const dx = p.x - t.x;
            const dy = p.y - t.y;
            if (dx * dx + dy * dy < (t.r + p.visualRadius) ** 2) {
                this.checkAnswer(t);
                this.targets.splice(i, 1);
                i--;
            }
        }
    }

    checkAnswer(target) {
        let correct = false;

        if (this.currentMode === 'RPS') {
            // RPS Logic
            const cpu = this.targetLogic.cpu; // 0,1,2
            const myMove = target.value; // 0,1,2
            // Win: (my - cpu + 3) % 3 == 2 ? No, standard: (0=G, 1=C, 2=P)
            // G wins C, C wins P, P wins G. (0>1, 1>2, 2>0)
            // Actually usually: (cpu - my + 3) % 3 ...
            // Let's define manual map:
            // winMap = {0:2, 1:0, 2:1} // To win against CPU 0(G) need 2(P)? No G(0) vs P(2) -> P wins.

            // Standard Japanese ID: 0=Gu, 1=Choki, 2=Pa
            // 0 vs 1 => 0 wins (Gu vs Cho)
            // 1 vs 2 => 1 wins (Cho vs Pa)
            // 2 vs 0 => 2 wins (Pa vs Gu)

            // Instr: 0=Win, 1=Lose, 2=Draw, 3=DontWin, 4=DontLose
            const result = (3 + cpu - myMove) % 3;
            // result 0: Draw
            // result 1: CPU wins (My lost)
            // result 2: CPU loses (My won) << This is tricky logic, better explicit.

            // Explicit Win/Lose check
            const isWin = (myMove === 0 && cpu === 1) || (myMove === 1 && cpu === 2) || (myMove === 2 && cpu === 0);
            const isDraw = (myMove === cpu);
            const isLose = !isWin && !isDraw;

            const instr = this.targetLogic.instr;
            if (instr === 0 && isWin) correct = true;
            if (instr === 1 && isLose) correct = true;
            if (instr === 2 && isDraw) correct = true;
            if (instr === 3 && !isWin) correct = true;
            if (instr === 4 && !isLose) correct = true;
        }
        else if (this.currentMode === 'COLOR') {
            // Specs: "Red Text saying Yellow -> Hit Red Mark"
            // We stored correctColorIdx. Target val matches index
            // target.value is explicitly set to i (0..3) which matches color index
            // Wait, spawnTarget(label, value, color)
            // loop i=0..3: spawnTarget('■', i, textColors[i])
            // So target.value is the index of the color.
            if (target.value === this.targetLogic.correctColorIdx) correct = true;
        }
        else if (this.currentMode === 'COUNT') {
            if (target.value === this.countData.inside) correct = true;
        }

        if (correct) {
            this.game.sound.playSE('correct');
            this.instructionDiv.innerText = "OK!";

            // Effect: Damage Boss & Clear Bullets
            this.game.damageBoss(5);
            this.game.bullets.clearArea(this.game.player.x, this.game.player.y, 200); // 200px radius bomb

            // Reset / Next
            setTimeout(() => this.startTask(this.currentMode), 1000);
        } else {
            this.game.sound.playSE('wrong');
            this.game.player.takeDamage(10);
            this.instructionDiv.innerText = "MISS!";
        }
    }

    draw(ctx) {
        if (this.state !== 'ACTIVE') return;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '20px sans-serif';

        for (const t of this.targets) {
            ctx.beginPath();
            ctx.fillStyle = paramsToColor(t.color); // Helper needed if color is hex
            if (t.color.startsWith('#')) ctx.fillStyle = t.color;

            ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            ctx.fillStyle = '#000'; // Text color
            if (t.color === '#000') ctx.fillStyle = '#fff'; // Invert for black
            ctx.fillText(t.label, t.x, t.y);
        }
    }
}

function paramsToColor(c) { return c; }
