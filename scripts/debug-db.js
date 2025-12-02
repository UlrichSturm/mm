/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Users ---');
  const users = await prisma.user.findMany();
  users.forEach(u => console.log(`${u.email} (${u.role}): ${u.id}`));

  console.log('\n--- Vendor Profiles ---');
  const vendors = await prisma.vendorProfile.findMany();
  vendors.forEach(v => console.log(`Vendor for ${v.userId}: ${v.businessName}`));

  console.log('\n--- Lawyer Profiles ---');
  const lawyers = await prisma.lawyerNotaryProfile.findMany();
  lawyers.forEach(l => console.log(`Lawyer for ${l.userId}: ${l.organizationName}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
