import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as multer from 'multer';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import routes from './api/routes';

const port = process.env.PORT || 8081;

// Connects to the Database -> then starts the express.
createConnection()
  .then(async connection => {
    const blogApi = express();
    const upload = multer();

    // Call middlewares
    blogApi.use(cors());
    blogApi.use(helmet());
    blogApi.use(bodyParser.urlencoded({ extended: true }));
    blogApi.use(bodyParser.json());
    blogApi.use(upload.single('file'));
    blogApi.use(express.static('public'));

    // Set all routes from routes folder.
    blogApi.use('/v1', routes);

    blogApi.listen(port, () => {
      console.log(`Server started on port ${port}!`);
    });
  })
  .catch(error => console.log(error));
