import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import EditProduct from "../index";
import type { ProductStock as ProductStockType } from "../../../types/productStock";

/**
 * Tests for the EditProduct page (src/pages/EditProduct/index.tsx).
 *
 * SPEC: Behavior derived from
 *   openspec/changes/implement-product-stock-edit-delete/specs/product-stock-edit/spec.md
 *
 *   Coverage:
 *   - Form pre-populates from a matching ProductStock entry
 *   - Renders not-found state when :id has no match
 *   - Drag-drop sets the image preview (data URL)
 *   - Add color / Remove color buttons mutate the colors list
 *   - Save with valid form calls updateProduct, shows updateSuccess toast,
 *     navigates to /product-stock
 *   - Save with empty name is blocked (no updateProduct call)
 *   - Cancel navigates without calling updateProduct
 *
 *   The current EditProduct file is the placeholder shipped with the route.
 *   The full rewrite per tasks.md §6 is the TDD target. Tests are expected
 *   to fail until then.
 *
 *   react-router-dom and useProductStock are mocked so the page can be
 *   tested in isolation.
 */

// --- Mocks ----------------------------------------------------------------

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: "1" }));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

const mockUpdateProduct = vi.fn();
const mockDeleteProduct = vi.fn();
const mockUseProductStockReturn = {
  products: [] as ProductStockType[],
  isLoading: false,
  error: null as string | null,
  deleteProduct: mockDeleteProduct,
  updateProduct: mockUpdateProduct,
  refetch: vi.fn(),
  isDeletingProduct: false,
  isUpdatingProduct: false,
};

vi.mock("../../../hooks/useProductStock", () => ({
  useProductStock: () => mockUseProductStockReturn,
}));

// --- Fixtures -------------------------------------------------------------

const product: ProductStockType = {
  id: "1",
  image: "https://example.com/img-1.jpg",
  name: "Galaxy Watch Active 2",
  category: "Digital Product",
  price: 999,
  amount: 10,
  availableColors: [
    { name: "Black", hex: "#000000" },
    { name: "Blue", hex: "#4880ff" },
  ],
};

// --- Helpers --------------------------------------------------------------

// jsdom doesn't ship a usable DataTransfer, so we hand-roll a minimal stub
// that satisfies the drop handler's `event.dataTransfer.files` access.
function createDataTransfer(files: File[]): DataTransfer {
  return {
    files: files as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [],
    dropEffect: "none",
    effectAllowed: "all",
    clearData: vi.fn(),
    getData: vi.fn(),
    setData: vi.fn(),
    setDragImage: vi.fn(),
  } as unknown as DataTransfer;
}

// --- Tests ----------------------------------------------------------------

