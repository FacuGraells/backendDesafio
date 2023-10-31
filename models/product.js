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