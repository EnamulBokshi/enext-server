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
  - [User Preference API](#user-preference-api)
  - [File Upload API](#file-upload-api)

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

The Cart API provides endpoints for managing user shopping carts.

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
- **URL**: `/api/v1/carts/update-cart`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "itemId": "item_id",
    "quantity": 3
  }
  ```
- **Response**:
  ```json
  {
    "message": "Cart updated successfully",
    "data": {
      "_id": "cart_id",
      "user": "user_id",
      "items": [
        {
          "product": "product_id",
          "quantity": 3,
          "_id": "item_id"
        }
      ],
      "total": 89.97
    },
    "error": false,
    "success": true
  }
  ```

#### Remove Item from Cart
- **URL**: `/api/v1/carts/remove-item`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "itemId": "item_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Item removed from cart",
    "data": {
      "_id": "cart_id",
      "user": "user_id",
      "items": [],
      "total": 0
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

The Order API provides endpoints for managing user orders.

#### Create Order
- **URL**: `/api/v1/orders`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "addressId": "address_id",
    "paymentMethod": "cod"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Order created successfully",
    "data": {
      "_id": "order_id",
      "user": "user_id",
      "items": [
        {
          "product": "product_id",
          "quantity": 2,
          "price": 29.99,
          "_id": "item_id"
        }
      ],
      "shippingAddress": "address_id",
      "total": 59.98,
      "status": "pending",
      "paymentMethod": "cod",
      "createdAt": "2025-05-14T12:00:00.000Z"
    },
    "error": false,
    "success": true
  }
  ```

#### Get User Orders
- **URL**: `/api/v1/orders`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "User orders",
    "data": [
      {
        "_id": "order_id",
        "user": "user_id",
        "items": [
          {
            "product": {
              "_id": "product_id",
              "title": "Product Title",
              "images": ["image_url"]
            },
            "quantity": 2,
            "price": 29.99,
            "_id": "item_id"
          }
        ],
        "shippingAddress": {
          "_id": "address_id",
          "name": "Home Address",
          "addressLine1": "123 Main St"
        },
        "total": 59.98,
        "status": "pending",
        "paymentMethod": "cod",
        "createdAt": "2025-05-14T12:00:00.000Z"
      }
    ],
    "error": false,
    "success": true
  }
  ```

#### Get Order Details
- **URL**: `/api/v1/orders/:orderId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "Order details",
    "data": {
      "_id": "order_id",
      "user": "user_id",
      "items": [
        {
          "product": {
            "_id": "product_id",
            "title": "Product Title",
            "images": ["image_url"],
            "price": 29.99,
            "discount": 5
          },
          "quantity": 2,
          "price": 29.99,
          "_id": "item_id"
        }
      ],
      "shippingAddress": {
        "_id": "address_id",
        "name": "Home Address",
        "addressLine1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA",
        "phone": "1234567890"
      },
      "total": 59.98,
      "status": "pending",
      "paymentMethod": "cod",
      "createdAt": "2025-05-14T12:00:00.000Z"
    },
    "error": false,
    "success": true
  }
  ```

#### Update Order Status (Admin)
- **URL**: `/api/v1/orders/status`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Admin Required**: Yes
- **Request Body**:
  ```json
  {
    "orderId": "order_id",
    "status": "shipped"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Order status updated successfully",
    "data": {
      "_id": "order_id",
      "status": "shipped",
      "updatedAt": "2025-05-14T14:00:00.000Z"
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

### File Upload API

The File Upload API provides endpoints for uploading images to Cloudinary.

#### Upload Image
- **URL**: `/api/v1/file/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  image: file
  ```
- **Response**:
  ```json
  {
    "message": "File uploaded successfully",
    "data": {
      "url": "cloudinary_image_url",
      "public_id": "cloudinary_public_id"
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