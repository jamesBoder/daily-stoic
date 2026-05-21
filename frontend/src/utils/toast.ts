// import toast library
import { toast } from "react-hot-toast";

export const showToast = {
    success: (message: string, id?: string) => {
        toast.success(message, {
            id,
            duration: 3000,
            style: {
                background: 'var(--color-toast-success)',
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: 'var(--color-toast-success)',
            },
        });
    },

    error: (message: string, id?: string) => {
        toast.error(message, {
            id,
            duration: 4000,
            style: {
                background: 'var(--color-toast-error)',
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: 'var(--color-toast-error)',
            },
        });
    },

    loading: (message: string, id?: string) => {
        return toast.loading(message, { id });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, messages);
    },

    info: (message: string, id?: string) => {
        toast(message, {
            id,
            duration: 3000,
            icon: 'ℹ️',
            style: {
                background: 'var(--color-toast-info)',
                color: '#fff',
            },
        });
    },

    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    }
}
