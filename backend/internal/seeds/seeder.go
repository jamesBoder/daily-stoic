package seeds

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"

	"github.com/jamesBoder/daily-stoic/internal/models"
	"gorm.io/gorm"
)

//go:embed data
var seedFS embed.FS

var traditionSeedData = []models.Tradition{
	{ID: 1, Name: "Stoicism", Slug: "stoicism", Tier: "free", SortOrder: 1},
	{ID: 2, Name: "Hermeticism", Slug: "hermeticism", Tier: "premium", SortOrder: 2},
	{ID: 3, Name: "Neoplatonism", Slug: "neoplatonism", Tier: "premium", SortOrder: 3},
	{ID: 4, Name: "Gnosticism", Slug: "gnosticism", Tier: "premium", SortOrder: 4},
	{ID: 5, Name: "Kabbalah", Slug: "kabbalah", Tier: "premium", SortOrder: 5},
	{ID: 6, Name: "Pythagoreanism", Slug: "pythagoreanism", Tier: "premium", SortOrder: 6},
	{ID: 7, Name: "Pre-Socratic", Slug: "pre-socratic", Tier: "premium", SortOrder: 7},
	{ID: 8, Name: "African Philosophy", Slug: "african-philosophy", Tier: "free", SortOrder: 8},
	{ID: 9, Name: "Renaissance Philosophy", Slug: "renaissance-philosophy", Tier: "free", SortOrder: 9},
	{ID: 10, Name: "Transcendentalism", Slug: "transcendentalism", Tier: "free", SortOrder: 10},
	// Expansion traditions — seeded via SeedNewTraditions
	{ID: 11, Name: "Buddhism", Slug: "buddhism", Tier: "free", SortOrder: 11},
	{ID: 12, Name: "Taoism", Slug: "taoism", Tier: "free", SortOrder: 12},
	{ID: 13, Name: "Vedanta", Slug: "vedanta", Tier: "premium", SortOrder: 13},
	{ID: 14, Name: "Existentialism", Slug: "existentialism", Tier: "free", SortOrder: 14},
	{ID: 15, Name: "Kemetic Wisdom", Slug: "kemetic-wisdom", Tier: "free", SortOrder: 15},
}

