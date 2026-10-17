let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function playBubblePop(freq: number = 580) {
  if (typeof window === 'undefined' || !soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, audioCtx.currentTime + 0.055);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.065);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
  } catch {}
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (soundEnabled) playBubblePop(660);
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}
