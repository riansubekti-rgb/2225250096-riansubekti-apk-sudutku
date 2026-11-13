import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="p-6 text-center">
      <p className="font-bold">Halaman tidak ditemukan.</p>
      <Link to="/" className="mt-3 inline-block underline">
        Kembali ke Peta Belajar
      </Link>
    </div>
  );
}
