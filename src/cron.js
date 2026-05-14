const cron = require('node-cron');
const db = require('./db');

async function runDailyPrayerCheck() {
  try {
    console.log('Running daily prayer check cron job...');
    
    // Get today's date in YYYY-MM-DD format for the UTC+3 timezone
    const dateObj = new Date();
    const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
    
    // Check if there are any records for today
    const existing = (await db.getByDate(dateStr)) || {};
    
    const allPrayers = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
    let updatedCount = 0;

    for (const prayer of allPrayers) {
      // If the specific prayer has not been recorded
      if (!existing[prayer]) {
        await db.upsertPrayer(dateStr, prayer, 3);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`Successfully marked ${updatedCount} unrecorded prayer(s) for ${dateStr} as 'لم أصل'.`);
    } else {
      console.log(`All prayers already recorded for ${dateStr}. No action taken.`);
    }
    
    return { success: true, date: dateStr, updatedCount };
  } catch (err) {
    console.error('Error in daily prayer check cron job:', err);
    throw err;
  }
}

function startCronJobs() {
  // Run at 23:59 every day
  cron.schedule('59 23 * * *', runDailyPrayerCheck, {
    scheduled: true,
    timezone: "Asia/Baghdad"
  });
}

module.exports = { startCronJobs, runDailyPrayerCheck };
