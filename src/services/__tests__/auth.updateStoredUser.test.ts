/**
 * Tests for `updateStoredUser` helper and the related `auth-user-changed`
 * CustomEvent contract.
 *
 * SPEC: openspec/changes/manage-account-page/specs/auth-user-update/spec.md
 *
 * Behavior under test:
 *   - Locate existing user record (localStorage first, then sessionStorage)
 *   - Merge a partial patch into the existing record
 *   - Write the merged record back to the SAME storage location
 *   - Return true on success, false on failure (no record / write error)
 *   - Dispatch `window` `CustomEvent("auth-user-changed")` only on success
 *   - `storeUser` (login flow) MUST NOT dispatch the event
 *
 * The helper does not exist yet — these tests are expected to fail at
 * the import boundary until task 1.2 is implemented.
 */

const USER_STORAGE_KEY = "auth_user";

type StoredUser = {
  id: string | number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

function makeUser(overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id: "1",
    name: "Hathuc",
    email: "hathuc@example.com",
    role: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("updateStoredUser", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe("merge into localStorage record", () => {
    it("writes merged record to localStorage, leaves sessionStorage untouched, and returns true", async () => {
      const { updateStoredUser } = await import("../auth");

      const existing = makeUser();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existing));

      const result = updateStoredUser({ name: "New Name" });

      expect(result).toBe(true);

      const localRaw = localStorage.getItem(USER_STORAGE_KEY);
      expect(localRaw).not.toBeNull();
      const merged = JSON.parse(localRaw!);
      expect(merged).toMatchObject({
        ...existing,
        name: "New Name",
      });
      expect(sessionStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    });
  });

  describe("merge into sessionStorage record", () => {
    it("writes merged record to sessionStorage, leaves localStorage untouched, and returns true", async () => {
      const { updateStoredUser } = await import("../auth");

      const existing = makeUser({ phone: undefined });
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existing));

      const result = updateStoredUser({ phone: "555" });

      expect(result).toBe(true);

      const sessionRaw = sessionStorage.getItem(USER_STORAGE_KEY);
      expect(sessionRaw).not.toBeNull();
      const merged = JSON.parse(sessionRaw!);
      expect(merged).toMatchObject({
        ...existing,
        phone: "555",
      });
      expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    });
  });

  describe("patch preserves untouched fields", () => {
    it("merges avatar into the record without losing name/email/role/createdAt/updatedAt", async () => {
      const { updateStoredUser } = await import("../auth");

      const existing = makeUser();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existing));

      const result = updateStoredUser({
        avatar: "data:image/png;base64,iVBORw0KGgoAAAA",
      });

      expect(result).toBe(true);

      const merged = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
      expect(merged.name).toBe(existing.name);
      expect(merged.email).toBe(existing.email);
      expect(merged.role).toBe(existing.role);
      expect(merged.createdAt).toBe(existing.createdAt);
      expect(merged.updatedAt).toBe(existing.updatedAt);
      expect(merged.avatar).toBe("data:image/png;base64,iVBORw0KGgoAAAA");
    });
  });

  describe("no existing record", () => {
    it("returns false and performs no storage writes when no record exists in either storage", async () => {
      const { updateStoredUser } = await import("../auth");

      const localSetSpy = vi.spyOn(Storage.prototype, "setItem");

      const result = updateStoredUser({ name: "Anything" });

      expect(result).toBe(false);
      expect(localSetSpy).not.toHaveBeenCalled();
      expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
      expect(sessionStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    });
  });

  describe("storage write throws", () => {
    it("returns false, leaves the original record unchanged, and does not dispatch the event", async () => {
      const { updateStoredUser } = await import("../auth");

      const existing = makeUser();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existing));
      const originalRaw = localStorage.getItem(USER_STORAGE_KEY);

      // Force the next write to throw a quota error.
      vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });

      const dispatchSpy = vi.spyOn(window, "dispatchEvent");

      const result = updateStoredUser({ name: "Will Fail" });

      expect(result).toBe(false);
      // The original record must remain (we read with a non-mocked getItem
      // because mockImplementationOnce only affects the first setItem call).
      expect(localStorage.getItem(USER_STORAGE_KEY)).toBe(originalRaw);
      // No auth-user-changed event when the write fails.
      const dispatchedTypes = dispatchSpy.mock.calls
        .map((call) => (call[0] as Event).type)
        .filter((t) => t === "auth-user-changed");
      expect(dispatchedTypes).toHaveLength(0);
    });
  });

  describe("event dispatched on success", () => {
    it("dispatches a CustomEvent of type 'auth-user-changed' on window exactly once", async () => {
      const { updateStoredUser } = await import("../auth");

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(makeUser()));

      const dispatchSpy = vi.spyOn(window, "dispatchEvent");

      const result = updateStoredUser({ name: "Dispatched" });
      expect(result).toBe(true);

      const authEvents = dispatchSpy.mock.calls
        .map((call) => call[0] as Event)
        .filter((evt) => evt.type === "auth-user-changed");

      expect(authEvents).toHaveLength(1);
      expect(authEvents[0]).toBeInstanceOf(CustomEvent);
    });
  });

  describe("event suppressed on failure", () => {
    it("does not dispatch the event when no record exists (returns false)", async () => {
      const { updateStoredUser } = await import("../auth");

      const dispatchSpy = vi.spyOn(window, "dispatchEvent");

      const result = updateStoredUser({ name: "no-record" });

      expect(result).toBe(false);
      const authEvents = dispatchSpy.mock.calls
        .map((call) => (call[0] as Event).type)
        .filter((t) => t === "auth-user-changed");
      expect(authEvents).toHaveLength(0);
    });
  });
});

describe("storeUser (login flow) does NOT dispatch auth-user-changed", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not dispatch the auth-user-changed event when a user is stored at login", async () => {
    const { storeUser } = await import("../auth");

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    storeUser(
      { name: "Login User", email: "login@example.com", role: "admin" },
      "local"
    );

    const authEvents = dispatchSpy.mock.calls
      .map((call) => (call[0] as Event).type)
      .filter((t) => t === "auth-user-changed");
    expect(authEvents).toHaveLength(0);
  });
});
