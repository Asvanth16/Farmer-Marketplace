const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Automatically hides password from API query results for security
    },
    role: {
        type: String,
        enum: ['customer', 'farmer', 'admin'],
        default: 'customer'
    },
    // Farmer-Specific Fields (Only required if role is 'farmer')
    farmDetails: {
        location: {
            type: String,
            required: function () { return this.role === 'farmer'; }
        },
        farmingMethod: {
            type: String,
            enum: ['organic', 'conventional'],
            required: function () { return this.role === 'farmer'; }
        },
        cropTypes: [{
            type: String
        }],
        isVerified: {
            type: Boolean,
            default: false // Requires Admin manual approval later
        }

    },
    address: {
        fullName: String,
        phone: String,
        addressLine1: String,
        city: String,
        state: String,
        pincode: String
    },
    status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
}
}, { timestamps: true }); // Automatically creates createdAt and updatedAt fields

// Pre-save hook: Hashes the password automatically before it reaches MongoDB Atlas
userSchema.pre('save', async function () {
    // Only hash the password if it's new or being modified
    if (!this.isModified('password')) {
        return; // Return early to let Mongoose proceed
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error; // Throwing the error inside an async hook stops execution perfectly
    }
});

// Helper Method: Compares plain-text login password with the database's hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);