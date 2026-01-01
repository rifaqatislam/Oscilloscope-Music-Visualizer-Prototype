
import { SoundSource } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private oscX: OscillatorNode | null = null;
  private oscY: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private analyzerX: AnalyserNode | null = null;
  private analyzerY: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0.5;

    this.merger = this.ctx.createChannelMerger(2);
    this.splitter = this.ctx.createChannelSplitter(2);
    
    this.analyzerX = this.ctx.createAnalyser();
    this.analyzerY = this.ctx.createAnalyser();
    this.analyzerX.fftSize = 2048;
    this.analyzerY.fftSize = 2048;

    this.merger.connect(this.splitter);
    this.splitter.connect(this.analyzerX, 0);
    this.splitter.connect(this.analyzerY, 1);
    this.gainNode.connect(this.ctx.destination);
  }

  async startSynth(freqX: number, freqY: number, phaseShift: number) {
    if (!this.ctx) await this.init();
    this.stopAll();

    const baseFreq = 110; // A2 frequency for audible bass tone

    this.oscX = this.ctx!.createOscillator();
    this.oscY = this.ctx!.createOscillator();
    
    const pannerX = this.ctx!.createDelay();
    pannerX.delayTime.value = 0;

    const pannerY = this.ctx!.createDelay();
    // Phase shift implementation using delay for simplicity in audible range
    pannerY.delayTime.value = phaseShift / (2 * Math.PI * (baseFreq * freqY));

    this.oscX.frequency.value = baseFreq * freqX;
    this.oscY.frequency.value = baseFreq * freqY;

    this.oscX.connect(pannerX);
    this.oscY.connect(pannerY);

    pannerX.connect(this.merger!, 0, 0);
    pannerY.connect(this.merger!, 0, 1);
    
    this.merger!.connect(this.gainNode!);

    this.oscX.start();
    this.oscY.start();
  }

  async startMic() {
    if (!this.ctx) await this.init();
    this.stopAll();

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micSource = this.ctx!.createMediaStreamSource(this.micStream);
      
      // Mic is usually mono, so we use it as both X and Y with a slight filter/delay to create width
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      this.micSource.connect(this.merger!, 0, 0);
      this.micSource.connect(filter);
      filter.connect(this.merger!, 0, 1);

      this.merger!.connect(this.gainNode!);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  }

  updateSynth(freqX: number, freqY: number) {
    if (this.oscX && this.oscY) {
      const baseFreq = 110;
      this.oscX.frequency.setTargetAtTime(baseFreq * freqX, this.ctx!.currentTime, 0.1);
      this.oscY.frequency.setTargetAtTime(baseFreq * freqY, this.ctx!.currentTime, 0.1);
    }
  }

  setVolume(val: number) {
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
    }
  }

  stopAll() {
    this.oscX?.stop();
    this.oscY?.stop();
    this.micStream?.getTracks().forEach(t => t.stop());
    this.micSource?.disconnect();
  }

  getAnalyzers() {
    return { x: this.analyzerX, y: this.analyzerY };
  }

  getContext() { return this.ctx; }
}

export const audioEngine = new AudioEngine();
