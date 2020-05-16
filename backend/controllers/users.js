const { isInteger, toNumber } = require("lodash");
const { User, validate, validateUpdate } = require("../models/user");
const { Record } = require("../models/record");
const {
  Roles,
  unauthorized,
  notFound,
  userAlreadyRegistered
} = require("../constants");

function read(req, res, next) {
  res.json(req.userModel);
}

async function list(req, res, next) {
  try {
    const { page = 1, rowsPerPage = 5 } = req.query;
    const where = { _id: { $ne: req.user._id }, role: { $lte: req.user.role } };

    if (!isInteger(toNumber(page)) || !isInteger(toNumber(rowsPerPage))) {
      return res.status(422).send("Page and rows per page must be integer.");
    }

    const users = await User.find(where)
      .skip((page - 1) * rowsPerPage)
      .limit(parseInt(rowsPerPage))
      .select("-password");
    const count = await User.countDocuments(where);

    res.json({ users, count });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(400)
        .send(get(error, "details.0.message", "Something went wrong."));

    let exist = await User.findOne({ email: req.body.email });
    if (exist)
      return res
        .status(userAlreadyRegistered.code)
        .send(userAlreadyRegistered.message);

    if (req.user.role === Roles.MANAGER && req.body.role === Roles.ADMIN) {
      return res.status(unauthorized.code).send(unauthorized.message);
    }

    const user = new User(req.body);
    const newUser = await user.save();
    res.json(newUser);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { error } = validateUpdate(req.body);
    if (error)
      return res
        .status(400)
        .send(get(error, "details.0.message", "Something went wrong."));

    let exist = await User.findOne({
      email: req.body.email,
      _id: { $ne: req.userModel._id }
    });
    if (exist)
      return res
        .status(userAlreadyRegistered.code)
        .send(userAlreadyRegistered.message);

    if (req.user.role === Roles.MANAGER && req.body.role === Roles.ADMIN) {
      return res.status(unauthorized.code).send(unauthorized.message);
    }

    Object.assign(req.userModel, req.body);

    const updatedUser = await req.userModel.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  await Record.remove({ user: req.userModel._id });
  await req.userModel.remove();
  res.json({ id: req.userModel._id });
}

async function getSpecificUser(req, res, next, id) {
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(notFound.code).send(notFound.message);
    }

    if (user.role > req.user.role) {
      return res.status(unauthorized.code).send(unauthorized.message);
    }

    req.userModel = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  update,
  read,
  list,
  remove,
  getSpecificUser
};
