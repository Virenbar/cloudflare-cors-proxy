/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Environment {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	CORS: KVNamespace;
}

// Reference: https://developers.cloudflare.com/workers/examples/cors-header-proxy
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
};
function handleOptions(request: Request) {
	const headers = request.headers;
	if (
		headers.get("Origin") !== null &&
		headers.get("Access-Control-Request-Method") !== null &&
		headers.get("Access-Control-Request-Headers") !== null
	) {
		const respHeaders = {
			...corsHeaders,
			"Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") as string
		};
		return new Response(null, { headers: respHeaders });
	} else {
		return new Response(null, { headers: { Allow: "GET, HEAD, POST, OPTIONS" } });
	}
}

async function handleRequest(request: Request) {
	const origin = request.headers.get("Origin") as string;
	const url = new URL(request.url);
	const target = url.searchParams.get("url");
	if (target == null) { return Teapot(); }

	request = new Request(target, request);
	request.headers.set("Origin", new URL(target).origin);

	let response = await fetch(request);
	response = new Response(response.body, response);
	response.headers.set("Access-Control-Allow-Origin", origin);
	//response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	response.headers.append("Vary", "Origin");

	return response;
}

/**
 * 
 * @returns 
 */
function Teapot() {
	return new Response(null, {
		status: 418,
		statusText: "I'm a teapot"
	});
}

export default {
	async fetch(request: Request, env: Environment): Promise<Response> {
		const origin = request.headers.get("Origin");
		const wl_str = await env.CORS.get("whitelist") as string;
		const whitelist = JSON.parse(wl_str) as string[];

		if (origin && whitelist.some(w => origin.match(w))) {
			if (request.method === "OPTIONS") {
				return handleOptions(request);
			} else if (
				request.method === "HEAD" ||
				request.method === "GET" ||
				request.method === "POST"
			) {
				return handleRequest(request);
			}
		}
		return Teapot();
	}
};
