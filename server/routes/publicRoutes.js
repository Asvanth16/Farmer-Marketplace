const express = require("express");

const router = express.Router();

const {
    getHomeStats,
} = require("../controllers/publicController");

router.get("/home-stats", getHomeStats);

module.exports = router;