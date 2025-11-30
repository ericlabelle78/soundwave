export class AudioController {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.stream = null;
    }

    async startCapture() {
        try {
            // Request screen capture with audio
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                }
            });

            // Check if we got an audio track
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length === 0) {
                this.stop();
                throw new Error('No audio track selected. Did you check "Share system audio"?');
            }

            this.setupAudioContext(this.stream);

            // Handle stream end
            this.stream.getVideoTracks()[0].onended = () => {
                this.stop();
            };

        } catch (error) {
            console.error('Error in startCapture:', error);
            throw error;
        }
    }

    async startMicrophone() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                },
                video: false
            });

            this.setupAudioContext(this.stream);

        } catch (error) {
            console.error('Error in startMicrophone:', error);
            throw error;
        }
    }

    setupAudioContext(stream) {
        // Initialize Audio Context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();

        // Configure analyser
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        // Create source from stream
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.source.connect(this.analyser);

        // Prepare data array
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
    }

    getFrequencyData() {
        if (!this.analyser) return new Uint8Array(0);
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    getWaveformData() {
        if (!this.analyser) return new Uint8Array(0);
        this.analyser.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        // Reload page to reset state or show overlay again
        window.location.reload();
    }
}
