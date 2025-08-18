import * as dotenv from "dotenv";
import { app } from "./server";
import db from "./database/models/index";
import FeedbackDigestJob from "./jobs/feedbackDigestJob";

dotenv.config();

app.listen(process.env.PORT, () => {
  console.info(`-->Port ${process.env.PORT}: server is up and running!`);
});

// After database connection is established:
(async () => {
  try {
    await db.sequelize
      .sync()
      .then(() => {
        console.info(`-->Connected to the db`);
        
        // Initialize feedback digest job
        FeedbackDigestJob.init();
        console.info(`-->Feedback digest job initialized`);
      });
  } catch (error) {
    console.info(`Error connecting to the db: ${error.message}`);
  }
})();
