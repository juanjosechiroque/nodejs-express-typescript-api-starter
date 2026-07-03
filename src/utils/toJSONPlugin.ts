import type { Schema } from "mongoose";

export function applyBaseToJsonTransform(_doc: unknown, ret: Record<string, unknown>) {
    const id = ret._id as { toHexString: () => string };
    ret.id = id.toHexString();
    delete ret._id;
}

export function toJSONPlugin(schema: Schema) {
    schema.set("toJSON", {
        versionKey: false,
        transform: applyBaseToJsonTransform,
    });
}
