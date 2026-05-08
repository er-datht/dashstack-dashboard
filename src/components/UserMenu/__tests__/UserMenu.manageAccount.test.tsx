/**
 * Tests for the UserMenu's "Manage Account" wiring.
 *
 * SPEC: openspec/changes/manage-account-page/specs/user-menu/spec.md
 *
 * MODIFIED requirement: Manage Account is no longer a placeholder — it
 * navigates to ROUTES.MANAGE_ACCOUNT and shows no toast.
 *
 * UNCHANGED: Change Password and Activity Log retain the "Coming Soon"
 * placeholder behavior (toast appears).
 *
 * The wiring does not exist yet — these tests are expected to fail until
 * task 3.1 is implemented.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import UserMenu from "../index";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: "/dashboard",
    state: null,
    search: "",
    hash: "",
    key: "default",
  }),
}));

describe("UserMenu — Manage Account navigation", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  describe("Manage Account click", () => {
    it("navigates to /manage-account, closes the dropdown, and shows no toast", () => {
      const onClose = vi.fn();
      render(<UserMenu {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText("navigation:userMenu.manageAccount"));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/manage-account");
      expect(onClose).toHaveBeenCalledTimes(1);

      // No "Coming Soon" toast should appear.
      expect(
        screen.queryByText("navigation:userMenu.comingSoon")
      ).not.toBeInTheDocument();
    });
  });

  describe("Change Password click (placeholder preserved)", () => {
    it("does not navigate and shows the Coming Soon toast", () => {
      render(<UserMenu {...defaultProps} />);

      fireEvent.click(screen.getByText("navigation:userMenu.changePassword"));

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        screen.getByText("navigation:userMenu.comingSoon")
      ).toBeInTheDocument();
    });
  });

  describe("Activity Log click (placeholder preserved)", () => {
    it("does not navigate and shows the Coming Soon toast", () => {
      render(<UserMenu {...defaultProps} />);

      fireEvent.click(screen.getByText("navigation:userMenu.activityLog"));

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        screen.getByText("navigation:userMenu.comingSoon")
      ).toBeInTheDocument();
    });
  });
});
