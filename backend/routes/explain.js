// import { Configuration, OpenAIApi } from 'openai';
// import express from 'express';
// import dotenv from 'dotenv';

// dotenv.config();

// const router = express.Router();

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

// router.post('/', async (req, res) => {
//   const { code } = req.body;

//   if (!code) {
//     return res.status(400).json({ success: false, error: 'No code provided' });
//   }

//   try {
//     const completion = await openai.createChatCompletion({
//       model: 'gpt-3.5-turbo',
//       messages: [
//         { role: 'system', content: 'You are a code explainer. Explain the following code simply.' },
//         { role: 'user', content: code }
//       ],
//     });

//     const explanation = completion.data.choices[0].message.content;
//     res.json({ explanation });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to explain code.' });
//   }
// });

// export default router;

import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// 🔁 Retry logic with exponential backoff
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callWithRetry(apiCall, retries = 3) {
  try {
    return await apiCall();
  } catch (err) {
    if (retries > 0 && err.response?.status === 429) {
      const wait = 1000 * Math.pow(2, 3 - retries); // Exponential backoff: 1000, 2000, 4000ms
      console.warn(`Rate limited. Retrying in ${wait} ms...`);
      await delay(wait);
      return callWithRetry(apiCall, retries - 1);
    }
    throw err;
  }
}

router.post('/', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'No code provided' });
  }

  try {
    const completion = await callWithRetry(() =>
      openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a code explainer. Explain the following code simply.' },
          { role: 'user', content: code },
        ],
      })
    );

    const explanation = completion.data.choices[0].message.content;
    res.json({ explanation });
  } catch (err) {
    console.error('OpenAI API failed:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to explain code. Please try again later.' });
  }
});

export default router;
