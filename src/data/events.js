import valorantImg from "@/assets/valorant.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import mlImg from "@/assets/ml.jpg";
import freefireImg from "@/assets/freefire.jpg";
import codImg from "@/assets/cod.jpg";

export const events = [
  {
    id: "vanguardarena",
    title: "Vanguard Arena",
    date: "Nov 21, 2025 - Nov 23, 2025",
    location: "Online",
    status: "upcoming",
    prize: "₹100,000",
    image: "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
    games: [
      {
        id: "bgmi",
        name: "BGMI",
        image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372612/bgmi_lxvrnt.jpg",
        participants: "#",
        gameHead: { name: "Arkaprovo Mukherjee", phone: "9563136407" },
        format: "points",
        rankings: [],
        prize: "25000",
        brochure: "https://gamma.app/docs/VANGUARD-ARENA-i71v4n1968gk240",
      },
      {
        id: "rc",
        name: "Real Cricket 24",
        image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1766304221/KRAFTON.jpg_ms0hab.webp",
        participants: "#",
        gameHead: { name: "Arkaprovo Mukherjee", phone: "9563136407" },
        format: "points",
        rankings: [],
        prize: "5000",
        brochure: "https://gamma.app/docs/VANGUARD-xpmguxeg1uuld3q",
      },
      
      {
        id: "valorant",
        name: "Valorant",
        image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372668/valorant_qxje8q.jpg",
        participants: "#",
        gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
        format: "points",
        rankings: [],
        prize: "5000",
        brochure: "https://gamma.app/docs/Vanguard-Arena-zrpooho817957yj",
      },
      {
        id: "ml",
        name: "Mobile Legends",
        image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372633/ml_h8honj.jpg",
        participants: "#",
        gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
        format: "points",
        rankings: [],
        prize: "5000",
        brochure: "https://gamma.app/docs/TECNOESIS-CUP-mlbb-h5oottx9xnwqnet",
      },
      {
        id: "fifa",
        name: "FIFA 25",
        image:  "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372618/FIFA_tzgbj9.jpg",
        participants: "#",
        gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
        format: "points",
        rankings: [],
        prize: "5000",
        brochure: "https://gamma.app/docs/TECNOESIS-CUP-mlbb-h5oottx9xnwqnet",
      },
      
    ],
  },
  {
    id: "ficfreefire",
    title: "FreeFire Tournament",
    date: "JAN 19, 2026 - JAN 22, 2026",
    location: "Online",
    status: "upcoming",
    prize: "₹10,000",
    image: "https://cdn.builder.io/api/v1/image/assets%2F778be80571eb4edd92c70f9fecab8fab%2F8efd1aa0a2864beeb58f62fed4425fdd?format=webp&width=1200",
    games: [
      {
        id: "freefire",
        name: "FREEFIRE",
        image: "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372616/freefire_uutecs.jpg",
        participants: "#",
        gameHead: { name: "Suryans Singh", phone: "6307843856" },
        format: "points",
        rankings: [],
        prize: 10000,
        brochure: "https://gamma.app/docs/VANGUARD-ARENA-aei2y0ivstdkaww",
      },
      
      
    ],
  },
];

export const getEventById = (id) => events.find((e) => e.id === id);
