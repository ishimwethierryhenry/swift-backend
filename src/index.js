import * as dotenv from "dotenv";
import { app } from "./server";
import db from "./database/models/index";

dotenv.config();

app.listen(process.env.PORT, () => {
  console.info(`-->Port ${process.env.PORT}: server is up and running!`);
});

(async () => {
  try {
    await db.sequelize
      .sync()
      .then(() => console.info(`-->Connected to the db`));
  } catch (error) {
    console.info(`Error connecting to the db: ${error.message}`);
  }
})();
