import { createSignal, createContext, useContext, onMount, For } from 'solid-js';

const SheetContext = createContext();

export function useSheet() {
  const context = useContext(SheetContext);
  if (!context) throw new Error("useSheet doit être utilisé sous un <SheetProvider>");
  return context;
}

export function SheetProvider(props) {
  const [index, setIndex] = createSignal(0);
  const [snapPoints, setSnapPoints] = createSignal(['50%']); // État partagé des points
  console.log(snapPoints())
  let sheetEl; 

  const api = {
    index,
    setIndex,
    snapPoints,
    setSnapPoints,
    snapTo: (i) => {
      const target = sheetEl?.querySelectorAll('[slot="snap"]')[i];
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    snapToTop: () => {
      sheetEl?.scrollTo({top: 9999, behavior: 'smooth'})
    },
    atTop: () => index() === 0,
    link: (el) => { sheetEl = el; }
  };

  return <SheetContext.Provider value={api}>{props.children}</SheetContext.Provider>;
}

export default function BottomSheet(props) {
  const sheet = useSheet();
  const initialIndex = props.index ?? 1;

  onMount(() => {
    sheet.link(props.ref); 
    sheet.setIndex(initialIndex);
    
    // Si des snapPoints sont passés manuellement, on les utilise
    if (props.snapPoints) sheet.setSnapPoints(props.snapPoints);

    if (!customElements.get('bottom-sheet')) {
      import('pure-web-bottom-sheet').then(({ BottomSheet }) => {
        if (!customElements.get('bottom-sheet')) customElements.define('bottom-sheet', BottomSheet);
      });
    }
  });

  const onSnapChange = (e) => {
    if (e.detail?.snapPosition !== undefined) {
      sheet.setIndex(parseInt(e.detail.snapPosition));
    }
  };

  return (
    <bottom-sheet
      ref={props.ref}
      on:snap-position-change={onSnapChange}
      style={{ "--sheet-max-height": "85vh","--sheet-background": "white", ...props.style }}
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

      {/* Slots pour le contenu */}
      {props.header}
      {props.children}
      {props.footer}
    </bottom-sheet>
  );
}

// Composant Header intelligent
BottomSheet.Header = (p) => {
  let headerREF;
  const sheet = useSheet();

  onMount(() => {
    if (headerREF) {
      const height = headerREF.offsetHeight;
      const vh = (height / window.innerHeight) * 100;
      sheet.setSnapPoints(prev => [`${vh}%`, ...prev]);
    }
  });

  return <div ref={headerREF} slot="header" class={p.class}>{p.children}</div>;
};

BottomSheet.Footer = (p) => <div slot="footer" style={p.style}>{p.children}</div>;
