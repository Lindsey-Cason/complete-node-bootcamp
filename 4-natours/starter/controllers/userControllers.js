const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
exports.getUserByID = factory.getOne(User);
exports.deleteUserByID = factory.deleteOne(User);
exports.updateUserByID = factory.updateOne(User);

exports.createUser = async (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not defined. Please use /signup instead.',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This is not the route to update passwords. Please use /updateMyPassword.`,
        400
      )
    );
  }
  //filter out unwanted field names that are not allowed to be updated. aka role and pw
  const filteredBody = filteredObj(req.body, 'name', 'email');
  //update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log('USERID', req.user.id);
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Successfully Deleted',
    data: null,
  });
});
