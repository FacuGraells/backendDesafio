const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


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


server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
