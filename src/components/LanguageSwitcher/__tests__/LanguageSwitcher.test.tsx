import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSwitcher from "../index";

// Mock SVG flag imports — Vite resolves SVGs as module paths
vi.mock("../../../assets/icons/flags/en.svg", () => ({
  default: "/flags/en.svg",
}));
vi.mock("../../../assets/icons/flags/jp.svg", () => ({
  default: "/flags/jp.svg",
}));

// Shared changeLanguage spy so component and test reference the same instance
const changeLanguageSpy = vi.fn();
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: changeLanguageSpy,
      language: "en",
    },
    ready: true,
  }),
}));

describe("LanguageSwitcher", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dropdown visibility", () => {
    it("renders dropdown content when isOpen is true", () => {
      render(<LanguageSwitcher {...defaultProps} />);

      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();
      // "English" appears in both trigger and dropdown row
      expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(2);
    });

    it("does not render dropdown content when isOpen is false", () => {
      render(<LanguageSwitcher {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText("navigation:languageSwitcher.selectLanguage")
      ).not.toBeInTheDocument();
    });
  });

  describe("header", () => {
    it('displays the translated "Select Language" header when open', () => {
      render(<LanguageSwitcher {...defaultProps} />);

      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();
    });
  });

  describe("flag images", () => {
    it("displays flag images for both English and Japanese rows", () => {
      render(<LanguageSwitcher {...defaultProps} />);

      const flagImages = screen.getAllByRole("img");
      const flagSrcs = flagImages.map((img) => img.getAttribute("src"));
      expect(flagSrcs).toContain("/flags/en.svg");
      expect(flagSrcs).toContain("/flags/jp.svg");
    });
  });

  describe("language labels", () => {
    it("shows native language names in dropdown rows", () => {
      render(<LanguageSwitcher {...defaultProps} />);

      // "English" appears in trigger and dropdown row
      expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("\u65E5\u672C\u8A9E")).toBeInTheDocument();
    });
  });

  describe("checkmark indicator", () => {
    it("shows checkmark only on the currently selected language", () => {
      render(<LanguageSwitcher {...defaultProps} />);

      // Get the dropdown row buttons (skip the trigger which is the first button)
      const allButtons = screen.getAllByRole("button");
      const englishRow = allButtons[1]; // first dropdown row
      const japaneseRow = allButtons[2]; // second dropdown row

      const englishSvgs = englishRow?.querySelectorAll("svg");
      const japaneseSvgs = japaneseRow?.querySelectorAll("svg");

      expect(englishSvgs?.length).toBeGreaterThan(0);
      expect(japaneseSvgs?.length ?? 0).toBe(0);
    });

    it("calls i18n.changeLanguage with correct code on selection", () => {
      render(<LanguageSwitcher {...defaultProps} />);

      const japaneseButton = screen
        .getByText("\u65E5\u672C\u8A9E")
        .closest("button")!;
      fireEvent.click(japaneseButton);

      expect(changeLanguageSpy).toHaveBeenCalledWith("jp");
    });
  });

  describe("escape key", () => {
    it("calls onClose when Escape key is pressed while open", () => {
      const onClose = vi.fn();
      render(<LanguageSwitcher {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose on Escape when dropdown is closed", () => {
      const onClose = vi.fn();
      render(
        <LanguageSwitcher {...defaultProps} isOpen={false} onClose={onClose} />
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("language selection", () => {
    it("calls onClose when a language is selected", () => {
      const onClose = vi.fn();
      render(<LanguageSwitcher {...defaultProps} onClose={onClose} />);

      const japaneseButton = screen
        .getByText("\u65E5\u672C\u8A9E")
        .closest("button")!;
      fireEvent.click(japaneseButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("chevron rotation", () => {
    it("rotates ChevronDown 180 degrees when dropdown is open", () => {
      render(<LanguageSwitcher {...defaultProps} isOpen={true} />);

      const triggerButton = screen.getAllByRole("button")[0];
      const chevronSvg = triggerButton?.querySelector("svg");

      expect(chevronSvg).toBeInTheDocument();
      const style = chevronSvg?.style?.transform || "";
      expect(style).toContain("180");
    });

    it("does not rotate ChevronDown when dropdown is closed", () => {
      render(<LanguageSwitcher {...defaultProps} isOpen={false} />);

      const triggerButton = screen.getAllByRole("button")[0];
      const chevronSvg = triggerButton?.querySelector("svg");

      expect(chevronSvg).toBeInTheDocument();
      const style = chevronSvg?.style?.transform || "";
      expect(style).not.toContain("180");
    });
  });

  describe("trigger display", () => {
    it("shows current language flag and name in the trigger", () => {
      render(<LanguageSwitcher {...defaultProps} isOpen={false} />);

      expect(screen.getByText("English")).toBeInTheDocument();

      const triggerImg = screen.getByRole("img");
      expect(triggerImg).toHaveAttribute("src", "/flags/en.svg");
    });
  });

  describe("dropdown animation", () => {
    it("applies the usermenu-enter animation class to the dropdown panel", () => {
      const { container } = render(<LanguageSwitcher {...defaultProps} />);

      const panel = container.querySelector(".animate-usermenu-enter");
      expect(panel).toBeInTheDocument();
    });
  });

  describe("trigger toggle", () => {
    it("calls onToggle when trigger button is clicked", () => {
      const onToggle = vi.fn();
      render(<LanguageSwitcher {...defaultProps} onToggle={onToggle} />);

      const triggerButton = screen.getAllByRole("button")[0];
      fireEvent.click(triggerButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });
});
