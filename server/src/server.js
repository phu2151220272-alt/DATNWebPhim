const express = require('express');
const app = express();
const port = 3000;

const { connectDB } = require('./config');
const route = require('./routes/index.routes.js');
const sync = require('./models/sync');

const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

connectDB();
sync();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../src')));

route(app);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
