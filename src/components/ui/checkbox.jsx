import * as React from "react";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <input type="checkbox" ref={ref} className={className} {...props} />
));

export { Checkbox };
