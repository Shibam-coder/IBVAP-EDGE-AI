import React from 'react';

interface ThreatSnapshotCardProps {
  facialMatch?: {
    confidence: number;
    title: string;
    subjectId: string;
    imageUrl?: string;
  };
  anprMatch?: {
    plateNumber: string;
    flag: string;
    imageUrl?: string;
  };
  className?: string;
}

export const ThreatSnapshotCard: React.FC<ThreatSnapshotCardProps> = ({
  facialMatch = {
    confidence: 0.87,
    title: 'Suspect #4',
    subjectId: 'UNKNOWN_M_04',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPYAGIJX-QijwTZWLHtzBr3lFlW7pmhnpnCxx73gI858oPiiX_R2TVsX8gN-jayliyW73zzB2k1WJFeaXx8owXY2BT5TD0izGLvUN7D6-0cqBxysPYQYcpTBbpTWhuYZ7ibwEsB1XCk59p5hlrQ__wVMnfX6v97AeaAHXIJA21I4X1TAF1ddmdO7NNmJqjROWqd4Plce7MrWOd9SZtHJSoLniCckSxrAJobnr1LHZHku0Xkcql0Kwqnw',
  },
  anprMatch = {
    plateNumber: 'JK-02-AB-1234',
    flag: 'FLAG: STOLEN',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC0FAlXmsGmeS-m1VkNn_585z3kx9sdjdXEgyZhQf2nRfqNWS1iBId9aeiViqZhK--TSNQUlUUWPynIhLGDqK2-44QrJ_nqs_hett1Ck5jXwqA5VZrU3A7xGOT0VD9IEB4ZryCuQCtN86Jl45QULD70YRhipSPjMeTQwHj3BvtbDKSN2XNwp9-LdHOW9ecsBd4K968N9v_8lbGQPc9j2ADgMphJ6aqNGah42PdTqvhjhtZ5mT2Un3SSDw',
  },
  className = '',
}) => {
  return (
    <div className={`bg-[#0f131a] ghost-border flex flex-col gap-2 p-2 ${className}`}>
      {/* Facial Match */}
      {facialMatch && (
        <div className="border border-[#3c494e] bg-[#111318] p-2 flex gap-3">
          <div className="w-16 h-16 bg-[#1e2024] shrink-0 border border-[#3c494e]/50 relative overflow-hidden">
            {facialMatch.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={facialMatch.imageUrl}
                alt={facialMatch.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#859399]">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
            )}
            <div className="absolute inset-0 border border-[#ffb4ab]/50" />
          </div>

          <div className="flex flex-col justify-between flex-1">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] text-[#00d1ff] font-bold uppercase">
                FACIAL MATCH
              </span>
              <span className="font-mono text-[10px] bg-[#1e2024] px-1 text-[#e2e2e8]">
                {(facialMatch.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="font-sans text-sm font-semibold text-[#e2e2e8] leading-tight">
              {facialMatch.title}
            </div>
            <div className="font-mono text-[9px] text-[#bbc9cf]">
              ID: {facialMatch.subjectId}
            </div>
          </div>
        </div>
      )}

      {/* ANPR Match */}
      {anprMatch && (
        <div className="border border-[#3c494e] bg-[#111318] p-2 flex gap-3">
          <div className="w-16 h-10 bg-[#1e2024] shrink-0 border border-[#3c494e]/50 mt-1 overflow-hidden">
            {anprMatch.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={anprMatch.imageUrl}
                alt="License Plate Capture"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#859399]">
                <span className="material-symbols-outlined text-lg">directions_car</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between flex-1">
            <span className="font-mono text-[10px] text-[#00d1ff] font-bold uppercase">
              ANPR READOUT
            </span>
            <div className="font-mono text-sm text-[#e2e2e8] font-bold tracking-wider">
              {anprMatch.plateNumber}
            </div>
            <div className="font-mono text-[9px] text-[#ffb4ab] flex items-center gap-1 font-bold">
              {anprMatch.flag}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
