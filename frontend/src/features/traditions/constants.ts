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
}

// ── Accent colors by slug ─────────────────────────────────────────────────────

export const ICON_COLOR: Record<string, string> = {
  stoicism:               '#8b7355',
  hermeticism:            '#9a6fd0',
  neoplatonism:           '#c8a83a',
  gnosticism:             '#c04060',
  kabbalah:               '#4080e0',
  pythagoreanism:         '#28c8b8',
  'pre-socratic':         '#e07830',
  'african-philosophy':   '#d08040',
  'renaissance-philosophy':'#48a048',
  transcendentalism:      '#4898d8',
}

export const ICON_COLOR_DARK: Record<string, string> = {
  stoicism:               '#d4a853',
  hermeticism:            '#c090ff',
  neoplatonism:           '#f0c840',
  gnosticism:             '#f06080',
  kabbalah:               '#70b0ff',
  pythagoreanism:         '#50e8d8',
  'pre-socratic':         '#f0a060',
  'african-philosophy':   '#e8a060',
  'renaissance-philosophy':'#70c870',
  transcendentalism:      '#70c0ff',
}

// ── ID-keyed lookups (AuthorPage) ─────────────────────────────────────────────

export const TRADITION_ICON: Record<number, string> = {
  1:  '⊕', 2:  '✦', 3:  '◎', 4:  '✧', 5:  '✡',
  6:  '△', 7:  '∞', 8:  '◇', 9:  '☿', 10: '☀',
}

export const TRADITION_NAME: Record<number, string> = {
  1:  'Stoicism',        2:  'Hermeticism',      3:  'Neoplatonism',
  4:  'Gnosticism',      5:  'Kabbalah',          6:  'Pythagoreanism',
  7:  'Pre-Socratic',    8:  'African Philosophy', 9:  'Renaissance Philosophy',
  10: 'Transcendentalism',
}

export const TRADITION_SLUG: Record<number, string> = {
  1:  'stoicism',        2:  'hermeticism',       3:  'neoplatonism',
  4:  'gnosticism',      5:  'kabbalah',           6:  'pythagoreanism',
  7:  'pre-socratic',    8:  'african-philosophy', 9:  'renaissance-philosophy',
  10: 'transcendentalism',
}

export const TRADITION_ACCENT: Record<number, { light: string; dark: string }> = {
  1:  { light: '#8b7355', dark: '#d4a853' },
  2:  { light: '#9a6fd0', dark: '#c090ff' },
  3:  { light: '#c8a83a', dark: '#f0c840' },
  4:  { light: '#c04060', dark: '#f06080' },
  5:  { light: '#4080e0', dark: '#70b0ff' },
  6:  { light: '#28c8b8', dark: '#50e8d8' },
  7:  { light: '#e07830', dark: '#f0a060' },
  8:  { light: '#d08040', dark: '#e8a060' },
  9:  { light: '#48a048', dark: '#70c870' },
  10: { light: '#4898d8', dark: '#70c0ff' },
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
}
