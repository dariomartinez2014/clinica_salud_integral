import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @ApiProperty({ example: 'Ana', type: String })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @ApiProperty({ example: 'López', type: String })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @ApiProperty({ example: 'ana@mail.com', format: 'email', type: String })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '55551234', type: String, nullable: true })
  telefono?: string | null;

  @IsDateString(
    { strict: true },
    { message: 'La fecha de nacimiento debe ser válida' },
  )
  @ApiProperty({ example: '1990-01-01', format: 'date', type: String })
  fechaNacimiento: string;
}
