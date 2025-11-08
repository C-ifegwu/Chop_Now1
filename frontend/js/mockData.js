// ============================================
// MOCK DATA FOR CHOPNOW APPLICATION
// ============================================

// Mock Users
const mockUsers = {
    consumer: {
        id: 1,
        email: 'consumer@chopnow.com',
        password: 'password123',
        name: 'John Doe',
        userType: 'consumer',
        phone: '+234 123 456 7890',
        address: '123 Main Street, Lagos, Nigeria'
    },
    vendor: {
        id: 2,
        email: 'vendor@chopnow.com',
        password: 'password123',
        name: 'Jane Smith',
        userType: 'vendor',
        businessName: 'Tasty Bites Restaurant',
        phone: '+234 987 654 3210',
        address: '456 Food Street, Lagos, Nigeria'
    }
};

// Mock Meals
const mockMeals = [
    {
        id: 1,
        vendor_id: 2,
        name: 'Jollof Rice & Chicken',
        description: 'Delicious Nigerian jollof rice served with perfectly grilled chicken and vegetables. Freshly prepared with authentic spices.',
        originalPrice: 2500,
        discountedPrice: 1800,
        quantityAvailable: 15,
        cuisineType: 'African',
        vendor_name: 'Tasty Bites Restaurant',
        vendor_address: '456 Food Street, Lagos',
        imageUrl: '🍛',
        rating: 4.8,
        reviewCount: 24
    },
    {
        id: 2,
        vendor_id: 2,
        name: 'Pounded Yam & Egusi Soup',
        description: 'Traditional Nigerian pounded yam with rich egusi soup. A hearty meal packed with flavor and nutrition.',
        originalPrice: 3000,
        discountedPrice: 2100,
        quantityAvailable: 8,
        cuisineType: 'African',
        vendor_name: 'Tasty Bites Restaurant',
        vendor_address: '456 Food Street, Lagos',
        imageUrl: '🍲',
        rating: 4.9,
        reviewCount: 18
    },
    {
        id: 3,
        vendor_id: 2,
        name: 'Fried Rice & Beef',
        description: 'Savory fried rice with tender beef pieces, mixed vegetables, and special sauce. A customer favorite!',
        originalPrice: 2800,
        discountedPrice: 2000,
        quantityAvailable: 12,
        cuisineType: 'African',
        vendor_name: 'Tasty Bites Restaurant',
        vendor_address: '456 Food Street, Lagos',
        imageUrl: '🍱',
        rating: 4.7,
        reviewCount: 31
    },
    {
        id: 4,
        vendor_id: 2,
        name: 'Grilled Fish & Plantain',
        description: 'Fresh grilled fish with fried plantain and spicy sauce. A healthy and delicious option.',
        originalPrice: 3500,
        discountedPrice: 2500,
        quantityAvailable: 6,
        cuisineType: 'African',
        vendor_name: 'Tasty Bites Restaurant',
        vendor_address: '456 Food Street, Lagos',
        imageUrl: '🐟',
        rating: 4.6,
        reviewCount: 15
    },
    {
        id: 5,
        vendor_id: 2,
        name: 'Pepper Soup & Fufu',
        description: 'Spicy pepper soup with traditional fufu. Perfect for a warm, satisfying meal.',
        originalPrice: 2200,
        discountedPrice: 1600,
        quantityAvailable: 10,
        cuisineType: 'African',
        vendor_name: 'Tasty Bites Restaurant',
        vendor_address: '456 Food Street, Lagos',
        imageUrl: '🍜',
        rating: 4.5,
        reviewCount: 12
    },
    {
        id: 6,
        vendor_id: 2,
        name: 'Suya & Salad',
        description: 'Spicy Nigerian suya with fresh garden salad and sides. A light yet flavorful meal.',
        originalPrice: 2000,
        discountedPrice: 1400,
        quantityAvailable: 20,
        cuisineType: 'African',
        vendor_name: 'Tasty Bites Restaurant',
        vendor_address: '456 Food Street, Lagos',
        imageUrl: '🥗',
        rating: 4.8,
        reviewCount: 28
    }
];

