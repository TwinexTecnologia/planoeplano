import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const db = await this.prisma.$queryRaw<[{ ok: number }]>`SELECT 1::int as ok`.catch(() => null);
    return {
      status: db ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      postgres: db ? 'connected' : 'disconnected',
      version: '0.1.0-sprint-0',
      pv_status: 'PV1–PV10 PENDENTES DE VALIDAÇÃO HUMANA',
    };
  }
}
