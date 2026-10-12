# Pet Fortune Cookie
A calm little web app: your pet hands you a fortune cookie. No login. Pets are saved in your browser only.

## Run it
```bash
cp .env.example server/.env   # add your ANTHROPIC_API_KEY
cd server && npm install && npm start      # http://localhost:3001
cd client && npm install && npm run dev    # http://localhost:5173
```
Edit the voice in `server/src/prompts/fortuneSystemPrompt.txt`.
