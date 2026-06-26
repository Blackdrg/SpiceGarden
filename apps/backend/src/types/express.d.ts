declare global {
  namespace Express {
    interface Request {
      ip?: string;
    }
  }
}