const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");

const app = express();

// 🔹 MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// 🔹 DATA
const products = [
  {
    _id: 1,
    name: "Personalized Ornament",
    category: "Holiday Decor",
    price: "$15.00",
    material: "Wood and ribbon",
    occasion: "Christmas",
    description: "A custom ornament perfect for celebrating special holiday memories.",
    image: "/images/ornament.jpg"
  },
  {
    _id: 2,
    name: "Custom Wreath Sash",
    category: "Home Decor",
    price: "$20.00",
    material: "Fabric",
    occasion: "Seasonal",
    description: "A personalized wreath sash that adds charm to your front door décor.",
    image: "/images/zoomed-in-wreath-sash.jpg"
  },
  {
    _id: 3,
    name: "Monthly Milestone Set",
    category: "Baby Keepsakes",
    price: "$40.00",
    material: "Wood",
    occasion: "Baby Milestones",
    description: "A themed monthly milestone set to capture each month of baby’s first year.",
    image: "/images/starwars-milestone.jpg"
  },
  {
    _id: 4,
    name: "Acrylic Calendar",
    category: "Organization",
    price: "$100.00",
    material: "Acrylic",
    occasion: "Everyday Use",
    description: "A reusable acrylic calendar that keeps your schedule stylish and organized.",
    image: "/images/acrylic-calendar.jpg"
  },
  {
    _id: 5,
    name: "Wooden Nursery Sign",
    category: "Nursery Decor",
    price: "$85.00",
    material: "Wood",
    occasion: "Baby Shower",
    description: "A custom wooden sign that adds a warm and personal touch to any nursery.",
    image: "/images/wooden-nursery-sign.jpg"
  },
  {
    _id: 6,
    name: "Hand Stitched Sweater",
    category: "Apparel",
    price: "$50.00",
    material: "Cotton blend",
    occasion: "Gift Giving",
    description: "A cozy hand stitched sweater customized for a thoughtful and unique gift.",
    image: "/images/sweater.jpg"
  },
  {
    _id: 7,
    name: "Personalized Cutting Board",
    category: "Kitchen Decor",
    price: "$40.00",
    material: "Wood",
    occasion: "Wedding Gift",
    description: "A personalized cutting board that is both practical and beautiful for any kitchen.",
    image: "/images/cutting-boards.jpg"
  },
  {
    _id: 8,
    name: "First Day Milestone Board",
    category: "School Keepsakes",
    price: "$45.00",
    material: "Wood and vinyl",
    occasion: "Back to School",
    description: "A milestone board made to celebrate and remember each first day of school.",
    image: "/images/first-day.jpg"
  }
];

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

// 🔹 STATIC (IMPORTANT: must be BEFORE routes that use CSS)
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// 🔹 HOMEPAGE (USES YOUR styles.css)
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

            <p class="intro">
              Welcome to the Cina Designs & Events product API.
            </p>

            <div class="endpoint-block">
              <h2>Get All Products</h2>
              <p>View all available products:</p>
              <a href="/api/products">/api/products</a>
            </div>

            <div class="endpoint-block">
              <h2>Get One Product</h2>
              <p>Example request:</p>
              <a href="/api/products/1">/api/products/1</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 🔹 API ROUTES
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p._id === id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const newProduct = {
    _id: Date.now(),
    ...req.body
  };

  products.push(newProduct);
  res.status(200).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p._id === id);

  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p._id === id);

  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

// 🔹 404 (ALWAYS LAST)
app.use((req, res) => {
  res.status(404).send(`Custom 404: ${req.url}`);
});

// 🔹 SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});