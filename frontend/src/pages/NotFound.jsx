import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-orbitron font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-6">Page not found.</p>
      <Link to="/" className="text-primary underline">Go home</Link>
    </div>
  </div>
);

export default NotFound;
