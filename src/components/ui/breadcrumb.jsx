import * as React from "react";
import { cn } from "@/lib/utils.js";

const Breadcrumb = ({ children, className }) => <nav className={cn("text-sm", className)}>{children}</nav>;
const BreadcrumbItem = ({ children }) => <span className="mx-1">{children}</span>;
export { Breadcrumb, BreadcrumbItem };
