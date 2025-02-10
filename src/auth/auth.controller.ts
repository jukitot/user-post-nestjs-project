import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { SingUpDto, UserDto } from '../user/dto/user.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: SingUpDto })
  @Post('register')
  create(@Body() body: UserDto) {
    return this.authService.signUpUser(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }
}
