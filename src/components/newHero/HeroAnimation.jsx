import { useEffect, useRef } from "react";

// Colors
const COLOR = "#FFFFFF";
const HIT_COLOR = "#3a3a3a";
const BALL_COLOR = "#FFFFFF";
const PADDLE_COLOR = "#FFFFFF";

const LETTER_SPACING = 1;

// Pixel map
const PIXEL_MAP = {
  " ": [[0]],

  N: [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
  I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],

  S: [[1,1,1,1],[1,0,0,0],[1,1,1,1],[0,0,0,1],[1,1,1,1]],
  L: [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  C: [[1,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  H: [[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  A: [[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],

  E: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  P: [[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,0,0,0],[1,0,0,0]],
  O: [[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
  R: [[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,0,1,0],[1,0,0,1]],
  U: [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
  B: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
};

export default function HeroAnimation() {
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const paddlesRef = useRef([]);
  const ballRef = useRef({});
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const isMobile = window.innerWidth < 768;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      init(isMobile);
    };

    const init = (isMobile) => {
      const words = ["NIT SILCHAR", "ESPORTS CLUB"];

      const playfieldHeight = isMobile
      ? canvas.height * 0.55   
      : canvas.height;

      const playfieldTop = (canvas.height - playfieldHeight) / 2;
      const playfieldBottom = playfieldTop + playfieldHeight;


      pixelsRef.current = [];

      const BASE_PIXEL =
  Math.min(canvas.width, canvas.height) *
  (isMobile ? 0.012 : 0.015);
 
     const LARGE = BASE_PIXEL * (isMobile ? 1.4 : 1.7);
     const SMALL = BASE_PIXEL * (isMobile ? 1.0 : 1.2);


      const calcWidth = (word, size) =>
        word.split("").reduce((w, ch) => {
          const width = PIXEL_MAP[ch]?.[0].length ?? 0;
          return w + width * size + LETTER_SPACING * size;
        }, 0) - LETTER_SPACING * size;

      const hBlock = PIXEL_MAP["A"].length;
      const h1 = hBlock * LARGE;
      const h2 = hBlock * SMALL;
      const gap = BASE_PIXEL * 3;

      const effectiveHeight = isMobile ? canvas.height * 0.65 : canvas.height;

      let startY = playfieldTop + (playfieldHeight - (h1 + gap + h2)) / 2;

      if (isMobile) {
        startY += canvas.height * 0.05;
      }


      const drawWord = (word, size) => {
        let x = (canvas.width - calcWidth(word, size)) / 2;

        for (let ch of word) {
          if (ch === " ") {
            x += size * 3;
            continue;
          }

          const map = PIXEL_MAP[ch];
          if (!map) continue;

          map.forEach((row, r) =>
            row.forEach((v, c) => {
              if (v) {
                pixelsRef.current.push({
                  x: x + c * size,
                  y: startY + r * size,
                  size,
                  hit: false,
                });
              }
            })
          );

          x += (map[0].length + LETTER_SPACING) * size;
        }
      };

      drawWord(words[0], LARGE);
      startY += h1 + gap;
      drawWord(words[1], SMALL);

      const SPEED = isMobile
                    ? BASE_PIXEL * 0.6
                    : Math.min(canvas.width, canvas.height) * 0.015 * 0.5;



      ballRef.current = {
        x: canvas.width * 0.5,
        y: playfieldTop + playfieldHeight * 0.35,
        dx: SPEED,
        dy: SPEED,
        r: BASE_PIXEL * 0.7,
      };

      const paddleLength = BASE_PIXEL * (isMobile ? 10 : 12);
      const thickness = BASE_PIXEL * (isMobile ? 1 : 1.2);


      paddlesRef.current = [
  // Left paddle
  {
    x: 0,
    y: playfieldTop + playfieldHeight / 2 - paddleLength / 2,
    w: thickness,
    h: paddleLength,
    v: true,
  },

  // Right paddle
  {
    x: canvas.width - thickness,
    y: playfieldTop + playfieldHeight / 2 - paddleLength / 2,
    w: thickness,
    h: paddleLength,
    v: true,
  },

  // Top paddle (moved DOWN on mobile)
  {
    x: canvas.width / 2 - paddleLength / 2,
    y: isMobile ? playfieldTop + playfieldHeight * 0.08 : playfieldTop,
    w: paddleLength,
    h: thickness,
    v: false,
  },

  // Bottom paddle (moved UP on mobile)
  {
    x: canvas.width / 2 - paddleLength / 2,
    y: playfieldBottom - thickness,
    w: paddleLength,
    h: thickness,
    v: false,
  },
];


    };

    const update = () => {
      const ball = ballRef.current;
      const canvas = canvasRef.current;

      if (!canvas || !ball) return;

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.dx *= -1;
      if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.dy *= -1;

      paddlesRef.current.forEach((p) => {
        if (p.v) p.y += (ball.y - p.h / 2 - p.y) * 0.12;
        else p.x += (ball.x - p.w / 2 - p.x) * 0.12;

        if (
          ball.x + ball.r > p.x &&
          ball.x - ball.r < p.x + p.w &&
          ball.y + ball.r > p.y &&
          ball.y - ball.r < p.y + p.h
        ) {
          if (p.v) ball.dx *= -1;
          else ball.dy *= -1;
        }
      });

      pixelsRef.current.forEach((pix) => {
        if (
          !pix.hit &&
          ball.x + ball.r > pix.x &&
          ball.x - ball.r < pix.x + pix.size &&
          ball.y + ball.r > pix.y &&
          ball.y - ball.r < pix.y + pix.size
        ) {
          pix.hit = true;
          ball.dy *= -1;
        }
      });
    };

    const draw = () => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height); // TRANSPARENT BG

      pixelsRef.current.forEach((pix) => {
        ctx.fillStyle = pix.hit ? HIT_COLOR : COLOR;
        ctx.fillRect(pix.x, pix.y, pix.size, pix.size);
      });

      const ball = ballRef.current;
      ctx.fillStyle = BALL_COLOR;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PADDLE_COLOR;
      paddlesRef.current.forEach((p) => ctx.fillRect(p.x, p.y, p.w, p.h));
    };

    const loop = () => {
      update();
      draw();
      animationIdRef.current = requestAnimationFrame(loop);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    loop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
  <canvas
    ref={canvasRef}
    className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
  />
);

}
