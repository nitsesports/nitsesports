import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);


  const images = [
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
    {
      id: 5,
      src: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372625/gallery_4_wq2fbj.jpg",
      alt: "Community Gathering",
      category: "Community",
    },
  ];

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-transparent">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-4 text-gradient">
            Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore moments from our tournaments, events, and community gatherings
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-lg cursor-pointer h-64"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-orbitron text-sm font-bold mb-2">
                  {image.category}
                </span>
                <span className="text-white/80 text-sm">{image.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>

            {/* Main Image */}
            <div className="relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto rounded-lg"
              />

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Image Info */}
            <div className="mt-4 text-center text-white">
              <span className="text-sm text-gray-300">{currentIndex + 1} / {images.length}</span>
              <h3 className="font-orbitron text-lg mt-2">{selectedImage.alt}</h3>
              <p className="text-gray-400">{selectedImage.category}</p>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-6 flex gap-2 overflow-x-auto justify-center pb-2">
              {images.map((image, index) => (
                <img
                  key={image.id}
                  src={image.src}
                  alt={image.alt}
                  onClick={() => openLightbox(index)}
                  className={`h-16 w-16 object-cover rounded cursor-pointer transition ${
                    index === currentIndex
                      ? "border-2 border-primary"
                      : "border border-gray-600 opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
