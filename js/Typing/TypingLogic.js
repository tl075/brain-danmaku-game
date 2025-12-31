class TypingLogic {
    constructor(game) {
        this.game = game;
        this.active = false;

        // Questions: { text: "Display Text", romaji: "targetromaji" }
        this.questions = [
            { text: "こんにちは", romaji: "konnichiwa" },
            { text: "さようなら", romaji: "sayounara" },
            { text: "ありがとう", romaji: "arigatou" },
            { text: "じかんげんしゅ", romaji: "jikangenshu" },
            { text: "いっせきにちょう", romaji: "issekinichou" },
            { text: "ききかいかい", romaji: "kikikaikai" },
            { text: "しんらばんしょう", romaji: "shinrabanshou" },
            { text: "やきにく", romaji: "yakiniku" }
        ];

        this.currentQuestion = null;
        this.typedRomaji = "";
        this.remainingRomaji = "";

        // Bind invisible input
        this.inputElement = document.getElementById('typing-input');

        // Global key listener (better than input element for games)
        window.addEventListener('keydown', (e) => {
            if (!this.active || !this.currentQuestion) return;

            // Prevent default behavior for game keys if needed, but for typing allow letters
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                this.processKey(e.key);
            } else if (e.key === 'Backspace') {
                // Determine if we want to allow backspace? usually no in typing games, you just fail or wait
            }
        });
    }

    startQuestion() {
        this.active = true;
        const q = this.questions[Math.floor(Math.random() * this.questions.length)];
        this.currentQuestion = q;
        this.typedRomaji = "";
        this.remainingRomaji = q.romaji;

        this.updateUI();
        document.getElementById('typing-display').classList.remove('hidden');
        this.inputElement.focus();
    }

    processKey(key) {
        // Check if key matches next expected char
        const nextChar = this.remainingRomaji.charAt(0);

        if (key.toLowerCase() === nextChar) {
            // Correct
            this.typedRomaji += nextChar;
            this.remainingRomaji = this.remainingRomaji.substring(1);
            this.game.sound.playSE('type');

            if (this.remainingRomaji.length === 0) {
                this.completeQuestion();
            }
        } else {
            // Mistake
            this.game.player.takeDamage(5);
            this.game.sound.playSE('miss');
        }
        this.updateUI();
    }

    completeQuestion() {
        this.game.sound.playSE('correct');
        this.game.damageBoss(10);
        this.startQuestion(); // Chains for now
    }

    updateUI() {
        document.getElementById('typing-question').innerText = this.currentQuestion.text;

        const html = `<span class="typed">${this.typedRomaji}</span><span class="untyped">${this.remainingRomaji}</span>`;
        document.getElementById('typing-romaji').innerHTML = html;
    }
}
