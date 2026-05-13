import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserProfile } from './user-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 255 })
  @Index() // Index for fast lookups
  email!: string;

  @Column({ select: false }) // Never included in SELECT by default
  password!: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user', 'moderator'],
    default: 'user',
  })
  role!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn() // Enables soft deletes
  deletedAt?: Date;

  /**
   * OneToOne relationship with UserProfile
   * This is the inverse side (UserProfile owns the relationship)
   */
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    eager: false, // Don't load profile by default
  })
  profile?: UserProfile;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
