const { Conflict } = require('http-errors');
const gravatar = require('gravatar');
const { v4: uuidv4 } = require('uuid');
const { Unauthorized } = require('http-errors');
const jwt = require('jsonwebtoken');

const { User } = require('../../models');
const { sendEmail } = require('../../helpers');
const { SECRET_KEY } = process.env;

class Auth {
  async register(req, res) {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict(`User with ${email} already exist`);
    }
    const verificationToken = uuidv4();
    const avatarURL = gravatar.url(email);
    const newUser = new User({ name, email, avatarURL, verificationToken });

    newUser.setPassword(password);

    await newUser.save();
    const mail = {
      to: email,
      subject: 'Подтверждения email',
      html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Подтвердить email</a>`,
    };
    await sendEmail(mail);
    res.status(201).json({
      status: 'success',
      code: 201,
      data: {
        user: {
          email,
          name,
          avatarURL,
          verificationToken,
        },
      },
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.verify || !user.comparePassword(password)) {
      throw new Unauthorized('Email or password is wrong');
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      status: 'success',
      code: 200,
      data: {
        token,
      },
    });
  }

  async logout(req, res) {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).json();
  }
}

module.exports = new Auth();
