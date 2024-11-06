const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

/**
 * @title User Schema
 * @author Abhinav Pangaria
 * @notice Schema to define user information in the application
 * @dev This schema handles user registration and authentication
 */
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true, // Ensure email is unique across users,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false, // Exclude password from queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    },
  // This should be the last used wallet address used by that user
  walletAddress: {
    type: String,
    unique: true,
  },
});

/**
 * @notice Pre-save hook to hash the password before saving
 * @dev Uses bcrypt to hash passwords for security
 */
userSchema.pre("save", async function (next) {
  // Check if the password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(new Error("Error hashing password"));
  }
});

/**
 * @title User Model
 * @notice Mongoose model for user information
 * @dev This model is used to interact with the users collection in the database
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
