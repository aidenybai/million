const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },

  // otp : {
  //   type : String
  // },
  isAdmin : {
    type : String,
    default: false
  },

  resetPasswordToken : {
    type : String
  },



});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};


userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');


    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
module.exports = mongoose.model("Users", userSchema);
