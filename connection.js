const mongoose = require("mongoose");

async function connectMongoDb(url){
return mongoose.connect(url, { useNewUrlParser: true });
}

module.exports = {
    connectMongoDb
}