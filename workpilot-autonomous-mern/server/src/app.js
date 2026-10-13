import {portal} from './operator/portal.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
export const app=express();app.use(helmet());app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));app.use(express.json({limit:'100kb'}));app.use('/sandbox',portal);app.use('/api',rateLimit({windowMs:60_000,limit:120}),routes);app.get('/health',(_req,res)=>res.json({ok:true}));app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'});});
