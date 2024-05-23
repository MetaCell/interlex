import { setupWorker } from 'msw/browser';
import { getSwaggerMockMissingEndpointsMock } from './api/endpoints/swaggerMockMissingEndpoints.msw';
import { getInterLexURIStructureAPIMock } from './api/endpoints/interLexURIStructureAPI.msw';

const handlers = [...getSwaggerMockMissingEndpointsMock(), ...getInterLexURIStructureAPIMock()];
console.log("Handlers ", handlers)
const worker = setupWorker(...handlers);

export default worker