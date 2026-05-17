import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import type { IUserDocument } from '../types/model.types';

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      match: [
        /^[a-zA-Z0-9]+$/,
        'Username must contain only letters and numbers'
      ]
    },
    avatar: {
      type: String
    },
    status: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
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
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (this.isNew) {
    const SALT = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, SALT);
    this.avatar = `https://robohash.org/${this.username}`;
    this.verificationToken = uuidv4().substring(0, 10).toUpperCase();
    this.verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  }
  next();
});

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
