import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler<TReq extends Request = Request> = (
    req: TReq,
    res: Response,
    next: NextFunction
) => void | Promise<void>;

export function asyncHandler<TReq extends Request = Request>(
    handler: AsyncRequestHandler<TReq>
): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(handler(req as TReq, res, next)).catch(next);
    };
}
