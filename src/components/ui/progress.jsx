import * as React from "react";

export const Progress = ({ value = 0, className }) => (
  <div className={className} role="progressbar" aria-valuenow={value}>
    <div style={{ width: `${value}%` }} className="bg-primary h-2" />
  </div>
);
