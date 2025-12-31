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
        // Placeholder
    }
}