var authorSeedData = []models.Author{
	// Stoicism (tradition 1)
	{Slug: "marcus-aurelius", Name: "Marcus Aurelius", Born: "121 AD", Died: "180 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q1427"},
	{Slug: "epictetus", Name: "Epictetus", Born: "50 AD", Died: "135 AD", Nationality: "Greek", TraditionID: 1, WikidataID: "Q37606"},
	{Slug: "seneca", Name: "Seneca", Born: "4 BC", Died: "65 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q2054"},
	{Slug: "zeno-of-citium", Name: "Zeno of Citium", Born: "334 BC", Died: "262 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q38768"},
	{Slug: "chrysippus", Name: "Chrysippus", Born: "279 BC", Died: "206 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q175697"},
	{Slug: "musonius-rufus", Name: "Musonius Rufus", Born: "20 AD", Died: "101 AD", Nationality: "Roman", TraditionID: 1, WikidataID: "Q316696"},
	{Slug: "cato-the-younger", Name: "Cato the Younger", Born: "95 BC", Died: "46 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q193290"},
	{Slug: "cleanthes", Name: "Cleanthes", Born: "330 BC", Died: "230 BC", Nationality: "Greek", TraditionID: 1, WikidataID: "Q178359"},
	{Slug: "hierocles", Name: "Hierocles", Born: "100 AD", Died: "150 AD", Nationality: "Greek", TraditionID: 1, WikidataID: "Q314261"},
	{Slug: "cicero", Name: "Cicero", Born: "106 BC", Died: "43 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q1541"},
	{Slug: "publius-syrus", Name: "Publius Syrus", Born: "85 BC", Died: "43 BC", Nationality: "Roman", TraditionID: 1, WikidataID: "Q216895"},
	// African Philosophy (tradition 8)
	{Slug: "kocc-barma-fall", Name: "Kocc Barma Fall", Born: "1586", Died: "1655", Nationality: "Senegalese", TraditionID: 8, WikidataID: "Q3197285"},
	// Renaissance Philosophy (tradition 9)
	{Slug: "montaigne", Name: "Michel de Montaigne", Born: "1533", Died: "1592", Nationality: "French", TraditionID: 9, WikidataID: "Q44267"},
	{Slug: "francis-bacon", Name: "Francis Bacon", Born: "1561", Died: "1626", Nationality: "English", TraditionID: 9, WikidataID: "Q37388"},
	{Slug: "spinoza", Name: "Baruch Spinoza", Born: "1632", Died: "1677", Nationality: "Dutch", TraditionID: 9, WikidataID: "Q35802"},
	// Transcendentalism (tradition 10)
	{Slug: "emerson", Name: "Ralph Waldo Emerson", Born: "1803", Died: "1882", Nationality: "American", TraditionID: 10, WikidataID: "Q35185"},
	// Hermeticism (tradition 2) — premium
	{Slug: "hermes-trismegistus", Name: "Hermes Trismegistus", Born: "Unknown", Died: "Unknown", Nationality: "Egyptian/Greek", TraditionID: 2, WikidataID: "Q193514"},
	{Slug: "three-initiates", Name: "Three Initiates", Born: "Unknown", Died: "Unknown", Nationality: "American", TraditionID: 2, WikidataID: ""},
	// Neoplatonism (tradition 3) — premium
	{Slug: "plotinus", Name: "Plotinus", Born: "204 AD", Died: "270 AD", Nationality: "Roman/Egyptian", TraditionID: 3, WikidataID: "Q47154"},
	{Slug: "porphyry", Name: "Porphyry", Born: "234 AD", Died: "305 AD", Nationality: "Phoenician", TraditionID: 3, WikidataID: "Q153613"},
	{Slug: "proclus", Name: "Proclus", Born: "412 AD", Died: "485 AD", Nationality: "Greek", TraditionID: 3, WikidataID: "Q131601"},
	// Buddhism (tradition 11)
	{Slug: "siddhartha-gautama", Name: "Siddhartha Gautama", Born: "c. 563 BCE", Died: "c. 483 BCE", Nationality: "Nepalese/Indian", TraditionID: 11, WikidataID: "Q9458"},
	{Slug: "thich-nhat-hanh", Name: "Thich Nhat Hanh", Born: "1926", Died: "2022", Nationality: "Vietnamese", TraditionID: 11, WikidataID: "Q334597"},
	{Slug: "nagarjuna", Name: "Nagarjuna", Born: "c. 150 CE", Died: "c. 250 CE", Nationality: "Indian", TraditionID: 11, WikidataID: "Q1399"},
	// Taoism (tradition 12)
	{Slug: "laozi", Name: "Laozi", Born: "c. 6th century BCE", Died: "Unknown", Nationality: "Chinese", TraditionID: 12, WikidataID: "Q9333"},
	{Slug: "zhuangzi", Name: "Zhuangzi", Born: "c. 369 BCE", Died: "c. 286 BCE", Nationality: "Chinese", TraditionID: 12, WikidataID: "Q5967"},
	// Vedanta (tradition 13) — premium
	{Slug: "adi-shankaracharya", Name: "Adi Shankaracharya", Born: "c. 788 CE", Died: "c. 820 CE", Nationality: "Indian", TraditionID: 13, WikidataID: "Q44257"},
	{Slug: "ramana-maharshi", Name: "Ramana Maharshi", Born: "1879", Died: "1950", Nationality: "Indian", TraditionID: 13, WikidataID: "Q208823"},
	{Slug: "swami-vivekananda", Name: "Swami Vivekananda", Born: "1863", Died: "1902", Nationality: "Indian", TraditionID: 13, WikidataID: "Q116149"},
	// Existentialism (tradition 14)
	{Slug: "albert-camus", Name: "Albert Camus", Born: "1913", Died: "1960", Nationality: "French-Algerian", TraditionID: 14, WikidataID: "Q34670"},
	{Slug: "soren-kierkegaard", Name: "Søren Kierkegaard", Born: "1813", Died: "1855", Nationality: "Danish", TraditionID: 14, WikidataID: "Q37396"},
	{Slug: "viktor-frankl", Name: "Viktor Frankl", Born: "1905", Died: "1997", Nationality: "Austrian", TraditionID: 14, WikidataID: "Q153938"},
	{Slug: "simone-de-beauvoir", Name: "Simone de Beauvoir", Born: "1908", Died: "1986", Nationality: "French", TraditionID: 14, WikidataID: "Q7197"},
	// Kemetic Wisdom (tradition 15)
	{Slug: "ptahhotep", Name: "Ptahhotep", Born: "c. 2400 BCE", Died: "Unknown", Nationality: "Egyptian", TraditionID: 15, WikidataID: "Q311516"},
	{Slug: "amenemope", Name: "Amenemope", Born: "c. 1100 BCE", Died: "Unknown", Nationality: "Egyptian", TraditionID: 15, WikidataID: "Q316506"},
}

