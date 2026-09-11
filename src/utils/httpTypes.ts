import type { Request } from 'express';

export type TypedRequestBody<Body> = Request<Record<string, string>, unknown, Body>;
