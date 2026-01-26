import { createEffect, onMount, For, mergeProps, createSignal } from 'solid-js';

export default function BottomSheet(props) {
  const merged = mergeProps({
    snapPoints: ['10%', '50%', '92%'],
    index: 1,
    nestedScroll: true,
    header: null,
    footer: null,
    onIndexChange: () => {},
  }, props);

  let containerRef;
  let isReady = false;
  let isProgrammaticScroll = false;
  const snapRefs = [];
  
  const [initialIndex, setInitialIndex] = createSignal(merged.index);

  onMount(() => {
    if (!customElements.get('bottom-sheet')) {
      import('pure-web-bottom-sheet').then(({ BottomSheet }) => {
        customElements.define('bottom-sheet', BottomSheet);
        setTimeout(() => {
          isReady = true;
        }, 150);
      });
    } else {
      setTimeout(() => {
        isReady = true;
      }, 150);
    }
  });

  createEffect(() => {
    const newIndex = merged.index;
    if (newIndex !== undefined && isReady && containerRef) {
      snapToIndex(newIndex);
    }
  });

  const snapToIndex = (idx) => {
    if (!containerRef || idx < 0 || idx >= merged.snapPoints.length) return;
    if (!snapRefs[idx]) return;
    
    isProgrammaticScroll = true;
    setInitialIndex(idx);
    
    const target = snapRefs[idx];
    
    // Get bounding rect relative to container
    const containerRect = containerRef.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    // Calculate the scroll position needed to bring target to top of container
    const targetScroll = containerRef.scrollTop + (targetRect.top - containerRect.top);
    
    console.log('snapToIndex', {
      idx,
      snapPoint: merged.snapPoints[idx],
      targetScroll,
      currentScroll: containerRef.scrollTop,
      targetRect,
      containerRect
    });
    
    // Use smooth scroll
    containerRef.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      isProgrammaticScroll = false;
    }, 500);
  };

  const handleSnapChange = (e) => {
    if (e.detail && merged.onIndexChange && !isProgrammaticScroll) {
      const libPosition = parseInt(e.detail.snapPosition);
      const ourIndex = merged.snapPoints.length - 1 - libPosition;
      
      setInitialIndex(ourIndex);
      merged.onIndexChange(ourIndex);
    }
  };

  return (
    <bottom-sheet
      ref={containerRef}
      nested-scroll={merged.nestedScroll}
      on:snap-position-change={handleSnapChange}
      style={props.style || ''}
    >
      <For each={merged.snapPoints}>
        {(point, i) => (
          <div
            slot="snap"
            ref={(el) => (snapRefs[i()] = el)}
            style={`--snap: ${point}`}
            classList={{ initial: i() === initialIndex() }}
          />
        )}
      </For>

      {merged.header && <div slot="header">{merged.header}</div>}
      
      <div class="h-full overflow-y-auto">
        {merged.children}
      </div>

      {merged.footer && <div slot="footer">{merged.footer}</div>}
    </bottom-sheet>
  );
}
