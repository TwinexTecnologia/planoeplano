import {
  IsString,
  IsNotEmpty,
  Matches,
  IsISO8601,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { StatusCompetencia } from '@prisma/client';

/** YYYYMM, ex: "202610" para OUT/26 */
const COMP_REGEX = /^\d{6}$/;

export class CreatePeriodDto {
  @IsString()
  @IsNotEmpty()
  @Matches(COMP_REGEX, { message: 'competencia deve estar no formato YYYYMM (ex: 202610)' })
  competencia: string;

  @IsISO8601({ strict: false })
  data_inicio: string;

  @IsISO8601({ strict: false })
  data_fim: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  descricao?: string;

  @IsOptional()
  @IsString()
  metodo_id?: string;
}

export class UpdatePeriodDto {
  @IsOptional()
  @IsISO8601({ strict: false })
  data_inicio?: string;

  @IsOptional()
  @IsISO8601({ strict: false })
  data_fim?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  descricao?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsString()
  metodo_id?: string;
}

export class ChangeStatusDto {
  @IsEnum(StatusCompetencia, {
    message:
      'status deve ser um de: DRAFT, PROCESSING, REVIEW, VALIDATED, CLOSED',
  })
  status: StatusCompetencia;
}

export class ReabrirCompetenciaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  justificativa: string;
}

export class ListPeriodsQueryDto {
  @IsOptional()
  @IsEnum(StatusCompetencia)
  status?: StatusCompetencia;

  @IsOptional()
  @IsString()
  competencia?: string;
}
