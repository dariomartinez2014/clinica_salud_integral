import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @ApiOperation({ summary: 'Registra un usuario' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un registro con ese valor único',
  })
  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.auth.register(data);
  }
  @ApiOperation({ summary: 'Inicia sesión y devuelve un token JWT' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  @HttpCode(200)
  login(@Body() data: LoginDto) {
    return this.auth.login(data.email, data.password);
  }
}
