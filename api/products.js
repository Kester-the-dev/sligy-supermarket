const path = require('path');

const products = require(path.join(process.cwd(), 'server', 'data', 'products.json'));

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(products);
};
