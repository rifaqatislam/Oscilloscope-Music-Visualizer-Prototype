
import React from 'react';
import { PRESETS } from '../constants';
import { OscilloscopeState, Preset } from '../types';

interface ControlPanelProps {
  state: OscilloscopeState;
  onUpdate: (updates: Partial<OscilloscopeState>) => void;
  onApplyPreset: (preset: Preset) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onUpdate, onApplyPreset }) => {
  return (
    <div className="bg-zinc-900/90 border-l border-zinc-700 w-80 h-full p-6 overflow-y-auto text-zinc-300 shadow-2xl flex flex-col gap-6 select-none">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-green-500 tracking-tighter uppercase mb-1">Module Control</h2>
        <p className="text-[10px] text-zinc-500 font-mono">MODEL-808-VIRTUAL-OSCILLOSCOPE</p>
      </div>

      <section>
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Signal Presets</label>
        <div className="grid grid-cols-1 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => onApplyPreset(p)}
              className={`text-left px-3 py-2 rounded text-sm transition-all border ${
                state.frequencyX === p.fx && state.frequencyY === p.fy 
                ? 'bg-green-900/30 border-green-500 text-green-400' 
                : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="font-bold">{p.name}</div>
              <div className="text-[10px] opacity-60 uppercase">{p.fx}:{p.fy} Ratio</div>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-zinc-800/50 p-2 rounded border border-zinc-700/50">
          <label className="text-[10px] font-bold uppercase text-zinc-400">Show Axis Traces</label>
          <button 
            onClick={() => onUpdate({ showWaveforms: !state.showWaveforms })}
            className={`w-10 h-5 rounded-full relative transition-colors ${state.showWaveforms ? 'bg-green-600' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${state.showWaveforms ? 'left-6' : 'left-1'}`}></div>
          </button>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="text-xs font-bold uppercase text-zinc-500">Freq X</label>
            <span className="text-xs font-mono text-green-500">{state.frequencyX.toFixed(2)}Hz</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.01"
            value={state.frequencyX}
            onChange={(e) => onUpdate({ frequencyX: parseFloat(e.target.value) })}
            className="w-full accent-green-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="text-xs font-bold uppercase text-zinc-500">Freq Y</label>
            <span className="text-xs font-mono text-green-500">{state.frequencyY.toFixed(2)}Hz</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.01"
            value={state.frequencyY}
            onChange={(e) => onUpdate({ frequencyY: parseFloat(e.target.value) })}
            className="w-full accent-green-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="text-xs font-bold uppercase text-zinc-500">Phase Shift</label>
            <span className="text-xs font-mono text-green-500">{(state.phase / Math.PI).toFixed(2)}π</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.01"
            value={state.phase}
            onChange={(e) => onUpdate({ phase: parseFloat(e.target.value) })}
            className="w-full accent-green-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </section>

      <section className="mt-auto border-t border-zinc-800 pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-800 p-2 rounded border border-zinc-700">
            <label className="text-[10px] uppercase text-zinc-500 block mb-1">Persistence</label>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={state.persistence}
              onChange={(e) => onUpdate({ persistence: parseFloat(e.target.value) })}
              className="w-full accent-green-500"
            />
          </div>
          <div className="bg-zinc-800 p-2 rounded border border-zinc-700">
            <label className="text-[10px] uppercase text-zinc-500 block mb-1">Intensity</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={state.beamIntensity}
              onChange={(e) => onUpdate({ beamIntensity: parseFloat(e.target.value) })}
              className="w-full accent-green-500"
            />
          </div>
        </div>
        
        <button
          onClick={() => onUpdate({ isPlaying: !state.isPlaying })}
          className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all ${
            state.isPlaying 
            ? 'bg-red-900/50 border border-red-500 text-red-400' 
            : 'bg-green-600 hover:bg-green-500 text-black'
          }`}
        >
          {state.isPlaying ? 'Deactivate System' : 'Initiate Sequence'}
        </button>
      </section>
    </div>
  );
};

export default ControlPanel;
