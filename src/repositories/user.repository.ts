import User from '../models/user.model';
import type { IUserDocument } from '../types/model.types';
import crudRepository from './crud.repository';

const userRepository = {
  ...crudRepository(User),

  /**
   * Create and save a new user (triggers pre-save hooks).
   */
  async signUpUser(data: Partial<IUserDocument>): Promise<IUserDocument> {
    const newUser = new User(data);
    await newUser.save();
    return newUser;
  },

  /**
   * Find user by email address.
   */
  async getByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email });
  },

  /**
   * Find user by username (excludes password).
   */
  async getByUsername(username: string): Promise<IUserDocument | null> {
    return User.findOne({ username }).select('-password');
  },

  /**
   * Find user by verification token.
   */
  async getByToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({ verificationToken: token });
  }
};

export default userRepository;
