import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { databaseConfig } from '../../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: config.DB_HOST,
        port: config.DB_PORT, // already a number — Zod coerced it
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: config.DB_SYNCHRONIZE,
      }),
    }),
  ],
})
export class DatabaseModule {}
