const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../expressError");


/** login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  try {
    let {username, password} = req.body;
    if (await User.authenticate(username, password)) {
      let token = jwt.sign({username}, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({token});
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  }

  catch (err) {
    return next(err);
  }
});

/** register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  try {
    let {username} = await User.register(req.body);
    let token = jwt.sign({username}, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({token});
  }

  catch (err) {
    return next(err);
  }
});



module.exports = router;
routes/users.js
const Router = require("express").Router;
const User = require("../models/user");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");

const router = new Router();


/** get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    let users = await User.all();
    return res.json({users});
  }

  catch (err) {
    return next(err);
  }
});

/** get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    let user = await User.get(req.params.username);
    return res.json({user});
  }

  catch (err) {
    return next(err);
  }
});

/** get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  try {
    let messages = await User.messagesTo(req.params.username);
    return res.json({messages});
  }

  catch (err) {
    return next(err);
  }
});

/** get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  try {
    let messages = await User.messagesFrom(req.params.username);
    return res.json({messages});
  }

  catch (err) {
    return next(err);
  }
});



module.exports = router;