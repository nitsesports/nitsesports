import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";

const CtaSection = () => (
  <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
    <div className="container mx-auto px-4 text-center">
      <h2 className="font-orbitron text-4xl font-bold mb-6 text-gradient">
        Ready to Start Your Journey?
      </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Join our community today and be part of the most exciting esports events in NIT Silchar.
      </p>
      <Link to="/about">
        <Button
          size="lg"
          variant="outline"
          className="font-orbitron border-primary/50 hover:bg-primary/10"
        >
          Learn More About Us
        </Button>
      </Link>
    </div>
  </section>
);

export default CtaSection;