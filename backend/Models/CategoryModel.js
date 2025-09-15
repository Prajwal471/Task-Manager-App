const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#6c757d'
    },
    icon: {
        type: String,
        default: 'folder'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create unique index for user-category combination
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

const CategoryModel = mongoose.model('categories', CategorySchema);
module.exports = CategoryModel;