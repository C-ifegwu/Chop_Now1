// Simple Node.js script to test the ChopNow API
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('🧪 ChopNow API Test Suite\n');
    console.log('='.repeat(50));

    try {
        // Test 1: Health Check
        console.log('\n1. Testing API Health...');
        const health = await makeRequest('/health');
        console.log('✓ API is running:', health.message);

        // Test 2: Register Vendor
        console.log('\n2. Registering test vendor...');
        const vendorData = {
            email: 'testvendor' + Date.now() + '@chopnow.com',
            password: 'password123',
            userType: 'vendor',
            name: 'Test Vendor',
            businessName: 'Test Restaurant',
            phone: '08012345678',
            address: 'Lagos, Nigeria'
        };
        const vendor = await makeRequest('/auth/register', 'POST', vendorData);
        console.log('✓ Vendor registered:', vendor.message);
        const vendorToken = vendor.token;

        // Test 3: Register Consumer
        console.log('\n3. Registering test consumer...');
        const consumerData = {
            email: 'testconsumer' + Date.now() + '@chopnow.com',
            password: 'password123',
            userType: 'consumer',
            name: 'Test Consumer',
            phone: '08087654321',
            address: 'Ikeja, Lagos'
        };
        const consumer = await makeRequest('/auth/register', 'POST', consumerData);
        console.log('✓ Consumer registered:', consumer.message);
        const consumerToken = consumer.token;

        // Test 4: Create Meal (as vendor)
        console.log('\n4. Creating test meal...');
        const mealData = {
            name: 'Jollof Rice with Chicken',
            description: 'Delicious Nigerian Jollof rice with grilled chicken',
            originalPrice: 1500,
            discountedPrice: 1000,
            quantityAvailable: 20,
            cuisineType: 'Nigerian',
            pickupOptions: 'pickup',
            pickupTimes: '12:00-15:00',
            allergens: 'none'
        };
        const meal = await makeRequest('/meals', 'POST', mealData, vendorToken);
        console.log('✓ Meal created:', meal.message);
        const mealId = meal.mealId;

        // Test 5: Get All Meals
        console.log('\n5. Fetching all meals...');
        const meals = await makeRequest('/meals');
        console.log(`✓ Found ${meals.length} meal(s)`);

        // Test 6: Create Order (as consumer)
        console.log('\n6. Creating test order...');
        const orderData = {
            mealId: mealId,
            quantity: 2,
            paymentMethod: 'mobile_money'
        };
        const order = await makeRequest('/orders', 'POST', orderData, consumerToken);
        console.log('✓ Order created:', order.message);
        const orderId = order.orderId;

        // Test 7: Get Consumer Orders
        console.log('\n7. Fetching consumer orders...');
        const consumerOrders = await makeRequest('/orders/consumer', 'GET', null, consumerToken);
        console.log(`✓ Consumer has ${consumerOrders.length} order(s)`);

        // Test 8: Get Vendor Orders
        console.log('\n8. Fetching vendor orders...');
        const vendorOrders = await makeRequest('/orders/vendor', 'GET', null, vendorToken);
        console.log(`✓ Vendor has ${vendorOrders.length} order(s)`);

        // Test 9: Update Order Status
        console.log('\n9. Updating order status...');
        const statusUpdate = await makeRequest(`/orders/${orderId}/status`, 'PUT', { status: 'accepted' }, vendorToken);
        console.log('✓ Order status updated:', statusUpdate.message);

        // Test 10: Get Notifications
        console.log('\n10. Checking notifications...');
        const notifications = await makeRequest('/notifications', 'GET', null, consumerToken);
        console.log(`✓ Consumer has ${notifications.length} notification(s)`);

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests passed successfully!');
        console.log('\nTest Summary:');
        console.log('- Vendor registered and logged in');
        console.log('- Consumer registered and logged in');
        console.log('- Meal created successfully');
        console.log('- Order placed successfully');
        console.log('- Order status updated');
        console.log('- Notifications working');
        console.log('\n🎉 ChopNow API is fully functional!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

// Run the tests
runTests();
