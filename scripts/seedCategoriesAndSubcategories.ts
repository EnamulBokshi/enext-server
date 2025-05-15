import mongoose from 'mongoose';
import CategoryModel from '../models/category.model.js';
import SubCategoryModel from '../models/subCategory.model.js';
import ProductModel from '../models/product.model.js';
import { dbURL } from '../config/env.js';
import { connectDB } from '../config/db.js';


// Categories data
const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000",
    description: "Electronic devices and gadgets"
  },
  {
    name: "Clothing",
    slug: "clothing",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1000",
    description: "Fashion items including clothes, shoes, and accessories"
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556911220-bda9f7f9677e?q=80&w=1000",
    description: "Household items and kitchen appliances"
  },
  {
    name: "Books",
    slug: "books",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000",
    description: "Books of various genres and categories"
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000",
    description: "Sporting goods and outdoor recreation equipment"
  }
];

// Function to seed categories
const seedCategories = async () => {
  try {
    // Delete existing categories
    await CategoryModel.deleteMany({});
    console.log("Deleted existing categories");

    const insertedCategories = await CategoryModel.insertMany(categories);
    console.log(`Inserted ${insertedCategories.length} categories`);
    return insertedCategories;
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

// Function to seed subcategories
const seedSubCategories = async (insertedCategories: any[]) => {
  try {
    // Delete existing subcategories
    await SubCategoryModel.deleteMany({});
    console.log("Deleted existing subcategories");

    const electronicsId = insertedCategories.find(c => c.slug === "electronics")._id;
    const clothingId = insertedCategories.find(c => c.slug === "clothing")._id;
    const homeKitchenId = insertedCategories.find(c => c.slug === "home-kitchen")._id;
    const booksId = insertedCategories.find(c => c.slug === "books")._id;
    const sportsOutdoorsId = insertedCategories.find(c => c.slug === "sports-outdoors")._id;

    const subcategories = [
      // Electronics subcategories
      {
        name: "Smartphones",
        slug: "smartphones",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000",
        description: "Mobile phones and accessories",
        category: [electronicsId]
      },
      {
        name: "Laptops",
        slug: "laptops",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000",
        description: "Notebook computers and accessories",
        category: [electronicsId]
      },
      {
        name: "Audio Devices",
        slug: "audio-devices",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000",
        description: "Headphones, speakers, and sound systems",
        category: [electronicsId]
      },
      // Clothing subcategories
      {
        name: "Men's Fashion",
        slug: "mens-fashion",
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000",
        description: "Clothing and accessories for men",
        category: [clothingId]
      },
      {
        name: "Women's Fashion",
        slug: "womens-fashion",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000",
        description: "Clothing and accessories for women",
        category: [clothingId]
      },
      {
        name: "Kids' Fashion",
        slug: "kids-fashion",
        image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1000",
        description: "Clothing and accessories for children",
        category: [clothingId]
      },
      // Home & Kitchen subcategories
      {
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        image: "https://images.unsplash.com/photo-1556911220-bda9f7f9677e?q=80&w=1000",
        description: "Cooking appliances and utensils",
        category: [homeKitchenId]
      },
      {
        name: "Furniture",
        slug: "furniture",
        image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1000",
        description: "Home furniture for living, bedroom and more",
        category: [homeKitchenId]
      },
      {
        name: "Home Decor",
        slug: "home-decor",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000",
        description: "Decorative items for your home",
        category: [homeKitchenId]
      },
      // Books subcategories
      {
        name: "Fiction",
        slug: "fiction",
        image: "https://images.unsplash.com/photo-1531072901881-d644216d4bf9?q=80&w=1000",
        description: "Novels and fictional literature",
        category: [booksId]
      },
      {
        name: "Non-Fiction",
        slug: "non-fiction",
        image: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000",
        description: "Educational and informative books",
        category: [booksId]
      },
      {
        name: "Academic Books",
        slug: "academic-books",
        image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1000",
        description: "Textbooks and academic references",
        category: [booksId]
      },
      // Sports & Outdoors subcategories
      {
        name: "Exercise & Fitness",
        slug: "exercise-fitness",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000",
        description: "Equipment for gym and home workouts",
        category: [sportsOutdoorsId]
      },
      {
        name: "Outdoor Recreation",
        slug: "outdoor-recreation",
        image: "https://images.unsplash.com/photo-1533757440528-f578a10dbe2e?q=80&w=1000",
        description: "Gear for camping, hiking, and outdoor activities",
        category: [sportsOutdoorsId]
      },
      {
        name: "Team Sports",
        slug: "team-sports",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000",
        description: "Equipment for football, basketball, and other team sports",
        category: [sportsOutdoorsId]
      }
    ];

    const insertedSubcategories = await SubCategoryModel.insertMany(subcategories);
    console.log(`Inserted ${insertedSubcategories.length} subcategories`);
  } catch (error) {
    console.error("Error seeding subcategories:", error);
    process.exit(1);
  }
};

// Function to seed dummy products
const seedProducts = async () => {
  try {
    // Delete existing products
    await ProductModel.deleteMany({});
    console.log("Deleted existing products");

    // Get all categories and subcategories
    const categories = await CategoryModel.find({});
    const subcategories = await SubCategoryModel.find({});

    const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
    const getRandomPrice = () => Math.floor(Math.random() * 900) + 100; // Price between 100 and 999
    const getRandomStock = () => Math.floor(Math.random() * 100) + 10; // Stock between 10 and 109
    const getRandomDiscount = () => Math.floor(Math.random() * 30); // Discount between 0 and 29

    // Create array to hold product data
    const products = [];

    // Generate 50 dummy products
    for (let i = 1; i <= 50; i++) {
      // Pick a random category and a matching subcategory
      const randomCategory = getRandomItem(categories);
      const matchingSubcategories = subcategories.filter(
        sub => sub.category.some(catId => catId.toString() === randomCategory._id.toString())
      );
      const randomSubcategory = getRandomItem(matchingSubcategories);

      // Create slug from title
      const title = generateProductTitle(randomCategory.name, randomSubcategory.name, i);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + i;

      products.push({
        title,
        slug,
        images: [getRandomImage(randomCategory.slug)],
        description: generateProductDescription(randomCategory.name, randomSubcategory.name),
        category: [randomCategory._id],
        sub_category: [randomSubcategory._id],
        unit: getUnitForCategory(randomCategory.slug),
        currentStock: getRandomStock(),
        price: getRandomPrice(),
        discount: getRandomDiscount(),
        publish: true
      });
    }

    const insertedProducts = await ProductModel.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

// Helper function to generate product titles
function generateProductTitle(categoryName: string, subcategoryName: string, index: number): string {
  const brands: Record<string, string[]> = {
    'Electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'Dell', 'Asus', 'JBL'],
    'Clothing': ['Nike', 'Adidas', 'Zara', 'H&M', 'Levis', 'Puma', 'GAP', 'Gucci'],
    'Home & Kitchen': ['IKEA', 'Bosch', 'Philips', 'Cuisinart', 'KitchenAid', 'Dyson', 'Crate & Barrel'],
    'Books': ['Penguin', 'HarperCollins', 'Simon & Schuster', 'Oxford', 'Pearson', 'Wiley'],
    'Sports & Outdoors': ['Nike', 'Adidas', 'Wilson', 'Coleman', 'North Face', 'Spalding', 'Under Armour']
  };

  const models: Record<string, string[]> = {
    'Smartphones': ['Galaxy S22', 'iPhone 13', 'Redmi Note 10', 'Pixel 6', 'Nova 9'],
    'Laptops': ['MacBook Pro', 'XPS 13', 'ThinkPad X1', 'ZenBook', 'Pavilion'],
    'Audio Devices': ['SoundLink', 'WH-1000XM4', 'AirPods Pro', 'Soundbar 700', 'Party Speaker'],
    'Men\'s Fashion': ['Slim Fit Jeans', 'Classic Polo', 'Oxford Shirt', 'Bomber Jacket', 'Chino Pants'],
    'Women\'s Fashion': ['Floral Dress', 'High-Rise Jeans', 'Cashmere Sweater', 'Wrap Blouse', 'Maxi Skirt'],
    'Kids\' Fashion': ['Graphic Tee', 'Denim Overalls', 'Fleece Hoodie', 'School Uniform', 'Summer Shorts'],
    'Kitchen Appliances': ['Stand Mixer', 'Blender Pro', 'Air Fryer Plus', 'Smart Toaster', 'Coffee Maker'],
    'Furniture': ['L-Shaped Sofa', 'Queen Bed Frame', 'Dining Table Set', 'Bookshelf', 'Office Chair'],
    'Home Decor': ['Floor Lamp', 'Throw Pillow Set', 'Area Rug', 'Wall Art', 'Ceramic Vase'],
    'Fiction': ['Fantasy Novel', 'Mystery Thriller', 'Romance Collection', 'Sci-Fi Adventure', 'Classic Literature'],
    'Non-Fiction': ['Biography', 'Self-Help Guide', 'History Book', 'Cookbook', 'Travel Guide'],
    'Academic Books': ['Mathematics Textbook', 'Science Encyclopedia', 'Language Dictionary', 'Business Handbook', 'Medical Reference'],
    'Exercise & Fitness': ['Yoga Mat', 'Adjustable Dumbbells', 'Resistance Bands', 'Exercise Bike', 'Treadmill'],
    'Outdoor Recreation': ['Camping Tent', 'Hiking Backpack', 'Sleeping Bag', 'Portable Grill', 'Water Filter'],
    'Team Sports': ['Basketball', 'Soccer Ball', 'Football', 'Volleyball Net', 'Baseball Glove']
  };

  const categoryBrands = brands[categoryName] || ['Premium', 'Pro', 'Elite', 'Standard'];
  const subcategoryModels = models[subcategoryName] || ['Standard', 'Deluxe', 'Premium', 'Pro'];
  
  const brand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
  const model = subcategoryModels[Math.floor(Math.random() * subcategoryModels.length)];
  
  return `${brand} ${model} ${subcategoryName} ${index}`;
}

// Helper function to generate product descriptions
function generateProductDescription(categoryName: string, subcategoryName: string): string {
  const descriptions: Record<string, string> = {
    'Electronics': 'Featuring cutting-edge technology and sleek design, this electronic device offers exceptional performance and reliability for all your digital needs.',
    'Clothing': 'Made with premium quality materials for comfort and durability. Stylish design that fits perfectly for any occasion.',
    'Home & Kitchen': 'Enhance your home with this practical and elegant product. Designed for convenience and efficiency in your daily life.',
    'Books': 'An engaging read that will captivate your imagination and expand your knowledge. Perfect for book enthusiasts of all ages.',
    'Sports & Outdoors': 'Engineered for peak performance and durability. Ideal for both professional athletes and hobbyists looking to improve their game.'
  };

  const features: Record<string, string> = {
    'Smartphones': 'Features a high-resolution display, powerful processor, advanced camera system, and long-lasting battery life.',
    'Laptops': 'Equipped with a fast processor, ample storage, stunning display, and all-day battery life for maximum productivity.',
    'Audio Devices': 'Delivers crystal-clear sound quality with noise cancellation technology and comfortable design for extended listening sessions.',
    'Men\'s Fashion': 'Tailored for a perfect fit with attention to detail and versatile styling options for any occasion.',
    'Women\'s Fashion': 'Designed with current fashion trends in mind while ensuring comfort and flattering fit for all body types.',
    'Kids\' Fashion': 'Crafted from durable, easy-to-clean materials that withstand active play while keeping your child comfortable and stylish.',
    'Kitchen Appliances': 'Streamlines your cooking process with intuitive controls, easy cleaning, and reliable performance for delicious meals.',
    'Furniture': 'Constructed from high-quality materials with attention to detail, providing both aesthetic appeal and practical functionality.',
    'Home Decor': 'Adds a touch of elegance to any room with its timeless design and premium craftsmanship.',
    'Fiction': 'Takes readers on an unforgettable journey with compelling characters and a captivating plot that keeps you turning pages.',
    'Non-Fiction': 'Provides valuable insights and information presented in an accessible and engaging format for all readers.',
    'Academic Books': 'Offers comprehensive coverage of the subject with clear explanations, helpful examples, and practice problems.',
    'Exercise & Fitness': 'Helps you achieve your fitness goals with effective design, durability, and versatility for various workout routines.',
    'Outdoor Recreation': 'Perfect for adventures in the great outdoors, combining functionality, comfort, and reliability in all conditions.',
    'Team Sports': 'Designed for optimal performance on the field or court, enhancing player experience and game results.'
  };

  const baseDescription = descriptions[categoryName] || 'High-quality product designed to meet your needs';
  const featureDescription = features[subcategoryName] || 'Features premium design and functionality';
  
  return `${baseDescription} ${featureDescription} Customer satisfaction guaranteed with our 30-day return policy.`;
}

// Helper function to get appropriate unit for category
function getUnitForCategory(categorySlug: string): string {
  const units: Record<string, string> = {
    'electronics': 'piece',
    'clothing': 'piece',
    'home-kitchen': 'piece',
    'books': 'book',
    'sports-outdoors': 'piece'
  };
  
  return units[categorySlug] || 'piece';
}

// Helper function to get random product image
function getRandomImage(categorySlug: string): string {
  const images: Record<string, string[]> = {
    'electronics': [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000',
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1000'
    ],
    'clothing': [
      'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1000',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000'
    ],
    'home-kitchen': [
      'https://images.unsplash.com/photo-1556911220-bda9f7f9677e?q=80&w=1000',
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1000',
      'https://images.unsplash.com/photo-1583845112203-29329902332e?q=80&w=1000'
    ],
    'books': [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1000',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000'
    ],
    'sports-outdoors': [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1000',
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000'
    ]
  };
  
  const categoryImages = images[categorySlug] || [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000'
  ];
  
  return categoryImages[Math.floor(Math.random() * categoryImages.length)];
}

// Main function to run the seed process
const seedDatabase = async () => {
  try {
    await connectDB();
    // const insertedCategories = await seedCategories();
    // await seedSubCategories(insertedCategories);
    await seedProducts();
    
    console.log("Database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

export default seedDatabase;

