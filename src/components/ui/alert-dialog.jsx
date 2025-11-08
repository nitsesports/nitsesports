import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils.js";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Content ref={ref} className={cn("p-6 bg-white rounded-md", className)} {...props} />
));
const AlertDialogHeader = ({ children, className }) => (
  <div className={cn("mb-4", className)}>{children}</div>
);
const AlertDialogFooter = ({ children, className }) => (
  <div className={cn("mt-4 flex justify-end", className)}>{children}</div>
);
const AlertDialogTitle = AlertDialogPrimitive.Title;
const AlertDialogDescription = AlertDialogPrimitive.Description;

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription };
