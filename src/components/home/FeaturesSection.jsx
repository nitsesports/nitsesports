import { Trophy, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";

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

const FeaturesSection = () => (
  <section className="py-20 section-divider-top">
    <div className="container mx-auto px-4">
      <h2 className="font-orbitron text-4xl font-bold text-center mb-12 text-gradient">
        Why Join Us?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="glass-card gaming-card border-primary/20 hover:border-primary/50 transition-all group"
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
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection; 