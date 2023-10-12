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
        confirmationLink: sendMailReqDto.confirmationLink,
      },
    });
  }
}
