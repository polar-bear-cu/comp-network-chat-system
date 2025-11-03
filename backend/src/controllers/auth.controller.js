import { socketServer } from "../lib/socket.js";
import { generateToken } from "../lib/utils.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

export async function signup(req, res) {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      socketServer.emit("newUser", {
        _id: newUser._id,
        username: newUser.username,
      });

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Username not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Username and password do not match" });
    }

    generateToken(user._id, res);

    socketServer.emit("userLoggedIn", {
      _id: user._id,
      username: user.username,
    });

    res.status(200).json({
      _id: user._id,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function logout(req, res) {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Log out successfully" });
}
