import * as React from "react";

const Avatar = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} />
);
const AvatarFallback = ({ children }) => <div>{children}</div>;

export { Avatar, AvatarFallback };
