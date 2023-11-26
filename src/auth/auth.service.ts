import { Injectable, Body, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/create-user.auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(@Body() createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    // generate password hash
    const hash = await argon.hash(password);

    try {
      // save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          email,
          hash,
        },
      });
      // provisory
      delete user.hash;

      // return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  signin() {
    return 'signin';
  }
}
