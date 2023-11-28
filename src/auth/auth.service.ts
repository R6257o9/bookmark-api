import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/create-user.auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createAuthDto: CreateAuthDto) {
    const { email, password, firstName, lastName } = createAuthDto;

    // generate password hash
    const hash = await argon.hash(password);

    try {
      // save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          email,
          firstName,
          lastName,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signIn(createAuthDto: CreateAuthDto) {
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
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = {
        sub: userId,
        email,
      };

      const secret = this.configService.get('JWT_SECRET');
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: secret,
      });

      return {
        access_token: token,
      };
    } catch (error) {
      throw new Error(`Error generating token: [${error}]`);
    }
  }
}
