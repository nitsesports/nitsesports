export const gameConfig = {
  bgmi: {
    id: "bgmi",
    name: "BGMI",
    playerCount: 4,
    substituteCount: 1,
    price: { nits: 0, other: 0 },
  },
  rc: {
    id: "rc",
    name: "Real Cricket",
    playerCount: 1,
    substituteCount: 0,
    price: { nits: 0, other: 0 },
  },
  valorant: {
    id: "valorant",
    name: "Valorant",
    playerCount: 5,
    substituteCount: 1,
    price: { nits: 100, other: 200 },
  },
  freefire: {
    id: "freefire",
    name: "Free Fire",
    playerCount: 4,
    substituteCount: 1,
    price: { nits: 100, other: 200 },
  },
  codm: {
    id: "codm",
    name: "COD Mobile",
    playerCount: 5,
    substituteCount: 1,
    price: { nits: 100, other: 250 },
  },
  ml: {
    id: "ml",
    name: "Mobile Legends",
    playerCount: 5,
    substituteCount: 1,
    price: { nits: 100, other: 200 },
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
    substituteCount: 1,
    price: { nits: 100, other: 250 },
  },
  
};

export const getGameConfig = (gameId) => gameConfig[gameId];
