import bcrypt from 'bcrypt';
import mongoose, { Document, Model, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUserDocument extends Document {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Email must be at least 3 characters'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username must contain only letters, numbers, or underscores'
      ]
    },
    avatar: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationTokenExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    // Never expose password in JSON responses
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ verificationToken: 1 }, { sparse: true });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
userSchema.pre<IUserDocument>('save', function (next) {
  if (this.isNew) {
    const SALT_ROUNDS = 10;
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    this.password = bcrypt.hashSync(this.password, salt);

    // Auto-generated avatar via Robohash
    this.avatar = `https://robohash.org/${this.username}`;

    // Email verification token (10 chars, uppercase)
    this.verificationToken = uuidv4().substring(0, 10).toUpperCase();
    this.verificationTokenExpiry = new Date(Date.now() + 3_600_000); // 1 hour
  }
  next();
});

// ─── Model ────────────────────────────────────────────────────────────────────

const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  'User',
  userSchema
);

export default User;
