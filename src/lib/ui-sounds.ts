type AudioContextConstructor = typeof AudioContext;

type AudioWindow = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

let audio: AudioContext | null = null;
let shutterAudio: HTMLAudioElement | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!AudioCtor) return null;

  audio ??= new AudioCtor();
  void audio.resume();
  return audio;
}

function envelope(
  ctx: AudioContext,
  gain: GainNode,
  time: number,
  peak: number,
  attack: number,
  release: number,
) {
  gain.gain.cancelScheduledValues(time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + release);
}

function playTone(
  frequency: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  delay = 0,
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const time = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, time);
  envelope(ctx, gain, time, peak, 0.006, duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.03);
}

export function playCountdownBeep() {
  playTone(880, 0.11, 0.18, "sine");
  playTone(1320, 0.08, 0.08, "triangle", 0.015);
}

export function playSoftClick() {
  playTone(520, 0.045, 0.05, "triangle");
  playTone(880, 0.035, 0.035, "sine", 0.018);
}

export function playShutterSound() {
  if (typeof window === "undefined") return;

  shutterAudio ??= new Audio("/sounds/camera-shutter.mp3");
  shutterAudio.currentTime = 0;
  shutterAudio.volume = 0.75;

  void shutterAudio.play().catch(() => {
    playTone(1100, 0.07, 0.2, "square");
    playTone(720, 0.07, 0.18, "square", 0.065);
  });
}
