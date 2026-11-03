// Apunte de estudio: Aquí describo y valido los campos que acepta la operación del módulo.
import { PartialType } from '@nestjs/mapped-types';
import { CreatePacienteDto } from './create-paciente.dto.js';

export class UpdatePacienteDto extends PartialType(CreatePacienteDto, {
  skipNullProperties: false,
}) {}
