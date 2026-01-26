import { onMount, For, createContext, useContext, createSignal, onCleanup } from 'solid-js';


const SheetContext = createContext();

export function useSheet() {
    const context = useContext(SheetContext);
    if (!context) {
        throw new Error('useSheet must be used within a Sheet component');
    }
    return context;
}


function Snaps(props) {
    return (
        <div class={`relative ${"snap-index-" + props.index()}`} style={{ top: props.top }}>
            <div class='absolute top-0 left-0 right-0 h-px snap-start' />
        </div>
    );
}

function Header(props) {
    const sheet = useSheet();
    let headerRef;

    onMount(() => {
        if (headerRef) sheet.registerHeader(headerRef);
        const resizeObserver = new ResizeObserver(() => {
            if (headerRef) sheet.updateHeaderHeight();
        });
        if (headerRef) resizeObserver.observe(headerRef);
        onCleanup(() => resizeObserver.disconnect());
    });

    return (
        <header ref={headerRef} class='sticky top-0 w-full z-10 '>
            <div class='w-10 h-[5px] bg-neutral-400 rounded-full mx-auto my-2' />
            {props.children}
        </header>
    );
}

function Content(props) {
    return (
        <div class='*:flex-1'>
            {props.children}
        </div>
    );
}


export function Sheet(props) {
    let containerREF;
    let registeredHeaderRef = null;
    const [headerHeight, setHeaderHeight] = createSignal('0%');
    const [snapPoints, setSnapPoints] = createSignal([]);

    const calculateHeaderHeight = () => {
        if (registeredHeaderRef && containerREF) {
            const headerH = registeredHeaderRef.offsetHeight;
            const containerH = containerREF.offsetHeight || window.innerHeight * 0.8;
            const percentage = `${(headerH / containerH) * 100}%`;
            setHeaderHeight(percentage);
            return percentage;
        }
        return props.minHeight || '0%';
    };

    const updateSnapPoints = () => {
        const minSnap = props.minHeight === 'header' ? headerHeight() : (props.minHeight || '0%');
        const maxSnap = '100%';
        const middleSnaps = props.snapPoints || ['50%'];

        if (props.minHeight === 'auto') {
            setSnapPoints([...middleSnaps, maxSnap]);
        } else {
            setSnapPoints([minSnap, ...middleSnaps, maxSnap]);
        }
    };

    const registerHeader = (ref) => {
        registeredHeaderRef = ref;
        updateHeaderHeight();
    };

    const updateHeaderHeight = () => {
        calculateHeaderHeight();
        updateSnapPoints();
    };

    const goToSnap = (index) => {
        const snap = containerREF?.querySelector('.snap-index-' + index);
        if (snap) snap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goToSnapInstant = (index) => {
        const snap = containerREF?.querySelector('.snap-index-' + index);
        if (snap) snap.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    const nextSnap = () => {
        const currentIndex = getCurrentSnapIndex();
        const maxIndex = snapPoints().length - 1;
        if (currentIndex < maxIndex) goToSnap(currentIndex + 1);
    };

    const previousSnap = () => {
        const currentIndex = getCurrentSnapIndex();
        if (currentIndex > 0) goToSnap(currentIndex - 1);
    };

    onMount(() => {
        updateSnapPoints();
        setTimeout(() => goToSnapInstant(props.initialSnapIndex ?? 1), 50);
    });

    const sheetAPI = {
        goToSnap,
        goToSnapInstant,
        nextSnap,
        previousSnap,
        registerHeader,
        updateHeaderHeight,
        getSnapPoints: () => snapPoints(),
    };

    if (typeof props.ref === 'function') props.ref(sheetAPI);

    return (
        <SheetContext.Provider value={sheetAPI}>
            <div
                ref={containerREF}
                class={`fixed left-0 right-0 bottom-0 overflow-y-scroll snap-y snap-mandatory pointer-events-none`}
                style={{
                    '--sheet-max-height': props.maxHeight || '80vh',
                    height: 'var(--sheet-max-height)',
                    'max-height': 'var(--sheet-max-height)',
                    'scrollbar-width': 'none',
                    'z-index': props.zIndex || 40,
                }}
            >
                <For each={snapPoints()}>
                    {(point, index) => (
                        <Snaps
                            top={point}
                            index={index}
                            style={{
                                transition: 'top 0.3s ease-out'
                            }}
                        />
                    )}
                </For>

                <div class='snap-bottom static'>
                    <div class='block static h-[var(--sheet-max-height)] max-h-[var(--sheet-max-height)]' />
                </div>

                <div class='h-full'>
                    <div class={`flex flex-col min-h-full pointer-events-auto snap-start ${props.class}`}>
                        {props.children}
                        <div class="block static snap-end" />
                    </div>
                </div>

                <style>{`
          @keyframes initial-snap {
            0% { --snap-point-align: none; }
            50% { 
              scroll-snap-type: none;
              --snap-point-align: none;
            }
          }
          
          div[ref] {
            animation: initial-snap 0.01s both;
          }
        `}</style>
            </div>
        </SheetContext.Provider>
    );
}

Sheet.Header = Header;
Sheet.Content = Content;
Sheet.Snaps = Snaps;