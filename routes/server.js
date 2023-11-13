const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const mongoose = require('mongoose');
const ejs = require('ejs');


const app = express();
const PORT = 8080;
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost/tu_base_de_datos', { useNewUrlParser: true, useUnifiedTopology: true });
const dbb = mongoose.connection;


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'contraseña',
  database: 'base de datos'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado a la base de datos');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



const productsDB = [];


app.get('/', (req, res) => {
  res.render('index', { products: productsDB });
});


app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products: productsDB });
});


io.on('connection', (socket) => {
  console.log('Cliente conectado');

  
  socket.on('addProduct', (newProduct) => {
    productsDB.push(newProduct);
    io.emit('productAdded', newProduct); 
  });

  
  socket.on('deleteProduct', (productId) => {
    const index = productsDB.findIndex((product) => product.id === productId);
    if (index !== -1) {
      productsDB.splice(index, 1);
      io.emit('productDeleted', productId); 
    }
  });
});



// Rutas de Express...

const productsRouter = express.Router();
app.use('/api/products', productsRouter);

productsRouter.get('/', (req, res) => {
  
 res.json(productsDB);
});

productsRouter.get('/:pid', (req, res) => {
 const product = productsDB.find(p => p.id === parseInt(req.params.pid));
 if (!product) return res.status(404).send('El producto con este ID no se encontro.');
 res.send(product);
});

app.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort || 'asc';
  const query = req.query.query || '';

  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM productos WHERE categoria LIKE '%${query}%' OR disponibilidad LIKE '%${query}%'`;

  if (sort === 'asc' || sort === 'desc') {
    sql += ` ORDER BY precio ${sort.toUpperCase()}`;
  }

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        error: err.message
      });
    }

    const totalPages = Math.ceil(result.length / limit);
    const products = result.slice(offset, offset + limit);

    const response = {
      status: 'success',
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/products?page=${page - 1}&limit=${limit}&sort=${sort}&query=${query}` : null,
      nextLink: page < totalPages ? `/products?page=${page + 1}&limit=${limit}&sort=${sort}&query=${query}` : null
    };

    res.json(response);
  });
});

productsRouter.post('/', (req, res) => {
 const product = {
    id: productsDB.length + 1,
    name: req.body.name,
    price: req.body.price
 };
 productsDB.push(product);
 res.status(201).send(product);
});

productsRouter.put('/:pid', (req, res) => {
 const product = productsDB.find(p => p.id === parseInt(req.params.pid));
 if (!product) return res.status(404).send('El producto con este ID no se encontro.');

 if (req.body.name) product.name = req.body.name;
 if (req.body.price) product.price = req.body.price;

 res.send(product);
});

productsRouter.delete('/:pid', (req, res) => {
 const product = productsDB.find(p => p.id === parseInt(req.params.pid));
 if (!product) return res.status(404).send('El producto con este ID no se encontro.');

 const index = productsDB.indexOf(product);
 productsDB.splice(index, 1);

 res.send(product);
});


const cartsDB = [];

cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cart = cartsDB.find(c => c.id === parseInt(req.params.cid));
  if (!cart) return res.status(404).send('El carrito con este ID no se encontro.');
 
  const product = productsDB.find(p => p.id === parseInt(req.params.pid));
  if (!product) return res.status(404).send('El producto con este ID no se encontro.');
 
  const cartItem = cart.items.find(item => item.product.id === product.id);
  if (cartItem) {
     cartItem.quantity += 1;
  } else {
     cart.items.push({ product, quantity: 1 });
  }
 
  res.send(cart);
 });
 
 cartsRouter.delete('/:cid/product/:pid', (req, res) => {
  const cart = cartsDB.find(c => c.id === parseInt(req.params.cid));
  if (!cart) return res.status(404).send('El carrito con este ID no se encontro.');
 
  const product = productsDB.find(p => p.id === parseInt(req.params.pid));
  if (!product) return res.status(404).send('El producto con este ID no se encontro.');
 
  const cartItem = cart.items.find(item => item.product.id === product.id);
  if (cartItem) {
     cart.items = cart.items.filter(item => item.product.id !== product.id);
  }
 
  res.send(cart);
 });
 
 cartsRouter.put('/:cid/product/:pid', (req, res) => {
  const cart = cartsDB.find(c => c.id === parseInt(req.params.cid));
  if (!cart) return res.status(404).send('El carrito con este ID no se encontro.');
 
  const product = productsDB.find(p => p.id === parseInt(req.params.pid));
  if (!product) return res.status(404).send('El producto con este ID no se encontro.');

  const cartItem = cart.items.find(item => item.product.id === product.id);
 if (cartItem) {
     cartItem.quantity = req.body.quantity;
 } else {
     return res.status(404).send('El producto no esta en el carrito.');
 }
 
 res.send(cart);
});



dbb.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
dbb.once('open', function () {
  console.log('Conectado a la base de datos');
});


const productSchema = new mongoose.Schema({
  
  nombre: String,
  precio: Number,
  
});


const Product = mongoose.model('Product', productSchema);


const cartSchema = new mongoose.Schema({
 
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }]
});


const Cart = mongoose.model('Cart', cartSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.delete('/api/carts/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $pull: { products: { product: req.params.pid } } },
      { new: true }
    ).populate('products.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { products: req.body },
      { new: true }
    ).populate('products.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/carts/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { _id: req.params.cid, 'products.product': req.params.pid },
      { $set: { 'products.$.quantity': req.body.quantity } },
      { new: true }
    ).populate('products.product');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $set: { products: [] } },
      { new: true }
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.use('/products', productRoutes); 
app.use('/carts', cartRoutes); 


app.get('/products', async (req, res) => {
  try {
    
    const products = await Product.find().limit(10).skip((req.query.page - 1) * 10);

    
    res.render('products', { products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/carts/:cid', async (req, res) => {
  try {
    
    const cart = await Cart.findById(req.params.cid).populate('products.product');

    
    res.render('cart', { cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

























