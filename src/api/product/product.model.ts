import { Schema, model, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0, min: 0 },
        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            required: true,
            default: "draft",
            index: true,
        },
        isFeatured: { type: Boolean, required: true, default: false, index: true },
        description: { type: String },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

productSchema.index({ status: 1, isFeatured: 1, _id: 1 });

const Product = model("Product", productSchema, "products");

export type ProductDocument = InferSchemaType<typeof productSchema> & {
    _id: { toString: () => string };
};

export default Product;
