// content.js — vaste inhoud van de app (challenges, losse quests, theorie).
// Geen state hier. Dit verandert niet tijdens gebruik.

// --- Challenge-ladder (graded exposure) ---
// Elke challenge: { id, tier, text, why }
// id's zijn stabiel; verander ze niet zonder migratie van opgeslagen history.
const CHALLENGES = [
  // Tier 1 — Opwarmen
  { id: 101, tier: 1, text: 'Knik of zeg "hoi" naar één persoon die je tegenkomt. Meer niet.', why: 'De drempel zo laag leggen dat er niks te overdenken valt.' },
  { id: 102, tier: 1, text: 'Maak één korte opmerking tegen iemand die je niet kent (kassa, ov, school).', why: 'Bewijst dat een open mond geen ramp oplevert.' },
  { id: 103, tier: 1, text: 'Houd twee tellen oogcontact met iemand en glimlach.', why: 'Warmte wordt vóór alles gelezen, dit traint dat signaal.' },
  { id: 104, tier: 1, text: 'Geef iemand een oprecht compliment over iets concreets. Niet "je bent leuk", iets specifieks.', why: 'Specifiek compliment voelt echt en is makkelijk te geven.' },
  { id: 105, tier: 1, text: 'Zeg in de eerste twee minuten van een groepsgesprek één ding. Wat dan ook.', why: 'Vroeg iets zeggen breekt de wachtstand waarin je vastloopt.' },
  { id: 106, tier: 1, text: 'Vraag een vreemde iets kleins terwijl je het antwoord eigenlijk al weet (hoe laat, welke kant op).', why: 'Een veilige reden om een vreemde aan te spreken.' },
  { id: 107, tier: 1, text: 'Lach hardop mee of reageer zichtbaar op wat iemand zegt, zonder je in te houden.', why: 'Zichtbaar reageren is jezelf laten zien, klein maar echt.' },
  { id: 108, tier: 1, text: 'Groet de buschauffeur, kassamedewerker of portier als eerste, met oogcontact.', why: 'Eerst zijn is de spier die je hier traint.' },
  { id: 109, tier: 1, text: 'Stel één vraag aan iemand naast je in een rij of wachtruimte.', why: 'Een stilstaand moment is de makkelijkste opening die er is.' },

  // Tier 2 — Ruimte innemen
  { id: 201, tier: 2, text: 'Begin een gesprek met iemand die je een beetje kent en rek het tot minstens drie beurten.', why: 'Een gesprek dragen, niet alleen openen.' },
  { id: 202, tier: 2, text: 'Deel uit jezelf iets persoonlijks zonder dat erom gevraagd wordt.', why: 'Onthulling over en weer is hoe nabijheid groeit, jij zet de eerste stap.' },
  { id: 203, tier: 2, text: 'Stuur een voicenote in plaats van een tekstbericht.', why: 'In tekst verlies je je toon, en toon is het grootste deel van jou.' },
  { id: 204, tier: 2, text: 'Laat bewust één keer een verkeerd beeld over jou gewoon staan. Corrigeer het niet.', why: 'Niet elke indruk hoeft gemanaged, dat loslaten is de rep.' },
  { id: 205, tier: 2, text: 'Zeg je echte mening in een groep terwijl je weet dat niet iedereen het ermee eens is.', why: 'Ruimte innemen ook als het niet veilig unaniem is.' },
  { id: 206, tier: 2, text: 'Spreek vandaag iemand als eerste aan in plaats van te wachten tot je aangesproken wordt.', why: 'De kosten van niks doen zijn een gegarandeerd niks.' },
  { id: 207, tier: 2, text: 'Vertel een kort verhaal aan een groep van drie of meer mensen.', why: 'De aandacht even vasthouden zonder je terug te trekken.' },
  { id: 208, tier: 2, text: 'Vraag iemand naar zijn mening en stel twee keer door.', why: 'Iemand zich gehoord laten voelen bindt sterker dan zelf interessant zijn.' },

  // Tier 3 — De echte rep
  { id: 301, tier: 3, text: 'Stap op iemand af die je interessant of aantrekkelijk vindt en zeg één zin.', why: 'Beweeg binnen drie tellen, vóór je brein het wegredeneert.' },
  { id: 302, tier: 3, text: 'Doe een laagdrempelig voorstel om iets samen te doen (koffie, meelopen, even iets laten zien).', why: 'Een concreet voorstel is wat een moment een vervolg geeft.' },
  { id: 303, tier: 3, text: 'Vraag iemand om een kleine gunst.', why: 'Ben Franklin-effect: daarna vinden ze je áárdiger, niet minder.' },
  { id: 304, tier: 3, text: 'Plaag iemand licht en speels, een compliment met een kleine steek erin. Lees de reactie en stel bij.', why: 'Push-pull houdt het levendig, mits het kruiding blijft.' },
  { id: 305, tier: 3, text: 'Vraag rechtstreeks om wat je wil (een nummer, een keer afspreken) en accepteer kalm elke uitkomst.', why: 'Vragen en de uitkomst loslaten is de kern van de hele oefening.' },
  { id: 306, tier: 3, text: 'Open een gesprek met een observatie in plaats van een vraag, en laat daarna een stilte vallen.', why: 'Een statement durven neerleggen zonder de stilte vol te praten.' },
  { id: 307, tier: 3, text: 'Vraag na een leuk gesprek om een nummer of insta.', why: 'Het moment pakken in plaats van het te laten verdampen.' },
];

