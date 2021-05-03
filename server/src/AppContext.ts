import { Request, Response } from 'express';

export default class AppContext {
  req!: Request;
  res!: Response;
  payload?: JwtPayload;
}

export class JwtPayload {
  userId!: string;
}
