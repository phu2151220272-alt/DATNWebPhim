const User = require('./users.model');
const ApiKey = require('./apiKey.model');
const Otp = require('./otp.model');
const Category = require('./category.model');
const Movie = require('./movie.model');
const Seat = require('./seat.model');
const Payments = require('./payments.model');
const PreviewMovie = require('./previewMovie.model');
const MessageChatbot = require('./messageChatbot.model');

const sync = async () => {
    // Setup associations between models

    // Sync all models with the database
    await User.sync();
    await ApiKey.sync();
    await Otp.sync();
    await Category.sync();
    await Movie.sync();
    await Seat.sync();
    await Payments.sync();
    await PreviewMovie.sync();
    await MessageChatbot.sync();
};

module.exports = sync;
