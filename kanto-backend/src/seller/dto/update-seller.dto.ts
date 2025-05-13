import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerDto } from './create-seller.dto';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSellerDto extends PartialType(CreateSellerDto) {
  @IsNumber({}, { message: 'O id não pode ser vazio.' })
  @Type(() => Number)
  readonly id: number;
}
