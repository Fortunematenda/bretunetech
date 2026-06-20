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
    position?: {
      horizontal: 'left' | 'center' | 'right';
      vertical: 'top' | 'center' | 'bottom';
    };
  };
  headline: string;
  headlineHighlight: string;
  headlinePosition?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
  headlineHighlightPosition?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
  subheadline: string;
  subheadlinePosition?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
  ctaButtons: CTAButton[];
  ctaButtonsPosition?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
  trustIndicators: TrustIndicator[];
  trustIndicatorsPosition?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
  backgroundGradient: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  contentImageUrl?: string;
  contentImagePosition?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
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

export async function uploadHeroImage(file: File): Promise<{ url: string }> {
  const token = useAuthStore.getState().token;
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/hero/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
}
