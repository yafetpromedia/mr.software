import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const sf = await prisma.developerStorefront.findFirst({
    include: {
      _count: { select: { followers: true } },
      followers: {
        include: { follower: { select: { name: true, email: true } } },
      },
    },
  });
  console.log(JSON.stringify(sf, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
