import app from "./src/app.js";

import { PORT } from "./src/config.js";

app.listen(PORT);

// eslint-disable-next-line no-console
console.log(`Server running on port ${PORT}`);
