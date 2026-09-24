export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ status: 'error', message: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  return {
    statusCode: 303,
    headers: {
      Location: '/submitted.html',
      'Content-Type': 'text/html',
    },
    body: '',
  };
}
