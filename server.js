const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Simula una base de datos de productos
const productsDB = [];

// Rutas para el manejo de productos
const productsRouter = express.Router();
app.use('/api/products', productsRouter);

// Listar todos los productos
productsRouter.get('/', (req, res) => {
  // Puedes implementar aquí la lógica para limitar la cantidad de productos
  res.json(productsDB);
});

// Obtener un producto por ID
productsRouter.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  const product = productsDB.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(product);
});

// Agregar un nuevo producto
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
    id: Date.now().toString(), // Generar un ID único
    title,
    description,
    code,
    price,
    status: true, // Status es true por defecto
    stock,
    category,
    thumbnails,
  };

  productsDB.push(newProduct);
  res.status(201).json(newProduct);
});

// Actualizar un producto por ID
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
    id: productId, // Mantener el mismo ID
  };

  res.json(productsDB[productIndex]);
});

// Eliminar un producto por ID
productsRouter.delete('/:pid', (req, res) => {
  const productId = req.params.pid;
  const productIndex = productsDB.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  productsDB.splice(productIndex, 1);
  res.json({ message: 'Producto eliminado' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});