// Mock Orders
const mockOrders = [
    {
        id: 1,
        consumer_id: 1,
        meal_id: 1,
        meal_name: 'Jollof Rice & Chicken',
        quantity: 2,
        total_amount: 3600,
        status: 'completed',
        payment_method: 'mobile_money',
        created_at: '2025-01-15T10:30:00Z',
        vendor_name: 'Tasty Bites Restaurant'
    },
    {
        id: 2,
        consumer_id: 1,
        meal_id: 3,
        meal_name: 'Fried Rice & Beef',
        quantity: 1,
        total_amount: 2000,
        status: 'ready',
        payment_method: 'card',
        created_at: '2025-01-18T14:20:00Z',
        vendor_name: 'Tasty Bites Restaurant'
    },
    {
        id: 3,
        consumer_id: 1,
        meal_id: 2,
        meal_name: 'Pounded Yam & Egusi Soup',
        quantity: 1,
        total_amount: 2100,
        status: 'preparing',
        payment_method: 'mobile_money',
        created_at: '2025-01-20T12:15:00Z',
        vendor_name: 'Tasty Bites Restaurant'
    }
];

// Mock Vendor Orders
const mockVendorOrders = [
    {
        id: 1,
        meal_id: 1,
        meal_name: 'Jollof Rice & Chicken',
        consumer_name: 'John Doe',
        consumer_phone: '+234 123 456 7890',
        quantity: 2,
        total_amount: 3600,
        status: 'completed',
        payment_method: 'mobile_money',
        created_at: '2025-01-15T10:30:00Z'
    },
    {
        id: 2,
        meal_id: 3,
        meal_name: 'Fried Rice & Beef',
        consumer_name: 'John Doe',
        consumer_phone: '+234 123 456 7890',
        quantity: 1,
        total_amount: 2000,
        status: 'ready',
        payment_method: 'card',
        created_at: '2025-01-18T14:20:00Z'
    },
    {
        id: 3,
        meal_id: 2,
        meal_name: 'Pounded Yam & Egusi Soup',
        consumer_name: 'John Doe',
        consumer_phone: '+234 123 456 7890',
        quantity: 1,
        total_amount: 2100,
        status: 'preparing',
        payment_method: 'mobile_money',
        created_at: '2025-01-20T12:15:00Z'
    },
    {
        id: 4,
        meal_id: 4,
        meal_name: 'Grilled Fish & Plantain',
        consumer_name: 'Sarah Johnson',
        consumer_phone: '+234 987 654 3210',
        quantity: 1,
        total_amount: 2500,
        status: 'pending',
        payment_method: 'mobile_money',
        created_at: '2025-01-21T09:45:00Z'
    }
];

