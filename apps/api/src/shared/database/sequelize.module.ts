import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: process.env['DB_HOST'] ?? 'localhost',
        port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
        username: process.env['DB_USERNAME'] ?? 'postgres',
        password: process.env['DB_PASSWORD'] ?? 'postgres',
        database: process.env['DB_NAME'] ?? 'pet_adoption',
        autoLoadModels: true,
        synchronize: process.env['NODE_ENV'] !== 'production',
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
