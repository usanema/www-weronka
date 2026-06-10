import PocketBase from 'pocketbase';

const pb = new PocketBase('http://srv50.mikr.us:30154');

async function updateCollectionSafe(name, schemaAdds) {
  try {
    const col = await pb.collections.getOne(name);
    let updated = false;
    for (const add of schemaAdds) {
      if (!col.schema.find(f => f.name === add.name)) {
        col.schema.push(add);
        updated = true;
      }
    }
    if (updated) {
      await pb.collections.update(name, col);
      console.log(`Collection ${name} updated.`);
    } else {
      console.log(`Collection ${name} already has all fields.`);
    }
  } catch (err) {
    console.error(`Failed to update ${name}:`, err.message);
  }
}

async function createCollectionSafe(collectionConfig) {
  try {
    await pb.collections.create(collectionConfig);
    console.log(`Collection ${collectionConfig.name} created.`);
  } catch (err) {
    console.log(`Collection ${collectionConfig.name} exists or error:`, err.message);
  }
}

async function seed() {
  await pb.admins.authWithPassword("admin@weronika.pl", "password12345");

  // Add fields to site_settings
  await updateCollectionSafe('site_settings', [
    { name: "logo_image", type: "file", options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"] } },
    { name: "color_primary", type: "text" },
    { name: "color_secondary", type: "text" },
    { name: "color_dark", type: "text" },
    { name: "color_light", type: "text" },
    { name: "footer_description", type: "text" }
  ]);

  // Set default colors in site_settings
  const settingsList = await pb.collection('site_settings').getList(1, 1);
  if (settingsList.items.length > 0) {
    const s = settingsList.items[0];
    if (!s.color_primary) {
      await pb.collection('site_settings').update(s.id, {
        color_primary: "#D85096",
        color_secondary: "#BEDBF4",
        color_dark: "#000000",
        color_light: "#ffffff",
        footer_description: "Wsparcie okołoporodowe, konsultacje i grupy dla kobiet w ciąży. Razem w drodze do macierzyństwa."
      });
      console.log("Updated site_settings with default colors.");
    }
  }

  // Add field to services
  await updateCollectionSafe('services', [
    { name: "image", type: "file", options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } }
  ]);

  // Create home_page
  await createCollectionSafe({
    name: "home_page",
    type: "base",
    schema: [
      { name: "hero_title", type: "text" },
      { name: "hero_subtitle", type: "text" },
      { name: "about_title", type: "text" },
      { name: "about_content", type: "editor" },
      { name: "about_image", type: "file", options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } },
      { name: "offer_title", type: "text" },
      { name: "offer_subtitle", type: "text" },
      { name: "cta_title", type: "text" },
      { name: "cta_subtitle", type: "text" },
      { name: "cta_background_image", type: "file", options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } }
    ],
    listRule: "",
    viewRule: ""
  });

  // Populate home_page
  const homePages = await pb.collection('home_page').getList(1, 1);
  if (homePages.totalItems === 0) {
    await pb.collection('home_page').create({
      hero_title: "Towarzyszę Ci w drodze do macierzyństwa",
      hero_subtitle: "Wsparcie emocjonalne, informacyjne i fizyczne na każdym etapie ciąży, porodu i połogu. Zaufaj swojej intuicji i poczuj się bezpiecznie.",
      about_title: "Cześć, jestem Weronika!",
      about_content: "<p>Wierzę, że poród to piękne, transformujące wydarzenie, a nie tylko medyczny proces. Jako doula pomagam kobietom odkryć ich wewnętrzną siłę i przygotować się na przyjęcie nowego życia w spokoju i zaufaniu do własnego ciała.</p><p>Moim celem jest zapewnienie Ci ciągłego wsparcia — od momentu, gdy dowiesz się o ciąży, aż po wyzwania związane z połogiem. Nie jesteś w tym sama.</p>",
      offer_title: "W czym mogę Ci pomóc?",
      offer_subtitle: "Odkryj formy wsparcia, które przygotowałam dla Ciebie na każdym etapie tej wyjątkowej drogi.",
      cta_title: "Porozmawiajmy o Twoich potrzebach",
      cta_subtitle: "Pierwsza konsultacja, podczas której sprawdzimy czy \"nadajemy na tych samych falach\", jest zawsze darmowa i do niczego nie zobowiązuje."
    });
    console.log("Populated home_page.");
  }

  // Create about_page
  await createCollectionSafe({
    name: "about_page",
    type: "base",
    schema: [
      { name: "title", type: "text" },
      { name: "subtitle", type: "text" },
      { name: "content", type: "editor" },
      { name: "hero_image", type: "file", options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } }
    ],
    listRule: "",
    viewRule: ""
  });

  // Populate about_page
  const aboutPages = await pb.collection('about_page').getList(1, 1);
  if (aboutPages.totalItems === 0) {
    await pb.collection('about_page').create({
      title: "Kilka słów o mnie",
      subtitle: "Poznaj moją historię i dowiedz się, dlaczego zdecydowałam się towarzyszyć kobietom w jednej z najważniejszych podróży ich życia.",
      content: "<p>Zawsze czułam głęboką potrzebę wspierania innych, ale dopiero własne doświadczenia macierzyńskie uświadomiły mi, jak bardzo kobiety potrzebują opieki nie tylko medycznej, ale i emocjonalnej w okresie okołoporodowym.</p><p>Słowo \"doula\" pochodzi z języka greckiego i oznacza \"kobietę, która służy\". Dla mnie to nie jest zawód, to powołanie. To bycie obok — bez oceniania, z pełną akceptacją Twoich wyborów i Twojego ciała.</p><h3>W co wierzę?</h3><ul><li>W siłę i mądrość kobiecego ciała. Twoje ciało wie, jak rodzić.</li><li>W to, że każdy poród jest inny i każdy wybór, jakiego dokonasz dla siebie i dziecka, jest właściwy.</li><li>W magię czwartego trymestru, który wymaga tyle samo czułości, co noworodek.</li></ul><h3>Moje Kwalifikacje</h3><ul><li>Certyfikowana Doula Stowarzyszenia Doula w Polsce</li><li>Kurs Promotora Karmienia Piersią</li><li>Szkolenie \"Rebozo w pracy douli\"</li><li>Warsztaty komunikacji empatycznej NVC</li></ul>"
    });
    console.log("Populated about_page.");
  }

  // Create contact_page
  await createCollectionSafe({
    name: "contact_page",
    type: "base",
    schema: [
      { name: "title", type: "text" },
      { name: "subtitle", type: "text" },
      { name: "working_area", type: "editor" }
    ],
    listRule: "",
    viewRule: ""
  });

  // Populate contact_page
  const contactPages = await pb.collection('contact_page').getList(1, 1);
  if (contactPages.totalItems === 0) {
    await pb.collection('contact_page').create({
      title: "Porozmawiajmy",
      subtitle: "Masz pytania? Chcesz umówić się na niezobowiązujące spotkanie? Napisz do mnie. Odpowiadam najszybciej jak to możliwe!",
      working_area: "<p>Warszawa i okolice do 30km.<br/>Konsultacje i spotkania możliwe również online.</p>"
    });
    console.log("Populated contact_page.");
  }

  console.log("seed2 completed");
}

seed().catch(console.error);
