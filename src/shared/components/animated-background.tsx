'use client'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      {/* Gradient orbs — CSS animations run on GPU compositor, no JS thread */}
      <div className="orb orb-violet" />
      <div className="orb orb-cyan" />
      <div className="orb orb-fuchsia" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <style>{`
        .orb {
          position: absolute;
          border-radius: 9999px;
          will-change: transform;
          filter: blur(80px);
        }
        .orb-violet {
          top: 0;
          left: 25%;
          width: 500px;
          height: 500px;
          background: rgba(124, 58, 237, 0.2);
          animation: orb-move-1 12s linear infinite;
        }
        .orb-cyan {
          bottom: 0;
          right: 25%;
          width: 420px;
          height: 420px;
          background: rgba(8, 145, 178, 0.15);
          animation: orb-move-2 10s linear infinite;
        }
        .orb-fuchsia {
          top: 50%;
          left: 50%;
          width: 600px;
          height: 600px;
          background: rgba(192, 38, 211, 0.1);
          transform: translate(-50%, -50%);
          animation: orb-scale 6s ease-in-out infinite;
        }
        @keyframes orb-move-1 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(80px, -40px); }
        }
        @keyframes orb-move-2 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(-60px, 60px); }
        }
        @keyframes orb-scale {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  )
}
