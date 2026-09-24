import { PartialType } from '@nestjs/swagger';
import { CreatePacienteDto } from './create-paciente.dto.js';

export class UpdatePacienteDto extends PartialType(CreatePacienteDto, {
  skipNullProperties: false,
}) {}
