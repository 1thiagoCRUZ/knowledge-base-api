import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Categorias e tags passam a ter dono, e os slugs/IDs externos deixam de ser
 * únicos no sistema inteiro para serem únicos por usuário.
 * Registros existentes ficam com o primeiro usuário cadastrado.
 */
export class PerUserOwnership1791900000000 implements MigrationInterface {
  name = 'PerUserOwnership1791900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['category', 'tag']) {
      await queryRunner.query(`ALTER TABLE "${table}" ADD "userId" integer`);
      await queryRunner.query(
        `UPDATE "${table}" SET "userId" = (SELECT min("id") FROM "user")`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "userId" SET NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "FK_${table}_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    // category: slug único por usuário
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "UQ_16adc7cbdddd99ef712caed4a1e" UNIQUE ("userId", "slug")`,
    );

    // tag: slug único por usuário
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "UQ_3413aed3ecde54f832c4f44f045"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "UQ_00c96a0e8af6302769a653ab24d" UNIQUE ("userId", "slug")`,
    );

    // article: slug e (source, externalId) únicos por usuário
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_7eb283345eb0c87b1ffe3c45995" UNIQUE ("userId", "slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_594bbe2336fa2b6fdf8743f528e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_b94eb81aff26b20fd1ad7966cd5" UNIQUE ("userId", "source", "externalId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_b94eb81aff26b20fd1ad7966cd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_594bbe2336fa2b6fdf8743f528e" UNIQUE ("source", "externalId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_7eb283345eb0c87b1ffe3c45995"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE ("slug")`,
    );

    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "UQ_00c96a0e8af6302769a653ab24d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "UQ_3413aed3ecde54f832c4f44f045" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "UQ_16adc7cbdddd99ef712caed4a1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug")`,
    );

    for (const table of ['tag', 'category']) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP CONSTRAINT "FK_${table}_userId"`,
      );
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "userId"`);
    }
  }
}
