import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  showDetails = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return '#22C55E'; // Emerald green
    if (s >= 70) return '#3B82F6'; // Blue
    if (s >= 50) return '#EAB308'; // Amber
    return '#EF4444'; // Red
  };

  const getGrade = (s: number) => {
    if (s >= 95) return 'A+';
    if (s >= 85) return 'A';
    if (s >= 75) return 'B+';
    if (s >= 65) return 'B';
    if (s >= 50) return 'C';
    if (s >= 35) return 'D';
    return 'F';
  };

  const getRiskLabel = (s: number) => {
    if (s >= 85) return 'Low Risk Posture';
    if (s >= 70) return 'Moderate Risk Posture';
    if (s >= 50) return 'Elevated Risk Posture';
    return 'Severe Vulnerability Risk';
  };

  const color = getColor(clampedScore);
  const grade = getGrade(clampedScore);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1C2331"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>

        {/* Center score & grade */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
            {clampedScore}
          </span>
          <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
            OUT OF 100
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 mt-1 rounded border font-mono"
            style={{ color, borderColor: `${color}66`, backgroundColor: `${color}15` }}
          >
            GRADE: {grade}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="text-center mt-3 max-w-xs">
          <p className="text-sm font-medium text-text-main">{getRiskLabel(clampedScore)}</p>
          <p className="text-[11px] text-text-muted mt-1 leading-tight">
            Proprietary synthetic risk score calculated across headers, TLS, cookies, and exposure metrics. Not a legal or operational guarantee of security.
          </p>
        </div>
      )}
    </div>
  );
};
