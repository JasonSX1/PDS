export class CreateAddressDto {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
}

export class CreateSellerDto {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string; // ISO format
  address: CreateAddressDto;
}