// authorBios maps slug → biography text. Applied by UpdateAuthorBios on every startup.
var authorBios = map[string]string{
	"marcus-aurelius":    "Marcus Aurelius (121–180 AD) was Emperor of Rome from 161 to 180 and the last of the Five Good Emperors. A student of Stoic philosophy, he kept a private journal of self-improvement that we know as the Meditations — never intended for publication, it is one of the most intimate documents of philosophical self-examination ever produced. He practiced Stoic principles under the extreme pressures of empire, plague, war, and personal loss.",
	"epictetus":          "Epictetus (c. 50–135 AD) was born a slave in Hierapolis, Phrygia, and studied Stoic philosophy under Musonius Rufus in Rome. After gaining his freedom, he founded a school in Nicopolis whose teachings — delivered as spoken discourses and recorded by his student Arrian — became the Discourses and the Enchiridion. His entire philosophy centers on a single radical distinction: between what is 'up to us' and what is not.",
	"seneca":             "Lucius Annaeus Seneca (4 BC–65 AD) was a Roman statesman, philosopher, and playwright who served as advisor to Emperor Nero. His extensive letters and essays — particularly the Letters to Lucilius and On the Shortness of Life — make Stoic philosophy vivid and personal. He was ultimately forced to commit suicide by Nero, and by all accounts faced death with the composure he had written about for decades.",
	"zeno-of-citium":     "Zeno of Citium (c. 334–262 BC) was the founder of Stoic philosophy. Born in Cyprus, he came to Athens after a shipwreck and studied the Cynics before founding his own school in the Stoa Poikile — the 'Painted Porch' — from which Stoicism takes its name. None of his writings survive intact, but his ideas were preserved and developed by Chrysippus and later Stoics, shaping Western philosophy for six centuries.",
	"chrysippus":         "Chrysippus of Soli (c. 279–206 BC) was the third head of the Stoic school and is credited with systematizing Stoic philosophy. He wrote over 700 works, of which only fragments survive. His rigorous contributions to logic, ethics, and cosmology gave Stoicism the intellectual foundations it needed to survive. An ancient saying held: 'Without Chrysippus, there would be no Stoa.'",
	"musonius-rufus":     "Gaius Musonius Rufus (c. 20–101 AD) was a Roman Stoic philosopher and teacher twice exiled for his views. Known as 'the Roman Socrates,' he emphasized the practical application of philosophy in daily life and the moral equality of men and women — views radical for his time. His lectures, preserved by his students, address education, poverty, food, and ethics with characteristic directness.",
	"cato-the-younger":   "Marcus Porcius Cato Uticensis (95–46 BC) was a Roman statesman who became the living embodiment of Stoic virtue for his age. His uncompromising opposition to Julius Caesar's seizure of power and his death by suicide at Utica — choosing death over surrender — made him a legendary figure for later Stoics. Seneca held him as the supreme model of the Stoic sage: a man who had mastered himself.",
	"cleanthes":          "Cleanthes of Assos (330–230 BC) was the second head of the Stoic school after Zeno. He worked as a water-carrier at night to pay for his philosophical education by day — an embodiment of Stoic industry and endurance. He is best known for his Hymn to Zeus, the only Stoic poem to survive complete, which expresses the Stoic vision of a rational, divine cosmos with striking poetic force.",
	"cicero":             "Marcus Tullius Cicero (106–43 BC) was Rome's greatest orator and a statesman who popularized Greek philosophy for Latin readers. Though he identified most with Academic Skepticism, his philosophical works — On the Nature of the Gods, On Duties, Tusculan Disputations — transmitted Stoic and Platonic ideas to the Roman world and, through it, to all of Western philosophy and politics.",
	"kocc-barma-fall":    "Kocc Barma Fall (1586–1655) was a Seereer philosopher, counselor, and oral sage from Senegal, regarded as one of the most brilliant thinkers in the history of West African oral philosophy. His proverbs, transmitted through the oral tradition, encode a philosophy of communal responsibility, self-knowledge, and the relationship between human wisdom and divine order — a living tradition long predating its European counterparts.",
	"montaigne":          "Michel de Montaigne (1533–1592) was a French Renaissance philosopher who invented the modern essay form. Withdrawing from public life to his tower library, he developed a personal and skeptical philosophy grounded in radical self-examination and tolerance. His Essays are among the most influential works in Western literature — intimate, digressive, and remarkably modern in their attention to the full complexity of a single human life.",
	"francis-bacon":      "Francis Bacon (1561–1626) was an English philosopher, statesman, and father of empiricism. His Novum Organum proposed replacing deductive scholasticism with inductive reasoning from observed facts, laying the intellectual foundation for modern science. His aphorisms on knowledge, learning, and the idols of the mind remain a corrective to every age's characteristic intellectual laziness and premature certainty.",
	"spinoza":            "Baruch Spinoza (1632–1677) was a Dutch philosopher of Portuguese-Jewish descent who was excommunicated from his synagogue at 23 for views deemed heretical. His Ethics, written in geometric form, presents a pantheist vision in which God and Nature are identical. His philosophy of freedom through understanding — that human bondage is slavery to passion, and freedom is achieved through clear thinking — has influenced every major subsequent philosopher.",
	"emerson":            "Ralph Waldo Emerson (1803–1882) was an American philosopher, essayist, and poet who founded the Transcendentalist movement. A former minister, he broke with institutional religion to proclaim the divinity of the individual soul and its direct access to the universe's spiritual laws. His essays — Self-Reliance, The Over-Soul, Nature — became founding texts of American intellectual life, inspiring figures from Walt Whitman to William James.",
	"hermes-trismegistus": "Hermes Trismegistus — 'Thrice-Greatest Hermes' — is the legendary author of the Hermetic corpus: texts from the 1st–3rd centuries CE blending Greek, Egyptian, and Near Eastern wisdom. Identified with both the Greek Hermes and the Egyptian Thoth, he was regarded as the founder of all esoteric knowledge. The Corpus Hermeticum and the Emerald Tablet shaped Neoplatonism, Renaissance magic, alchemy, and modern occultism, making him one of the most influential figures in Western esotericism.",
	"three-initiates":    "The Three Initiates are the anonymous authors of The Kybalion (1908), a work claiming to distill the ancient Hermetic oral tradition into seven universal principles. Their true identities remain unknown. The Kybalion systematizes Hermetic cosmology for modern readers and became one of the most widely read texts in 20th-century esoteric philosophy, influencing New Thought, Theosophy, and contemporary spiritual practice worldwide.",
	"plotinus":           "Plotinus (204–270 AD) was an Egyptian-born philosopher who founded Neoplatonism — the last great school of ancient philosophy. His collected works, the Enneads, edited posthumously by his student Porphyry, present a comprehensive metaphysics centered on three principles: the One, the Intellect (Nous), and the Soul. Plotinus taught that all reality emanates from the transcendent One, and that the soul's deepest purpose is to return to its source through contemplation. His influence on Christian, Islamic, and Jewish mysticism was immense.",
	"porphyry":           "Porphyry of Tyre (234–305 AD) was a Phoenician philosopher, student and biographer of Plotinus, and the editor who organized and published the Enneads. A prolific writer on logic, religion, and metaphysics, he synthesized Platonic, Pythagorean, and Aristotelian thought. His Isagoge became the standard logic textbook of the Middle Ages. Porphyry sought a philosophical path to the divine that transcended any single religious tradition.",
	"proclus":            "Proclus of Athens (412–485 AD) was the last great systematizer of Neoplatonism and head of the Platonic Academy at Athens. His Elements of Theology presented Neoplatonic metaphysics in strict axiomatic form; his Platonic Theology integrated all of Plato's dialogues into a unified system. His influence on medieval Christian, Islamic, and Jewish philosophy — transmitted in part through Pseudo-Dionysius — shaped mystical theology for a thousand years.",
	// Buddhism
	"siddhartha-gautama": "Siddhartha Gautama (c. 563–483 BCE) was a prince of the Shakya clan in what is now Nepal who renounced his royal inheritance to seek the end of suffering. After years of ascetic practice and meditation under the Bodhi tree at Bodh Gaya, he attained enlightenment and became the Buddha — 'the Awakened One.' His first teaching, the Dhammapada and the discourses of the Pali Canon, established the Four Noble Truths, the Eightfold Path, and a vision of liberation so compelling it has guided over half a billion people across two and a half millennia.",
	"thich-nhat-hanh":    "Thich Nhat Hanh (1926–2022) was a Vietnamese Zen master, poet, and peace activist who founded the Plum Village tradition. Exiled from Vietnam for his anti-war activism — he was nominated for the Nobel Peace Prize by Martin Luther King Jr. — he spent decades in France developing 'Engaged Buddhism': a practice that brings mindfulness into everyday action, social justice, and ecological care. His writing made the profound simple: presence, breath, and compassionate attention as the whole path.",
	"nagarjuna":          "Nagarjuna (c. 150–250 CE) was an Indian Buddhist philosopher who founded the Madhyamaka school and is considered, after the Buddha, the most important thinker in the Mahayana tradition. His Mulamadhyamakakarika established the doctrine of sunyata — emptiness: no phenomenon has fixed, independent existence; everything arises in dependence on everything else. This insight, Nagarjuna argued, is not nihilism but the very ground of compassion and freedom.",
	// Taoism
	"laozi":              "Laozi (c. 6th century BCE) is the legendary author of the Tao Te Ching — 'The Classic of the Way and Its Power' — one of the most translated texts in human history. Whether a single historical figure or a composite, the teaching attributed to him is consistent: the Tao is the nameless source of all things, and wisdom is the art of aligning with it through non-striving, simplicity, and returning to the root. His eighty-one verses have shaped Chinese philosophy, religion, art, and governance for two and a half thousand years.",
	"zhuangzi":           "Zhuangzi (c. 369–286 BCE) was a Chinese philosopher who developed Taoist thought into one of the most playful, paradoxical, and radical visions in world philosophy. The Inner Chapters of the book that bears his name are dense with allegory, humor, and dreamlike argument: the butterfly dream, Cook Ding's perfect butchering, Huangdi losing his pearl. His central insight — that all conceptual distinctions, including life and death, self and other, knowledge and ignorance, are constructions — points toward a freedom that cannot be named.",
	// Vedanta
	"adi-shankaracharya": "Adi Shankaracharya (c. 788–820 CE) was an Indian philosopher and theologian who consolidated Advaita Vedanta — non-dual philosophy — into one of the most comprehensive and rigorous metaphysical systems in history. Traveling the length of India on foot before his death at thirty-two, he debated and largely refuted the dualist schools, wrote major commentaries on the Upanishads and Bhagavad Gita, and established four mathas (monastic centers) that still exist today. His central teaching: Brahman alone is real, the individual self and Brahman are not two, and liberation is the recognition of this non-difference.",
	"ramana-maharshi":    "Ramana Maharshi (1879–1950) was an Indian sage who at sixteen experienced a spontaneous death-and-rebirth encounter that dissolved his sense of being a separate self. He spent the rest of his life in Tiruvannamalai, South India, teaching through silence and the practice of self-inquiry: 'Who am I?' His method is radical in its simplicity — turn attention back to the one who is aware, and all questions dissolve into the source from which they arose. He is regarded by many as the clearest exemplar of Advaita Vedanta in modern times.",
	"swami-vivekananda":  "Swami Vivekananda (1863–1902) was an Indian monk, disciple of Ramakrishna, and the first teacher to bring Vedanta to the Western world. His address to the Parliament of the World's Religions in Chicago in 1893 — beginning 'Sisters and brothers of America' — stunned the audience and launched a global conversation about Indian philosophy. A tireless teacher who died at thirty-nine, he sought to unite Advaita Vedanta with practical action: the divine is in every human being, and serving humanity is the highest worship.",
	// Existentialism
	"albert-camus":       "Albert Camus (1913–1960) was a French-Algerian novelist, playwright, and philosopher who refused all ideological camps — communist, existentialist, nationalist — while confronting the central question of his age: why not suicide? His answer, developed through The Myth of Sisyphus, The Stranger, and The Plague, is that life is absurd — there is no cosmic meaning — and the right response to this is neither despair nor false hope but revolt: living fully, honestly, and in solidarity with others, with clear eyes. He won the Nobel Prize in Literature in 1957.",
	"soren-kierkegaard":  "Søren Kierkegaard (1813–1855) was a Danish philosopher who is widely regarded as the father of existentialism. Writing under multiple pseudonyms and attacking the complacency of bourgeois Christianity, he argued that the deepest questions — how to live, what to believe, how to become a self — cannot be answered by system or doctrine but only by the individual in the anguish of genuine choice. His three stages of existence (aesthetic, ethical, and religious), his analysis of anxiety and despair, and his concept of the 'leap of faith' shaped a century of European philosophy.",
	"viktor-frankl":      "Viktor Frankl (1905–1997) was an Austrian psychiatrist and Holocaust survivor who developed logotherapy — the therapeutic approach centered on the search for meaning. His account of survival in Auschwitz and three other concentration camps, Man's Search for Meaning, argues that even in the most dehumanizing conditions, human beings retain the freedom to choose their response and find meaning in suffering, love, and purposeful action. It is one of the most widely read books of the twentieth century.",
	"simone-de-beauvoir": "Simone de Beauvoir (1908–1986) was a French existentialist philosopher and feminist writer whose work bridges abstract philosophy and lived experience. The Second Sex (1949) — 'one is not born, but rather becomes, a woman' — is one of the founding texts of modern feminism, applying existentialist analysis to the situation of women. Her Ethics of Ambiguity develops an existentialist ethics of freedom: genuine human freedom requires the freedom of all others, and the refusal of this interdependence is a form of bad faith.",
	// Kemetic Wisdom
	"ptahhotep":          "Ptahhotep (c. 2400 BCE) was an ancient Egyptian official under Pharaoh Djedkare Isesi of the Fifth Dynasty and is the attributed author of The Maxims of Ptahhotep — one of the oldest surviving works of moral philosophy in the world, predating most Greek philosophy by two thousand years. The Maxims are a collection of thirty-seven precepts on wisdom, leadership, justice, and right relationship, structured as instruction from an old man to his son. They reveal a sophisticated ethical tradition rooted in Ma'at — cosmic order, truth, and balance — that lies at the heart of ancient Egyptian civilization.",
	"amenemope":          "Amenemope (c. 1100 BCE) was an ancient Egyptian official and scribe who composed the Wisdom of Amenemope — a collection of thirty chapters of moral instruction later reflected in the Hebrew Book of Proverbs (Proverbs 22:17–24:22). Writing during the Ramesside period, he grounds all ethical action in Ma'at (cosmic truth and balance), Thoth (divine wisdom), and the cultivation of the 'silent man' — a person so inwardly still and just that they act from principle rather than passion. His work demonstrates the pan-African depth of philosophical reflection long before European antiquity.",
}

