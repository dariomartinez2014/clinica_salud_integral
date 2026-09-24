import { PartialType } from '@nestjs/swagger';
import { CreateMedicoDto } from './create-medico.dto.js';

export class UpdateMedicoDto extends PartialType(CreateMedicoDto, {
  skipNullProperties: false,
}) {}
