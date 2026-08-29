'use client';

import React, { useState, useMemo } from 'react';
import { TacticalShell } from '@/components/layout/TacticalShell';
import {
  calculateThreatScore,
  generateXaiExplanation,
  ThreatAnalysisInput,
  ThreatGauge,
  XaiExplanationCard,
  ThreatSnapshotCard,
  RecentDetectionsTable,
} from '@/components/threat';

type PredefinedScenario = 'CRITICAL_HUMAN' | 'WATCHLIST_VEHICLE' | 'WILDLIFE' | 'STEALTH_INTRUDER' | 'CUSTOM';

export default function ThreatIntelPage() {
  const [activeScenario, setActiveScenario] = useState<PredefinedScenario>('CRITICAL_HUMAN');

  // Interactive Live State
  const [objectType, setObjectType] = useState<ThreatAnalysisInput['objectType']>('HUMAN');
  const [confidence, setConfidence] = useState<number>(0.97);
  const [tripwireBreached, setTripwireBreached] = useState<boolean>(true);
  const [crossingDirection, setCrossingDirection] = useState<ThreatAnalysisInput['crossingDirection']>('INBOUND');
  const [speedMps, setSpeedMps] = useState<number>(2.4);
  const [posture, setPosture] = useState<ThreatAnalysisInput['posture']>('RUNNING');
  const [isRestrictedZone, setIsRestrictedZone] = useState<boolean>(true);
  const [weaponDetected, setWeaponDetected] = useState<boolean>(false);
  const [isBlacklisted, setIsBlacklisted] = useState<boolean>(false);
  const [isNight, setIsNight] = useState<boolean>(true);

  // Scenario Presets
  const applyScenario = (scenario: PredefinedScenario) => {
    setActiveScenario(scenario);
    if (scenario === 'CRITICAL_HUMAN') {
      setObjectType('HUMAN');
      setConfidence(0.97);
      setTripwireBreached(true);
      setCrossingDirection('INBOUND');
      setSpeedMps(2.4);
      setPosture('RUNNING');
      setIsRestrictedZone(true);
      setWeaponDetected(false);
      setIsBlacklisted(false);
      setIsNight(true);
    } else if (scenario === 'WATCHLIST_VEHICLE') {
      setObjectType('VEHICLE');
      setConfidence(0.96);
      setTripwireBreached(false);
      setCrossingDirection('INBOUND');
      setSpeedMps(14.0);
      setPosture('STANDING');
      setIsRestrictedZone(true);
      setWeaponDetected(false);
      setIsBlacklisted(true);
      setIsNight(false);
    } else if (scenario === 'WILDLIFE') {
      setObjectType('ANIMAL');
      setConfidence(0.89);
      setTripwireBreached(true);
      setCrossingDirection('OUTBOUND');
      setSpeedMps(0.8);
      setPosture('STANDING');
      setIsRestrictedZone(false);
      setWeaponDetected(false);
      setIsBlacklisted(false);
      setIsNight(true);
    } else if (scenario === 'STEALTH_INTRUDER') {
      setObjectType('HUMAN');
      setConfidence(0.94);
      setTripwireBreached(true);
      setCrossingDirection('INBOUND');
      setSpeedMps(0.6);
      setPosture('CRAWLING');
      setIsRestrictedZone(true);
      setWeaponDetected(true);
      setIsBlacklisted(false);
      setIsNight(true);
    }
  };

  // Compute live threat analysis & XAI rationale
  const currentInput: ThreatAnalysisInput = useMemo(
    () => ({
      objectType,
      confidence,
      tripwireBreached,
      crossingDirection,
      speedMps,
      posture,
      isRestrictedZone,
      weaponDetected,
      isBlacklisted,
      isNight,
      zoneName: 'Sector 7G Restricted Zone',
      tripwireName: 'Outer Fence Alpha Line',
    }),
    [
      objectType,
      confidence,
      tripwireBreached,
      crossingDirection,
      speedMps,
      posture,
      isRestrictedZone,
      weaponDetected,
      isBlacklisted,
      isNight,
    ]
  );

  const threatResult = useMemo(() => calculateThreatScore(currentInput), [currentInput]);
  const xaiExplanation = useMemo(
    () => generateXaiExplanation(currentInput, threatResult),
    [currentInput, threatResult]
  );

  return (
    <TacticalShell showSidebar={true} sectorId="SECTOR-07" operatorId="OPERATOR-42">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#05070a]">
        {/* Page Header */}
        <div className="border-b border-[#3c494e] pb-3 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#e2e2e8] uppercase tracking-wider">
              THREAT INTELLIGENCE & XAI SCORING ENGINE
            </h1>
            <p className="font-mono text-xs text-[#859399] uppercase mt-1">
              Deterministic Threat Calculator & Explainable AI Causal Analysis (Features 3 & 4)
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#ffb4ab] font-mono text-xs uppercase bg-[#111318] border border-[#3c494e] px-3 py-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                threatResult.severity === 'CRITICAL'
                  ? 'bg-[#ffb4ab] pulse-dot'
                  : threatResult.severity === 'HIGH'
                  ? 'bg-[#feb700]'
                  : 'bg-[#00d1ff]'
              }`}
            />
            <span>ENGINE STATUS: {threatResult.severity} RISK</span>
          </div>
        </div>

        {/* Live Scenario Selector Bar */}
        <div className="bg-[#0f131a] ghost-border p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#bbc9cf] uppercase tracking-wider">
              SIMULATION SCENARIOS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyScenario('CRITICAL_HUMAN')}
                className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeScenario === 'CRITICAL_HUMAN'
                    ? 'bg-[#ffb4ab] text-[#690005] shadow-[0_0_8px_rgba(255,180,171,0.4)]'
                    : 'bg-[#1a1c20] text-[#bbc9cf] border border-[#3c494e] hover:text-white'
                }`}
              >
                1. Human Inbound Breach (95)
              </button>
              <button
                type="button"
                onClick={() => applyScenario('WATCHLIST_VEHICLE')}
                className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeScenario === 'WATCHLIST_VEHICLE'
                    ? 'bg-[#feb700] text-[#412d00] shadow-[0_0_8px_rgba(254,183,0,0.4)]'
                    : 'bg-[#1a1c20] text-[#bbc9cf] border border-[#3c494e] hover:text-white'
                }`}
              >
                2. Watchlist Vehicle (78)
              </button>
              <button
                type="button"
                onClick={() => applyScenario('STEALTH_INTRUDER')}
                className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeScenario === 'STEALTH_INTRUDER'
                    ? 'bg-[#ffb4ab] text-[#690005] shadow-[0_0_8px_rgba(255,180,171,0.4)]'
                    : 'bg-[#1a1c20] text-[#bbc9cf] border border-[#3c494e] hover:text-white'
                }`}
              >
                3. Armed Crawler (98)
              </button>
              <button
                type="button"
                onClick={() => applyScenario('WILDLIFE')}
                className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeScenario === 'WILDLIFE'
                    ? 'bg-[#00d1ff] text-[#003543] shadow-[0_0_8px_rgba(0,209,255,0.4)]'
                    : 'bg-[#1a1c20] text-[#bbc9cf] border border-[#3c494e] hover:text-white'
                }`}
              >
                4. Wildlife Boundary (18)
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('CUSTOM')}
                className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeScenario === 'CUSTOM'
                    ? 'bg-[#a4e6ff] text-black shadow-[0_0_8px_rgba(164,230,255,0.4)]'
                    : 'bg-[#1a1c20] text-[#859399] border border-[#3c494e] hover:text-white'
                }`}
              >
                Custom Tuner
              </button>
            </div>
          </div>

          <div className="font-mono text-[10px] text-[#859399]">
            REACTIVE THREAT SCORE: <span className="text-[#00d1ff] font-bold">{threatResult.score}/100</span>
          </div>
        </div>

        {/* Interactive Custom Tuner (Collapsible/Visible) */}
        {activeScenario === 'CUSTOM' && (
          <div className="bg-[#111318] ghost-border p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-[#bbc9cf]">
            {/* Object Type */}
            <div>
              <label className="block text-[10px] text-[#859399] uppercase mb-1">Target Category</label>
              <select
                value={objectType}
                onChange={(e) => setObjectType(e.target.value as ThreatAnalysisInput['objectType'])}
                className="w-full bg-[#05070a] border border-[#3c494e] p-1.5 rounded text-[#e2e2e8] outline-none"
              >
                <option value="HUMAN">HUMAN</option>
                <option value="VEHICLE">VEHICLE</option>
                <option value="DRONE">DRONE / UAV</option>
                <option value="ANIMAL">ANIMAL</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>

            {/* Confidence Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-[#859399] uppercase mb-1">
                <span>Confidence</span>
                <span className="text-[#00d1ff]">{(confidence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full accent-[#00d1ff]"
              />
            </div>

            {/* Tripwire Crossed */}
            <div>
              <label className="block text-[10px] text-[#859399] uppercase mb-1">Tripwire State</label>
              <button
                type="button"
                onClick={() => setTripwireBreached(!tripwireBreached)}
                className={`w-full py-1.5 rounded font-bold uppercase transition-colors ${
                  tripwireBreached
                    ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                    : 'bg-[#1e2024] text-[#859399] border border-[#3c494e]'
                }`}
              >
                {tripwireBreached ? 'BREACH DETECTED' : 'BOUNDARY CLEAR'}
              </button>
            </div>

            {/* Crossing Direction */}
            <div>
              <label className="block text-[10px] text-[#859399] uppercase mb-1">Direction</label>
              <select
                value={crossingDirection}
                onChange={(e) =>
                  setCrossingDirection(e.target.value as ThreatAnalysisInput['crossingDirection'])
                }
                className="w-full bg-[#05070a] border border-[#3c494e] p-1.5 rounded text-[#e2e2e8] outline-none"
              >
                <option value="INBOUND">INBOUND (TO BORDER)</option>
                <option value="BIDIRECTIONAL">BIDIRECTIONAL</option>
                <option value="OUTBOUND">OUTBOUND</option>
              </select>
            </div>

            {/* Speed */}
            <div>
              <div className="flex justify-between text-[10px] text-[#859399] uppercase mb-1">
                <span>Speed ({speedMps.toFixed(1)} m/s)</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.2"
                value={speedMps}
                onChange={(e) => setSpeedMps(parseFloat(e.target.value))}
                className="w-full accent-[#00d1ff]"
              />
            </div>

            {/* Posture */}
            <div>
              <label className="block text-[10px] text-[#859399] uppercase mb-1">Posture</label>
              <select
                value={posture}
                onChange={(e) => setPosture(e.target.value as ThreatAnalysisInput['posture'])}
                className="w-full bg-[#05070a] border border-[#3c494e] p-1.5 rounded text-[#e2e2e8] outline-none"
              >
                <option value="STANDING">STANDING</option>
                <option value="RUNNING">RUNNING</option>
                <option value="CRAWLING">CRAWLING</option>
                <option value="CROUCHING">CROUCHING</option>
              </select>
            </div>

            {/* Checkbox: Weapon */}
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={weaponDetected}
                onChange={(e) => setWeaponDetected(e.target.checked)}
                className="accent-[#ffb4ab]"
              />
              <span className="text-[11px] text-[#e2e2e8]">Weapon Flag</span>
            </label>

            {/* Checkbox: Watchlist */}
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={isBlacklisted}
                onChange={(e) => setIsBlacklisted(e.target.checked)}
                className="accent-[#feb700]"
              />
              <span className="text-[11px] text-[#e2e2e8]">Watchlist Match</span>
            </label>
          </div>
        )}

        {/* Primary Row: Threat Gauge + XAI Rationale Card + Snapshot Identification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Feature 4: Live Reactive Threat Gauge */}
          <ThreatGauge
            score={threatResult.score}
            severity={threatResult.severity}
            title="REAL-TIME THREAT SCORE"
          />

          {/* Feature 3: Live Dynamic XAI Explanation Card */}
          <XaiExplanationCard
            threatScore={threatResult.score}
            explanation={xaiExplanation}
          />

          {/* Snapshot ID Card */}
          <ThreatSnapshotCard
            facialMatch={
              objectType === 'HUMAN'
                ? {
                    confidence: confidence,
                    title: isBlacklisted ? 'Watchlist Match: Alpha' : 'Suspect #4',
                    subjectId: isBlacklisted ? 'MATCH_WL_0991' : 'UNKNOWN_M_04',
                  }
                : undefined
            }
            anprMatch={
              objectType === 'VEHICLE'
                ? {
                    plateNumber: 'JK-02-AB-1234',
                    flag: isBlacklisted ? 'FLAG: STOLEN / WATCHLIST' : 'CHECKPOST CLEAR',
                  }
                : undefined
            }
          />
        </div>

        {/* Scoring Model Mathematical Proof / Hackathon Explanation Strip */}
        <div className="hud-panel ghost-border p-4 flex flex-col gap-2 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-[#3c494e] pb-2">
            <span className="text-[#00d1ff] font-bold uppercase tracking-wider">
              MATHEMATICAL SCORING MODEL BREAKDOWN (0 - 100 PTS)
            </span>
            <span className="text-[#859399] text-[10px]">
              S_total = S_obj + S_tripwire + S_dir + S_kinematics + S_context
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div className="bg-[#111318] p-2 border border-[#3c494e]">
              <span className="text-[10px] text-[#859399] block">1. OBJECT TYPE</span>
              <span className="text-sm font-bold text-[#a4e6ff]">
                +{threatResult.breakdown.objectScore} pts
              </span>
            </div>
            <div className="bg-[#111318] p-2 border border-[#3c494e]">
              <span className="text-[10px] text-[#859399] block">2. TRIPWIRE BREACH</span>
              <span className="text-sm font-bold text-[#ffb4ab]">
                +{threatResult.breakdown.tripwireScore} pts
              </span>
            </div>
            <div className="bg-[#111318] p-2 border border-[#3c494e]">
              <span className="text-[10px] text-[#859399] block">3. DIRECTION VECTOR</span>
              <span className="text-sm font-bold text-[#feb700]">
                +{threatResult.breakdown.directionScore} pts
              </span>
            </div>
            <div className="bg-[#111318] p-2 border border-[#3c494e]">
              <span className="text-[10px] text-[#859399] block">4. KINEMATIC PROFILE</span>
              <span className="text-sm font-bold text-[#e2e2e8]">
                +{threatResult.breakdown.kinematicScore} pts
              </span>
            </div>
            <div className="bg-[#111318] p-2 border border-[#3c494e]">
              <span className="text-[10px] text-[#859399] block">5. CONTEXT & FLAGS</span>
              <span className="text-sm font-bold text-[#a4e6ff]">
                +{threatResult.breakdown.contextScore} pts
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <RecentDetectionsTable />
      </div>
    </TacticalShell>
  );
}
