// useKeyboard.js
import { createSignal, createEffect, onCleanup } from 'solid-js';

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = createSignal(0);
  const [isOpen, setIsOpen] = createSignal(false);

  createEffect(() => {
    const visualViewport = window.visualViewport;
    
    if (!visualViewport) return;

    const handleResize = () => {
      const heightDiff = window.innerHeight - visualViewport.height;
      const isKeyboardOpen = heightDiff > 100; // Seuil de 100px
      
      setIsOpen(isKeyboardOpen);
      setKeyboardHeight(isKeyboardOpen ? heightDiff : 0);
    };

    // Support pour l'API Virtual Keyboard (Android Chrome/Edge)
    if ('virtualKeyboard' in navigator) {
      navigator.virtualKeyboard.addEventListener('geometrychange', (e) => {
        const height = e.target.boundingRect.height;
        setKeyboardHeight(height);
        setIsOpen(height > 0);
      });
    }

    visualViewport.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    onCleanup(() => {
      visualViewport.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    });
  });

  return { keyboardHeight, isOpen };
}