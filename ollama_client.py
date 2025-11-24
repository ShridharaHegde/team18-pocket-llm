from ollama import generate, chat

class OllamaClient:
    def __init__(self, model: str):
        self.model = model

    def get_single_response(self, prompt: str) -> str:

        response = generate(model=self.model, prompt=prompt)
        return response['response']
    
    def get_chat_response(self, messages: list) -> str:
        response = chat(model=self.model, messages=messages)
        # The ollama library returns a dict with 'message' key containing the response
        if isinstance(response, dict):
            # Most common structure: {'message': {'content': '...', 'role': 'assistant'}}
            if 'message' in response:
                message = response['message']
                if isinstance(message, dict) and 'content' in message:
                    return message['content']
                elif isinstance(message, str):
                    return message
            # Alternative structure: direct 'content' or 'response' key
            elif 'content' in response:
                return response['content']
            elif 'response' in response:
                return response['response']
            else:
                raise ValueError(f"Unexpected response structure: {response}")
        else:
            # Handle object response (if it's an object with message attribute)
            return response.message.content