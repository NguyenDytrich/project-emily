import { Request, Response } from 'express';

export default class AppContext {
  req!: Request;
  res!: Response;
  payload?: { userId: string };
}
