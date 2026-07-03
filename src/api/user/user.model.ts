import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { applyBaseToJsonTransform } from "../../utils/toJSONPlugin.js";

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.set("toJSON", {
    versionKey: false,
    transform: function (_doc: unknown, ret: Record<string, unknown>) {
        applyBaseToJsonTransform(_doc, ret);
        delete ret.password;
    },
});

const User = model("User", userSchema, "users");

export default User;
