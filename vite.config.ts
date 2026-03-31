import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';


const youtubeTranscriptPlugin = () => ({
  name: 'youtube-transcript',
  configureServer(server: any) {
    server.middlewares.use('/api/transcript', async (req: any, res: any) => {
      try {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const videoUrl = url.searchParams.get('url');
        if (!videoUrl) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing url parameter' }));
        }
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        const fullText = transcript.map(t => t.text).join(' ');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ text: fullText }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), youtubeTranscriptPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
