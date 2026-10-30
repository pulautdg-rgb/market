import React, { useMemo } from 'react';
import { encodeCode128B } from '../../utils/barcodeUtils';

interface BarcodeSvgProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
  color?: string;
  textColor?: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  height = 42,
  barWidth = 1.6,
  showText = true,
  className = '',
  color = '#000000',
  textColor = '#000000'
}) => {
  const cleanValue = value ? value.trim() : 'SMK-000000';

  const bitSequence = useMemo(() => {
    return encodeCode128B(cleanValue);
  }, [cleanValue]);

  const totalWidth = bitSequence.length * barWidth;
  const quietZone = 10 * barWidth;
  const svgWidth = totalWidth + quietZone * 2;
  const svgHeight = height + (showText ? 16 : 0);

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full h-auto"
        shapeRendering="crispEdges"
      >
        <g transform={`translate(${quietZone}, 0)`}>
          {bitSequence.split('').map((bit, idx) => {
            if (bit === '1') {
              return (
                <rect
                  key={idx}
                  x={idx * barWidth}
                  y={0}
                  width={barWidth}
                  height={height}
                  fill={color}
                />
              );
            }
            return null;
          })}
        </g>

        {showText && (
          <text
            x={svgWidth / 2}
            y={height + 12}
            textAnchor="middle"
            fill={textColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="1.2px"
          >
            {cleanValue}
          </text>
        )}
      </svg>
    </div>
  );
};
