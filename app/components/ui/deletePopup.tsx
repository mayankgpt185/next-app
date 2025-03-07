import React from 'react';
import { AlertDialog } from 'radix-ui';

interface DeletePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message?: string;
}

const DeletePopup: React.FC<DeletePopupProps> = ({ isOpen, onClose, onConfirm, message }) => (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
        <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
            <AlertDialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-lg focus:outline-none">
                <AlertDialog.Title className="m-0 text-lg font-medium">
                    Are you sure?
                </AlertDialog.Title>
                <AlertDialog.Description className="mb-5 mt-3 text-sm">
                    {message}
                </AlertDialog.Description>
                <div className="flex justify-end gap-4">
                    <AlertDialog.Cancel asChild>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                            Cancel
                        </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">
                            Yes, Delete
                        </button>
                    </AlertDialog.Action>
                </div>
            </AlertDialog.Content>
        </AlertDialog.Portal>
    </AlertDialog.Root>
);

export default DeletePopup;
