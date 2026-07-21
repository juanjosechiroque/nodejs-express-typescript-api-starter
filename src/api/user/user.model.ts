import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

interface UserPersistence {
    email: string;
    password: string;
    status: "active" | "disabled";
    created_at: Date;
    updated_at: Date;
}

const userSchema = new Schema<UserPersistence>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },
        password: { type: String, required: true, maxlength: 72 },
        status: {
            type: String,
            enum: ["active", "disabled"],
            default: "active",
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.set("toJSON", {
    versionKey: false,
    transform: function (_doc, ret) {
        delete (ret as Partial<UserPersistence>).password;
    },
});

const User = model("User", userSchema, "users");

export default User;
