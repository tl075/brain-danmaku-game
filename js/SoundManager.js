class SoundManager {
    constructor() {
        this.bgmFiles = [];
        this.currentAudio = null;
        this.nowPlayingSpan = document.getElementById('song-name');
        this.nowPlayingDiv = document.getElementById('now-playing');
    }

    loadBgmFolder(fileList) {
        this.bgmFiles = Array.from(fileList).filter(file =>
            file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a)$/i)
        );
        console.log(`Loaded ${this.bgmFiles.length} songs.`);
    }

    playRandomBgm() {
        if (this.bgmFiles.length === 0) return;

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        const randomIndex = Math.floor(Math.random() * this.bgmFiles.length);
        const file = this.bgmFiles[randomIndex];

        const url = URL.createObjectURL(file);
        this.currentAudio = new Audio(url);
        this.currentAudio.volume = 0.3;

        this.currentAudio.addEventListener('ended', () => {
            this.playRandomBgm();
        });

        this.currentAudio.play().catch(e => console.error("Audio playback failed:", e));

        // UI Update
        this.nowPlayingDiv.classList.remove('hidden');
        this.nowPlayingSpan.textContent = file.name;
    }

    playSE(type) {
        // Placeholder for Sound Effects
        // In a real implementation, we would use AudioContext or preloaded buffers
        // console.log(`Play SE: ${type}`);
    }
}
