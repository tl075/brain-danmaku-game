class SoundManager {
    constructor() {
        // Hardcoded list from the directory scan
        this.bgmList = [
            "[LCMS]Beyond the Horizon.mp3",
            "[LCMS]The Casket of Reveries ending.mp3",
            "[LCMS]The casket of reveries.mp3",
            "[てるこなのoriginal]Highway Star.mp3",
            "[てるこなのoriginal]LOVE ME.mp3",
            "[てるこなのoriginal]PULL UP.mp3",
            "[てるこなのoriginal]SECOND OPINION.mp3",
            "[てるこなのoriginal]Verse.mp3",
            "[てるこなのoriginal]君といたい.mp3",
            "[てるこなのoriginal]君は生き残ることができるか.mp3",
            "[てるこなのoriginal]夜を越えて.mp3",
            "[てるこなのoriginal]星空の下.mp3",
            "[てるこなのエンドカード曲]Dance of Goodbye.mp3",
            "[てるこなのエンドカード曲]ラストメロディー.mp3",
            "[遊者クラフト2]YUSYA.mp3"
        ];

        this.currentAudio = null;
        this.nowPlayingSpan = document.getElementById('song-name');
        this.nowPlayingDiv = document.getElementById('now-playing');
        this.muted = false;

        // AudioContext for SE
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Removed loadBgmFolder -> Now automatic

    playRandomBgm() {
        if (this.bgmList.length === 0) return;

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        const randomFile = this.bgmList[Math.floor(Math.random() * this.bgmList.length)];
        // Encode URI component for Japanese characters in filename
        const path = `bgm/${encodeURIComponent(randomFile)}`;

        console.log("Playing:", path);

        this.currentAudio = new Audio(path);
        this.currentAudio.volume = 0.3;
        this.currentAudio.muted = this.muted;

        this.currentAudio.addEventListener('ended', () => {
            this.playRandomBgm();
        });

        this.currentAudio.play().catch(e => {
            console.error("Audio playback failed:", e);
            // Handle autoplay policy?
        });

        // UI Update
        this.nowPlayingDiv.classList.remove('hidden');
        this.nowPlayingSpan.textContent = randomFile;
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.currentAudio) {
            this.currentAudio.muted = this.muted;
        }
    }

    playSE(type) {
        if (this.muted) return;
        if (!this.audioCtx) return;
        // Resume context if suspended (browser policy)
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        switch (type) {
            case 'damage': // Low buzz/crash
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'attack': // Shoot/Bomb
            case 'correct':
            case 'type': // High blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hit': // Bullet hit enemy
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'ui-click': // Short tick
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(2000, now + 0.05);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'wrong': // Low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.4);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
        }
    }
}
