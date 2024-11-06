const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const APP_NAME = 'AI Chatbot';
const SITE_URL = 'https://stackblitz.com';

export async function getAIResponse(messages: { role: string; content: string }[]) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': APP_NAME,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages: messages.map(msg => ({
          role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response:', data);
      throw new Error('Invalid API response format');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get AI response');
  }
}