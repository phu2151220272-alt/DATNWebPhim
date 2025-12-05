const usersRoutes = require('./users.routes');
const movieRoutes = require('./movie.routes');
const categoryRoutes = require('./category.routes');
const paymentsRoutes = require('./payments.routes');
const previewMovieRoutes = require('./previewMovie.routes');


function routes(app) {
    app.use('/api/users', usersRoutes);
    app.use('/api/movie', movieRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/payments', paymentsRoutes);
    app.use('/api/preview-movie', previewMovieRoutes);
}

module.exports = routes;
