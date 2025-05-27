import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request;

    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;

    this.logger.log(`
      ${method} ${url} ${userAgent} ${ip} : ${context.getClass().name} ${context.getHandler().name} invoked...`);

    this.logger.log('userId: ', userId);
    const requestComingTime = Date.now();
    return next.handle().pipe(
      tap((response) => {
        const res = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const contentLength = res.get('content-length');

        const requestExecutionTime = `${Date.now() - requestComingTime}ms`;

        this.logger.log(`
          ${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} : ${requestExecutionTime}`);

        // this.logger.debug('Response: ', response);
      }),
    );
  }
}
