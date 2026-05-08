type VariantCardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function VariantCard({
  title,
  children,
}: VariantCardProps): React.JSX.Element {
  return (
    <div className="border border-default rounded-lg p-4">
      {title && (
        <h3 className="text-sm font-medium text-secondary mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
