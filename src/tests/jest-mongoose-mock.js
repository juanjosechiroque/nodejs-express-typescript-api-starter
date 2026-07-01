import { jest } from "@jest/globals";

const mockSchema = () => ({
    set: jest.fn(),
    pre: jest.fn(),
});

const createMockModel = () => {
    const Model = jest.fn(function (data) {
        Object.assign(this, data);
    });

    const defaultFindChain = {};
    defaultFindChain.limit = jest.fn().mockReturnValue(defaultFindChain);
    defaultFindChain.sort = jest.fn().mockReturnValue(defaultFindChain);
    defaultFindChain.lean = jest.fn().mockResolvedValue([]);
    Model.find = jest.fn(() => defaultFindChain);
    Model.findOne = jest.fn().mockResolvedValue(null);
    const defaultFindByIdChain = { lean: jest.fn().mockResolvedValue(null) };
    Model.findById = jest.fn(() => defaultFindByIdChain);
    Model.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    Model.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    Model.create = jest.fn().mockResolvedValue({});
    Model.prototype.save = jest.fn().mockResolvedValue({});

    return Model;
};

const models = {
    Product: createMockModel(),
    User: createMockModel(),
};

export const mockMongoose = {
    Schema: jest.fn(() => mockSchema()),
    model: jest.fn((modelName) => models[modelName] || createMockModel()),
    connection: { readyState: 1 },
    Types: {
        ObjectId: jest.fn((id) => id),
    },
};

export default mockMongoose;
