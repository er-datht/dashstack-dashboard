import { render, screen, fireEvent } from "@testing-library/react";
import NotificationDropdown from "../index";

describe("NotificationDropdown", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  describe("rendering", () => {
    it("renders nothing when isOpen is false", () => {
      render(<NotificationDropdown {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(
        screen.queryByText("navigation:notifications.title")
      ).not.toBeInTheDocument();
    });

    it("renders header with title translation key when isOpen is true", () => {
      render(<NotificationDropdown {...defaultProps} />);

      expect(
        screen.getByText("navigation:notifications.title")
      ).toBeInTheDocument();
    });

    it("renders all 4 notification items in order (plus footer as menuitem)", () => {
      render(<NotificationDropdown {...defaultProps} />);

      const items = screen.getAllByRole("menuitem");
      // 4 notification items + 1 footer (all menuitems per WAI-ARIA)
      expect(items).toHaveLength(5);

      expect(items[0]).toHaveTextContent(
        "navigation:notifications.items.settings.title"
      );
      expect(items[1]).toHaveTextContent(
        "navigation:notifications.items.eventUpdate.title"
      );
      expect(items[2]).toHaveTextContent(
        "navigation:notifications.items.profile.title"
      );
      expect(items[3]).toHaveTextContent(
        "navigation:notifications.items.applicationError.title"
      );
      expect(items[4]).toHaveTextContent("navigation:notifications.seeAll");
    });

    it("renders the 'See all notification' footer", () => {
      render(<NotificationDropdown {...defaultProps} />);

      expect(
        screen.getByText("navigation:notifications.seeAll")
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it('renders the dropdown container with role="menu"', () => {
      render(<NotificationDropdown {...defaultProps} />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it('renders each item as a <button> with role="menuitem"', () => {
      render(<NotificationDropdown {...defaultProps} />);

      const items = screen.getAllByRole("menuitem");
      items.forEach((item) => {
        expect(item.tagName).toBe("BUTTON");
      });
    });
  });

  describe("interactions", () => {
    it("calls onClose and shows toast when a notification item is clicked", () => {
      const onClose = vi.fn();
      render(<NotificationDropdown {...defaultProps} onClose={onClose} />);

      fireEvent.click(
        screen.getByText("navigation:notifications.items.settings.title")
      );

      expect(onClose).toHaveBeenCalled();
      expect(
        screen.getByText("navigation:userMenu.comingSoon")
      ).toBeInTheDocument();
    });

    it("calls onClose and shows toast when the 'See all notification' footer is clicked", () => {
      const onClose = vi.fn();
      render(<NotificationDropdown {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText("navigation:notifications.seeAll"));

      expect(onClose).toHaveBeenCalled();
      expect(
        screen.getByText("navigation:userMenu.comingSoon")
      ).toBeInTheDocument();
    });

    it("does not render toast before any item is clicked", () => {
      render(<NotificationDropdown {...defaultProps} />);

      expect(
        screen.queryByText("navigation:userMenu.comingSoon")
      ).not.toBeInTheDocument();
    });
  });

  describe("escape key behavior", () => {
    it("calls onClose when Escape key is pressed while open", () => {
      const onClose = vi.fn();
      render(<NotificationDropdown {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does NOT call onClose on Escape when already closed", () => {
      const onClose = vi.fn();
      render(
        <NotificationDropdown
          {...defaultProps}
          isOpen={false}
          onClose={onClose}
        />
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
