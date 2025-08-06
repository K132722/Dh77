const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✳️ ضع هنا مفاتيح VAPID التي أنشأتها
const vapidKeys = {
  publicKey: "ضع_المفتاح_العام_هنا",
  privateKey: "ضع_المفتاح_الخاص_هنا"
};

webpush.setVapidDetails(
  "mailto:you@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// لتخزين الاشتراكات المؤقتة في الذاكرة
let subscriptions = [];

// مسار لإرسال المفتاح العام للتطبيق الأمامي
app.get("/vapidPublicKey", (req, res) => {
  res.send(vapidKeys.publicKey);
});

// اشتراك المستخدم الجديد
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "✅ تم الاشتراك بنجاح" });
});

// إرسال إشعار لكل المشتركين
app.post("/notify", async (req, res) => {
  const payload = JSON.stringify({
    title: "📢 إشعار محاضرة",
    body: req.body.message || "بدأت المحاضرة الآن!"
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("❌ فشل إرسال إشعار:", err);
    }
  }

  res.status(200).json({ message: "🚀 تم إرسال الإشعارات" });
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});