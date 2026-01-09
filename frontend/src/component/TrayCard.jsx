import { children, Show, onMount, onCleanup } from 'solid-js';

export function TrayCard(props) {
  let handleRef;
  let headerRef;
  let resizeObserver;
  
  const resolvedHeader = children(() => props.header);
  const resolvedChildren = children(() => props.children);
  const resolvedFooter = children(() => props.footer);
  
  const handleClick = (e) => {
    if (e.target.closest('a, button')) return;
    props.onHandleClick?.();
  };
  
  // Measure and report the open height (handle + header)
  const measureOpenHeight = () => {
    if (!handleRef || !headerRef) return;
    const handleHeight = handleRef.offsetHeight;
    const headerHeight = headerRef.offsetHeight;
    const totalHeight = handleHeight + headerHeight;
    if (totalHeight > 0) {
      props.onMeasure?.(totalHeight);
    }
  };
  
  onMount(() => {
    // Use ResizeObserver to reliably detect when elements are sized
    resizeObserver = new ResizeObserver(() => {
      measureOpenHeight();
    });
    
    if (handleRef) resizeObserver.observe(handleRef);
    if (headerRef) resizeObserver.observe(headerRef);
  });
  
  onCleanup(() => {
    resizeObserver?.disconnect();
  });
  
  return (
    <div class="tray-card">
      {/* Sticky handle */}
      <div ref={handleRef} class="tray-card-handle" onClick={handleClick}>
        <div class="tray-card-handle-bar" />
      </div>
      
      {/* Sticky header - becomes snap target when expanded */}
      <div ref={headerRef} class="tray-card-header">
        {resolvedHeader()}
      </div>
      
      {/* Scrollable content */}
      <div class="tray-card-content">
        {resolvedChildren()}
      </div>
      
      {/* Footer with action buttons */}
      <Show when={props.footer}>
        <div class="tray-card-footer">
          {resolvedFooter()}
        </div>
      </Show>
    </div>
  );
}

export default TrayCard;
