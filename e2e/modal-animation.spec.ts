import { test, expect, type Page } from "@playwright/test";

/**
 * Browser-only verification for the change `modal-show-hide-animation`.
 *
 * These cover exactly the five things jsdom CANNOT: real CSS animation timing,
 * `prefers-reduced-motion` (a media query), theme parity, layout under
 * `transform: scale()`, and page-width stability during the exit. Everything
 * else about the feature is already covered by the 55 unit tests — this file
 * deliberately does not duplicate them.
 *
 * Maps to tasks 6.4-6.8 in openspec/changes/modal-show-hide-animation/tasks.md.
 *
 * NOTE ON SELECTORS: Vite hashes CSS-module class names in dev (`_modalOverlay_1a2b3`),
 * so everything below matches on a `[class*="..."]` substring rather than an
 * exact class. `modalOverlayExit` contains `modalOverlay`, so specificity comes
 * from asserting against the full className string, not from the selector.
 */

const EXIT_MS = 150;
const WATCHDOG_MS = 400;

type Trace = {
  sawExitClass: boolean;
  sawEnterClassAfterReopen: boolean;
  attachedAtMs: number[];
  detachedAtMs: number | null;
  widths: number[];
  headings: string[];
  overflowWhileAttached: string[];
  overflowAfterDetach: string | null;
};

/** Seed auth (withAuth only checks for a non-empty auth_token) and the theme. */
async function boot(page: Page, theme: "light" | "dark" | "forest") {
  await page.addInitScript((t) => {
    localStorage.setItem("auth_token", "e2e-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ name: "E2E", email: "e2e@test.dev", role: "Admin" })
    );
    localStorage.setItem("theme", t);
  }, theme);
}

async function openAddEventModal(page: Page) {
  await page.getByRole("button", { name: "+ Add New Event" }).click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
}

/**
 * Creates an all-day event on today via the UI, then opens it in EDIT mode.
 *
 * Deliberately does not rely on the seeded mock events: those sit in a fixed
 * month, so `[class*="eventBar"]` is empty whenever the calendar opens on a
 * different one. A freshly created event has no explicit start date, so
 * handleSubmit falls back to today and it always lands in the visible month.
 */
async function openEditModalForNewEvent(page: Page, title: string) {
  await openAddEventModal(page);
  await page.locator("#event-title").fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator('[role="dialog"]')).toBeHidden();

  await page.locator('[class*="eventBar"]').filter({ hasText: title }).first().click();
  await page.getByRole("button", { name: "Edit Event" }).click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
}

/**
 * Closes the modal from inside the page and samples every animation frame until
 * the node detaches. Sampling in-page (rather than round-tripping over the wire)
 * is the only way to observe a 150ms animation reliably.
 */