describe("EditProduct page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUpdateProduct.mockReset();
    mockDeleteProduct.mockReset();
    mockUseParams.mockReturnValue({ id: "1" });
    mockUseProductStockReturn.products = [product];
    mockUseProductStockReturn.isLoading = false;
    mockUseProductStockReturn.error = null;
  });

  describe("loaded happy path", () => {
    it("renders the form pre-populated with the matched product's values", () => {
      render(<EditProduct />);

      // SPEC: spec.md "EditProduct page renders ProductStock edit form" —
      // every form input is associated with a <label>, so getByLabelText
      // (which matches by translation key under the global i18n mock) is
      // the right query.
      expect(screen.getByLabelText("productName")).toHaveValue(
        "Galaxy Watch Active 2"
      );
      expect(screen.getByLabelText("category")).toHaveValue("Digital Product");
      expect(screen.getByLabelText("price")).toHaveValue(999);
      expect(screen.getByLabelText("amount")).toHaveValue(10);
    });

    it("renders the editProductStock heading", () => {
      render(<EditProduct />);

      expect(
        screen.getByRole("heading", { name: "editProductStock" })
      ).toBeInTheDocument();
    });
  });

  describe("not-found state", () => {
    it("renders the not-found message and no form when :id does not match any product", () => {
      mockUseParams.mockReturnValue({ id: "9999" });

      render(<EditProduct />);

      expect(screen.getByText("notFound")).toBeInTheDocument();
      expect(screen.queryByLabelText("productName")).not.toBeInTheDocument();
    });
  });

  describe("drag-drop image upload", () => {
    it("updates the image preview when an image file is dropped on the drop zone", async () => {
      render(<EditProduct />);

      // SPEC: spec.md "EditProduct supports drag-drop image upload" — the
      // drop zone has a programmatic name. We assume the drop zone exposes
      // `dropImageHere` as visible text or via aria-label.
      const dropZone = screen.getByText("dropImageHere").closest("div");
      expect(dropZone).not.toBeNull();

      const file = new File(["fake-bytes"], "new-image.png", {
        type: "image/png",
      });

      // Simulate dragover then drop with a synthesized DataTransfer.
      fireEvent.dragOver(dropZone!, { dataTransfer: createDataTransfer([]) });
      fireEvent.drop(dropZone!, {
        dataTransfer: createDataTransfer([file]),
      });

      // FileReader.readAsDataURL is async; wait for the preview to update.
      // SPEC: assumed the preview <img> exposes its filename or alt text via
      // the productName label, OR is the only image with a data: URL src.
      await waitFor(() => {
        const images = document.querySelectorAll("img");
        const preview = Array.from(images).find((img) =>
          img.getAttribute("src")?.startsWith("data:")
        );
        expect(preview).toBeDefined();
      });
    });
  });

  describe("colors editor", () => {
    it("appends a new empty color row when Add color is clicked", () => {
      render(<EditProduct />);

      // Initial state: 2 color rows (matching the fixture).
      const initialColorNameInputs =
        screen.getAllByLabelText(/colorName/i);
      expect(initialColorNameInputs).toHaveLength(2);

      fireEvent.click(screen.getByRole("button", { name: "addColor" }));

      const colorNameInputs = screen.getAllByLabelText(/colorName/i);
      expect(colorNameInputs).toHaveLength(3);
      // The newly-added row's name input is empty.
      expect(colorNameInputs[2]).toHaveValue("");
    });

    it("removes a color row when its remove button is clicked", () => {
      render(<EditProduct />);

      // SPEC: spec.md "User removes a color row" — every row has a remove
      // control. The accessible name uses the products namespace key
      // `removeColor` (mock returns the key verbatim). With two rows we
      // expect two remove buttons.
      const removeButtons = screen.getAllByRole("button", {
        name: /removeColor/i,
      });
      expect(removeButtons).toHaveLength(2);

      fireEvent.click(removeButtons[0]);

      const remainingNameInputs =
        screen.getAllByLabelText(/colorName/i);
      expect(remainingNameInputs).toHaveLength(1);
      // The first row was removed, so the surviving row holds the second
      // fixture color's name.
      expect(remainingNameInputs[0]).toHaveValue("Blue");
    });
  });

  describe("save flow", () => {
    it("calls updateProduct with the form state, shows updateSuccess toast, and navigates to /product-stock on success", async () => {
      mockUpdateProduct.mockResolvedValueOnce({ ...product, name: "New" });

      render(<EditProduct />);

      fireEvent.change(screen.getByLabelText("productName"), {
        target: { value: "New" },
      });

      fireEvent.click(screen.getByRole("button", { name: "saveChanges" }));

      await waitFor(() => {
        expect(mockUpdateProduct).toHaveBeenCalledTimes(1);
      });

      // updateProduct is called with the row id and the merged form state.
      const [calledId, calledPatch] = mockUpdateProduct.mock.calls[0];
      expect(calledId).toBe("1");
      expect(calledPatch).toMatchObject({ name: "New" });

      await waitFor(() => {
        expect(screen.getByText("updateSuccess")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/product-stock");
      });
    });

    it("blocks submission and surfaces an inline message when name is empty", () => {
      render(<EditProduct />);

      const nameInput = screen.getByLabelText("productName");
      fireEvent.change(nameInput, { target: { value: "" } });

      fireEvent.click(screen.getByRole("button", { name: "saveChanges" }));

      // SPEC: spec.md scenario "Name is empty" — submission is blocked.
      expect(mockUpdateProduct).not.toHaveBeenCalled();
      // SPEC: assumed the field carries aria-invalid="true" and an inline
      // message linked via aria-describedby. We assert on aria-invalid as
      // the most stable, lightest contract — exact copy of the message is
      // up to the implementation.
      expect(nameInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("cancel flow", () => {
    it("navigates to /product-stock without calling updateProduct", () => {
      render(<EditProduct />);

      // Even after edits, Cancel must NOT save.
      fireEvent.change(screen.getByLabelText("productName"), {
        target: { value: "Edited but discarded" },
      });

      // SPEC: tasks.md §6.9 — Cancel button label uses `discardChanges`
      // (or it could fall back to a generic `cancel` key). We assert
      // against `discardChanges` first since that is the documented
      // products-namespace key in design.md D8.
      const cancelButton = screen.queryByRole("button", {
        name: "discardChanges",
      });
      expect(cancelButton).not.toBeNull();

      fireEvent.click(cancelButton!);

      expect(mockUpdateProduct).not.toHaveBeenCalled();
      // SPEC: tasks.md §6.9 allows either navigate(-1) or navigate("/product-stock");
      // we assert the documented destination per spec.md "EditProduct cancel
      // discards changes": navigates back to /product-stock.
      expect(mockNavigate).toHaveBeenCalledWith("/product-stock");
    });
  });

  describe("not-found back button", () => {
    it("provides a control to navigate back to /product-stock from the not-found state", () => {
      mockUseParams.mockReturnValue({ id: "9999" });

      render(<EditProduct />);

      // The not-found state's back control. We use a flexible matcher so
      // either a button OR a link variant resolves.
      const backControls = within(document.body).queryAllByRole("button");
      const backControl = backControls.find((node) =>
        /back|productStock/i.test(node.textContent ?? "")
      );

      // At minimum the page must offer some way back.
      expect(backControl).toBeDefined();
    });
  });
});
