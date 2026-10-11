const prisma = require('./config/prisma');

async function main() {
  const clinic = await prisma.clinics.create({
    data: {
      name: 'عيادة دوار الزراعة',
      address: 'دوار الزراعة، اللاذقية، سوريا',
      latitude: 35.52526,
      longitude: 35.79689
    }
  });

  console.log('Clinic created successfully:');
  console.log(clinic);
}

main()
  .catch((error) => {
    console.error('Failed to create clinic:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });