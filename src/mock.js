import { setupWorker } from 'msw/browser';
import { getSwaggerMockMissingEndpointsMock } from './api/endpoints/swaggerMockMissingEndpoints.msw';

const handlers = [...getSwaggerMockMissingEndpointsMock()];
const worker = setupWorker(...handlers);

export default worker
