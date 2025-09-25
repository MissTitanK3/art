'use client';

export function FrostedSlider({
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full appearance-none h-2 rounded-full bg-white/20 backdrop-blur-sm outline-none transition-all
                 [&::-webkit-slider-thumb]:appearance-none
                 [&::-webkit-slider-thumb]:w-4
                 [&::-webkit-slider-thumb]:h-4
                 [&::-webkit-slider-thumb]:rounded-full
                 [&::-webkit-slider-thumb]:bg-white
                 [&::-webkit-slider-thumb]:shadow
                 [&::-webkit-slider-thumb]:hover:bg-white/90"
    />
  );
}
