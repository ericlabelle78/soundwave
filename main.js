import { AudioController } from './audio.js';
import { Visualizer } from './visualizer.js';

const startBtn = document.getElementById('start-btn');
const micBtn = document.getElementById('mic-btn');
const overlay = document.getElementById('overlay');
const controls = document.getElementById('controls');
const canvas = document.getElementById('visualizer');
const sensitivityInput = document.getElementById('sensitivity');
const modeBtns = document.querySelectorAll('.mode-btn');

let audioController;
let visualizer;

async function init() {
  try {
    audioController = new AudioController();
    visualizer = new Visualizer(canvas, audioController);

    // Setup event listeners
    startBtn.addEventListener('click', () => startApp('system'));
    micBtn.addEventListener('click', () => startApp('mic'));

    sensitivityInput.addEventListener('input', (e) => {
      visualizer.setSensitivity(parseFloat(e.target.value));
    });

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        visualizer.setMode(btn.dataset.mode);
      });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      visualizer.resize();
    });

  } catch (error) {
    console.error('Initialization error:', error);
  }
}

async function startApp(sourceType) {
  try {
    if (sourceType === 'system') {
      await audioController.startCapture();
    } else {
      await audioController.startMicrophone();
    }

    overlay.classList.add('hidden');
    controls.classList.remove('hidden');

    visualizer.start();
  } catch (error) {
    console.error('Error starting audio capture:', error);
    if (sourceType === 'system') {
      alert('Could not start system audio capture. Try using the "Use Microphone" button or ensure you select a Tab with audio.');
    } else {
      alert('Could not access microphone. Please check permissions.');
    }
  }
}

init();
