const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// 🔹 CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// 🔹 MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// 🔹 MONGOOSE SCHEMA (REPLACES ARRAY)
const productSchemaMongo = new mongoose.Schema({
  name: String,
  price: String,
  category: String,
  material: String,
  occasion: String,
  description: String,
  image: String
});

const Product = mongoose.model("Product", productSchemaMongo);

// 🔹 JOI VALIDATION
const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  price: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  category: Joi.string().allow(""),
  material: Joi.string().allow(""),
  occasion: Joi.string().allow(""),
  description: Joi.string().min(5).required(),
  image: Joi.string().allow("")
});

// 🔹 STATIC FILES
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// 🔹 HOMEPAGE
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Cina Designs API</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="page">
          <div class="card">
            <h1>Cina Designs API</h1>
            <p class="intro">MongoDB version running ✔</p>
            <a href="/api/products">View Products</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 🔹 GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// 🔹 GET ONE PRODUCT
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// 🔹 CREATE PRODUCT
app.post("/api/products", async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const newProduct = new Product(req.body);
  await newProduct.save();

  res.json(newProduct);
});

// 🔹 UPDATE PRODUCT
app.put("/api/products/:id", async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) return res.status(404).json({ error: "Product not found" });

  res.json(updated);
});

// 🔹 DELETE PRODUCT
app.delete("/api/products/:id", async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) return res.status(404).json({ error: "Product not found" });

  res.json(deleted);
});

// 🔹 404
app.use((req, res) => {
  res.status(404).send(`Custom 404: ${req.url}`);
});

// 🔹 SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});