type quoteJSON struct {
	Text             string  `json:"text"`
	Source           string  `json:"source"`
	AuthorSlug       string  `json:"author_slug"`
	TraditionID      uint    `json:"tradition_id"`
	Themes           string  `json:"themes"`
	Tier             string  `json:"tier"`
	QualityScore     float64 `json:"quality_score"`
	ContextFull      string  `json:"context_full"`
	ReflectionPrompt string  `json:"reflection_prompt"`
}

// SeedDevUser upserts a local dev account with lifetime access.
// Safe to call on every startup — idempotent.
// Credentials: dev@dailystoic.local / DevStoic1!
func SeedDevUser(db *gorm.DB) error {
	devUser := models.User{
		Email:         "dev@dailystoic.local",
		Username:      "dev",
		Password:      "DevStoic1!",
		EmailVerified: true,
	}
	var user models.User
	if err := db.Where("email = ?", devUser.Email).FirstOrCreate(&user, devUser).Error; err != nil {
		return fmt.Errorf("seed: dev user: %w", err)
	}

	var sub models.Subscription
	if err := db.Where(models.Subscription{UserID: user.ID}).
		Assign(models.Subscription{Tier: "lifetime", Status: "active"}).
		FirstOrCreate(&sub).Error; err != nil {
		return fmt.Errorf("seed: dev subscription: %w", err)
	}

	log.Printf("Dev user ready — email: %s  tier: %s", user.Email, sub.Tier)
	return nil
}

