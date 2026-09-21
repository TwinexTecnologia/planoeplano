import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Ip,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';
import {
  ChangeStatusDto,
  CreatePeriodDto,
  ListPeriodsQueryDto,
  ReabrirCompetenciaDto,
  UpdatePeriodDto,
} from './dto';

type AuthenticatedRequest = any;

@ApiTags('Competências (Periods)')
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periods: PeriodsService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query() query: ListPeriodsQueryDto) {
    return this.periods.findAll(req.companyId, query);
  }

  @Get(':id')
  detail(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.periods.findOne(req.companyId, id);
  }

  @Get(':id/audit')
  audit(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.periods.findOneAuditLog(req.companyId, id);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePeriodDto,
    @Ip() ip: string,
  ) {
    return this.periods.create(req.companyId, req.userId, dto, ip);
  }

  @Put(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePeriodDto,
    @Ip() ip: string,
  ) {
    return this.periods.update(req.companyId, req.userId, id, dto, ip);
  }

  @Patch(':id/status')
  changeStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @Ip() ip: string,
  ) {
    return this.periods.changeStatus(
      req.companyId,
      req.userId,
      req.userRole,
      id,
      dto,
      ip,
    );
  }

  /** Reabre competência FECHADA → REVIEW (exige justificativa + OWNER/ADMIN). */
  @Post(':id/reabrir')
  @HttpCode(200)
  reabrir(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ReabrirCompetenciaDto,
    @Ip() ip: string,
  ) {
    return this.periods.reabrir(
      req.companyId,
      req.userId,
      req.userRole,
      id,
      dto,
      ip,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Ip() ip: string,
  ) {
    return this.periods.remove(req.companyId, req.userId, id, ip);
  }
}
