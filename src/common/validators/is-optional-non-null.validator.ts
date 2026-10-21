import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Como @IsOptional(), mas só para `undefined`: um `null` explícito ainda é
 * validado (e reprovado). Use em campos de PATCH que podem ser omitidos mas
 * não apagados.
 */
export function IsOptionalNonNull(options?: ValidationOptions) {
  return ValidateIf((_object, value) => value !== undefined, options);
}
