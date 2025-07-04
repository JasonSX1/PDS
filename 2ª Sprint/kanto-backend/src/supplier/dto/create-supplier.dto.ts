// src/supplier/dto/create-supplier.dto.ts

import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para o endereço
export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  street: string; // Corresponde a 'rua' no schema via @map

  @IsNotEmpty()
  @IsString()
  number: string; // Corresponde a 'numero' no schema via @map

  @IsNotEmpty()
  @IsString()
  city: string; // Corresponde a 'cidade' no schema via @map

  @IsNotEmpty()
  @IsString()
  state: string; // Corresponde a 'estado' no schema via @map

  @IsNotEmpty()
  @IsString()
  zipCode: string; // Corresponde a 'cep' no schema via @map
}

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Nome do fornecedor (corresponde a 'name' no schema, que é mapeado para 'nome_fornecedor' na imagem)

  @IsNotEmpty()
  @IsString()
  cnpj: string; // CNPJ (campo único no schema)

  @IsArray()
  @IsString({ each: true }) // phones é um array de strings
  @IsNotEmpty({ each: true })
  phones: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  emails?: string[]; // emails é um array de strings

  @IsNotEmpty() // Tornando o endereço obrigatório, como no Seller
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto; // O nome do relacionamento no schema é 'address'
}