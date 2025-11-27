
const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function checkUser(email, password) {
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            console.log('User not found in database.');
            return;
        }

        console.log('User found:');
        console.log(`Email: ${user.email}`);
        console.log(`Stored Hashed Password: ${user.password}`);

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (isValidPassword) {
            console.log('Provided password MATCHES stored password.');
        } else {
            console.log('Provided password DOES NOT MATCH stored password.');
        }

    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        // Ensure the database connection is closed after the check
        await db.close();
    }
}

const email = 'Ifegwuchibuezevictor@gmail.com';
const password = '12345678';

checkUser(email, password);
