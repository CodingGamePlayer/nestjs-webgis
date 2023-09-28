import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class PageReqDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  size: number;
}