// SeedPremiumContent seeds Hermetic and Neoplatonic quotes from data/premium/.
// Runs on every startup but is a no-op once any tradition-2 or tradition-3 quotes exist.
func SeedPremiumContent(db *gorm.DB) error {
	// Ensure premium authors exist (idempotent — FirstOrCreate)
	authorIDBySlug := make(map[string]uint)
	for _, a := range authorSeedData {
		if a.TraditionID != 2 && a.TraditionID != 3 {
			continue
		}
		var existing models.Author
		if err := db.Where("slug = ?", a.Slug).FirstOrCreate(&existing, a).Error; err != nil {
			log.Printf("seed premium: author %s: %v", a.Slug, err)
			continue
		}
		authorIDBySlug[a.Slug] = existing.ID
	}

	var count int64
	db.Model(&models.Quote{}).Where("tradition_id IN (2,3)").Count(&count)
	if count > 0 {
		log.Printf("Premium content already seeded (%d quotes) — skipping", count)
		return nil
	}

	entries, err := fs.ReadDir(seedFS, "data/premium")
	if err != nil {
		return fmt.Errorf("seed premium: read dir: %w", err)
	}

	created, skipped, failed := 0, 0, 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		raw, err := seedFS.ReadFile("data/premium/" + entry.Name())
		if err != nil {
			log.Printf("seed premium: read %s: %v", entry.Name(), err)
			continue
		}
		var quotes []quoteJSON
		if err := json.Unmarshal(raw, &quotes); err != nil {
			log.Printf("seed premium: parse %s: %v", entry.Name(), err)
			continue
		}
		for _, q := range quotes {
			authorID, ok := authorIDBySlug[q.AuthorSlug]
			if !ok {
				log.Printf("seed premium: unknown author slug %q in %s", q.AuthorSlug, entry.Name())
				failed++
				continue
			}
			var themes models.StringSlice
			if q.Themes != "" {
				_ = json.Unmarshal([]byte(q.Themes), &themes)
			}
			quote := models.Quote{
				Text:             q.Text,
				Source:           q.Source,
				AuthorID:         authorID,
				TraditionID:      q.TraditionID,
				Themes:           themes,
				Tier:             q.Tier,
				QualityScore:     q.QualityScore,
				ContextFull:      q.ContextFull,
				ReflectionPrompt: q.ReflectionPrompt,
			}
			var existing models.Quote
			if db.Where("text = ? AND author_id = ?", q.Text, authorID).First(&existing).Error == nil {
				skipped++
				continue
			}
			if err := db.Create(&quote).Error; err != nil {
				failed++
			} else {
				created++
			}
		}
	}

	log.Printf("Premium seed complete — created: %d | skipped: %d | failed: %d", created, skipped, failed)
	return nil
}

