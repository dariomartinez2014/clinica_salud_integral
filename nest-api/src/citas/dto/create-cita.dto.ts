import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCitaDto {
  @ApiProperty({
    example: 1,
    type: Number,
    minimum: 1,
    description:
      'ID de un paciente existente; se verifica mediante PacientesService',
  })
  @IsInt()
  @Min(1)
  pacienteId: number;

  @ApiProperty({
    example: 1,
    type: Number,
    minimum: 1,
    description:
      'ID de un médico existente en la base; se recibe como valor plano',
  })
  @IsInt()
  @Min(1)
  medicoId: number;

  @ApiProperty({
    example: '2030-10-01T15:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({ strict: true })
  fecha: string;

  @ApiPropertyOptional({
    example: 'Control general',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  motivo?: string | null;
}
