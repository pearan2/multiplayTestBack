import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingpongGateway } from './pingpong.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PingpongGateway],
})
export class AppModule {}
