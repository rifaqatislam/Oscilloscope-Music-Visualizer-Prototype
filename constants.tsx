
import { Preset } from './types';

export const PRESETS: Preset[] = [
  { name: "Perfect Circle", fx: 1, fy: 1, phase: Math.PI / 2, description: "A simple 1:1 ratio. The foundation of XY geometry." },
  { name: "Infinity (2:1)", fx: 2, fy: 1, phase: Math.PI / 4, description: "The classic horizontal lemniscate shape." },
  { name: "Trellis (3:2)", fx: 3, fy: 2, phase: 0, description: "A complex harmonic interaction producing a web pattern." },
  { name: "Star (5:4)", fx: 5, fy: 4, phase: Math.PI / 2, description: "Intricate multi-node resonance pattern." },
  { name: "Vertical (1:3)", fx: 1, fy: 3, phase: Math.PI / 2, description: "Highly reactive vertical compression." },
  { name: "Phased Loop", fx: 1, fy: 1.01, phase: 0, description: "Near-unison frequencies causing a slow-spinning visual." }
];

export const CRT_GREEN = '#00ff41';
export const CRT_DARK_GREEN = '#003b00';
export const CRT_GRID = 'rgba(0, 255, 65, 0.1)';
