# AI-Driven Ecommerce Platform API

This repository contains the backend server for an AI-driven ecommerce platform built with Express.js, TypeScript, and MongoDB. The server provides RESTful APIs for managing users, products, categories, carts, orders, and more, with AI-enhanced features for personalization.

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [User API](#user-api)
  - [Product API](#product-api)
  - [Category API](#category-api)
  - [SubCategory API](#subcategory-api)
  - [Cart API](#cart-api)
  - [Address API](#address-api)
  - [Order API](#order-api)
  - [Inventory API](#inventory-api)
  - [User Preference API](#user-preference-api)
  - [Product Performance API](#product-performance-api)
  - [Product Analysis API](#product-analysis-api)
  - [AI Assistant API](#ai-assistant-api)
  - [Inventory Assistant API](#inventory-assistant-api)
  - [File Upload API](#file-upload-api)
- [AI Features](#ai-features)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Contributions](#contributions)
- [License](#license)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create a `.env` file):
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/ai_ecommerce
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ADMIN_EMAIL=admin@yourdomain.com
   RESEND_API_KEY=your_resend_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Many endpoints require authentication and some require admin privileges.

To authenticate:
1. Register or login to receive an access token
2. Include the token in the Authorization header for subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

## API Endpoints

### User API

#### Register User
- **URL**: `/api/v1/users/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "data": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "error": false,
    "success": true
  }
  ```

#### Login User
- **URL**: `/api/v1/users/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "token": "your_access_token"
    },
    "error": false,
    "success": true
  }
  ```

### Product API

#### Create Product
- **URL**: `/api/v1/products`
- **Method**: `POST`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  title: "Product Title"
  category: { "_id": "category_id", "name": "Category Name" }
  subCategory: { "_id": "subcategory_id", "name": "SubCategory Name" }
  unit: "kg"
  stock: 100
  price: 29.99
  discount: 5
  description: "Product description"
  more_details: "Additional product details"
  images: [file1, file2, ...]
  ```
- **Response**:
  ```json
  {
    "message": "Product Created Successfully",
    "data": {
      "_id": "product_id",
      "title": "Product Title",
      "slug": "product-title",
      "images": ["image_url1", "image_url2"],
      "category": "category_id",
      "sub_category": "subcategory_id",
      "unit": "kg",
      "currentStock": 100,
      "price": 29.99,
      "discount": 5,
      "description": "Product description",
      "more_details": "Additional product details"
    },
    "error": false,
    "success": true
  }
  ```

#### Get Products (with pagination and search)
- **URL**: `/api/v1/products`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term for text search
- **Response**:
  ```json
  {
    "message": "Product data",
    "error": false,
    "success": true,
    "totalCount": 50,
    "totalNoPage": 5,
    "data": [
      {
        "_id": "product_id",
        "title": "Product Title",
        "slug": "product-title",
        "images": ["image_url1", "image_url2"],
        "category": {
          "_id": "category_id",
          "name": "Category Name"
        },
        "sub_category": {
          "_id": "subcategory_id",
          "name": "SubCategory Name"
        },
        "unit": "kg",
        "currentStock": 100,
        "price": 29.99,
        "discount": 5,
        "description": "Product description",
        "more_details": "Additional product details"
      }
    ]
  }
  ```

#### Get Products by Category
- **URL**: `/api/v1/products/category`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `id`: Category ID
- **Response**:
  ```json
  {
    "message": "category product list",
    "data": [
      {
        "_id": "product_id",
        "title": "Product Title",
        "slug": "product-title",
        "images": ["image_url1", "image_url2"],
        "category": "category_id",
        "sub_category": "subcategory_id",
        "unit": "kg",
        "currentStock": 100,
        "price": 29.99,
        "discount": 5,
        "description": "Product description",
        "more_details": "Additional product details"
      }
    ],
    "error": false,
    "success": true
  }
  ```

#### Get Products by Category and SubCategory
- **URL**: `/api/v1/products/category-and-subcategory`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `categoryId`: Category ID
  - `subCategoryId`: SubCategory ID
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
  ```json
  {
    "message": "Product list",
    "data": [
      {
        "_id": "product_id",
        "title": "Product Title",
        "slug": "product-title",
        "images": ["image_url1", "image_url2"],
        "category": "category_id",
        "sub_category": "subcategory_id",
        "unit": "kg",
        "currentStock": 100,
        "price": 29.99,
        "discount": 5,
        "description": "Product description",
        "more_details": "Additional product details"
      }
    ],
    "totalCount": 15,
    "page": 1,
    "limit": 10,
    "success": true,
    "error": false
  }
  ```

#### Get Product Details by Slug
- **URL**: `/api/v1/products/slug`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `slug`: Product slug
- **Response**:
  ```json
  {
    "message": "product details",
    "data": {
      "_id": "product_id",
      "title": "Product Title",
      "slug": "product-title",
      "images": ["image_url1", "image_url2"],
      "category": "category_id",
      "sub_category": "subcategory_id",
      "unit": "kg",
      "currentStock": 100,
      "price": 29.99,
      "discount": 5,
      "description": "Product description",
      "more_details": "Additional product details"
    },
    "error": false,
    "success": true
  }
  ```

#### Search Products
- **URL**: `/api/v1/products/search-product`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `search`: Search term
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `categoryId`: (optional) Filter by category ID
  - `subCategoryId`: (optional) Filter by subcategory ID
- **Response**:
  ```json
  {
    "message": "Product data",
    "error": false,
    "success": true,
    "data": [
      {
        "_id": "product_id",
        "title": "Product Title",
        "slug": "product-title",
        "images": ["image_url1", "image_url2"],
        "category": {
          "_id": "category_id",
          "name": "Category Name"
        },
        "sub_category": {
          "_id": "subcategory_id",
          "name": "SubCategory Name"
        },
        "unit": "kg",
        "currentStock": 100,
        "price": 29.99,
        "discount": 5,
        "description": "Product description",
        "more_details": "Additional product details"
      }
    ],
    "totalCount": 5,
    "totalPage": 1,
    "page": 1,
    "limit": 10
  }
  ```

#### Update Product
- **URL**: `/api/v1/products/update-product-details`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  _id: "product_id"
  title: "Updated Title"
  category: { "_id": "category_id", "name": "Category Name" }
  subCategory: { "_id": "subcategory_id", "name": "SubCategory Name" }
  unit: "kg"
  stock: 120
  price: 34.99
  discount: 10
  description: "Updated description"
  more_details: "Updated additional details"
  images: [file1, file2, ...] (optional)
  ```
- **Response**:
  ```json
  {
    "message": "updated successfully",
    "data": {
      "acknowledged": true,
      "modifiedCount": 1,
      "upsertedId": null,
      "upsertedCount": 0,
      "matchedCount": 1
    },
    "error": false,
    "success": true
  }
  ```

#### Delete Product
- **URL**: `/api/v1/products/delete-product`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Request Body**:
  ```json
  {
    "_id": "product_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Delete successfully",
    "error": false,
    "success": true,
    "data": {
      "acknowledged": true,
      "deletedCount": 1
    }
  }
  ```

### Category API

The Category API provides endpoints for managing product categories.

#### Create Category
- **URL**: `/api/v1/categories`
- **Method**: `POST`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  name: "Category Name"
  image: file
  ```
- **Response**:
  ```json
  {
    "message": "Category created successfully",
    "data": {
      "_id": "category_id",
      "name": "Category Name",
      "image": "image_url"
    },
    "error": false,
    "success": true
  }
  ```

#### Get Categories
- **URL**: `/api/v1/categories`
- **Method**: `GET`
- **Auth Required**: No
- **Response**:
  ```json
  {
    "message": "Category list",
    "data": [
      {
        "_id": "category_id",
        "name": "Category Name",
        "image": "image_url"
      }
    ],
    "error": false,
    "success": true
  }
  ```

### SubCategory API

The SubCategory API provides endpoints for managing product subcategories.

#### Create SubCategory
- **URL**: `/api/v1/subcategories`
- **Method**: `POST`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "SubCategory Name",
    "parentId": "category_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "SubCategory created successfully",
    "data": {
      "_id": "subcategory_id",
      "name": "SubCategory Name",
      "parent": "category_id"
    },
    "error": false,
    "success": true
  }
  ```

#### Get SubCategories by Category
- **URL**: `/api/v1/subcategories`
- **Method**: `GET`
- **Query Parameters**:
  - `categoryId`: Parent category ID
- **Auth Required**: No
- **Response**:
  ```json
  {
    "message": "SubCategory list",
    "data": [
      {
        "_id": "subcategory_id",
        "name": "SubCategory Name",
        "parent": {
          "_id": "category_id",
          "name": "Category Name"
        }
      }
    ],
    "error": false,
    "success": true
  }
  ```

### Cart API

The Cart API provides endpoints for managing user shopping carts. The cart system is integrated with inventory management to prevent overselling products.

#### Add to Cart
- **URL**: `/api/v1/carts`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "productId": "product_id",
    "quantity": 2
  }
  ```
- **Response**:
  ```json
  {
    "message": "Product added to cart",
    "data": {
      "_id": "cart_id",
      "user": "user_id",
      "items": [
        {
          "product": "product_id",
          "quantity": 2,
          "_id": "item_id"
        }
      ],
      "total": 59.98
    },
    "error": false,
    "success": true
  }
  ```
- **Error Response (Out of Stock)**:
  ```json
  {
    "message": "Product is out of stock",
    "error": true,
    "success": false
  }
  ```

#### Get Cart
- **URL**: `/api/v1/carts`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "Cart details",
    "data": {
      "_id": "cart_id",
      "user": "user_id",
      "items": [
        {
          "product": {
            "_id": "product_id",
            "title": "Product Title",
            "price": 29.99,
            "images": ["image_url"],
            "discount": 5
          },
          "quantity": 2,
          "_id": "item_id"
        }
      ],
      "total": 59.98
    },
    "error": false,
    "success": true
  }
  ```

#### Update Cart Item
- **URL**: `/api/v1/carts/update-qty`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "_id": "item_id",
    "qty": 3
  }
  ```
- **Response**:
  ```json
  {
    "message": "Update cart",
    "success": true,
    "error": false, 
    "data": {
      "acknowledged": true,
      "modifiedCount": 1,
      "upsertedId": null,
      "upsertedCount": 0,
      "matchedCount": 1
    }
  }
  ```
- **Error Response (Not Enough Stock)**:
  ```json
  {
    "message": "Not enough stock available",
    "error": true,
    "success": false
  }
  ```

#### Remove Item from Cart
- **URL**: `/api/v1/carts/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id`: Cart item ID
- **Response**:
  ```json
  {
    "message": "Item remove",
    "error": false,
    "success": true,
    "data": {
      "acknowledged": true,
      "deletedCount": 1
    }
  }
  ```

#### Get Cart Item
- **URL**: `/api/v1/carts/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id`: Cart item ID
- **Response**:
  ```json
  {
    "message": "Cart item",
    "data": {
      "_id": "cart_item_id",
      "productId": {
        "_id": "product_id",
        "title": "Product Title",
        "price": 29.99,
        "images": ["image_url"],
        "discount": 5
      },
      "userId": "user_id",
      "quantity": 2
    },
    "error": false,
    "success": true
  }
  ```

#### Clear Cart
- **URL**: `/api/v1/carts/clear`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "Clear cart",
    "data": {
      "acknowledged": true,
      "deletedCount": 3
    },
    "error": false,
    "success": true
  }
  ```

### Address API

The Address API provides endpoints for managing user delivery addresses.

#### Add Address
- **URL**: `/api/v1/address`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Home Address",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "phone": "1234567890",
    "isDefault": true
  }
  ```
- **Response**:
  ```json
  {
    "message": "Address added successfully",
    "data": {
      "_id": "address_id",
      "user": "user_id",
      "name": "Home Address",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA",
      "phone": "1234567890",
      "isDefault": true
    },
    "error": false,
    "success": true
  }
  ```

#### Get User Addresses
- **URL**: `/api/v1/address`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "User addresses",
    "data": [
      {
        "_id": "address_id",
        "user": "user_id",
        "name": "Home Address",
        "addressLine1": "123 Main St",
        "addressLine2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA",
        "phone": "1234567890",
        "isDefault": true
      }
    ],
    "error": false,
    "success": true
  }
  ```

### Order API

The Order API provides endpoints for managing user orders with inventory integration.

#### Create Order (Cash on Delivery)
- **URL**: `/api/v1/orders/cash-on-delivery`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "addressId": "address_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Order placed successfully",
    "data": {
      "_id": "order_id",
      "userId": "user_id",
      "orderId": "ORD-60a7c8f9b8e7c43e3c2b9e4a",
      "products": ["product_id1", "product_id2"],
      "product_details": {
        "name": "Product Title",
        "image": ["image_url1", "image_url2"]
      },
      "paymentId": "",
      "paymentStatus": "pending",
      "shippingAddress": ["address_id"],
      "subTotalAmount": 59.98,
      "totalAmount": 54.98,
      "orderStatus": "pending"
    },
    "error": false,
    "success": true
  }
  ```

#### Get Order List
- **URL**: `/api/v1/orders/order-list`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "order list",
    "data": [
      {
        "_id": "order_id",
        "userId": "user_id",
        "orderId": "ORD-60a7c8f9b8e7c43e3c2b9e4a",
        "products": ["product_id1", "product_id2"],
        "product_details": {
          "name": "Product Title",
          "image": ["image_url1", "image_url2"]
        },
        "paymentStatus": "pending",
        "shippingAddress": [{
          "_id": "address_id",
          "address_line1": "123 Main St",
          "city": "New York",
          "state": "NY"
        }],
        "subTotalAmount": 59.98,
        "totalAmount": 54.98,
        "orderStatus": "pending",
        "createdAt": "2025-05-14T12:00:00.000Z"
      }
    ],
    "error": false,
    "success": true
  }
  ```

### Inventory API

The Inventory API provides endpoints for managing product inventory with automatic threshold alerts.

#### Get All Inventory
- **URL**: `/api/v1/inventory`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
  ```json
  {
    "message": "Inventory data retrieved successfully",
    "data": [
      {
        "_id": "inventory_id",
        "productId": {
          "_id": "product_id",
          "title": "Product Title",
          "images": ["image_url"]
        },
        "currentStock": 100,
        "reservedStock": 5,
        "availableStock": 95,
        "threshold": 20,
        "createdAt": "2025-05-14T12:00:00.000Z",
        "updatedAt": "2025-05-14T14:00:00.000Z"
      }
    ],
    "pagination": {
      "totalCount": 50,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 10
    },
    "error": false,
    "success": true
  }
  ```

#### Get Low Stock Inventory
- **URL**: `/api/v1/inventory/low-stock`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Response**:
  ```json
  {
    "message": "Low stock inventory items retrieved successfully",
    "data": [
      {
        "_id": "inventory_id",
        "productId": {
          "_id": "product_id",
          "title": "Product Title",
          "images": ["image_url"],
          "price": 29.99,
          "discount": 5
        },
        "currentStock": 15,
        "reservedStock": 3,
        "availableStock": 12,
        "threshold": 20,
        "createdAt": "2025-05-14T12:00:00.000Z",
        "updatedAt": "2025-05-14T14:00:00.000Z"
      }
    ],
    "count": 1,
    "error": false,
    "success": true
  }
  ```

#### Get Product Inventory
- **URL**: `/api/v1/inventory/product/:productId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `productId`: Product ID
- **Response**:
  ```json
  {
    "message": "Product inventory retrieved successfully",
    "data": {
      "_id": "inventory_id",
      "productId": {
        "_id": "product_id",
        "title": "Product Title",
        "images": ["image_url"],
        "price": 29.99,
        "discount": 5
      },
      "currentStock": 100,
      "reservedStock": 5,
      "availableStock": 95,
      "threshold": 20,
      "createdAt": "2025-05-14T12:00:00.000Z",
      "updatedAt": "2025-05-14T14:00:00.000Z"
    },
    "error": false,
    "success": true
  }
  ```

#### Update Inventory
- **URL**: `/api/v1/inventory/update`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Request Body**:
  ```json
  {
    "productId": "product_id",
    "currentStock": 150,
    "threshold": 30
  }
  ```
- **Response**:
  ```json
  {
    "message": "Inventory updated successfully",
    "data": {
      "_id": "inventory_id",
      "productId": "product_id",
      "currentStock": 150,
      "reservedStock": 5,
      "availableStock": 145,
      "threshold": 30,
      "updatedAt": "2025-05-14T15:00:00.000Z"
    },
    "error": false,
    "success": true
  }
  ```

### User Preference API

The User Preference API provides endpoints for managing user preferences to support AI-driven personalization.

#### Set User Preferences
- **URL**: `/api/v1/preferences`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "preferences": {
      "favoriteCategories": ["category_id1", "category_id2"],
      "priceRange": {
        "min": 10,
        "max": 100
      },
      "favoriteColors": ["blue", "black"],
      "notificationPreferences": {
        "email": true,
        "push": false
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Preferences saved successfully",
    "data": {
      "_id": "preference_id",
      "user": "user_id",
      "preferences": {
        "favoriteCategories": ["category_id1", "category_id2"],
        "priceRange": {
          "min": 10,
          "max": 100
        },
        "favoriteColors": ["blue", "black"],
        "notificationPreferences": {
          "email": true,
          "push": false
        }
      }
    },
    "error": false,
    "success": true
  }
  ```

#### Get User Preferences
- **URL**: `/api/v1/preferences`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "User preferences",
    "data": {
      "_id": "preference_id",
      "user": "user_id",
      "preferences": {
        "favoriteCategories": ["category_id1", "category_id2"],
        "priceRange": {
          "min": 10,
          "max": 100
        },
        "favoriteColors": ["blue", "black"],
        "notificationPreferences": {
          "email": true,
          "push": false
        }
      }
    },
    "error": false,
    "success": true
  }
  ```

### Product Performance API

The Product Performance API provides endpoints for tracking and analyzing product performance metrics.

#### Get Product Performance Metrics
- **URL**: `/api/v1/product-performance/metrics`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Query Parameters**:
  - `productId`: Product ID
- **Response**:
  ```json
  {
    "message": "Product performance metrics",
    "data": {
      "_id": "performance_id",
      "productId": "product_id",
      "views": 450,
      "searches": 120,
      "addedToCart": 80,
      "purchases": 45,
      "totalSold": 62,
      "revenue": 1858.38,
      "dailyMetrics": [
        {
          "date": "2025-05-14T00:00:00.000Z",
          "views": 35,
          "searches": 12,
          "addedToCart": 8,
          "purchases": 5,
          "totalSold": 7,
          "revenue": 209.93
        }
      ]
    },
    "error": false,
    "success": true
  }
  ```

#### Get Top Products
- **URL**: `/api/v1/product-performance/top`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Query Parameters**:
  - `metric`: Metric to sort by (views, purchases, revenue) (default: purchases)
  - `limit`: Number of products to return (default: 10)
- **Response**:
  ```json
  {
    "message": "Top performing products",
    "data": [
      {
        "_id": "performance_id",
        "productId": {
          "_id": "product_id",
          "title": "Product Title",
          "images": ["image_url"],
          "price": 29.99
        },
        "views": 450,
        "purchases": 45,
        "revenue": 1858.38
      }
    ],
    "error": false,
    "success": true
  }
  ```

### Product Analysis API

The Product Analysis API provides AI-powered product analysis based on images.

#### Analyze Product Photo
- **URL**: `/api/v1/product-analysis/analyze`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  image: file
  ```
- **Response**:
  ```json
  {
    "message": "Product analysis complete",
    "data": {
      "productInfo": {
        "title": "Detected Product Title",
        "category": "Detected Category",
        "description": "Detailed product description...",
        "features": ["Feature 1", "Feature 2"],
        "estimatedPrice": "$29.99 - $39.99"
      },
      "similarProducts": [
        {
          "title": "Similar Product 1",
          "matchScore": 0.92,
          "productId": "product_id1"
        },
        {
          "title": "Similar Product 2",
          "matchScore": 0.85,
          "productId": "product_id2"
        }
      ]
    },
    "error": false,
    "success": true
  }
  ```

#### Get Product Info from Image
- **URL**: `/api/v1/product-analysis/product-info`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  image: file
  ```
- **Response**:
  ```json
  {
    "message": "Product information extracted",
    "data": {
      "title": "Detected Product Title",
      "category": "Detected Category",
      "description": "Detailed product description...",
      "features": ["Feature 1", "Feature 2"],
      "estimatedPrice": "$29.99 - $39.99"
    },
    "error": false,
    "success": true
  }
  ```

#### Find Similar Products
- **URL**: `/api/v1/product-analysis/similar-products`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  image: file
  ```
- **Response**:
  ```json
  {
    "message": "Similar products found",
    "data": [
      {
        "title": "Similar Product 1",
        "productId": "product_id1",
        "price": 29.99,
        "images": ["image_url1"],
        "matchScore": 0.92
      },
      {
        "title": "Similar Product 2",
        "productId": "product_id2",
        "price": 34.99,
        "images": ["image_url2"],
        "matchScore": 0.85
      }
    ],
    "error": false,
    "success": true
  }
  ```

### AI Assistant API

The AI Assistant API provides endpoints for an AI-powered shopping assistant that can answer customer queries about products, inventory, and shopping experience.

#### Ask Question to AI Assistant
- **URL**: `/api/v1/assist/ask`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "question": "Do you have any smartphones under $500?"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Assistant response",
    "data": {
      "response": "Yes, we have several smartphones under $500. Some options include the TechPro X5 ($449), SmartPhone Plus ($399), and MobiTech Ultra ($489). All of these models have great features including high-quality cameras and long battery life. Would you like more specific information about any of these models?"
    },
    "error": false,
    "success": true
  }
  ```

### Inventory Assistant API

The Inventory Assistant API provides AI-powered assistance for inventory management.

#### Get Inventory Insights
- **URL**: `/api/v1/inventory-assist/insights`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Response**:
  ```json
  {
    "message": "Inventory insights generated",
    "data": {
      "lowStockItems": 5,
      "outOfStockItems": 2,
      "recommendedActions": [
        {
          "productId": "product_id1",
          "productName": "Product Name",
          "currentStock": 15,
          "threshold": 20,
          "recommendation": "Restock soon - approaching threshold",
          "suggestedOrderQuantity": 50
        }
      ],
      "inventoryHealth": "Good",
      "insights": "Your inventory is generally well-stocked. Consider restocking 5 items that are below threshold levels. Based on sales trends, expect higher demand for electronics in the coming weeks."
    },
    "error": false,
    "success": true
  }
  ```

#### Get Reorder Recommendations
- **URL**: `/api/v1/inventory-assist/reorder-recommendations`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Response**:
  ```json
  {
    "message": "Reorder recommendations",
    "data": [
      {
        "productId": "product_id",
        "productName": "Product Name",
        "currentStock": 15,
        "threshold": 20,
        "avgDailySales": 2.5,
        "daysToThreshold": 6,
        "recommendedOrderQuantity": 50,
        "recommendedOrderDate": "2025-05-24T00:00:00.000Z",
        "priority": "Medium"
      }
    ],
    "error": false,
    "success": true
  }
  ```

#### Get Sales Forecast
- **URL**: `/api/v1/inventory-assist/sales-forecast`
- **Method**: `GET`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Query Parameters**:
  - `productId`: (optional) Product ID
  - `days`: Number of days to forecast (default: 30)
- **Response**:
  ```json
  {
    "message": "Sales forecast generated",
    "data": {
      "forecasts": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "dailyForecasts": [
            {
              "date": "2025-05-19T00:00:00.000Z",
              "predictedSales": 3
            },
            {
              "date": "2025-05-20T00:00:00.000Z",
              "predictedSales": 4
            }
          ],
          "totalForecastedSales": 120,
          "confidenceLevel": "High"
        }
      ],
      "insights": "Based on historical sales data and current trends, we expect a 15% increase in sales over the next 30 days, with peak sales occurring around the 25th of May."
    },
    "error": false,
    "success": true
  }
  ```

## AI Features

The platform includes several AI-driven features:

1. **User Activity Tracking**: The system tracks user activity such as product views, searches, and category browsing to build a user profile for personalized recommendations.

2. **Search Enhancement**: The product search functionality uses MongoDB's text search capabilities, which can be enhanced with ML-based ranking to improve result relevance.

3. **Personalized Recommendations**: The user preference API allows storing and retrieving user preferences to provide personalized product recommendations.

4. **Smart Inventory Management**: The system automatically monitors inventory levels and sends email alerts to administrators when products reach or fall below threshold levels. It also provides demand forecasting, auto-reorder recommendations, and sellout prevention strategies.

5. **Product Image Analysis**: AI-powered image analysis extracts product information and finds similar products based on uploaded images.

6. **Performance Analytics**: Tracks and analyzes product performance metrics to identify trends and popular products.

7. **AI Shopping Assistant**: Provides a natural language interface for customers to ask questions about products, inventory, and the shopping experience. The assistant uses Google's Gemini AI model to provide accurate, context-aware responses based on the current product catalog.

8. **Inventory Optimization**: AI-driven inventory insights help optimize stock levels, prevent stockouts, and manage reordering efficiently.

## Error Handling

All API endpoints follow a consistent error handling pattern:

```json
{
  "message": "Error message description",
  "error": true,
  "success": false
}
```

HTTP status codes are used appropriately:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Excessive requests from the same IP address may be temporarily blocked.

## Contributions

Contributions are welcome! Please create a pull request with your proposed changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.