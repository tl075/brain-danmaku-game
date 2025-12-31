// Main Entry Point

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Create global access for debugging if needed, but keep it clean generally
    window.gameInstance = game;
});
