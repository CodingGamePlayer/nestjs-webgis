import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public-api.decoratpr';
import { SendMailReqDto } from './dto/req.dto';
import { MailService } from './mail.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/decorators/api-common-res.decorator';

@Controller('mail/v1')
@ApiTags('Mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('confirmation')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses()
  async sendConfirmationEmail(@Body() sendMailReqDto: SendMailReqDto) {
    await this.mailService.sendConfirmationEmail(sendMailReqDto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses()
  async sendResetPasswordEmail(@Body() sendMailReqDto: SendMailReqDto) {
    await this.mailService.sendResetPasswordEmail(sendMailReqDto);
  }

  @Post('welcome')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses()
  async sendWelcomeEmail(@Body() sendMailReqDto: SendMailReqDto) {
    await this.mailService.sendWelcomeEmail(sendMailReqDto);
  }

  @Post('goodbye')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses()
  async sendGoodbyeEmail(@Body() sendMailReqDto: SendMailReqDto) {
    await this.mailService.sendGoodbyeEmail(sendMailReqDto);
  }
}
