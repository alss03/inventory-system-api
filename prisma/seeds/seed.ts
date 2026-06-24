import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();

  const supplier = await prisma.supplier.create({
    data: {
      name: "Medical Aesthetics Supplier",
      leadTime: 5,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Botox 100U",
        sku: "BTX-100",
        currentStock: 4,
        minimumStock: 10,
        unitCost: 420,
        supplierId: supplier.id,
      },
      {
        name: "Dermal Filler 1ml",
        sku: "DF-001",
        currentStock: 12,
        minimumStock: 10,
        unitCost: 280,
        supplierId: supplier.id,
      },
      {
        name: "PDO Thread",
        sku: "PDO-001",
        currentStock: 0,
        minimumStock: 5,
        unitCost: 35,
        supplierId: supplier.id,
      },
      {
        name: "Lidocaine Cream",
        sku: "LDC-001",
        currentStock: 5,
        minimumStock: 5,
        unitCost: 18,
        supplierId: supplier.id,
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });