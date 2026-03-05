import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

async function bootstrap() {
  await tf.setBackend('webgl');
  await tf.ready();

  // Angular bootstrap continues...
  bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
}

bootstrap();
