import { CronJob } from 'cron';
import https from "https";

const job = new CronJob("*/14 * * * *", function () {
  const url = 'https://yelijochmender-backend.onrender.com/';
  console.log(`Sending GET request to ${url}...`);

  https
    .get(url, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      res.on('data', d => process.stdout.write(d));
    })
    .on("error", (e) => console.error("Error while sending request:", e));
});
export default job;

// CRON JOB EXPLANATION:
// Cron jobs are scheduled tasks that run periodically at fixed intervals
// we want to send 1 GET request for every 14 minutes

// How to define a "Schedule"?
// You define a schedule using a cron expression, which consists of 5 fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour