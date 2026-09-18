// Telegram Polling Service for Cham A Luoi
// Receives staff replies on Telegram and forwards them to website customer chat sessions via Supabase

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function getSettings() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.site_settings&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (res.ok) {
      const rows = await res.json();
      return rows[0]?.data || {};
    }
  } catch (err) {
    console.error('[POLL_SETTINGS_ERR]', err.message);
  }
  return {};
}

async function fetchChats() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.chats_store&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows[0]?.data)) return rows[0].data;
    }
  } catch (err) {
    console.error('[POLL_FETCH_CHATS_ERR]', err.message);
  }
  return [];
}

async function saveChats(chats) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'chats_store',
        data: chats,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[POLL_SAVE_CHATS_ERR]', err.message);
    return false;
  }
}

async function sendTelegramConfirmation(token, chatId, replyToMsgId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        reply_to_message_id: replyToMsgId,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('[POLL_CONFIRM_ERR]', err.message);
  }
}

async function startPolling() {
  console.log('🚀 [TELEGRAM_POLLER] Khởi động dịch vụ lắng nghe tin nhắn Telegram 2 chiều...');
  let offset = 0;
  let token = '8821903735:AAHaucbQqL-_HlKAW5occiEKSaWKzxEyNxc';

  // Flush any old backlog so only new replies are processed
  try {
    const flushRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-1`);
    const flushData = await flushRes.json();
    if (flushData.ok && flushData.result && flushData.result.length > 0) {
      offset = flushData.result[flushData.result.length - 1].update_id + 1;
      console.log(`[TELEGRAM_POLLER] Khởi tạo offset mới: ${offset}`);
    }
  } catch (e) {
    console.log('[TELEGRAM_POLLER] Không thể flush backlog:', e.message);
  }

  while (true) {
    try {
      const settings = await getSettings();
      if (settings.telegramBotToken?.trim()) {
        token = settings.telegramBotToken.trim();
      }

      const pollUrl = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=15`;
      const response = await fetch(pollUrl);
      const data = await response.json();

      if (!data.ok) {
        console.error('[TELEGRAM_POLLER_ERR]', data.description);
        await new Promise(r => setTimeout(r, 4000));
        continue;
      }

      const updates = data.result || [];
      for (const update of updates) {
        offset = update.update_id + 1;
        const message = update.message || update.edited_message;
        if (!message || !message.text) continue;

        const replyTo = message.reply_to_message;
        const staffReplyText = message.text.trim();
        const chatId = message.chat?.id;
        const msgId = message.message_id;

        if (!replyTo) continue;

        const originalText = replyTo.text || replyTo.caption || '';
        let sessionId = null;

        const sidMatch = originalText.match(/\[SID:(chat-[\w-]+)\]/i);
        if (sidMatch && sidMatch[1]) {
          sessionId = sidMatch[1];
        } else {
          const altMatch = originalText.match(/(chat-\d+-\d+)/i);
          if (altMatch && altMatch[1]) {
            sessionId = altMatch[1];
          }
        }

        if (!sessionId) {
          console.log('[TELEGRAM_POLLER] Tin nhắn reply không chứa mã SID.');
          continue;
        }

        console.log(`📩 [TELEGRAM_POLLER] Bắt được phản hồi nhân viên cho SID [${sessionId}]: "${staffReplyText}"`);

        const chats = await fetchChats();
        const sessionIndex = chats.findIndex(c => c.id === sessionId);

        if (sessionIndex === -1) {
          console.warn(`⚠️ [TELEGRAM_POLLER] Không tìm thấy phiên chat ${sessionId} trong Supabase.`);
          continue;
        }

        const session = chats[sessionIndex];
        const now = new Date().toISOString();

        const staffMsg = {
          id: `msg-tg-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
          role: 'staff',
          text: staffReplyText,
          createdAt: now
        };

        session.messages.push(staffMsg);
        session.lastMessage = staffReplyText;
        session.updatedAt = now;
        session.unreadByAdmin = false;

        chats.splice(sessionIndex, 1);
        chats.unshift(session);

        const saved = await saveChats(chats);
        if (saved) {
          console.log(`✅ [TELEGRAM_POLLER] Đã đồng bộ tin nhắn nhân viên vào web thành công cho khách: ${session.guestName}!`);
          const confirmText = `✅ <i>Đã chuyển câu trả lời tới khách <b>${session.guestName || 'trên web'}</b>!</i>`;
          await sendTelegramConfirmation(token, chatId, msgId, confirmText);
        }
      }
    } catch (err) {
      console.error('[POLLER_LOOP_ERROR]', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startPolling();
