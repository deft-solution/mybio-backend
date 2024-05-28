import { ErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class NotFoundError extends HttpError {

  constructor(message: string, errorCode?: number) {
    super("NOT_FOUND", ErrorCode.NotFound, message, errorCode);
  }

}