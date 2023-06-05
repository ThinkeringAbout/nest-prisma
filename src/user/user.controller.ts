import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Helper } from 'src/helpers/filename';

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
    @Param('id') id: number,
    @Body() userData: { name?: string; email?: string },
  ): Promise<string> {
    return this.userService.updateUser({
      where: { id: Number(id) },
      data: { name: userData.name, email: userData.email },
    });
  }

  @UseGuards(AuthGuard)
  @Put('users/change/password')
  async updateUserPassword(
    @Body()
    userData: {
      oldPassword: string;
      email: string;
      newPassword: string;
    },
  ): Promise<string> {
    return this.userService.updateUserPassword({
      email: userData.email,
      oldPassword: userData.oldPassword,
      newPassword: userData.newPassword,
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './images/',
        filename: Helper.customFileName,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() id: string) {
    this.userService.updateUser({
      where: { id: Number(id) },
      data: { imgUrl: file.filename },
    });
  }
}
