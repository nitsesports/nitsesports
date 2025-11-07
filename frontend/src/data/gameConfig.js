export const gameConfig = {
  bgmi: {
    id: "bgmi",
    name: "BGMI",
    playerCount: 4,
    price: { nits: 1, other: 2 },
  },
  valorant: {
    id: "valorant",
    name: "Valorant",
    playerCount: 5,
    price: { nits: 1, other: 2 },
  },
  freefire: {
    id: "freefire",
    name: "Free Fire",
    playerCount: 4,
    price: { nits: 1, other: 2 },
  },
  codm: {
    id: "codm",
    name: "COD Mobile",
    playerCount: 5,
    price: { nits: 1, other: 2 },
  },
  ml: {
    id: "ml",
    name: "Mobile Legends",
    playerCount: 5,
    price: { nits: 1, other: 2 },
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
    price: { nits: 1, other: 2 },
  },
  clashroyale: {
    id: "clashroyale",
    name: "Clash Royale",
    playerCount: 1,
    price: { nits: 1, other: 2 },
  },
  
};

export const getGameConfig = (gameId) => gameConfig[gameId];
