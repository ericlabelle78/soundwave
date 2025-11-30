export class Visualizer {
    constructor(canvas, audioController) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioController = audioController;
        this.isRunning = false;
        this.mode = 'bars'; // 'bars' or 'wave'
        this.sensitivity = 1.5;

        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    setMode(mode) {
        this.mode = mode;
    }

    setSensitivity(val) {
        this.sensitivity = val;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.2)'; // Trail effect
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.mode === 'bars') {
            this.drawBars();
        } else {
            this.drawWave();
        }
    }

    drawBars() {
        const data = this.audioController.getFrequencyData();
        const bufferLength = data.length;

        // We'll use a subset of the data for better visuals (mostly lower frequencies)
        const usefulDataCount = Math.floor(bufferLength * 0.7);
        const barWidth = (this.canvas.width / usefulDataCount) * 2.5;
        let x = 0;

        for (let i = 0; i < usefulDataCount; i++) {
            const value = data[i];
            const percent = value / 255;
            const height = (percent * this.canvas.height * 0.5 * this.sensitivity);

            // Dynamic color based on frequency and height
            const hue = (i / usefulDataCount) * 360 + (percent * 50);
            const lightness = 50 + (percent * 30);

            this.ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;

            // Draw mirrored bars
            this.ctx.fillRect(this.centerX + x, this.centerY - height / 2, barWidth, height);
            this.ctx.fillRect(this.centerX - x - barWidth, this.centerY - height / 2, barWidth, height);

            x += barWidth + 1;

            if (x > this.centerX) break;
        }
    }

    drawWave() {
        const data = this.audioController.getWaveformData();
        const bufferLength = data.length;
        const sliceWidth = this.canvas.width / bufferLength;

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = `hsl(${Date.now() / 50 % 360}, 100%, 50%)`;
        this.ctx.beginPath();

        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = data[i] / 128.0; // 128 is zero-crossing
            const y = (v * this.canvas.height / 2) * this.sensitivity;

            // Adjust y to center
            const finalY = y + (this.canvas.height / 2 - (this.canvas.height / 2 * this.sensitivity));
            // Actually simpler:
            // v goes from 0 to 2. 1 is center.
            // let deviation = v - 1;
            // let y = centerY + deviation * maxAmplitude * sensitivity

            const deviation = v - 1;
            const yPos = this.centerY + (deviation * (this.canvas.height / 2) * this.sensitivity);

            if (i === 0) {
                this.ctx.moveTo(x, yPos);
            } else {
                this.ctx.lineTo(x, yPos);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.centerY);
        this.ctx.stroke();
    }
}
