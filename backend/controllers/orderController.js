import Order from '../models/orderModel.js';

// @desc     Create new order
// @method   POST
// @endpoint /api/v1/orders
// @access   Private
const addOrderItems = async (req, res, next) => {
  try {
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;
    console.log(
      cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    );
    if (!cartItems || cartItems.length === 0) {
      res.statusCode = 400;
      throw new Error('No order items.');
    }

    const order = new Order({
      user: req.user._id,
      orderItems: cartItems.map(item => ({
        ...item,
        product: item._id
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Get logged-in user orders
// @method   GET
// @endpoint /api/v1/orders/my-orders
// @access   Private
const getMyOrders = async (req, res, next) => {
  try {
    // Verify user authentication
    if (!req.user) {
      console.error('getMyOrders: No user in request');
      return res.status(401).json({ message: 'User authentication failed - No user in request' });
    }
    
    if (!req.user._id) {
      console.error('getMyOrders: User object missing _id', { user: req.user });
      return res.status(401).json({ message: 'User authentication failed - Invalid user object' });
    }
    
    // Log request details
    console.log(`Finding orders for user: ${req.user._id}, name: ${req.user.name || 'Unknown'}`);
    console.log(`Auth method: ${req.headers['x-clerk-auth'] ? 'Clerk' : 'Legacy JWT'}`);
    
    // Fetch orders
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .exec();
    
    console.log(`Found ${orders.length} orders for user ${req.user._id}`);
    
    // Return orders (empty array if none found)
    return res.status(200).json(orders || []);
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    
    // Provide more detailed error response
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
  }
};

// @desc     Get order by ID
// @method   GET
// @endpoint /api/v1/orders/:id
// @access   Private
const getOrderById = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc     Update order to paid
// @method   PUT
// @endpoint /api/v1/orders/:id/pay
// @access   Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    // Handle payment method specific updates
    if (order.paymentMethod === 'Stripe') {
      // For Stripe payments from online
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.details.id,
        status: req.body.details.status,
        update_time: req.body.details.update_time,
        email_address: req.body.details.payer?.email_address || ''
      };
    } else if (order.paymentMethod === 'COD') {
      // For COD payment - can be called manually when delivered
      // or automatically when admin marks as delivered
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.details?.id || `COD_${Date.now()}`,
        status: req.body.details?.status || 'Cash on Delivery - Completed',
        update_time: req.body.details?.update_time || new Date().toISOString(),
        email_address: req.body.details?.payer?.email_address || ''
      };
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Update order to delivered
// @method   PUT
// @endpoint /api/v1/orders/:id/deliver
// @access   Private/Admin
const updateOrderToDeliver = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    
    // For COD orders, mark as paid when delivered
    if (order.paymentMethod === 'COD' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: `COD_${Date.now()}`,
        status: 'Cash on Delivery',
        update_time: new Date().toISOString(),
        email_address: ''
      };
    }

    const updatedDeliver = await order.save();

    res.status(200).json(updatedDeliver);
  } catch (error) {
    next(error);
  }
};

// @desc     Get all orders
// @method   GET
// @endpoint /api/v1/orders
// @access   Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'id name');

    if (!orders || orders.length === 0) {
      res.statusCode = 404;
      throw new Error('Orders not found!');
    }
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDeliver,
  getOrders
};
