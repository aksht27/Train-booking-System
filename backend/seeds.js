// backend/seeds.js
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trainDB";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const trainSchema = new mongoose.Schema({ name:String, from:String, to:String, time:String });
    const Train = mongoose.model("Train", trainSchema);

    await Train.deleteMany({});
    const sampleTrains = [
      { name: "Shatabdi Express", from: "Delhi", to: "Agra", time: "08:00" },
      { name: "Intercity Express", from: "Delhi", to: "Jaipur", time: "09:30" },
      { name: "Ganga Sutlej", from: "Lucknow", to: "Varanasi", time: "06:30" },
      { name: "Coastal Link", from: "Mumbai", to: "Pune", time: "07:15" }
    ];
    await Train.insertMany(sampleTrains);
    console.log("✅ Seeded trains");
    mongoose.disconnect();
  })
  .catch(err => console.error(err));

