const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn(() => mockResponse),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    test('should return 401 if no token is provided', () => {
        mockRequest.headers = {};
        authenticateToken(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access token required' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 if token is invalid', () => {
        mockRequest.headers = { authorization: 'Bearer invalidtoken' };
        authenticateToken(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should call next() if token is valid', () => {
        const user = { userId: 1, userType: 'consumer' };
        const token = jwt.sign(user, process.env.JWT_SECRET);
        mockRequest.headers = { authorization: `Bearer ${token}` };
        authenticateToken(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user.userId).toBe(user.userId);
    });
});
