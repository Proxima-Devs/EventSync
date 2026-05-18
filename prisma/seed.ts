import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Seeding database...");


  // Salles
  const [salleA, salleB ] = await Promise.all([
    prisma.room.upsert({
      where: { name: "Salle A — Amphithéâtre" },
      update: {},
      create: { name: "Salle A — Amphithéâtre" },
    }),
    prisma.room.upsert({
      where: { name: "Salle B — Workshop" },
      update: {},
      create: { name: "Salle B — Workshop" },
    }),
    prisma.room.upsert({
      where: { name: "Salle C — Networking" },
      update: {},
      create: { name: "Salle C — Networking" },
    }),
  ]);
  console.log("✅ Salles créées");


  // Intervenants
  const [alice, bob] = await Promise.all([
    prisma.speaker.create({
      data: {
        fullName: "Alice Dupont",
        bio: "Ingénieure en IA avec 10 ans d'expérience dans les LLMs.",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        links: { linkedin: "https://linkedin.com/in/alice", twitter: "https://twitter.com/alice" },
      },
    }),
    prisma.speaker.create({
      data: {
        fullName: "Bob Martin",
        bio: "Architecte cloud, conférencier international sur DevOps.",
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        links: { github: "https://github.com/bob", website: "https://bobmartin.dev" },
      },
    }),
  ]);
  console.log("✅ Intervenants créés");


  // Événement
  const now = new Date();
  const event = await prisma.event.upsert({
    where: { slug: "tech-conf-2026" },
    update: {},
    create: {
      title: "TechConf 2026",
      slug: "tech-conf-2026",
      description: "La conférence tech de référence pour les développeurs.",
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      location: "Paris, France",
    },
  });
  console.log("✅ Événement créé:", event.slug);


  // Sessions — dont une "live" maintenant
  const sessionStart = new Date(now.getTime() - 10 * 60 * 1000); // démarrée il y a 10 min
  const sessionEnd = new Date(now.getTime() + 50 * 60 * 1000);   // finit dans 50 min


  await prisma.eventSession.create({
    data: {
      title: "Introduction aux LLMs en production",
      description: "Comment déployer des modèles de langage à grande échelle.",
      startTime: sessionStart,
      endTime: sessionEnd,
      capacity: 200,
      eventId: event.id,
      roomId: salleA.id,
      speakers: { create: [{ speakerId: alice.id }] },
    },
  });


  await prisma.eventSession.create({
    data: {
      title: "DevOps moderne avec Kubernetes",
      description: "Retour d'expérience sur le passage à K8s en production.",
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      capacity: 80,
      eventId: event.id,
      roomId: salleB.id,
      speakers: { create: [{ speakerId: bob.id }] },
    },
  });


  console.log("✅ Sessions créées (dont 1 live)");
  console.log("\n🎉 Seed terminé !");
}


main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
