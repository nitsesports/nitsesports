import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { ArrowRight } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    src: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372620/gallery_2_pewgxm.jpg",
    alt: "Gaming Tournament",
    category: "Tournament",
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372619/gallery_3_r45xh4.jpg",
    alt: "Team Event",
    category: "Event",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372633/gallery_5_kcq4kt.jpg",
    alt: "Esports Competition",
    category: "Competition",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372619/gallery_1_w6i2qr.jpg",
    alt: "Gaming Setup",
    category: "Setup",
  },
];

const GallerySection = () => (
  <section className="py-20 section-divider-bottom">
    <div className="container mx-auto px-4">
      <h2 className="font-orbitron text-4xl font-bold text-center mb-4 text-gradient">
        Gallery
      </h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Explore moments from our tournaments, events, and community gatherings
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {galleryImages.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg h-48 cursor-pointer"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link to="/gallery">
          <Button size="lg" className="glow-primary group font-orbitron">
            View More
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default GallerySection;