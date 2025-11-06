import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase.js";

const Merchandise = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const products = [
    {
      id: 1,
      name: "Gaming Jersey",
      category: "apparel",
      price: 799,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
      description: "Premium gaming jersey with club logo",
      badge: "Popular",
    },
    {
      id: 2,
      name: "Gaming Mouse Pad",
      category: "accessories",
      price: 499,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=500&fit=crop",
      description: "Large gaming mouse pad with custom design",
      badge: "New",
    },
    {
      id: 3,
      name: "Club Hoodie",
      category: "apparel",
      price: 1299,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce257?w=400&h=500&fit=crop",
      description: "Comfortable hoodie perfect for gaming sessions",
      badge: "Hot",
    },
  ];

  const categories = [
    { id: "all", name: "All Products" },
    { id: "apparel", name: "Apparel" },
    { id: "accessories", name: "Accessories" },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (loading) return null;

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            Merchandise Store
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Represent your club! Shop exclusive gaming gear and apparel.
          </p>
        </div>

        {/* Product Grid (blurred) */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 blur-sm opacity-60 pointer-events-none select-none transition-all duration-500">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="glass-card border-primary/20 overflow-hidden group"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-accent/80 hover:bg-accent">
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-orbitron text-lg">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{product.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron text-2xl font-bold text-primary">
                      ₹{product.price}
                    </span>
                  </div>
                  <Button disabled className="w-full opacity-50 cursor-not-allowed">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Frosted Glass Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-background/70 rounded-2xl transition-all">
            <div className="text-center">
              <Clock size={48} className="mx-auto text-primary mb-4 animate-pulse" />
              <h2 className="font-orbitron text-4xl font-bold text-primary mb-2">
                Coming Soon
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-6">
                Our merchandise store is almost ready! Stay tuned for the official drop
                of exclusive club apparel and gaming gear.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="glow-primary font-orbitron"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merchandise;
