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
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string | null;

  @IsInt()
  @Min(1)
  especialidadId: number;
}
