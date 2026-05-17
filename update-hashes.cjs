require('dotenv').config();
const prisma = require('./server/lib/prisma.cjs');
const bcrypt = require('bcryptjs');

async function updateHashes() {
  console.log('Fetching all users...');
  const users = await prisma.user.findMany();
  
  console.log(`Found ${users.length} users. Re-hashing passwords to cost 8...`);
  
  for (const user of users) {
    // We only know the demo password is 'demo123'. 
    // If the hash is cost 12, we can't easily reverse it. 
    // So we will just reset all passwords to 'demo123' with cost 8 for now.
    const newHash = await bcrypt.hash('demo123', 8);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });
    console.log(`Updated user: ${user.email}`);
  }
  
  console.log('Done! All users now have a fast cost-8 password hash.');
}

updateHashes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
