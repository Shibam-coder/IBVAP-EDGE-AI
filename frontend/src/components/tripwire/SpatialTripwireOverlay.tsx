'use client';

import React, { useState, useRef, useCallback } from 'react';
import { TripwireZone, Point2D, TripwireDirection, SeverityLevel } from '@/types';

export interface SpatialTripwireOverlayProps {
  /** List of tripwires to display */
  tripwires: TripwireZone[];
  /** Whether the user is currently drawing a new tripwire */
  isDrawing?: boolean;
  /** Active selected tripwire ID */
  selectedTripwireId?: string | null;
  /** Callback when a new tripwire is created by drawing */
  onTripwireCreated?: (newTripwire: Omit<TripwireZone, 'id'>) => void;
  /** Callback when a tripwire is clicked */
  onTripwireSelect?: (tripwireId: string) => void;
  /** Optional custom drawing direction */
  drawDirection?: TripwireDirection;
  /** Optional custom drawing severity */
  drawSeverity?: SeverityLevel;
  /** Optional container class name */
  className?: string;
  /** Whether to show breach pulse animation */
  hasActiveBreach?: boolean;
}

export const SpatialTripwireOverlay: React.FC<SpatialTripwireOverlayProps> = ({
  tripwires,
  isDrawing = false,
  selectedTripwireId = null,
  onTripwireCreated,
  onTripwireSelect,
  drawDirection = 'INBOUND',
  drawSeverity = 'CRITICAL',
  className = '',
  hasActiveBreach = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<Point2D[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<Point2D | null>(null);

  // Helper to convert mouse event to normalized 0..1 coordinates
  const getNormalizedCoordinates = useCallback((e: React.MouseEvent<SVGSVGElement>): Point2D => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const point = getNormalizedCoordinates(e);

    if (drawingPoints.length === 0) {
      // First point of new tripwire
      setDrawingPoints([point]);
    } else {
      // Second point completes the 2-point tripwire line
      const fullPoints = [...drawingPoints, point];
      setDrawingPoints([]);
      setCurrentMousePos(null);

      if (onTripwireCreated) {
        onTripwireCreated({
          cameraId: 'CAM-01',
          name: `Tripwire Zone ${tripwires.length + 1}`,
          points: fullPoints,
          direction: drawDirection,
          isActive: true,
          severity: drawSeverity,
          color: drawSeverity === 'CRITICAL' ? '#ff2d55' : drawSeverity === 'HIGH' ? '#feb700' : '#00d1ff',
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || drawingPoints.length === 0) return;
    setCurrentMousePos(getNormalizedCoordinates(e));
  };

  const getColorBySeverity = (severity: SeverityLevel, defaultColor?: string) => {
    if (defaultColor) return defaultColor;
    switch (severity) {
      case 'CRITICAL':
        return '#ff2d55';
      case 'HIGH':
        return '#feb700';
      case 'MEDIUM':
        return '#ffdb9d';
      default:
        return '#00d1ff';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg
        ref={svgRef}
        className={`w-full h-full ${isDrawing ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-auto'}`}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <defs>
          {/* Glowing filter for tactical laser/tripwire effect */}
          <filter id="laser-glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="laser-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Existing Tripwire Lines */}
        {tripwires.map((tw) => {
          if (!tw.points || tw.points.length < 2) return null;
          const p1 = tw.points[0];
          const p2 = tw.points[1];
          const x1 = p1.x * 1000;
          const y1 = p1.y * 1000;
          const x2 = p2.x * 1000;
          const y2 = p2.y * 1000;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const isSelected = selectedTripwireId === tw.id;
          const isBreached = hasActiveBreach && tw.severity === 'CRITICAL';
          const strokeColor = getColorBySeverity(tw.severity, tw.color);

          // Normal angle for directional indicator
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const normalAngle = angle + Math.PI / 2;
          const arrowLen = 25;
          const arrowX = midX + Math.cos(normalAngle) * arrowLen;
          const arrowY = midY + Math.sin(normalAngle) * arrowLen;

          return (
            <g
              key={tw.id}
              className="cursor-pointer transition-opacity hover:opacity-100"
              onClick={() => onTripwireSelect?.(tw.id)}
            >
              {/* Outer Glow Halo */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={isBreached ? 8 : 4}
                strokeOpacity={isBreached ? 0.4 : 0.2}
                strokeDasharray={isBreached ? '12 6' : undefined}
                className={isBreached ? 'animate-pulse' : ''}
              />

              {/* Main Tripwire Line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={tw.direction === 'BIDIRECTIONAL' ? '8 4' : '16 4 4 4'}
                filter={strokeColor === '#ff2d55' ? 'url(#laser-glow-red)' : 'url(#laser-glow-cyan)'}
              />

              {/* Start Point Node */}
              <circle cx={x1} cy={y1} r={isSelected ? 6 : 4} fill={strokeColor} />
              <circle cx={x1} cy={y1} r={8} stroke={strokeColor} strokeWidth={1} fill="none" opacity={0.6} />

              {/* End Point Node */}
              <circle cx={x2} cy={y2} r={isSelected ? 6 : 4} fill={strokeColor} />
              <circle cx={x2} cy={y2} r={8} stroke={strokeColor} strokeWidth={1} fill="none" opacity={0.6} />

              {/* Direction Indicator Chevrons */}
              {tw.direction !== 'BIDIRECTIONAL' && (
                <line
                  x1={midX}
                  y1={midY}
                  x2={arrowX}
                  y2={arrowY}
                  stroke={strokeColor}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}

              {/* Label & Severity Badge overlay */}
              <foreignObject
                x={Math.max(10, Math.min(820, midX - 90))}
                y={Math.max(10, Math.min(940, midY - 28))}
                width="200"
                height="32"
                className="overflow-visible pointer-events-none"
              >
                <div className="flex items-center gap-1 bg-[#111318]/90 border border-[#3c494e] px-2 py-0.5 rounded shadow-lg backdrop-blur-md w-max">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: strokeColor }}
                  />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#e2e2e8]">
                    {tw.name}
                  </span>
                  <span
                    className="font-mono text-[8px] font-bold px-1 rounded uppercase ml-1"
                    style={{
                      backgroundColor: `${strokeColor}25`,
                      color: strokeColor,
                      border: `1px solid ${strokeColor}60`,
                    }}
                  >
                    {tw.direction}
                  </span>
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Live In-Progress Drawing Line */}
        {isDrawing && drawingPoints.length > 0 && currentMousePos && (
          <g>
            <line
              x1={drawingPoints[0].x * 1000}
              y1={drawingPoints[0].y * 1000}
              x2={currentMousePos.x * 1000}
              y2={currentMousePos.y * 1000}
              stroke="#00d1ff"
              strokeWidth={2}
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            {/* Start Node */}
            <circle
              cx={drawingPoints[0].x * 1000}
              cy={drawingPoints[0].y * 1000}
              r={6}
              fill="#00d1ff"
            />
            {/* Live End Node */}
            <circle
              cx={currentMousePos.x * 1000}
              cy={currentMousePos.y * 1000}
              r={5}
              fill="#00d1ff"
              opacity={0.8}
            />
          </g>
        )}
      </svg>

      {/* Drawing mode tactical HUD helper banner */}
      {isDrawing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#111318]/95 border border-[#00d1ff] text-[#00d1ff] px-4 py-1.5 rounded shadow-xl backdrop-blur-md flex items-center gap-2 font-mono text-xs z-30 pointer-events-none animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#00d1ff]" />
          <span>
            {drawingPoints.length === 0
              ? 'CLICK TO PLACE START POINT OF VIRTUAL TRIPWIRE'
              : 'CLICK TO COMPLETE TRIPWIRE BOUNDARY'}
          </span>
        </div>
      )}
    </div>
  );
};
