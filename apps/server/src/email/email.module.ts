import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST', 'localhost'),
          port: configService.get('SMTP_PORT', 1025),
          secure: configService.get('SMTP_SECURE', false),
          auth:
            configService.get('SMTP_USER') && configService.get('SMTP_PASS')
              ? {
                  user: configService.get('SMTP_USER'),
                  pass: configService.get('SMTP_PASS'),
                }
              : undefined,
        },
        defaults: {
          from: configService.get('EMAIL_FROM', 'Memento Mori <noreply@mementomori.de>'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
