export default {
    DB_CLIENT: process.env.DB_CLIENT,
    PORT: process.env.PORT || 3001,
    DB_URI: process.env.DB_URI || 'postgres://testuser:testpass@localhost:5432/test',
    DB_CONNECTION: process.env.DB_CONNECTION || 'postgres://testuser:testpass@localhost:5432/test',
    QM_USER: process.env.QM_USER || 'admin',
    QM_PASSWORD: process.env.QM_PASSWORD || 'password',
    QM_EMAIL: process.env.QM_EMAIL || 'abc@abc.com',
    QM_PHONE: process.env.QM_PHONE || '1234567',
    JWT_SECRET: process.env.JWT_SECRET
}