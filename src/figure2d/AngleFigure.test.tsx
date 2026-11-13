import { render, screen } from '@testing-library/react';
import { AngleFigure } from './AngleFigure';

describe('AngleFigure', () => {
  it('label angka berada di dalam gambar + deskripsi aksesibel', () => {
    render(<AngleFigure spec={{ type: 'supplementary', a: 65, labels: ['65°', '?'] }} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAccessibleName('Dua sudut berpelurus: 65° dan ditanyakan.');
    expect(img).toHaveTextContent('65°');
    expect(img).toHaveTextContent('?');
  });

  it('mode netral tidak menyebut jenis hubungan', () => {
    render(<AngleFigure spec={{ type: 'complementary', a: 30, labels: ['a', 'b'] }} neutral />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Gambar dua sudut: a dan b.');
  });

  it('berpenyiku menampilkan tanda siku-siku', () => {
    const { container } = render(<AngleFigure spec={{ type: 'complementary', a: 30, labels: ['30°', '60°'] }} />);
    expect(container.querySelectorAll('path[d^="M 121"]').length).toBe(1);
  });

  it('interaktif menampilkan slider', () => {
    render(<AngleFigure spec={{ type: 'vertical', a: 50, labels: ['50°', '50°', '', ''] }} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
  });
});
