const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;


app.use(bodyParser.json());


const productsDB = [];


const productsRouter = express.Router();
app.use('/api/products', productsRouter);


productsRouter.get('/', (req, res) => {
  
  res.json(productsDB);
});


productsRouter.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  const product = productsDB.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(product);
});


productsRouter.post('/', (req, res) => {
  const {
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails,
  } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const newProduct = {
    id: Date.now().toString(), 
    title,
    description,
    code,
    price,
    status: true, 
    stock,
    category,
    thumbnails,
  };

  productsDB.push(newProduct);
  res.status(201).json(newProduct);
});


productsRouter.put('/:pid', (req, res) => {
  const productId = req.params.pid;
  const updatedProductData = req.body;

  const productIndex = productsDB.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  productsDB[productIndex] = {
    ...productsDB[productIndex],
    ...updatedProductData,
    id: productId, 
  };

  res.json(productsDB[productIndex]);
});


productsRouter.delete('/:pid', (req, res) => {
  const productId = req.params.pid;
  const productIndex = productsDB.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  productsDB.splice(productIndex, 1);
  res.json({ message: 'Producto eliminado' });
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});



const fs = require('fs');




const cartsDB = [];


const cartsRouter = express.Router();
app.use('/api/carts', cartsRouter);


cartsRouter.post('/', (req, res) => {
  const newCart = {
    id: Date.now().toString(), 
    products: [],
  };

  cartsDB.push(newCart);
  res.status(201).json(newCart);
});


cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const cart = cartsDB.find((c) => c.id === cartId);
  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }
  res.json(cart.products);
});


cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = parseInt(req.body.quantity);

  const cart = cartsDB.find((c) => c.id === cartId);
  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

 
  const existingProduct = cart.products.find((product) => product.product === productId);

  if (existingProduct) {
    
    existingProduct.quantity += quantity;
  } else {
    
    cart.products.push({
      product: productId,
      quantity,
    });
  }

 
  fs.writeFileSync('carts.json', JSON.stringify(cartsDB, null, 2), 'utf-8');

  res.status(201).json(cart);
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

//comentario