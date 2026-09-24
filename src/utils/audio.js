// Web Audio API playful synthesized sound effects (zero external files required)
let audioCtx = null;
let isMuted = false;
function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}
export function toggleMute() {
  isMuted = !isMuted;
  try {
    localStorage.setItem("jp_muted", String(isMuted));
  } catch {}
  return isMuted;
}
export function getMuteState() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("jp_muted");
    if (saved !== null) isMuted = saved === "true";
  }
  return isMuted;
}

/** Playful bubble pop sound on click/touch */
export function playPopSound(pitch = 440) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Pitch sweep upward quickly for bubbly pop
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      pitch * 2.2,
      ctx.currentTime + 0.08,
    );
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {}
}

/** Tactile squish click on touch/button press */
export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

/** Happy celebratory chime for RSVP, checkout, or successful scan */
export function playSuccessChime() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const start = ctx.currentTime + index * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch {}
}
