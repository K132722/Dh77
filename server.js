const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  "mailto:your@email.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];

app.get("/vapidPublicKey", (req, res) => {
  res.send(vapidKeys.publicKey);
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscribed successfully" });
});

app.post("/notify", async (req, res) => {
  const payload = JSON.stringify({
    title: "📚 تذكير بمحاضرتك!",
    body: req.body.message || "المحاضرة بدأت الآن"
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  }

  res.status(200).json({ message: "Notifications sent" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});