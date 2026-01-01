
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { OscilloscopeState, Preset } from './types';
import { PRESETS } from './constants';
import { audioEngine } from './services/audioEngine';
import OscilloscopeDisplay from './components/OscilloscopeDisplay';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const [state, setState] = useState<OscilloscopeState>({
    frequencyX: 1,
    frequencyY: 1,
    phase: Math.PI / 2,
    amplitude: 0.5,
    isPlaying: false,
    noise: 0,
    persistence: 0.15,
    beamIntensity: 2.5,
    showWaveforms: true
  });

  const [aiInsight, setAiInsight] = useState<string>("System Ready. Awaiting signal input.");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Gemini AI Analysis of current pattern
  const analyzePattern = useCallback(async (fx: number, fy: number, phase: number) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setHasApiKey(false);
      setAiInsight("AI Insights disabled: No API key detected in environment.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain the physics and aesthetic of a Lissajous curve with X:Y ratio of ${fx}:${fy} and phase shift ${phase}. Keep it under 40 words and sound like a 1980s computer manual.`,
      });
      setAiInsight(response.text || "Analysis complete. Pattern recognized.");
    } catch (err) {
      console.error("AI Insight Error", err);
      setAiInsight("Pattern analysis interrupted. Harmonic interference detected.");
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const handleUpdate = (updates: Partial<OscilloscopeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleApplyPreset = (preset: Preset) => {
    setState(prev => ({
      ...prev,
      frequencyX: preset.fx,
      frequencyY: preset.fy,
      phase: preset.phase
    }));
    analyzePattern(preset.fx, preset.fy, preset.phase);
  };

  useEffect(() => {
    if (state.isPlaying) {
      audioEngine.startSynth(state.frequencyX, state.frequencyY, state.phase);
    } else {
      audioEngine.stopAll();
    }
  }, [state.isPlaying, state.phase]);

  useEffect(() => {
    if (state.isPlaying) {
      audioEngine.updateSynth(state.frequencyX, state.frequencyY);
    }
  }, [state.frequencyX, state.frequencyY, state.isPlaying]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      {/* Main Content Area: The CRT Oscilloscope */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 relative">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${state.isPlaying ? 'bg-red-500 animate-pulse shadow-[0_0_10px_red]' : 'bg-zinc-700'}`}></div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
            {state.isPlaying ? 'Signal Live // 44.1kHz' : 'System Standby'}
          </span>
        </div>

        {/* The Realistic CRT Body */}
        <div className="w-full max-w-4xl aspect-[4/3] relative flex items-center justify-center">
          {/* Bezel / Cabinet */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 rounded-[60px] shadow-2xl border-t border-zinc-600"></div>
          
          {/* Inner Frame */}
          <div className="absolute inset-[15px] bg-zinc-900 rounded-[55px] shadow-[inset_0_0_30px_rgba(0,0,0,1)] border-b-2 border-zinc-700"></div>
          
          {/* Display Component */}
          <div className="absolute inset-[30px] z-10">
            <OscilloscopeDisplay state={state} />
          </div>

          {/* Screws and details */}
          <div className="absolute top-[20px] left-[40px] w-2 h-2 rounded-full bg-zinc-600 shadow-inner"></div>
          <div className="absolute top-[20px] right-[40px] w-2 h-2 rounded-full bg-zinc-600 shadow-inner"></div>
          <div className="absolute bottom-[20px] left-[40px] w-2 h-2 rounded-full bg-zinc-600 shadow-inner"></div>
          <div className="absolute bottom-[20px] right-[40px] w-2 h-2 rounded-full bg-zinc-600 shadow-inner"></div>
        </div>

        {/* AI Insight Terminal */}
        <div className="mt-8 w-full max-w-4xl bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg flex gap-4 items-start">
          <div className={`p-2 rounded ${hasApiKey ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
            <svg className={`w-6 h-6 ${hasApiKey ? 'text-green-500' : 'text-amber-500'} ${isAiLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="text-[10px] text-zinc-500 font-bold uppercase mb-1 tracking-widest">Digital Signal Processor (AI)</h4>
            <p className={`text-sm font-mono leading-tight ${hasApiKey ? 'text-green-400/80' : 'text-amber-400/80 italic'}`}>
              {isAiLoading ? 'Synthesizing knowledge...' : aiInsight}
            </p>
          </div>
        </div>
      </main>

      {/* Side Control Panel */}
      <ControlPanel 
        state={state} 
        onUpdate={handleUpdate} 
        onApplyPreset={handleApplyPreset} 
      />
    </div>
  );
};

export default App;
