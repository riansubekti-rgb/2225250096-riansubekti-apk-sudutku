import { moodFromText } from './moodFromText';
import { splitSentences, toSpeakable } from '../../platform/speech';

describe('ekspresi mengikuti kalimat', () => {
  it.each([
    ['Belum tepat.', 'oops'],
    ['Tidak apa-apa, semua orang pernah bingung.', 'sad'],
    ['Hebat, semua langkah benar!', 'cheer'],
    ['Tepat!', 'cheer'],
    ['Aku dibuat oleh Kak Rian Subekti.', 'proud'],
    ['Ingat: pelurus = lurus.', 'wink'],
    ['Apakah jawabanmu masuk akal?', 'think'],
    ['Wah, 95° tidak bisa menjadi sudut berpenyiku.', 'wow'],
  ])('%s → %s', (s, mood) => expect(moodFromText(s)).toBe(mood));

  it('kalimat netral memakai ekspresi dasar', () => expect(moodFromText('Sudut lurus besarnya 180°.', 'think')).toBe('think'));
});

describe('teks untuk suara', () => {
  it('memecah kalimat', () => expect(splitSentences('Hai! Aku Busu. Siap?')).toEqual(['Hai!', 'Aku Busu.', 'Siap?']));
  it('membacakan simbol matematika', () => {
    expect(toSpeakable('2x + 4x = 90°')).toBe('2 x tambah 4 x sama dengan 90 derajat');
    expect(toSpeakable('∠a = 35°')).toBe('sudut a sama dengan 35 derajat');
  });
});

describe('pilih suara gadis', () => {
  it('utamakan suara perempuan Indonesia', async () => {
    const { pickVoice } = await import('../../platform/speech');
    const voices = [
      { lang: 'en-US', name: 'Google US English' },
      { lang: 'id-ID', name: 'Microsoft Andika - Indonesian (Indonesia)' },
      { lang: 'id-ID', name: 'Microsoft Gadis Online (Natural) - Indonesian' },
    ];
    expect(pickVoice(voices)?.name).toContain('Gadis');
    expect(pickVoice([voices[1]!])?.name).toContain('Andika'); // tidak ada pilihan lain
    expect(pickVoice([voices[0]!])).toBeUndefined();
  });
});
