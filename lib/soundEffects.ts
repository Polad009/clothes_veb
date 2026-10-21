"use client";

/**
 * High-End Luxury Audio Engine for NOVA & CO.
 * Synthesizes ultra-pure, zero-latency (0ms) acoustic chimes using native Web Audio API.
 * Requires NO external network requests, works 100% offline, never fails with 404 or CORS.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Dopamine-inducing luxury "Add to Bag" chime
 * Multi-harmonic sweet bell resonance with subtle acoustic decay
 */
export function playAddToCartSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Master gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.28, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  masterGain.connect(ctx.destination);

  // Note 1: High crisp bell (G6: ~1568Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1567.98, now);
  osc1.frequency.exponentialRampToValueAtTime(1575, now + 0.3);

  // Note 2: Harmonic complement (C6: ~1046.5Hz)
  const osc2 = ctx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1046.5, now + 0.04);

  // Note 3: Warm undertone (E5: ~659.25Hz)
  const osc3 = ctx.createOscillator();
  osc3.type = "sine";
  osc3.frequency.setValueAtTime(659.25, now + 0.08);

  // Gain envelopes
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.7, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0.5, now + 0.04);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  const gain3 = ctx.createGain();
  gain3.gain.setValueAtTime(0, now);
  gain3.gain.setValueAtTime(0.3, now + 0.08);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);

  gain1.connect(masterGain);
  gain2.connect(masterGain);
  gain3.connect(masterGain);

  osc1.start(now);
  osc2.start(now + 0.04);
  osc3.start(now + 0.08);

  osc1.stop(now + 0.5);
  osc2.stop(now + 0.6);
  osc3.stop(now + 0.7);
}

/**
 * Celebratory luxury Apple Pay / Purchase Complete chime
 * Triumphant harmonious chord progression that makes the customer feel accomplished
 */
export function playPurchaseSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.35, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  masterGain.connect(ctx.destination);

  // Arpeggiated celebratory chord: C5 -> E5 -> G5 -> C6
  const chordNotes = [
    { freq: 523.25, time: 0.0 },   // C5
    { freq: 659.25, time: 0.1 },   // E5
    { freq: 783.99, time: 0.2 },   // G5
    { freq: 1046.5, time: 0.3 },   // C6
    { freq: 1318.5, time: 0.42 },  // E6
  ];

  chordNotes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + time);

    noteGain.gain.setValueAtTime(0, now + time);
    noteGain.gain.linearRampToValueAtTime(0.6, now + time + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.85);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now + time);
    osc.stop(now + time + 0.9);
  });
}

/**
 * Subtle tactile micro-interaction click for tabs and toggles
 */
export function playMicroClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}
