import React from 'react';

interface DetectionLog {
  timestamp: string;
  classification: string;
  locationId: string;
  confidence: string;
  status: 'LOGGED' | 'CLEARED' | 'INVESTIGATING';
}

interface RecentDetectionsTableProps {
  logs?: DetectionLog[];
  onExportCsv?: () => void;
  className?: string;
}

export const RecentDetectionsTable: React.FC<RecentDetectionsTableProps> = ({
  logs = [
    {
      timestamp: '14:21:44',
      classification: 'HUMAN_UNAUTH',
      locationId: 'CAM_NOR_04',
      confidence: '98.2%',
      status: 'LOGGED',
    },
    {
      timestamp: '14:18:12',
      classification: 'VEHICLE_KNOWN',
      locationId: 'GATE_SEC_01',
      confidence: '99.9%',
      status: 'CLEARED',
    },
    {
      timestamp: '14:05:03',
      classification: 'ANOMALY_MOTION',
      locationId: 'PERIM_EST_09',
      confidence: '74.5%',
      status: 'INVESTIGATING',
    },
  ],
  onExportCsv,
  className = '',
}) => {
  const statusStyles = {
    LOGGED: 'text-[#ffb4ab] hover:text-[#ffdad6]',
    CLEARED: 'text-[#859399]',
    INVESTIGATING: 'text-[#feb700]',
  };

  const classStyles = {
    HUMAN_UNAUTH: 'text-[#a4e6ff] font-bold',
    VEHICLE_KNOWN: 'text-[#e2e2e8]',
    ANOMALY_MOTION: 'text-[#feb700]',
  };

  return (
    <div className={`hud-panel ghost-border flex flex-col relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-4 border-b border-[#3c494e] bg-[#1a1c20]">
        <span className="font-mono text-xs text-[#e2e2e8] uppercase tracking-widest font-bold">
          RECENT DETECTIONS LOG
        </span>
        <button
          onClick={onExportCsv}
          className="font-mono text-[10px] flex items-center gap-1 text-[#00d1ff] hover:bg-[#00d1ff]/10 px-2.5 py-1 transition-colors border border-[#00d1ff]/30 cursor-pointer"
        >
          EXPORT CSV <span className="material-symbols-outlined text-[12px]">download</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left font-mono text-[13px] whitespace-nowrap">
          <thead className="text-[#859399] border-b border-[#3c494e] bg-[#0c0e12] font-mono text-[10px] tracking-widest">
            <tr>
              <th className="py-3 px-4 font-normal uppercase">TIMESTAMP</th>
              <th className="py-3 px-4 font-normal uppercase">CLASS</th>
              <th className="py-3 px-4 font-normal uppercase">LOCATION ID</th>
              <th className="py-3 px-4 font-normal uppercase">CONFIDENCE</th>
              <th className="py-3 px-4 font-normal uppercase text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-[#bbc9cf]">
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-[#3c494e]/50 hover:bg-[#1e2024] transition-colors"
              >
                <td className="py-3 px-4 text-[#e2e2e8]">{log.timestamp}</td>
                <td
                  className={`py-3 px-4 ${
                    classStyles[log.classification as keyof typeof classStyles] || 'text-[#e2e2e8]'
                  }`}
                >
                  {log.classification}
                </td>
                <td className="py-3 px-4">{log.locationId}</td>
                <td className="py-3 px-4">{log.confidence}</td>
                <td
                  className={`py-3 px-4 text-right font-mono text-xs font-bold tracking-wider ${
                    statusStyles[log.status] || 'text-[#859399]'
                  }`}
                >
                  {log.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
