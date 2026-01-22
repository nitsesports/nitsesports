import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import kraftonLogo from "@/assets/krafton_logo.png";


const sponsors = [
    {
        id: 1,
        name: "Krafton India Esports",
        logo: kraftonLogo,
        tier: "Platinum",
    },
];

const Sponsors = () => {
    const fadeInVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const staggerContainer = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
    };

    return (
        <motion.section
            className="py-20 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
        >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.h2
                    variants={fadeInVariants}
                    className="font-orbitron text-4xl font-bold text-center mb-4 text-gradient"
                >
                    Our Partners
                </motion.h2>

                <motion.p
                    variants={fadeInVariants}
                    className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
                >
                    Powering the next generation of esports athletes
                </motion.p>

                <div className="flex flex-wrap justify-center gap-6">
                    {sponsors.map((sponsor) => (
                        <motion.div key={sponsor.id} variants={fadeInVariants} className="w-full max-w-[240px]">
                            <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all hover:bg-primary/5 h-32 flex items-center justify-center group overflow-hidden">
                                <CardContent className="p-4 flex items-center justify-center w-full h-full">
                                    <img
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        className="max-h-20 max-w-full opacity-70 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0 duration-300"
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default Sponsors;
