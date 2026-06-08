import { useAuthStore } from '@/store/auth-store';

// Use relative API path - Nginx proxies /api/ to backend on port 4000
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface NodeProps {
  x: number;
  y: number;
  size: string;
  delay: number;
  color: string;
}

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

interface WiFiSignalProps {
  x: number;
  y: number;
  delay: number;
}

interface ParticleConfig {
  count: number;
  speed: number;
  sizeMin: number;
  sizeMax: number;
}

interface AnimationSpeed {
  nodeDuration: number;
  lineDuration: number;
  wifiDuration: number;
  particleDuration: number;
}

interface CTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

interface TrustIndicator {
  text: string;
  visible: boolean;
}

export interface HeroSettings {
  badge: {
    text: string;
    visible: boolean;
  };
  headline: string;
  headlineHighlight: string;
  subheadline: string;
  ctaButtons: CTAButton[];
  trustIndicators: TrustIndicator[];
  backgroundGradient: string;
  nodes: NodeProps[];
  connectionLines: ConnectionLineProps[];
  wifiSignals: WiFiSignalProps[];
  particleConfig: ParticleConfig;
  animationSpeed: AnimationSpeed;
  height?: string;
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const response = await fetch(`${API_URL}/hero/settings`);
  if (!response.ok) {
    throw new Error('Failed to fetch hero settings');
  }
  return response.json();
}

export async function updateHeroSettings(settings: Partial<HeroSettings>): Promise<HeroSettings> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_URL}/hero/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to update hero settings');
  }
  return response.json();
}

export async function resetHeroSettings(): Promise<HeroSettings> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_URL}/hero/settings/reset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to reset hero settings');
  }
  return response.json();
}
