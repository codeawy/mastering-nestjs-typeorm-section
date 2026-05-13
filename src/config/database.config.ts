import { registerAs } from '@nestjs/config';
import { databaseSchema } from '../schema/database.schema';

export const databaseConfig = registerAs('database', () => {
  const result = databaseSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Database config validation failed:\n${result.error.issues
        .map((i) => `  ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    );
  }
  return result.data;
});
