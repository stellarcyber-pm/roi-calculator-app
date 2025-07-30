import React, { useState, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { useColorScheme } from '@mui/joy/styles';

interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  size?: number;
}

export const CircularSlider: React.FC<KnobProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  label,
  size = 300
}) => {
  const { mode } = useColorScheme();
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Convert value to rotation angle (225-135 degrees, 270-degree range)
  const valueToRotation = useCallback((val: number) => {
    const percentage = (val - min) / (max - min);
    // Start at 225 degrees, go clockwise to 135 degrees
    // This creates a 270-degree range (225 -> 360 -> 135)
    // Add 60 degrees to compensate for coordinate system offset
    // Add 180 degrees to fix the flip
    // Subtract 17.5 degrees to fix the 15-20 degree advancement
    return 140 - (percentage * 272);
  }, [min, max]);

  // Convert rotation angle to value
  const rotationToValue = useCallback((rotation: number) => {
    // Normalize rotation to 0-360 range
    let normalizedRotation = rotation;
    while (normalizedRotation < 0) normalizedRotation += 360;
    while (normalizedRotation >= 360) normalizedRotation -= 360;

    // Apply the same 60-degree offset compensation, 180-degree flip correction, and 17.5-degree advancement fix
    const adjustedRotation = normalizedRotation - 140;
    let adjustedNormalized = adjustedRotation;
    while (adjustedNormalized < 0) adjustedNormalized += 360;
    while (adjustedNormalized >= 360) adjustedNormalized -= 360;

    // Convert to our 225-135 degree range
    let angleInRange;
    if (adjustedNormalized >= 135 && adjustedNormalized <= 225) {
      // Direct range
      angleInRange = 225 - adjustedNormalized;
    } else if (adjustedNormalized > 225) {
      // Wrapped around (225 -> 360 -> 135)
      angleInRange = 225 + (360 - adjustedNormalized);
    } else {
      // Below 135, treat as continuation
      angleInRange = 225 + (135 - adjustedNormalized);
    }

    const percentage = angleInRange / 270;
    const rawValue = min + (percentage * (max - min));
    return Math.round(rawValue / step) * step;
  }, [min, max, step]);

  // Update knob rotation
  const updateKnobRotation = useCallback((newValue: number) => {
    if (indicatorRef.current) {
      const rotation = valueToRotation(newValue);
      indicatorRef.current.style.transform = `translateZ(0) rotate(${-rotation}deg)`;
    }
  }, [valueToRotation]);

  // Get event point relative to knob
  const getEventPoint = (ev: MouseEvent | TouchEvent) => {
    if (!knobRef.current) return { x: 0, y: 0 };

    const rect = knobRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in ev && ev.touches.length) {
      clientX = ev.touches[0].clientX;
      clientY = ev.touches[0].clientY;
    } else if ('clientX' in ev) {
      clientX = ev.clientX;
      clientY = ev.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX + (document.body.scrollLeft || 0) - rect.left,
      y: clientY + (document.body.scrollTop || 0) - rect.top
    };
  };

  // Check if point is within circle
  const inCircle = (p: { x: number; y: number }, r: number) => {
    const x = r - p.x;
    const y = r - p.y;
    return x * x + y * y <= r * r;
  };

  // Check if click is on the input field
  const isClickOnInput = (ev: React.MouseEvent | React.TouchEvent) => {
    const target = ev.target as HTMLElement;
    return target.tagName === 'INPUT' || target.closest('input');
  };

  // Get angle from point
  const getDeg = (p: { x: number; y: number }, r: number) => {
    let a = r - p.x;
    const b = r - p.y;
    const c = Math.sqrt(a * a + b * b);

    if (b < 0) {
      a = -a;
    }

    let deg = Math.asin(a / c) * (180 / Math.PI);

    if (b < 0) {
      deg += 180;
    }

    // Return full 360-degree range, let rotationToValue handle the mapping
    return deg;
  };

  // Handle pointer change
  const handlePointerChange = useCallback((ev: MouseEvent | TouchEvent) => {
    if (!knobRef.current) return;

    const r = knobRef.current.offsetWidth * 0.5;
    const p = getEventPoint(ev);

    // Outside the circle, ignore
    if (!inCircle(p, r)) {
      return;
    }

    const deg = getDeg(p, r);
    const newValue = rotationToValue(deg);

    if (newValue !== value) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  }, [value, min, max, onChange, rotationToValue]);

  // Handle mouse/touch events
  const handleMouseDown = (ev: React.MouseEvent) => {
    // Don't start dragging if clicking on the input field
    if (isClickOnInput(ev)) return;

    const p = getEventPoint(ev.nativeEvent);
    const r = knobRef.current?.offsetWidth ? knobRef.current.offsetWidth * 0.5 : 0;

    if (!inCircle(p, r)) return;

    ev.preventDefault();
    setIsDragging(true);
    if (indicatorRef.current) {
      indicatorRef.current.classList.add('dragged');
    }
  };

  const handleTouchStart = (ev: React.TouchEvent) => {
    // Don't start dragging if touching the input field
    if (isClickOnInput(ev)) return;

    const p = getEventPoint(ev.nativeEvent);
    const r = knobRef.current?.offsetWidth ? knobRef.current.offsetWidth * 0.5 : 0;

    if (!inCircle(p, r)) return;

    ev.preventDefault();
    setIsDragging(true);
    if (indicatorRef.current) {
      indicatorRef.current.classList.add('dragged');
    }
  };

  const handleMouseMove = useCallback((ev: MouseEvent) => {
    if (isDragging) {
      ev.preventDefault();
      handlePointerChange(ev);
    }
  }, [isDragging, handlePointerChange]);

  const handleTouchMove = useCallback((ev: TouchEvent) => {
    if (isDragging) {
      ev.preventDefault();
      handlePointerChange(ev);
    }
  }, [isDragging, handlePointerChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (indicatorRef.current) {
      indicatorRef.current.classList.remove('dragged');
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (indicatorRef.current) {
      indicatorRef.current.classList.remove('dragged');
    }
  }, []);

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(ev.target.value) || min;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  // Update rotation when value changes
  useEffect(() => {
    updateKnobRotation(value);
  }, [value, updateKnobRotation]);

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const isDark = mode === 'dark';
  const knobSize = size;
  const handleSize = knobSize * 0.9;
  const inputSize = knobSize * 0.33;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography level="body-sm" sx={{ color: isDark ? '#ffffff' : '#111827', mb: 1 }}>
        {label}
      </Typography>

      <Box
        ref={knobRef}
        sx={{
          width: knobSize,
          height: knobSize,
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        // onWheel={handleWheel}
      >
        {/* Knob Label (background) */}
        <Box
          sx={{
            boxShadow: 'inset 0 5px 3px -1px rgba(0, 0, 0, 0.15)',
            display: 'block',
            width: knobSize,
            height: knobSize,
            borderRadius: '50%',
            position: 'relative',
            top: 0,
            left: 0,
            zIndex: 0,
            background: isDark
              ? 'linear-gradient(180deg, #3b82f6, #1e40af, #0e2a6a)'
              : 'linear-gradient(180deg, #99ccff, #668899, #003366)',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: knobSize - 20,
              height: knobSize - 20,
              borderRadius: '50%',
              top: 10,
              left: 10,
              background: isDark ? '#1a1a1a' : '#eee',
              transform: 'rotate(90deg)',
            },
          }}
        />

        {/* Knob Handle */}
        <Box
          sx={{
            pointerEvents: 'none',
            width: handleSize,
            height: handleSize,
            background: isDark ? '#4b5563' : '#ddd',
            backgroundImage: isDark
              ? 'linear-gradient(#6b7280, #4b5563)'
              : 'linear-gradient(#eeeeee, #cccccc)',
            border: 0,
            left: '50%',
            top: '50%',
            margin: `-${handleSize / 2}px 0 0 -${handleSize / 2}px`,
            display: 'block',
            position: 'absolute',
            zIndex: 1,
            borderRadius: '50%',
            boxShadow: '0 3px 6px -3px #000, inset 0 -5px 5px -5px #000, inset 0 5px 5px -5px #fff',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              borderRadius: '50%',
              width: handleSize * 0.65,
              height: handleSize * 0.65,
              marginLeft: `-${handleSize * 0.325}px`,
              marginTop: `-${handleSize * 0.325}px`,
              background: isDark ? '#6b7280' : '#f2f2f2',
              boxShadow: isDark
                ? 'inset 0 -50px 50px 15px #4b5563, 0 -5px 10px -5px #6b7280, 0 1px 3px -1px rgba(0, 0, 0, 0.35)'
                : 'inset 0 -50px 50px 15px #dadada, 0 -5px 10px -5px #fefefe, 0 1px 3px -1px rgba(0, 0, 0, 0.35)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              borderRadius: '50%',
              width: handleSize * 0.58,
              height: handleSize * 0.58,
              background: isDark ? '#4b5563' : '#ddd',
              marginLeft: `-${handleSize * 0.29}px`,
              marginTop: `-${handleSize * 0.29}px`,
              boxShadow: isDark
                ? 'inset 0 -10px 15px -5px rgba(0, 0, 0, 0.25), inset 0 10px 25px -10px #6b7280, 0 25px 50px rgba(0, 0, 0, 0.25), 0 5px 5px -5px rgba(0, 0, 0, 0.35), 0 15px 10px -6px rgba(0, 0, 0, 0.3), 0 25px 15px -7px rgba(0, 0, 0, 0.25), 0 35px 20px -8px rgba(0, 0, 0, 0.2), 0 45px 25px -9px rgba(0, 0, 0, 0.15), 0 55px 30px -10px rgba(0, 0, 0, 0.1)'
                : 'inset 0 -10px 15px -5px rgba(0, 0, 0, 0.25), inset 0 10px 25px -10px #fff, 0 25px 50px rgba(0, 0, 0, 0.25), 0 5px 5px -5px rgba(0, 0, 0, 0.35), 0 15px 10px -6px rgba(0, 0, 0, 0.3), 0 25px 15px -7px rgba(0, 0, 0, 0.25), 0 35px 20px -8px rgba(0, 0, 0, 0.2), 0 45px 25px -9px rgba(0, 0, 0, 0.15), 0 55px 30px -10px rgba(0, 0, 0, 0.1)',
            }
          }}
        />

        {/* Knob Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            transition: 'color 1s',
            position: 'absolute',
            zIndex: 10,
            top: '50%',
            left: '50%',
            width: inputSize,
            height: inputSize,
            margin: `-${inputSize / 2}px 0 0 -${inputSize / 2}px`,
            padding: 0,
            color: isDark ? '#9ca3af' : '#ccc',
            fontFamily: 'Inter, sans-serif',
            fontSize: inputSize * 0.32,
            textAlign: 'center',
            textShadow: isDark
              ? '0 1px 1px #374151, 0 -1px 1px #6b7280'
              : '0 1px 1px #fff, 0 -1px 1px #ccc',
            background: 'none',
            border: 0,
            borderRadius: '50%',
            outline: 'none',
            cursor: 'text',
            pointerEvents: 'auto',
            boxShadow: isDark
              ? '0 1px 2px -1px #6b7280, 0 -1px 2px -1px #374151, inset 0 -1px 2px -1px #6b7280, inset 0 1px 2px -1px #374151'
              : '0 1px 2px -1px #fff, 0 -1px 2px -1px #ccc, inset 0 -1px 2px -1px #fff, inset 0 1px 2px -1px #ccc',
          }}
          onFocus={(e) => {
            e.target.style.transition = 'color 0.25s ease-out';
            e.target.style.color = isDark ? '#9ca3af' : '#999';
          }}
          onBlur={(e) => {
            e.target.style.transition = 'color 1s';
            e.target.style.color = isDark ? '#9ca3af' : '#ccc';
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />

        {/* Knob Indicator */}
        <Box
          ref={indicatorRef}
          sx={{
            transform: 'translateZ(0)',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: knobSize * 0.47,
            height: knobSize * 0.47,
            margin: `-${knobSize * 0.235}px 0 0 -${knobSize * 0.235}px`,
            zIndex: 1,
            borderRadius: '50%',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
            transition: 'all 0.25s',
            '&.dragged': {
              transition: 'all 0s',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '50%',
              top: 0,
              border: '6px solid transparent',
              borderTop: 0,
              borderBottomColor: 'rgba(255, 255, 255, 0.5)',
            }
          }}
        />
      </Box>
    </Box>
  );
};
