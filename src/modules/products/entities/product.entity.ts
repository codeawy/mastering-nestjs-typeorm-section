import {
  AfterInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

/**
 * Product Entity - Demonstrates @ManyToOne and @ManyToMany relationships
 * Many Products belong to one Category (ManyToOne)
 * Many Products can have many Tags (ManyToMany)
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * ManyToOne relationship with Category
   * Many Products belong to one Category
   * This side owns the relationship (has the foreign key)
   */
  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL', // Set category to null if category is deleted
    eager: false, // Don't load category by default
  })
  category?: Category;

  @Column('uuid', { nullable: true })
  categoryId?: string;

  /**
   * ManyToMany relationship with Tag
   * This is the owner side (defines the junction table)
   * Many Products can have many Tags
   */
  @ManyToMany(() => Tag, (tag) => tag.products, {
    cascade: true, // Save tags when product is saved
    eager: false, // Don't load tags by default
  })
  @JoinTable({
    name: 'product_tags', // Junction table name
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags!: Tag[];
}
