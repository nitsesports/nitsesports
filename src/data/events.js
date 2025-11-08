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
        id: "ml",
        name: "Mobile Legends",
        image: mlImg,
        participants: "80",
        gameHead: { name: "Vaibhav Raj", phone: "8434307257" },
        format: "points",
        rankings: [],
      },
      {
        id: "valorant",
        name: "Valorant",
        image: valorantImg,
        participants: "40",
        gameHead: { name: "Sunil Kushwah", phone: "7083644807" },
        format: "points",
        rankings: [],
      },
      {
        id: "codm",
        name: "COD Mobile",
        image: codImg,
        participants: "70",
        gameHead: { name: "Abhishek Kumar", phone: "8877155782" },
        format: "points",
        rankings: [],
      },
      {
        id: "bgmi",
        name: "BGMI",
        image: bgmiImg,
        participants: "124",
        gameHead: { name: "Arkaprovo Mukherjee", phone: "9563136407" },
        format: "points",
        rankings: [],
      },
      {
        id: "freefire",
        name: "Free Fire",
        image: freefireImg,
        participants: "184",
        gameHead: { name: "Suryans Singh", phone: "6307843856" },
        format: "points",
        rankings: [],
      },
    ],
  },
];

export const getEventById = (id) => events.find((e) => e.id === id);
