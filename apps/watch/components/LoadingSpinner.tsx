'use client';

export default function LoadingSpinner({ size = 64, text = 'Scanning…' }: { size?: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pulsing circle */}
        <div className="absolute inset-0 rounded-full border-4 border-green-400 opacity-75 animate-radar-ping" />


        {/* Central static dot */}
        <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
      </div>

      {text && <p className="text-sm text-green-700 animate-pulse">{text}</p>}

      <style jsx>{`
        @keyframes radar-ping {
          0% {
            transform: scale(0.25);
            opacity: 0.75;
          }
          80% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .animate-radar-ping {
          animation: radar-ping 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
