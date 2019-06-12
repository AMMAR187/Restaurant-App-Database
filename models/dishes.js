const mongose = require('mongoose');
require('mongoose-currency').loadType(mongose);
const Currency = mongose.Types.Currency;
const schema = mongose.Schema;

const commentSchema = new schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true

    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
const dishSchema = new schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    lebel: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

var Dishes = mongose.model('Dish', dishSchema);
module.exports = Dishes;