import adminRoutes from './routes/adminRoutes.js';
import express from 'express';
import http from 'http';
const app = express();
const server = http.createServer(app);

import routes from './routes/routes.js';

app.use('/admin', adminRoutes);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin Panel running on http://localhost:${PORT}/admin`);
});
