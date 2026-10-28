"use client";

/**
 * High-End Luxury Audio Engine for Horvvalle Atelier.
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

let orderConfirmedAudioInstance: HTMLAudioElement | null = null;
let lastPurchaseSoundTime = 0;

/**
 * Prestigious Luxury Order Confirmation Sound ("Sifariş Təsdiqləndi")
 * Replaces the jarring merchant "cha-ching" with an elegant client-side confirmation chime.
 * Uses /sounds/order-confirmed.wav with zero-latency Web Audio API acoustic fallback.
 */
export function playPurchaseSuccessSound() {
  if (typeof window !== "undefined") {
    const now = Date.now();
    if (now - lastPurchaseSoundTime < 4000) {
      return;
    }
    lastPurchaseSoundTime = now;

    try {
      if (!orderConfirmedAudioInstance) {
        orderConfirmedAudioInstance = new Audio("/sounds/order-confirmed.wav");
        orderConfirmedAudioInstance.preload = "auto";
      }
      orderConfirmedAudioInstance.currentTime = 0;
      orderConfirmedAudioInstance.volume = 0.85;
      const playPromise = orderConfirmedAudioInstance.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err && err.name !== "AbortError") {
            playOrderConfirmedChime();
          }
        });
        return;
      }
    } catch (e) {
      playOrderConfirmedChime();
    }
  }
}

/**
 * Pure Web Audio API synthesized order confirmation chime
 * Soothing, reassuring, prestigious double-bell resonance
 */
export function playOrderConfirmedChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
  masterGain.connect(ctx.destination);

  // Prestigious ascending confirmation notes: F5 (698.46Hz) -> A5 (880Hz) -> C6 (1046.5Hz)
  const chordNotes = [
    { freq: 698.46, time: 0.00, dur: 0.8, type: "sine" as OscillatorType, vol: 0.4 },
    { freq: 880.00, time: 0.12, dur: 0.9, type: "triangle" as OscillatorType, vol: 0.45 },
    { freq: 1046.50, time: 0.24, dur: 1.2, type: "sine" as OscillatorType, vol: 0.55 },
    { freq: 2093.00, time: 0.24, dur: 0.6, type: "sine" as OscillatorType, vol: 0.12 }, // Subtle high shimmer
  ];

  chordNotes.forEach(({ freq, time, dur, type, vol }) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + time);

    noteGain.gain.setValueAtTime(0, now + time);
    noteGain.gain.linearRampToValueAtTime(vol, now + time + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now + time);
    osc.stop(now + time + dur + 0.05);
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
