import { createSignal, createEffect, onMount, onCleanup, children } from 'solid-js';
import './Tray.css';

export const TrayPosition = {
  Open: 3,
  Expanded: 4,
  Scrolling: 5,
};

const TRAY_TOP_MARGIN = 24;

export function Tray(props) {
  let wrapperRef;
  let backdropRef;
  let sheetRef;
  
  const [position, setPosition] = createSignal(TrayPosition.Open);
  const [isSliding, setIsSliding] = createSignal(false);
  const [cardTop, setCardTop] = createSignal(0);
  
  const resolvedBackdrop = children(() => props.backdrop);
  const resolvedChildren = children(() => props.children);
  
  // Use prop for open height, default to 120 (just search bar)
  const openHeight = () => props.openHeight || 120;
  
  const getSnapPositions = () => {
    if (!wrapperRef) return { open: 0, expanded: 0 };
    const vh = wrapperRef.clientHeight;
    const spacerHeight = vh - openHeight();
    return {
      open: 0,
      expanded: spacerHeight - TRAY_TOP_MARGIN,
    };
  };
  
  const calculatePosition = () => {
    if (!wrapperRef) return TrayPosition.Open;
    
    const scrollTop = wrapperRef.scrollTop;
    const snaps = getSnapPositions();
    const threshold = snaps.expanded / 2;
    
    if (scrollTop < threshold) {
      return TrayPosition.Open;
    }
    if (scrollTop <= snaps.expanded + 50) {
      return TrayPosition.Expanded;
    }
    return TrayPosition.Scrolling;
  };
  
  const updateCardTop = () => {
    if (!sheetRef || !wrapperRef) return;
    const sheetRect = sheetRef.getBoundingClientRect();
    setCardTop(Math.max(0, sheetRect.top));
  };
  
  const handleScroll = () => {
    updateCardTop();
    
    if (isSliding()) return;
    const newPos = calculatePosition();
    if (newPos !== position()) {
      setPosition(newPos);
    }
  };
  
  const scrollToPosition = (targetPosition, smooth = true) => {
    if (!wrapperRef) return Promise.resolve();
    
    const snaps = getSnapPositions();
    let targetScroll;
    
    switch (targetPosition) {
      case TrayPosition.Open:
        targetScroll = snaps.open;
        break;
      case TrayPosition.Expanded:
        targetScroll = snaps.expanded;
        break;
      default:
        return Promise.resolve();
    }
    
    if (!smooth) {
      wrapperRef.scrollTop = targetScroll;
      setPosition(targetPosition);
      updateCardTop();
      return Promise.resolve();
    }
    
    setIsSliding(true);
    wrapperRef.scrollTo({ top: targetScroll, behavior: 'smooth' });
    
    return new Promise((resolve) => {
      let lastScroll = -1;
      let stableCount = 0;
      
      const check = () => {
        updateCardTop();
        const curr = wrapperRef.scrollTop;
        if (Math.abs(curr - targetScroll) < 2) {
          setIsSliding(false);
          setPosition(targetPosition);
          resolve();
          return;
        }
        if (curr === lastScroll) {
          stableCount++;
          if (stableCount > 8) {
            setIsSliding(false);
            setPosition(calculatePosition());
            resolve();
            return;
          }
        } else {
          stableCount = 0;
        }
        lastScroll = curr;
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  };
  
  const cyclePosition = () => {
    const curr = position();
    if (curr === TrayPosition.Open) scrollToPosition(TrayPosition.Expanded);
    else scrollToPosition(TrayPosition.Open);
  };
  
  const expand = () => scrollToPosition(TrayPosition.Expanded);
  const collapse = () => scrollToPosition(TrayPosition.Open);
  
  onMount(() => {
    if (wrapperRef) {
      wrapperRef.scrollTop = 0;
      setPosition(TrayPosition.Open);
      requestAnimationFrame(updateCardTop);
    }
    
    wrapperRef?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateCardTop);
  });
  
  onCleanup(() => {
    wrapperRef?.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', updateCardTop);
  });
  
  createEffect(() => {
    if (props.ref) {
      props.ref({ 
        scrollToPosition, 
        cyclePosition, 
        expand,
        collapse,
        getPosition: () => position() 
      });
    }
  });
  
  const wrapperStyle = () => ({
    'clip-path': `inset(${cardTop()}px 0 0 0)`,
    '-webkit-clip-path': `inset(${cardTop()}px 0 0 0)`,
  });
  
  const spacerHeight = () => {
    if (typeof window === 'undefined') return `calc(100svh - ${openHeight()}px)`;
    return `calc(100svh - ${openHeight()}px)`;
  };
  
  return (
    <div class="tray-root">
      {/* Backdrop - fixed behind everything, fully interactive */}
      <div ref={backdropRef} class="tray-backdrop">
        {resolvedBackdrop()}
      </div>
      
      {/* Scroll container - clipped to only the card area */}
      <div
        ref={wrapperRef}
        class="tray-wrapper"
        style={wrapperStyle()}
        classList={{
          'sliding': isSliding(),
          [`tray-pos-${position()}`]: true,
        }}
      >
        {/* Spacer - scroll past this to expand the tray */}
        <div 
          class="tray-spacer" 
          style={{ height: spacerHeight() }}
        />
        
        {/* The card area */}
        <div ref={sheetRef} class="tray-sheet">
          {resolvedChildren()}
        </div>
      </div>
    </div>
  );
}

export default Tray;
