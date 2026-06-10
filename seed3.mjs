import PocketBase from 'pocketbase';

const pb = new PocketBase('http://srv50.mikr.us:30154');

async function seed() {
  await pb.admins.authWithPassword("admin@weronika.pl", "password12345");

  try {
    const col = await pb.collections.getOne('services');
    if (!col.schema.find(f => f.name === 'card_color')) {
      col.schema.push({ name: "card_color", type: "text" });
      await pb.collections.update('services', col);
      console.log("Collection services updated with card_color.");
    }
  } catch (err) {
    console.error("Failed to update services:", err.message);
  }

  // Set default hex colors
  const hexColors = ['#fdf2f8', '#eff6ff', '#f0fdf4', '#faf5ff', '#fff7ed', '#f0fdfa'];
  const services = await pb.collection('services').getFullList({ sort: 'order' });

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    if (!service.card_color) {
      await pb.collection('services').update(service.id, {
        card_color: hexColors[i % hexColors.length]
      });
      console.log(`Updated ${service.title} with color ${hexColors[i % hexColors.length]}`);
    }
  }
}

seed().catch(console.error);
