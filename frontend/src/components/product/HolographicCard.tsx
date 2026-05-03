import React, { useRef } from 'react';

export interface HolographicCardItem {
  title: string;
  imageUrl: string;
}

interface HolographicCardProps {
  item: HolographicCardItem;
  showGlitter?: boolean;
  effect?: 'glitter' | 'sparkle' | 'wave' | 'clean';
}

export function HolographicCard({ item, showGlitter = false, effect = showGlitter ? 'glitter' : 'clean' }: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();

  const setCardVars = (mx: number, my: number, rx: number, ry: number) => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty('--mx', `${mx}%`);
    card.style.setProperty('--my', `${my}%`);
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;
    const ry = ((x / rect.width) - 0.5) * 18;
    const rx = -(((y / rect.height) - 0.5) * 18);

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => setCardVars(mx, my, rx, ry));
  };

  const handlePointerLeave = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setCardVars(50, 50, 0, 0);
  };

  return (
    <div
      ref={cardRef}
      className="holo-card"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        '--mx': '50%',
        '--my': '50%',
        '--rx': '0deg',
        '--ry': '0deg',
      } as React.CSSProperties}
    >
      <div className="holo-card__inner">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="holo-card__foil" />
        {effect === 'glitter' && <div className="holo-card__glitter" />}
        {effect === 'sparkle' && <div className="holo-card__sparkle" />}
        {effect === 'wave' && <div className="holo-card__wave" />}
        <div className="holo-card__shine" />
      </div>
    </div>
  );
}
