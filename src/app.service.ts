import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private products: { id: number; name: string; price: number }[] = [];

  getAll() {
    return this.products;
  }
}
