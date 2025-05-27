import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}
  async register(registerDto: RegisterDto) {
    console.log('Registering user with data: ', registerDto);

    try {
      const existingUser = await this.usersService.getUserByEmail(
        registerDto.email,
      );

      console.log('Existing user found: ', existingUser);

      if (!!existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // creating new user

      const newUser = await this.prismaService.user.create({
        data: registerDto,
      });

      return {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
      };
    } catch (error) {
      // console.log('Error during user registration: ', error);

      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user', {
        cause: error,
      });
    }
  }

  async login(user: any, response: any) {
    try {
      const existingUser = await this.usersService.getUserByEmail(user.email);
      const payload = {
        sub: existingUser?.id,
        email: existingUser?.email,
        username: existingUser?.username,

        iat: Math.floor(Date.now() / 1000), // Issued at time
      };

      const access_token = this.jwtService.sign(payload);

      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return {
        message: 'Login successful',
        user: {
          id: existingUser?.id,
          email: existingUser?.email,
          username: existingUser?.username,
        },
        access_token,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to login user', {
        cause: error,
      });
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUserByEmail(email);
      if (!user) {
        return null;
      }

      // validate password
      await this.usersService.validatePassword(password, user.password);

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to validate user with email ${email}`,
        {
          cause: error,
        },
      );
    }
  }
}
