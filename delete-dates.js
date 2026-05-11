require('dotenv').config();
const db = require('./src/db');

async function deleteDates() {
  const datesToDelete = [
    '2026-05-08',
    '2026-05-07',
    '2026-05-06',
    '2026-05-05',
    '2026-05-04',
    '2026-05-03'
  ];

  try {
    console.log('Connecting to database...');
    const collection = await db.connect();
    
    console.log(`Attempting to delete records for: ${datesToDelete.join(', ')}`);
    
    const result = await collection.deleteMany({
      userId: 'anonymous',
      date: { $in: datesToDelete }
    });

    console.log(`Successfully deleted ${result.deletedCount} records.`);
  } catch (error) {
    console.error('Error during deletion:', error);
  } finally {
    await db.close();
    process.exit();
  }
}

deleteDates();
