const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

// Настройка CORS с несколькими доменами
const allowedOrigins = [
  "https://scroogecasino.vercel.app",
  "https://casino-slot-star-wars-game.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Разрешаем запросы без origin (например, мобильные приложения)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Подключение к MongoDB
const uri =
  "mongodb://gen_user:%3C6Ua%5C%5C6%26cg%3C%2BYl@195.58.37.73:27017/default_db?authSource=admin&directConnection=true";
let db;

MongoClient.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) {
      console.error("Failed to connect to MongoDB:", err);
      return;
    }
    console.log("Connected to MongoDB");
    db = client.db("default_db"); // Укажите имя вашей базы данных

    // Маршруты для баланса
    app.post("/api/update-balance", async (req, res) => {
      const { entries } = req.body;

      try {
        const updatedEntries = [];

        for (const entry of entries) {
          const { userId, balance } = entry;
          const userBalance = await db
            .collection("userBalances")
            .findOne({ userId });

          if (!userBalance) {
            await db.collection("userBalances").insertOne({ userId, balance });
          } else {
            await db
              .collection("userBalances")
              .updateOne({ userId }, { $set: { balance } });
          }

          updatedEntries.push({ userId, balance });
        }

        res.status(200).json({ success: true, updatedEntries });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.get("/api/get-balances", async (req, res) => {
      try {
        const balances = await db.collection("userBalances").find().toArray();
        res.status(200).json({ success: true, balances });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.get("/api/get-balance/:userId", async (req, res) => {
      const { userId } = req.params;

      try {
        const userBalance = await db
          .collection("userBalances")
          .findOne({ userId });

        if (!userBalance) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, balance: userBalance.balance });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
);
