import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @ApiProperty({ example: 'Carlos', type: String })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @ApiProperty({ example: 'Pérez', type: String })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @ApiProperty({ example: 'carlos@clinica.com', format: 'email', type: String })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '55556789', type: String, nullable: true })
  telefono?: string | null;

  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 1,
    type: Number,
    minimum: 1,
    description: 'ID de una especialidad existente',
  })
  especialidadId: number;
}
