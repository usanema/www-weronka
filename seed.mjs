import PocketBase from 'pocketbase';

const pb = new PocketBase('http://srv50.mikr.us:30154');

async function createCollectionSafe(collectionConfig) {
  try {
    await pb.collections.create(collectionConfig);
    console.log(`Collection ${collectionConfig.name} created.`);
  } catch (err) {
    if (err.data && err.data.data && err.data.data.name && err.data.data.name.code === 'validation_invalid_name') {
        console.log(`Collection ${collectionConfig.name} might already exist or invalid name.`);
    } else {
        console.log(`Collection ${collectionConfig.name} exists or error:`, err.message);
    }
  }
}

async function seed() {
  try {
    console.log("Creating initial admin...");
    try {
      await pb.admins.create({
        email: "admin@weronika.pl",
        password: "password12345",
        passwordConfirm: "password12345"
      });
    } catch(e) {
      console.log("Admin might already exist.");
    }

    console.log("Authenticating...");
    await pb.admins.authWithPassword("admin@weronika.pl", "password12345");

    console.log("Creating collections...");
    
    // 1. site_settings
    await createCollectionSafe({
      name: "site_settings",
      type: "base",
      schema: [
        { name: "hero_title", type: "text" },
        { name: "hero_subtitle", type: "text" },
        { name: "phone", type: "text" },
        { name: "email", type: "text" },
        { name: "instagram_link", type: "url" },
        { name: "facebook_link", type: "url" }
      ],
      listRule: "",
      viewRule: ""
    });

    // 2. services
    await createCollectionSafe({
      name: "services",
      type: "base",
      schema: [
        { name: "title", type: "text" },
        { name: "slug", type: "text" },
        { name: "short_description", type: "text" },
        { name: "content", type: "editor" },
        { name: "order", type: "number" }
      ],
      listRule: "",
      viewRule: ""
    });

    // 3. pages
    await createCollectionSafe({
      name: "pages",
      type: "base",
      schema: [
        { name: "title", type: "text" },
        { name: "slug", type: "text" },
        { name: "content", type: "editor" }
      ],
      listRule: "",
      viewRule: ""
    });

    console.log("Populating data...");

    // Populate site_settings (only if empty)
    const settings = await pb.collection('site_settings').getList(1, 1);
    if (settings.totalItems === 0) {
      await pb.collection('site_settings').create({
        hero_title: "Weronika Nowik",
        hero_subtitle: "Twoja Doula. Wsparcie, edukacja i spokój na każdym etapie macierzyństwa.",
        phone: "+48 123 456 789",
        email: "kontakt@weronikanowik.pl",
        instagram_link: "https://instagram.com",
        facebook_link: "https://facebook.com"
      });
      console.log("Added site settings.");
    }

    // Populate services (Oferta)
    const services = [
      {
        title: "Wsparcie okołoporodowe",
        slug: "doula",
        short_description: "Ciągłe, niemedyczne wsparcie emocjonalne, informacyjne i fizyczne.",
        content: "<p>Jako Twoja doula jestem dla Ciebie i Twojego partnera. Nie wykonuję żadnych procedur medycznych, ale dbam o Twój komfort, poczucie bezpieczeństwa i pomagam Ci świadomie przeżyć to wyjątkowe wydarzenie. Moją rolą jest wspieranie Twoich decyzji, niezależnie od tego, jak planujesz rodzić.</p><h3>W ciąży</h3><p>Spotykamy się 2-3 razy. Rozmawiamy o Twoich obawach, oczekiwaniach, tworzymy plan porodu. Poznajemy techniki łagodzenia bólu (oddech, masaż, pozycje wertykalne).</p><h3>Podczas porodu</h3><p>Jestem z Tobą od momentu, gdy tego potrzebujesz, aż do ok. 2 godzin po narodzinach. Wspieram Cię fizycznie, masuję, przypominam o oddechu i dbam o komfortową atmosferę w sali.</p><h3>W połogu</h3><p>Spotykamy się ok. tydzień po porodzie. Rozmawiamy o Twoim doświadczeniu porodowym, wspieram w początkach karmienia piersią i pomagam odnaleźć się w nowej rzeczywistości.</p>",
        order: 1
      },
      {
        title: "Konsultacje Przedporodowe",
        slug: "konsultacje",
        short_description: "Rozwiej swoje wątpliwości i przygotuj się do porodu z poczuciem pewności.",
        content: "<p>Spotkania indywidualne stacjonarne lub online. Rozwiej swoje wątpliwości i przygotuj się do porodu z poczuciem pewności.</p>",
        order: 2
      },
      {
        title: "Grupy Ciążowe",
        slug: "grupy-ciazowe",
        short_description: "Bezpieczna przestrzeń dla kobiet w ciąży. Kręgi wsparcia i siostrzeństwo.",
        content: "<p>Bezpieczna przestrzeń dla kobiet w ciąży. Kręgi wsparcia, w których znajdziesz zrozumienie, siostrzeństwo i rzetelną wiedzę.</p>",
        order: 3
      },
      {
        title: "Grupa Urodziłam Życie",
        slug: "urodzilam-zycie",
        short_description: "Grupa wsparcia po porodzie. Razem odnajdujemy się w nowej rzeczywistości.",
        content: "<p>Grupa wsparcia po porodzie. Razem odnajdujemy się w nowej, wspaniałej i często trudnej rzeczywistości \"czwartego trymestru\".</p>",
        order: 4
      },
      {
        title: "Randki dla Rodziców",
        slug: "randki-dla-rodzicow",
        short_description: "Warsztaty budowania więzi i pielęgnowania relacji partnerskiej po narodzinach.",
        content: "<p>Zatrzymajcie się na chwilę. Wyjątkowe warsztaty budowania więzi i pielęgnowania relacji partnerskiej po narodzinach dziecka, prowadzone wspólnie z moim mężem.</p>",
        order: 5
      },
      {
        title: "Łagodności - Spotkania Online",
        slug: "lagodnosci",
        short_description: "Spotkania stworzone z myślą o mamach z całej Polski i świata.",
        content: "<p>Spotkania stworzone z myślą o mamach z całej Polski i świata. Połączmy się w łagodności bez wychodzenia z domu.</p>",
        order: 6
      }
    ];

    const currentServices = await pb.collection('services').getList(1, 1);
    if (currentServices.totalItems === 0) {
      for (const s of services) {
        await pb.collection('services').create(s);
      }
      console.log("Added services.");
    }

    console.log("Seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding:", error);
  }
}

seed();
