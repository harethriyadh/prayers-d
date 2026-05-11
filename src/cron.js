const cron = require('node-cron');
const db = require('./db');

function startCronJobs() {
  // Run at 23:59 every day
  cron.schedule('59 23 * * *', async () => {
    try {
      console.log('Running daily prayer check cron job...');
      
      // Get today's date in YYYY-MM-DD format for the UTC+3 timezone
      const dateObj = new Date();
      const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
      
      // Check if there are any records for today
      const existing = await db.getByDate(dateStr);
      
      // If there are no records at all
      if (!existing || Object.keys(existing).length === 0) {
        console.log(`No records found for ${dateStr}. Marking all as not prayed.`);
        
        const missedPrayers = {
          'الفجر': 3,
          'الظهر': 3,
          'العصر': 3,
          'المغرب': 3,
          'العشاء': 3
        };
        
        // Upsert all missed prayers
        for (const [prayer, status] of Object.entries(missedPrayers)) {
          await db.upsertPrayer(dateStr, prayer, status);
        }
        
        console.log(`Successfully marked all prayers for ${dateStr} as 'لم أصل'.`);
      } else {
        console.log(`Records already exist for ${dateStr}. No action taken.`);
      }
    } catch (err) {
      console.error('Error in daily prayer check cron job:', err);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Riyadh"
  });
}

module.exports = { startCronJobs };
