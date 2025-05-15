"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var category_model_js_1 = require("../models/category.model.js");
var subCategory_model_js_1 = require("../models/subCategory.model.js");
var env_js_1 = require("../config/env.js");
// Function to connect to the database
var connectDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, mongoose_1.default.connect(env_js_1.dbURL)];
            case 1:
                _a.sent();
                console.log("MongoDB connected successfully");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("MongoDB connection error:", error_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Categories data
var categories = [
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
var seedCategories = function () { return __awaiter(void 0, void 0, void 0, function () {
    var insertedCategories, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                // Delete existing categories
                return [4 /*yield*/, category_model_js_1.default.deleteMany({})];
            case 1:
                // Delete existing categories
                _a.sent();
                console.log("Deleted existing categories");
                return [4 /*yield*/, category_model_js_1.default.insertMany(categories)];
            case 2:
                insertedCategories = _a.sent();
                console.log("Inserted ".concat(insertedCategories.length, " categories"));
                return [2 /*return*/, insertedCategories];
            case 3:
                error_2 = _a.sent();
                console.error("Error seeding categories:", error_2);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Function to seed subcategories
var seedSubCategories = function (insertedCategories) { return __awaiter(void 0, void 0, void 0, function () {
    var electronicsId, clothingId, homeKitchenId, booksId, sportsOutdoorsId, subcategories, insertedSubcategories, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                // Delete existing subcategories
                return [4 /*yield*/, subCategory_model_js_1.default.deleteMany({})];
            case 1:
                // Delete existing subcategories
                _a.sent();
                console.log("Deleted existing subcategories");
                electronicsId = insertedCategories.find(function (c) { return c.slug === "electronics"; })._id;
                clothingId = insertedCategories.find(function (c) { return c.slug === "clothing"; })._id;
                homeKitchenId = insertedCategories.find(function (c) { return c.slug === "home-kitchen"; })._id;
                booksId = insertedCategories.find(function (c) { return c.slug === "books"; })._id;
                sportsOutdoorsId = insertedCategories.find(function (c) { return c.slug === "sports-outdoors"; })._id;
                subcategories = [
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
                return [4 /*yield*/, subCategory_model_js_1.default.insertMany(subcategories)];
            case 2:
                insertedSubcategories = _a.sent();
                console.log("Inserted ".concat(insertedSubcategories.length, " subcategories"));
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("Error seeding subcategories:", error_3);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Main function to run the seed process
var seedDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var insertedCategories, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, connectDB()];
            case 1:
                _a.sent();
                return [4 /*yield*/, seedCategories()];
            case 2:
                insertedCategories = _a.sent();
                return [4 /*yield*/, seedSubCategories(insertedCategories)];
            case 3:
                _a.sent();
                console.log("Database seeding completed successfully");
                process.exit(0);
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error("Error seeding database:", error_4);
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Run the seed function
seedDatabase();
