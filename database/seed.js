const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');
    
    try {
        // Wait for database to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if data already exists
        const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
        if (existingUsers.count > 0) {
            console.log('📊 Database already contains data. Skipping seed.');
            return;
        }

        console.log('👥 Creating sample users...');
        
        // Create sample vendors
        const vendors = [
            {
                email: 'mama.kitchen@example.com',
                password: await bcrypt.hash('password123', 12),
                user_type: 'vendor',
                name: 'Mama Grace',
                phone: '+234-801-234-5678',
                business_name: 'Mama Grace Kitchen',
                address: '123 Lagos Street, Victoria Island, Lagos',
                business_type: 'restaurant',
                cuisine_type: 'african',
                operating_hours: '8:00 AM - 10:00 PM',
            },
            {
                email: 'sunrise.bakery@example.com',
                password: await bcrypt.hash('password123', 12),
                user_type: 'vendor',
                name: 'John Okafor',
                phone: '+234-802-345-6789',
                business_name: 'Sunrise Bakery',
                address: '456 Abuja Road, Garki, Abuja',
                business_type: 'bakery',
                cuisine_type: 'mixed',
                operating_hours: '6:00 AM - 8:00 PM',
            },
            {
                email: 'spice.garden@example.com',
                password: await bcrypt.hash('password123', 12),
                user_type: 'vendor',
                name: 'Fatima Ahmed',
                phone: '+234-803-456-7890',
                business_name: 'Spice Garden Restaurant',
                address: '789 Kano Street, Sabon Gari, Kano',
                business_type: 'restaurant',
                cuisine_type: 'indian',
                operating_hours: '11:00 AM - 11:00 PM',
            }
        ];

        const vendorIds = [];
        for (const vendor of vendors) {
            const result = await db.run(`
                INSERT INTO users (
                    email, password, user_type, name, phone, business_name, 
                    address, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                vendor.email, vendor.password, vendor.user_type, vendor.name, vendor.phone,
                vendor.business_name, vendor.address
            ]);
            vendorIds.push(result.lastID);
        }

        // Create sample consumers
        const consumers = [
            {
                email: 'student@example.com',
                password: await bcrypt.hash('password123', 12),
                user_type: 'consumer',
                name: 'Chioma Okwu',
                phone: '+234-804-567-8901',
                is_verified: 1
            },
            {
                email: 'worker@example.com',
                password: await bcrypt.hash('password123', 12),
                user_type: 'consumer',
                name: 'Emeka Nwankwo',
                phone: '+234-805-678-9012',
                is_verified: 1
            }
        ];

        const consumerIds = [];
        for (const consumer of consumers) {
            const result = await db.run(`
                INSERT INTO users (
                    email, password, user_type, name, phone, is_verified, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                consumer.email, consumer.password, consumer.user_type,
                consumer.name, consumer.phone, consumer.is_verified
            ]);
            consumerIds.push(result.lastID);
        }

        console.log('🍽️ Creating sample meals...');

        // Create sample meals
        const meals = [
            // Mama Grace Kitchen meals
            {
                vendor_id: vendorIds[0],
                name: 'Jollof Rice with Grilled Chicken',
                description: 'Authentic Nigerian jollof rice served with perfectly grilled chicken and plantain. A hearty meal that will satisfy your cravings!',
                original_price: 15.00,
                discounted_price: 10.50,
                quantity_available: 8,
                cuisine_type: 'african',
                pickup_options: 'pickup',
                pickup_times: '{"start": "12:00", "end": "15:00"}',
                allergens: '[]',
                is_available: 1
            },
            {
                vendor_id: vendorIds[0],
                name: 'Pepper Soup with Catfish',
                description: 'Spicy and aromatic pepper soup with fresh catfish. Perfect for a warm, comforting meal.',
                original_price: 12.00,
                discounted_price: 8.40,
                quantity_available: 5,
                cuisine_type: 'african',
                pickup_options: 'pickup',
                pickup_times: '{"start": "17:00", "end": "20:00"}',
                allergens: '["fish"]',
                is_available: 1
            },
            // Sunrise Bakery meals
            {
                vendor_id: vendorIds[1],
                name: 'Fresh Meat Pie (6 pieces)',
                description: 'Freshly baked meat pies with seasoned beef filling. Perfect for breakfast or snack time.',
                original_price: 8.00,
                discounted_price: 6.00,
                quantity_available: 12,
                cuisine_type: 'mixed',
                pickup_options: 'pickup',
                pickup_times: '{"start": "07:00", "end": "18:00"}',
                allergens: '["gluten", "eggs"]',
                is_available: 1
            },
            {
                vendor_id: vendorIds[1],
                name: 'Chocolate Cake Slice',
                description: 'Rich and moist chocolate cake slice with chocolate frosting. A sweet treat to end your day!',
                original_price: 5.00,
                discounted_price: 3.50,
                quantity_available: 8,
                cuisine_type: 'mixed',
                pickup_options: 'pickup',
                pickup_times: '{"start": "10:00", "end": "19:00"}',
                allergens: '["gluten", "dairy", "eggs"]',
                is_available: 1
            },
            // Spice Garden meals
            {
                vendor_id: vendorIds[2],
                name: 'Chicken Biryani',
                description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices. Served with raita and pickle.',
                original_price: 18.00,
                discounted_price: 12.60,
                quantity_available: 6,
                cuisine_type: 'indian',
                pickup_options: 'pickup',
                pickup_times: '{"start": "12:00", "end": "16:00"}',
                allergens: '["dairy"]',
                is_available: 1
            },
            {
                vendor_id: vendorIds[2],
                name: 'Vegetable Samosas (4 pieces)',
                description: 'Crispy pastry filled with spiced vegetables. A perfect vegetarian snack or appetizer.',
                original_price: 6.00,
                discounted_price: 4.20,
                quantity_available: 15,
                cuisine_type: 'indian',
                pickup_options: 'pickup',
                pickup_times: '{"start": "11:00", "end": "21:00"}',
                allergens: '["gluten"]',
                is_available: 1
            }
        ];

        const mealIds = [];
        for (const meal of meals) {
            const result = await db.run(`
                INSERT INTO meals (
                    vendor_id, name, description, original_price, discounted_price,
                    quantity_available, cuisine_type, pickup_options, pickup_times,
                    allergens, is_available, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                meal.vendor_id, meal.name, meal.description, meal.original_price,
                meal.discounted_price, meal.quantity_available, meal.cuisine_type,
                meal.pickup_options, meal.pickup_times, meal.allergens, meal.is_available
            ]);
            mealIds.push(result.lastID);
        }

        console.log('📦 Creating sample orders...');

        // Create sample orders
        const orders = [
            {
                consumer_id: consumerIds[0],
                vendor_id: vendorIds[0],
                total_amount: 10.50,
                platform_fee: 0.53,
                status: 'completed',
                pickup_address: '123 Lagos Street, Victoria Island, Lagos',
                payment_method: 'mobile_money',
                payment_status: 'completed'
            },
            {
                consumer_id: consumerIds[1],
                vendor_id: vendorIds[1],
                total_amount: 6.00,
                platform_fee: 0.30,
                status: 'ready',
                pickup_address: '456 Abuja Road, Garki, Abuja',
                payment_method: 'card',
                payment_status: 'completed'
            }
        ];

        const orderIds = [];
        for (const order of orders) {
            const result = await db.run(`
                INSERT INTO orders (
                    consumer_id, vendor_id, total_amount, status, created_at
                ) VALUES (?, ?, ?, ?, datetime('now', '-2 days'))
            `, [
                order.consumer_id, order.vendor_id, order.total_amount, order.status
            ]);
            orderIds.push(result.lastID);
        }

        // Create order items
        const orderItems = [
            {
                order_id: orderIds[0],
                meal_id: mealIds[0],
                quantity: 1,
                unit_price: 10.50,
                total_price: 10.50,
                meal_name: 'Jollof Rice with Grilled Chicken',
                meal_description: 'Authentic Nigerian jollof rice served with perfectly grilled chicken and plantain.'
            },
            {
                order_id: orderIds[1],
                meal_id: mealIds[2],
                quantity: 1,
                unit_price: 6.00,
                total_price: 6.00,
                meal_name: 'Fresh Meat Pie (6 pieces)',
                meal_description: 'Freshly baked meat pies with seasoned beef filling.'
            }
        ];

        for (const item of orderItems) {
            await db.run(`
                INSERT INTO order_items (
                    order_id, meal_id, quantity, price
                ) VALUES (?, ?, ?, ?)
            `, [
                item.order_id, item.meal_id, item.quantity, item.total_price
            ]);
        }

        console.log('⭐ Creating sample reviews...');

        // Create sample reviews
        const reviews = [
            {
                consumer_id: consumerIds[0],
                order_id: orderIds[0],
                meal_id: mealIds[0],
                vendor_id: vendorIds[0],
                rating: 5,
                comment: 'Amazing jollof rice! The chicken was perfectly grilled and the rice had the perfect spice level. Will definitely order again!',
                is_approved: 1
            },
            {
                consumer_id: consumerIds[1],
                order_id: orderIds[1],
                meal_id: mealIds[2],
                vendor_id: vendorIds[1],
                rating: 4,
                comment: 'Great meat pies! Fresh and tasty. The crust was perfectly flaky. Good value for money.',
                is_approved: 1
            }
        ];

        for (const review of reviews) {
            await db.run(`
                INSERT INTO reviews (
                    consumer_id, meal_id, rating, comment, created_at
                ) VALUES (?, ?, ?, ?, datetime('now', '-1 day'))
            `, [
                review.consumer_id, review.meal_id, review.rating, review.comment
            ]);
        }

        console.log('🔔 Creating sample notifications...');

        // Create sample notifications
        const notifications = [
            {
                user_id: vendorIds[0],
                type: 'order_placed',
                title: 'New Order Received',
                message: 'You have received a new order for Jollof Rice with Grilled Chicken',
                related_order_id: orderIds[0],
                is_read: 1
            },
            {
                user_id: consumerIds[0],
                type: 'order_completed',
                title: 'Order Completed',
                message: 'Your order has been completed. Thank you for choosing ChopNow!',
                related_order_id: orderIds[0],
                is_read: 1
            },
            {
                user_id: consumerIds[1],
                type: 'order_ready',
                title: 'Order Ready for Pickup',
                message: 'Your meat pies are ready for pickup at Sunrise Bakery',
                related_order_id: orderIds[1],
                is_read: 0
            }
        ];

        for (const notification of notifications) {
            await db.run(`
                INSERT INTO notifications (
                    user_id, type, title, message, is_read, created_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now', '-1 hour'))
            `, [
                notification.user_id, notification.type, notification.title,
                notification.message, notification.is_read
            ]);
        }

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Sample Data Created:');
        console.log(`   👥 Users: ${vendors.length + consumers.length} (${vendors.length} vendors, ${consumers.length} consumers)`);
        console.log(`   🍽️ Meals: ${meals.length}`);
        console.log(`   📦 Orders: ${orders.length}`);
        console.log(`   ⭐ Reviews: ${reviews.length}`);
        console.log(`   🔔 Notifications: ${notifications.length}`);
        
        console.log('\n🔐 Sample Login Credentials:');
        console.log('   Vendors:');
        console.log('   - mama.kitchen@example.com / password123');
        console.log('   - sunrise.bakery@example.com / password123');
        console.log('   - spice.garden@example.com / password123');
        console.log('   Consumers:');
        console.log('   - student@example.com / password123');
        console.log('   - worker@example.com / password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('🎉 Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedDatabase;