// src/features/traditions/constants.ts
// Single source of truth for tradition metadata used across TraditionBrowser,
// TraditionPage, AuthorPage, and PassageCard.

// ── Per-slug metadata (TraditionBrowser / TraditionPage) ─────────────────────

export const META: Record<string, {
  description: string
  tagline: string       // one short sentence for the hero
  icon: string
  accent: string        // CSS rgba for icon circle bg (light)
  accentDark: string    // CSS rgba for icon circle bg (dark)
  era: string           // historical span
}> = {
  stoicism: {
    description: 'Virtue, reason, and living according to nature — the bedrock of Greco-Roman wisdom.',
    tagline: 'Live according to reason. Accept what you cannot change. Master what you can.',
    icon: '⊕',
    accent: 'rgba(139,115,85,0.18)',
    accentDark: 'rgba(212,168,83,0.18)',
    era: 'c. 300 BCE – 200 CE',
  },
  hermeticism: {
    description: 'The Seven Hermetic Principles — As Above, So Below. The Emerald Tablet speaks.',
    tagline: 'The universe is mental. Every law above is mirrored below.',
    icon: '✦',
    accent: 'rgba(110,70,160,0.18)',
    accentDark: 'rgba(180,120,255,0.18)',
    era: 'c. 1st–3rd century CE',
  },
  neoplatonism: {
    description: 'The emanation of the One into Being, Intellect, and Soul — Plotinus, Porphyry, Proclus.',
    tagline: 'All things flow from the One and seek return to it through contemplation.',
    icon: '◎',
    accent: 'rgba(180,145,50,0.18)',
    accentDark: 'rgba(240,195,70,0.20)',
    era: 'c. 3rd–5th century CE',
  },
  gnosticism: {
    description: 'Gnosis — direct knowledge of the divine spark within, liberation from matter.',
    tagline: 'You carry a fragment of divine light. Awakening to it is the only freedom.',
    icon: '✧',
    accent: 'rgba(150,50,60,0.18)',
    accentDark: 'rgba(220,80,100,0.18)',
    era: 'c. 1st–4th century CE',
  },
  kabbalah: {
    description: 'The Tree of Life, Sefirot, and the infinite nature of Ein Sof.',
    tagline: 'Ein Sof pours into ten emanations. The map of creation is the map of the soul.',
    icon: '✡',
    accent: 'rgba(40,80,180,0.18)',
    accentDark: 'rgba(80,140,255,0.20)',
    era: 'c. 12th century CE – present',
  },
  pythagoreanism: {
    description: 'Number as the principle of all things — harmony, proportion, and the music of the spheres.',
    tagline: 'Number is the essence of reality. Harmony is the law of all things.',
    icon: '△',
    accent: 'rgba(40,140,130,0.18)',
    accentDark: 'rgba(60,200,180,0.18)',
    era: 'c. 570–400 BCE',
  },
  'pre-socratic': {
    description: 'The first seekers — Heraclitus, Parmenides, Anaximander — asking what everything is made of.',
    tagline: 'Before Socrates, the Greeks asked the hardest question: what is everything made of?',
    icon: '∞',
    accent: 'rgba(180,90,30,0.18)',
    accentDark: 'rgba(240,130,50,0.20)',
    era: 'c. 600–400 BCE',
  },
  'african-philosophy': {
    description: 'Ubuntu, Maat, and the deep wisdom traditions of the African continent.',
    tagline: 'I am because we are. The self is woven from community, ancestors, and cosmos.',
    icon: '◇',
    accent: 'rgba(160,80,30,0.18)',
    accentDark: 'rgba(220,130,60,0.20)',
    era: 'Ancient – present',
  },
  'renaissance-philosophy': {
    description: 'Montaigne, Bacon, Spinoza — reason, humanism, and the revival of ancient thought.',
    tagline: 'The Renaissance mind recovered antiquity and turned it into a new way of seeing.',
    icon: '☿',
    accent: 'rgba(60,120,60,0.18)',
    accentDark: 'rgba(90,180,90,0.20)',
    era: '14th–17th century CE',
  },
  transcendentalism: {
    description: 'The Over-Soul, self-reliance, and the sacred in nature — Emerson and beyond.',
    tagline: 'Divinity lives in each soul. Nature is the scripture. Self-reliance is the practice.',
    icon: '☀',
    accent: 'rgba(60,130,180,0.18)',
    accentDark: 'rgba(90,170,240,0.20)',
    era: '19th century CE',
  },
  buddhism: {
    description: 'The Four Noble Truths, the Eightfold Path, and the art of living without grasping.',
    tagline: 'Suffering has a cause. The cause can end. The path is already within you.',
    icon: '☸',
    accent: 'rgba(130,80,160,0.18)',
    accentDark: 'rgba(190,120,240,0.20)',
    era: 'c. 6th century BCE – present',
  },
  taoism: {
    description: 'The Tao that cannot be named — wu wei, effortless action, and returning to the root.',
    tagline: 'Flow with what is. Act without forcing. Return always to the still center.',
    icon: '☯',
    accent: 'rgba(50,140,100,0.18)',
    accentDark: 'rgba(70,200,140,0.20)',
    era: 'c. 6th century BCE – present',
  },
  vedanta: {
    description: 'Advaita — non-duality. Brahman is real, the world is appearance, the Self is unlimited.',
    tagline: 'You are not the body, not the mind. You are the awareness in which all things arise.',
    icon: '◉',
    accent: 'rgba(180,120,40,0.18)',
    accentDark: 'rgba(240,170,60,0.20)',
    era: 'c. 800 BCE – present',
  },
  existentialism: {
    description: 'Existence precedes essence — radical freedom, authentic choice, and the courage to become.',
    tagline: 'There is no given meaning. There is only the meaning you make through how you live.',
    icon: '∅',
    accent: 'rgba(160,60,60,0.18)',
    accentDark: 'rgba(220,90,90,0.20)',
    era: '19th–20th century CE',
  },
  'kemetic-wisdom': {
    description: 'Ma\'at, the Maxims of Ptahhotep, and the ancient Egyptian science of the heart.',
    tagline: 'Ma\'at is the rule of life. Truth, balance, and right order are the food of the heart.',
    icon: '𓂀',
    accent: 'rgba(180,130,40,0.18)',
    accentDark: 'rgba(240,185,70,0.20)',
    era: 'c. 3100–30 BCE',
  },
}

// ── Accent colors by slug ─────────────────────────────────────────────────────

export const TRADITION_COLORS: Record<string, { light: string; dark: string }> = {
  stoicism:                { light: '#8b7355', dark: '#d4a853' },
  hermeticism:             { light: '#9a6fd0', dark: '#c090ff' },
  neoplatonism:            { light: '#c8a83a', dark: '#f0c840' },
  gnosticism:              { light: '#c04060', dark: '#f06080' },
  kabbalah:                { light: '#4080e0', dark: '#70b0ff' },
  pythagoreanism:          { light: '#28c8b8', dark: '#50e8d8' },
  'pre-socratic':          { light: '#e07830', dark: '#f0a060' },
  'african-philosophy':    { light: '#d08040', dark: '#e8a060' },
  'renaissance-philosophy':{ light: '#48a048', dark: '#70c870' },
  transcendentalism:       { light: '#4898d8', dark: '#70c0ff' },
  buddhism:                { light: '#8250a0', dark: '#be78f0' },
  taoism:                  { light: '#328c64', dark: '#46c88c' },
  vedanta:                 { light: '#b47828', dark: '#f0aa40' },
  existentialism:          { light: '#a03c3c', dark: '#e05858' },
  'kemetic-wisdom':        { light: '#b48228', dark: '#f0c046' },
}

// Fallback color when a tradition slug is not found in TRADITION_COLORS
export const TRADITION_DEFAULT_COLORS = { light: '#8b7355', dark: '#d4a853' } as const
export const TRADITION_NEUTRAL_COLORS = { light: '#888888', dark: '#888888' } as const

// Per-tradition card surface colors — used for the card body background in
// PhilosopherTimeline via --trad-surface / --trad-surface-dk CSS vars.
// Raw hex/rgba here is intentional: this is the constants (raw values) layer.
export const TRADITION_CARD_THEMES: Record<string, { surface: string; surfaceDk: string }> = {
  stoicism:                 { surface: '#f5f0e6', surfaceDk: 'rgba(20,16,6,0.98)'   }, // warm parchment
  hermeticism:              { surface: '#f2eeff', surfaceDk: 'rgba(10,4,22,0.98)'   }, // violet mist
  neoplatonism:             { surface: '#f7f3e0', surfaceDk: 'rgba(20,16,2,0.98)'   }, // gilded parchment
  gnosticism:               { surface: '#fff0f2', surfaceDk: 'rgba(20,2,6,0.98)'    }, // blood-rose shadow
  kabbalah:                 { surface: '#edf3ff', surfaceDk: 'rgba(2,6,24,0.98)'    }, // deep sapphire
  pythagoreanism:           { surface: '#edfaf8', surfaceDk: 'rgba(2,16,14,0.98)'   }, // aqua-teal depths
  'pre-socratic':           { surface: '#fff4eb', surfaceDk: 'rgba(22,10,2,0.98)'   }, // ember-terracotta
  'african-philosophy':     { surface: '#fff3ea', surfaceDk: 'rgba(22,10,2,0.98)'   }, // warm earth
  'renaissance-philosophy': { surface: '#eef8ee', surfaceDk: 'rgba(4,14,4,0.98)'   }, // sage forest
  transcendentalism:        { surface: '#eef5ff', surfaceDk: 'rgba(2,8,20,0.98)'   }, // sky-midnight
  buddhism:                 { surface: '#f4eeff', surfaceDk: 'rgba(14,4,22,0.98)'   }, // amethyst dusk
  taoism:                   { surface: '#edf9f4', surfaceDk: 'rgba(2,14,8,0.98)'    }, // jade depths
  vedanta:                  { surface: '#fdf7e8', surfaceDk: 'rgba(20,12,2,0.98)'   }, // saffron warmth
  existentialism:           { surface: '#fff0f0', surfaceDk: 'rgba(18,2,2,0.98)'    }, // void crimson
  'kemetic-wisdom':         { surface: '#fdf8e0', surfaceDk: 'rgba(20,14,0,0.98)'   }, // papyrus-gold
}

// ── ID-keyed lookups (AuthorPage) ─────────────────────────────────────────────

export const TRADITION_ICON: Record<number, string> = {
  1:  '⊕', 2:  '✦', 3:  '◎', 4:  '✧', 5:  '✡',
  6:  '△', 7:  '∞', 8:  '◇', 9:  '☿', 10: '☀',
  11: '☸', 12: '☯', 13: '◉', 14: '∅', 15: '𓂀',
}

export const TRADITION_NAME: Record<number, string> = {
  1:  'Stoicism',        2:  'Hermeticism',      3:  'Neoplatonism',
  4:  'Gnosticism',      5:  'Kabbalah',          6:  'Pythagoreanism',
  7:  'Pre-Socratic',    8:  'African Philosophy', 9:  'Renaissance Philosophy',
  10: 'Transcendentalism',
  11: 'Buddhism',        12: 'Taoism',            13: 'Vedanta',
  14: 'Existentialism',  15: 'Kemetic Wisdom',
}

export const TRADITION_SLUG: Record<number, string> = {
  1:  'stoicism',        2:  'hermeticism',       3:  'neoplatonism',
  4:  'gnosticism',      5:  'kabbalah',           6:  'pythagoreanism',
  7:  'pre-socratic',    8:  'african-philosophy', 9:  'renaissance-philosophy',
  10: 'transcendentalism',
  11: 'buddhism',        12: 'taoism',             13: 'vedanta',
  14: 'existentialism',  15: 'kemetic-wisdom',
}

// ── Concept Glossary per tradition ───────────────────────────────────────────

export const GLOSSARY: Record<string, Array<{ term: string; definition: string }>> = {
  stoicism: [
    {
      term: 'Logos',
      definition: 'The rational principle that structures the cosmos and runs through all things. For the Stoics, living "according to nature" means living in alignment with the Logos — the cosmic intelligence that holds everything together.',
    },
    {
      term: 'Hegemonikon',
      definition: 'The "ruling faculty" — the rational center of the soul that forms judgments, governs impulse, and gives or withholds assent to impressions. The Stoics located it in the heart; controlling it is the whole of the practice.',
    },
    {
      term: 'Prokopón',
      definition: 'The person "making progress" toward virtue — the sincere practitioner who has not yet achieved the Stoic sage\'s perfection but strives daily. The Stoics acknowledged this as the realistic description of most serious practitioners.',
    },
    {
      term: 'Eudaimonia',
      definition: 'Flourishing or well-being — the Stoic goal of human life. Achieved through virtue alone, not external circumstances. The Stoics argued you can have eudaimonia even on the rack if your character is sound.',
    },
    {
      term: 'Apatheia',
      definition: 'Freedom from the distorting passions — not "apathy" in the modern sense, but equanimity grounded in reason. The Stoic goal is to replace the irrational passions (fear, craving, pleasure, pain) with good emotional states (caution, wishing, joy).',
    },
    {
      term: 'Phantasia',
      definition: 'A "presentation" or impression that strikes the mind before judgment is applied. The Stoic practice begins here: you cannot control the phantasia that arrives, but you can control your assent to it. "It is not things that disturb us, but our judgments about things."',
    },
    {
      term: 'Kathekon',
      definition: '"Appropriate action" — the duties fitting one\'s role and circumstances. What the prokopón practices: the right actions for a parent, citizen, friend, even if not yet performed with the perfect virtue of the sage.',
    },
    {
      term: 'Sympatheia',
      definition: 'The Stoic doctrine of cosmic interconnectedness: all parts of the cosmos are a single unified organism and are mutually responsive. The recognition that you are not a separate thing but a part of a whole is the root of Stoic social ethics.',
    },
    {
      term: 'Prohairesis',
      definition: 'Moral choice or will — Epictetus\'s central term for the faculty that is entirely our own. External things are not "up to us"; only prohairesis is. Everything in Epictetan practice hinges on cultivating, protecting, and purifying this faculty.',
    },
    {
      term: 'Eupatheiai',
      definition: 'The "good emotional states" that replace the irrational passions in the sage: joy (not pleasure), caution (not fear), wishing (not craving). They are not suppression of feeling but feeling aligned with reason.',
    },
  ],
  hermeticism: [
    {
      term: 'The All',
      definition: 'The infinite, divine Mind that contains and constitutes the universe — the first Hermetic principle. All that exists is a mental creation within The All. The cosmos is not in The All as in a container; The All is in the cosmos as its very substance.',
    },
    {
      term: 'Correspondence',
      definition: '"As above, so below; as below, so above." The structural identity between all planes of existence. The laws governing atoms govern galaxies; the patterns of the macrocosm repeat in the microcosm. To know one level is to understand all levels.',
    },
    {
      term: 'Vibration',
      definition: 'Nothing rests; everything vibrates. Differences between forms of matter, energy, and mind are differences in rate of vibration. The Hermetic adept learns to consciously adjust their own rate — to transmute mental states as an alchemist transmutes metals.',
    },
    {
      term: 'Polarity',
      definition: 'Everything has its opposite, and opposites are identical in nature — differing only in degree. Cold and heat, love and hatred, light and darkness are the same thing on a spectrum. Mental transmutation works by sliding a state along this pole rather than fighting it.',
    },
    {
      term: 'Rhythm',
      definition: 'Everything flows in and out, rises and falls. The pendulum swings between poles. Hermetic mastery means rising above the swing — observing the rhythm without being ruled by it, through what the Kybalion calls "mental polarization."',
    },
    {
      term: 'Causation',
      definition: 'Every cause has its effect; every effect its cause. Nothing escapes this law — but there are many planes of causation, and the master operates from a higher plane, becoming a cause rather than remaining an effect at the lower level.',
    },
    {
      term: 'Gender',
      definition: 'The masculine and feminine principles exist on all planes in all things. Neither is superior; both are necessary for creation. The masculine is directive, projective; the feminine is receptive, generative. All creative acts require both.',
    },
    {
      term: 'The Kybalion',
      definition: 'The foundational Hermetic text attributed to "Three Initiates," presenting the Seven Hermetic Principles. Its central axiom: "The lips of wisdom are closed, except to the ears of understanding." Understanding must be earned, not transmitted.',
    },
    {
      term: 'Mentalism',
      definition: 'The first and highest of the seven principles: The All is Mind; the universe is mental. This is not idealism in the modern sense — the universe is real — but its fundamental nature is consciousness, not matter.',
    },
  ],
  neoplatonism: [
    {
      term: 'The One',
      definition: 'The absolute first principle of Plotinus — beyond being, beyond thought, beyond description. All existence emanates from the One as light from the sun, without the One itself being diminished or divided.',
    },
    {
      term: 'Nous',
      definition: 'Divine Intellect — the second hypostasis, pure thought thinking itself. It contains all the Platonic Forms as its contents. The universe\'s intelligible structure is the life of Nous. To contemplate the Forms is to approach Nous.',
    },
    {
      term: 'World Soul',
      definition: 'The third hypostasis: the soul of the cosmos, intermediary between Nous and the material world. It animates all living things and links the intelligible to the physical. Individual human souls are parts of or participants in the World Soul.',
    },
    {
      term: 'Emanation',
      definition: 'Reality proceeds outward from the One in descending levels without any act of will or choice — as necessarily as light flows from the sun. Each level is a less perfect image of the one above it yet still participates in the One\'s perfection.',
    },
    {
      term: 'Henosis',
      definition: 'Union with the One — the supreme goal of Neoplatonic spiritual practice. Plotinus described it as moments of complete self-forgetting in which the individual soul becomes absorbed in the One. Not a permanent state for most, but an achievable peak.',
    },
    {
      term: 'Hypostasis',
      definition: '"Standing-under" — a fundamental level of reality. Plotinus identified three: The One, Nous (Intellect), and World Soul. Each hypostasis proceeds from the one above it and gives rise to the one below; together they constitute the structure of all being.',
    },
    {
      term: 'Epistrophe',
      definition: '"Return" — the soul\'s movement back toward its source in the One, counterbalancing the outward movement of emanation. The soul descends into matter but carries an innate longing to return. Philosophy and contemplation facilitate this return.',
    },
    {
      term: 'Theourgia',
      definition: '"God-work" — ritual practice developed by Iamblichus as a complement to Plotinian contemplation. The gods are brought to act through specific rites, linking the human to the divine through symbol, not argument. A productive tension with Plotinus\'s purely intellectual path.',
    },
    {
      term: 'Apophasis',
      definition: 'Negative theology — approaching the One by saying what it is not, since it transcends all positive description. The One is not being, not thought, not good (in any familiar sense). Stripping away all predication is itself a form of ascent.',
    },
  ],
  gnosticism: [
    {
      term: 'Gnosis',
      definition: 'Direct, experiential knowledge of the divine — not faith, not doctrine, not second-hand belief. The Greek word gnosis means "knowledge," but Gnostic gnosis is immediate inner recognition, not information. It liberates the divine spark from material bondage.',
    },
    {
      term: 'Demiurge',
      definition: 'The creator of the physical world — not the true God, but an inferior deity, often portrayed as ignorant or malevolent. The Demiurge fashioned the material prison but cannot perceive the higher light. The word means "craftsman" in Greek.',
    },
    {
      term: 'Pleroma',
      definition: '"Fullness" — the divine realm of light and the true home of all souls. The Pleroma contains the Aeons (divine beings) and is the source of the divine sparks that fell into matter. The Gnostic path leads back to the Pleroma.',
    },
    {
      term: 'Kenoma',
      definition: '"Emptiness" or deficiency — the material world as opposed to the Pleroma. Matter is not evil per se but is a region of spiritual poverty, a place where divine light is dispersed and obscured. The soul\'s task is to return from kenoma to pleroma.',
    },
    {
      term: 'Sophia',
      definition: 'Divine Wisdom — a feminine Aeon whose yearning or fall from the Pleroma initiated the creation of the material world. In many Gnostic systems she is both the cause of the exile and the guide to return, seeking to recover the sparks of light she scattered.',
    },
    {
      term: 'Aeon',
      definition: 'A divine being or emanation that populates the Pleroma. Aeons come in pairs (syzygies) and collectively constitute the divine fullness. When an Aeon falls out of balance — as Sophia did — the result is the imperfect material creation.',
    },
    {
      term: 'Archons',
      definition: 'Rulers or gatekeepers of the material planes — servants of the Demiurge who enforce the soul\'s imprisonment. The soul must pass through layers of Archons on its return journey to the Pleroma, armed with the passwords that gnosis provides.',
    },
    {
      term: 'The Divine Spark',
      definition: 'The pneuma — the fragment of divine light trapped within each human being. The material world has no claim on the spark; it belongs to the Pleroma. Gnostic practice is the awakening of this spark to its own nature and its rightful home.',
    },
  ],
  kabbalah: [
    {
      term: 'Ein Sof',
      definition: 'The infinite, boundless divine reality — literally "without end." Ein Sof cannot be described, only approached. All of creation flows from it as self-expression, but Ein Sof itself remains forever unknowable, beyond all attributes and names.',
    },
    {
      term: 'Sefirot',
      definition: 'The ten divine emanations or attributes through which Ein Sof manifests and relates to creation: Keter (Crown), Chokmah (Wisdom), Binah (Understanding), Chesed (Mercy), Gevurah (Strength), Tiferet (Beauty), Netzach (Victory), Hod (Splendor), Yesod (Foundation), Malkuth (Kingdom).',
    },
    {
      term: 'Tikkun Olam',
      definition: '"Repair of the world." Divine light shattered into the world at creation, scattering sparks everywhere. Every human act of justice, compassion, and sacred intention gathers and restores these sparks — repairing the cosmos from within. Ethics as cosmic necessity.',
    },
    {
      term: 'Tzimtzum',
      definition: 'The Lurianic doctrine that God "contracted" or withdrew to create space for the world. Creation required self-limitation. The void this withdrawal left was filled by divine light entering through a channel — a process that shattered vessels and scattered sparks.',
    },
    {
      term: 'Pardes',
      definition: 'The fourfold levels of Torah interpretation: Peshat (literal), Remez (allegorical), Derash (homiletical), and Sod (mystical). Pardes means "orchard." In Kabbalistic tradition the word itself encodes all four levels in its letters.',
    },
    {
      term: 'Shekhina',
      definition: 'The divine presence — the feminine aspect of God that dwells immanently in the world. When Israel is in exile, the Shekhina is also in exile with them. Tikkun includes the reunification of the masculine and feminine divine principles.',
    },
    {
      term: 'Devekut',
      definition: '"Cleaving to God" — the Kabbalistic state of sustained attachment and intimacy with the divine. Not a momentary mystical peak but an ongoing orientation of consciousness. The goal of prayer, study, and ethical practice in Kabbalistic spirituality.',
    },
    {
      term: 'Gilgul',
      definition: 'Transmigration of souls — the Kabbalistic doctrine that souls may inhabit multiple successive bodies until they complete their tikkun. Not punishment but opportunity: each life is a chance to repair what was left undone.',
    },
  ],
  pythagoreanism: [
    {
      term: 'Monad',
      definition: 'The first principle — the One — from which all numbers and therefore all of reality derive. The Monad is not a number but the source of number; it is to numbers what the point is to geometric figures. It represents unity, divinity, and the limit of all things.',
    },
    {
      term: 'Tetraktys',
      definition: 'The sacred arrangement of ten points in an equilateral triangle (1+2+3+4=10). The Pythagoreans swore their most solemn oaths by it. The tetraktys encodes the ratios of musical harmony and was held to reveal the mathematical structure of the cosmos.',
    },
    {
      term: 'Metempsychosis',
      definition: 'The transmigration of souls — the doctrine that the soul is immortal and passes through many lives in both human and animal bodies. Attributed to Pythagoras himself, it shaped the community\'s ethics, including prohibitions on eating certain animals.',
    },
    {
      term: 'Harmonia',
      definition: 'Proportion and balanced opposites — the principle that health, beauty, justice, and cosmic order are all forms of harmony. Not a vague notion of peace, but the precise mathematical relationship between parts: the mean between extremes, the ratio that makes things fit.',
    },
    {
      term: 'Peras and Apeiron',
      definition: 'Limit (peras) and the Unlimited (apeiron) — the two fundamental principles from which reality arises. The Unlimited is indefinite potential; Limit gives it form. Number is the Limit imposed on the Unlimited. All things are produced by their tension.',
    },
    {
      term: 'Musica Universalis',
      definition: 'The music of the spheres — the celestial bodies produce harmonics as they move through space, their distances from each other following musical ratios. This cosmic music is inaudible to ordinary ears but is the model for all earthly harmony.',
    },
    {
      term: 'Akousmata',
      definition: 'The "things heard" — oral maxims and taboos followed by Pythagorean initiates. Some were dietary (don\'t eat beans), some ritual (don\'t step over a broom), some symbolic. They encoded a form of life, not merely rules, binding the community.',
    },
  ],
  'pre-socratic': [
    {
      term: 'Arche',
      definition: 'The first principle or primary substance from which all reality derives. Each Pre-Socratic proposed a different arche: Thales named water, Anaximenes named air, Heraclitus named fire-as-process, Anaximander named "the boundless." The question itself founded Western philosophy.',
    },
    {
      term: 'Apeiron',
      definition: '"The boundless" or "the unlimited" — Anaximander\'s name for the first principle. The apeiron has no determinate character; it is the inexhaustible source from which all opposites (hot/cold, wet/dry) separate out. More abstract than Thales\'s water or Anaximenes\'s air.',
    },
    {
      term: 'Logos',
      definition: 'The rational principle governing the flux of opposites — Heraclitus\'s central term. Most people live as if asleep, unaware of the Logos that structures all change. To wake up is to perceive that strife and unity, fire and its transformations, are all one.',
    },
    {
      term: 'Nous',
      definition: '"Mind" — Anaxagoras\'s term for the intelligent principle that initiated the original cosmic rotation and that alone is unmixed with other things. Nous has knowledge of all things and the greatest power. Aristotle praised Anaxagoras for this idea but faulted him for not using it consistently.',
    },
    {
      term: 'Atom',
      definition: '"Indivisible" — the ultimate unit of matter in Democritus\'s and Leucippus\'s atomism. Atoms are infinite in number, differing in shape and size, moving in void. All apparent qualities (color, taste, warmth) are conventional; only atoms and void are real.',
    },
    {
      term: 'The Flux',
      definition: 'Heraclitus\'s doctrine that all things are in constant change — "you cannot step into the same river twice." But this flux is governed by the Logos. Stability is an illusion of the senses; the underlying unity of opposites is what reason grasps.',
    },
    {
      term: 'Being — Parmenides',
      definition: 'Parmenides argued that Being is one, eternal, and unchanging — change and multiplicity are illusions of the senses. "What can be thought is the same as what can be." Only thought can access true reality. This set the stage for Plato and all subsequent metaphysics.',
    },
  ],
  'african-philosophy': [
    {
      term: 'Ubuntu',
      definition: '"Umuntu ngumuntu ngabantu" — "I am because we are." The self is not a closed individual but is constituted through relationship, community, and mutual recognition. Personhood is achieved through others, not given at birth. A defining concept of sub-Saharan African ethics.',
    },
    {
      term: 'Maat',
      definition: 'The ancient Egyptian cosmic principle of truth, justice, balance, and right order. Maat is both the structure of the cosmos and the standard for human conduct. At death, the heart is weighed against the feather of Maat — if lighter, the soul passes on; if heavier, it is consumed.',
    },
    {
      term: 'Nommo',
      definition: 'The generative power of the word, breath, and name in Bantu and Dogon philosophy. Speech is not merely communicative but creative and sustaining — it calls reality into being and maintains it. Naming is an act of ontological significance.',
    },
    {
      term: 'Ori',
      definition: 'In Yoruba philosophy, the personal divine consciousness or "inner head" — the individual\'s spiritual intuition and destiny. Ori must be cultivated and aligned. One\'s relationship with one\'s ori determines capacity for wisdom, success, and spiritual integrity.',
    },
    {
      term: 'Ancestor Veneration',
      definition: 'The recognition that the dead are not absent but present as a living moral community. Ancestors guide, protect, and hold the living accountable to the values of the lineage. Their wisdom is not past but continuously active through those who remember and invoke them.',
    },
    {
      term: 'Communal Ethics',
      definition: 'African philosophy grounds ethics in community and relationship rather than individual rights or abstract principles. The good person is one who fulfills their role in the web of mutual obligation — care, reciprocity, and respect that constitutes personhood itself.',
    },
  ],
  'renaissance-philosophy': [
    {
      term: 'Studia Humanitatis',
      definition: 'The humanist curriculum at the heart of the Renaissance: grammar, rhetoric, poetry, history, and moral philosophy — all drawn from classical Greek and Latin sources. Its aim was not professional training but the formation of a full human being capable of civic life.',
    },
    {
      term: 'Deus sive Natura',
      definition: '"God or Nature" — Spinoza\'s equation of the two. There is one infinite substance with infinite attributes; God and Nature are not two things but one reality described differently. Freedom is not escape from necessity but the understanding of it.',
    },
    {
      term: 'Prisca Theologia',
      definition: 'The "ancient theology" — Renaissance thinkers believed that Hermetic, Neoplatonic, and Pythagorean texts preserved a universal wisdom predating all particular religions. This philosophia perennis was thought to confirm the essential unity of all spiritual traditions.',
    },
    {
      term: 'Idols of the Mind',
      definition: 'Francis Bacon\'s term for the four categories of cognitive prejudice that prevent clear perception: Idols of the Tribe (human nature), the Cave (individual temperament), the Marketplace (language), and the Theatre (received philosophy). All must be cleared before inquiry can begin.',
    },
    {
      term: 'Inductive Method',
      definition: 'Bacon\'s revolution: knowledge comes from systematic observation and experiment, not deduction from first principles. The mind must move from particular facts to general laws, not the reverse. This methodological shift laid the groundwork for modern science.',
    },
    {
      term: 'Conatus',
      definition: 'Spinoza\'s term for the drive of every being to persist in its own existence and develop its own power. Conatus is not mere self-preservation but the positive striving to become more fully what one essentially is. Ethics is the full expression of this drive.',
    },
    {
      term: 'The Essay',
      definition: 'Montaigne\'s invention — thinking through writing, radical self-examination as philosophy. The word "essai" means attempt or trial. The self as the proper object of philosophical inquiry: not universal truths first, but "What do I know?" asked of oneself relentlessly.',
    },
  ],
  transcendentalism: [
    {
      term: 'Over-Soul',
      definition: 'Emerson\'s term for the universal divine consciousness that underlies and unites all individual minds. In moments of genuine intuition and inspiration, the individual soul touches the Over-Soul and participates in a knowledge larger than personal experience.',
    },
    {
      term: 'Self-Reliance',
      definition: 'The doctrine that each person\'s deepest intuitions are their surest guide — not convention, tradition, or authority. Conformity is spiritual death. To trust oneself fully is to trust the divine, since the Over-Soul speaks through individual conscience.',
    },
    {
      term: 'Correspondence',
      definition: 'Borrowed from Swedenborg: the natural world corresponds to and reveals spiritual truths. Every natural fact is a symbol of a spiritual fact; inner and outer reality mirror each other. Nature is the scripture; attentive perception is the practice.',
    },
    {
      term: 'Civil Disobedience',
      definition: 'Thoreau\'s doctrine that the individual conscience is a higher authority than unjust law. When a government enforces injustice, the person of integrity must refuse compliance, accepting the consequences, because one\'s moral self cannot be ceded to the state.',
    },
    {
      term: 'Idealism',
      definition: 'The Transcendentalist conviction that mind and spirit are primary; matter is secondary or derivative. Nature is not brute fact but the expression of spiritual reality. The material world is a garment the spirit wears — beautiful and meaningful, but not ultimate.',
    },
    {
      term: 'Influx',
      definition: 'The inflow of divine energy into the soul in moments of openness — what Emerson describes as the experience of inspiration, genius, or deep natural perception. Influx cannot be forced, only received; the practice is removing the obstacles to it.',
    },
  ],
  buddhism: [
    {
      term: 'Dukkha',
      definition: '"Suffering" or unsatisfactoriness — the first noble truth. Not merely acute pain but the pervasive background sense that things are not quite right, that pleasure fades, that the self is insecure. The honest starting point of the Buddhist path.',
    },
    {
      term: 'Anicca',
      definition: 'Impermanence — all conditioned things arise and pass. Not a philosophical position to believe but a fact to be perceived directly in experience. The suffering caused by grasping at what cannot be held dissolves when impermanence is genuinely seen.',
    },
    {
      term: 'Anatta',
      definition: 'Non-self — there is no fixed, permanent, independent self. What we call "I" is a constantly changing process: a stream of sensations, thoughts, and perceptions with no unchanging core. Seeing this directly dissolves the fundamental illusion that drives clinging.',
    },
    {
      term: 'Sati',
      definition: 'Mindfulness — bare, non-judgmental attention to present-moment experience. Not a relaxation technique but a mode of perception that sees things as they actually are, before the layers of preference, narrative, and reactivity are added.',
    },
    {
      term: 'Nibbana',
      definition: 'The cessation of craving and the liberation from the cycle of conditioned arising. The word means "extinguishing" — the blowing out of the fires of greed, hatred, and delusion. Not annihilation but freedom from being driven; a condition, not a place.',
    },
    {
      term: 'Karma',
      definition: 'Action and its consequences — not fate but the law that intentional actions shape the conditions of future experience. Karma is neither reward nor punishment but a natural continuity. The path works by cultivating actions that lead toward freedom.',
    },
    {
      term: 'Dependent Origination',
      definition: 'The teaching that all phenomena arise in dependence on conditions — nothing exists independently or permanently. Suffering arises through a chain of conditions; it ceases when those conditions cease. This is the mechanism the Four Noble Truths describe.',
    },
    {
      term: 'Sangha',
      definition: 'The community of practitioners — the third of the Three Jewels (along with the Buddha and Dharma). Spiritual development is not a solitary project; the community of fellow practitioners creates the conditions in which the path can be walked.',
    },
  ],
  taoism: [
    {
      term: 'Tao',
      definition: 'The nameless Way — the source and ground of all things, prior to heaven and earth, inexhaustible, giving rise to everything without effort. It cannot be fully grasped by conceptual mind, but it can be aligned with through stillness, simplicity, and non-striving.',
    },
    {
      term: 'Wu Wei',
      definition: 'Non-action — not passivity but effortless action: moving with the natural flow of things rather than against it. The sage acts without forcing and achieves without striving. Water is the model: soft, yielding, unstoppable.',
    },
    {
      term: 'Te',
      definition: 'Virtue or power — the particular expression of the Tao in each thing, its essential nature. Human te is the quality that emerges when one acts in full alignment with one\'s nature: not a moral ideal imposed from outside, but authenticity itself.',
    },
    {
      term: 'Ziran',
      definition: '"Self-so-ness" or naturalness — being exactly what one is without pretense, effort, or performance. Civilization often teaches away from this; Taoist wisdom is the return to it. The infant and the master craftsman share this quality.',
    },
    {
      term: 'P\'u',
      definition: 'The "uncarved block" — original simplicity before shaping, conditioning, or social molding. P\'u represents the full potential of natural being before it is reduced to usefulness. The sage retains p\'u; most people lose it to culture.',
    },
    {
      term: 'Ch\'i',
      definition: 'Vital energy or breath — the animating force that flows through the cosmos and through the human body. Where ch\'i flows freely, there is health and vitality; where it stagnates, there is illness and stasis. Much of Taoist practice works with ch\'i.',
    },
    {
      term: 'Yin and Yang',
      definition: 'The complementary principles that all things contain. Yin: receptive, dark, still, inward, feminine. Yang: active, bright, moving, outward, masculine. Neither is superior; each contains the seed of the other and transforms into it. The Tao is their dance.',
    },
  ],
  vedanta: [
    {
      term: 'Brahman',
      definition: 'The one infinite, self-luminous consciousness that is the ground and substance of all reality. Not a personal deity but the very being in which all things appear — eternal, unchanging, self-aware, without a second. "Sat-chit-ananda": being, consciousness, bliss.',
    },
    {
      term: 'Atman',
      definition: 'The true self — which Advaita Vedanta identifies with Brahman. The sense of being a separate, limited entity is the fundamental illusion. Liberation is the direct recognition — not conceptual but lived — that "I am Brahman." Aham Brahmasmi.',
    },
    {
      term: 'Maya',
      definition: 'The power of illusion — the world as ordinarily experienced. Not that the world is unreal, but that it is not independently real: it appears within and through Brahman, like a dream within the dreaming mind. The error is taking appearance to be ultimate.',
    },
    {
      term: 'Moksha',
      definition: 'Liberation — freedom from the cycle of birth, death, and rebirth (samsara). Not a place or state after death but the recognition of what is already the case: one is already Brahman. The path is not acquisition but removal of the veil of ignorance.',
    },
    {
      term: 'Advaita',
      definition: '"Non-dual" — the central teaching of Shankaracharya: Brahman is real, the world is appearance, the individual self is identical with Brahman. There is not Brahman and the world; there is only Brahman appearing as the world.',
    },
    {
      term: 'Avidya',
      definition: 'Ignorance — the root cause of all suffering and bondage. Not lack of information but the fundamental misperception of one\'s own nature: taking the body-mind to be the self, the appearance to be ultimate reality. Jnana (knowledge) destroys avidya.',
    },
    {
      term: 'Viveka',
      definition: '"Discrimination" — the faculty of discernment between the real (Brahman) and the unreal (appearance). The first qualification for Vedanta study. The student must be able to distinguish the permanent from the impermanent before inquiry can proceed.',
    },
  ],
  existentialism: [
    {
      term: 'Thrownness',
      definition: 'Heidegger\'s term for the condition of finding oneself already in a world, situation, and body one did not choose. We are thrown into existence — with a particular language, culture, body, time — and must take up this inheritance in our choices.',
    },
    {
      term: 'Being-for-itself',
      definition: 'Sartre\'s term for human consciousness — the mode of being that is not fixed, not a thing, not determined. The for-itself is always ahead of itself, always what it is not yet. This is the source of both freedom and the anxiety of radical choice.',
    },
    {
      term: 'Being-in-itself',
      definition: 'Sartre\'s term for the mode of being of things — fixed, self-identical, without interiority or freedom. A stone is in-itself; it simply is what it is. The human temptation is to flee freedom by pretending to be in-itself — which is bad faith.',
    },
    {
      term: 'Angst',
      definition: 'The existential anxiety that arises from confronting one\'s radical freedom and the absence of given meaning. Not fear of a specific thing but the vertigo of absolute openness. Authentic existence does not flee angst but works through it.',
    },
    {
      term: 'Facticity',
      definition: 'The given, unchosen dimensions of one\'s existence — body, birth circumstances, past choices, historical moment. Facticity is not destiny; it is what the for-itself must take up and work with. Authenticity means owning one\'s facticity rather than denying it.',
    },
    {
      term: 'The Look',
      definition: 'Sartre\'s analysis of intersubjective experience: to be seen by another is to be fixed, objectified, defined. The look of the Other threatens to reduce the for-itself to an in-itself. The social dimension of existence is always charged with this tension.',
    },
    {
      term: 'Absurdity',
      definition: 'Camus\'s term for the clash between the human demand for meaning and the universe\'s silence. The honest response is not despair (giving up the demand) or faith (pretending the universe answers), but revolt: continuing to live fully and consciously in defiance of the gap.',
    },
  ],
  'kemetic-wisdom': [
    {
      term: 'Ma\'at',
      definition: 'The cosmic principle of truth, justice, balance, and right order — the foundational concept of ancient Egyptian civilization. Ma\'at is both the structure of the cosmos and the standard for human conduct. To live in Ma\'at is the purpose of human existence.',
    },
    {
      term: 'Ib',
      definition: 'The heart — the seat of intelligence, will, conscience, and character in ancient Egyptian thought. Not the physical organ but the whole inner person, what we might call the self or soul. At judgment, the ib is weighed against the feather of Ma\'at.',
    },
    {
      term: 'Ba',
      definition: 'The animated, individuated soul — the aspect of the person that continues after death and can move between the human world and the divine. The ba is often depicted as a bird with a human head, representing the soul\'s freedom of movement.',
    },
    {
      term: 'Ka',
      definition: 'The vital life force or spiritual double — the divine energy that animates and sustains the living person. The ka is inherited through the lineage and persists after death in the tomb, sustained by offerings. The ka is what gives a person their essential vitality.',
    },
    {
      term: 'Thoth',
      definition: 'The ibis-headed divine principle of wisdom, writing, measurement, and the ordering of knowledge. Thoth records the judgment of the dead, represents the cognitive aspect of Ma\'at, and is the patron of scribes, healers, and all who seek genuine understanding.',
    },
    {
      term: 'The Weighing of the Heart',
      definition: 'The central judgment scene of the Book of the Dead: the heart (ib) is weighed against the feather of Ma\'at on a scale. If the heart is lighter — unburdened by untruth and wrongdoing — the soul passes. If heavier, it is consumed by Ammit.',
    },
    {
      term: 'Neteru',
      definition: 'The divine principles or "gods" of the Kemetic tradition — not supernatural persons but cosmic forces and qualities. Ra is the principle of solar life; Osiris of death and resurrection; Isis of magical wisdom and protection. The neteru are aspects of a unified divine reality.',
    },
  ],
}

