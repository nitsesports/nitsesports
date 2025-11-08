import * as React from "react";
import { cn } from "@/lib/utils.js";

const Alert = ({ children, className }) => (
  <div role="alert" className={cn("rounded-md p-4 bg-yellow-50 text-yellow-800", className)}>
    {children}
  </div>
);

export { Alert };
