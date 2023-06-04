import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string; password: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @UseGuards(AuthGuard)
  @Get('users')
  async getAllUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @UseGuards(AuthGuard)
  @Put('users/:id')
  async updateUserInfo(
    @Param('id') id: string,
    @Body() userData: { name?: string; email?: string },
  ): Promise<string> {
    return this.userService.updateUser({
      where: { id: Number(id) },
      data: { name: userData.name, email: userData.email },
    });
  }
}
