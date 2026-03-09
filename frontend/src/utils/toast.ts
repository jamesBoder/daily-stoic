// import toast library
import { toast } from "react-hot-toast";

// create a utility function to show success toast  
export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            duration: 3000,
            style: {
                background: '#4BB543',
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#4BB543',
            },
        });
    },
    
    // create a utility function to show error toast
    error: (message: string) => {
        toast.error(message, {
            duration: 4000,
            style: {
                background: '#FF3333',
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#FF3333',
            },
        });
    },
    // loading toast
    loading: (message: string) => {
        return toast.loading(message)
    },

    // promist
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

    // info toast
    info: (message: string) => {
        toast(message, {
            duration: 3000,
            icon: 'ℹ️',
            style: {
                background: '#3b82f6',
                color: '#fff',
            },
        });
    },

    // dismiss toast
    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    }

}
