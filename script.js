// script.js
(function(){
  // ========== DATA ==========
  const naratorName = 'Caine';
  let coin = 100;
  let gachaRemaining = 10;    // 10 roll gratis
  let playerRole = 'Manusia'; // default
  let rollCount = 0;

  // elemen
  const chatArea = document.getElementById('chatArea');
  const coinDisplay = document.getElementById('coinDisplay');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const menuDots = document.getElementById('menuDots');
  const npcModal = document.getElementById('npcModal');
  const overlay = document.getElementById('overlay');

  // helper: update coin UI
  function updateCoinUI() {
    coinDisplay.textContent = coin;
  }

  // helper: append message
  function appendMessage(text, sender = 'narrator', extra = '') {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    if (sender === 'narrator') {
      div.innerHTML = `<div class="msg-sender">📖 ${naratorName}</div>${text}`;
    } else if (sender === 'player') {
      div.innerHTML = `<div class="msg-sender player-name">🧑 Pemain</div>${text}`;
    } else {
      div.textContent = text;
    }
    if (extra) {
      const small = document.createElement('small');
      small.textContent = extra;
      div.appendChild(small);
    }
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // narator sambutan awal
  function welcomeMessage() {
    appendMessage(`Selamat datang, Pemain! Aku ${naratorName}, pemandu mu di dunia Fantasi. 🏰`, 'narrator');
    appendMessage(`Kamu memiliki 10 kali gulungan peran GRATIS! Gunakan /gacha untuk memulai.`, 'narrator');
    appendMessage(`Ketik /jobdesk untuk melihat daftar pekerjaan.`, 'narrator');
    appendMessage(`Ketik /npc untuk berinteraksi dengan pedagang.`, 'narrator');
    appendMessage(`Koin awal: 100 🪙. Gunakan dengan bijak.`, 'narrator');
  }

  // ========== GACHA ==========
  function rollGacha() {
    if (gachaRemaining <= 0) {
      appendMessage(`⚠️ Gulungan gratis habis. Gunakan /buygacha untuk membeli (100 koin per roll).`, 'narrator');
      return;
    }
    // random number generator
    const rand = Math.random() * 100; // 0-100
    let role = 'Manusia';
    let percent = 0;
    if (rand <= 90) { role = 'Manusia'; percent = 90; }
    else if (rand <= 97) { role = 'Goblin'; percent = 87; } // Goblin + Elf 87% (kumulatif 90+7)
    else if (rand <= 99.3) { role = 'Peri'; percent = 30; } // Peri 30% (tapi kita pakai range 97-99.3)
    else if (rand <= 99.7) { role = 'Hantu'; percent = 5; }
    else if (rand <= 100) { 
      // Malaikat atau Iblis 0.7% (dibagi rata)
      if (Math.random() < 0.5) { role = 'Malaikat'; percent = 0.7; }
      else { role = 'Iblis'; percent = 0.7; }
    }
    // fine tune agar Goblin & Elf masing-masing 87? kita bagi 2
    if (role === 'Goblin' || role === 'Elf') {
      // kita set ulang berdasarkan random kedua
      if (Math.random() < 0.5) role = 'Goblin';
      else role = 'Elf';
    }
    // tapi karena di atas kita cuma assign Goblin, kita random antara Goblin/Elf
    if (role === 'Goblin') {
      if (Math.random() < 0.5) role = 'Elf';
    }
    // untuk peri, hantu, dll sudah oke
    playerRole = role;
    gachaRemaining--;
    rollCount++;
    appendMessage(`🎲 Gacha #${rollCount} → **${role}** (persentase ~${percent}%)`, 'player');
    appendMessage(`Selamat! Peranmu sekarang: ${role}. Sisa gulungan: ${gachaRemaining}`, 'narrator');
    updateCoinUI();
    // jika role langka
    if (role === 'Malaikat' || role === 'Iblis') {
      appendMessage(`✨ Langka! ${role} muncul!`, 'narrator');
    }
  }

  // ========== NPC JUAL BELI (random grade/harga) ==========
  function npcTrade(npcIndex) {
    const npcNames = [
      'Penempa Senjata', 'Pembuat Ramuan', 'Penempa Artefak', 
      'Pembuat Gulung Sihir', 'Penjinak Hewan Sihir'
    ];
    const grades = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ancient'];
    const gradeWeights = [40, 25, 15, 10, 5, 3, 2]; // random
    function randomGrade() {
      let r = Math.random() * 100;
      let cum = 0;
      for (let i=0; i<grades.length; i++) {
        cum += gradeWeights[i];
        if (r <= cum) return grades[i];
      }
      return 'Common';
    }
    const grade = randomGrade();
    // harga random 10 - 500
    let basePrice = Math.floor(Math.random() * 490 + 10);
    // multiplier grade
    const gradeMulti = { 'Common':1, 'Uncommon':1.8, 'Rare':3, 'Epic':6, 'Legendary':12, 'Mythic':25, 'Ancient':45 };
    let price = Math.floor(basePrice * (gradeMulti[grade] || 1));
    // random item name
    const itemPrefix = ['Pedang', 'Tombak', 'Busur', 'Jubah', 'Cincin', 'Botol', 'Gulungan', 'Kristal', 'Tali', 'Palu'];
    const itemSuffix = ['Api', 'Es', 'Bayangan', 'Cahaya', 'Bumi', 'Angin', 'Naga', 'Feniks', 'Roh', 'Batu'];
    const itemName = itemPrefix[Math.floor(Math.random() * itemPrefix.length)] + ' ' + 
                     itemSuffix[Math.floor(Math.random() * itemSuffix.length)];

    // tawarkan ke player
    appendMessage(`🗡️ ${npcNames[npcIndex]} menawarkan: **${itemName}** [${grade}] — harga ${price} 🪙`, 'narrator');
    appendMessage(`Ketik /beli ${price} untuk membeli, atau /tolak.`, 'narrator');
    // simpan state buy
    window._pendingTrade = { itemName, grade, price, npc: npcNames[npcIndex] };
  }

  // ========== JOBDESK ==========
  function showJobdesk() {
    appendMessage(`📋 Daftar Pekerjaan:`, 'narrator');
    appendMessage(`⛏️ Penambang · 🏹 Berburu · ⚔️ Membunuh · 🧪 Meracik · 🛡️ Menjaga · 📜 Menyihir`, 'narrator');
    appendMessage(`Ketik /job <pekerjaan> untuk memulai (simbolis).`, 'narrator');
  }

  // ========== PARSER PERINTAH ==========
  function processCommand(input) {
    const cmd = input.trim();
    if (cmd === '/gacha') {
      rollGacha();
      return true;
    } else if (cmd === '/jobdesk') {
      showJobdesk();
      return true;
    } else if (cmd.startsWith('/beli ')) {
      const parts = cmd.split(' ');
      const price = parseInt(parts[1]);
      if (!window._pendingTrade) {
        appendMessage(`Tidak ada tawaran NPC. Cari NPC dulu dengan /npc`, 'narrator');
        return true;
      }
      if (isNaN(price) || price !== window._pendingTrade.price) {
        appendMessage(`Harga tidak sesuai.`, 'narrator');
        return true;
      }
      if (coin < price) {
        appendMessage(`Koin tidak cukup! 🪙 ${coin} tersedia.`, 'narrator');
        return true;
      }
      coin -= price;
      updateCoinUI();
      const item = window._pendingTrade.itemName;
      const grade = window._pendingTrade.grade;
      appendMessage(`✅ Berhasil membeli **${item}** [${grade}] dari ${window._pendingTrade.npc}.`, 'narrator');
      appendMessage(`Koin tersisa: ${coin} 🪙`, 'narrator');
      window._pendingTrade = null;
      return true;
    } else if (cmd === '/tolak') {
      if (window._pendingTrade) {
        appendMessage(`Menolak tawaran dari ${window._pendingTrade.npc}.`, 'narrator');
        window._pendingTrade = null;
      } else {
        appendMessage(`Tidak ada tawaran aktif.`, 'narrator');
      }
      return true;
    } else if (cmd === '/npc') {
      appendMessage(`Klik titik tiga (⁝) di kanan atas untuk memilih NPC.`, 'narrator');
      npcModal.classList.add('active');
      overlay.classList.add('active');
      return true;
    } else if (cmd === '/buygacha') {
      if (coin < 100) {
        appendMessage(`Koin tidak cukup! Butuh 100 🪙.`, 'narrator');
        return true;
      }
      coin -= 100;
      gachaRemaining += 1;
      updateCoinUI();
      appendMessage(`✅ 1 gulungan peran dibeli! Sisa gulungan: ${gachaRemaining}`, 'narrator');
      return true;
    } else if (cmd === '/help') {
      appendMessage(`📖 Perintah: /gacha, /jobdesk, /npc, /buygacha, /beli <harga>, /tolak, /help`, 'narrator');
      return true;
    } else if (cmd.startsWith('/job ')) {
      const job = cmd.substring(5);
      appendMessage(`🧑 Pemain memulai pekerjaan: ${job}. (simulasi)`, 'player');
      appendMessage(`💰 Kamu mendapat 10-30 koin dari pekerjaan.`, 'narrator');
      const earn = Math.floor(Math.random() * 20) + 10;
      coin += earn;
      updateCoinUI();
      appendMessage(`+${earn} 🪙 Koin. Total: ${coin}`, 'narrator');
      return true;
    }
    return false;
  }

  // ========== EVENT ==========
  // send message
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    // tampilkan di chat
    appendMessage(text, 'player');
    chatInput.value = '';
    // cek command
    if (text.startsWith('/')) {
      const handled = processCommand(text);
      if (!handled) {
        appendMessage(`Perintah tidak dikenal. Ketik /help untuk bantuan.`, 'narrator');
      }
    } else {
      // narator respon random
      const replies = ['Hmm, menarik.', 'Lanjutkan, Pemain.', 'Aku mendengarkan.', 'Ceritakan lebih banyak.'];
      appendMessage(replies[Math.floor(Math.random() * replies.length)], 'narrator');
    }
  }

  // NPC modal toggle
  menuDots.addEventListener('click', function(e) {
    e.stopPropagation();
    npcModal.classList.toggle('active');
    overlay.classList.toggle('active');
  });
  overlay.addEventListener('click', function() {
    npcModal.classList.remove('active');
    overlay.classList.remove('active');
  });

  // klik NPC
  document.querySelectorAll('.npc-item').forEach(el => {
    el.addEventListener('click', function() {
      const index = parseInt(this.dataset.npc);
      npcModal.classList.remove('active');
      overlay.classList.remove('active');
      // random trade
      npcTrade(index);
    });
  });

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // init
  updateCoinUI();
  welcomeMessage();
  appendMessage(`🎭 Peran awal: Manusia. Gunakan /gacha untuk mengganti.`, 'narrator');
  appendMessage(`🎲 Sisa gulungan gratis: ${gachaRemaining}`, 'narrator');
  appendMessage(`💡 Ketik /help untuk daftar perintah.`, 'narrator');
})();