/**
 * Socket.IO client for real-time chat
 * Simple implementation based on working GoodEye pattern
 */
import io from 'socket.io-client';
import {SOCKET_URL} from '../config/socket';

class ChatSocket {
  socket: any = null;
  isConnected: boolean = false;
  userId: string | null = null;
  private lastNonPollingErrorAt: number | null = null;

  /**
   * Connect to the socket server
   * @param {string} userId - Current user ID
   * @param {string} authToken - Authentication token
   */
  connect(userId: string, authToken?: string) {
    // If a socket already exists for this user (connected or still connecting),
    // do not create another io() client — that was flooding Metro / JS thread.
    if (this.socket && this.userId === userId) {
      if (__DEV__) {
        console.log(
          '[Socket] Already have socket for user',
          userId,
          this.isConnected || this.socket.connected ? '(connected)' : '(connecting)',
        );
      }
      return;
    }

    // Disconnect previous socket before creating a new one
    if (this.socket) {
      if (__DEV__) {
        console.log('[Socket] Replacing existing socket for user switch/reconnect');
      }
      this.disconnect();
    }

    this.userId = userId;

    if (__DEV__) {
      console.log('[Socket] Connecting to:', SOCKET_URL, 'user:', userId);
    }

    try {
      // Create socket connection - mirror simple working pattern from BroadcastMessages
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Websocket first, polling as fallback
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        // Pass token using both query and auth (common socket.io patterns)
        ...(authToken && {
          query: {
            token: authToken,
          },
          auth: {
            token: authToken,
          },
        }),
      });

      // Setup connection event listeners
      this.setupConnectionListeners();

