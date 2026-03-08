import { Schema, model } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: String },
        price: { type: Number },
        description: { type: String },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

productSchema.set("toJSON", {
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toHexString();
        delete ret._id;
    },
});

const Product = model("Product", productSchema, "products");

export default Product;
