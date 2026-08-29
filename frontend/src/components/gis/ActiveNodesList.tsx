import React from 'react';

interface CameraNodeItem {
  id: string;
  name: string;
  status: 'CRITICAL' | 'SECURE' | 'OFFLINE';
}

interface ActiveNodesListProps {
  nodes?: CameraNodeItem[];
  onSelectNode?: (nodeId: string) => void;
  className?: string;
}

export const ActiveNodesList: React.FC<ActiveNodesListProps> = ({
  nodes = [
    { id: 'CAM-01', name: 'CAM-01', status: 'CRITICAL' },
    { id: 'CAM-02', name: 'CAM-02', status: 'SECURE' },
    { id: 'CAM-03', name: 'CAM-03', status: 'SECURE' },
  ],
  onSelectNode,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Active Nodes Panel */}
      <div className="bg-[#0f131a]/95 backdrop-blur-md ghost-border flex flex-col">
        <div className="px-4 py-2 border-b border-[#3c494e] font-mono text-[11px] font-bold text-[#bbc9cf] tracking-widest uppercase">
          ACTIVE NODES
        </div>
        <div className="p-2 flex flex-col gap-1.5">
          {nodes.map((node) => {
            const isCritical = node.status === 'CRITICAL';
            return (
              <div
                key={node.id}
                onClick={() => onSelectNode?.(node.id)}
                className={`flex justify-between items-center p-2.5 transition-all cursor-pointer ${
                  isCritical
                    ? 'bg-[#93000a]/20 border border-[#ffb4ab]/30 glow-alert'
                    : 'hover:bg-[#1e2024] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isCritical ? 'text-[#ffb4ab] pulse-dot' : 'text-[#4cd6ff]'
                    }`}
                  >
                    videocam
                  </span>
                  <span className={isCritical ? 'text-[#ffb4ab] font-bold' : 'text-[#e2e2e8]'}>
                    {node.name}
                  </span>
                </div>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    isCritical
                      ? 'text-[#ffb4ab] bg-[#ffb4ab]/10'
                      : 'text-[#4cd6ff]'
                  }`}
                >
                  {node.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Analyzing Panel */}
      <div className="bg-[#0f131a]/95 backdrop-blur-md ghost-border h-24 flex flex-col">
        <div className="px-4 py-2 border-b border-[#3c494e] font-mono text-[11px] font-bold text-[#bbc9cf] tracking-widest uppercase">
          STATUS
        </div>
        <div className="flex-1 flex items-center px-4 gap-4">
          <div className="w-7 h-7 rounded-full border-2 border-[#3c494e] border-t-[#00d1ff] animate-spin" />
          <div className="font-mono text-xs text-[#bbc9cf] leading-tight uppercase">
            ANALYZING THREAT
            <br />
            <span className="text-[#00d1ff]">VECTORS IN SECTOR 7</span>
          </div>
        </div>
      </div>
    </div>
  );
};
