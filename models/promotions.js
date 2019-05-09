const mongoose = require('mongoose');
const schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
const promoSchema = new schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        min: 0,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const Promotions = mongoose.model('promotion', promoSchema);
module.exports = Promotions;