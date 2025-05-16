/**
 * Seed script to create inventory records for all existing products
 * 
 * This script fetches all products from the database and creates
 * corresponding inventory records if they don't already exist.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../models/product.model.js';
import InventoryModel from '../models/inventory.model.js';
import { connectDB } from '../config/db.js';

// Load environment variables
dotenv.config();

const seedInventory = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all products from database
    const products = await ProductModel.find({});
    console.log(`Found ${products.length} products in database`);

    // Counter for tracking new inventory items created
    let createdCount = 0;
    let existingCount = 0;

    // Process each product
    for (const product of products) {
      // Check if inventory entry already exists for this product
      const existingInventory = await InventoryModel.findOne({ productId: product._id });

      if (!existingInventory) {
        // Create new inventory entry using product's current stock
        const currentStock = product.currentStock || 0;
        
        const newInventory = new InventoryModel({
          productId: product._id,
          currentStock: currentStock,
          reservedStock: 0,
          availableStock: currentStock,
          threshold: 2 // Default threshold
        });

        await newInventory.save();
        createdCount++;
        console.log(`Created inventory for product: ${product.title} (ID: ${product._id})`);
      } else {
        existingCount++;
        console.log(`Inventory already exists for product: ${product.title} (ID: ${product._id})`);
      }
    }

    console.log(`Inventory seeding completed!`);
    console.log(`- Created ${createdCount} new inventory entries`);
    console.log(`- Found ${existingCount} existing inventory entries`);
    console.log(`- Total products processed: ${products.length}`);

  } catch (error) {
    console.error('Error seeding inventory:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedInventory();