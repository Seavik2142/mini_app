import dotenv from 'dotenv';
dotenv.config();

import { app } from ".";
import { initBot } from "./bot";
import { seedDatabaseIfEmpty } from "./module/shop.services";

async function main() {
    const port = process.env.PORT || 3000;
    
    await seedDatabaseIfEmpty();

    app.listen(port, () => {
        console.log(`🚀 Server listening on port ${port}`);
        initBot();
    });
}

main();