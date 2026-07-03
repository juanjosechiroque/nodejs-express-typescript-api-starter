import bcrypt from "bcrypt";
import { connectDB, disconnectDB } from "../database.js";
import Product from "../api/product/product.model.js";
import User from "../api/user/user.model.js";
import logger from "../utils/logger.js";

const DEMO_USER_EMAIL = "demo@example.com";
const DEMO_USER_PASSWORD = "DemoPassword123!";

const demoProducts = [
    {
        name: "Starter Keyboard",
        price: 79.99,
        stock: 25,
        status: "active",
        isFeatured: true,
        description: "Featured active product for API demos.",
    },
    {
        name: "Wireless Mouse",
        price: 34.99,
        stock: 40,
        status: "active",
        isFeatured: false,
        description: "Active product with healthy stock for listing demos.",
    },
    {
        name: "USB-C Dock",
        price: 129.0,
        stock: 8,
        status: "active",
        isFeatured: true,
        description: "Second featured active product for filter and pagination demos.",
    },
    {
        name: "Draft Monitor Stand",
        price: 49.5,
        stock: 12,
        status: "draft",
        isFeatured: false,
        description: "Draft product used to test lifecycle filters.",
    },
    {
        name: "Archived USB Hub",
        price: 24.99,
        stock: 0,
        status: "archived",
        isFeatured: false,
        description: "Archived product used to test delete behavior.",
    },
] as const;

async function seed() {
    await connectDB();

    const hashedPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
    await User.updateOne(
        { email: DEMO_USER_EMAIL },
        { $set: { email: DEMO_USER_EMAIL, password: hashedPassword } },
        { upsert: true }
    );

    await Promise.all(
        demoProducts.map((product) =>
            Product.updateOne({ name: product.name }, { $set: product }, { upsert: true })
        )
    );

    logger.info(
        {
            user: DEMO_USER_EMAIL,
            products: demoProducts.length,
        },
        "Demo data seeded"
    );
}

try {
    await seed();
} finally {
    await disconnectDB();
}
