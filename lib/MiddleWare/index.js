const middy = require('middy');
const {
  jsonBodyParser,
  httpErrorHandler,
  httpHeaderNormalizer,
  cors,
} = require('middy/middlewares');

const convertHandler = require('./converHandler');
const SeaoilCors = require('../CORS/SeaoilCors');

const { ALLOWED_ORIGINS, DEPLOYMENT_STAGE: stage } = process.env;

function middyMiddleware(handler) {
  const customCors = new SeaoilCors({
    isDev: (stage === 'dev' || stage === 'test'),
    origins: ALLOWED_ORIGINS,
  });
  const middleware = middy(handler);
  middleware
    .use(httpHeaderNormalizer())
    .use(jsonBodyParser())
    .use(httpErrorHandler())
    .use(cors({
      origins: customCors.origins,
      credentials: true,
    }))
    .use(convertHandler());

  return middleware;
}

module.exports = middyMiddleware;
