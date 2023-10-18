import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendMailReqDto } from './dto/req.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(sendMailReqDto: SendMailReqDto) {
    await this.mailerService.sendMail({
      to: sendMailReqDto.email,
      subject: 'Please confirm your email',
      template: 'confirmation',
      context: {
        name: sendMailReqDto.name,
        confirmationLink: sendMailReqDto.redirection,
      },
    });
  }

  async sendResetPasswordEmail(sendMailReqDto: SendMailReqDto) {
    await this.mailerService.sendMail({
      to: sendMailReqDto.email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        name: sendMailReqDto.name,
        resetPasswordLink: sendMailReqDto.redirection,
      },
    });
  }

  async sendWelcomeEmail(sendMailReqDto: SendMailReqDto) {
    await this.mailerService.sendMail({
      to: sendMailReqDto.email,
      subject: 'Welcome to NestJS Boilerplate',
      template: 'welcome',
      context: {
        name: sendMailReqDto.name,
      },
    });
  }

  async sendGoodbyeEmail(sendMailReqDto: SendMailReqDto) {
    await this.mailerService.sendMail({
      to: sendMailReqDto.email,
      subject: 'Goodbye from NestJS Boilerplate',
      template: 'goodbye',
      context: {
        name: sendMailReqDto.name,
      },
    });
  }
}
