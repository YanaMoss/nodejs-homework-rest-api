const { User } = require('../../models');
const path = require('path');
const fs = require('fs/promises');
const { NotFound } = require('http-errors');
const createError = require('http-errors');
const sendEmail = require('../../helpers/sendEmail');

const avatarsDir = path.join(__dirname, '../../', 'public', 'avatars');

class Users {
  async getCurrent(req, res) {
    const { name, email } = req.user;
    res.json({
      status: 'success',
      code: 200,
      data: {
        user: {
          name,
          email,
        },
      },
    });
  }

  async updateAvatar(req, res) {
    const { path: tmpUpload, originalname } = req.file;
    const { _id: id } = req.user;
    const imageName = `${id}_${originalname}`;
    try {
      const resultUpload = path.join(avatarsDir, imageName);
      await fs.rename(tmpUpload, resultUpload);
      const avatarURL = path.join('public', 'avatars', imageName);
      await User.findByIdAndUpdate(req.user._id, { avatarURL });
      res.json({ avatarURL });
    } catch (error) {
      await fs.unlink(tmpUpload);
      throw error;
    }
  }

  async verifyEmail(req, res) {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw NotFound();
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.json({
      message: 'Verify success',
    });
  }

  async resending(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!email) {
      throw createError(400, 'missing required field email');
    }
    if (user.verify) {
      throw createError(400, 'Verification has already been passed');
    }
    const verificationToken = user.verificationToken;
    const mail = {
      to: email,
      subject: 'Подтверждения email',
      html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Подтвердить email</a>`,
    };
    await sendEmail(mail);
    res.json('Email resending');
  }
}

module.exports = new Users();
