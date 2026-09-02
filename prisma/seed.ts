import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.weeklyReport.create({
    data: {
      weekRange: "3rd - 9th August 2026",
      weekStart: new Date("2026-08-03"),
      totalSales: 26500,
      previousYearSales: 20868,
      lflTargetPercent: 4.5,
      foodStockResult: 0.35,
      foodStockThreshold: 1.0,
      drinkStockResult: 0.33,
      drinkStockThreshold: 0.6,
      npsScore: 89,
      foodQualityScore: 4.56,
      drinkQualityScore: 4.32,
      needToKnow:
        "This month lounge's big focus is milk quality — check delivery dates daily and rotate stock strictly FIFO. Report any off-spec deliveries to the duty manager immediately.",
      dotw: "Dan Dan Noodles",
      botw: "Pina Nolada",
      bohFocus: JSON.stringify([
        "Chipotle Ketchup",
        "Unsalted Butter",
        "Beans",
      ]),
      fohFocus: JSON.stringify([
        "Spirits stocks not great here",
        "Greeting all guests",
        "Making sure check backs are complete",
      ]),
    },
  });

  console.log("Seeded 1 WeeklyReport");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
