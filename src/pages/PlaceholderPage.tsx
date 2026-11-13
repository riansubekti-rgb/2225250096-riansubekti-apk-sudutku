export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-card border border-dashed border-line p-6 text-center text-ink-muted">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1">Bagian ini sedang dibuat.</p>
    </div>
  );
}
