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

  @Post('send-confirmation-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses()
  async sendConfirmationEmail(@Body() sendMailReqDto: SendMailReqDto) {
    await this.mailService.sendConfirmationEmail(sendMailReqDto);
  }
}
