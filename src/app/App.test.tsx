import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';
import { db } from '../data/db';
import { useSession } from '../data/session';
import { makeStudentCode } from '../domain/profile/studentCode';
import { makeRng } from '../domain/random';

beforeEach(async () => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
  useSession.setState({ ready: false, profile: null, sessionId: null });
  await Promise.all(db.tables.map((t) => t.clear()));
});

async function loginAs(code: string, nickname?: string) {
  fireEvent.change(await screen.findByLabelText('Ketik kode siswamu'), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
  if (nickname) {
    fireEvent.change(await screen.findByLabelText('Nama panggilan'), { target: { value: nickname } });
    fireEvent.click(screen.getByRole('button', { name: 'Mulai belajar' }));
  }
}

describe('App', () => {
  it('belum masuk → diarahkan ke halaman Masuk', async () => {
    render(<App />);
    expect(await screen.findByLabelText('Ketik kode siswamu')).toBeInTheDocument();
  });

  it('menolak kode dengan huruf cek salah', async () => {
    render(<App />);
    const good = makeStudentCode('A', makeRng(7));
    const bad = good.slice(0, 5) + (good[5] === 'A' ? 'B' : 'A'); // huruf cek salah
    await loginAs(bad);
    expect(await screen.findByRole('alert')).toHaveTextContent('belum tepat');
  });

  it('siswa baru masuk, melihat peta belajar, lalu ganti siswa tanpa data tercampur', async () => {
    render(<App />);
    await loginAs(makeStudentCode('A', makeRng(7)), 'Raka');
    expect(await screen.findByText('Hai, Raka!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lab Sudut/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Profil Raka/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Keluar & ganti siswa/ }));
    expect(await screen.findByLabelText('Ketik kode siswamu')).toBeInTheDocument();

    const sessions = await db.sessions.toArray();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.endReason).toBe('switch');

    // Masuk lagi dengan kode yang sama → konfirmasi profil lama, bukan profil baru.
    await loginAs(makeStudentCode('A', makeRng(7)));
    expect(await screen.findByText(/Apakah kamu/)).toHaveTextContent('Raka');
    expect(await db.profiles.count()).toBe(1);
  });
});
