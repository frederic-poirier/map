import { createEffect, onMount, onCleanup, Show, For } from "solid-js";
import { useSheetLayout } from "~/context/SheetLayoutContext";

/**
 * BottomSheet - SolidJS wrapper for pure-web-bottom-sheet web component
 *
 * Uses CSS scroll snap for native-like smooth movement.
 * The web component handles all scroll-based positioning internally.
 *
 * @param {Object} props
 * @param {JSX.Element} props.header - Header content (sticky at top)
 * @param {JSX.Element} props.sticky - Sticky content below header
 * @param {JSX.Element} props.footer - Footer content (sticky at bottom)
 * @param {JSX.Element} props.children - Main scrollable content
 * @param {Array<number>} props.snapPoints - Snap points in vh, e.g. [15, 40, 90]
 * @param {number} props.initialSnap - Index of initial snap point (1-based, default: 1)
 */
function BottomSheet(props) {
  let sheetRef;
  const sheetLayout = useSheetLayout();

  // Parse snap points - ensure they're sorted smallest to largest
  const snapPoints = () => {
    const points = props.snapPoints ?? [15, 40, 90];
    return points.filter((p) => typeof p === "number").sort((a, b) => a - b);
  };

  // Initial snap index (1-based)
  const initialSnapIndex = () => props.initialSnap ?? 1;

  onMount(() => {
    if (!sheetRef) return;

    // Register sheet ref with context
    sheetLayout?.setSheetRef?.(sheetRef);

    // Handle snap position changes from the web component
    const handleSnapChange = (event) => {
      const position = event.detail?.snapPosition;
      if (position === undefined) return;

      // The web component emits position as string index
      // Position corresponds to snap point index (0 = first/smallest, 1 = second, etc.)
      // Special: when sheet is at bottom (closed), position may be the count of snap points
      const points = snapPoints();
      const posNum = parseInt(position);

      // Determine if sheet is open (not at the collapsed/bottom position)
      const isOpen = posNum < points.length;
      sheetLayout?.setIsSheetOpen?.(isOpen);

      // Map to 1-based snap index for context (0 = closed, 1+ = snap points)
      const snapIndex = isOpen ? posNum + 1 : 0;
      sheetLayout?.setSavedSnapIndex?.(snapIndex);
    };

    sheetRef.addEventListener("snap-position-change", handleSnapChange);

    onCleanup(() => {
      sheetRef.removeEventListener("snap-position-change", handleSnapChange);
      sheetLayout?.setSheetRef?.(null);
    });
  });

  // Programmatic snap control - expose to context
  createEffect(() => {
    if (sheetRef && sheetLayout) {
      sheetLayout.setSnapToHandler?.((index) => {
        if (!sheetRef) return;

        const points = snapPoints();

        if (index === 0) {
          // Snap to closed position - scroll to bottom (where sheet is hidden)
          sheetRef.scrollTo({ top: sheetRef.scrollHeight, behavior: "smooth" });
        } else if (index <= points.length) {
          // Find the snap point element and scroll to it
          const snapElements = sheetRef.querySelectorAll('[slot="snap"]');
          const targetElement = snapElements[index - 1];
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      });
    }
  });

  return (
    <bottom-sheet
      ref={sheetRef}
      nested-scroll
      nested-scroll-optimization
      class="sheet-container"
    >
      {/* 
        Snap points as slotted elements
        --snap defines distance from top of viewport where this snap occurs
        Higher values = more sheet visible
        The 'initial' class marks which snap point to start at
      */}
      <For each={snapPoints()}>
        {(point, index) => (
          <div
            slot="snap"
            style={{ "--snap": `${point}vh` }}
            classList={{ initial: index() === initialSnapIndex() - 1 }}
          />
        )}
      </For>

      {/* Header slot */}
      <Show when={props.header || props.sticky}>
        <div slot="header" class="pt-1">
          {props.header}
          {props.sticky}
        </div>
      </Show>

      {/* Main content - no animation wrapper needed, web component handles it */}
      <div class="sheet-main-content">{props.children}</div>

      {/* Footer slot */}
      <Show when={props.footer}>
        <div
          slot="footer"
          class="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          {props.footer}
        </div>
      </Show>
    </bottom-sheet>
  );
}

// Sub-components for API compatibility
function Header(props) {
  return (
    <div class={`px-4 pb-2 ${props.class || ""}`} style={props.style}>
      {props.children}
    </div>
  );
}

function Sticky(props) {
  return (
    <div class={`px-4 pb-3 ${props.class || ""}`} style={props.style}>
      {props.children}
    </div>
  );
}

function Content(props) {
  return (
    <div
      class={`px-4 pb-[max(24px,env(safe-area-inset-bottom))] ${props.class || ""}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

function Footer(props) {
  return (
    <div class={`${props.class || ""}`} style={props.style}>
      {props.children}
    </div>
  );
}

// Attach compound components
BottomSheet.Header = Header;
BottomSheet.Sticky = Sticky;
BottomSheet.Content = Content;
BottomSheet.Footer = Footer;

export { BottomSheet };
