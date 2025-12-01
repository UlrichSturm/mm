export function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    funeral: '⚱️',
    cremation: '🔥',
    memorial: '🕯️',
    flowers: '🌸',
    transport: '🚗',
    ceremony: '⛪',
    catering: '🍽️',
    music: '🎵',
  };
  return icons[slug] || '📋';
}

