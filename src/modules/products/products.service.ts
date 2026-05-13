import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      select: ['id', 'title', 'price'],
      order: { createdAt: 'DESC' }, // * DESC => newest to oldest
    });
  }

  async findOne(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      select: ['id', 'title', 'price'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string): Promise<{ status: string; message: string }> {
    // * find the product to remove
    const productToRemove = await this.productRepository.findOne({
      where: { id },
    });

    if (!productToRemove) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // * remove the product
    await this.productRepository.remove(productToRemove);
    return {
      status: 'success',
      message: `Product with id ${id} has been removed`,
    };
  }
}
