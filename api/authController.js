const User = require('./models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { succeedResponse } =  require('../response')
const {secret} = require('./config')


const generateAccessToken = (id) => {
    const payload = {id}
    return jwt.sign(payload, secret, {expiresIn:'24h'})
}

class authCotroller {

  //Register new user
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Registration error", errors });
      }

      const { login, email, password, firstname, lastname } = req.body;
      const candidate = await User.findOne({ login });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with this name already exists" });
      }
      const hashPassword = bcrypt.hashSync(password, 10);
      const user = new User({
        login,
        email,
        password: hashPassword,
        firstname,
        lastname,
      });
      await user.save();
      return res.json(
        succeedResponse("ok", { message: "User successfully created" })
      );
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Registration error" });
    }
  }

  //Checking user authorization
  async auth(req, res) {
    try {
      const { login, password } = req.body;
      const user = await User.findOne({ login });
      if (!user) {
        return res.status(400).json({ message: `User ${login} not found` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Incorrect password entered" });
      }
      const token = generateAccessToken(user._id);
      return res.json({ token });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Login error" });
    }
  }

  //Changing password
  async changePassword(req, res) {
    try {
      const user = await User.findOne({ _id: req.user?.id });
      const validPassword = bcrypt.compareSync(
        req.body.old_password,
        user?.password
      );
      if (!validPassword) {
        return res.status(400).json({ message: "Incorrect password entered" });
      }
      const hashPassword = bcrypt.hashSync(req.body.new_password, 10);
      user.password = hashPassword;
      await user.save();
      return res.json(succeedResponse("ok"));
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Password reset error" });
    }
  }

  //Get User data
  async getUser(req, res) {
    try {
      const token = req.headers.authorization;
      let decodedData;
      let authorizedUser;

      if (token) {
        decodedData = jwt.verify(token, secret);
        authorizedUser = await User.findOne({ _id: decodedData?.id });
      }

      const user = await User.findOne({ login: req.query.login });

      if (!user) {
        return res.status(404).json({ message: "User not found", status: 404 });
      } else if (user?.login === authorizedUser?.login) {
        return res.json(
          succeedResponse("ok", {
            login: user.login,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
          })
        );
      }
      return res.status(400).json(
        succeedResponse("ok", {
          login: user.login,
          firstname: user.firstname,
          lastname: user.lastname,
          email: obscureEmail(user.email),
        })
      );
    } catch (e) {}
  }
}


//Formatting Email
const obscureEmail = email => {
    const [name, domain] = email.split("@");
    return `*${name[1]}${new Array(name.length-2).join("*")}@*${domain[1]}${new Array(domain.length-2).join("*")}`;
};


module.exports = new authCotroller()