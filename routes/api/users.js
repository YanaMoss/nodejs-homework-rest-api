const express = require('express');

const { auth, ctrlWrapper, upload, validation } = require('../../middlewares');
const { joiResendingSchema } = require('../../models');
const { Users: ctrl } = require('../../controllers');

const router = express.Router();

router.get('/current', auth, ctrlWrapper(ctrl.getCurrent));
router.patch(
  '/avatar',
  auth,
  upload.single('avatar'),
  ctrlWrapper(ctrl.updateAvatar),
);

router.get('/verify/:verificationToken', ctrlWrapper(ctrl.verifyEmail));

module.exports = router;
