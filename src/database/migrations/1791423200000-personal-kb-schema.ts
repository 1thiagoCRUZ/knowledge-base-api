import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adapta o schema para a base de conhecimento pessoal.
 *
 * Escrita à mão (a partir do `migration:generate`) para preservar dados:
 * mudanças de tipo usam ALTER COLUMN ... TYPE em vez de DROP/ADD.
 *
 * ATENÇÃO: remove as tabelas "like", "suggestion" e "macro" e as colunas
 * "views", "likesCount" e "isAdmin". O `down` recria a estrutura, não os dados.
 */
export class PersonalKbSchema1791423200000 implements MigrationInterface {
  name = 'PersonalKbSchema1791423200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Funcionalidades de help desk que não fazem sentido em uma base pessoal
    await queryRunner.query(`DROP TABLE "like"`);
    await queryRunner.query(`DROP TABLE "suggestion"`);
    await queryRunner.query(`DROP TABLE "macro"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "views"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "likesCount"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isAdmin"`);

    // Timestamps com timezone (os valores antigos são interpretados como UTC)
    for (const table of ['user', 'category', 'tag', 'article']) {
      for (const column of ['createdAt', 'updatedAt']) {
        await queryRunner.query(
          `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITH TIME ZONE USING "${column}" AT TIME ZONE 'UTC'`,
        );
      }
    }

    // user: e-mail único e normalizado
    await queryRunner.query(`UPDATE "user" SET "email" = lower(trim("email"))`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
    );

    // category
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "description" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug")`,
    );

    // tag
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "UQ_3413aed3ecde54f832c4f44f045" UNIQUE ("slug")`,
    );

    // article
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "content" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "isPublished" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "publishedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "publishedAt" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "publishedAt" TYPE TIMESTAMP WITH TIME ZONE USING "publishedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `UPDATE "article" SET "publishedAt" = NULL WHERE "isPublished" = false`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_userId" ON "article" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_categoryId" ON "article" ("categoryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_search" ON "article" USING GIN (to_tsvector('portuguese', "title" || ' ' || "content"))`,
    );

    // article <-> tag
    await queryRunner.query(
      `CREATE TABLE "article_tags" ("articleId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_bfcd6ae5865482ee63ece446586" PRIMARY KEY ("articleId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acbc7f775fb5e3fe2627477b5f" ON "article_tags" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83a0534713c9e7f6bb2110c7bc" ON "article_tags" ("tagId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_articleId" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_tagId" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "article_tags"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_article_search"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_article_categoryId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_article_userId"`);
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "publishedAt" TYPE TIMESTAMP USING "publishedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `UPDATE "article" SET "publishedAt" = "createdAt" AT TIME ZONE 'UTC' WHERE "publishedAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "publishedAt" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "publishedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "isPublished" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "content" TYPE character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "UQ_3413aed3ecde54f832c4f44f045"`,
    );

    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70"`,
    );
    await queryRunner.query(
      `UPDATE "category" SET "description" = '' WHERE "description" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "description" TYPE character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
    );

    for (const table of ['user', 'category', 'tag', 'article']) {
      for (const column of ['createdAt', 'updatedAt']) {
        await queryRunner.query(
          `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP USING "${column}" AT TIME ZONE 'UTC'`,
        );
      }
    }

    await queryRunner.query(
      `ALTER TABLE "user" ADD "isAdmin" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "likesCount" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "views" integer NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(
      `CREATE TABLE "macro" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying NOT NULL, "contentBody" character varying NOT NULL, "articleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d67d86d83fe69a5a0d948dedfc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "suggestion" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "articleId" integer NOT NULL, "content" character varying NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_aa072a020434ddd7104de98eebb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "like" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "articleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_73848fcc5fb55cef88049ec4803" UNIQUE ("userId", "articleId"), CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "macro" ADD CONSTRAINT "FK_02034ddb8f8ea5722cd2a1ac9bd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "macro" ADD CONSTRAINT "FK_09ff5091578061805a4d81a3689" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion" ADD CONSTRAINT "FK_bc709ea906afb2315940db65096" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion" ADD CONSTRAINT "FK_5713c94ff22139758bce0481ac4" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_a95ce350aee91167d8a1cefeb97" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
