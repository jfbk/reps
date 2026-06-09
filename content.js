// content.js — vaste inhoud van de app. Geen state hier.

const TIER_NAMES = { 1: 'Presence', 2: 'Frame', 3: 'Leiden' };

// ctx: 'overal' = altijd doenbaar | 'sociaal' = in gezelschap | 'uit' = buiten bij vreemden
const CHALLENGES = [
  // Tier 1 — Presence
  { id: 101, tier: 1, ctx: 'overal', text: 'Hou oogcontact vast tot de ander het als eerste verbreekt.', why: 'Wie het eerste wegkijkt, bucklet. Train de spier die standhoudt.' },
  { id: 102, tier: 1, ctx: 'overal', text: 'Praat één gesprek lang bewust trager en lager. Laat stiltes vallen zonder ze op te vullen.', why: 'Tempo is een directe uiting van je interne staat. Langzamer = meer grond.' },
  { id: 103, tier: 1, ctx: 'overal', text: 'Spreek iemand aan met een statement over wat je ziet. Geen vraag erachteraan.', why: 'Een statement vraagt geen goedkeuring. Het legt iets neer en wacht.' },
  { id: 104, tier: 1, ctx: 'overal', text: 'Zeg de opmerking die jóu amuseert, ook als je niet weet of hij landt.', why: 'Self-amusement is aantrekkelijker dan proberen iemand te imponeren.' },
  { id: 105, tier: 1, ctx: 'overal', text: 'Loop een ruimte binnen alsof je er hoort. Geen scan voor goedkeuring.', why: 'Entitlement is een houding, geen eigenschap. Je kunt hem trainen.' },
  { id: 106, tier: 1, ctx: 'sociaal', text: "Geef je mening zonder 'ik denk' / 'misschien' / 'maakt niet uit'.", why: 'Hedges zijn frame-capitulatie in slow motion.' },
  { id: 107, tier: 1, ctx: 'overal', text: 'Lach of reageer zichtbaar op iets dat je raakt. Geen rem erop.', why: 'Expressie is signaal. Insluiten is zelf isoleren.' },

  // Tier 2 — Frame
  { id: 201, tier: 2, ctx: 'overal', text: 'Word getest of geplaagd? Blijf onbewogen, speel mee, verdedig niet.', why: 'Verdedigen is bevestigen dat de test raak was. Onbewogen blijven = test gefaald.' },
  { id: 202, tier: 2, ctx: 'overal', text: 'Laat een ongemakkelijke stilte 5-7 tellen staan. Vul hem niet in.', why: 'Wie de stilte vult, geeft de controle weg. Stilte is grond.' },
  { id: 203, tier: 2, ctx: 'sociaal', text: 'Neem in een groep de beslissing in plaats van te vragen wat iedereen wil.', why: 'Leiden zonder toestemming te vragen is het verschil tussen volger en leider.' },
  { id: 204, tier: 2, ctx: 'overal', text: 'Deel iets persoonlijks zonder disclaimer, zonder dat erom gevraagd wordt.', why: 'Kwetsbaarheid zonder apologie bouwt nabijheid sneller dan perfectie.' },
  { id: 205, tier: 2, ctx: 'overal', text: 'Zeg nee of stel een grens. Kalm, zonder excuus-spervuur.', why: 'Grenzen tonen zelfrespect. Wie zichzelf niet respecteert, wordt niet gerespecteerd.' },
  { id: 206, tier: 2, ctx: 'sociaal', text: 'Zeg dat je het oneens bent en hou je positie als ze terugduwen.', why: 'De meeste mensen capituleren bij de eerste weerstand. Jij niet.' },
  { id: 207, tier: 2, ctx: 'overal', text: 'Beëindig een interactie zelf op een hoogtepunt. Niet wachten tot het uitloopt.', why: 'Wie bepaalt wanneer het klaar is, had de leiding.' },

  // Tier 3 — Leiden
  { id: 301, tier: 3, ctx: 'sociaal', text: 'Neem de leiding in een groep: bepaal waar jullie heen gaan of wat er gebeurt.', why: 'Leiden begint met de bereidheid om verantwoordelijkheid te nemen zonder gevraagd te worden.' },
  { id: 302, tier: 3, ctx: 'uit', text: 'Stap met duidelijke intentie op iemand af die je aantrekkelijk vindt. Geen excuus, geen omweg.', why: 'Intentie tonen is de rep. Drie seconden bewegen vóór je brein het wegredeneert.' },
  { id: 303, tier: 3, ctx: 'sociaal', text: 'Escaleer een goed gesprek met een directe uiting van interesse. Geen hedge eromheen.', why: 'Vaagheid is de grootste energie-lek. Directheid werkt beter dan eromheen draaien.' },
  { id: 304, tier: 3, ctx: 'overal', text: 'Vraag rechtstreeks om wat je wil. Accepteer kalm elke uitkomst.', why: 'Outcome independence is de kern. Vragen zonder nodig hebben.' },
  { id: 305, tier: 3, ctx: 'sociaal', text: 'Doe een concreet voorstel om af te spreken: plek en moment. Geen "we moeten eens".', why: '"We moeten eens" is een sociaal gebaar, geen plan. Concreet geeft een vervolg.' },
  { id: 306, tier: 3, ctx: 'sociaal', text: 'Plaag iemand met een gecalibreerde steek. Laat de spanning staan, ga niet redden.', why: 'Push-pull houdt het levendig. "Redden" is het frame onmiddellijk teruggeven.' },
  { id: 307, tier: 3, ctx: 'sociaal', text: 'Leg intentie op tafel zonder eromheen te draaien. Geen excuus, geen hedge, geen uitleg.', why: 'Directheid is een positie, geen tactiek. Mensen respecteren wie weet wat hij wil.' },
];

