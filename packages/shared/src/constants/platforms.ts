export const SUPPORTED_PLATFORMS = [
  'whatsapp',
  'instagram',
  'linkedin',
  'twitter',
  'messenger',
  'discord',
  'slack',
  'telegram',
] as const;

export type PlatformId = (typeof SUPPORTED_PLATFORMS)[number];

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  hostname: string;
  priority: 'P0' | 'P1' | 'P2';
}

export const PLATFORMS: PlatformMeta[] = [
  { id: 'whatsapp', name: 'WhatsApp Web', hostname: 'web.whatsapp.com', priority: 'P0' },
  { id: 'instagram', name: 'Instagram', hostname: 'www.instagram.com', priority: 'P0' },
  { id: 'linkedin', name: 'LinkedIn', hostname: 'www.linkedin.com', priority: 'P0' },
  { id: 'twitter', name: 'Twitter/X', hostname: 'x.com', priority: 'P1' },
  { id: 'messenger', name: 'Messenger', hostname: 'www.messenger.com', priority: 'P1' },
  { id: 'discord', name: 'Discord', hostname: 'discord.com', priority: 'P1' },
  { id: 'slack', name: 'Slack', hostname: 'app.slack.com', priority: 'P2' },
  { id: 'telegram', name: 'Telegram Web', hostname: 'web.telegram.org', priority: 'P2' },
];
