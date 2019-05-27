const mongoose = require("mongoose");

const DogSchema = new mongoose.Schema(
    {
        image: {
            type: String
        },
        breed: {
            type: [String]
        },
        probability: {
            type: Array
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = Dog = mongoose.model("dogs", DogSchema);
