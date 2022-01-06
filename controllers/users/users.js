const { User } = require('../../models');
const path = require('path');
const fs = require('fs/promises');
const { NotFound } = require('http-errors');

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
}

module.exports = new Users();
