import { useEffect, useRef } from "react";

/**
 * NeuronCorner
 * A 3×3 lattice of neurons tucked into a corner. Nodes idle with a faint glow;
 * every so often one "fires", sending a bright pulse along an edge to a
 * neighbour and leaving a fading light-streak behind — echoing the synaptic
 * field in the reference image. Purely decorative, drawn on a canvas, and it
 * respects prefers-reduced-motion.
 */

interface Node {
  gx: number; // grid col 0..2
  gy: number; // grid row 0..2
  x: number;
  y: number;
  glow: number; // 0..1 current brightness
}

interface Pulse {
  from: number;
  to: number;
  t: number; // 0..1 progress
  speed: number;
}

const SIZE = 132; // canvas px (square)
const PAD = 18;

export function NeuronCorner() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const step = (SIZE - PAD * 2) / 2;
    const nodes: Node[] = [];
    for (let gy = 0; gy < 3; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        nodes.push({
          gx,
          gy,
          x: PAD + gx * step,
          y: PAD + gy * step,
          glow: 0.12,
        });
      }
    }

    // Edges connect orthogonal + diagonal neighbours in the lattice.
    const edges: [number, number][] = [];
    const idx = (gx: number, gy: number) => gy * 3 + gx;
    for (let gy = 0; gy < 3; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        const a = idx(gx, gy);
        const neigh: [number, number][] = [
          [gx + 1, gy],
          [gx, gy + 1],
          [gx + 1, gy + 1],
          [gx - 1, gy + 1],
        ];
        for (const [nx, ny] of neigh) {
          if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3) {
            edges.push([a, idx(nx, ny)]);
          }
        }
      }
    }

    const pulses: Pulse[] = [];
    let streaks: { x1: number; y1: number; x2: number; y2: number; a: number }[] =
      [];
    let raf = 0;
    let lastFire = 0;

    const fire = (now: number) => {
      lastFire = now;
      const start = (Math.random() * nodes.length) | 0;
      const options = edges.filter((e) => e[0] === start || e[1] === start);
      if (!options.length) return;
      const [a, b] = options[(Math.random() * options.length) | 0];
      const from = a === start ? a : b;
      const to = a === start ? b : a;
      nodes[from].glow = 1;
      pulses.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.02 });
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Resting edges — the faint web.
      ctx.lineWidth = 0.6;
      for (const [a, b] of edges) {
        ctx.strokeStyle = "rgba(138,180,255,0.06)";
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      }

      // Fading streaks left by past pulses.
      streaks = streaks.filter((s) => s.a > 0.01);
      for (const s of streaks) {
        ctx.strokeStyle = `rgba(207,224,255,${s.a})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
        s.a *= 0.9;
      }

      // Active pulses travelling along their edge.
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += reduce ? 1 : p.speed;
        const a = nodes[p.from];
        const b = nodes[p.to];
        const x = a.x + (b.x - a.x) * Math.min(p.t, 1);
        const y = a.y + (b.y - a.y) * Math.min(p.t, 1);

        const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(1, "rgba(138,180,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (p.t >= 1) {
          nodes[p.to].glow = 1;
          streaks.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, a: 0.5 });
          pulses.splice(i, 1);
        }
      }

      // Nodes.
      for (const n of nodes) {
        if (!reduce) n.glow += (0.12 - n.glow) * 0.05; // decay to rest
        const r = 1.6 + n.glow * 2.4;
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        halo.addColorStop(0, `rgba(207,224,255,${0.25 + n.glow * 0.5})`);
        halo.addColorStop(1, "rgba(207,224,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${0.5 + n.glow * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce && now - lastFire > 520 + Math.random() * 900) fire(now);
      raf = requestAnimationFrame(draw);
    };

    if (reduce) {
      // One static frame with a couple of lit nodes.
      nodes[4].glow = 0.8;
      nodes[2].glow = 0.6;
      draw(0);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={{ width: SIZE, height: SIZE }}
    />
  );
}
