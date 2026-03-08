import { Request, Response, Headers, fetch } from "undici";

(globalThis as any).Request = Request;
(globalThis as any).Response = Response;
(globalThis as any).Headers = Headers;
(globalThis as any).fetch = fetch;
