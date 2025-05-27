import {
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const token = await this.getTokenFromRequest(context);

    if (!token) {
      throw new UnauthorizedException('UnAuthorized! Please login to continue');
    }

    const user = await this.getUserFromToken(token);

    if (!user) {
      throw new UnauthorizedException('UnAuthorized! Please login to continue');
    }

    context.switchToHttp().getRequest().user = user;

    return true;
  }

  //   helper functions
  async getTokenFromRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];

    // console.log("User token: ", token)
    return token;
  }

  async getUserFromToken(token: string) {
    try {
      const payload: { sub?: string } = jwtDecode(token);

      if (!payload || typeof payload.sub !== 'string') {
        throw new UnauthorizedException(
          'UnAuthorized! Please login to continue',
        );
      }
      const user = await this.usersService.getUserById(payload.sub);

      return user;
    } catch (error) {
      console.log('Error while extracting user from token: ', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Oops! something went wrong');
    }
  }
}
