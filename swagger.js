import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'Description'
  },
  host: 'localhost:3001',
   schemes: ['http', 'https'],
   tags: [
    { name: 'Auth', description: 'Authentication routes' },
    { name: 'Product', description: 'Product routes' },
    { name: 'Order', description: 'Order routes' },
    { name: 'Event', description: 'Event routes' }
  ]
};

const outputFile = './swagger-output.json';
const routes = ['./index.js'];




swaggerAutogen(outputFile, routes,doc).then(() => {
  import('./index.js'); // server start
});