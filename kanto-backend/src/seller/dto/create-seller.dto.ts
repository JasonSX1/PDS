import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsNotEmpty({ message: 'O CEP não pode ser vazio.' })
  @IsString({ message: 'O CEP deve ser uma string.' })
  zipCode: string;

  @IsNotEmpty({ message: 'A rua não pode ser vazia.' })
  @IsString({ message: 'A rua deve ser uma string.' })
  street: string;

  @IsNotEmpty({ message: 'O número não pode ser vazio.' })
  @IsString({ message: 'O número deve ser uma string.' })
  number: string;

  @IsNotEmpty({ message: 'A cidade não pode ser vazia.' })
  @IsString({ message: 'A cidade deve ser uma string.' })
  city: string;

  @IsNotEmpty({ message: 'O estado não pode ser vazio.' })
  @IsString({ message: 'O estado deve ser uma string.' })
  state: string;
}

export class CreateSellerDto {
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  name: string;

  @IsNotEmpty({ message: 'O e-mail não pode ser vazio.' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsNotEmpty({ message: 'O telefone não pode ser vazio.' })
  @IsString({ message: 'O telefone deve ser uma string.' })
  phone: string;

  @IsNotEmpty({ message: 'O CPF não pode ser vazio.' })
  @IsString({ message: 'O CPF deve ser uma string.' })
  cpf: string;

  @IsNotEmpty({ message: 'A data de nascimento não pode ser vazia.' })
  @IsDateString({}, { message: 'A data de nascimento deve estar no formato ISO (yyyy-mm-dd).' })
  birthDate: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
