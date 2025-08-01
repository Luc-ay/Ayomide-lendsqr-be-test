import { Request, Response, NextFunction } from 'express'
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err)

  res.status(err.status || 500).json({
    message: err.publicMessage || 'Internal server error',
  })
}
