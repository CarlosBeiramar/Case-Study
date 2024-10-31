import express from 'express';
import bodyParser from 'body-parser';
import courseRoutes from './routes/courseRoutes';
import { swaggerDocs, swaggerUi } from './swagger';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(bodyParser.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(apiLimiter);
app.use('/api/courses', courseRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default app;
