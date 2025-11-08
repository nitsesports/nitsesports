import * as React from "react";
import { cn } from "@/lib/utils.js";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("w-full rounded-md border px-3 py-2", className)} {...props} />
));
Textarea.displayName = "Textarea";

export { Textarea };