      // Log all events for debugging (dev only — floods JS thread in production)
      if (__DEV__) {
        this.socket.onAny((eventName: string, ...args: any[]) => {
          console.log('[Socket] Event:', eventName, args?.[0]);
        });
      }
    } catch (error) {
      console.error('[Socket] Failed to create connection:', error);
      throw error;
    }
  }

  /**
   * Setup connection event listeners
   */
  setupConnectionListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[Socket] ✅ Connected! ID:', this.socket.id);
      console.log('[Socket] ✅ Transport:', this.socket.io.engine.transport.name);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.isConnected = false;
      console.log('[Socket] ❌ Disconnected:', reason);

      if (reason === 'io server disconnect') {
        console.log('[Socket] 🔄 Server disconnected, reconnecting...');
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      // Socket.IO often reports transient "xhr poll error" while upgrading transports.
      // This is noisy in React Native dev (red error screens) even though the socket
      // can still successfully connect or reconnect over websocket.
      if (error?.message === 'xhr poll error') {
        console.log(
          '[Socket] ⚠️ Polling transport error (non-fatal, ignoring):',
          error.message,
        );
        return;
      }

      // Throttle logging of other connection errors to avoid noisy spam
      const now = Date.now();
      if (!this.lastNonPollingErrorAt || now - this.lastNonPollingErrorAt > 5000) {
        this.lastNonPollingErrorAt = now;
        console.error('[Socket] ❌ Connection error:', error.message);
      } else {
        console.log(
          '[Socket] ⚠️ Suppressed repeated connection error:',
          error.message,
        );
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('[Socket] 🔄 Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      this.isConnected = true;
      console.log('[Socket] ✅ Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('[Socket] ❌ Reconnection error:', error.message);
    });
  }

  /**
   * Join a chat room
   * @param {string} roomId - Chat room ID
   */
  joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot join room: not connected');
      return false;
    }

    console.log('[Socket] 🚪 Joining room:', roomId);
    this.socket.emit('join', String(roomId));
    return true;
  }

  /**
   * Leave a chat room
   * @param {string} roomId - Chat room ID
   */
  leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    console.log('[Socket] 🚪 Leaving room:', roomId);
    this.socket.emit('leave', String(roomId));
    return true;
  }

  /**
   * Send a message via socket (for real-time broadcasting)
   * Note: Message should already be saved via API first
   * @param {string} message - Message text
   * @param {string} chatId - Chat ID
   * @param {string} userId - Sender user ID
   * @param {string} deviceToken - Optional device token for FCM
   */
  sendMessage(message: string, chatId: string, userId: string, deviceToken?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send: not connected');
      console.error('[Socket]   Socket exists:', !!this.socket);
      console.error('[Socket]   Is connected:', this.isConnected);
      return false;
    }

    // Backend expects: { chat_id, text, user_id, device_token }
    const payload: any = {
      chat_id: String(chatId),
      text: String(message), // Backend uses 'text', not 'message'
      user_id: String(userId),
    };

    if (deviceToken) {
      payload.device_token = deviceToken;
    }

    console.log('[Socket] 📤 Broadcasting message via socket:', payload);
    console.log('[Socket]   Socket ID:', this.socket.id);
    console.log('[Socket]   Socket connected:', this.socket.connected);

    try {
      // Backend listens for 'sendMessage' event
      this.socket.emit('sendMessage', payload);
      console.log('[Socket] ✅ Message broadcasted via socket');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending message:', error);
      return false;
    }
  }

  /**
   * Listen for incoming messages from a specific chat room
   * Backend emits to: data.chat_id event and 'newReceivedMessage' event
   * We only listen to chat_id event to avoid duplicates
   * @param {string} chatId - Chat ID to listen for
   * @param {Function} callback - Callback function
   * @returns {Function} cleanup function
   */
  onMessageReceived(chatId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📩 Message received for chat:', chatId, data);
      callback(data);
    };

    // Backend emits to two places:
    // 1. io.emit(data.chat_id, data) - chat-specific event
    // 2. io.emit("newReceivedMessage", data) - global event
    // 
    // We only listen to the chat_id event to avoid duplicates.
    // The chat_id event is more specific and reliable.
    this.socket.on(String(chatId), wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(String(chatId), wrappedCallback);
      }
    };
  }

  /**
   * Listen for any incoming messages (global listener)
   * @param {Function} callback - Callback function
   * @returns {Function} cleanup function
   */
  onAnyMessageReceived(callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      // Return a cleanup function that does nothing
      // The caller should retry when socket is connected
      return () => { };
    }

    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📩 Any message received:', data);
      callback(data);
    };

    // Listen to global 'newReceivedMessage' event
    this.socket.on('newReceivedMessage', wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off('newReceivedMessage', wrappedCallback);
      }
    };
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('[Socket] 🔌 Disconnecting...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  /**
   * Get connection status (matches web useSocket API)
   * @returns {object} Connection status with connected boolean
   */
  getConnectionStatus() {
    return {
      connected: this.socket && this.isConnected,
      socketId: this.socket?.id || null,
    };
  }

  /**
   * Run when socket is connected (immediately if already connected).
   */
  onceConnected(fn: () => void) {
    if (this.socket && this.isConnected) {
      fn();
      return;
    }
    if (this.socket) {
      this.socket.once('connect', fn);
    }
  }

  /**
   * Alse chat broadcast: same event name as legacy app, with text + user_id for 9997 server.
   */
  emitAlseChatMessage(payload: {
    chat_id: string | number;
    message?: string;
    image?: string;
    video?: string;
    audio?: string;
    message_type?: string;
    created_at?: number;
    user?: {_id: string | number; avatar?: string};
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot emitAlseChatMessage: not connected');
      return false;
    }
    const uid = this.userId ? String(this.userId) : '';
    const normalized = {
      ...payload,
      chat_id: String(payload.chat_id),
      text:
        typeof payload.message === 'string'
          ? payload.message
          : payload.message != null
            ? String(payload.message)
            : '',
      user_id: uid,
    };
    try {
      this.socket.emit('sendMessage', normalized);
      return true;
    } catch (error) {
      console.error('[Socket] ❌ emitAlseChatMessage error:', error);
      return false;
    }
  }

  /**
   * Join a watch together room
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @param {string} userImage - User image URL
   */
  joinWatchRoom(chatId: string, userId?: string, userName?: string, userImage?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot join watch room: not connected');
      return false;
    }

    const cid = String(chatId || '').trim();
    if (!cid || cid === 'undefined' || cid === 'null') {
      console.error('[Socket] ❌ joinWatchRoom: chatId is required and must be valid. Got:', JSON.stringify(chatId), '→ Both devices will be in DIFFERENT rooms and video will NOT sync.');
      return false;
    }

    // Room name must be identical on both devices. Both users in the same chat must use the same chatId.
    const watchRoom = 'wt-' + cid;

    const payload: any = {
      chat_id: cid,
      action: 'user_joined',
    };

    if (userId) payload.user_id = String(userId);
    if (userName) payload.user_name = userName;
    if (userImage) payload.user_image = userImage;

    console.log('[Socket] 📺 Joining WATCH ROOM:', watchRoom, '| chat_id:', cid);
    console.log('[Socket] 📺 Socket connected:', this.socket.connected, '| ID:', this.socket.id);
    try {
      // Join the watch room - backend should add socket to wt-{chatId} room
      this.socket.emit('joinWatchRoom', payload);
      
      // Also try these common patterns backends might use
      this.socket.emit('join', watchRoom);
      this.socket.emit('join', cid);
      this.socket.emit('joinRoom', { room: watchRoom, ...payload });
      this.socket.emit('joinRoom', { room: cid, ...payload });
      
      // Join the chatId room directly
      this.joinRoom(cid);
      
      // Emit watchTogetherEvent for user_joined so other users know we joined
      this.socket.emit('watchTogetherEvent', payload);
      
      console.log('[Socket] ✅ Join room events emitted for:', watchRoom, 'and', cid);
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error joining watch room:', error);
      return false;
    }
  }

  /**
   * Listen for watch-together events on the chatId room (fallback when backend
   * broadcasts to chatId instead of wt-{chatId}). Only forwards watch-style
   * payloads (action, video_id, or message with user_id).
   */
  onWatchRoomFallback(chatId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => {};
    }

    const eventName = String(chatId);
    const wrappedCallback = (data: any) => {
      if (!data) return;
      const isWatch =
        (data.action && ['sync', 'change_video', 'message', 'user_joined', 'user_left'].includes(data.action)) ||
        !!data.video_id ||
        !!(data.message && data.user_id);
      if (isWatch) {
        console.log('[Socket] 📺 Watch fallback (chatId) received:', data);
        callback(data);
      }
    };

    this.socket.on(eventName, wrappedCallback);

    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

  /**
   * Listen for change_video / videoChange (web-style). Some backends use
   * io.to(room).emit('change_video', { chat_id, video_id }).
   */
  onWatchVideoChangeEvent(chatId: string, callback: (data: any) => void) {
    if (!this.socket) return () => {};
    const handler = (d: any) => {
      if (d && String(d.chat_id || d.chatId) === String(chatId)) {
        const videoId = d.video_id || d.videoId;
        if (videoId) {
          console.log('[Socket] 📺 change_video/videoChange received:', d);
          callback({ ...d, action: 'change_video', video_id: videoId });
        }
      }
    };
    this.socket.on('change_video', handler);
    this.socket.on('videoChange', handler);
    this.socket.on('changeVideo', handler);
    return () => {
      if (this.socket) {
        this.socket.off('change_video', handler);
        this.socket.off('videoChange', handler);
        this.socket.off('changeVideo', handler);
      }
    };
  }

  /**
   * Listen for syncVideoState / sync (web-style) for play/pause/seek.
   */
  onWatchSyncEvent(chatId: string, callback: (data: any) => void) {
    if (!this.socket) return () => {};
    const handler = (d: any) => {
      if (d && String(d.chat_id || d.chatId) === String(chatId)) {
        console.log('[Socket] 📺 syncVideoState/sync received:', d);
        callback({ ...d, action: 'sync' });
      }
    };
    this.socket.on('syncVideoState', handler);
    this.socket.on('sync', handler);
    return () => {
      if (this.socket) {
        this.socket.off('syncVideoState', handler);
        this.socket.off('sync', handler);
      }
    };
  }

  /**
   * Listen for watchMessage / watchChat (web-style) for real-time watch chat.
   */
  onWatchMessageEvent(chatId: string, callback: (data: any) => void) {
    if (!this.socket) return () => {};
    const handler = (d: any) => {
      const msg = d?.message ?? d?.text;
      if (d && String(d.chat_id || d.chatId) === String(chatId) && msg != null) {
        console.log('[Socket] 📺 watchMessage/watchChat received:', d);
        callback({
          ...d,
          action: 'message',
          message: msg,
          user_id: d.user_id || d.userId,
          user_name: d.user_name || d.userName,
        });
      }
    };
    this.socket.on('watchMessage', handler);
    this.socket.on('watchChat', handler);
    this.socket.on('sendWatchMessage', handler);
    return () => {
      if (this.socket) {
        this.socket.off('watchMessage', handler);
        this.socket.off('watchChat', handler);
        this.socket.off('sendWatchMessage', handler);
      }
    };
  }

  /**
   * Leave a watch together room
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID
   * @param {string} userName - User name
   */
  leaveWatchRoom(chatId: string, userId?: string, userName?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot leave watch room: not connected');
      return false;
    }

    const payload: any = {
      chat_id: String(chatId),
      action: 'user_left',
    };

    if (userId) payload.user_id = String(userId);
    if (userName) payload.user_name = userName;

    console.log('[Socket] 📺 Leaving watch room:', payload);
    try {
      this.socket.emit('leaveWatchRoom', payload);
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error leaving watch room:', error);
      return false;
    }
  }

  /**
   * Sync video state with other users
   * Matches web's socket.syncVideoState(chatId, state) API
   * @param {string} chatId - Chat ID
   * @param {object} state - Video state
   */
  syncVideoState(chatId: string, state: {
    is_playing: boolean;
    current_time: number;
    video_id: string;
    user_id?: string;
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot sync video state: not connected');
      return false;
    }

    const cid = String(chatId);
    const payload = {
      chat_id: cid,
      action: 'sync',
      is_playing: state.is_playing,
      current_time: state.current_time,
      video_id: state.video_id,
      user_id: state.user_id,
      // Also include tm for backwards compatibility
      tm: this.formatTimeForSync(state.current_time),
    };

    console.log('[Socket] 📺 Syncing video state:', payload);
    try {
      // Primary: emit to watchTogetherEvent - backend should relay to wt-{chatId} room
      this.socket.emit('watchTogetherEvent', payload);
      
      // Also emit with 'syncVideoState' and 'sync' for backend compatibility
      this.socket.emit('syncVideoState', payload);
      this.socket.emit('sync', payload);
      
      // Emit to the chatId room directly (backend might broadcast to chatId instead of wt-chatId)
      this.socket.emit(cid, payload);
      
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error syncing video state:', error);
      return false;
    }
  }

  /**
   * Format time in seconds to "M:SS" format
   */
  private formatTimeForSync(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Change video for all users in the room
   * Matches web's socket.changeVideo(chatId, videoId, userId) API
   * @param {string} chatId - Chat ID
   * @param {string} videoId - YouTube video ID
   * @param {string} userId - User ID who changed the video
   */
  changeVideo(chatId: string, videoId: string, userId?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot change video: not connected');
      return false;
    }

    const cid = String(chatId);
    const watchRoom = 'wt-' + cid;
    
    const payload = {
      chat_id: cid,
      action: 'change_video',
      video_id: videoId,
      user_id: userId,
    };

    console.log('[Socket] 📺 Changing video:', payload);
    console.log('[Socket] 📺 Socket connected:', this.socket.connected, '| ID:', this.socket.id);
    try {
      // Try all possible event names the backend might listen for
      this.socket.emit('watchTogetherEvent', payload);
      this.socket.emit('changeVideo', payload);
      this.socket.emit('change_video', payload);
      
      // Try emitting as a message to the regular chat room (backend broadcasts to chatId)
      // This uses the same pattern as regular chat which we know works
      this.socket.emit('sendMessage', {
        chat_id: cid,
        text: JSON.stringify({ type: 'watch_video', video_id: videoId }),
        user_id: userId,
        is_watch_event: true,
        action: 'change_video',
        video_id: videoId,
      });
      
      // Also emit to room names directly
      this.socket.emit(watchRoom, payload);
      this.socket.emit(cid, payload);
      
      console.log('[Socket] ✅ Video change events emitted');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error changing video:', error);
      return false;
    }
  }

  /**
   * Send a chat message in watch together room
   * Matches web's socket.sendWatchMessage(chatId, message, userId, userName, userImage) API
   * @param {string} chatId - Chat ID
   * @param {string} message - Message text
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @param {string} userImage - User image URL
   */
  sendWatchMessage(chatId: string, message: string, userId?: string, userName?: string, userImage?: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send watch message: not connected');
      return false;
    }

    const cid = String(chatId);
    const watchRoom = 'wt-' + cid;
    const timestamp = new Date().toISOString();
    
    const payload: any = {
      chat_id: cid,
      action: 'message',
      message: message,
      text: message, // Some backends use 'text' instead of 'message'
      timestamp: timestamp,
    };

    if (userId) payload.user_id = String(userId);
    if (userName) payload.user_name = userName;
    if (userImage) payload.user_image = userImage;

    console.log('[Socket] 📺 Sending watch message:', payload);
    console.log('[Socket] 📺 Socket connected:', this.socket.connected, '| ID:', this.socket.id);
    try {
      // Try all possible event names the backend might listen for
      this.socket.emit('watchTogetherEvent', payload);
      this.socket.emit('watchMessage', payload);
      this.socket.emit('sendWatchMessage', payload);
      
      // Also try sending as a regular chat message (backend broadcasts to chatId)
      this.socket.emit('sendMessage', {
        chat_id: cid,
        text: message,
        user_id: userId,
        is_watch_event: true,
        action: 'message',
        user_name: userName,
        user_image: userImage,
        timestamp: timestamp,
      });
      
      // Emit to room names directly
      this.socket.emit(watchRoom, payload);
      this.socket.emit(cid, payload);
      
      console.log('[Socket] ✅ Watch message events emitted');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending watch message:', error);
      return false;
    }
  }

  /**
   * Send watch together event (time sync) - Legacy method for backwards compatibility
   * Backend expects: { chat_id, tm } where tm is time in format "M:SS" or "MM:SS"
   * @param {string} chatId - Chat ID
   * @param {string} time - Time in format "M:SS" or "MM:SS" (e.g., "1:28", "2:45")
   */
  sendWatchTogetherEvent(chatId: string, time: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send watch together event: not connected');
      return false;
    }

    const payload = {
      chat_id: Number(chatId),
      tm: String(time),
    };

    console.log('[Socket] 📺 Sending watch together event:', payload);
    try {
      this.socket.emit('watchTogetherEvent', payload);
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending watch together event:', error);
      return false;
    }
  }

  /**
   * Listen for watch together events from a specific chat
   * Backend emits to: wt-{chat_id} event
   * Handles: sync, change_video, message, user_joined, user_left actions
   * @param {string} chatId - Chat ID to listen for
   * @param {Function} callback - Callback function with event data
   * @returns {Function} cleanup function
   */
  onWatchTogetherEvent(chatId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const eventName = 'wt-' + String(chatId || '').trim();
    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📺 Watch together event received for chat:', chatId, data);
      callback(data);
    };

    // Backend emits to: wt-{chat_id} event
    this.socket.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

  /**
   * Listen for watch room events (alias for onWatchTogetherEvent, matches web API)
   * Matches web's socket.onWatchRoom(chatId, callback) API
   * @param {string} chatId - Chat ID to listen for
   * @param {Function} callback - Callback function with event data
   * @returns {Function} cleanup function
   */
  onWatchRoom(chatId: string, callback: (data: any) => void) {
    return this.onWatchTogetherEvent(chatId, callback);
  }

  /**
   * Remove watch room listener (matches web API)
   * Matches web's socket.offWatchRoom(chatId, callback) API
   * @param {string} chatId - Chat ID
   * @param {Function} callback - Callback to remove (not used, cleanup handles this)
   */
  offWatchRoom(chatId: string, callback?: (data: any) => void) {
    if (!this.socket) return;
    const eventName = 'wt-' + String(chatId || '').trim();
    if (callback) {
      this.socket.off(eventName, callback);
    } else {
      this.socket.off(eventName);
    }
  }

  /**
   * Listen for global watchTogetherEvent events
   * @param {Function} callback - Callback function with event data
   * @returns {Function} cleanup function
   */
  onGlobalWatchTogetherEvent(callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📺 Global watch together event received:', data);
      callback(data);
    };

    this.socket.on('watchTogetherEvent', wrappedCallback);

    return () => {
      if (this.socket) {
        this.socket.off('watchTogetherEvent', wrappedCallback);
      }
    };
  }

  /**
   * Remove global watchTogetherEvent listener (matches web API)
   * Matches web's socket.offWatchTogetherEvent(callback) API
   * @param {Function} callback - Callback to remove (not used, cleanup handles this)
   */
  offWatchTogetherEvent(callback?: (data: any) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('watchTogetherEvent', callback);
    } else {
      this.socket.off('watchTogetherEvent');
    }
  }

  /**
   * Send a call invitation to another user
   * @param {object} payload - Call invitation data
   * @param {string} payload.callId - Unique call identifier
   * @param {string} payload.callType - 'video' or 'audio'
   * @param {string} payload.recipientUserId - User ID of the recipient
   * @param {string} payload.callerUserId - User ID of the caller
   * @param {string} payload.callerName - Name of the caller
   * @param {string} payload.callerImage - Profile image URL of the caller
   * @param {string} payload.chatId - Chat ID
   * @param {string} payload.channelName - Agora channel name
   * @returns {boolean} Success status
   */
  sendCallInvitation(payload: {
    callId: string;
    callType: 'video' | 'audio';
    recipientUserId: string;
    callerUserId: string;
    callerName: string;
    callerImage?: string;
    chatId: string;
    channelName: string;
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send call invitation: not connected');
      return false;
    }

    console.log('[Socket] 📞 Sending call invitation:', payload);
    try {
      this.socket.emit('callInvitation', payload);
      console.log('[Socket] ✅ Call invitation sent');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending call invitation:', error);
      return false;
    }
  }

  /**
   * Listen for incoming call invitations
   * @param {string} userId - Current user ID to listen for calls
   * @param {Function} callback - Callback function with call invitation data
   * @returns {Function} cleanup function
   */
  onCallInvitation(userId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const eventName = `callInvitation-${userId}`;
    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📞 Call invitation received for user:', userId, data);
      callback(data);
    };

    this.socket.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

  /**
   * Send a call request to a specific chat
   * @param {object} payload - Call request data
   * @param {string} payload.chat_id - Chat ID
   * @param {string} payload.extraD - Extra data (optional)
   * @param {string} payload.callType - 'video' or 'audio' (optional)
   * @param {string} payload.callId - Call ID (optional)
   * @returns {boolean} Success status
   */
  sendCallRequest(payload: {
    chat_id: string | number;
    extraD?: string;
    callType?: 'video' | 'audio';
    callId?: string;
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send call request: not connected');
      return false;
    }

    const chatId = String(payload.chat_id);
    const eventName = `callRequest-${chatId}`;
    
    console.log('[Socket] 📞 Sending call request:', eventName, payload);
    try {
      this.socket.emit(eventName, payload);
      console.log('[Socket] ✅ Call request sent to', eventName);
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending call request:', error);
      return false;
    }
  }

  /**
   * Listen for incoming call requests by chat ID
   * @param {string} chatId - Chat ID to listen for call requests
   * @param {Function} callback - Callback function with call request data
   * @returns {Function} cleanup function
   */
  onCallRequest(chatId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const eventName = `callRequest-${chatId}`;
    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📞 Call request received for chat:', chatId, data);
      callback(data);
    };

    this.socket.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

  /**
   * Send call response (accept or reject)
   * @param {object} payload - Call response data
   * @param {string} payload.callId - Call identifier
   * @param {string} payload.response - 'accepted' or 'rejected'
   * @param {string} payload.userId - User ID responding to the call
   * @param {string} payload.callerUserId - Original caller's user ID
   * @returns {boolean} Success status
   */
  sendCallResponse(payload: {
    callId: string;
    response: 'accepted' | 'rejected';
    userId: string;
    callerUserId: string;
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send call response: not connected');
      return false;
    }

    console.log('[Socket] 📞 Sending call response:', payload);
    try {
      this.socket.emit('callResponse', payload);
      console.log('[Socket] ✅ Call response sent');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending call response:', error);
      return false;
    }
  }

  /**
   * Listen for call responses (when someone accepts/rejects your call)
   * @param {string} userId - Current user ID (caller)
   * @param {Function} callback - Callback function with response data
   * @returns {Function} cleanup function
   */
  onCallResponse(userId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const eventName = `callResponse-${userId}`;
    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📞 Call response received for user:', userId, data);
      callback(data);
    };

    this.socket.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

  /**
   * Send call ended event
   * @param {object} payload - Call end data
   * @param {string} payload.callId - Call identifier
   * @param {string} payload.userId - User ID who ended the call
   * @param {string} payload.otherUserId - Other participant's user ID
   * @returns {boolean} Success status
   */
  sendCallEnded(payload: {
    callId: string;
    userId: string;
    otherUserId: string;
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send call ended: not connected');
      return false;
    }

    console.log('[Socket] 📞 Sending call ended:', payload);
    try {
      this.socket.emit('callEnded', payload);
      console.log('[Socket] ✅ Call ended event sent');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending call ended:', error);
      return false;
    }
  }

  /**
   * Send call ended event to a specific chat (to notify receiver)
   * @param {object} payload - Call end data
   * @param {string} payload.chat_id - Chat ID
   * @param {string} payload.callId - Call identifier
   * @param {string} payload.userId - User ID who ended the call
   * @returns {boolean} Success status
   */
  sendCallEndedToChat(payload: {
    chat_id: string | number;
    callId: string;
    userId: string;
    callType?: 'audio' | 'video';
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('[Socket] ❌ Cannot send call ended to chat: not connected');
      return false;
    }

    const chatId = String(payload.chat_id);
    const eventName = `callEnded-${chatId}`;
    
    console.log('[Socket] 📞 Sending call ended to chat:', eventName, payload);
    try {
      this.socket.emit(eventName, payload);
      console.log('[Socket] ✅ Call ended event sent to chat');
      return true;
    } catch (error) {
      console.error('[Socket] ❌ Error sending call ended to chat:', error);
      return false;
    }
  }

  /**
   * Listen for call ended events by chat ID
   * @param {string} chatId - Chat ID to listen for call ended events
   * @param {Function} callback - Callback function with call end data
   * @returns {Function} cleanup function
   */
  onCallEndedByChat(chatId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const eventName = `callEnded-${chatId}`;
    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📞 Call ended received for chat:', chatId, data);
      callback(data);
    };

    this.socket.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

  /**
   * Listen for call ended events
   * @param {string} userId - Current user ID
   * @param {Function} callback - Callback function with call end data
   * @returns {Function} cleanup function
   */
  onCallEnded(userId: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('[Socket] ⚠️ Socket not initialized yet, listener will be set up when socket connects');
      return () => { };
    }

    const eventName = `callEnded-${userId}`;
    const wrappedCallback = (data: any) => {
      console.log('[Socket] 📞 Call ended received for user:', userId, data);
      callback(data);
    };

    this.socket.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(eventName, wrappedCallback);
      }
    };
  }

}

// Export singleton instance
export default new ChatSocket();
