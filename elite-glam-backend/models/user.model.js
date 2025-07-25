const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    profileImage: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'user', 'freelancer', 'admin'],
      default: 'customer'
    }
  },
  {
    timestamps: true
  }
);

// Method to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

 