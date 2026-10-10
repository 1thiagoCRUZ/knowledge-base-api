import { slugify } from './slugify';

describe('slugify', () => {
  it('remove acentos e pontuação', () => {
    expect(slugify('Introdução ao NestJS!')).toBe('introducao-ao-nestjs');
  });

  it('colapsa separadores e apara as pontas', () => {
    expect(slugify('  SQL --  Joins & Índices  ')).toBe('sql-joins-indices');
  });

  it('retorna vazio quando não sobra nada', () => {
    expect(slugify('!!!')).toBe('');
  });
});
