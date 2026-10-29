import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

export function useModalAccessibility(modalRef, isOpen, onClose) {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const modal = modalRef.current;
        if (!modal) return undefined;

        const previouslyFocused = document.activeElement;
        const getFocusableElements = () =>
            [...modal.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
                (element) => element.getClientRects().length > 0
            );

        getFocusableElements()[0]?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current();
                return;
            }

            if (event.key !== 'Tab') return;

            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) {
                event.preventDefault();
                modal.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (
                event.shiftKey &&
                (document.activeElement === firstElement ||
                    !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === lastElement ||
                    !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, [isOpen, modalRef]);
}
