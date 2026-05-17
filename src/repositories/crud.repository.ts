import type { Document, FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

/**
 * Generic CRUD repository providing base database operations.
 * Domain-specific repositories extend this with custom methods.
 */
export interface ICrudRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  getAll(): Promise<T[]>;
  getById(id: string | Types.ObjectId): Promise<T | null>;
  update(
    id: string | Types.ObjectId,
    data: UpdateQuery<T>
  ): Promise<T | null>;
  delete(id: string | Types.ObjectId): Promise<T | null>;
  deleteMany(ids: (string | Types.ObjectId)[]): Promise<{ deletedCount?: number }>;
}

/**
 * Factory function that creates a base CRUD repository for any Mongoose model.
 */
export default function crudRepository<T extends Document>(
  model: Model<T>
): ICrudRepository<T> {
  return {
    async create(data: Partial<T>): Promise<T> {
      return model.create(data as FilterQuery<T>);
    },

    async getAll(): Promise<T[]> {
      return model.find();
    },

    async getById(id: string | Types.ObjectId): Promise<T | null> {
      return model.findById(id);
    },

    async update(
      id: string | Types.ObjectId,
      data: UpdateQuery<T>
    ): Promise<T | null> {
      return model.findByIdAndUpdate(id, data, { new: true });
    },

    async delete(id: string | Types.ObjectId): Promise<T | null> {
      return model.findByIdAndDelete(id);
    },

    async deleteMany(
      ids: (string | Types.ObjectId)[]
    ): Promise<{ deletedCount?: number }> {
      return model.deleteMany({ _id: { $in: ids } } as FilterQuery<T>);
    }
  };
}
