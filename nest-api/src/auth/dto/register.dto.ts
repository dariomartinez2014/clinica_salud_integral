import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsString, MinLength, MaxLength } from 'class-validator';
import { LoginDto } from './login.dto.js';
import type { Role } from '../../../generated/prisma/enums.js';
export class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Recepción',
    default: 'Usuario',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  nombre: string = 'Usuario';
  @IsIn(['RECEPCIONISTA', 'MEDICO', 'GERENCIA'])
  @ApiProperty({
    example: 'RECEPCIONISTA',
    enum: ['RECEPCIONISTA', 'MEDICO', 'GERENCIA'],
    description: 'Selección de rol para el ejercicio académico',
  })
  role: Role;
}
