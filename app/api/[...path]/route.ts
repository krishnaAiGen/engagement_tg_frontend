// API Proxy Route - handles all /api/* requests and forwards them to the backend
// This solves the mixed content issue by proxying HTTP backend calls through HTTPS frontend

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';

// Helper function to construct the target URL
function buildTargetUrl(path: string[], searchParams?: string): string {
  const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const pathString = path.join('/');
  const fullPath = pathString.startsWith('/') ? pathString : `/${pathString}`;
  // Don't add /api prefix since the backend expects direct paths like /auth/login
  return `${baseUrl}${fullPath}${searchParams ? `?${searchParams}` : ''}`;
}

// Helper function to forward headers (excluding problematic ones)
function getForwardHeaders(request: Request): HeadersInit {
  const headers: HeadersInit = {};
  
  // Forward important headers
  const headersToForward = [
    'authorization',
    'content-type',
    'accept',
    'user-agent',
  ];

  headersToForward.forEach(headerName => {
    const value = request.headers.get(headerName);
    if (value) {
      headers[headerName] = value;
    }
  });

  return headers;
}

// Helper function to handle the response
async function handleResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get('content-type');
  
  // Create new headers without problematic CORS headers
  const responseHeaders = new Headers();
  
  // Copy safe headers
  const safeToCopy = [
    'content-type',
    'content-length',
    'cache-control',
    'expires',
    'last-modified',
    'etag',
  ];

  safeToCopy.forEach(headerName => {
    const value = response.headers.get(headerName);
    if (value) {
      responseHeaders.set(headerName, value);
    }
  });

  // Add CORS headers for browser compatibility
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle different response types
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } else {
    const data = await response.arrayBuffer();
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  }
}

// GET requests
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const url = new URL(request.url);
    const targetUrl = buildTargetUrl(resolvedParams.path, url.search.substring(1));
    
    console.log(`[API Proxy] GET ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getForwardHeaders(request),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('[API Proxy] GET Error:', error);
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// POST requests
export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const targetUrl = buildTargetUrl(resolvedParams.path);
    const body = await request.text();
    
    console.log(`[API Proxy] POST - Path: [${resolvedParams.path.join(', ')}] -> ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: getForwardHeaders(request),
      body: body || undefined,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('[API Proxy] POST Error:', error);
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// PUT requests
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const targetUrl = buildTargetUrl(resolvedParams.path);
    const body = await request.text();
    
    console.log(`[API Proxy] PUT ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: getForwardHeaders(request),
      body: body || undefined,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('[API Proxy] PUT Error:', error);
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// DELETE requests
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const targetUrl = buildTargetUrl(resolvedParams.path);
    
    console.log(`[API Proxy] DELETE ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: getForwardHeaders(request),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('[API Proxy] DELETE Error:', error);
    return new Response(
      JSON.stringify({ detail: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// OPTIONS requests (for CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
