import { createSignal, createEffect, onMount, onCleanup, Show, For } from 'solid-js';
import { useSheetLayout } from '~/context/SheetLayoutContext';

/**
 * BottomSheet - SolidJS wrapper for pure-web-bottom-sheet web component
 * 
 * The web component is registered via registerSheetElements() in index.jsx
 * and handles its own shadow DOM construction.
 * 
 * @param {Object} props
 * @param {JSX.Element} props.header - Header content (sticky at top)
 * @param {JSX.Element} props.sticky - Sticky content below header
 * @param {JSX.Element} props.footer - Footer content (sticky at bottom)
 * @param {JSX.Element} props.children - Main scrollable content
 * @param {Array<number|string>} props.snapPoints - Snap points in vh, e.g. [15, 40, 90]
 * @param {number} props.initialSnap - Index of initial snap point (default: 1)
 */
function BottomSheet(props) {
  let sheetRef;
  const sheetLayout = useSheetLayout();
  
  // Parse snap points - filter to numeric values in vh
  const snapPoints = () => {
    const points = props.snapPoints ?? [15, 40, 90];
    return points.filter(p => typeof p === 'number').sort((a, b) => a - b);
  };

  // Track current snap position from web component
  const [snapPosition, setSnapPosition] = createSignal('1');
  const [isAnimating, setIsAnimating] = createSignal(true);

  onMount(() => {
    if (!sheetRef) return;

    // Register sheet ref with context
    sheetLayout?.setSheetRef?.(sheetRef);

    // Handle snap position changes from the web component
    const handleSnapChange = (event) => {
      const position = event.detail?.snapPosition ?? sheetRef.dataset.sheetSnapPosition;
      setSnapPosition(position);
      
      // Map position to context state
      // Position "0" = fully open, "1" = first custom snap, "2" = closed/dismissed
      const isOpen = position !== '2' && position !== undefined;
      sheetLayout?.setIsSheetOpen?.(isOpen);
      
      // Map to snap index for context compatibility
      const points = snapPoints();
      let snapIndex;
      if (position === '2') {
        snapIndex = 0; // Closed
      } else if (position === '0') {
        snapIndex = points.length; // Fully open
      } else {
        snapIndex = parseInt(position) || 1;
      }
      sheetLayout?.setSavedSnapIndex?.(snapIndex);
    };

    sheetRef.addEventListener('snap-position-change', handleSnapChange);

    // Initial scroll to the desired snap point
    const initialIndex = props.initialSnap ?? (sheetLayout?.savedSnapIndex?.() || 1);
    if (initialIndex > 0) {
      // Use RAF to let the web component initialize
      requestAnimationFrame(() => {
        if (!sheetRef) return;
        
        // The snap points we add are in the light DOM
        // The web component uses scroll position to determine snap
        // We need to scroll to reveal the sheet at the initial snap point
        const points = snapPoints();
        const targetVh = points[initialIndex - 1] || points[0];
        
        // Calculate scroll position: sheet height is 100vh - 24px
        // At scroll=0, sheet is at bottom (closed)
        // At scroll=max, sheet is fully open
        const sheetMaxHeight = window.innerHeight - 24;
        const targetHeight = (targetVh / 100) * window.innerHeight;
        const scrollTarget = sheetMaxHeight - (sheetMaxHeight - targetHeight);
        
        sheetRef.scrollTop = Math.max(0, scrollTarget);
      });
    }

    // Clear animation after it completes
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    onCleanup(() => {
      sheetRef.removeEventListener('snap-position-change', handleSnapChange);
      sheetLayout?.setSheetRef?.(null);
      clearTimeout(animationTimer);
    });
  });

  // Programmatic snap control - expose to context
  createEffect(() => {
    if (sheetRef && sheetLayout) {
      // Override the snapTo function in context to work with this component
      sheetLayout.setSnapToHandler?.((index) => {
        if (!sheetRef) return;
        
        const points = snapPoints();
        if (index === 0) {
          // Snap to closed position (scroll to 0)
          sheetRef.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (index <= points.length) {
          // Calculate target scroll for this snap point
          const targetVh = points[index - 1];
          const sheetMaxHeight = window.innerHeight - 24;
          const targetHeight = (targetVh / 100) * window.innerHeight;
          const scrollTarget = sheetMaxHeight - (sheetMaxHeight - targetHeight);
          
          sheetRef.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
        } else {
          // Fully open
          sheetRef.scrollTo({ top: sheetRef.scrollHeight, behavior: 'smooth' });
        }
      });
    }
  });

  // Animation class based on navigation direction
  const animationClass = () => {
    if (!isAnimating()) return '';
    const direction = sheetLayout?.navigationDirection?.() ?? 'forward';
    return direction === 'back' ? 'animate-slide-in-left' : 'animate-slide-in-right';
  };

  return (
    <bottom-sheet
      ref={sheetRef}
      nested-scroll
      class="sheet-container"
    >
      {/* Snap points as slotted elements - ordered from smallest to largest vh */}
      <For each={snapPoints()}>
        {(point, index) => (
          <div
            slot="snap"
            style={{ '--snap': `${100 - point}vh` }}
            classList={{ 'initial': index() === (props.initialSnap ?? 1) - 1 }}
          />
        )}
      </For>

      {/* Header slot */}
      <Show when={props.header || props.sticky}>
        <div slot="header" class="sheet-header-content">
          {props.header}
          {props.sticky}
        </div>
      </Show>

      {/* Main content with animation */}
      <div class={`sheet-content-wrapper ${animationClass()}`}>
        {props.children}
      </div>

      {/* Footer slot */}
      <Show when={props.footer}>
        <div slot="footer" class="sheet-footer-content">
          {props.footer}
        </div>
      </Show>
    </bottom-sheet>
  );
}

// Sub-components for API compatibility with old Sheet component
function Header(props) {
  return (
    <div class={`px-4 pb-2 ${props.class || ''}`} style={props.style}>
      {props.children}
    </div>
  );
}

function Sticky(props) {
  return (
    <div class={`px-4 pb-3 ${props.class || ''}`} style={props.style}>
      {props.children}
    </div>
  );
}

function Content(props) {
  return (
    <div class={`px-4 pb-[max(24px,env(safe-area-inset-bottom))] ${props.class || ''}`} style={props.style}>
      {props.children}
    </div>
  );
}

function Footer(props) {
  return (
    <div class={`px-4 py-3 ${props.class || ''}`} style={props.style}>
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
