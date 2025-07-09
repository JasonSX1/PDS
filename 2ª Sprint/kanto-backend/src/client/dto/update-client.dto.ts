import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto, CreateAddressDto } from './create-client.dto';
import { ValidateNested, IsOptional, IsString, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;
} 