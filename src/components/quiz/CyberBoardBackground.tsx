import React, { useEffect, useRef } from "react";

interface CyberBoardBackgroundProps {
  progress: number;
}

export function CyberBoardBackground({ progress }: CyberBoardBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);

  // Keep latest progress accessible to the rAF loop without re-creating it.
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    
    // Pulse object definition
    interface Pulse {
      pathIndex: number;
      progress: number; // 0 to 1 (from edge to center)
      speed: number;
      length: number;
    }

    interface PathSegment {
      x: number;
      y: number;
    }

    let paths: PathSegment[][] = [];
    let pulses: Pulse[] = [];

    const generatePaths = () => {
      paths = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const numPaths = 24; // Number of traces

      for (let i = 0; i < numPaths; i++) {
        const angle = (Math.PI * 2 * i) / numPaths + (Math.random() * 0.2 - 0.1);
        const segments: PathSegment[] = [];
        
        // Start from center
        let currX = centerX;
        let currY = centerY;
        segments.push({ x: currX, y: currY });

        // Generate zig-zag motherboard traces outwards
        const steps = 5 + Math.floor(Math.random() * 5);
        let currentAngle = angle;

        for (let j = 0; j < steps; j++) {
          const dist = 40 + Math.random() * 60;
          // Snap to 45 degree increments for that motherboard look
          const snappedAngle = Math.round(currentAngle / (Math.PI / 4)) * (Math.PI / 4);
          currX += Math.cos(snappedAngle) * dist;
          currY += Math.sin(snappedAngle) * dist;
          segments.push({ x: currX, y: currY });
          
          // Randomly turn 45 degrees left or right
          currentAngle = snappedAngle + (Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4);
        }
        // Reverse path so index 0 is the outer edge and last index is center
        paths.push(segments.reverse());
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      generatePaths();
    };

    window.addEventListener("resize", resize);
    resize();

    const spawnPulse = () => {
      if (paths.length === 0) return;
      pulses.push({
        pathIndex: Math.floor(Math.random() * paths.length),
        progress: 0,
        // Base speed plus extra speed based on global loading progress
        speed: 0.005 + Math.random() * 0.01 + (progress / 100) * 0.01,
        length: 0.1 + Math.random() * 0.15
      });
    };

    let lastTime = 0;

    const render = (time: number) => {
      // Calculate delta time
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw base traces
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(204, 0, 0, 0.15)"; // Faint red for base traces
      
      paths.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      });

      // Update and draw pulses
      // More pulses spawn as progress increases
      const prog = progressRef.current;
      const spawnRate = prog < 100 ? 0.2 + (prog / 100) * 0.5 : 0.05;
      if (Math.random() < spawnRate) {
        spawnPulse();
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed * (dt / 16.6); // Normalize speed

        if (p.progress > 1) {
          pulses.splice(i, 1);
          continue;
        }

        const path = paths[p.pathIndex];
        
        // Find segment for current progress
        const getPointAtProgress = (prog: number) => {
          const clampedProg = Math.max(0, Math.min(1, prog));
          const totalSegments = path.length - 1;
          const exactIndex = clampedProg * totalSegments;
          const index = Math.floor(exactIndex);
          const remainder = exactIndex - index;
          
          if (index >= totalSegments) return path[path.length - 1];
          
          const p1 = path[index];
          const p2 = path[index + 1];
          return {
            x: p1.x + (p2.x - p1.x) * remainder,
            y: p1.y + (p2.y - p1.y) * remainder
          };
        };

        const head = getPointAtProgress(p.progress);
        const tail = getPointAtProgress(p.progress - p.length);

        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);

        // Cheap fake-glow: a wide low-alpha stroke under the sharp core.
        // Replaces ctx.shadowBlur which forces CPU-side rasterization on Android.
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(204, 0, 0, 0.25)";
        ctx.lineWidth = 8;
        ctx.stroke();

        // Sharp core with the original gradient (white leading edge → red tail).
        const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        grad.addColorStop(0, "rgba(204, 0, 0, 0)");
        grad.addColorStop(0.8, "rgba(204, 0, 0, 0.8)");
        grad.addColorStop(1, "rgba(255, 255, 255, 1)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-60 z-[-1]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
