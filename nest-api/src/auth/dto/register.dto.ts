import { IsIn, IsString, MinLength, MaxLength } from 'class-validator';
import { LoginDto } from './login.dto.js';
import type { Role } from '../../../generated/prisma/enums.js';
export class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nombre: string = 'Usuario';
  @IsIn(['RECEPCIONISTA', 'MEDICO', 'GERENCIA'])
  role: Role;
}