// --- Losse quests ---
// { id, cat: 'soc' | 'date', text }
const LOOSE_QUESTS = [
  // Sociaal
  { id: 'soc_1', cat: 'soc', text: 'Maak een vreemde aan het lachen.' },
  { id: 'soc_2', cat: 'soc', text: 'Geef een ober, kassamedewerker of chauffeur een oprecht, specifiek compliment.' },
  { id: 'soc_3', cat: 'soc', text: 'Begin een gesprek met iemand die alleen staat.' },
  { id: 'soc_4', cat: 'soc', text: "Geef je mening in een groep zonder 'm af te zwakken." },
  { id: 'soc_5', cat: 'soc', text: 'Vraag iemand naar zijn verhaal en stel drie keer door.' },
  { id: 'soc_6', cat: 'soc', text: 'Spreek iemand aan op iets dat je oprecht opvalt (tattoo, schoenen, jas).' },
  { id: 'soc_7', cat: 'soc', text: 'Wees vandaag drie keer de eerste die "hoi" zegt.' },
  { id: 'soc_8', cat: 'soc', text: 'Beëindig een goedlopend gesprek zelf, op een hoogtepunt.' },

  // Dating
  { id: 'date_1', cat: 'date', text: 'Stap op iemand af die je aantrekkelijk vindt en open met een observatie, geen vraag.' },
  { id: 'date_2', cat: 'date', text: 'Geef iemand die je leuk vindt een specifiek compliment en kijk rustig wat er gebeurt.' },
  { id: 'date_3', cat: 'date', text: 'Plaag een crush licht en speels, en laat daarna de stilte vallen.' },
  { id: 'date_4', cat: 'date', text: 'Stuur een voicenote naar een crush in plaats van te typen.' },
  { id: 'date_5', cat: 'date', text: 'Hou een chat levendig met een statement in plaats van een vraag.' },
  { id: 'date_6', cat: 'date', text: 'Vraag na een leuk gesprek om een nummer of insta.' },
  { id: 'date_7', cat: 'date', text: 'Doe een concreet voorstel om af te spreken, een echt plan, niet "we moeten eens".' },
  { id: 'date_8', cat: 'date', text: 'Vraag direct om wat je wil en accepteer kalm elke uitkomst.' },
];

