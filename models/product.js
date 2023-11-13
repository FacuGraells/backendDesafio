const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    
   });
   
   const cartSchema = new mongoose.Schema({
    products: [productSchema],
    
   });
   
   const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    
   });
   
   const Product = mongoose.model('Product', productSchema);
   const Cart = mongoose.model('Cart', cartSchema);
   const Message = mongoose.model('Message', messageSchema);

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
   //....

// const API_URL = "https://api.example.com/products";

// const fetchProducts = async (params) => {
// const { limit, page, sort, query } = params;

//  let url = new URL(API_URL);

//  if (limit) url.searchParams.append("limit", limit);
//  if (page) url.searchParams.append("page", page);
//  if (sort) url.searchParams.append("sort", sort);
//  if (query) url.searchParams.append("query", query);

//  const response = await fetch(url);

//  if (!response.ok) {
//     throw new Error(`HTTP error: ${response.status}`);
//  }

//  const products = await response.json();

//  return products;
// };

// const getProducts = async (req, res) => {
//  try {
//     const products = await fetchProducts(req.query);
//     res.status(200).json(products);
//  } catch (error) {
//     res.status(500).json({ error: error.message });
//  }
// };

// const getPagedProducts = (page = 1, pageSize = 10) => {
//     const startIndex = (page - 1) * pageSize;
//     const endIndex = startIndex + pageSize;
//     const pagedProducts = products.slice(startIndex, endIndex);
   
//     return {
//        status: 'success',
//        payload: pagedProducts,
//        totalPages: Math.ceil(products.length / pageSize),
//        prevPage: page > 1 ? page - 1 : null,
//        nextPage: page < Math.ceil(products.length / pageSize) ? page + 1 : null,
//        page: page,
//        hasPrevPage: page > 1,
//        hasNextPage: page < Math.ceil(products.length / pageSize),
//        prevLink: page > 1 ? `http://localhost:${port}/products?page=${page - 1}&pageSize=${pageSize}` : null,
//        nextLink: page < Math.ceil(products.length / pageSize) ? `http://localhost:${port}/products?page=${page + 1}&pageSize=${pageSize}` : null
//     };
//    };
   
//    app.get('/products', (req, res) => {
//     const { page, pageSize } = req.query;
//     const result = getPagedProducts(parseInt(page), parseInt(pageSize));
//     res.json(result);
//    });
   
//    app.listen(port, () => {
//     console.log(`Servidor corriendo en el puerto ${port}`);
//    });



   
   
   