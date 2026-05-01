import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Pulls req.user (set by JwtStrategy.validate) into a controller param.
// Usage: doSomething(@CurrentUser() user: { id: string; email: string }) {}
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as { id: string; email: string };
  },
);
