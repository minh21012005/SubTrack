'use client';
import { useState } from 'react';

const DOMAIN_MAP: Record<string, string> = {
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  youtube: 'youtube.com',
  google: 'google.com',
  apple: 'apple.com',
  adobe: 'adobe.com',
  chatgpt: 'openai.com',
  openai: 'openai.com',
  github: 'github.com',
  notion: 'notion.so',
  amazon: 'amazon.com',
  prime: 'amazon.com',
  hulu: 'hulu.com',
  disney: 'disneyplus.com',
  disneyplus: 'disneyplus.com',
  microsoft: 'microsoft.com',
  office: 'microsoft.com',
  dropbox: 'dropbox.com',
  figma: 'figma.com',
  canva: 'canva.com',
  slack: 'slack.com',
  zoom: 'zoom.us',
  x: 'x.com',
  twitter: 'twitter.com',
  linkedin: 'linkedin.com',
  jira: 'atlassian.com',
  fpt: 'fptplay.vn',
  vtv: 'vtvgiaitri.vn',
  vieon: 'vieon.vn',
  capcut: 'capcut.com',
  midjourney: 'midjourney.com',
  githubcopilot: 'github.com',
  icloud: 'apple.com',
  tinder: 'tinder.com',
  bumble: 'bumble.com',
};

function guessDomain(name: string) {
  const parts = name.toLowerCase().split(' ');
  const cleanName = parts[0].replace(/[^a-z0-9]/g, '');
  if (DOMAIN_MAP[cleanName]) return DOMAIN_MAP[cleanName];
  if (parts.length > 1) {
    const combined = parts.slice(0, 2).join('').replace(/[^a-z0-9]/g, '');
    if (DOMAIN_MAP[combined]) return DOMAIN_MAP[combined];
  }
  return `${cleanName}.com`;
}

interface BrandLogoProps {
  name: string;
  fallbackColor?: string | null;
  size?: number;
}

export default function BrandLogo({ name, fallbackColor, size = 48 }: BrandLogoProps) {
  const [error, setError] = useState(false);
  const domain = guessDomain(name);
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const color = fallbackColor || 'var(--primary)';

  if (error || !name) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '22%', flexShrink: 0,
        background: `var(--bg)`,
        border: `1px solid var(--border)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 800, color: color,
        textTransform: 'uppercase'
      }}>
        {name ? name.charAt(0) : '?'}
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '22%', flexShrink: 0,
      background: '#fff',
      border: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
    }}>
      <img 
        src={src} 
        alt={`${name} logo`} 
        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10%' }}
        onError={() => setError(true)}
      />
    </div>
  );
}
