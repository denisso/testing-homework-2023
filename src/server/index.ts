import express from 'express';
import { router } from './routes';
import cors from 'cors';

const port = Number(process.env.PORT) || 3000;
const basename = '/hw/store';

const app = express();

app.use(cors());
app.use(express.json());
app.use(basename, router);
app.use(basename, express.static('dist'));

app.listen(port, '::', () => {
    console.log(`Example app listening at http://localhost:${port}${basename}`);
});