// target = dagdoel: tik telt als rep, display toont "X/Y vandaag"
const LOOSE_QUESTS = [
  // Sociaal
  { id: 'soc_1', cat: 'soc', text: 'Geef vandaag 3 vreemden een oprecht, specifiek compliment.', target: 3 },
  { id: 'soc_2', cat: 'soc', text: 'Wees vandaag 3x degene die een vreemde aanspreekt.', target: 3 },
  { id: 'soc_3', cat: 'soc', text: 'Neem in een groep de leiding. Bepaal het onderwerp of de volgende stap.' },
  { id: 'soc_4', cat: 'soc', text: 'Geef een eerlijke mening die ze niet verwachten, zonder te verzachten.' },
  { id: 'soc_5', cat: 'soc', text: 'Spreek iemand met duidelijk overwicht (portier, security, ober) als gelijke aan.' },
  { id: 'soc_6', cat: 'soc', text: 'Hou je standpunt vast als er druk op staat. Geen stap terug.' },
  { id: 'soc_7', cat: 'soc', text: 'Zeg nee of stel een grens zonder excuus of uitleg.' },
  { id: 'soc_8', cat: 'soc', text: 'Vertel een verhaal aan een groep van 4+ mensen en hou de aandacht vast.' },
  { id: 'soc_9', cat: 'soc', text: 'Beëindig een gesprek zelf op een hoogtepunt. Niet wachten tot het uitloopt.' },

  // Dating
  { id: 'date_1', cat: 'date', text: 'Vraag vandaag 3 mensen die je aantrekkelijk vindt om hun insta of nummer.', target: 3 },
  { id: 'date_2', cat: 'date', text: 'Maak bij 5 aantrekkelijke mensen oogcontact en houd het vast tot zij het verbreken.', target: 5 },
  { id: 'date_3', cat: 'date', text: 'Spreek vandaag 3 aantrekkelijke vreemden aan met een statement, geen vraag.', target: 3 },
  { id: 'date_4', cat: 'date', text: 'Escaleer een goed gesprek met een directe uiting van interesse. Geen hedge.' },
  { id: 'date_5', cat: 'date', text: 'Plaag een crush met een gecalibreerde steek. Laat de spanning staan, ga niet redden.' },
  { id: 'date_6', cat: 'date', text: 'Stuur een statement in plaats van een vraag. Één bericht. Geen dubbeltekst.' },
  { id: 'date_7', cat: 'date', text: 'Vraag direct om een date met een concreet plan. Plek en moment.' },
  { id: 'date_8', cat: 'date', text: 'Doe een fysieke move die past bij de sfeer. Rustig blijven.' },
  { id: 'date_9', cat: 'date', text: 'Open een gesprek puur met de intentie om te amuseren, niet om te imponeren.' },
];

