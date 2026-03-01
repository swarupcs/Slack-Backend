import User, { IUserDocument } from '../schema/user';
import crudRepository, { ICrudRepository } from './crudRepository';

// ─── Extended Interface ───────────────────────────────────────────────────────

interface IUserRepository extends ICrudRepository<IUserDocument> {
  signUpUser: (data: Partial<IUserDocument>) => Promise<IUserDocument>;
  getByEmail: (email: string) => Promise<IUserDocument | null>;
  getByUsername: (username: string) => Promise<IUserDocument | null>;
  getByToken: (token: string) => Promise<IUserDocument | null>;
}

// ─── Repository ───────────────────────────────────────────────────────────────

const userRepository: IUserRepository = {
  ...crudRepository<IUserDocument>(User),

  /**
   * Creates a new user via `new User().save()` to trigger pre-save hooks
   * (password hashing, avatar generation, verification token creation).
   */
  signUpUser: async (data: Partial<IUserDocument>): Promise<IUserDocument> => {
    const user = new User(data);
    await user.save();
    return user;
  },

  getByEmail: (email: string): Promise<IUserDocument | null> =>
    User.findOne({ email: email.toLowerCase() }),

  /** Excludes password from the result. */
  getByUsername: (username: string): Promise<IUserDocument | null> =>
    User.findOne({ username }).select('-password'),

  getByToken: (token: string): Promise<IUserDocument | null> =>
    User.findOne({ verificationToken: token })
};

export default userRepository;
