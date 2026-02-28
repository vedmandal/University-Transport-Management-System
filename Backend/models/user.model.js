import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },

    provider: {
        type: String,
        enum: ["local", "google", "microsoft"],
        default: "local"
    },

    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        },
        select: false
    },

    role: {
        type: String,
        required: true,
        enum: ["student", "driver", "admin", "parent"]
    },

    // Only for students
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus"
    },

    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

export default mongoose.model("User", UserSchema)