import { useState } from "react";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import heroVideo from "@/assets/esports.mp4";
import { motion, useInView } from "framer-motion";

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
  const [isMuted, setIsMuted] = useState(true);
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
    visible: {
      transition: {
        staggerChildren: 0.2, // Time between child animations
      },
    },
  };

  // ... features data

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* ... video and mute button */}
        <video
className="absolute inset-0 w-full h-full object-cover z-0"
src={heroVideo}
autoPlay
loop
muted={isMuted}
playsInline

/>
<button
onClick={() => setIsMuted(!isMuted)}
className="absolute bottom-8 right-8 z-30 px-4 py-2 bg-black/60 text-white rounded-lg
hover:bg-black/80 transition font-orbitron text-sm"
>
{isMuted ? "🔊 Unmute" : "🔇 Mute"}
</button>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20 z-10 pointer-events-none" />

        {/* Foreground Content with Motion */}
        <motion.div 
          className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 z-20 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible" // Animate on mount
        >
          <motion.h1 
            variants={fadeInVariants} // Apply variant to H1
            className="font-orbitron text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight"
          >
            NIT SILCHAR
            <br />
            ESPORTS CLUB
          </motion.h1>
          <motion.p 
            variants={fadeInVariants} // Apply variant to P
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Join the most competitive gaming community in NIT Silchar. Level up your skills and dominate the leaderboard.
          </motion.p>
          <motion.div 
            variants={fadeInVariants} // Apply variant to Button container
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/events">
<Button size="lg" className="glow-primary group font-orbitron">
View Events
<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
</Button>
</Link>
<Link to="/team">
<Button
size="lg"
variant="outline"
className="font-orbitron border-primary/50 hover:bg-primary/10"
>
Join Community
</Button>
</Link>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
  className="py-20"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }} 
  variants={staggerContainer}
>
  <div className="container mx-auto px-4">
    <motion.h2 
      variants={fadeInVariants} // Use the simple fadeIn for the header
      className="font-orbitron text-4xl font-bold text-center mb-12 text-gradient"
    >
      Why Join Us?
    </motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div 
          key={index}
          variants={fadeInVariants} // Apply the fade-in to each card
        >
          <Card
            className="glass-card border-primary/20 hover:border-primary/50 transition-all hover:glow-primary group"
          >
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

<motion.section 
  className="py-20"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
  variants={staggerContainer}
>
  <div className="container mx-auto px-4">
    <motion.h2 
      variants={fadeInVariants}
      className="font-orbitron text-4xl font-bold text-center mb-4 text-gradient"
    >
      Gallery
    </motion.h2>
    <motion.p 
      variants={fadeInVariants}
      className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
    >
      Explore moments from our tournaments, events, and community gatherings
    </motion.p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {galleryImages.map((image) => (
        <motion.div
          key={image.id}
          variants={fadeInVariants} // Animate each image tile
          className="group relative overflow-hidden rounded-lg h-48 cursor-pointer"
        >
          <img
src={image.src}
alt={image.alt}
className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
/>
        </motion.div>
      ))}
    </div>
    <Link to="/gallery">
<Button size="lg" className="glow-primary group font-orbitron">
View More
<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
</Button>
</Link>
  </div>
</motion.section>

<motion.section 
  className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={staggerContainer}
>
  <div className="container mx-auto px-4 text-center">
    <motion.h2 
      variants={fadeInVariants}
      className="font-orbitron text-4xl font-bold mb-6 text-gradient"
    >
      Ready to Start Your Journey?
    </motion.h2>
    <motion.p 
      variants={fadeInVariants}
      className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
    >
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
    </div>
  );
};

export default Home;
