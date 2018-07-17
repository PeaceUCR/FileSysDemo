/**
 * Created by hea on 7/12/18.
 */

const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    name: {type: String},
    displayName: {type: String},
    mimeType: {type: String},
    timeCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);