import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuditService } from '../../modules/audit/audit.service';


const SKIP_METHODS = new Set(['GET']);
const SKIP_PATH_PREFIXES = ['/health'];


@Injectable()
export class AuditInterceptor implements NestInterceptor {

  constructor(
    private readonly auditService: AuditService,
  ) {}


  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {

    if (context.getType<string>() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<{
      method: string;
      path: string;
      user?: { sub?: string; id?: string };
    }>();

    const { method, path } = req;

    if (
      SKIP_METHODS.has(method) ||
      SKIP_PATH_PREFIXES.some(prefix => path.startsWith(prefix))
    ) {
      return next.handle();
    }


    const userId = (): string =>
      req.user?.sub ?? req.user?.id ?? 'anonymous';

    const log = (statusCode: number): void => {
      this.auditService
        .log(
          userId(),
          `${method} ${path}`,
          { statusCode, timestamp: new Date().toISOString() },
        )
        .catch(() => {});
    };


    return next.handle().pipe(

      tap(() => {
        const res = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();
        log(res.statusCode);
      }),

      catchError((err: unknown) => {
        const statusCode =
          err instanceof HttpException ? err.getStatus() : 500;
        log(statusCode);
        return throwError(() => err);
      }),

    );

  }

}
