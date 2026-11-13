import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { FinishPage } from '../pages/FinishPage';
import { KenaliPage } from '../pages/KenaliPage';
import { LabPage } from '../pages/LabPage';
import { ContohPage } from '../pages/ContohPage';
import { LatihanPage } from '../pages/LatihanPage';
import { TesPage } from '../pages/TesPage';
import { PemanasanPage } from '../pages/PemanasanPage';
import { MisiPage } from '../pages/MisiPage';
import { ProgresPage } from '../pages/ProgresPage';
import { KodePage } from '../pages/KodePage';
import { TanyaPage } from '../pages/TanyaPage';
import { AngketPage } from '../pages/AngketPage';
import { PenelitiPage } from '../pages/PenelitiPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ROUTES } from './routes';
import { useSession } from '../data/session';

const PAGES: Record<string, () => JSX.Element | null> = {
  '/pemanasan': PemanasanPage,
  '/kenali': KenaliPage,
  '/lab': LabPage,
  '/contoh': ContohPage,
  '/latihan': LatihanPage,
  '/misi': MisiPage,
  '/progres': ProgresPage,
};

export function App() {
  useEffect(() => {
    void useSession.getState().restore();
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/masuk" element={<LoginPage />} />
          <Route path="/selesai" element={<FinishPage />} />
          <Route path="/tes/:kind" element={<TesPage />} />
          <Route path="/angket/:id" element={<AngketPage />} />
          <Route path="/peneliti" element={<PenelitiPage />} />
          <Route path="/kode" element={<KodePage />} />
          <Route path="/tanya" element={<TanyaPage />} />
          {ROUTES.filter((r) => r.path !== '/').map((r) => {
            const Page = PAGES[r.path];
            return <Route key={r.path} path={r.path} element={Page ? <Page /> : <PlaceholderPage title={r.title} />} />;
          })}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
