// ─── PARTICLE CANVAS ───
export function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.008 + 0.003,
      hue: Math.random() > 0.7 ? 260 : 0,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      p.pulse += p.pulseSpeed;

      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;
      if (p.y < -5) p.y = canvas.height + 5;
      if (p.y > canvas.height + 5) p.y = -5;

      const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      const color = p.hue === 260
        ? `hsla(260, 70%, 72%, ${currentOpacity})`
        : `hsla(0, 0%, 90%, ${currentOpacity})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
}
