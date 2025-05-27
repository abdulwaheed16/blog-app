import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  createUser(createUserDto: CreateUserDto) {
    console.log('Creating user with DTO:', createUserDto);
    try {
      // check if the user already exists
      const existingUser = this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (!!existingUser) {
        throw new Error('User already exists');
      }

      // create the user
      return this.prismaService.user.create({
        data: createUserDto,
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUsers() {
    try {
      const users = await this.prismaService.user.findMany();
      if (!users || users.length === 0) {
        throw new NotFoundException('No users found');
      }
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users', {
        cause: error,
      });
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve user with ID ${userId}`,
        {
          cause: error,
        },
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve user by email',
        {
          cause: error,
        },
      );
    }
  }

  async getUserByUsername(username: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve user by username',
        {
          cause: error,
        },
      );
    }
  }

  updateUser(userId: string, updateUserDto: UpdateUserDto) {}

  deleteUser(userId: string) {}

  // helper functions

  async validatePassword(userPassword: string, dbPassword: string) {
    try {
      const isPasswordValid = await bcrypt.compare(userPassword, dbPassword);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Failed to validate password', {
        cause: error,
      });
    }
  }
}
