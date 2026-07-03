import { Schema, model, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const Product = model("Product", productSchema, "products");

export type ProductDocument = InferSchemaType<typeof productSchema> & {
    _id: { toString: () => string };
};

export default Product;
