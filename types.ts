
export interface OscilloscopeState {
  frequencyX: number;
  frequencyY: number;
  phase: number;
  amplitude: number;
  isPlaying: boolean;
  noise: number;
  persistence: number;
  beamIntensity: number;
  showWaveforms: boolean;
}

export interface Preset {
  name: string;
  fx: number;
  fy: number;
  phase: number;
  description: string;
}

export enum SoundSource {
  SYNTH = 'SYNTH',
  MICROPHONE = 'MICROPHONE'
}
