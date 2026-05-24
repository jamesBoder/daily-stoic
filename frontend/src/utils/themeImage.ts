const THEME_IMAGE_MAP: Record<string, string> = {
  // reason
  mind: 'reason', knowledge: 'reason', intellect: 'reason',
  correspondence: 'reason', clarity: 'reason', discernment: 'reason',
  logic: 'reason', thought: 'reason', understanding: 'reason',
  perspective: 'reason', reflection: 'reason', awareness: 'reason',
  philosophy: 'reason', knowing: 'reason', language: 'reason',
  labels: 'reason', paradox: 'reason', mystery: 'reason',
  attention: 'reason', consciousness: 'reason', contemplation: 'reason',
  // wisdom
  truth: 'wisdom', silence: 'wisdom', divine: 'wisdom', unity: 'wisdom',
  'the One': 'wisdom', being: 'wisdom', wisdom: 'wisdom',
  identity: 'wisdom', self: 'wisdom', solitude: 'wisdom',
  meaning: 'wisdom', purpose: 'wisdom', reality: 'wisdom',
  transcendence: 'wisdom', enlightenment: 'wisdom', learning: 'wisdom',
  education: 'wisdom', teaching: 'wisdom', speech: 'wisdom',
  listening: 'wisdom', presence: 'wisdom', present: 'wisdom',
  'present-moment': 'wisdom', path: 'wisdom', journey: 'wisdom',
  prayer: 'wisdom', meditation: 'wisdom',
  mirror: 'wisdom', tao: 'wisdom', transmission: 'wisdom',
  outcome: 'wisdom', response: 'wisdom', counsel: 'wisdom',
  'self-knowledge': 'wisdom', tomorrow: 'wisdom', future: 'wisdom',
  // virtue
  goodness: 'virtue', soul: 'virtue', beauty: 'virtue',
  perfection: 'virtue', virtue: 'virtue', character: 'virtue',
  integrity: 'virtue', authenticity: 'virtue', honor: 'virtue',
  dignity: 'virtue', deeds: 'virtue', ethics: 'virtue',
  morality: 'virtue', living: 'virtue', flourishing: 'virtue',
  service: 'virtue', generosity: 'virtue', leadership: 'virtue',
  trust: 'virtue', respect: 'virtue', responsibility: 'virtue',
  worth: 'virtue', happiness: 'virtue',
  // discipline
  mastery: 'discipline', readiness: 'discipline', self_discipline: 'discipline',
  'self-mastery': 'discipline', discipline: 'discipline', practice: 'discipline',
  effort: 'discipline', action: 'discipline', skill: 'discipline',
  will: 'discipline', urgency: 'discipline', 'inner-work': 'discipline',
  'intrinsic-motivation': 'discipline', 'self-reliance': 'discipline',
  success: 'discipline', effectiveness: 'discipline', conduct: 'discipline',
  determination: 'discipline', focus: 'discipline', concentration: 'discipline',
  goal: 'discipline', progress: 'discipline',
  // control
  control: 'control', choice: 'control', autonomy: 'control',
  // nature
  vibration: 'nature', rhythm: 'nature', creation: 'nature',
  gender: 'nature', life: 'nature', nature: 'nature',
  'cosmic-order': 'nature', flow: 'nature', spontaneity: 'nature',
  walking: 'nature', wandering: 'nature', water: 'nature',
  world: 'nature', winter: 'nature', body: 'nature', breath: 'nature',
  interconnection: 'nature', 'wu-wei': 'nature',
  // impermanence
  transformation: 'impermanence', eternity: 'impermanence',
  return: 'impermanence', time: 'impermanence', impermanence: 'impermanence',
  change: 'impermanence', 'letting-go': 'impermanence', loss: 'impermanence',
  'non-attachment': 'impermanence', surrender: 'impermanence',
  finitude: 'impermanence', limitation: 'impermanence', age: 'impermanence',
  fate: 'impermanence', transience: 'impermanence', dissolution: 'impermanence',
  // mortality
  mortality: 'mortality', death: 'mortality',
  // courage
  ascent: 'courage', potential: 'courage', freedom: 'courage',
  light: 'courage', courage: 'courage', fearlessness: 'courage',
  rebellion: 'courage', revolt: 'courage', risk: 'courage',
  hope: 'courage', possibility: 'courage', liberation: 'courage',
  dream: 'courage', victory: 'courage',
  'self-belief': 'courage', 'self-trust': 'courage',
  // resilience
  perseverance: 'resilience', resilience: 'resilience',
  'inner-strength': 'resilience', inner_strength: 'resilience',
  struggle: 'resilience', challenge: 'resilience', defeat: 'resilience',
  suffering: 'resilience', grief: 'resilience', despair: 'resilience',
  growth: 'resilience', refuge: 'resilience',
  strength: 'resilience', obstacles: 'resilience',
  // temperance
  equanimity: 'temperance', humility: 'temperance', temperance: 'temperance',
  moderation: 'temperance', patience: 'temperance', serenity: 'temperance',
  peace: 'temperance', stillness: 'temperance', tranquility: 'temperance',
  acceptance: 'temperance', contentment: 'temperance', restraint: 'temperance',
  simplicity: 'temperance', sufficiency: 'temperance', slowness: 'temperance',
  'non-striving': 'temperance', 'non-competition': 'temperance',
  'self-acceptance': 'temperance', desire: 'temperance', anger: 'temperance',
  anxiety: 'temperance', feelings: 'temperance', praise: 'temperance',
  approval: 'temperance', fame: 'temperance', greed: 'temperance',
  wealth: 'temperance', longing: 'temperance', attitude: 'temperance',
  mindfulness: 'temperance', hatred: 'temperance',
  // relationships
  love: 'relationships', relationships: 'relationships', relationship: 'relationships',
  friendship: 'relationships', community: 'relationships', companionship: 'relationships',
  compassion: 'relationships', humanity: 'relationships', solidarity: 'relationships',
  society: 'relationships', others: 'relationships', forgiveness: 'relationships',
  'self-compassion': 'relationships', metta: 'relationships',
  // gratitude
  gratitude: 'gratitude', joy: 'gratitude', abundance: 'gratitude',
  // justice
  law: 'justice', causation: 'justice', polarity: 'justice',
  justice: 'justice', equality: 'justice', 'social-order': 'justice',
  maat: 'justice', blame: 'justice', duty: 'justice',
  karma: 'justice', 'cause-and-effect': 'justice',
}

const VALID_IMAGES = new Set([
  'control', 'courage', 'discipline', 'gratitude', 'impermanence',
  'justice', 'mortality', 'nature', 'reason', 'relationships',
  'resilience', 'temperance', 'virtue', 'wisdom',
])

export function resolveThemeImage(theme: string): string {
  if (!theme) return 'wisdom'
  const mapped = THEME_IMAGE_MAP[theme] ?? theme
  return VALID_IMAGES.has(mapped) ? mapped : 'wisdom'
}

export function quoteCardImageUrl(imageUrl: string | null | undefined, firstTheme: string | undefined): string {
  return imageUrl || `/images/themes/${resolveThemeImage(firstTheme ?? '')}.webp`
}
