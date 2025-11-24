const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  code: String,
  price: Number,
  image: String,
  stock: Number
});

productSchema.statics.getAll = async function() {
  let products = await this.find();
  if (products.length === 0) {
    products = await this.insertMany([
      { name: "醫敏家敏立適", code: "MA-001", price: 2800, image: "https://via.placeholder.com/300?text=敏立適", stock: 999 },
      { name: "醫敏家敏立適Plus", code: "MA-002", price: 3800, image: "https://via.placeholder.com/300?text=敏立適+", stock: 999 }
    ]);
  }
  return products;
};

module.exports = mongoose.model('Product', productSchema);