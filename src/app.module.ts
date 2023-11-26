import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, BookmarkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