// --- Theorie (curriculum, op volgorde) ---
// { title, body, source }
const THEORY = [
  { title: 'Het spotlight-effect', body: 'We overschatten enorm hoeveel anderen op ons letten. Iedereen is met zijn eigen zaal bezig.', source: 'Gilovich & Savitsky' },
  { title: 'Warmte komt eerst', body: 'Mensen lezen "is hij warm?" vóór "is hij competent?", en warmte weegt zwaarder.', source: 'Amy Cuddy' },
  { title: 'Blootstelling went', body: 'Angst piekt en zakt vanzelf als je blijft. Vermijden houdt hem juist in leven.', source: 'exposure / habituatie' },
  { title: 'Sympathie-principe', body: 'We laten ons overtuigen door wie we aardig vinden: overeenkomsten, oprechte complimenten, samen ergens naartoe.', source: 'Cialdini — Liking' },
  { title: 'Wederkerigheid', body: 'Geef eerst iets kleins van waarde, en de neiging om terug te doen is bijna automatisch.', source: 'Cialdini — Reciprocity' },
  { title: 'Invloed vs manipulatie', body: 'Invloed = iemand bewegen waar jullie allebei beter van worden, kaarten open. Manipulatie = misleiden tegen iemands eigen belang. Het eerste bouwt vertrouwen, het tweede vreet het op, en een connectie is niks anders dan vertrouwen plus tijd.', source: 'de enige regel die telt' },
  { title: 'Mere exposure', body: 'Hoe vaker iemand je tegenkomt, hoe aardiger ze je vinden. Blijven opdagen doet het stille werk.', source: 'Zajonc' },
  { title: 'Echt luisteren wint', body: 'Iemand zich gehoord laten voelen bindt sterker dan zelf interessant zijn.', source: 'active listening' },
  { title: 'De drie seconden', body: 'Beweeg binnen ~3 tellen na de impuls, vóór je brein het wegredeneert.', source: 'approach window' },
  { title: 'De ingebeelde rechtbank', body: 'Het publiek dat je voelt is grotendeels een spook uit je verleden. De zitting is voorbij.', source: 'Elkind — imaginary audience' },
  { title: 'Onthulling over en weer', body: 'Nabijheid groeit als twee mensen om de beurt iets persoonlijkers delen. Jij zet de eerste stap.', source: 'Aron — 36 questions' },
  { title: 'Locus of evaluation', body: 'Beslis zelf eerst of wat je deed oké was, vóór je hun gezicht afkijkt.', source: 'Carl Rogers' },
  { title: 'De kosten van niks doen', body: 'Wie je nooit aanspreekt is een gegarandeerd niks. Inactie is ook een keuze, alleen een die altijd verliest.', source: 'opportuniteitskosten' },
  { title: 'Sociaal bewijs', body: 'Mensen kijken naar anderen om te bepalen hoe te doen. Zekerheid is besmettelijk.', source: 'Cialdini — Social Proof' },
  { title: 'Kwetsbaarheid is geen zwakte', body: 'Een echte barst laat mensen binnen. Perfectie houdt ze op afstand.', source: 'Brené Brown' },
  { title: 'Status zoekt geen toestemming', body: 'Neem aan dat je erbij hoort vóór je een ruimte inloopt.', source: 'frame control' },
  { title: 'Benoem de gedachte', body: 'Bij de drang naar bevestiging: "dit is de craving, niet een echte behoefte." Die halve seconde afstand is genoeg.', source: 'cognitieve defusie' },
  { title: 'Push-pull, gecalibreerd', body: 'Warmte plus een kleine uitdaging houdt het levendig, maar het is kruiding, geen hoofdgerecht.', source: 'calibrated teasing' },
  { title: 'Naam en toon', body: 'Iemands naam onthouden en gebruiken zegt "jij telt". Het kleine gebaar weegt zwaarder dan je denkt.', source: 'Dale Carnegie' },
  { title: 'Het pratfall-effect', body: 'Een kleine misser maakt competente mensen juist sympathieker. Perfectie schept afstand.', source: 'Aronson' },
];

window.REPS_CONTENT = { CHALLENGES, LOOSE_QUESTS, THEORY };
