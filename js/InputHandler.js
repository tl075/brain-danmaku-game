class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;

        // Offset handling
        this.rect = canvas.getBoundingClientRect();

        window.addEventListener('mousemove', (e) => {
            // Re-calc rect in case of resize/scroll (unlikely but safe)
            this.rect = this.canvas.getBoundingClientRect();

            this.mouseX = e.clientX - this.rect.left;
            this.mouseY = e.clientY - this.rect.top;
        });

        window.addEventListener('resize', () => {
            this.rect = this.canvas.getBoundingClientRect();
        });
    }

    getPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
}
