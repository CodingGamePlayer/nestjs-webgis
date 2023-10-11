import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class PageReqDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  size: number = 10;
}
