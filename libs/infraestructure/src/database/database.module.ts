import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        uri: configService.get<string>('MONGO_URI')!,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        dbName: configService.get<string>('MONGO_DB')!,
      }),
    }),
  ],
})
export class DatabaseModule {}
