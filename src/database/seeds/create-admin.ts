/**
 * Cria (ou atualiza a senha de) o usuário dono da base.
 *
 *   ADMIN_NAME="Thiago" ADMIN_EMAIL="eu@exemplo.com" ADMIN_PASSWORD="..." npm run seed:admin
 *
 * As variáveis também podem ficar no .env.
 */
import dataSource from '../data-source';
import { User } from '../../modules/users/user.entity';
import {
  hashPassword,
  normalizeEmail,
} from '../../modules/users/users.service';

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD.');
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD deve ter pelo menos 8 caracteres.');
  }

  await dataSource.initialize();
  try {
    const users = dataSource.getRepository(User);
    const email = normalizeEmail(ADMIN_EMAIL);
    const password = await hashPassword(ADMIN_PASSWORD);
    const existing = await users.findOneBy({ email });

    if (existing) {
      await users.update(existing.id, {
        password,
        ...(ADMIN_NAME ? { name: ADMIN_NAME } : {}),
      });
      console.log(`Senha de ${email} atualizada.`);
    } else {
      await users.save(
        users.create({ name: ADMIN_NAME ?? 'Admin', email, password }),
      );
      console.log(`Usuário ${email} criado.`);
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
