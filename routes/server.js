const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


const productsDB = [];

app.get('/', (req, res) => {
  res.render('home', { products: productsDB });
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products: productsDB });
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

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
  // Ruta para listar todos los productos
  // ...
});

productsRouter.get('/:pid', (req, res) => {
  // Ruta para obtener un producto por ID
  // ...
});

productsRouter.post('/', (req, res) => {
  // Ruta para agregar un nuevo producto
  // ...
});

productsRouter.put('/:pid', (req, res) => {
  // Ruta para actualizar un producto por ID
  // ...
});

productsRouter.delete('/:pid', (req, res) => {
  // Ruta para eliminar un producto por ID
  // ...
});

const cartsDB = [];

const cartsRouter = express.Router();
app.use('/api/carts', cartsRouter);

cartsRouter.post('/', (req, res) => {
  // Ruta para crear un nuevo carrito
  // ...
});

cartsRouter.get('/:cid', (req, res) => {
  // Ruta para listar productos en un carrito
  // ...
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
  // Ruta para agregar un producto a un carrito
  // ...
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});