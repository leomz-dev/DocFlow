require('../config/env');
const prisma = require('../src/config/prisma');

async function check() {
  try {
    const users = await prisma.user.findMany({
      include: { company: true, counters: true }
    });
    console.log('Users found:', users.length);
    users.forEach(u => {
      console.log('  User:', u.email, '| company:', !!u.company, '| counters:', !!u.counters);
      if (u.counters) console.log('    counters:', JSON.stringify(u.counters));
    });
    if (users.length === 0) {
      console.log('  ⚠️  No users in DB — need to create one first');
    }
  } catch(e) {
    console.error('DB Error:', e.message);
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
}
check();
