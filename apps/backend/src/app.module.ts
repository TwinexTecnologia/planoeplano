import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { PeriodsModule } from './periods/periods.module';
import { ItemsModule } from './items/items.module';
import { ImportsModule } from './imports/imports.module';
import { MethodologyModule } from './methodology/methodology.module';
import { IndexesModule } from './indexes/indexes.module';
import { IcppModule } from './icpp/icpp.module';
import { AuditModule } from './audit/audit.module';
import { HealthController } from './health/health.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CompanyContextMiddleware } from './common/middleware/company-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    PeriodsModule,
    ItemsModule,
    ImportsModule,
    MethodologyModule,
    IndexesModule,
    IcppModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompanyContextMiddleware).forRoutes('*');
  }
}
