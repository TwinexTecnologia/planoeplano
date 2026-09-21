import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: { email: string; senha: string }) {
    return this.auth.login(body.email, body.senha);
  }

  @Public()
  @Post('register')
  registrar(@Body() body: { nomeEmpresa: string; email: string; senha: string; nomeUsuario?: string }) {
    return this.auth.registrar(body.nomeEmpresa, body.email, body.senha, body.nomeUsuario);
  }

  @Get('me')
  me(@Request() req: any) {
    return {
      user_id: req.userId,
      company_id: req.companyId,
      role: req.userRole,
      email: req.user?.email,
    };
  }
}
