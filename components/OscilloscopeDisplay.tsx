
import React, { useEffect, useRef, useCallback } from 'react';
import { OscilloscopeState } from '../types';
import { audioEngine } from '../services/audioEngine';

interface DisplayProps {
  state: OscilloscopeState;
}

const OscilloscopeDisplay: React.FC<DisplayProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const { x: analyzerX, y: analyzerY } = audioEngine.getAnalyzers();
    if (!analyzerX || !analyzerY) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const bufferLength = analyzerX.frequencyBinCount;
    const dataArrayX = new Uint8Array(bufferLength);
    const dataArrayY = new Uint8Array(bufferLength);
    
    analyzerX.getByteTimeDomainData(dataArrayX);
    analyzerY.getByteTimeDomainData(dataArrayY);

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = (Math.min(width, height) / 2) * 0.8;

    // Phosphor persistence effect
    ctx.fillStyle = `rgba(5, 5, 5, ${state.persistence})`;
    ctx.fillRect(0, 0, width, height);

    // Draw Axis Waveforms if enabled
    if (state.showWaveforms) {
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      
      // X-axis Waveform (Bottom)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
      const xWaveY = height - 40;
      for (let i = 0; i < bufferLength; i++) {
        const val = (dataArrayX[i] / 128.0) - 1.0;
        const xPos = (i / bufferLength) * width;
        const yPos = xWaveY + val * 20;
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      }
      ctx.stroke();

      // Y-axis Waveform (Left)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
      const yWaveX = 40;
      for (let i = 0; i < bufferLength; i++) {
        const val = (dataArrayY[i] / 128.0) - 1.0;
        const yPos = (i / bufferLength) * height;
        const xPos = yWaveX + val * 20;
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      }
      ctx.stroke();
    }
    
    // Draw the main trace (Lissajous)
    ctx.beginPath();
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = state.beamIntensity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Bloom effect
    ctx.shadowBlur = state.beamIntensity * 3;
    ctx.shadowColor = '#00ff41';

    for (let i = 0; i < bufferLength; i++) {
      const vx = (dataArrayX[i] / 128.0) - 1.0;
      const vy = (dataArrayY[i] / 128.0) - 1.0;

      const x = centerX + vx * scale;
      const y = centerY + vy * scale;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    
    // Sharp core line
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#aaffaa';
    ctx.lineWidth = 1;
    ctx.stroke();

    requestRef.current = requestAnimationFrame(draw);
  }, [state.persistence, state.beamIntensity, state.showWaveforms]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#050505] rounded-[50px] overflow-hidden scanlines shadow-[0_0_100px_rgba(0,255,65,0.1)_inset]"
      style={{
        boxShadow: 'inset 0 0 80px rgba(0,0,0,1), 0 0 20px rgba(0,255,65,0.2)',
        backgroundImage: `
          linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '10% 10%'
      }}
    >
      <canvas 
        ref={canvasRef}
        className="block w-full h-full filter brightness-125 contrast-125"
      />
      {/* Glass overlay */}
      <div className="absolute inset-0 glass-reflection pointer-events-none rounded-[50px] border-[15px] border-zinc-800/80"></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>

      {!state.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <div className="text-center">
            <h3 className="text-green-500 text-2xl font-bold tracking-tighter mb-2 animate-pulse">SYSTEM STANDBY</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Connect Oscillator to Begin</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OscilloscopeDisplay;
