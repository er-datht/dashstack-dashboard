type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function Section({
  title,
  children,
}: SectionProps): React.JSX.Element {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-primary mb-6">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{children}</div>
    </section>
  );
}
