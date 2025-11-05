import { useState, useEffect } from "react";
import { ShoppingCart, Heart } from "lucide-react";
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
    {
      id: 4,
      name: "Headphone Stand",
      category: "accessories",
      price: 699,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
      description: "RGB Headphone stand with club branding",
      badge: null,
    },
    {
      id: 5,
      name: "Gaming Cap",
      category: "apparel",
      price: 399,
      image: "https://images.unsplash.com/photo-1588195538326-c5b1e6f06a20?w=400&h=500&fit=crop",
      description: "Adjustable gaming cap with embroidered logo",
      badge: "Trending",
    },
    {
      id: 6,
      name: "Keyboard Wrist Rest",
      category: "accessories",
      price: 349,
      image: "https://images.unsplash.com/photo-1587829191301-41c4ab11301f?w=400&h=500&fit=crop",
      description: "Memory foam wrist rest for extended gaming",
      badge: null,
    },
    {
      id: 7,
      name: "Club T-Shirt",
      category: "apparel",
      price: 499,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
      description: "Classic club t-shirt in premium cotton",
      badge: "Popular",
    },
    {
      id: 8,
      name: "Gaming Desk Pad",
      category: "accessories",
      price: 899,
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=500&fit=crop",
      description: "Large desk pad with RGB lighting compatibility",
      badge: "New",
    },
  ];

  const categories = [
    { id: "all", name: "All Products" },
    { id: "apparel", name: "Apparel" },
    { id: "accessories", name: "Accessories" },
  ];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const toggleWishlist = (productId) => {
    if (!user) {
      toast.error("Please sign in to add items to wishlist");
      navigate("/login", { state: { from: "/merchandise" } });
      return;
    }

    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      toast.info("Removed from wishlist");
    } else {
      setWishlist([...wishlist, productId]);
      toast.success("Added to wishlist");
    }
  };

  const addToCart = (product) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/login", { state: { from: "/merchandise" } });
      return;
    }

    setCart([...cart, product]);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            Merchandise Store
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Represent your club! Shop exclusive gaming gear and apparel
          </p>
          {!user && (
            <div className="mb-8 inline-block px-6 py-3 bg-accent/20 rounded-lg border border-accent/50">
              <p className="text-accent mb-3 font-orbitron">
                ✨ Sign in to shop and add items to cart
              </p>
              <Button
                onClick={() => navigate("/login", { state: { from: "/merchandise" } })}
                className="glow-primary font-orbitron"
              >
                Sign In to Shop
              </Button>
            </div>
          )}
          {cart.length > 0 && (
            <div className="inline-block px-4 py-2 bg-primary/20 rounded-full border border-primary/50">
              <span className="font-orbitron text-sm">
                🛒 {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
              </span>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className="font-orbitron"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden group"
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
                <button
                  onClick={() => toggleWishlist(product.id)}
                  disabled={!user}
                  className={`absolute top-3 right-3 p-2 rounded-full transition text-white ${
                    user ? "bg-black/40 hover:bg-black/60 cursor-pointer" : "bg-black/60 cursor-not-allowed opacity-50"
                  }`}
                  title={!user ? "Sign in to add to wishlist" : "Add to wishlist"}
                >
                  <Heart
                    size={20}
                    fill={user && wishlist.includes(product.id) ? "currentColor" : "none"}
                  />
                </button>
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
                <Button
                  onClick={() => addToCart(product)}
                  disabled={!user}
                  className={`w-full font-orbitron group ${
                    user ? "glow-primary" : "opacity-50 cursor-not-allowed"
                  }`}
                  title={!user ? "Sign in to add to cart" : "Add to cart"}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  {user ? "Add to Cart" : "Sign in to Shop"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-primary/20 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-orbitron font-bold mb-2">Free Shipping</h3>
              <p className="text-muted-foreground text-sm">
                Free shipping on orders above ₹999
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">💯</div>
              <h3 className="font-orbitron font-bold mb-2">Quality Assured</h3>
              <p className="text-muted-foreground text-sm">
                Premium materials and perfect printing
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="font-orbitron font-bold mb-2">Gift Wrapping</h3>
              <p className="text-muted-foreground text-sm">
                Complimentary gift wrapping available
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        {cart.length > 0 && user && (
          <Card className="glass-card border-accent/30 bg-accent/5 text-center">
            <CardContent className="py-12">
              <h3 className="font-orbitron text-2xl font-bold mb-4">
                Ready to checkout?
              </h3>
              <p className="text-muted-foreground mb-6">
                You have {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart worth ₹
                {cart.reduce((sum, item) => sum + item.price, 0)}
              </p>
              <Button size="lg" className="glow-primary font-orbitron">
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Merchandise;
