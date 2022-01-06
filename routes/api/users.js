const express = require('express');

const { auth, ctrlWrapper, upload } = require('../../middlewares');
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

router.post('/verify', ctrlWrapper(ctrl.resending));

module.exports = router;
