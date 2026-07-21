import type { Schema, ToObjectOptions } from "mongoose";

export function applyBaseToJsonTransform(_doc: unknown, ret: Record<string, unknown>) {
    const id = ret._id as { toHexString: () => string };
    ret.id = id.toHexString();
    delete ret._id;
}

export function toJSONPlugin(schema: Schema) {
    const existingOptions = schema.get("toJSON") ?? {};
    const existingTransform = existingOptions.transform as
        | ((doc: unknown, ret: Record<string, unknown>, options: ToObjectOptions) => unknown)
        | boolean
        | undefined;

    schema.set("toJSON", {
        ...existingOptions,
        versionKey: false,
        transform: (doc, ret, options) => {
            applyBaseToJsonTransform(doc, ret);

            if (typeof existingTransform === "function") {
                const transformed = existingTransform(doc, ret, options as ToObjectOptions);
                return transformed != null && typeof transformed === "object" ? transformed : ret;
            }

            return ret;
        },
    });
}
