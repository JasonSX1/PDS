// src/supplier/dto/update-supplier.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSupplierDto, CreateAddressDto } from './create-supplier.dto'; // Importe CreateAddressDto
import { PartialType } from '@nestjs/mapped-types'; // Mantenha para UpdateAddressDto

// 1. Mantenha esta classe, ela está correta para fazer o endereço parcial
export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

// 2. Modifique UpdateSupplierDto para não estender PartialType(CreateSupplierDto)
//    e torne suas propriedades opcionais manualmente.
export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  // 3. Use UpdateAddressDto para a propriedade 'address' aqui
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto) // Use UpdateAddressDto para a transformação
  address?: UpdateAddressDto;
}