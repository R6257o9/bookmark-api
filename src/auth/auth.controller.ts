import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-user.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('signin')
  signin(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signin(createAuthDto);
  }
}
