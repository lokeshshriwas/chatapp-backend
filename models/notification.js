const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, ref:"User"},
    messageId :[{type : mongoose.Schema.Types.ObjectId, ref:"Message"}],
})

const Notification = mongoose.model("Notification", NotificationSchema)

module.exports = Notification