const mongoose = require('mongoose');
const shema = mongoose.Schema;

const leaderSchema = new shema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
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

});
const Leaders = mongoose.model('leader', leaderSchema);
module.exports = Leaders;