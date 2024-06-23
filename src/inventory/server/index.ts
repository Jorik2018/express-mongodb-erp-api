import express, {Express} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { router } from './v1/routes';
import morgan from 'morgan';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.use(router);

function startServices(){
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
      });
}

export {
    startServices
}