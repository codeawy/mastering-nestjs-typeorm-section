import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * Tag Entity - Demonstrates @ManyToMany relationship
 * Many Tags can be associated with many Products
 * This is the inverse side of the relationship (Product owns it)
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50 })
  @Index()
  name!: string;

  @Column({ length: 200, nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * ManyToMany relationship with Product (inverse side)
   * This side doesn't own the relationship
   * Product is the owner and defines the junction table
   */
  @ManyToMany(() => Product, (product) => product.tags, {
    eager: false,
  })
  products!: Product[];
}
