import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

/**
 * Generic CRUD repository factory.
 * Returns a typed set of common database operations for any Mongoose model.
 * Services layer should call these methods; never call the model directly.
 */
export interface ICrudRepository<T extends Document> {
  create: (data: Partial<T>) => Promise<T>;
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | null>;
  delete: (id: string) => Promise<T | null>;
  update: (id: string, data: UpdateQuery<T>) => Promise<T | null>;
  deleteMany: (ids: string[]) => Promise<{ deletedCount?: number }>;
}

export default function crudRepository<T extends Document>(
  model: Model<T>
): ICrudRepository<T> {
  return {
    create: (data: Partial<T>): Promise<T> => model.create(data),

    getAll: (): Promise<T[]> => model.find(),

    getById: (id: string): Promise<T | null> => model.findById(id),

    delete: (id: string): Promise<T | null> =>
      model.findByIdAndDelete(id),

    update: (id: string, data: UpdateQuery<T>): Promise<T | null> =>
      model.findByIdAndUpdate(id, data, { new: true }),

    deleteMany: (
      ids: string[]
    ): Promise<{ deletedCount?: number }> =>
      model.deleteMany({ _id: { $in: ids } } as FilterQuery<T>)
  };
}
