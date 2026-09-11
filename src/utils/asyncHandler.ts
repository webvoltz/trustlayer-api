import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncHandler<Req extends Request = Request>(
  handler: AsyncRequestHandler<Req>,
): RequestHandler {
  return (req, res, next) => {
    handler(req as Req, res, next).catch(next);
  };
}
