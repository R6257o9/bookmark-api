import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/create-user.auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(createAuthDto: CreateAuthDto) {
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

  async signin(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    // find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const passwordMatches = await argon.verify(user.hash, password);

    // if password incorrect throw exception
    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect');

    delete user.hash;
    // send back the user
    return user;
  }
}