// UpdateAuthorBios updates bio fields for all known authors. Idempotent — safe to call on every startup.
func UpdateAuthorBios(db *gorm.DB) error {
	updated := 0
	for slug, bio := range authorBios {
		res := db.Model(&models.Author{}).Where("slug = ?", slug).Update("bio", bio)
		if res.Error != nil {
			log.Printf("UpdateAuthorBios: %s: %v", slug, res.Error)
		} else {
			updated += int(res.RowsAffected)
		}
	}
	log.Printf("UpdateAuthorBios: updated %d author(s)", updated)
	return nil
}

// UpdateQuoteContent patches context_full and reflection_prompt for quotes that currently have
// empty values, matching by (text, author_id). Safe to call on every startup.
func UpdateQuoteContent(db *gorm.DB) error {
	// Build author slug → ID map
	var authors []models.Author
	if err := db.Find(&authors).Error; err != nil {
		return fmt.Errorf("UpdateQuoteContent: load authors: %w", err)
	}
	slugToID := make(map[string]uint, len(authors))
	for _, a := range authors {
		slugToID[a.Slug] = a.ID
	}

	updated := 0
	for _, dir := range []string{"data", "data/premium"} {
		entries, err := fs.ReadDir(seedFS, dir)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			raw, err := seedFS.ReadFile(dir + "/" + entry.Name())
			if err != nil {
				continue
			}
			var quotes []quoteJSON
			if err := json.Unmarshal(raw, &quotes); err != nil {
				continue
			}
			for _, q := range quotes {
				if q.ContextFull == "" && q.ReflectionPrompt == "" {
					continue
				}
				authorID, ok := slugToID[q.AuthorSlug]
				if !ok {
					continue
				}
				res := db.Model(&models.Quote{}).
					Where("text = ? AND author_id = ? AND (context_full = '' OR context_full IS NULL)", q.Text, authorID).
					Updates(map[string]interface{}{
						"context_full":      q.ContextFull,
						"reflection_prompt": q.ReflectionPrompt,
					})
				if res.Error != nil {
					log.Printf("UpdateQuoteContent: %s: %v", q.AuthorSlug, res.Error)
				} else {
					updated += int(res.RowsAffected)
				}
			}
		}
	}
	log.Printf("UpdateQuoteContent: patched %d quote(s)", updated)
	return nil
}

