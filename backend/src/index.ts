import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_, res) => res.send('JeevanPath API'));
app.use('/api', apiRouter);

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API running on :${PORT}`));
  })
  .catch((e) => {
    console.error('Mongo connection error', e);
    process.exit(1);
  });






