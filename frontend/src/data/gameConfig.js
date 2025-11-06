export const gameConfig = {
  bgmi: {
    id: "bgmi",
    name: "BGMI",
    playerCount: 4,
    price: { nits: 100, other: 250 },
  },
  valorant: {
    id: "valorant",
    name: "Valorant",
    playerCount: 5,
    price: { nits: 100, other: 250 },
  },
  freefire: {
    id: "freefire",
    name: "Free Fire",
    playerCount: 4,
    price: { nits: 100, other: 250 },
  },
  codm: {
    id: "codm",
    name: "COD Mobile",
    playerCount: 5,
    price: { nits: 100, other: 250 },
  },
  ml: {
    id: "ml",
    name: "Mobile Legends",
    playerCount: 5,
    price: { nits: 100, other: 250 },
  },
  fifa: {
    id: "fifa",
    name: "FIFA",
    playerCount: 1,
    price: { nits: 100, other: 250 },
  },
  bulletchoe: {
    id: "bulletchoe",
    name: "Bullet Echo",
    playerCount: 3,
    price: { nits: 100, other: 250 },
  },
  clashroyale: {
    id: "clashroyale",
    name: "Clash Royale",
    playerCount: 1,
    price: { nits: 100, other: 250 },
  },
  
};

export const getGameConfig = (gameId) => gameConfig[gameId];