// ── Core Concepts per tradition ───────────────────────────────────────────────

export const CORE_CONCEPTS: Record<string, Array<{ name: string; description: string }>> = {
  stoicism: [
    {
      name: 'Dichotomy of Control',
      description: 'Only our judgments, intentions, and responses are truly "up to us." External outcomes — reputation, health, wealth — are not. Freedom begins with this distinction.',
    },
    {
      name: 'Logos',
      description: 'The rational principle that pervades and orders the cosmos. To live according to nature is to align with Logos — to think and act in harmony with the intelligence structuring all things.',
    },
    {
      name: 'Virtue as the Sole Good',
      description: 'Wisdom, courage, justice, and temperance are the only true goods. Everything else — wealth, pleasure, status — is "preferred indifferent": worth pursuing, but not worth compromising virtue for.',
    },
    {
      name: 'Memento Mori',
      description: 'The practice of contemplating death — not as morbid obsession but as a tool for clarity. To remember mortality is to remember what matters and to stop deferring the life you intend to live.',
    },
    {
      name: 'Amor Fati',
      description: 'Love of fate. Not mere resignation to what happens, but an active embrace of it — willing exactly what is, finding in every circumstance something to be grateful for.',
    },
  ],
  hermeticism: [
    {
      name: 'The All is Mind',
      description: 'The universe is mental in nature. All that exists is a thought within the infinite Mind. Matter, energy, and consciousness are aspects of a single mental reality — the first of the seven Hermetic principles.',
    },
    {
      name: 'As Above, So Below',
      description: 'Every plane of existence mirrors every other. The laws governing atoms govern galaxies; the patterns of the macrocosm repeat in the microcosm. To know one level is to understand all levels.',
    },
    {
      name: 'The Principle of Vibration',
      description: 'Nothing rests; everything vibrates. Differences between forms of matter, energy, and mind are differences in rate of vibration. Mastery means consciously adjusting one\'s own vibration.',
    },
    {
      name: 'The Principle of Polarity',
      description: 'Everything has its opposite, and opposites are identical in nature — differing only in degree. Cold and heat, love and hatred, light and darkness are the same thing on a spectrum. All opposites can be reconciled.',
    },
    {
      name: 'The Principle of Rhythm',
      description: 'Everything flows in and out, rises and falls. The pendulum swings between opposites. Hermetic mastery means learning to rise above the swing — to observe the rhythm without being ruled by it.',
    },
  ],
  neoplatonism: [
    {
      name: 'The One',
      description: 'The absolute first principle — beyond being, thought, and all description. All existence emanates from the One as light from the sun, without the One itself being diminished or divided.',
    },
    {
      name: 'Emanation',
      description: 'Reality proceeds outward from the One in descending levels: Nous (Intellect), World Soul, and Matter. Each level is a less perfect image of the one above it, yet each participates in the One\'s perfection.',
    },
    {
      name: 'Nous — Divine Intellect',
      description: 'The second hypostasis: pure thought thinking itself, containing all Platonic Forms as its contents. The universe\'s intelligible structure. To contemplate the Forms is to approach the Nous.',
    },
    {
      name: 'The World Soul',
      description: 'The third hypostasis: the soul of the cosmos, intermediary between the Intellect and the material world. It animates all living things and links the intelligible to the physical.',
    },
    {
      name: 'Henosis — Return to the One',
      description: 'The soul\'s ultimate purpose is to ascend back through the levels of reality to union with the One. This return — henosis — is achieved through sustained contemplation, virtue, and purification of the will.',
    },
  ],
  gnosticism: [
    {
      name: 'The Divine Spark',
      description: 'Each human soul contains a fragment of the divine light trapped within matter. Recognizing and liberating this spark — not ethical improvement, not ritual — is the sole purpose of human existence.',
    },
    {
      name: 'The Demiurge',
      description: 'The creator of the physical world is not the true God, but an inferior — often ignorant or malevolent — deity. Matter is not evil in itself but is a prison for divine consciousness that does not belong here.',
    },
    {
      name: 'Gnosis',
      description: 'Direct, experiential knowledge of the divine — not faith, not doctrine, not second-hand belief, but immediate inner knowing. Gnosis is what liberates the soul from material bondage.',
    },
    {
      name: 'The Pleroma',
      description: '"Fullness" — the divine realm of light that is the true home of all souls. Below it lies the kenoma, the emptiness of material existence. The Gnostic path is the journey from kenoma back to Pleroma.',
    },
    {
      name: 'Sophia — Wisdom',
      description: 'In many Gnostic systems, Sophia is the divine feminine principle whose yearning and fall from the Pleroma initiated the creation of the material world — making her both the cause of exile and the guide to return.',
    },
  ],
  kabbalah: [
    {
      name: 'Ein Sof — The Infinite',
      description: 'The absolute, boundless divine reality that precedes all existence, beyond any attribute or name. Ein Sof cannot be described, only approached. All of creation flows from it as its self-expression.',
    },
    {
      name: 'The Sefirot',
      description: 'Ten divine emanations or attributes through which Ein Sof manifests: Keter (Crown) through Malkuth (Kingdom). They form the structure of all reality — cosmic, psychological, and spiritual simultaneously.',
    },
    {
      name: 'The Tree of Life',
      description: 'The diagram of the ten Sefirot and their twenty-two interconnecting paths — a map of divine structure, of creation\'s unfolding, and of the human soul\'s constitution. To study it is to study oneself.',
    },
    {
      name: 'Tikkun Olam — Repair of the World',
      description: 'Divine light was shattered into the world at creation, scattering sparks everywhere. Every human ethical and spiritual action gathers and restores these sparks — repairing the cosmos from within.',
    },
    {
      name: 'Torah as Living Organism',
      description: 'In Kabbalah, the Torah is not merely law but a living divine text with infinite layers of meaning — literal, allegorical, homiletical, and mystical (Pardes). Each layer conceals deeper worlds.',
    },
  ],
  pythagoreanism: [
    {
      name: 'Number as Principle',
      description: 'All things are number. The structure of reality — from musical harmony to planetary motion — is mathematical. Number is not a description of nature but its very essence and being.',
    },
    {
      name: 'The Music of the Spheres',
      description: 'The celestial bodies produce harmonics as they move through space, their distances from each other following mathematical ratios. This cosmic music is the model for all earthly harmony and proportion.',
    },
    {
      name: 'Transmigration of Souls',
      description: 'The soul is immortal and passes through multiple lives — human, animal, and divine — until it achieves purification and liberation. This doctrine shaped Pythagorean ethics and dietary practice.',
    },
    {
      name: 'Harmonia',
      description: 'The principle of proportion and balanced opposites. Health, beauty, justice, and cosmic order are all forms of harmonia — the right relationship between parts, the mean between extremes.',
    },
    {
      name: 'The Limit and the Unlimited',
      description: 'Reality arises from the tension between Limit (peras) — form, definition, number — and the Unlimited (apeiron) — indefinite potential. All things are the product of Limit imposed on the Unlimited.',
    },
  ],
  'pre-socratic': [
    {
      name: 'Arche — The First Principle',
      description: 'Each Pre-Socratic sought the single underlying substance from which all reality derives: Thales named water, Anaximenes named air, Heraclitus named fire-as-process, Anaximander named "the boundless."',
    },
    {
      name: 'The Logos — Heraclitus',
      description: 'The rational principle that governs the flux of opposites. Most people live as if asleep, unaware of the Logos that structures all things. Listening to the Logos, not to opinion, is the beginning of wisdom.',
    },
    {
      name: 'Flux and the Unity of Opposites',
      description: 'For Heraclitus, all things are in constant change, yet this change is governed by an underlying unity. Day and night, life and death, waking and sleeping are aspects of a single continuous process.',
    },
    {
      name: 'Being and Non-Being — Parmenides',
      description: 'Parmenides argued that Being is one, eternal, and unchanging — change and multiplicity are illusions of the senses. Only thought can access reality. This set the stage for all subsequent metaphysics.',
    },
    {
      name: 'Atomism — Democritus',
      description: 'Reality consists of indivisible particles — atoms — moving in void. All apparent qualities are conventions of the mind; atoms and void alone are real. The first thoroughgoing materialist cosmology.',
    },
  ],
  'african-philosophy': [
    {
      name: 'Ubuntu',
      description: '"I am because we are." The self is not a closed individual but is constituted through relationship, community, and mutual recognition. Personhood is achieved through others — not given at birth.',
    },
    {
      name: 'Maat — Ancient Egypt',
      description: 'The cosmic principle of truth, justice, balance, and right order. Living in accordance with Maat is the goal of human existence. At death, the heart is weighed against the feather of Maat.',
    },
    {
      name: 'Nommo',
      description: 'The generative power of the word, breath, and name in Bantu philosophy. Speech is not merely communicative but creative — it calls reality into being and sustains it. To name is to make real.',
    },
    {
      name: 'The Ancestors',
      description: 'In many African traditions, the dead are not absent but present as a living moral community. Ancestors guide, protect, and hold the living accountable to the values and integrity of the lineage.',
    },
    {
      name: 'Communal Ethics',
      description: 'African philosophy grounds ethics in community and relationship rather than individual rights. The good person is one who fulfills their role in the web of mutual obligation — care, reciprocity, respect.',
    },
  ],
  'renaissance-philosophy': [
    {
      name: 'Studia Humanitatis',
      description: 'The humanist recovery of classical Greek and Latin texts gave Renaissance thinkers direct access to Plato, Cicero, and the Stoics. Human dignity, creative power, and this-worldly excellence became central.',
    },
    {
      name: 'The Essay — Montaigne',
      description: 'Montaigne\'s invention: thinking through writing, radical self-examination as philosophy. "What do I know?" asked of oneself relentlessly. The self as the proper object of philosophical inquiry.',
    },
    {
      name: 'Inductive Method — Bacon',
      description: 'Knowledge comes from observation and experiment, not deduction from first principles. The mind must first be cleared of its "idols" — the prejudices and assumptions that distort all perception.',
    },
    {
      name: 'Deus sive Natura — Spinoza',
      description: '"God or Nature" — they are identical. One infinite substance with infinite attributes. Freedom is not escape from necessity but understanding it. The liberated mind loves what is, as it is.',
    },
    {
      name: 'The Prisca Theologia',
      description: 'Renaissance thinkers recovered Hermetic, Neoplatonic, and Pythagorean texts and believed they preserved an ancient universal wisdom predating all religions — a philosophia perennis available to all.',
    },
  ],
  transcendentalism: [
    {
      name: 'The Over-Soul',
      description: 'The universal divine consciousness that underlies all individual minds. In moments of intuition and inspiration, the individual soul touches and participates in the Over-Soul — the mind behind all minds.',
    },
    {
      name: 'Self-Reliance',
      description: 'Trust the deep intuitions that arise in solitude. Conformity to society\'s expectations is a form of spiritual death. The greatest act available to any person is to be entirely and unapologetically themselves.',
    },
    {
      name: 'The Sacred in Nature',
      description: 'Nature is not merely physical but spiritual — a living symbol-system through which divinity speaks. Walking in nature is a form of prayer and philosophical inquiry. Every fact is a spiritual symbol.',
    },
    {
      name: 'Non-Conformity',
      description: 'Transcendentalists distrusted institutions — churches, governments, universities — and located moral authority in the individual conscience. Institutions calcify what should be alive.',
    },
    {
      name: 'Correspondence',
      description: 'Borrowed from Swedenborg and Hermeticism: the natural world corresponds to and reveals spiritual truths. Every natural fact is a symbol of a spiritual fact. Inner and outer reality are one.',
    },
  ],
  buddhism: [
    {
      name: 'The Four Noble Truths',
      description: 'The foundation of all Buddhist teaching: (1) suffering exists; (2) suffering has a cause — craving and clinging; (3) there is an end to suffering; (4) the Eightfold Path leads to that end. Not pessimism — a diagnosis followed by a cure.',
    },
    {
      name: 'The Eightfold Path',
      description: 'Right view, intention, speech, action, livelihood, effort, mindfulness, and concentration. Not sequential but simultaneous — eight dimensions of a single way of living that reduces suffering and increases understanding.',
    },
    {
      name: 'Impermanence — Anicca',
      description: 'All conditioned things arise and pass. Nothing that appears is permanent. The suffering caused by grasping at what cannot be held is eliminated not by denial but by the direct perception of impermanence as a fact of experience.',
    },
    {
      name: 'Non-Self — Anatta',
      description: 'There is no fixed, permanent, independent self. What we call "I" is a constantly changing process — a stream of sensations, thoughts, and perceptions with no unchanging core. Seeing this directly dissolves a fundamental source of suffering.',
    },
    {
      name: 'Mindfulness — Sati',
      description: 'Bare, non-judgmental attention to present-moment experience — the body, feelings, mind states, and phenomena as they actually are. The central meditative practice, and also the quality of attention that can be brought to every moment of ordinary life.',
    },
  ],
  taoism: [
    {
      name: 'The Tao — The Way',
      description: 'The nameless source and ground of all things — prior to heaven and earth, inexhaustible, giving rise to everything without effort. It cannot be fully grasped by the conceptual mind, but it can be aligned with through stillness, simplicity, and non-striving.',
    },
    {
      name: 'Wu Wei — Non-Action',
      description: 'Not passivity but effortless action: moving with the natural flow of things rather than against it. The sage acts without forcing, achieves without striving, leads without dominating. Water is the model: soft, yielding, unstoppable.',
    },
    {
      name: 'Te — Virtue and Power',
      description: 'The particular expression of the Tao in each thing — its essential nature and natural power. Human Te is the quality that emerges when a person acts in full alignment with their nature: not a moral ideal imposed from outside, but authenticity itself.',
    },
    {
      name: 'Ziran — Naturalness',
      description: '"Self-so-ness" — the quality of being exactly what one is without pretense, effort, or performance. The infant, the master craftsman, the sage: all act from the same rootedness in their own nature. Civilization often teaches us away from this; wisdom is the return.',
    },
    {
      name: 'The Return — Fu',
      description: 'All things return to the root. The cycle of emanation and return runs through all of nature and human life. The Taoist sage embraces this: each ending is a returning, each stillness a gathering. To know the constant is the beginning of wisdom.',
    },
  ],
  vedanta: [
    {
      name: 'Brahman — The Absolute',
      description: 'The one infinite, self-luminous consciousness that is the ground and substance of all reality. Not a deity in the ordinary sense but the very being in which all things appear — eternal, unchanging, self-aware, without a second.',
    },
    {
      name: 'Atman — The True Self',
      description: 'The individual self, at its deepest level, is identical with Brahman. The sense of being a separate, limited entity is the fundamental illusion (maya). Liberation is the direct recognition — not as a concept but as living experience — of this identity.',
    },
    {
      name: 'Maya — Appearance',
      description: 'The world as ordinarily experienced — as a collection of separate, self-subsisting objects — is not unreal but not independently real: it appears within and through Brahman, like a dream within the dreaming mind. The error is taking it to be ultimate.',
    },
    {
      name: 'Self-Inquiry — Atma Vichara',
      description: 'The practice of directing attention back to the source of the sense of "I": who is it that is aware? Following this question inward, not seeking a conceptual answer but a direct recognition, is the central method of Advaita Vedanta.',
    },
    {
      name: 'The Four Yogas',
      description: 'Paths suited to different temperaments: Jnana (knowledge), Bhakti (devotion), Karma (action), and Raja (meditation). Each leads to the same recognition through different doors. The integration of all four is the fullest expression of the teaching.',
    },
  ],
  existentialism: [
    {
      name: 'Existence Precedes Essence',
      description: 'Human beings have no fixed, given nature. We exist first — thrown into a world we did not choose — and then we create ourselves through choices, commitments, and actions. There is no blueprint for a human being; there is only the life one lives.',
    },
    {
      name: 'Radical Freedom',
      description: 'We are "condemned to be free": there is no escaping the burden of choice. Every moment is a choice, including the choice not to choose. Freedom is not a gift but a condition — and with it comes absolute responsibility for what one makes of it.',
    },
    {
      name: 'Authentic Existence',
      description: 'Most people live inauthentically — conforming to social roles, deferring to convention, fleeing from the anxiety of genuine choice. Authenticity means owning one\'s freedom, making choices as genuinely one\'s own, and accepting the full weight of that responsibility.',
    },
    {
      name: 'The Absurd',
      description: 'The clash between the human demand for meaning and the universe\'s silence. Camus\'s insight: the honest response is neither despair nor false faith, but revolt — continuing to live fully, consciously, and in defiance of the meaninglessness, finding value in the act itself.',
    },
    {
      name: 'Bad Faith',
      description: 'Sartre\'s term for the self-deception by which people deny their freedom — pretending they had no choice, hiding behind roles, treating themselves as determined objects rather than free subjects. The first step toward authenticity is recognizing bad faith in oneself.',
    },
  ],
  'kemetic-wisdom': [
    {
      name: 'Ma\'at — Cosmic Order',
      description: 'The foundational principle of ancient Egyptian civilization: truth, justice, balance, and right order. Ma\'at is both the structure of the cosmos and the standard for human conduct. To live in alignment with Ma\'at is the purpose of human existence; at death, the heart is weighed against Ma\'at\'s feather.',
    },
    {
      name: 'The Silent Man',
      description: 'The ideal of Kemetic wisdom: the person whose inner life is so ordered, so free from reactive passion, that they speak and act from Ma\'at alone. Silence here is not passivity but the quality of a still mind that receives truth without distortion and acts without compulsion.',
    },
    {
      name: 'The Heart — Ib',
      description: 'The heart (ib) is the seat of intelligence, will, conscience, and character in ancient Egyptian thought. It is not the physical organ but the whole inner person — what we might call the self or soul. Its health, its alignment with Ma\'at, is the central concern of Kemetic philosophy.',
    },
    {
      name: 'The Ancestors and the Living Dead',
      description: 'Those who lived in Ma\'at do not simply vanish at death — they continue as a moral presence, an ethical inheritance. The wisdom of the ancestors, embodied in texts like the Maxims of Ptahhotep, is a living transmission from those who have already navigated the challenges of human existence.',
    },
    {
      name: 'Thoth — Divine Wisdom',
      description: 'The ibis-headed divine principle of wisdom, writing, and the ordering of knowledge. Thoth represents the intelligence that structures reality — the cognitive aspect of Ma\'at. To align with Thoth is to seek genuine understanding and to record and transmit truth faithfully.',
    },
  ],
}
