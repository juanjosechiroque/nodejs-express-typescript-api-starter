import { Schema, model, type InferSchemaType } from "mongoose";
import {
    PRODUCT_DESCRIPTION_MAX_LENGTH,
    PRODUCT_NAME_MAX_LENGTH,
    PRODUCT_PRICE_MAX,
    PRODUCT_STOCK_MAX,
} from "./product.constants.js";

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: PRODUCT_NAME_MAX_LENGTH },
        price: { type: Number, required: true, min: Number.MIN_VALUE, max: PRODUCT_PRICE_MAX },
        stock: { type: Number, required: true, default: 0, min: 0, max: PRODUCT_STOCK_MAX },
        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            required: true,
            default: "draft",
            index: true,
        },
        isFeatured: { type: Boolean, required: true, default: false, index: true },
        description: { type: String, trim: true, maxlength: PRODUCT_DESCRIPTION_MAX_LENGTH },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

productSchema.index({ status: 1, isFeatured: 1, _id: 1 });

const Product = model("Product", productSchema, "products");

export type ProductPersistence = InferSchemaType<typeof productSchema> & {
    _id: { toString: () => string };
    created_at: Date;
    updated_at: Date;
};

export default Product;
