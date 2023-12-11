const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const User = require("../../model/User");

// @route    POST api/users
// @desc     Register user
// @access   Public
const { withDraw } = require("../../api/api");

router.post("/addTank", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // res.json(user);
    user.tankCount = user.tankCount + req.body.tank;
    await user.save();
    res.status(200).send("success");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/withdraw", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // res.json(user);
    if (user.earn > 0) {
      user.earn = 0;
      await user.save();
      await withDraw(user.solana_wallet);
      res.status(200).send("success");
      // console.log("withdraw", process.env.net);
    } else {
      res.status(400).json({ errors: [{ msg: "No Earning!" }] });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/removeTank", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // res.json(user);
    if (user.tankCount > 0) user.tankCount = user.tankCount - 1;
    await user.save();
    res.status(200).send("success");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/signup", async (req, res) => {
  console.log(req.body);
  const { name, team, wallet } = req.body;
  try {
    let user = await User.findOne({ solana_wallet: wallet });
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }
    user = new User({
      name: name,
      team: team,
      eth_wallet: "",
      solana_wallet: wallet,
      tankCount: "0",
      earn: 0,
    });

    await user.save();

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { wallet } = req.body;

  console.log(wallet);

  try {
    let user = await User.findOne({ solana_wallet: wallet });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
