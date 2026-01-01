class TypingLogic {
    constructor(game) {
        this.game = game;
        this.active = false;

        // Command Dictionary
        this.commands = [
            { text: "freeze", effect: "FREEZE" },
            { text: "fire", effect: "FIRE" },
            { text: "wind", effect: "WIND" },
            { text: "bomb", effect: "BOMB" },
            { text: "hide", effect: "HIDE" },
            // { text: "show", effect: "SHOW" }, // REMOVED v1.1
            { text: "slow", effect: "SLOW" },
            { text: "fast", effect: "FAST" },
            { text: "heal", effect: "HEAL" },
            { text: "power", effect: "POWER" }, // ADDED v1.1
            { text: "weak", effect: "WEAK" }  // ADDED v1.1.2
        ];

        this.currentQuestion = null;
        this.typedText = "";
        this.remainingText = "";
        this.timer = 0;
        this.maxTime = 10000; // 10 seconds in ms

        // Bind invisible input
        this.inputElement = document.getElementById('typing-input');

        window.addEventListener('keydown', (e) => {
            if (!this.active || !this.currentQuestion) return;

            // Allow only single alphanumeric keys
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                this.processKey(e.key.toLowerCase());
            }
        });
    }

    startQuestion() {
        this.active = true;

        // Pick random command
        const cmd = this.commands[Math.floor(Math.random() * this.commands.length)];
        this.currentQuestion = cmd;
        this.typedText = "";
        this.remainingText = cmd.text;

        this.timer = this.maxTime; // Reset timer

        this.updateUI();
        document.getElementById('typing-display').classList.remove('hidden');
        this.updateTimerUI();
    }

    update(deltaTime) {
        if (!this.active || !this.currentQuestion) return;

        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.failQuestion();
        }

        this.updateTimerUI();
    }

    updateTimerUI() {
        const seconds = Math.ceil(this.timer / 1000);
        const el = document.getElementById('typing-question');
        el.innerText = `TYPE: ${seconds}s`;
        if (seconds <= 3) el.style.color = 'red';
        else el.style.color = 'white';
    }

    processKey(key) {
        // Simple match
        const nextChar = this.remainingText.charAt(0);

        if (key === nextChar) {
            this.typedText += nextChar;
            this.remainingText = this.remainingText.substring(1);
            this.game.sound.playSE('type'); // We need to add this SE?

            if (this.remainingText.length === 0) {
                this.completeQuestion();
            }
        } else {
            // Wrong key
            this.game.sound.playSE('wrong');
            // Slight Penalty?
        }
        this.updateUI();
    }

    completeQuestion() {
        this.game.sound.playSE('correct');
        this.game.typingSuccessCount++; // v1.1 Track success

        // Trigger Effect
        this.game.applyEffect(this.currentQuestion.effect);

        // Delay next question slightly
        this.active = false;
        setTimeout(() => this.startQuestion(), 1000);
    }

    failQuestion() {
        this.game.sound.playSE('wrong');
        this.game.player.takeDamage(3); // Penalty 3%
        this.active = false;
        // Immediate restart or delay?
        setTimeout(() => this.startQuestion(), 1000);
    }

    updateUI() {
        const html = `<span class="typed">${this.typedText}</span><span class="untyped">${this.remainingText}</span>`;
        document.getElementById('typing-romaji').innerHTML = html;
    }
}
