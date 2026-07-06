import { vi } from "vitest";
import type { Mock } from "vitest";

type MockModel = Mock & {
    find: Mock;
    findOne: Mock;
    findById: Mock;
    findByIdAndUpdate: Mock;
    findOneAndDelete: Mock;
    findByIdAndDelete: Mock;
    create: Mock;
    prototype: { save: Mock };
};

const mockSchema = () => ({
    set: vi.fn(),
    pre: vi.fn(),
    index: vi.fn(),
});

const createMockModel = (): MockModel => {
    const Model = vi.fn(function (this: Record<string, unknown>, data: Record<string, unknown>) {
        Object.assign(this, data);
    }) as unknown as MockModel;

    const defaultFindChain = {
        limit: vi.fn(),
        sort: vi.fn(),
        lean: vi.fn().mockResolvedValue([]),
    };
    defaultFindChain.limit.mockReturnValue(defaultFindChain);
    defaultFindChain.sort.mockReturnValue(defaultFindChain);

    Model.find = vi.fn(() => defaultFindChain);
    const defaultFindOneChain = { lean: vi.fn().mockResolvedValue(null) };
    Model.findOne = vi.fn(() => defaultFindOneChain);
    const defaultFindByIdChain = { lean: vi.fn().mockResolvedValue(null) };
    Model.findById = vi.fn(() => defaultFindByIdChain);
    const defaultFindByIdAndUpdateChain = { lean: vi.fn().mockResolvedValue(null) };
    Model.findByIdAndUpdate = vi.fn(() => defaultFindByIdAndUpdateChain);
    Model.findOneAndDelete = vi.fn().mockResolvedValue(null);
    Model.findByIdAndDelete = vi.fn().mockResolvedValue(null);
    Model.create = vi.fn().mockResolvedValue({});
    Model.prototype = { save: vi.fn().mockResolvedValue({}) };

    return Model;
};

const models: Record<string, MockModel> = {
    Product: createMockModel(),
    User: createMockModel(),
};

export const mockMongoose = {
    Schema: vi.fn(function MockSchema() {
        return mockSchema();
    }),
    model: vi.fn((modelName: string) => models[modelName] ?? createMockModel()),
    connection: { readyState: 1 },
    ConnectionStates: {
        disconnected: 0,
        connected: 1,
        connecting: 2,
        disconnecting: 3,
        uninitialized: 99,
    },
    Types: {
        ObjectId: vi.fn(function MockObjectId(id: string) {
            return id;
        }),
    },
};

export default mockMongoose;
