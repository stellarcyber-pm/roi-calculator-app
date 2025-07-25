import React, { useState } from 'react';
import Box from '@mui/joy/Box';

interface PieChartData {
  name: string;
  value: number;
  color: string;
  description?: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 400,
  strokeWidth = 80
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  let currentAngle = -90; // Start from top

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const createArc = (startAngle: number, endAngle: number, color: string, index: number) => {
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRadians);
    const y1 = center + radius * Math.sin(startRadians);
    const x2 = center + radius * Math.cos(endRadians);
    const y2 = center + radius * Math.sin(endRadians);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    // Calculate center point of the slice for tooltip positioning
    const midAngle = (startAngle + endAngle) / 2;
    const midRadians = (midAngle * Math.PI) / 180;
    const tooltipRadius = radius * 0.7; // Position tooltip at 70% of radius
    let tooltipX = center + tooltipRadius * Math.cos(midRadians);
    let tooltipY = center + tooltipRadius * Math.sin(midRadians);

    // Adjust tooltip position to keep it within bounds
    const tooltipWidth = 160;
    const tooltipHeight = 90;
    const margin = 10;

    if (tooltipX - tooltipWidth / 2 < margin) {
      tooltipX = margin + tooltipWidth / 2;
    } else if (tooltipX + tooltipWidth / 2 > size - margin) {
      tooltipX = size - margin - tooltipWidth / 2;
    }

    if (tooltipY - tooltipHeight < margin) {
      tooltipY = margin + tooltipHeight;
    } else if (tooltipY + tooltipHeight / 2 > size - margin) {
      tooltipY = size - margin - tooltipHeight / 2;
    }

    return (
      <path
        key={index}
        d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill={color}
        stroke="white"
        strokeWidth="2"
        onMouseEnter={(e) => {
          setHoveredSlice(index);
          setTooltipPosition({ x: tooltipX, y: tooltipY });
        }}
        onMouseLeave={() => setHoveredSlice(null)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = currentAngle;
          const endAngle = currentAngle + (percentage * 360) / 100;

          const arc = createArc(startAngle, endAngle, item.color, index);
          currentAngle = endAngle;

          return <React.Fragment key={index}>{arc}</React.Fragment>;
        })}

        {/* Center circle for donut effect */}
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2}
          fill="white"
        />

        {/* Tooltip */}
        {hoveredSlice !== null && (
          <g className="tooltip">
            <rect
              x={tooltipPosition.x - 80}
              y={tooltipPosition.y - 70}
              width={160}
              height={90}
              rx={8}
              fill="rgba(0, 0, 0, 0.9)"
              stroke="white"
              strokeWidth="1"
            />
            <text
              x={tooltipPosition.x}
              y={tooltipPosition.y - 45}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="600"
            >
              {data[hoveredSlice].name}
            </text>
            <text
              x={tooltipPosition.x}
              y={tooltipPosition.y - 25}
              textAnchor="middle"
              fill="#4ECDC4"
              fontSize="11"
              fontWeight="600"
            >
              {formatCurrency(data[hoveredSlice].value)}
            </text>
            <text
              x={tooltipPosition.x}
              y={tooltipPosition.y - 5}
              textAnchor="middle"
              fill="#FFEAA7"
              fontSize="10"
            >
              {((data[hoveredSlice].value / total) * 100).toFixed(1)}% of total
            </text>
            {data[hoveredSlice].description && (
              <text
                x={tooltipPosition.x}
                y={tooltipPosition.y + 15}
                textAnchor="middle"
                fill="#CBD5E0"
                fontSize="9"
              >
                {data[hoveredSlice].description}
              </text>
            )}
          </g>
        )}
      </svg>
    </Box>
  );
};
