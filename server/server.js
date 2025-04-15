const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017/extensionAnalytics"; // Change if using Atlas

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("✅ MongoDB connected");
}).catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stop the app if MongoDB connection fails
});

// ✅ Define Schema
const TrackingSchema = new mongoose.Schema({
    website: { type: String, required: true },
    time: { type: Number, required: true }
}, { timestamps: true });

const Tracking = mongoose.model("Tracking", TrackingSchema);

// ✅ GET all tracking data
app.get("/get-data", async (req, res) => {
    try {
        const data = await Tracking.aggregate([
            {
                $group: {
                    _id: "$website",
                    totalTime: { $sum: "$time" }
                }
            },
            { $sort: { totalTime: -1 } } // Sort by total time in descending order
        ]);

        const result = data.reduce((acc, item) => {
            acc[item._id] = item.totalTime;
            return acc;
        }, {});

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ POST tracking data
app.post("/save-data", async (req, res) => {
    try {
        const { website, time } = req.body;
        
        // Check if the data already exists for the website, and update it
        let existingData = await Tracking.findOne({ website });

        if (existingData) {
            // Update the existing entry
            existingData.time += time;
            await existingData.save();
        } else {
            // Create a new entry if it doesn't exist
            await Tracking.create({ website, time });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE all data
app.delete("/clear-data", async (req, res) => {
    try {
        await Tracking.deleteMany({});
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
