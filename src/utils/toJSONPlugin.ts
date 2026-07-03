import type { Schema } from "mongoose";

export function toJSONPlugin(schema: Schema) {
    schema.set("toJSON", {
        versionKey: false,
        transform: function (_doc, ret) {
            const id = ret._id as { toHexString: () => string };
            ret.id = id.toHexString();
            delete ret._id;
        },
    });
}
