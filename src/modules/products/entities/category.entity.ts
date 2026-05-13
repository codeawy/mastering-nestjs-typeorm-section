import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * Category Entity - Demonstrates @OneToMany relationship
 * One Category has many Products
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  @Index()
  name!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ nullable: true })
  slug?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * OneToMany relationship with Product
   * This side doesn't own the relationship (Product has the foreign key)
   * The first parameter is a function that returns the related entity
   * The second parameter is the property on the related entity that references this entity
   */
  @OneToMany(() => Product, (product) => product.category, {
    cascade: true, // Delete products when category is deleted
    eager: false, // Don't load products by default
  })
  products!: Product[];
}
