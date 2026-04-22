/**
 * Reference server for 100ms room + app tokens.
 * Mount behind HTTPS in production. Point the app BASE_URL to your PHP API
 * and implement the same contract there, or proxy /api/hms-calls to this process.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {randomUUID} = require('crypto');

const app = express();
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
  }),
);
app.use(express.json());
const api = express.Router();

const HMS_API = 'https://api.100ms.live';
const appAccessKey = process.env.HMS_APP_ACCESS_KEY;
const appSecret = process.env.HMS_APP_SECRET;
const templateId = process.env.HMS_TEMPLATE_ID;

function requireEnv() {
  if (!appAccessKey || !appSecret || !templateId) {
    console.error('Missing HMS_APP_ACCESS_KEY, HMS_APP_SECRET, or HMS_TEMPLATE_ID');
    process.exit(1);
  }
}

function managementToken() {
  const payload = {
    access_key: appAccessKey,
    type: 'management',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    jti: randomUUID(),
  };
  return jwt.sign(payload, appSecret, {algorithm: 'HS256', noTimestamp: true});
}

/**
 * @param {string} roomId
 * @param {string} userId
 * @param {string} role host | guest
 */
function appToken(roomId, userId, role) {
  const payload = {
    access_key: appAccessKey,
    room_id: roomId,
    user_id: String(userId).slice(0, 256),
    role,
    type: 'app',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
    jti: randomUUID(),
  };
  return jwt.sign(payload, appSecret, {algorithm: 'HS256', noTimestamp: true});
}

async function createRoom(name) {
  const token = managementToken();
  const {data} = await axios.post(
    `${HMS_API}/v2/rooms`,
    {
      name: name || `call-${Date.now()}`,
      template_id: templateId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return data;
}

/**
 * POST /api/hms-calls/start — matches app BASE_URL ending in /api + path /hms-calls/start
 * body: { chat_id, caller_id, receiver_id, call_type: 'video' | 'audio' }
 */
api.post('/hms-calls/start', async (req, res) => {
  try {
    requireEnv();
    const {caller_id, receiver_id, call_type} = req.body || {};
    if (caller_id == null || receiver_id == null) {
      return res.status(400).json({status: false, message: 'caller_id and receiver_id required'});
    }
    const room = await createRoom(`chat-${req.body?.chat_id || 'unknown'}-${Date.now()}`);
    const roomId = room.id;
    const callId = randomUUID();
    const uidCaller = `u_${String(caller_id)}`;
    const uidReceiver = `u_${String(receiver_id)}`;
    const callerToken = appToken(roomId, uidCaller, 'host');
    const calleeToken = appToken(roomId, uidReceiver, 'guest');
    return res.json({
      status: true,
      data: {
        call_id: callId,
        room_id: roomId,
        caller_token: callerToken,
        callee_token: calleeToken,
        call_type: call_type === 'audio' ? 'audio' : 'video',
      },
    });
  } catch (e) {
    console.error('hms-calls/start', e?.response?.data || e);
    return res.status(500).json({
      status: false,
      message: e?.response?.data?.message || e?.message || 'Failed to start call',
    });
  }
});

app.use('/api', api);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(
    `HMS reference: http://localhost:${port}/api/hms-calls/start — set app BASE_URL to http://<host>:${port}/api for local dev`,
  );
});
