import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const user = await this.prisma.users.findFirst({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas.');
    if (!user.ativo) throw new UnauthorizedException('Usuário inativo.');

    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      company_id: user.company_id,
      role: user.role,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        company_nome: user.company.nome,
      },
    };
  }

  async registrar(nomeEmpresa: string, email: string, senha: string, nomeUsuario?: string) {
    const existe = await this.prisma.users.findFirst({
      where: { email: email.toLowerCase() },
    });
    if (existe) throw new BadRequestException('Este e-mail já está cadastrado.');

    const senhaHash = await bcrypt.hash(senha, 10);

    const empresa = await this.prisma.companies.create({
      data: {
        nome: nomeEmpresa,
        plano: 'TRIAL',
      },
    });

    const usuario = await this.prisma.users.create({
      data: {
        company_id: empresa.id,
        email: email.toLowerCase(),
        nome: nomeUsuario || nomeEmpresa,
        senha_hash: senhaHash,
        role: 'OWNER',
      },
    });

    return this.login(email, senha);
  }
}
