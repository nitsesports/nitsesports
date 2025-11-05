import { useState, useEffect, useRef } from "react";
import { Users, Mail, UserPlus } from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaLinkedinIn } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs.jsx";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Team = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("president");

  // CTA visibility for lazy reveal
  const [ctaVisible, setCtaVisible] = useState(false);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!ctaRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCtaVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(ctaRef.current);
    return () => obs.disconnect();
  }, [ctaRef]);

  // Add optional socials per member (icons only render when a URL exists)
  const members = [
    { name: "Shivam Kumar", role: "President", initials: "SK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372648/shivam_kolprd.jpg", category: "president", socials: { instagram: "https://www.instagram.com/shivam._.13r?igsh=MXhlM3hsNThycnhsNQ==", facebook: "https://www.facebook.com/share/1DdpdrsxmW/", linkedin: "https://www.linkedin.com/in/shivam-kumar-37a98b2a6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }  },
    { name: "Vaibhav Raj", role: "Vice President", initials: "VR", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372664/vaibhav_a9c9oi.jpg", category: "president", socials: { instagram: "https://www.instagram.com/__raj_vaibhav__/?hl=en", facebook: "https://www.facebook.com/share/19tdpR9wb9/", linkedin: "https://www.linkedin.com/in/vaibhav-raj-o7/" }  },
    { name: "Vivek Kumar", role: "General Secretary", initials: "VK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372696/vivek_jish2r.png", category: "secretary" , socials: { instagram: "https://www.instagram.com/vix.vivek?igsh=MWk4cnlkbHlkdnlncw==", facebook: "https://www.facebook.com/share/17VCbgYNya/", linkedin: "https://www.linkedin.com/in/vivek-kumar-0b8205282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" } },
    { name: "Arkaprovo Mukherjee", role: "Assistant General Secretary", initials: "AM", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372612/arko_kwlblw.jpg", category: "secretary", socials: { instagram: "https://www.instagram.com/mukherjee.arkaprovo?igsh=d3g4aXo2dmFsYjJj", facebook: "https://www.facebook.com/share/17GZYmGt42/", linkedin: "https://www.linkedin.com/in/arkaprovo-mukherjee-b3a574268?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }  },
    { name: "Devashish Gupta", role: "Event Management Head", initials: "DG", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372622/devashish_gcm794.jpg", category: "heads", socials: { instagram: "https://www.instagram.com/dev._.ashish_?igsh=OWZ1bW8xdWNkcWNr", facebook: "https://www.facebook.com/share/1JqSeh5ssL/", linkedin: "https://www.linkedin.com/in/devashish-verse/" }  },
    { name: "Mohit Kumar Lalwani", role: "Technical Head", initials: "ML", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372641/mohit_ymgs3w.jpg", category: "heads", socials: { instagram: "https://www.instagram.com/mohitkumarlalwani?igsh=MWttZWtuOXhvajA0bQ==", facebook: "https://www.facebook.com/share/16YiM7qwyK/", linkedin: "https://www.linkedin.com/in/mohit-kumar-lalwani-603239297/" }  },
    { name: "Abhishek Kumar", role: "Social Media Head", initials: "AG", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372621/abhishek_fgedzj.png", category: "heads", socials: { instagram: "https://www.instagram.com/abikumar1234?igsh=MWJndGthOXNkYzE4cA==", facebook: "https://www.facebook.com/share/1FVjtPGHMe/", linkedin: "https://www.linkedin.com/in/abhishek-kumar-b5a08a1b3/" }  },
    { name: "Gaurav Ghosh", role: "Marketing Head", initials: "GG", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372624/gaurav_tmhxvv.jpg", category: "heads", socials: { instagram: "https://www.instagram.com/gaurav_24044?utm_source=qr&igsh=a3lucmJ0djd3ZDhr", facebook: "https://www.facebook.com/share/1AuP79rWkt/", linkedin: "https://www.linkedin.com/in/gaurav-ghosh-50a2362a8/" }  },
    { name: "Adarsh Kumar", role: "Content & Design Head", initials: "AK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372614/adarsh_s5k7hm.jpg", category: "heads", socials: { instagram: "https://www.instagram.com/adarsh_kr.04?igsh=d2hoMXUxZ3Fud2lt", facebook: "https://www.facebook.com/share/1D6CELAhWs/", linkedin: "https://www.linkedin.com/in/adarsh-kumar-14b110291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }  },
    { name: "Ronit Raj", role: "PR Head", initials: "RR", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372700/ronit_ptsij7.jpg", category: "heads", socials: { instagram: "https://www.instagram.com/ro.nits?igsh=MXpxYXNtZ3c3YnFy", facebook: "#", linkedin: "https://www.linkedin.com/in/ronit-raj-a4b194311/" }  },
    { name: "Suryans Singh", role: "BGMI Head", initials: "SS", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372664/suryans_todvmv.jpg", category: "gameheads" , socials: { instagram: "https://www.instagram.com/me_suryans?utm_source=qr&igsh=ZjhudnB0YXVvenhh", facebook: "https://www.facebook.com/share/17ero4dZHr/", linkedin: "https://www.linkedin.com/in/suryans-singh-12474029a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" } },
    { name: "Lakshya Ujjwal", role: "Freefire Head", initials: "AG", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761661099/WhatsApp_Image_2025-10-25_at_15.35.14_bex4ar.jpg", category: "gameheads" , socials: { instagram: "#", facebook: "#", linkedin: "https://www.linkedin.com/in/lakshyaujjwal/" } },
    { name: "Adarsh Kumar", role: "Clash Royale Head", initials: "AK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372614/adarsh_s5k7hm.jpg", category: "gameheads", socials: { instagram: "https://www.instagram.com/adarsh_kr.04?igsh=d2hoMXUxZ3Fud2lt", facebook: "https://www.facebook.com/share/1D6CELAhWs/", linkedin: "https://www.linkedin.com/in/adarsh-kumar-14b110291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }  },
    { name: "Vaibhav Raj", role: "Mobile Legends Head", initials: "VR", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372664/vaibhav_a9c9oi.jpg", category: "gameheads", socials: { instagram: "https://www.instagram.com/__raj_vaibhav__/?hl=en", facebook: "https://www.facebook.com/share/19tdpR9wb9/", linkedin: "https://www.linkedin.com/in/vaibhav-raj-o7/" }  },
    { name: "Abhishek Kumar", role: "COD:Mobile Head", initials: "AK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372621/abhishek_fgedzj.png", category: "gameheads", socials: { instagram: "https://www.instagram.com/abikumar1234?igsh=MWJndGthOXNkYzE4cA==", facebook: "https://www.facebook.com/share/1FVjtPGHMe/", linkedin: "https://www.linkedin.com/in/abhishek-kumar-b5a08a1b3/" }  },
    { name: "Sunil Kushwaha", role: "Valorant Head", initials: "SK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372663/sunil_yl04ns.jpg", category: "gameheads" , socials: { instagram: "https://www.instagram.com/sunilkushwaha_thegreat?igsh=NzA1ZW43c3plMzBu", facebook: "https://www.facebook.com/share/1A9c5576tk/", linkedin: "https://www.linkedin.com/in/sunil-kushwaha-549427378?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" } },
    { name: "Arkaprovo Mukherjee", role: "FIFA Head", initials: "AM", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372612/arko_kwlblw.jpg", category: "gameheads" , socials: { instagram: "https://www.instagram.com/mukherjee.arkaprovo?igsh=d3g4aXo2dmFsYjJj", facebook: "https://www.facebook.com/share/17GZYmGt42/", linkedin: "https://www.linkedin.com/in/arkaprovo-mukherjee-b3a574268?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" } },
    { name: "Mohit Kumar Lalwani", role: "BULLET ECHO Head", initials: "ML", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372641/mohit_ymgs3w.jpg", category: "gameheads", socials: { instagram: "https://www.instagram.com/mohitkumarlalwani?igsh=MWttZWtuOXhvajA0bQ==", facebook: "https://www.facebook.com/share/16YiM7qwyK/", linkedin: "https://www.linkedin.com/in/mohit-kumar-lalwani-603239297/" }  },
    { name: "Chirag Khandelwal", role: "Executive Member", initials: "CK", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372613/chirag_u3p0ir.jpg", category: "members", socials: { instagram: "https://www.instagram.com/piee_bond/", facebook: "https://www.facebook.com/share/1GrXJbxoAu/?mibextid=wwXIfr", linkedin: "https://www.linkedin.com/in/chirag-khandelwal-99829925a?utm_source=share_via&utm_content=profile&utm_medium=member_ios" }  },
    { name: "Satyam Kumar Jha", role: "Executive Member", initials: "SKJ", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372687/satyam_olaq3e.png", category: "members", socials: { instagram: "https://www.instagram.com/sa_tyam1428?igsh=NHpvc3V2ZGg1ajRq", facebook: "https://www.facebook.com/share/1BETE6v8aW/", linkedin: "https://www.linkedin.com/in/satyam-kumar-jha-034381342?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" }  },
    { name: "Harendra Nagar", role: "Executive Member", initials: "HN", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372693/harendra_qx4itd.png", category: "members", socials: { instagram: "https://www.instagram.com/harendranagar75?igsh=MXY1bGc0ODJpd3dtcQ==", facebook: "https://www.facebook.com/share/1Akkd4myTP/", linkedin: "#" }  },
    { name: "Praveen Goyal", role: "Executive Member", initials: "PG", images: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372638/praveen_prm17i.jpg", category: "members", socials: { instagram: "#", facebook: "#", linkedin: "#" }  },
  ];
  const categories = [
    { label: "President", value: "president" },
    { label: "Secretary", value: "secretary" },
    { label: "Heads", value: "heads" },
    { label: "Game Heads", value: "gameheads" },
    { label: "Members", value: "members" },
  ];

  const filteredMembers = members.filter(m => m.category === activeTab);

  const getRoleColor = (role) => {
    if (role.includes("Vice President")) return "bg-secondary/20 text-secondary border-secondary/50";
    if (role.includes("Executive")) return "bg-primary/20 text-primary border-primary/50";
    if (role.includes("President") || role.includes("General Secretary")) return "bg-accent/20 text-accent border-accent/50";
    return "bg-secondary/20 text-secondary border-secondary/50";
  };

  const links = [
    { name: "Instagram", url: "https://www.instagram.com/nits.esports/", icon: <FaInstagram className="text-pink-500 w-5 h-5" />, hoverBg: "hover" },
    { name: "Facebook", url: "https://www.facebook.com/share/171mbHXcSh/", icon: <FaFacebookF className="text-blue-600 w-5 h-5" />, hoverBg: "hover" },
    { name: "WhatsApp", url: "https://chat.whatsapp.com/DAEBfNCeTy8FoLhxaQ5qN1?mode=ems_wa_t", icon: <FaWhatsapp className="text-green-500 w-5 h-5" />, hoverBg: "hover" },
  ];

  const SocialIcon = ({ type }) => {
    const classes = "w-4 h-4";
    if (type === "instagram") return <FaInstagram className={`${classes} text-pink-500`} />;
    if (type === "facebook") return <FaFacebookF className={`${classes} text-blue-600`} />;
    if (type === "linkedin") return <FaLinkedinIn className={`${classes} text-sky-400`} />;
    return null;
  };

  // Unified panel background (hex) to ensure both panels look identical
  const panelBg = "linear-gradient(90deg,#1e1a2d 0%,#05050a 100%)";

  return (
    <div className="min-h-screen pt-24 pb-12 bg-transparent">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-5xl font-bold mb-8 text-gradient">
            Meet Our Team
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs defaultValue="president" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl">
            {/* THIS IS THE MODIFIED LINE */}
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-3 md:gap-20 bg-transparent">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="font-orbitron px-3 py-2 rounded-full border border-primary/30 bg-muted hover:bg-primary/20 data-[state=active]:bg-primary/30 data-[state=active]:border-primary/60 text-sm"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Members Grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-40 mt-20">
          {filteredMembers.map((member) => (
            <div key={member.name} className="TeamCard2 group relative z-0 h-[420px] w-[320px] scale-[.9] overflow-visible mx-2">
              <div className="relative h-full w-full px-6 pt-2 flex items-start justify-center -mt-12">
                <div className="border-1 flex items-center justify-center rounded-lg overflow-hidden w-[230px] h-[300px] transform translate-y-24  transition-transform duration-300 shadow-2xl">
                  <img alt={member.name} loading="lazy" className="h-full w-full object-cover" src={member.images} />
                </div>
              </div>

              {/* Right decorative panel */}
              <div className="z-10 absolute right-0 top-0 text-white rounded-[20px]" style={{minWidth: 300, width: 300, minHeight: 360, height: 360, background: panelBg, clipPath: 'polygon(0% 0%, 66% 0px, 75% 8%, 86% 8%, 100% 16%, 100% 91%, 86% 100%, 85% 22%, 10% 22%, 10% 35%, 0px 28%)', borderRight: '4px solid rgba(255,255,255,0.06)', boxShadow: 'inset -60px 0 60px rgba(0,0,0,0.6)'}}>
                <div className="pt-6 text-center">
                  <h2 className="font-orbitron text-lg font-bold text-white tracking-tight transition-colors duration-200 group-hover:text-primary">
                    {member.name}
                  </h2>
                </div>
                
              </div>

              {/* Bottom-left panel with role and socials */}
              <div className="BottomLeft z-10 absolute bottom-0 left-0 text-white transform transition-transform duration-300 group-hover:-translate-x-4" style={{minWidth:250, width:250, minHeight:250, height:250, border: '1px solid rgba(255,255,255,0.04)', background: panelBg, clipPath: 'polygon(0% 0%, 35% 0px, 35% 42%, 37% 53%, 92% 53%, 100% 64%, 100% 82%, 92% 93%, 78% 93%, 67% 100%, 47% 100%, 41% 93%, 26% 93%, 20% 100%, 4% 100%, 0px 93%)', boxShadow: 'inset -60px 0 60px rgba(0,0,0,0.6)'}}>
                <div className="relative h-full w-full">
                  {/* left vertical role panel */}
                  <div className="absolute left-0 top-0 h-full w-24 -ml-6 flex items-center justify-center transition-colors" >
                    <div style={{transform: 'rotate(-90deg)'}} className="text-white font-orbitron text-sm tracking-wider whitespace-nowrap">
                      {member.role}
                    </div>
                  </div>

                  {/* rotated social icons next to role (hidden until hover) */}
                  <div className="absolute left-16 top-1/2 transform -translate-y-1/2 -ml-2" style={{transformOrigin: 'left top'}}>
                    <div className="flex flex-col items-center gap-3 opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
                      {member.socials && member.socials.instagram && (
                        <a href={member.socials.instagram} target="_blank" rel="noreferrer" className="text-white">
                          <FaInstagram className="w-4 h-4" />
                        </a>
                      )}
                      {member.socials && member.socials.facebook && (
                        <a href={member.socials.facebook} target="_blank" rel="noreferrer" className="text-white">
                          <FaFacebookF className="w-4 h-4" />
                        </a>
                      )}
                      {member.socials && member.socials.linkedin && (
                        <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="text-white">
                          <FaLinkedinIn className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* decorative circle */}
                <div className="absolute right-4 bottom-4 h-20 w-20 rounded-full border-2 border-primary bg-black/30 flex items-center justify-center">
                
                    <img src="https://cdn.builder.io/api/v1/image/assets%2F7d28d0a62ade4f62a35902cb7098ca5d%2F2ff5f3805bfe4bb08a2358768a36cc47?format=webp&width=800" alt="logo" className="h-12 w-12 object-contain" />
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="glass-card border-primary/20 hover:border-primary/50 transition-all text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-orbitron font-bold mb-3">Join Our Community</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connect with fellow gamers and become part of our growing community
              </p>
              <Button onClick={() => setIsJoinModalOpen(true)} className="w-full font-orbitron glow-primary group">
                <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Join Now
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-secondary/20 hover:border-secondary/50 transition-all text-center">
            <CardContent className="pt-6">
              <Mail className="w-8 h-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-orbitron font-bold mb-3">Apply for Membership</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Want to be part of our team? Apply for official membership
              </p>
              <Button onClick={() => setIsApplyModalOpen(true)} variant="outline" className="w-full font-orbitron border-secondary/50 hover:bg-secondary/10">
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Community Join Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 z-[30]">
          <button
            onClick={() => setIsJoinModalOpen(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition"
          >
            ✕
          </button>
          <DialogHeader>
            <DialogTitle className="text-center text-white">Join Our Community</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col mt-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg transition transform bg-secondary/10 border border-secondary/30 text-foreground ${link.hoverBg} hover:scale-105 hover:bg-secondary/20`}
              >
                {link.icon}
                <span className="ml-3 font-medium text-foreground">{link.name}</span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply for Membership Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 z-[30]">
          <button
            onClick={() => setIsApplyModalOpen(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition"
          >
            ✕
          </button>
          <DialogHeader>
            <DialogTitle className="text-center text-white">Apply for Membership</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4 text-gray-100">
            <p>Please send an email to <strong>esports.nits@gmail.com</strong> containing the following details:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-200">
              <li>Your Name</li>
              <li>Your Scholar ID</li>
              <li>Which team you want to join</li>
              <li>What are your skills</li>
              <li>Any prior experience</li>
            </ol>
            <div className="flex gap-2 mt-4">
              <a
                href={`mailto:esports.nits@gmail.com?subject=${encodeURIComponent("Membership Application")}&body=${encodeURIComponent("1. Your Name:%0D%0A2. Your Scholar ID:%0D%0A3. Which team you want to join:%0D%0A4. What are your skills:%0D%0A5. Any prior experience:%0D%0A")}`}
                className="w-full"
              >
                <Button className="w-full">Send Email</Button>
              </a>
              <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;
