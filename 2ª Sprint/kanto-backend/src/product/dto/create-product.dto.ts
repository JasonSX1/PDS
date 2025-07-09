import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  size: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  categoryIds: number[];

  @IsOptional()
  @IsNumber()
  promotionId?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
