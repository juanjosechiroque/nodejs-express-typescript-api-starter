import { vi } from "vitest";

const mockSchema = () => ({
    set: vi.fn(),
    pre: vi.fn(),
    index: vi.fn(),
});

const createMockModel = () => {
    const Model = vi.fn(function (this: Record<string, unknown>, data: Record<string, unknown>) {
        Object.assign(this, data);
    });

    const defaultFindChain: Record<string, unknown> = {};
    defaultFindChain.limit = vi.fn().mockReturnValue(defaultFindChain);
    defaultFindChain.sort = vi.fn().mockReturnValue(defaultFindChain);
    defaultFindChain.lean = vi.fn().mockResolvedValue([]);
    Model.find = vi.fn(() => defaultFindChain);
    Model.findOne = vi.fn().mockResolvedValue(null);
    const defaultFindByIdChain = { lean: vi.fn().mockResolvedValue(null) };
    Model.findById = vi.fn(() => defaultFindByIdChain);
    Model.findByIdAndUpdate = vi.fn().mockResolvedValue(null);
    Model.findByIdAndDelete = vi.fn().mockResolvedValue(null);
    Model.create = vi.fn().mockResolvedValue({});
    Model.prototype.save = vi.fn().mockResolvedValue({});

    return Model;
};

const models: Record<string, ReturnType<typeof createMockModel>> = {
    Product: createMockModel(),
    User: createMockModel(),
};

export const mockMongoose = {
    Schema: vi.fn(function MockSchema() {
        return mockSchema();
    }),
    model: vi.fn((modelName: string) => models[modelName] || createMockModel()),
    connection: { readyState: 1 },
    Types: {
        ObjectId: vi.fn(function MockObjectId(id: string) {
            return id;
        }),
    },
};

export default mockMongoose;
