import {
  IsDefined,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, Exclude } from 'class-transformer';
import { IsStrongPassword } from 'src/validators/is-strong-password.validator';

class ProductDetailsDto {
  @IsInt()
  width!: number;

  @IsInt()
  height!: number;
}

export class CreateProductDto {
  @Transform(({ value }: { value: string }) => value.trim().toLocaleUpperCase())
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  @Exclude()
  description!: string;

  @IsInt()
  price!: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  details!: ProductDetailsDto;
}
