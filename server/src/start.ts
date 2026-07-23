import dotenv from 'dotenv';
dotenv.config();

import { app } from ".";
import { initBot } from "./bot";

async function main() {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server listening on port ${port}`);
        initBot();
    });
}

main();