async function closeAndTrace(
  page: Page,
  overlaySel: string,
  how: "escape" | "overlay" | "cancel" | "save" | "reopen-mid-exit"
): Promise<Trace> {
  return page.evaluate(
    async ({ overlaySel, how, reopenAt }) => {
      const overlay = document.querySelector(overlaySel) as HTMLElement;
      const trace = {
        sawExitClass: false,
        sawEnterClassAfterReopen: false,
        attachedAtMs: [] as number[],
        detachedAtMs: null as number | null,
        widths: [] as number[],
        headings: [] as string[],
        overflowWhileAttached: [] as string[],
        overflowAfterDetach: null as string | null,
      };

      const heading = () =>
        (overlay.querySelector("h2")?.textContent ?? "").trim();

      const fire = () => {
        if (how === "escape") {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
          );
        } else if (how === "overlay") {
          overlay.click();
        } else {
          const label = how === "save" ? "Save" : "Cancel";
          const btn = Array.from(overlay.querySelectorAll("button")).find(
            (b) => b.textContent?.trim() === label
          );
          btn?.click();
        }
      };

      const t0 = performance.now();
      fire();

      return await new Promise<typeof trace>((resolve) => {
        let reopened = false;
        const tick = () => {
          const now = performance.now() - t0;
          const attached = document.contains(overlay);
          trace.widths.push(document.documentElement.clientWidth);

          if (attached) {
            trace.attachedAtMs.push(Math.round(now));
            const ov = document.body.style.overflow;
            if (!trace.overflowWhileAttached.includes(ov)) {
              trace.overflowWhileAttached.push(ov);
            }
            const cls = overlay.className;
            if (cls.includes("modalOverlayExit") || cls.includes("confirmOverlayExit")) {
              trace.sawExitClass = true;
            }
            const h = heading();
            if (h && !trace.headings.includes(h)) trace.headings.push(h);

            if (how === "reopen-mid-exit" && !reopened && now >= reopenAt) {
              reopened = true;
              const addBtn = Array.from(document.querySelectorAll("button")).find(
                (b) => b.textContent?.trim() === "+ Add New Event"
              );
              addBtn?.click();
            }
            if (
              reopened &&
              (overlay.className.includes("modalOverlayEnter") ||
                overlay.className.includes("confirmOverlayEnter"))
            ) {
              trace.sawEnterClassAfterReopen = true;
            }
          } else if (trace.detachedAtMs === null) {
            trace.detachedAtMs = Math.round(now);
            trace.overflowAfterDetach = document.body.style.overflow;
          }

          const done =
            (trace.detachedAtMs !== null && how !== "reopen-mid-exit") ||
            now > 900;
          if (done) return resolve(trace);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { overlaySel, how, reopenAt: 50 }
  );
}

// ── 6.4 + 6.5b: every close path, in all three themes ─────────────────
for (const theme of ["light", "dark", "forest"] as const) {
  test(`[6.4] AddEventModal animates in and out in the ${theme} theme`, async ({
    page,
  }) => {
    await boot(page, theme);
    await page.goto("/calendar");
    await openAddEventModal(page);

    const overlay = page.locator('[class*="modalOverlay"]');
    const card = page.locator('[class*="modalCard"]');

    // Enter classes present, and the theme really is applied.
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(overlay).toHaveClass(/modalOverlayEnter/);
    await expect(card).toHaveClass(/modalCardEnter/);
    await page.screenshot({
      path: `e2e/__screenshots__/addevent-${theme}.png`,
    });

    for (const how of ["escape", "overlay", "cancel"] as const) {
      if (how !== "escape") await openAddEventModal(page);
      const trace = await closeAndTrace(page, '[class*="modalOverlay"]', how);

      // The node survived long enough to animate, carried the exit class, and
      // then went away on its own.
      expect(trace.sawExitClass, `${how}: exit class applied`).toBe(true);
      expect(trace.detachedAtMs, `${how}: detached`).not.toBeNull();
      expect(
        trace.detachedAtMs!,
        `${how}: detach should track the 150ms CSS exit, not the ${WATCHDOG_MS}ms watchdog`
      ).toBeLessThan(WATCHDOG_MS - 50);
      expect(trace.detachedAtMs!, `${how}: not an instant unmount`).toBeGreaterThan(
        EXIT_MS * 0.5
      );
    }
  });
}

test("[6.4] nested delete-confirm and ProductStock confirm both animate", async ({
  page,
}) => {
  await boot(page, "light");
  await page.goto("/calendar");

  await openEditModalForNewEvent(page, "Nested confirm probe");

  // Nested confirm stacks above the edit modal and animates in.
  await page.getByRole("button", { name: "Delete" }).first().click();
  const confirmOverlay = page.locator('[class*="confirmOverlay"]');
  await expect(confirmOverlay).toHaveClass(/confirmOverlayEnter/);
  await expect(page.locator('[role="alertdialog"]')).toBeVisible();

  const confirmTrace = await closeAndTrace(
    page,
    '[class*="confirmOverlay"]',
    "cancel"
  );
  expect(confirmTrace.sawExitClass).toBe(true);
  expect(confirmTrace.detachedAtMs).not.toBeNull();

  // Same shared component on the ProductStock delete flow.
  await page.goto("/product-stock");
  await page.getByRole("button", { name: /^delete /i }).first().click();
  await expect(page.locator('[role="alertdialog"]')).toBeVisible();
  await expect(page.locator('[class*="confirmOverlay"]')).toHaveClass(
    /confirmOverlayEnter/
  );
  const stockTrace = await closeAndTrace(
    page,
    '[class*="confirmOverlay"]',
    "cancel"
  );
  expect(stockTrace.sawExitClass).toBe(true);
  expect(stockTrace.detachedAtMs).not.toBeNull();
});

// ── 6.5: no page-width shift, and no title flip ───────────────────────
test("[6.5] page width stays constant through the exit, and the edit title does not flip", async ({
  page,
}) => {
  await boot(page, "light");
  await page.goto("/calendar");

  await openEditModalForNewEvent(page, "Title flip probe");
  await expect(page.locator('[role="dialog"] h2')).toHaveText("Edit Event");

  const trace = await closeAndTrace(page, '[class*="modalOverlay"]', "cancel");

  // The scroll-lock release must not reappear a scrollbar mid-animation.
  //
  // CAVEAT: macOS defaults to OVERLAY scrollbars, so clientWidth would not move
  // even WITH the bug — this assertion alone is close to vacuous on this
  // platform. The mechanism itself is sampled below, which is
  // scrollbar-style-independent and is the assertion that actually has teeth.
  expect(
    [...new Set(trace.widths)],
    "documentElement.clientWidth sampled every frame during the exit"
  ).toHaveLength(1);

  // The real check: body overflow stays locked for EVERY frame the node is
  // attached, and is released only once it has gone. Releasing at exit start is
  // what lets the scrollbar return and shove the animating card sideways.
  expect(
    trace.overflowWhileAttached,
    "body overflow across every frame of the exit"
  ).toEqual(["hidden"]);
  expect(trace.overflowAfterDetach, "released once detached").toBe("");

  // The parent clears editingEvent in the same update as isModalOpen, so
  // without the retained snapshot this flips to "Add New Event" mid-fade.
  expect(trace.headings).toEqual(["Edit Event"]);
});

// ── 6.6: reopening mid-exit ───────────────────────────────────────────
test("[6.6] reopening mid-exit replays the enter animation and the watchdog does not unmount it", async ({
  page,
}) => {
  await boot(page, "light");
  await page.goto("/calendar");
  await openAddEventModal(page);

  const trace = await closeAndTrace(
    page,
    '[class*="modalOverlay"]',
    "reopen-mid-exit"
  );

  expect(trace.sawExitClass, "exit began before the reopen").toBe(true);
  expect(trace.sawEnterClassAfterReopen, "enter replayed on reopen").toBe(true);
  // Sampling runs past 900ms — well beyond the 400ms watchdog, which must have
  // been cancelled or it would have torn down a modal the user just reopened.
  expect(trace.detachedAtMs, "must still be mounted").toBeNull();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});

// ── 6.7: prefers-reduced-motion ───────────────────────────────────────
test("[6.7] reduced motion collapses the animation but still unmounts promptly", async ({
  page,
}) => {
  await boot(page, "light");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/calendar");
  await openAddEventModal(page);

  const trace = await closeAndTrace(page, '[class*="modalOverlay"]', "cancel");

  expect(trace.detachedAtMs, "still unmounts").not.toBeNull();
  // The whole point of using `animation-duration: 1ms` instead of
  // `animation: none`: animationend still fires, so the unmount is nowhere near
  // the 400ms watchdog.
  expect(
    trace.detachedAtMs!,
    "reduced motion must resolve via animationend, not the watchdog"
  ).toBeLessThan(100);
});

// ── 6.8: short viewport under transform: scale() ──────────────────────
test("[6.8] short viewport keeps the 90vh bound, a scrollable body, and fixed header/footer", async ({
  page,
}) => {
  await boot(page, "light");
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/calendar");
  await openAddEventModal(page);

  const geom = await page.evaluate(() => {
    const card = document.querySelector('[class*="modalCard"]') as HTMLElement;
    const body = document.querySelector('[class*="modalBody"]') as HTMLElement;
    const header = document.querySelector('[class*="modalHeader"]') as HTMLElement;
    const footer = document.querySelector('[class*="modalFooter"]') as HTMLElement;

    const headerTopBefore = header.getBoundingClientRect().top;
    const footerTopBefore = footer.getBoundingClientRect().top;
    body.scrollTop = body.scrollHeight; // scroll the body to the bottom

    return {
      viewportH: window.innerHeight,
      cardH: card.getBoundingClientRect().height,
      bodyScrollable: body.scrollHeight > body.clientHeight,
      bodyScrolled: body.scrollTop > 0,
      headerMoved:
        Math.abs(header.getBoundingClientRect().top - headerTopBefore) > 0.5,
      footerMoved:
        Math.abs(footer.getBoundingClientRect().top - footerTopBefore) > 0.5,
      cardTransform: getComputedStyle(card).transform,
    };
  });

  // max-height: 90vh must still bind despite the card carrying an animation.
  expect(geom.cardH).toBeLessThanOrEqual(geom.viewportH * 0.9 + 1);
  expect(geom.bodyScrollable, "form is taller than the body region").toBe(true);
  expect(geom.bodyScrolled, "body region actually scrolls").toBe(true);
  expect(geom.headerMoved, "header stays put while the body scrolls").toBe(false);
  expect(geom.footerMoved, "footer stays put while the body scrolls").toBe(false);

  await page.screenshot({ path: "e2e/__screenshots__/short-viewport.png" });
});
