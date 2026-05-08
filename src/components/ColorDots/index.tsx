type Color = {
  name: string;
  hex: string;
};

type ColorDotsProps = {
  colors: Color[];
  maxVisible?: number;
};

export default function ColorDots({
  colors,
  maxVisible = 4,
}: ColorDotsProps): React.JSX.Element {
  const visibleColors = colors.slice(0, maxVisible);
  const remainingCount = colors.length - maxVisible;

  return (
    <div className="flex items-center gap-1.5">
      {visibleColors.map((color, index) => (
        <div
          key={index}
          className="w-5 h-5 rounded-full"
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-secondary ml-1">+{remainingCount}</span>
      )}
    </div>
  );
}
