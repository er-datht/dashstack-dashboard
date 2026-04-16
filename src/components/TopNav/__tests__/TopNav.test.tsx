import { render, screen, fireEvent } from "@testing-library/react";
import TopNav from "../index";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock SVG flag imports used by LanguageSwitcher
vi.mock("../../../assets/icons/flags/en.svg", () => ({
  default: "en-flag.svg",
}));
vi.mock("../../../assets/icons/flags/jp.svg", () => ({
  default: "jp-flag.svg",
}));

describe("TopNav", () => {
  describe("user menu trigger", () => {
    it('renders a profile trigger button with aria-haspopup="menu"', () => {
      render(<TopNav />);

      const trigger = screen.getByRole("button", { name: /moni roy/i });
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    });

    it('has aria-expanded="false" by default', () => {
      render(<TopNav />);

      const trigger = screen.getByRole("button", { name: /moni roy/i });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("toggles aria-expanded on click", () => {
      render(<TopNav />);

      const trigger = screen.getByRole("button", { name: /moni roy/i });

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("dropdown visibility", () => {
    it("shows user menu items when trigger is clicked", () => {
      render(<TopNav />);

      expect(
        screen.queryByText("navigation:userMenu.logOut")
      ).not.toBeInTheDocument();

      const trigger = screen.getByRole("button", { name: /moni roy/i });
      fireEvent.click(trigger);

      expect(
        screen.getByText("navigation:userMenu.logOut")
      ).toBeInTheDocument();
    });

    it("closes dropdown when clicking outside", () => {
      render(<TopNav />);

      const trigger = screen.getByRole("button", { name: /moni roy/i });
      fireEvent.click(trigger);

      expect(
        screen.getByText("navigation:userMenu.logOut")
      ).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(
        screen.queryByText("navigation:userMenu.logOut")
      ).not.toBeInTheDocument();
    });
  });

  describe("chevron indicator", () => {
    it("renders a ChevronDown icon in the trigger area", () => {
      render(<TopNav />);

      const trigger = screen.getByRole("button", { name: /moni roy/i });
      const svg = trigger.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("language dropdown coordination", () => {
    it("opens language dropdown when language trigger is clicked", () => {
      render(<TopNav />);

      const langTrigger = screen.getByText("English").closest("button")!;
      fireEvent.click(langTrigger);

      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();
    });

    it("closes language dropdown when user menu is opened (mutual exclusivity)", () => {
      render(<TopNav />);

      // Open language dropdown first
      const langTrigger = screen.getByText("English").closest("button")!;
      fireEvent.click(langTrigger);
      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();

      // Open user menu — language dropdown should close
      const userMenuTrigger = screen.getByRole("button", {
        name: /moni roy/i,
      });
      fireEvent.click(userMenuTrigger);

      expect(
        screen.queryByText("navigation:languageSwitcher.selectLanguage")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("navigation:userMenu.logOut")
      ).toBeInTheDocument();
    });

    it("closes user menu when language dropdown is opened (mutual exclusivity)", () => {
      render(<TopNav />);

      // Open user menu first
      const userMenuTrigger = screen.getByRole("button", {
        name: /moni roy/i,
      });
      fireEvent.click(userMenuTrigger);
      expect(
        screen.getByText("navigation:userMenu.logOut")
      ).toBeInTheDocument();

      // Open language dropdown — user menu should close
      const langTrigger = screen.getByText("English").closest("button")!;
      fireEvent.click(langTrigger);

      expect(
        screen.queryByText("navigation:userMenu.logOut")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();
    });

    it("closes language dropdown when clicking outside", () => {
      render(<TopNav />);

      const langTrigger = screen.getByText("English").closest("button")!;
      fireEvent.click(langTrigger);

      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(
        screen.queryByText("navigation:languageSwitcher.selectLanguage")
      ).not.toBeInTheDocument();
    });
  });

  describe("notification dropdown trigger", () => {
    // The notification bell is the button that contains the Bell icon but no
    // text label. We locate it by role + accessible name (aria-label).
    // SPEC: assumed the bell button retains aria-label referencing the
    // "navigation:notifications" translation key — verify during implementation.
    const getBellButton = () =>
      screen
        .getAllByRole("button")
        .find((btn) => btn.querySelector("svg.lucide-bell")) ??
      // Fallback: first button containing an svg but no visible text content
      screen
        .getAllByRole("button")
        .find(
          (btn) =>
            btn.querySelector("svg") !== null &&
            btn.textContent?.trim() === ""
        )!;

    it('has aria-haspopup="menu" and aria-expanded="false" by default', () => {
      render(<TopNav />);

      const bell = getBellButton();
      expect(bell).toHaveAttribute("aria-haspopup", "menu");
      expect(bell).toHaveAttribute("aria-expanded", "false");
    });

    it("toggles aria-expanded to true and opens the dropdown on click", () => {
      render(<TopNav />);

      const bell = getBellButton();
      fireEvent.click(bell);

      expect(bell).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();
    });

    it("closes the dropdown when the bell is clicked while open", () => {
      render(<TopNav />);

      const bell = getBellButton();
      fireEvent.click(bell);
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();

      fireEvent.click(bell);
      expect(
        screen.queryByText("navigation:notifications.title")
      ).not.toBeInTheDocument();
      expect(bell).toHaveAttribute("aria-expanded", "false");
    });

    it("closes notification dropdown when clicking outside", () => {
      render(<TopNav />);

      const bell = getBellButton();
      fireEvent.click(bell);
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(
        screen.queryByText("navigation:notifications.title")
      ).not.toBeInTheDocument();
    });
  });

  describe("three-way dropdown coordination", () => {
    const getBellButton = () =>
      screen
        .getAllByRole("button")
        .find((btn) => btn.querySelector("svg.lucide-bell")) ??
      screen
        .getAllByRole("button")
        .find(
          (btn) =>
            btn.querySelector("svg") !== null &&
            btn.textContent?.trim() === ""
        )!;

    it("closes user menu when opening notification dropdown", () => {
      render(<TopNav />);

      // Open user menu first
      const userMenuTrigger = screen.getByRole("button", {
        name: /moni roy/i,
      });
      fireEvent.click(userMenuTrigger);
      expect(
        screen.getByText("navigation:userMenu.logOut")
      ).toBeInTheDocument();

      // Open notification dropdown — user menu should close
      fireEvent.click(getBellButton());

      expect(
        screen.queryByText("navigation:userMenu.logOut")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();
    });

    it("closes language switcher when opening notification dropdown", () => {
      render(<TopNav />);

      // Open language dropdown first
      const langTrigger = screen.getByText("English").closest("button")!;
      fireEvent.click(langTrigger);
      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();

      // Open notification dropdown — language switcher should close
      fireEvent.click(getBellButton());

      expect(
        screen.queryByText("navigation:languageSwitcher.selectLanguage")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();
    });

    it("closes notification dropdown when opening user menu", () => {
      render(<TopNav />);

      // Open notification dropdown first
      fireEvent.click(getBellButton());
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();

      // Open user menu — notification dropdown should close
      const userMenuTrigger = screen.getByRole("button", {
        name: /moni roy/i,
      });
      fireEvent.click(userMenuTrigger);

      expect(
        screen.queryByText("navigation:notifications.title")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("navigation:userMenu.logOut")
      ).toBeInTheDocument();
    });

    it("closes notification dropdown when opening language switcher", () => {
      render(<TopNav />);

      // Open notification dropdown first
      fireEvent.click(getBellButton());
      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();

      // Open language dropdown — notification dropdown should close
      const langTrigger = screen.getByText("English").closest("button")!;
      fireEvent.click(langTrigger);

      expect(
        screen.queryByText("navigation:notifications.title")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("navigation:languageSwitcher.selectLanguage")
      ).toBeInTheDocument();
    });
  });
});
