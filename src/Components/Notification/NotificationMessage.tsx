import { toast } from "sonner";

export const successToast = (message = "Notification message") => {
  toast.success(message);
};

export const errorToast = (message = "Error occurred") => {
  toast.error(message);
};
