import { createSignal, For } from "solid-js";
import { LayoutHeader } from "~/component/features/layout/Layout";

export default function Test() {
    const [currentIndex, setCurrentIndex] = createSignal(0);
    let scrollRef;

    const containers = [
        { id: 0, color: "bg-red-500", label: "Container 1" },
        { id: 1, color: "bg-green-500", label: "Container 2" },
        { id: 2, color: "bg-blue-500", label: "Container 3" },
    ];

    const handleScroll = () => {
        if (!scrollRef) return;
        const index = Math.round(scrollRef.scrollLeft / scrollRef.offsetWidth);
        setCurrentIndex(index);
    };

    const scrollTo = (index) => {
        if (!scrollRef) return;
        scrollRef.scrollTo({
            left: index * scrollRef.offsetWidth,
            behavior: "smooth",
        });
    };

    return (
        <div class="space-y-4">
            <LayoutHeader title="Test" />

            {/* Indicator dots */}
            <div class="flex justify-center gap-2">
                <For each={containers}>
                    {(container, i) => (
                        <button
                            onClick={() => scrollTo(i())}
                            class={`w-2 h-2 rounded-full transition-all ${currentIndex() === i()
                                    ? "bg-[var(--accent-primary)] w-6"
                                    : "bg-[var(--border-secondary)]"
                                }`}
                        />
                    )}
                </For>
            </div>

            {/* Horizontal scroll container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{
                    "scroll-snap-type": "x mandatory",
                    "-webkit-overflow-scrolling": "touch",
                }}
            >
                <For each={containers}>
                    {(container) => (
                        <div
                            class={`flex-shrink-0 w-full snap-center ${container.color} rounded-2xl h-64 flex items-center justify-center`}
                            style={{ "scroll-snap-align": "center" }}
                        >
                            <div class="text-white text-center">
                                <p class="text-2xl font-bold">{container.label}</p>
                                <p class="text-sm opacity-75 mt-2">Swipe left or right</p>
                            </div>
                        </div>
                    )}
                </For>
            </div>

            {/* Navigation buttons */}
            <div class="flex justify-between gap-4">
                <button
                    onClick={() => scrollTo(Math.max(0, currentIndex() - 1))}
                    disabled={currentIndex() === 0}
                    class="flex-1 py-3 rounded-xl font-semibold transition-all bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ← Previous
                </button>
                <button
                    onClick={() => scrollTo(Math.min(containers.length - 1, currentIndex() + 1))}
                    disabled={currentIndex() === containers.length - 1}
                    class="flex-1 py-3 rounded-xl font-semibold transition-all bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>

            {/* Debug info */}
            <div class="p-3 rounded-xl bg-[var(--bg-secondary)] text-sm">
                <p class="text-[var(--text-tertiary)]">
                    Current Index: <span class="text-[var(--text-primary)] font-mono">{currentIndex()}</span>
                </p>
            </div>
        </div>
    );
}
