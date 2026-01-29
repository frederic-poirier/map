import { onMount, For } from 'solid-js';
import { useSheet } from '../context/SheetProvider';

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

  // Style réactif avec décalage clavier
  const containerStyle = () => ({
    "--sheet-max-height": "85vh",
    "--sheet-background": "white",
    "--sheet-keyboard-offset": `${sheet.keyboardOffset()}px`,
    "transform": sheet.keyboardOffset() > 0 ? `translateY(-${sheet.keyboardOffset()}px)` : 'none',
    "transition": "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
      // Snap points: header-only, mid (50%), and full height (85vh)
      // Order matters: first = smallest (collapsed), last = largest (expanded)
      sheet.setSnapPoints([`${vh + 5}%`, '50%', '85%']);
    }
  });

  return <div ref={headerREF} slot="header" class={p.class}>{p.children}</div>;
};

BottomSheet.Footer = (p) => <div slot="footer" style={p.style}>{p.children}</div>;
