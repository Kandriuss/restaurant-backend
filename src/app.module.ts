import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/domain/src/database';
@Module({
  imports: [
    //Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    //Configuración de base de datos
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
