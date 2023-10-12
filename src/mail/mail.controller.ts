import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public-api.decoratpr';
import { SendMailReqDto } from './dto/req.dto';
import { MailService } from './mail.service';

@Controller('mail/v1')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-confirmation-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  async sendConfirmationEmail(@Body() sendMailReqDto: SendMailReqDto) {
    await this.mailService.sendConfirmationEmail(sendMailReqDto);
  }
}
