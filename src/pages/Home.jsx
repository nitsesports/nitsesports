import { ArrowRight, Trophy, Users, Calendar, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { motion } from "framer-motion";
import { useRef } from "react";

import HeroAnimation from "@/components/newHero/HeroAnimation.jsx";
import Sponsors from "@/components/Sponsors.jsx";


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

const Home = () => {
  const introRef = useRef(null);
  const nextSectionRef = useRef(null);

  const scrollToNext = () => {
    introRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: Trophy,
      title: "Competitive Gaming",
      description: "Participate in tournaments and climb the rankings",
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join a vibrant community of passionate gamers",
    },
    {
      icon: Calendar,
      title: "Regular Events",
      description: "Weekly tournaments and gaming sessions",
    },
  ];

  const fadeInVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="min-h-screen">

      {/* ⭐ HERO SECTION (ANIMATION ONLY) */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <HeroAnimation />
        </div>

        {/* Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent z-10"></div>

        {/* Scroll Arrow */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20
                     text-white p-3 rounded-full bg-white/10 backdrop-blur-md 
                     border border-white/20 hover:bg-white/20 transition
                     animate-pulse"
        >
          <ChevronDown className="h-8 w-8 text-white" />
        </button>

      </section>

      {/* ⭐ NEW TITLE + SUBTITLE + BUTTONS SECTION */}
      <motion.section
        ref={introRef}
        className="py-20 text-center px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Subtitle */}
        <motion.p
          variants={fadeInVariants}
          className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
        >
          Join the most competitive gaming community in NIT Silchar.
          <br />
          Level up your skills and dominate the leaderboard.
        </motion.p>

        {/* Buttons Row */}
        <motion.div
          variants={fadeInVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/events">
            <Button size="lg" className="glow-primary px-8 py-6 text-lg font-orbitron">
              View Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link to="/team">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-orbitron border-primary/50 hover:bg-primary/10"
            >
              Join Community
            </Button>
          </Link>
        </motion.div>
      </motion.section>


      {/* ⭐ WHY JOIN US SECTION */}
      <motion.section
        ref={nextSectionRef}
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            variants={fadeInVariants}
            className="font-orbitron text-4xl font-bold text-center mb-12 text-gradient"
          >
            Why Join Us?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInVariants}>
                <Card className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:glow-primary group">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-orbitron text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ⭐ GALLERY SECTION */}
      <motion.section
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.h2 variants={fadeInVariants} className="font-orbitron text-4xl font-bold text-center mb-4 text-gradient">
            Gallery
          </motion.h2>

          <motion.p variants={fadeInVariants} className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Explore moments from our tournaments, events, and community gatherings
          </motion.p>

          {/* Mobile & Tablet (normal grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 lg:hidden">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg h-48 cursor-pointer"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* PC ONLY — marquee */}
          <div className="gallery-marquee-wrapper mb-8 hidden lg:block">
            <div className="gallery-marquee">
              {galleryImages.concat(galleryImages).map((image, index) => (
                <div
                  key={index}
                  className="gallery-item relative overflow-hidden rounded-lg h-48 cursor-pointer"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>


          <Link to="/gallery">
            <Button size="lg" className="glow-primary group font-orbitron">
              View More
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.section>



      {/* ⭐ SPONSORS SECTION */}
      <Sponsors />

      {/* ⭐ FINAL CTA */}

      <motion.section
        className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 variants={fadeInVariants} className="font-orbitron text-4xl font-bold mb-6 text-gradient">
            Ready to Start Your Journey?
          </motion.h2>

          <motion.p variants={fadeInVariants} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community today and be part of the most exciting esports events in NIT Silchar.
          </motion.p>

          <motion.div variants={fadeInVariants}>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="font-orbitron border-primary/50 hover:bg-primary/10"
              >
                Learn More About Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

    </div >
  );
};

export default Home;