// SeedNewTraditions seeds IDs 11–15 (Buddhism, Taoism, Vedanta, Existentialism, Kemetic Wisdom).
// Idempotent: upserts traditions and authors, skips quote files whose tradition already has quotes.
// Call after SeedIfEmpty and SeedPremiumContent on every startup.
func SeedNewTraditions(db *gorm.DB) error {
	newTraditionIDs := map[uint]bool{11: true, 12: true, 13: true, 14: true, 15: true}

	// 1. Upsert traditions
	for _, t := range traditionSeedData {
		if !newTraditionIDs[t.ID] {
			continue
		}
		tc := t
		if err := db.Where(models.Tradition{ID: t.ID}).FirstOrCreate(&tc).Error; err != nil {
			log.Printf("SeedNewTraditions: tradition %s: %v", t.Slug, err)
		}
	}

	// 2. Upsert authors for new traditions
	authorIDBySlug := make(map[string]uint)
	for _, a := range authorSeedData {
		if !newTraditionIDs[a.TraditionID] {
			continue
		}
		ac := a
		var existing models.Author
		if err := db.Where("slug = ?", a.Slug).FirstOrCreate(&existing, ac).Error; err != nil {
			log.Printf("SeedNewTraditions: author %s: %v", a.Slug, err)
			continue
		}
		authorIDBySlug[a.Slug] = existing.ID
	}

	// 3. Seed quotes per tradition from the appropriate directory.
	//    Free traditions (11,12,14,15) → data/; Premium tradition (13) → data/premium/.
	type traditionConfig struct {
		id  uint
		dir string
	}
	configs := []traditionConfig{
		{11, "data"}, {12, "data"}, {14, "data"}, {15, "data"},
		{13, "data/premium"},
	}

	totalCreated, totalSkipped, totalFailed := 0, 0, 0

	for _, cfg := range configs {
		var count int64
		db.Model(&models.Quote{}).Where("tradition_id = ?", cfg.id).Count(&count)
		if count > 0 {
			log.Printf("SeedNewTraditions: tradition %d already has %d quotes — skipping", cfg.id, count)
			continue
		}

		entries, err := fs.ReadDir(seedFS, cfg.dir)
		if err != nil {
			log.Printf("SeedNewTraditions: read dir %s: %v", cfg.dir, err)
			continue
		}

		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			raw, err := seedFS.ReadFile(cfg.dir + "/" + entry.Name())
			if err != nil {
				continue
			}
			var quotes []quoteJSON
			if err := json.Unmarshal(raw, &quotes); err != nil {
				continue
			}
			for _, q := range quotes {
				if q.TraditionID != cfg.id {
					continue // only process quotes belonging to this tradition
				}
				authorID, ok := authorIDBySlug[q.AuthorSlug]
				if !ok {
					totalFailed++
					continue
				}
				var themes models.StringSlice
				if q.Themes != "" {
					_ = json.Unmarshal([]byte(q.Themes), &themes)
				}
				quote := models.Quote{
					Text:             q.Text,
					Source:           q.Source,
					AuthorID:         authorID,
					TraditionID:      q.TraditionID,
					Themes:           themes,
					Tier:             q.Tier,
					QualityScore:     q.QualityScore,
					ContextFull:      q.ContextFull,
					ReflectionPrompt: q.ReflectionPrompt,
				}
				var existing models.Quote
				if db.Where("text = ? AND author_id = ?", q.Text, authorID).First(&existing).Error == nil {
					totalSkipped++
					continue
				}
				if err := db.Create(&quote).Error; err != nil {
					totalFailed++
				} else {
					totalCreated++
				}
			}
		}
	}

	log.Printf("SeedNewTraditions complete — created: %d | skipped: %d | failed: %d", totalCreated, totalSkipped, totalFailed)
	return nil
}

