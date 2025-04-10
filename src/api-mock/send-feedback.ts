
// This is a mock API handler that would typically be implemented as a serverless function
// In a real application, this would be replaced with an actual backend service

export async function sendFeedback(data: {
  name: string;
  email: string;
  feedback: string;
}) {
  // This is where you would normally send an email to the specified address
  // Since we want to hide the email, we're handling this server-side
  
  console.log('Feedback received:', data);
  
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would send an email to robby72174@gmail.com
  // but the email is kept server-side and not exposed to the frontend
  
  return { success: true };
}

// This function would be used in a serverless function or backend API route
// POST /api/send-feedback
export async function handleSendFeedback(request: Request) {
  const data = await request.json();
  await sendFeedback(data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
