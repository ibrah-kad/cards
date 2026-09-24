import confetti from "canvas-confetti";
import { playSuccessChime } from "./audio";
export function fireCelebrationConfetti(originX = 0.5, originY = 0.6) {
  playSuccessChime();

  // Festive multi-layer bursts
  confetti({
    particleCount: 65,
    spread: 70,
    origin: {
      x: originX,
      y: originY,
    },
    colors: ["#E8912D", "#F9B25A", "#5F956A", "#F7B5A0", "#FFFDF9", "#8BA8D8"],
    ticks: 200,
    gravity: 0.9,
    scalar: 1.1,
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: {
        x: Math.max(0.1, originX - 0.2),
        y: originY,
      },
      colors: ["#E8912D", "#F7B5A0", "#5F956A"],
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: {
        x: Math.min(0.9, originX + 0.2),
        y: originY,
      },
      colors: ["#E8912D", "#F9B25A", "#8BA8D8"],
    });
  }, 120);
}
export function fireMiniBurst(x, y) {
  // Convert client coordinates to normalized 0..1 coordinates
  const normX = x / window.innerWidth;
  const normY = y / window.innerHeight;
  confetti({
    particleCount: 22,
    spread: 45,
    origin: {
      x: normX,
      y: normY,
    },
    colors: ["#E8912D", "#5F956A", "#F7B5A0"],
    ticks: 100,
    gravity: 1.2,
    scalar: 0.8,
  });
}
