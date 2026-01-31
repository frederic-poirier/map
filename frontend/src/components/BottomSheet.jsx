import { onMount, For } from 'solid-js';
import { useSheet } from '../context/SheetProvider';
import { theme } from '../hooks/useScreen';

export function BottomSheet(props) {
  const sheet = useSheet();
  const initialIndex = props.index ?? 1;

  onMount(() => {
    sheet.link(props.ref);
    sheet.setIndex(initialIndex);
    if (props.snapPoints) sheet.setSnapPoints(props.snapPoints);

    if (!customElements.get('bottom-sheet')) {
      import('pure-web-bottom-sheet').then(({ BottomSheet }) => {
        if (!customElements.get('bottom-sheet')) {
          customElements.define('bottom-sheet', BottomSheet);
        }
      });
    }
  });

  const onSnapChange = (e) => {
    if (e.detail?.snapPosition !== undefined) {
      sheet.setIndex(parseInt(e.detail.snapPosition));
    }
  };

  // Style réactif - dark transparent theme
  const containerStyle = () => ({
    "--sheet-max-height": "85vh",
    "--sheet-border-radius": "1.25rem",
    "--sheet-background": theme() === "dark" ? "rgb(23, 23, 23)" : "#fff",
    "transition": "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "z-index": '40',
    ...props.style
  });

  return (
    <bottom-sheet
      ref={props.ref}
      on:snap-position-change={onSnapChange}
      style={containerStyle()}
      nested-scroll={props.nestedScroll ?? true}
    >
      <For each={sheet.snapPoints()}>
        {(point, i) => (
          <div
            slot="snap"
            style={`--snap: ${point}`}
            classList={{ initial: i() === initialIndex }}
          />
        )}
      </For>

      {props.header}
      {props.children}
      {props.footer}
    </bottom-sheet>
  );
}

BottomSheet.Input = (props) => {
  const sheet = useSheet();
  let inputRef;

  const onFocus = (e) => {
    props.onFocus?.(e);
    // Attendre que le clavier soit ouvert
    setTimeout(() => {
      sheet.handleInputFocus?.(inputRef);
    }, 100);
  };

  return (
    <input
      {...props}
      ref={(el) => {
        inputRef = el;
        if (typeof props.ref === 'function') props.ref(el);
      }}
      onFocus={onFocus}
    />
  );
};

BottomSheet.Header = (p) => {
  let headerREF;
  const sheet = useSheet();

  onMount(() => {
    if (headerREF) {
      const headerHeight = headerREF.offsetHeight;
      const vh = (headerHeight / window.innerHeight) * 100;
      sheet.setSnapPoints([`${vh + 4}%`, '50%', '85%']);
    }
  });

  return (
    <div 
      ref={headerREF} 
      slot="header" 
      class={p.class}
    >
      <div className="w-16 h-1.5 bg-neutral-200  dark:bg-neutral-800 mx-auto rounded-full mb-3" />
      {p.children}
    </div>
  )
};

BottomSheet.Footer = (p) => <div slot="footer" style={p.style}>{p.children}</div>;