// Mock Reviews
const mockReviews = [
    {
        id: 1,
        meal_id: 1,
        consumer_name: 'John Doe',
        rating: 5,
        comment: 'Absolutely delicious! The jollof rice was perfectly spiced and the chicken was tender. Great value for money!',
        created_at: '2025-01-16T08:00:00Z'
    },
    {
        id: 2,
        meal_id: 1,
        consumer_name: 'Mary Williams',
        rating: 4,
        comment: 'Very good meal, fresh and tasty. Would order again!',
        created_at: '2025-01-17T10:30:00Z'
    },
    {
        id: 3,
        meal_id: 3,
        consumer_name: 'David Brown',
        rating: 5,
        comment: 'Best fried rice I\'ve had in a while. The beef was perfectly cooked. Highly recommend!',
        created_at: '2025-01-19T14:20:00Z'
    }
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Functions
const mockAPI = {
    // Helper function to get all users (from mockUsers and localStorage)
    getAllUsers() {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const allUsers = [...Object.values(mockUsers), ...registeredUsers];
        return allUsers;
    },

    // Helper function to save registered user
    saveRegisteredUser(user) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        // Check if user already exists
        const exists = registeredUsers.find(u => u.email === user.email);
        if (!exists) {
            registeredUsers.push(user);
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
    },

    // Authentication
    async login(email, password) {
        await delay(800);
        // Check both mockUsers and registered users from localStorage
        const allUsers = this.getAllUsers();
        const user = allUsers.find(u => u.email === email && u.password === password);
        if (user) {
            return {
                success: true,
                token: `mock_token_${user.id}`,
                userType: user.userType,
                userId: user.id,
                user: { ...user, password: undefined }
            };
        }
        throw new Error('Invalid credentials');
    },

    async register(userData) {
        await delay(1000);
        
        // Check if user already exists
        const allUsers = this.getAllUsers();
        const existingUser = allUsers.find(u => u.email === userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        
        const newUser = {
            id: Date.now(),
            ...userData,
            created_at: new Date().toISOString()
        };
        
        // Save the new user to localStorage
        this.saveRegisteredUser(newUser);
        
        return {
            success: true,
            message: 'Registration successful',
            user: newUser,
            token: `mock_token_${newUser.id}`,
            userType: newUser.userType,
            userId: newUser.id
        };
    },

    async getProfile(userId) {
        await delay(400);
        // Check both mockUsers and registered users
        const allUsers = this.getAllUsers();
        const user = allUsers.find(u => u.id === parseInt(userId));
        if (user) {
            return { ...user, password: undefined };
        }
        throw new Error('User not found');
    },

    // Meals
    async getMeals(filters = {}) {
        await delay(600);
        let meals = [...mockMeals];
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            meals = meals.filter(m => 
                m.name.toLowerCase().includes(search) ||
                m.description.toLowerCase().includes(search) ||
                m.vendor_name.toLowerCase().includes(search)
            );
        }
        
        if (filters.cuisine) {
            meals = meals.filter(m => m.cuisineType.toLowerCase() === filters.cuisine.toLowerCase());
        }
        
        if (filters.maxPrice) {
            meals = meals.filter(m => m.discountedPrice <= filters.maxPrice);
        }
        
        if (filters.minPrice) {
            meals = meals.filter(m => m.discountedPrice >= filters.minPrice);
        }
        
        return meals;
    },

    async getMeal(id) {
        await delay(400);
        const meal = mockMeals.find(m => m.id === parseInt(id));
        if (meal) {
            return meal;
        }
        throw new Error('Meal not found');
    },

    async createMeal(mealData) {
        await delay(800);
        const newMeal = {
            id: mockMeals.length + 1,
            ...mealData,
            vendor_id: 2,
            vendor_name: 'Tasty Bites Restaurant',
            vendor_address: '456 Food Street, Lagos',
            imageUrl: '🍽️',
            rating: 0,
            reviewCount: 0,
            created_at: new Date().toISOString()
        };
        mockMeals.push(newMeal);
        return { success: true, meal: newMeal };
    },

    // Orders
    async getConsumerOrders(userId) {
        await delay(500);
        return mockOrders.filter(o => o.consumer_id === userId);
    },

    async getVendorOrders(vendorId) {
        await delay(500);
        return mockVendorOrders;
    },

    async createOrder(orderData) {
        await delay(1000);
        const meal = mockMeals.find(m => m.id === orderData.mealId);
        const newOrder = {
            id: mockOrders.length + 1,
            consumer_id: 1,
            meal_id: orderData.mealId,
            meal_name: meal.name,
            quantity: orderData.quantity,
            total_amount: meal.discountedPrice * orderData.quantity,
            status: 'pending',
            payment_method: orderData.paymentMethod,
            created_at: new Date().toISOString(),
            vendor_name: meal.vendor_name
        };
        mockOrders.push(newOrder);
        mockVendorOrders.push({
            ...newOrder,
            consumer_name: 'John Doe',
            consumer_phone: '+234 123 456 7890'
        });
        return { success: true, order: newOrder };
    },

    async updateOrderStatus(orderId, status) {
        await delay(600);
        const order = mockOrders.find(o => o.id === orderId);
        const vendorOrder = mockVendorOrders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
        }
        if (vendorOrder) {
            vendorOrder.status = status;
        }
        return { success: true };
    },

    // Reviews
    async getMealReviews(mealId) {
        await delay(400);
        return mockReviews.filter(r => r.meal_id === parseInt(mealId));
    },

    async createReview(reviewData) {
        await delay(800);
        const newReview = {
            id: mockReviews.length + 1,
            ...reviewData,
            consumer_name: 'John Doe',
            created_at: new Date().toISOString()
        };
        mockReviews.push(newReview);
        return { success: true, review: newReview };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockAPI, mockUsers, mockMeals, mockOrders };
}

