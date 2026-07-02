const { PrismaClient } = require('@prisma/client');

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ca-central-1', 'sa-east-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1'
];

const pass = '0142753869Mm.';
const tenant = 'yfzbmgoxxiskwovzwgkm';

async function testRegion(region) {
  const url = `postgresql://postgres.${tenant}:${pass}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=30`;
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log(`\n🎉 SUCCESS! Connected to pooler region: ${region}`);
    console.log(`Connection string: postgresql://postgres.${tenant}:[PASSWORD]@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`);
    process.exit(0);
  } catch (err) {
    if (err.message.includes('tenant/user') && err.message.includes('not found')) {
      process.stdout.write('.');
    } else {
      console.log(`\nRegion ${region} failed with: ${err.message.substring(0, 150)}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  console.log(`Probing Supabase regions for tenant "${tenant}"...`);
  for (const region of regions) {
    await testRegion(region);
  }
  console.log('\nFinished probe. No active region found.');
}

run();
