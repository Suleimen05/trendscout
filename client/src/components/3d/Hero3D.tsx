import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Zap,
  BarChart3,
  Users,
  Bot,
  Video,
  Target
} from 'lucide-react';

const icons = [
  { Icon: Sparkles, label: 'AI Analysis', color: '#3b82f6' },
  { Icon: TrendingUp, label: 'Viral Score', color: '#8b5cf6' },
  { Icon: Zap, label: 'Instant', color: '#f97316' },
  { Icon: BarChart3, label: 'Analytics', color: '#10b981' },
  { Icon: Users, label: 'Community', color: '#f43f5e' },
  { Icon: Bot, label: 'AI Assistant', color: '#6366f1' },
  { Icon: Video, label: 'Scripts', color: '#d946ef' },
  { Icon: Target, label: 'Targeting', color: '#0ea5e9' },
];

interface OrbitalItemProps {
  icon: typeof icons[0];
  index: number;
  total: number;
  rotation: number;
  mouseY: any;
}

const OrbitalItem = ({ icon, index, total, rotation, mouseY }: OrbitalItemProps) => {
  // Calculate position on the orbit
  const angle = (index / total) * 360;
  const radius = 280;

  // 3D transform for orbital position
  const rotateY = angle + rotation;
  const translateZ = radius;

  // Mouse parallax effect - reduced sensitivity for smoother movement
  const rotateXMouse = useSpring(useTransform(mouseY, [-400, 400], [8, -8]), {
    stiffness: 80,  // Reduced stiffness for smoother movement
    damping: 30     // Increased damping for stability
  });

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d"
      style={{
        rotateY: rotateY,
        translateZ: translateZ,
        rotateX: rotateXMouse,
      }}
    >
      <motion.div
        className="relative group"
        style={{
          rotateY: -rotateY, // Counter-rotate to keep icon facing outward
        }}
        whileHover={{ scale: 1.1, z: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"
          style={{ backgroundColor: icon.color }}
        />

        {/* Icon container */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${icon.color}40 0%, ${icon.color}20 100%)`,
            border: `1px solid ${icon.color}40`,
            boxShadow: `0 8px 32px ${icon.color}30`,
          }}
        >
          <icon.Icon
            className="w-8 h-8 text-white drop-shadow-lg"
            style={{ filter: `drop-shadow(0 2px 4px ${icon.color}50)` }}
          />

          {/* Label tooltip */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
              {icon.label}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mouse tracking - only for the carousel
  const mouseY = useMotionValue(0);

  // Auto-rotation animation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    mouseY.set(e.clientY - centerY);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Orbital ring container - this is what tilts with mouse */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: rotation,
        }}
        transition={{
          duration: 0.05,
          ease: 'linear',
        }}
      >
        {/* Orbital icons - these get the mouse tilt effect */}
        {icons.map((icon, index) => (
          <OrbitalItem
            key={index}
            icon={icon}
            index={index}
            total={icons.length}
            rotation={rotation}
            mouseY={mouseY}
          />
        ))}
      </motion.div>

      {/* Floating particles around the orbit */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1'][i],
          }}
          animate={{
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 350, 0],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 200, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default Hero3D;
