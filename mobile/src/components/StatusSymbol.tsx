import React from 'react';
import Svg, { Line } from 'react-native-svg';

export interface StatusSymbolProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Reusable 8-ray open-center geometric status emblem.
 * Used project-wide across financial status badges, headers, and branding
 * in place of generic AI sparkle stars.
 */
export const StatusSymbol: React.FC<StatusSymbolProps> = ({
  size = 14,
  color = '#64748B',
  strokeWidth = 2.3,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={16.0} y1={12.0} x2={21.5} y2={12.0} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={14.83} y1={14.83} x2={18.72} y2={18.72} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={12.0} y1={16.0} x2={12.0} y2={21.5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={9.17} y1={14.83} x2={5.28} y2={18.72} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={8.0} y1={12.0} x2={2.5} y2={12.0} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={9.17} y1={9.17} x2={5.28} y2={5.28} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={12.0} y1={8.0} x2={12.0} y2={2.5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={14.83} y1={9.17} x2={18.72} y2={5.28} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};
