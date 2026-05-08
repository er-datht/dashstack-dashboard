import { render, screen } from "@testing-library/react";
import ColorDots from "../index";

/**
 * Tests for the shared ColorDots component (promoted from
 * src/pages/ProductStock/index.tsx).
 *
 * SPEC: Component contract derived from
 *   openspec/changes/table-gallery-page/specs/shared-components/spec.md
 *   (ADDED Requirement: ColorDots shared component, scenarios for
 *   "Render under the cap" / "Render above the cap" / "Hover tooltip").
 *
 *   Coverage:
 *   - With N <= maxVisible colors: render N swatches and no overflow label.
 *   - With N > maxVisible (default 4): render `maxVisible` swatches and a
 *     "+(N - maxVisible)" overflow label.
 *   - Each swatch carries the color's `name` as its `title` attribute.
 *   - Each swatch's background uses the color's `hex` value (inline style).
 *   - A custom `maxVisible` prop is honored.
 *
 *   The component does not exist yet — these tests are TDD and will fail
 *   until task §1 (promote ColorDots) lands.
 */

type Color = { hex: string; name: string };

const RED: Color = { hex: "#FF0000", name: "Red" };
const GREEN: Color = { hex: "#00FF00", name: "Green" };
const BLUE: Color = { hex: "#0000FF", name: "Blue" };
const BLACK: Color = { hex: "#000000", name: "Black" };
const WHITE: Color = { hex: "#FFFFFF", name: "White" };
const YELLOW: Color = { hex: "#FFFF00", name: "Yellow" };

describe("ColorDots", () => {
  describe("under the default cap (maxVisible = 4)", () => {
    it("renders one swatch per color and no overflow label when colors.length <= 4", () => {
      const { container } = render(
        <ColorDots colors={[RED, GREEN, BLUE]} />
      );

      // Each color has a `title` attribute equal to its name; query the swatches
      // by title to avoid coupling to internal class names or markup.
      expect(screen.getByTitle("Red")).toBeInTheDocument();
      expect(screen.getByTitle("Green")).toBeInTheDocument();
      expect(screen.getByTitle("Blue")).toBeInTheDocument();

      // No overflow label of the form "+N" should appear.
      expect(container.textContent ?? "").not.toMatch(/\+\d+/);
    });

    it("uses each color's hex as the swatch background color via inline style", () => {
      render(<ColorDots colors={[RED, BLUE]} />);

      const redSwatch = screen.getByTitle("Red") as HTMLElement;
      const blueSwatch = screen.getByTitle("Blue") as HTMLElement;

      // jsdom normalizes hex to rgb() in BOTH the inline style attribute
      // and computed style, so assert against the normalized rgb() form.
      expect(redSwatch.style.backgroundColor).toBe("rgb(255, 0, 0)");
      expect(blueSwatch.style.backgroundColor).toBe("rgb(0, 0, 255)");
    });
  });

  describe("above the default cap (maxVisible = 4)", () => {
    it("renders the first 4 swatches and a '+2' overflow label when given 6 colors", () => {
      render(
        <ColorDots colors={[RED, GREEN, BLUE, BLACK, WHITE, YELLOW]} />
      );

      // First four are rendered as swatches.
      expect(screen.getByTitle("Red")).toBeInTheDocument();
      expect(screen.getByTitle("Green")).toBeInTheDocument();
      expect(screen.getByTitle("Blue")).toBeInTheDocument();
      expect(screen.getByTitle("Black")).toBeInTheDocument();

      // Last two are NOT rendered as swatches; instead a "+2" overflow label
      // is shown.
      expect(screen.queryByTitle("White")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Yellow")).not.toBeInTheDocument();
      expect(screen.getByText("+2")).toBeInTheDocument();
    });
  });

  describe("custom maxVisible prop", () => {
    it("respects a custom maxVisible value (maxVisible=2 with 5 colors → 2 swatches + '+3')", () => {
      render(
        <ColorDots
          colors={[RED, GREEN, BLUE, BLACK, WHITE]}
          maxVisible={2}
        />
      );

      expect(screen.getByTitle("Red")).toBeInTheDocument();
      expect(screen.getByTitle("Green")).toBeInTheDocument();

      expect(screen.queryByTitle("Blue")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Black")).not.toBeInTheDocument();
      expect(screen.queryByTitle("White")).not.toBeInTheDocument();

      expect(screen.getByText("+3")).toBeInTheDocument();
    });
  });
});
