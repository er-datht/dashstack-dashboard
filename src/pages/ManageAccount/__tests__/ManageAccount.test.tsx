/**
 * Tests for the ManageAccount page.
 *
 * SPEC: openspec/changes/manage-account-page/specs/manage-account-page/spec.md
 *
 * The page does not exist yet — these tests are expected to fail at the
 * import boundary until tasks 6.1–6.15 are implemented.
 *
 * Approach:
 *   - Mock `getStoredUser` per-test to drive prefill behavior.
 *   - Mock `updateStoredUser` so we can assert the exact patch shape
 *     and the boolean return values.
 *   - Use fake timers to advance the 800 ms simulated save delay.
 *   - Stub `FileReader` to drive the avatar data-URL flow synchronously.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import type { ChangeEvent } from "react";

// --- Module mocks ---------------------------------------------------------

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: "/manage-account",
    state: null,
    search: "",
    hash: "",
    key: "default",
  }),
}));

const mockGetStoredUser = vi.fn();
const mockUpdateStoredUser = vi.fn();

vi.mock("../../../services/auth", () => ({
  getStoredUser: (...args: unknown[]) => mockGetStoredUser(...args),
  updateStoredUser: (...args: unknown[]) => mockUpdateStoredUser(...args),
}));

// --- FileReader stub ------------------------------------------------------
// jsdom ships a usable FileReader, but the result is async + flaky. We swap
// in a synchronous stub that fires `onload` with a known data URL string so
// the avatar-applied tests don't have to wait on real bytes.

class FakeFileReader {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onload: ((evt: any) => void) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onerror: ((evt: any) => void) | null = null;
  public result: string | ArrayBuffer | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsDataURL(_file: Blob): void {
    this.result = "data:image/png;base64,FAKE";
    this.onload?.({ target: { result: this.result } });
  }
}

const OriginalFileReader = globalThis.FileReader;

beforeEach(() => {
  // Reset all mocks
  mockNavigate.mockClear();
  mockGetStoredUser.mockReset();
  mockUpdateStoredUser.mockReset();
  // Default: stored user has all editable + read-only fields
  mockGetStoredUser.mockReturnValue({
    id: "1",
    name: "Hathuc",
    email: "hathuc@example.com",
    role: "admin",
    phone: "555",
    bio: "hello",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  });
  // Default: save succeeds
  mockUpdateStoredUser.mockReturnValue(true);

  // Use real timers by default — individual tests opt into fake timers.
  vi.useRealTimers();
});

afterEach(() => {
  // Restore the original FileReader if a test swapped it.
  globalThis.FileReader = OriginalFileReader;
});

// --- Helper: lazy-import the page after mocks are set up ------------------
async function importPage() {
  const mod = await import("../index");
  return mod.default;
}

// --- Tests ----------------------------------------------------------------

describe("ManageAccount page", () => {
  describe("prefill from stored user", () => {
    it("renders all editable + read-only fields with prefilled values", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      // Editable: name, phone, bio
      // SPEC: assumed inputs are wired to <label> for the displayName/phone/bio
      // translation keys (manageAccount namespace) — the global i18n mock
      // returns keys verbatim so getByLabelText matches the key string.
      expect(screen.getByLabelText(/displayName/i)).toHaveValue("Hathuc");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("555");
      expect(screen.getByLabelText(/bio/i)).toHaveValue("hello");

      // Read-only: email + role rendered as readOnly inputs (proper form
      // semantics) — query by displayed value, not text content.
      expect(screen.getByDisplayValue(/hathuc@example\.com/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/admin/i)).toBeInTheDocument();
    });

    it("renders empty values when optional phone/bio/avatar are missing", async () => {
      mockGetStoredUser.mockReturnValue({
        id: "2",
        name: "Solo",
        email: "solo@example.com",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      });

      const ManageAccount = await importPage();
      render(<ManageAccount />);

      expect(screen.getByLabelText(/displayName/i)).toHaveValue("Solo");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("");
      expect(screen.getByLabelText(/bio/i)).toHaveValue("");

      // No avatar preview <img> should be rendered with a data URL or any
      // user-uploaded src — only the camera/dropzone empty state.
      const previewImages = Array.from(
        document.querySelectorAll("img")
      ).filter((img) => img.getAttribute("src")?.startsWith("data:"));
      expect(previewImages).toHaveLength(0);
    });
  });

  describe("display name validation", () => {
    it("blocks save and surfaces aria-invalid when display name is empty", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const nameInput = screen.getByLabelText(/displayName/i);
      fireEvent.change(nameInput, { target: { value: "" } });

      // SPEC: Save button label uses the manageAccount namespace key `save`.
      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(mockUpdateStoredUser).not.toHaveBeenCalled();
    });

    it("blocks save when display name exceeds 60 characters", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const nameInput = screen.getByLabelText(/displayName/i);
      // 61 characters
      const overLong = "a".repeat(61);
      fireEvent.change(nameInput, { target: { value: overLong } });

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(mockUpdateStoredUser).not.toHaveBeenCalled();
    });
  });

  describe("bio counter and validation", () => {
    it("renders the count value (e.g. 50) when bio is under the cap", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const bio = screen.getByLabelText(/bio/i);
      fireEvent.change(bio, { target: { value: "x".repeat(50) } });

      // SPEC: assumed counter renders the integer count somewhere visible
      // (e.g. "50 / 200"). Asserting on the raw "50" tolerates any
      // surrounding format.
      expect(screen.getByText(/\b50\b/)).toBeInTheDocument();
      expect(bio).not.toHaveAttribute("aria-invalid", "true");
    });

    it("marks the textarea aria-invalid and blocks save when bio is over 200 chars", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const bio = screen.getByLabelText(/bio/i);
      fireEvent.change(bio, { target: { value: "x".repeat(201) } });

      expect(bio).toHaveAttribute("aria-invalid", "true");

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      expect(mockUpdateStoredUser).not.toHaveBeenCalled();
    });
  });

  describe("phone optional", () => {
    it("allows save when phone is empty (with valid name)", async () => {
      vi.useFakeTimers();
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      // Clear phone, ensure name is non-empty
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: "" },
      });
      // Clear bio too so we don't trip over the seed value
      fireEvent.change(screen.getByLabelText(/bio/i), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText(/displayName/i), {
        target: { value: "Valid Name" },
      });

      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      // Advance the simulated 800 ms delay
      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });

      expect(mockUpdateStoredUser).toHaveBeenCalledTimes(1);
    });
  });

  describe("save patch shape", () => {
    it("calls updateStoredUser with empty optional fields converted to undefined", async () => {
      vi.useFakeTimers();
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      fireEvent.change(screen.getByLabelText(/displayName/i), {
        target: { value: "New Name" },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText(/bio/i), {
        target: { value: "" },
      });

      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });

      // SPEC: tasks.md §6.11 — patch is `{ name, phone: phone || undefined,
      // bio: bio || undefined, avatar: avatarPreview ?? undefined }`. The
      // initial avatar is null (no avatar in the default stored user) so it
      // becomes undefined.
      expect(mockUpdateStoredUser).toHaveBeenCalledTimes(1);
      const [patch] = mockUpdateStoredUser.mock.calls[0];
      expect(patch).toEqual({
        name: "New Name",
        phone: undefined,
        bio: undefined,
        avatar: undefined,
      });
    });
  });

  describe("save success toast", () => {
    it("shows a success toast and re-enables the save button after the 800 ms delay", async () => {
      vi.useFakeTimers();
      mockUpdateStoredUser.mockReturnValue(true);
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      fireEvent.change(screen.getByLabelText(/displayName/i), {
        target: { value: "Valid" },
      });

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });

      // SPEC: assumed success toast key is from manageAccount namespace —
      // common conventions are "saveSuccess" or "savedSuccessfully". We
      // match a permissive pattern.
      const toastNode = screen.queryByText(/saveSuccess|saved/i);
      expect(toastNode).toBeInTheDocument();

      // Save button must be re-enabled.
      const reenabledSave = screen.getByRole("button", { name: /save/i });
      expect(reenabledSave).not.toBeDisabled();
    });
  });

  describe("save error toast", () => {
    it("shows an error toast and re-enables the save button when updateStoredUser returns false", async () => {
      vi.useFakeTimers();
      mockUpdateStoredUser.mockReturnValue(false);
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      fireEvent.change(screen.getByLabelText(/displayName/i), {
        target: { value: "Valid" },
      });

      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(900);
      });

      // SPEC: assumed error toast key matches /saveError|storageFull|error/i
      // from the manageAccount namespace.
      const toastNode = screen.queryByText(
        /saveError|storageFull|saveFailed|error/i
      );
      expect(toastNode).toBeInTheDocument();

      const reenabledSave = screen.getByRole("button", { name: /save/i });
      expect(reenabledSave).not.toBeDisabled();
    });
  });

  describe("member since", () => {
    it("renders a member since line when createdAt is present", async () => {
      mockGetStoredUser.mockReturnValue({
        id: "1",
        name: "Hathuc",
        email: "hathuc@example.com",
        role: "admin",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      });

      const ManageAccount = await importPage();
      render(<ManageAccount />);

      // SPEC: matches the manageAccount.memberSince translation key OR the
      // formatted date itself. We check for the key (i18n mock returns it
      // verbatim). The exact format of the date is locale-aware; we only
      // assert that the key appears on the page.
      expect(screen.getByText(/memberSince/i)).toBeInTheDocument();
    });

    it("does not render a member since line when createdAt is missing", async () => {
      mockGetStoredUser.mockReturnValue({
        id: "1",
        name: "Hathuc",
        email: "hathuc@example.com",
        role: "admin",
        // No createdAt
        updatedAt: "2026-01-01T00:00:00Z",
      });

      const ManageAccount = await importPage();
      render(<ManageAccount />);

      expect(screen.queryByText(/memberSince/i)).not.toBeInTheDocument();
    });
  });

  describe("avatar upload", () => {
    function getHiddenFileInput(): HTMLInputElement {
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement | null;
      if (!input)
        throw new Error("No <input type='file'> found in ManageAccount page");
      return input;
    }

    it("rejects an oversize file (>2 MB) and shows an inline error", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const input = getHiddenFileInput();

      // 3 MB blob with a valid MIME type
      const oversize = new File(
        [new Uint8Array(3 * 1024 * 1024)],
        "big.png",
        { type: "image/png" }
      );

      // jsdom doesn't support assigning to .files via setter, so use
      // Object.defineProperty for this test only.
      Object.defineProperty(input, "files", {
        value: [oversize],
        writable: false,
        configurable: true,
      });
      fireEvent.change(input, {
        target: { files: [oversize] },
      } as unknown as ChangeEvent<HTMLInputElement>);

      // No avatar data URL preview should appear.
      const previewImages = Array.from(
        document.querySelectorAll("img")
      ).filter((img) => img.getAttribute("src")?.startsWith("data:"));
      expect(previewImages).toHaveLength(0);

      // Inline error referencing the file-size limit. SPEC: assumed key is
      // /fileTooLarge|tooLarge|sizeLimit/i in the manageAccount namespace.
      expect(
        screen.getByText(/fileTooLarge|tooLarge|sizeLimit/i)
      ).toBeInTheDocument();
    });

    it("rejects a wrong-MIME file (e.g. application/pdf) and shows an inline error", async () => {
      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const input = getHiddenFileInput();

      const wrongMime = new File(["bytes"], "doc.pdf", {
        type: "application/pdf",
      });

      Object.defineProperty(input, "files", {
        value: [wrongMime],
        writable: false,
        configurable: true,
      });
      fireEvent.change(input, {
        target: { files: [wrongMime] },
      } as unknown as ChangeEvent<HTMLInputElement>);

      const previewImages = Array.from(
        document.querySelectorAll("img")
      ).filter((img) => img.getAttribute("src")?.startsWith("data:"));
      expect(previewImages).toHaveLength(0);

      // SPEC: assumed key is /fileWrongType|wrongType|invalidType/i.
      expect(
        screen.getByText(/fileWrongType|wrongType|invalidType/i)
      ).toBeInTheDocument();
    });

    it("applies a valid PNG file as a data URL preview", async () => {
      // Swap in the synchronous FakeFileReader before the page reads files
      globalThis.FileReader = FakeFileReader as unknown as typeof FileReader;

      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const input = getHiddenFileInput();
      const validPng = new File(["small-bytes"], "avatar.png", {
        type: "image/png",
      });

      Object.defineProperty(input, "files", {
        value: [validPng],
        writable: false,
        configurable: true,
      });
      fireEvent.change(input, {
        target: { files: [validPng] },
      } as unknown as ChangeEvent<HTMLInputElement>);

      // The synchronous FakeFileReader fires onload immediately with
      // `data:image/png;base64,FAKE`. The page should render an <img> with
      // that data URL.
      const previewImages = Array.from(
        document.querySelectorAll("img")
      ).filter((img) => img.getAttribute("src")?.startsWith("data:"));
      expect(previewImages.length).toBeGreaterThan(0);
      expect(previewImages[0].getAttribute("src")).toBe(
        "data:image/png;base64,FAKE"
      );
    });

    it("clears the preview when Remove Photo is clicked", async () => {
      // Use the FakeFileReader so we land in the "with avatar" state quickly.
      globalThis.FileReader = FakeFileReader as unknown as typeof FileReader;

      const ManageAccount = await importPage();
      render(<ManageAccount />);

      const input = getHiddenFileInput();
      const validPng = new File(["x"], "avatar.png", { type: "image/png" });
      Object.defineProperty(input, "files", {
        value: [validPng],
        writable: false,
        configurable: true,
      });
      fireEvent.change(input, {
        target: { files: [validPng] },
      } as unknown as ChangeEvent<HTMLInputElement>);

      // Sanity: preview is showing
      const previewImages = Array.from(
        document.querySelectorAll("img")
      ).filter((img) => img.getAttribute("src")?.startsWith("data:"));
      expect(previewImages.length).toBeGreaterThan(0);

      // SPEC: Remove Photo control. Convention is the `removePhoto` key in
      // the manageAccount namespace; we match permissively.
      const removeButton = screen.getByRole("button", {
        name: /removePhoto|remove/i,
      });
      fireEvent.click(removeButton);

      const stillPreview = Array.from(
        document.querySelectorAll("img")
      ).filter((img) => img.getAttribute("src")?.startsWith("data:"));
      expect(stillPreview).toHaveLength(0);
    });
  });
});