// SeedIfEmpty seeds traditions, authors, and quotes only when the quotes table
// is empty. Safe to call on every startup — it's a no-op after the first run.
func SeedIfEmpty(db *gorm.DB) error {
	var count int64
	db.Model(&models.Quote{}).Count(&count)
	if count > 0 {
		return nil
	}

	log.Println("Quotes table is empty — seeding database...")
	return seed(db)
}

func seed(db *gorm.DB) error {
	// Traditions
	for _, t := range traditionSeedData {
		if err := db.Where(models.Tradition{ID: t.ID}).FirstOrCreate(&t).Error; err != nil {
			log.Printf("seed: tradition %s: %v", t.Slug, err)
		}
	}

	// Authors — build slug→ID map for quote insertion
	authorIDBySlug := make(map[string]uint, len(authorSeedData))
	for _, a := range authorSeedData {
		var existing models.Author
		if err := db.Where("slug = ?", a.Slug).FirstOrCreate(&existing, a).Error; err != nil {
			log.Printf("seed: author %s: %v", a.Slug, err)
			continue
		}
		authorIDBySlug[a.Slug] = existing.ID
	}

	// Quotes — load every JSON file from the embedded data directory
	entries, err := fs.ReadDir(seedFS, "data")
	if err != nil {
		return err
	}

	created, skipped, failed := 0, 0, 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		raw, err := seedFS.ReadFile("data/" + entry.Name())
		if err != nil {
			log.Printf("seed: read %s: %v", entry.Name(), err)
			continue
		}
		var quotes []quoteJSON
		if err := json.Unmarshal(raw, &quotes); err != nil {
			log.Printf("seed: parse %s: %v", entry.Name(), err)
			continue
		}
		for _, q := range quotes {
			authorID, ok := authorIDBySlug[q.AuthorSlug]
			if !ok {
				failed++
				continue
			}
			var themes models.StringSlice
			if q.Themes != "" {
				_ = json.Unmarshal([]byte(q.Themes), &themes)
			}
			quote := models.Quote{
				Text:             q.Text,
				Source:           q.Source,
				AuthorID:         authorID,
				TraditionID:      q.TraditionID,
				Themes:           themes,
				Tier:             q.Tier,
				QualityScore:     q.QualityScore,
				ContextFull:      q.ContextFull,
				ReflectionPrompt: q.ReflectionPrompt,
			}
			var existing models.Quote
			if db.Where("text = ? AND author_id = ?", q.Text, authorID).First(&existing).Error == nil {
				skipped++
				continue
			}
			if err := db.Create(&quote).Error; err != nil {
				failed++
			} else {
				created++
			}
		}
	}

	log.Printf("Seed complete — created: %d | skipped: %d | failed: %d", created, skipped, failed)
	return nil
}
