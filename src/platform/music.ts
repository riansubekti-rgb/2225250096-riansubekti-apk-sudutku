/**
 * Backsound SudutKu — lagu ceria orisinal yang DISINTESIS dengan Web Audio API
 * (tanpa file musik → offline, ringan, bebas hak cipta).
 *
 * Catatan pedagogis (prinsip koherensi, Mayer): musik latar menambah beban kognitif saat siswa
 * berpikir. Karena itu musik hanya diputar di layar santai (diatur `MusicController`), mengecil
 * saat Busu berbicara, dan bisa dimatikan siswa.
 */

export const TEMPO = 116;
const STEPS_PER_BAR = 8; // ketukan 1/8
const BARS = 4;

export const midiToFreq = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Progresi C – G – Am – F (nada dasar MIDI oktaf 3) dan nada akornya. */
export const CHORDS: { root: number; tones: number[] }[] = [
  { root: 48, tones: [60, 64, 67] }, // C
  { root: 43, tones: [59, 62, 67] }, // G
  { root: 45, tones: [60, 64, 69] }, // Am
  { root: 41, tones: [60, 65, 69] }, // F
];

/** Melodi pentatonik C (C D E G A) — 0 = diam. Diputar pada putaran genap saja agar tidak membosankan. */
export const MELODY: number[][] = [
  [76, 0, 79, 0, 81, 79, 76, 0],
  [74, 0, 79, 0, 79, 76, 74, 0],
  [72, 0, 76, 0, 81, 79, 76, 0],
  [72, 0, 74, 76, 72, 0, 0, 0],
];

const ARP = [0, 1, 2, 1, 0, 1, 2, 1];

const VOLUME = 0.11;
const DUCKED = 0.035;

class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer = 0;
  private step = 0;
  private loop = 0;
  private nextTime = 0;
  private playing = false;
  private ducked = false;

  get isPlaying() {
    return this.playing;
  }

  private ensure(): boolean {
    if (this.ctx) return true;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 0.1;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  private target() {
    return this.ducked ? DUCKED : VOLUME;
  }

  private fade(to: number, sec: number) {
    if (!this.ctx || !this.master) return;
    const g = this.master.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + sec);
  }

  private tone(freq: number, t: number, dur: number, type: OscillatorType, vol: number, cutoff?: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node: AudioNode = osc;
    if (cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cutoff;
      osc.connect(f);
      node = f;
    }
    node.connect(env).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(env).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  private hat(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.12, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp).connect(env).connect(this.master!);
    src.start(t);
    src.stop(t + 0.06);
  }

  private schedule = () => {
    const ctx = this.ctx!;
    const eighth = 60 / TEMPO / 2;
    while (this.nextTime < ctx.currentTime + 0.12) {
      const bar = Math.floor(this.step / STEPS_PER_BAR);
      const s = this.step % STEPS_PER_BAR;
      const chord = CHORDS[bar]!;
      const t = this.nextTime;
      if (s % 2 === 0) this.tone(midiToFreq(chord.root), t, eighth * 1.8, 'triangle', 0.32);
      this.tone(midiToFreq(chord.tones[ARP[s]!]!), t, eighth * 0.9, 'square', 0.05, 1800);
      if (s === 0 || s === 4) this.kick(t);
      if (s % 2 === 1) this.hat(t);
      const m = MELODY[bar]![s]!;
      if (m && this.loop % 2 === 1) this.tone(midiToFreq(m), t, eighth * 1.6, 'triangle', 0.14);
      this.nextTime += eighth;
      this.step = (this.step + 1) % (STEPS_PER_BAR * BARS);
      if (this.step === 0) this.loop++;
    }
  };

  start() {
    if (this.playing || !this.ensure()) return;
    const ctx = this.ctx!;
    void ctx.resume();
    this.playing = true;
    this.nextTime = ctx.currentTime + 0.05;
    this.timer = window.setInterval(this.schedule, 25);
    this.fade(this.target(), 1.2);
  }

  stop() {
    if (!this.playing || !this.ctx) return;
    this.playing = false;
    this.fade(0, 0.5);
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (this.playing) return;
      window.clearInterval(this.timer);
      void ctx.suspend();
    }, 600);
  }

  /** Kecilkan musik saat Busu berbicara agar suaranya jelas. */
  duck(on: boolean) {
    this.ducked = on;
    if (this.playing) this.fade(this.target(), 0.25);
  }
}

export const music = new MusicEngine();
