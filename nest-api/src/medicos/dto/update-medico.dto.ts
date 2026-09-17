import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicoDto } from './create-medico.dto.js';

export class UpdateMedicoDto extends PartialType(CreateMedicoDto, {
  skipNullProperties: false,
}) {}
