const cron = require('node-cron');
try {
  cron.schedule('59 23 * * *', () => {
    console.log('Task is running');
  }, {
    scheduled: true,
    timezone: "Asia/Riyadh"
  });
  console.log("Cron scheduled successfully.");
} catch (e) {
  console.error("Error scheduling cron:", e);
}
