/**
 * Tests for the TopNav avatar render path and `auth-user-changed`
 * subscription.
 *
 * SPEC: openspec/changes/manage-account-page/specs/app-shell/spec.md
 *
 * Behaviors under test:
 *   - Avatar uses storedUser.avatar when present
 *   - Avatar falls back to ui-avatars.com initials URL when avatar is absent
 *   - TopNav subscribes to `auth-user-changed` on mount
 *   - TopNav re-renders and re-reads getStoredUser when the event fires
 *   - TopNav unsubscribes on unmount
 *
 * The wiring does not exist yet — these tests are expected to fail until
 * tasks 4.1–4.3 are implemented.
 */

import { render, screen, act } from "@testing-library/react";
import TopNav from "../index";

// react-router-dom is needed by UserMenu (a child of TopNav).
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({
    pathname: "/dashboard",
    state: null,
    search: "",
    hash: "",
    key: "default",
  }),
}));

// Mock SVG flag imports (pulled in via LanguageSwitcher).
vi.mock("../../../assets/icons/flags/en.svg", () => ({
  default: "en-flag.svg",
}));
vi.mock("../../../assets/icons/flags/jp.svg", () => ({
  default: "jp-flag.svg",
}));

// `mockUserHolder` lets each test mutate the value getStoredUser returns
// across re-renders WITHOUT re-instantiating the mock. This is essential
// for the "re-renders on event" test, which dispatches `auth-user-changed`
// and expects TopNav to re-read the *new* value.
type MockUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
} | null;

const mockUserHolder: { user: MockUser } = { user: null };

vi.mock("../../../services/auth", () => ({
  getStoredUser: () => mockUserHolder.user,
}));

describe("TopNav — avatar render path", () => {
  beforeEach(() => {
    mockUserHolder.user = null;
  });

  it("renders avatar <img> using storedUser.avatar when present", () => {
    mockUserHolder.user = {
      id: "1",
      name: "Hathuc",
      email: "hathuc@example.com",
      role: "admin",
      avatar: "data:image/png;base64,foo",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    render(<TopNav />);

    // SPEC: The user-profile avatar img has `alt={userName}`. The trigger
    // button text is the user name; we locate the trigger and read the
    // img inside it.
    const triggerButton = screen.getByRole("button", { name: /hathuc/i });
    const avatarImg = triggerButton.querySelector(
      "img"
    ) as HTMLImageElement | null;
    expect(avatarImg).not.toBeNull();
    expect(avatarImg!.src).toContain("data:image/png;base64,foo");
  });

  it("falls back to ui-avatars.com URL when storedUser has no avatar", () => {
    mockUserHolder.user = {
      id: "1",
      name: "Hathuc",
      email: "hathuc@example.com",
      role: "admin",
      // No avatar
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    render(<TopNav />);

    const triggerButton = screen.getByRole("button", { name: /hathuc/i });
    const avatarImg = triggerButton.querySelector(
      "img"
    ) as HTMLImageElement | null;
    expect(avatarImg).not.toBeNull();
    expect(avatarImg!.src).toContain("ui-avatars.com");
    // The user's name is encoded into the fallback URL
    expect(avatarImg!.src).toContain("Hathuc");
  });
});

describe("TopNav — auth-user-changed subscription", () => {
  beforeEach(() => {
    mockUserHolder.user = null;
  });

  it("registers a window listener for auth-user-changed on mount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    mockUserHolder.user = {
      id: "1",
      name: "Hathuc",
      email: "hathuc@example.com",
      role: "admin",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    render(<TopNav />);

    const authChangedRegistrations = addSpy.mock.calls.filter(
      (call) => call[0] === "auth-user-changed"
    );
    expect(authChangedRegistrations.length).toBeGreaterThanOrEqual(1);
  });

  it("re-renders with the new avatar when auth-user-changed is dispatched", () => {
    // Initial render: no avatar (fallback path)
    mockUserHolder.user = {
      id: "1",
      name: "Hathuc",
      email: "hathuc@example.com",
      role: "admin",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    render(<TopNav />);

    const triggerButton = screen.getByRole("button", { name: /hathuc/i });
    const initialImg = triggerButton.querySelector(
      "img"
    ) as HTMLImageElement | null;
    expect(initialImg).not.toBeNull();
    expect(initialImg!.src).toContain("ui-avatars.com");

    // Mutate the holder to a new value containing an avatar, then fire the
    // event. TopNav should re-read getStoredUser() and render the data URL.
    act(() => {
      mockUserHolder.user = {
        id: "1",
        name: "Hathuc",
        email: "hathuc@example.com",
        role: "admin",
        avatar: "data:image/png;base64,UPDATED",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      };
      window.dispatchEvent(new CustomEvent("auth-user-changed"));
    });

    const updatedTrigger = screen.getByRole("button", { name: /hathuc/i });
    const updatedImg = updatedTrigger.querySelector(
      "img"
    ) as HTMLImageElement | null;
    expect(updatedImg).not.toBeNull();
    expect(updatedImg!.src).toContain("data:image/png;base64,UPDATED");
  });

  it("removes the auth-user-changed listener on unmount", () => {
    mockUserHolder.user = {
      id: "1",
      name: "Hathuc",
      email: "hathuc@example.com",
      role: "admin",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<TopNav />);
    unmount();

    const authChangedRemovals = removeSpy.mock.calls.filter(
      (call) => call[0] === "auth-user-changed"
    );
    expect(authChangedRemovals.length).toBeGreaterThanOrEqual(1);
  });
});
