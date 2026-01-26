import { createEffect, useRef } from "solid-js";
import { BottomSheet } from "./BottomSheet";

export function ModalSheet(props) {
    let dialogRef;

    // Réactivité : Quand props.isOpen change, on agit sur le dialog
    createEffect(() => {
        if (!dialogRef) return;

        if (props.isOpen) {
            dialogRef.showModal();
        } else {
            dialogRef.close();
        }
    });

    // Gérer la fermeture via le bouton "Back" ou la touche ESC
    const handleClose = () => {
        if (props.onClose) props.onClose();
    };

    return (
        // Le gestionnaire de dialogue fourni par la librairie
        <bottom-sheet-dialog-manager>
            <dialog
                ref={dialogRef}
                onClose={handleClose}
                class="bg-transparent border-none p-0 m-0 w-full h-full max-w-none max-h-none backdrop:bg-black/50"
            >
                <BottomSheet
                    {...props}
                    // Important: dire à la sheet qu'elle peut fermer le dialog en glissant vers le bas
                    swipe-to-dismiss={true}
                    onSnap={(detail) => {
                        // Si on glisse tout en bas, on ferme
                        if (detail.snapPoint === '0%') handleClose();
                        if (props.onSnap) props.onSnap(detail);
                    }}
                />
            </dialog>
        </bottom-sheet-dialog-manager>
    );
}