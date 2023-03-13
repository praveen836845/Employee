const mongoose = require('mongoose');
require('dotenv').config();
exports.connect = () => {mongoose
    .connect(process.env.MONGODB_URL, {useNewUrlParser: true,})
    .then(console.log('Database connected succesfully '))
    .catch((err) => {console.log('Database connection failed');});
};
