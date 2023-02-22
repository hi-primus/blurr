type Toast = {
  title: string;
  message?: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  icon?: string;
  class?: string;
  closable?: boolean;
  action?: string;
  actionCallback?: (e: Event) => void;
  time?: number;
  id?: number;
};

type ToastInput = Prettify<
  Omit<Toast, 'message'> & {
    message?: ArrayOr<string>;
    error?: unknown;
  }
>;

let toastId = 1;

const toasts = ref<Array<Toast>>([]);

const DEFAULT_TIME = 30;

const DEFAULT_TOAST: Toast = {
  title: 'Unknown error',
  message: undefined,
  type: 'error',
  icon: undefined,
  class: undefined,
  closable: true,
  action: undefined,
  actionCallback: undefined,
  time: DEFAULT_TIME
};

const addToast = (toast: ToastInput = {} as ToastInput) => {
  if (toast.error && !toast.message) {
    if (toast.error instanceof Error) {
      toast.message = toast.error.message;
    } else if (typeof toast.error === 'string') {
      toast.message = toast.error;
    }
    delete toast.error;
  }

  if (Array.isArray(toast.message)) {
    toast.message = toast.message.join('\n');
  }

  const newToast: Toast = Object.assign({ id: toastId }, DEFAULT_TOAST, toast);
  toastId++;
  return toasts.value.push(newToast) - 1;
};

export default function () {
  return {
    addToast,
    toasts
  };
}