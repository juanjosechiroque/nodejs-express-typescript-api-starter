export function toJSONPlugin(schema) {
    schema.set("toJSON", {
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id.toHexString();
            delete ret._id;
        },
    });
}
