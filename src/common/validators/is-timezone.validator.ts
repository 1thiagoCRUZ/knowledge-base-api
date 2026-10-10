import { ValidationOptions, registerDecorator } from 'class-validator';

export function isValidTimeZone(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Fuso IANA válido, ex.: "America/Sao_Paulo". */
export function IsTimeZone(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimeZone',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} deve ser um fuso IANA válido, ex.: America/Sao_Paulo`,
        ...options,
      },
      validator: { validate: isValidTimeZone },
    });
  };
}
