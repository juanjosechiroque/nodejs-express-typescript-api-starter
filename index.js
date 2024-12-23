import app from "./src/app.js";
import { PORT } from "./src/config.js";
import { connectDB } from "./src/database.js";

await connectDB();
app.listen(PORT);

console.log(`Server running on port ${PORT}`);
