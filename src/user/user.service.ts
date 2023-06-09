import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereInput,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<any> {
    const pass = data.password;
    const user = await this.user({
      email: { equals: data.email },
    });
    if (user) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const hash = await bcrypt.hash(pass, 10);
    data.password = hash;
    const resUser = await this.prisma.user.create({ data });
    const payload = {
      sub: resUser.id,
      username: resUser.name,
      email: resUser.email,
      imgUrl: resUser.imgUrl,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async updateUserPassword(data: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<any> {
    const user = await this.user({
      email: { equals: data.email },
    });
    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const hash = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { email: data.email },
      data: { password: hash },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<any> {
    const { where, data } = params;
    const user = await this.prisma.user.update({
      data,
      where,
    });
    const payload = {
      sub: user.id,
      username: user.name,
      email: user.email,
      imgUrl: user.imgUrl,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
