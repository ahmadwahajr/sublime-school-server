const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String
      // required: [true, "Please fill your name"],
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Please enter username"]
    },

    password: {
      type: String,
      required: [true, "Please fill your password"],
      minLength: 6,
      select: false
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

userSchema.pre("save", async function (next) {
  // check the password if it is modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
userSchema.methods.correctPassword = async function (
  typedPassword,
  originalPassword
) {
  return await bcrypt.compare(typedPassword, originalPassword);
};
//user's schema validation
const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required().min(8),
  name: Joi.string()
}).options({ allowUnknown: true });

const User = mongoose.model("User", userSchema);
module.exports = { User, schema };