const THEORY = [
  // Fundamenten
  { title: 'Het spotlight-effect', body: 'We overschatten hoeveel anderen op ons letten. Iedereen is met zijn eigen zaal bezig. Jij bent de hoofdrol in jouw film, niet in de hunne.', source: 'Gilovich & Savitsky' },
  { title: 'Warmte komt eerst', body: 'Mensen lezen "is hij warm?" vóór "is hij competent?". Warmte weegt zwaarder en wordt sneller gelezen. Je kunt goed zijn, maar als je koud overkomt telt het niet mee.', source: 'Amy Cuddy' },
  { title: 'Blootstelling went', body: 'Angst piekt en zakt vanzelf als je blijft. Vermijden houdt hem in leven. Elke rep is bewijs dat het overleefbaar is.', source: 'exposure / habituatie' },
  { title: 'De drie seconden', body: 'Beweeg binnen ~3 tellen na de impuls, vóór je brein het wegredeneert. Het venster sluit snel. Actie vóór analyse.', source: 'approach window' },
  { title: 'De kosten van niks doen', body: 'Wie je nooit aanspreekt is een gegarandeerd niks. Inactie is ook een keuze, maar een die altijd verliest. Actie heeft een kans; inactie heeft er geen.', source: 'opportuniteitskosten' },
  { title: 'De ingebeelde rechtbank', body: 'Het publiek dat je voelt oordelen is grotendeels een spook uit je verleden. De zitting is voorbij. Niemand houdt bij hoe jij het deed.', source: 'Elkind — imaginary audience' },
  // Frame & frame control
  { title: 'Frame control', body: 'Elk gesprek heeft een frame: wie definieert wat er hier gebeurt? Wie de situatie omschrijft, leidt haar. Jij bepaalt het frame door te handelen alsof het al het jouwe is.', source: 'TyKwonDoe / social dynamics' },
  { title: 'Niet-reactiviteit', body: 'Hoe minder je reageert op provocatie of testrituelen, hoe meer frame je uitstraalt. De kalmste persoon in de ruimte heeft de meeste controle. Reactie = frame verloren.', source: 'TyKwonDoe' },
  { title: 'De test herkennen', body: 'Een shit test is een kalibratiemechanisme: "buckle je in?" Wie niet bucklet, houdt zijn frame. De juiste reactie is niet verdedigen maar meespelen of negeren.', source: 'frame testing / TyKwonDoe' },
  { title: 'Leiden zonder toestemming', body: 'Wachten op toestemming voor elke stap is het grootste sociale rem. Neem de beslissing, leid, kalibreer achteraf. Mensen volgen wie handelt.', source: 'TyKwonDoe' },
  { title: 'Locus of evaluation', body: 'Beslis zelf eerst of wat je deed oké was, vóór je hun gezicht afkijkt. Wie de evaluatie bij zichzelf houdt, is niet afhankelijk van externe validatie.', source: 'Carl Rogers' },
  // Non-needy & outcome independence
  { title: 'Non-needy / outcome independence', body: 'Aantrekkelijkheid groeit als je het gesprek kunt loslaten, ongeacht hoe het gaat. Nodig zijn is de energie die mensen voelen en van wegwijken. Loslaten is de techniek.', source: 'TyKwonDoe' },
  { title: 'Overvloed (abundance)', body: 'Wie vanuit schaarste handelt, overinvesteert, wordt clingy, forceert. Wie overvloed voelt, kan loslaten. Het gevoel is trainbaar via actie en herhaling.', source: 'abundance mindset' },
  { title: 'Benoem de gedachte', body: 'Bij de drang naar bevestiging of goedkeuring: "dit is de craving, niet een echte behoefte." Die halve seconde afstand is genoeg om er niet aan te capituleren.', source: 'cognitieve defusie' },
  // Self-amusement & directheid
  { title: 'Self-amusement', body: 'De sterkste attractie-pool is iemand die zichzelf amuseert. Zeggen wat jóu grappig is werkt beter dan proberen iemand te imponeren. Energie volgt echtheid.', source: 'TyKwonDoe' },
  { title: 'Intentie tonen', body: 'Vaagheid is de grootste energie-lek. Directheid — ook als het eng voelt — is aantrekkelijker dan eromheen draaien. Mensen respecteren wie weet wat hij wil.', source: 'TyKwonDoe' },
  { title: 'Subcommunicatie', body: 'Wat je niet zegt communiceert harder dan je woorden. Toon, houding en timing lekken je interne staat. Je kunt de goede woorden zeggen met de verkeerde energie.', source: 'TyKwonDoe' },
  // Gespreksdynamiek
  { title: 'Tempo en stiltes', body: 'Tempo is een directe uiting van je interne staat. Te snel praten is anxious. Stilte is grond. Wie het tempo bepaalt, heeft de conversatie.', source: 'vocal tonality / TyKwonDoe' },
  { title: 'Push-pull, gecalibreerd', body: 'Warmte plus een kleine uitdaging houdt het levendig. Een geplaagde steek gevolgd door warmte is het patroon. Maar het is kruiding, geen hoofdgerecht.', source: 'calibrated teasing' },
  { title: 'Onthulling over en weer', body: 'Nabijheid groeit als twee mensen om de beurt iets persoonlijkers delen. Jij zet de eerste stap. Niks delen werkt twee kanten op.', source: 'Aron — 36 questions' },
  { title: 'Echt luisteren wint', body: 'Iemand zich gehoord laten voelen bindt sterker dan zelf interessant zijn. Twee keer doorvragen werkt beter dan twee minuten over jezelf praten.', source: 'active listening' },
  { title: 'Naam en toon', body: "Iemands naam onthouden en gebruiken zegt 'jij telt'. Het kleine gebaar weegt zwaarder dan je denkt.", source: 'Dale Carnegie' },
  // Psychologie fundamenten
  { title: 'Sympathie-principe', body: 'We laten ons beïnvloeden door wie we aardig vinden: overeenkomsten, oprechte complimenten, samen ergens naartoe gaan. Aardig vinden werkt twee kanten op.', source: 'Cialdini — Liking' },
  { title: 'Mere exposure', body: 'Hoe vaker iemand je tegenkomt, hoe aardiger ze je vinden. Blijven opdagen doet het stille werk. Zichtbaarheid bouwt sympathie zonder woorden.', source: 'Zajonc' },
  { title: 'Sociaal bewijs', body: 'Mensen kijken naar anderen om te bepalen hoe te doen. Zekerheid is besmettelijk. Wie zeker overkomt wordt gevolgd, niet omdat hij gelijk heeft maar omdat hij zeker is.', source: 'Cialdini — Social Proof' },
  { title: 'Wederkerigheid', body: 'Geef eerst iets kleins van waarde en de neiging om terug te doen is bijna automatisch. Kleine gestes activeren grote loyaliteit.', source: 'Cialdini — Reciprocity' },
  { title: 'Kwetsbaarheid is geen zwakte', body: 'Een echte barst laat mensen binnen. Perfectie houdt ze op afstand. Kwetsbaarheid zonder apologie bouwt meer vertrouwen dan elke facade.', source: 'Brené Brown' },
  { title: 'Het pratfall-effect', body: 'Een kleine misser maakt competente mensen juist sympathieker. Perfectie schept afstand, een menselijke fout breekt die af.', source: 'Aronson' },
  { title: 'Invloed vs manipulatie', body: 'Invloed = iemand bewegen waar jullie allebei beter van worden, kaarten open. Manipulatie = misleiden tegen iemands belang. Het eerste bouwt vertrouwen, het tweede vreet het op.', source: 'de enige regel die telt' },
  { title: 'Status zoekt geen toestemming', body: 'Neem aan dat je erbij hoort vóór je een ruimte inloopt. Entitlement is een houding, geen eigenschap. Je traint hem door te handelen alsof hij er al is.', source: 'frame control' },
];

window.REPS_CONTENT = { CHALLENGES, LOOSE_QUESTS, THEORY, TIER_NAMES };
