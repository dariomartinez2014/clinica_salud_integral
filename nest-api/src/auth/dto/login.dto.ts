import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @ApiProperty({
    example: 'recepcion-demo@clinica.com',
    type: String,
    format: 'email',
  })
  email: string;
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  @ApiProperty({
    example: 'Demo123456',
    type: String,
    format: 'password',
    minLength: 6,
    maxLength: 72,
    writeOnly: true,
  })
  password: string;
}
