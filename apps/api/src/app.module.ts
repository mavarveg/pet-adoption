import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/sequelize.module';
import { AuthModule } from './modules/auth/auth.module';
import { PetsModule } from './modules/pets/pets.module';
import { ApplicationsModule } from './modules/applications/applications.module';

@Module({
  imports: [DatabaseModule, AuthModule, PetsModule, ApplicationsModule],
})
export class AppModule {}
