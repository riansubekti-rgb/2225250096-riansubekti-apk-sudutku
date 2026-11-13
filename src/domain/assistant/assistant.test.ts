import kbRaw from '../../../content/mascot/tanya.json';
import { answer, matchKb, normalize, partnerFromText, solveEquationText, type KbEntry } from './assistant';

const kb = kbRaw.entries as unknown as KbEntry[];
const fb = { mood: 'think', text: 'belum paham' };
const ask = (q: string) => answer(kb, fb, q);

describe('normalisasi bahasa siswa', () => {
  it('menyamakan imbuhan & singkatan', () => {
    expect(normalize('Brp sudut BERPELURUS-nya??')).toBe('berapa sudut pelurus-nya');
    expect(normalize('gmn cara cari x, gak ngerti')).toBe('bagaimana cara cari x tidak paham');
  });
});

describe('bank tanya-jawab', () => {
  it.each([
    ['Apa itu sudut berpelurus?', 'pelurus'],
    ['apa itu sudut berpenyiku', 'penyiku'],
    ['Apa itu sudut bertolak belakang?', 'tolak-belakang'],
    ['apa itu sudut siku-siku', 'siku'],
    ['Apa itu sudut?', 'sudut'],
    ['Apa bedanya pelurus dan penyiku?', 'beda-pelurus-penyiku'],
    ['aku sering ketuker pelurus sama penyiku', 'beda-pelurus-penyiku'],
    ['Kenapa sudut bertolak belakang sama besar?', 'kenapa-tolak'],
    ['Bagaimana cara mencari x?', 'cari-x'],
    ['siapa yang membuat aplikasi ini', 'pembuat'],
    ['makasih busu', 'terima-kasih'],
    ['aku bingung banget', 'bingung'],
    ['apa itu sudut pelurs', 'pelurus'], // salah ketik
  ])('%s → %s', (q, id) => expect(ask(q).id).toBe(id));

  it('pertanyaan di luar topik → jawaban jujur "belum paham"', () => {
    expect(ask('siapa presiden pertama indonesia').kind).toBe('fallback');
    expect(matchKb(kb, 'resep nasi goreng')).toBeNull();
  });
});

describe('kalkulator Busu', () => {
  it('menyelesaikan persamaan dengan langkah', () => {
    const a = solveEquationText('2x + 4x = 90')!;
    expect(a.text).toContain('x = 15');
    expect(a.steps!.map((s) => s.text)).toEqual(['6x = 90', 'x = 15']);
  });
  it('persamaan dengan konstanta & kurung', () => {
    const a = solveEquationText('(3x + 15) + (2x − 10) = 180')!;
    expect(a.steps!.map((s) => s.text)).toEqual(['5x + 5 = 180', '5x = 175', 'x = 35']);
  });
  it('x di kedua ruas (bertolak belakang)', () => {
    const a = solveEquationText('4x - 25 = 2x + 35')!;
    expect(a.text).toContain('x = 30');
  });
  it('pasangan sudut dari kalimat', () => {
    expect(partnerFromText(normalize('penyiku dari 35 berapa'))!.text).toContain('55°');
    expect(partnerFromText(normalize('berapa pelurus 40 derajat'))!.text).toContain('140°');
    expect(partnerFromText(normalize('bertolak belakang dengan 70'))!.text).toContain('70°');
    expect(partnerFromText(normalize('penyiku dari 95'))!.mood).toBe('wow');
  });
  it('angka 90/180 dianggap pertanyaan konsep', () => {
    expect(ask('kenapa pelurus 180').kind).toBe('kb');
  });
});
