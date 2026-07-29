(function(){
  // ========== DATA ==========
  const naratorName = 'Caine';
  let coin = 100;
  let gems = 100;
  let gachaRemaining = 10;
  let playerRole = 'Manusia';
  let rollCount = 0;
  let level = 1;
  let exp = 0;
  let expNext = 100;
  let title = ''; // Kosong di awal

  // Stats
  let stats = { str: 10, def: 10, spd: 10, agi: 10, luk: 10 };

  // Elemen
  const chatArea = document.getElementById('chatArea');
  const coinDisplay = document.getElementById('coinDisplay');
  const gemsDisplay = document.getElementById('gemsDisplay');
  const levelDisplay = document.getElementById('levelDisplay');
  const expDisplay = document.getElementById('expDisplay');
  const expNextDisplay = document.getElementById('expNextDisplay');
  const titleBar = document.getElementById('titleBar');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const menuDots = document.getElementById('menuDots');
  const npcModal = document.getElementById('npcModal');
  const overlay = document.getElementById('overlay');
  const statusModal = document.getElementById('statusModal');
  const titleShopModal = document.getElementById('titleShopModal');

  // Helper update UI
  function updateUI() {
    coinDisplay.textContent = coin;
    gemsDisplay.textContent = gems;
    levelDisplay.textContent = level;
    expDisplay.textContent = exp;
    expNextDisplay.textContent = expNext;
    
    // Tampilkan gelar hanya jika ada
    if (title && title !== '') {
      titleBar.classList.remove('hidden');
      titleBar.textContent = title;
    } else {
      titleBar.classList.add('hidden');
    }
    
    document.getElementById('statStr').textContent = stats.str;
    document.getElementById('statDef').textContent = stats.def;
    document.getElementById('statSpd').textContent = stats.spd;
    document.getElementById('statAgi').textContent = stats.agi;
    document.getElementById('statLuk').textContent = stats.luk;
  }

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

  // Leveling
  function addExp(amount) {
    exp += amount;
    while (exp >= expNext) {
      exp -= expNext;
      level++;
      expNext = Math.floor(expNext * 1.5) + 20;
      stats.str += 2;
      stats.def += 2;
      stats.spd += 2;
      stats.agi += 2;
      stats.luk += 1;
      appendMessage(`🎉 Level UP! Sekarang Level ${level}. Stats meningkat!`, 'narrator');
      updateUI();
    }
    updateUI();
  }

  // ========== GACHA ==========
  function rollGacha() {
    if (gachaRemaining <= 0) {
      appendMessage(`⚠️ Gulungan gratis habis. /buygacha (100 koin)`, 'narrator');
      return;
    }
    const rand = Math.random() * 100;
    let role = 'Manusia', percent = 0;
    if (rand <= 90) { role = 'Manusia'; percent = 90; }
    else if (rand <= 97) { role = Math.random() < 0.5 ? 'Goblin' : 'Elf'; percent = 87; }
    else if (rand <= 99.3) { role = 'Peri'; percent = 30; }
    else if (rand <= 99.7) { role = 'Hantu'; percent = 5; }
    else { role = Math.random() < 0.5 ? 'Malaikat' : 'Iblis'; percent = 0.7; }
    playerRole = role;
    gachaRemaining--;
    rollCount++;
    appendMessage(`🎲 Gacha #${rollCount} → **${role}** (~${percent}%)`, 'player');
    appendMessage(`Peran: ${role}. Sisa: ${gachaRemaining}`, 'narrator');
    if (role === 'Malaikat' || role === 'Iblis') appendMessage(`✨ Langka!`, 'narrator');
    updateUI();
  }

  // ========== NPC JUAL BELI ==========
  function npcTrade(npcIndex) {
    const npcNames = ['Penempa Senjata','Pembuat Ramuan','Penempa Artefak','Pembuat Gulung Sihir','Penjinak Hewan Sihir'];
    const grades = ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Ancient'];
    const gradeWeights = [40,25,15,10,5,3,2];
    function randomGrade() {
      let r = Math.random() * 100, cum = 0;
      for (let i=0; i<grades.length; i++) { cum += gradeWeights[i]; if (r <= cum) return grades[i]; }
      return 'Common';
    }
    const grade = randomGrade();
    let basePrice = Math.floor(Math.random() * 490 + 10);
    const gradeMulti = { 'Common':1, 'Uncommon':1.8, 'Rare':3, 'Epic':6, 'Legendary':12, 'Mythic':25, 'Ancient':45 };
    let price = Math.floor(basePrice * (gradeMulti[grade] || 1));
    const itemPrefix = ['Pedang','Tombak','Busur','Jubah','Cincin','Botol','Gulungan','Kristal','Tali','Palu'];
    const itemSuffix = ['Api','Es','Bayangan','Cahaya','Bumi','Angin','Naga','Feniks','Roh','Batu'];
    const itemName = itemPrefix[Math.floor(Math.random() * itemPrefix.length)] + ' ' + 
                     itemSuffix[Math.floor(Math.random() * itemSuffix.length)];
    appendMessage(`🗡️ ${npcNames[npcIndex]} menawarkan: **${itemName}** [${grade}] — ${price} 🪙`, 'narrator');
    appendMessage(`Ketik /beli ${price} atau /tolak`, 'narrator');
    window._pendingTrade = { itemName, grade, price, npc: npcNames[npcIndex] };
  }

  // ========== PASAR dengan RNG ==========
  function marketOffer() {
    const items = [
      { name: 'Ramuan Kesehatan', grade: 'Common', price: 15 },
      { name: 'Ramuan Mana', grade: 'Common', price: 20 },
      { name: 'Roti Daging', grade: 'Common', price: 10 },
      { name: 'Sup Ikan', grade: 'Uncommon', price: 35 },
      { name: 'Elixir Agility', grade: 'Rare', price: 80 },
      { name: 'Batu Kekuatan', grade: 'Epic', price: 150 },
      { name: 'Jubah Bayangan', grade: 'Legendary', price: 400 },
      { name: 'Pedang Naga', grade: 'Mythic', price: 800 },
      { name: 'Mahkota Kuno', grade: 'Ancient', price: 1500 },
    ];
    const pick = items[Math.floor(Math.random() * items.length)];
    let price = pick.price + Math.floor(Math.random() * 30) - 10;
    if (price < 5) price = 5;
    appendMessage(`🛒 Pasar menawarkan: **${pick.name}** [${pick.grade}] — ${price} 🪙`, 'narrator');
    appendMessage(`Ketik /beli ${price} untuk membeli.`, 'narrator');
    window._pendingTrade = { itemName: pick.name, grade: pick.grade, price, npc: 'Pasar' };
  }

  // ========== JOB DESK ==========
  function showJobdesk() {
    appendMessage(`📋 Daftar Pekerjaan:`, 'narrator');
    appendMessage(`⛏️ Penambang · 🏹 Berburu · ⚔️ Membunuh · 🧪 Meracik · 🛡️ Menjaga · 📜 Menyihir · 🧭 Petualang`, 'narrator');
    appendMessage(`Ketik /job <pekerjaan>`, 'narrator');
  }

  // ========== HEWAN KUNO ==========
  function huntAncient() {
    const rand = Math.random() * 1000000;
    if (rand < 1) { // 0.0001%
      const ancient = ['🦄 Phoenix Abadi', '🐉 Naga Purba', '🐲 Wyrm Zaman'];
      const beast = ancient[Math.floor(Math.random() * ancient.length)];
      appendMessage(`🔥 HEWAN KUNO muncul: ${beast}!`, 'narrator');
      appendMessage(`🏆 Kamu mendapat 500 EXP, 100 Koin, 50 Gems!`, 'narrator');
      addExp(500);
      coin += 100;
      gems += 50;
      updateUI();
      return true;
    }
    return false;
  }

  // ========== PROSES PERINTAH ==========
  function processCommand(input) {
    const cmd = input.trim();
    if (cmd === '/gacha') { rollGacha(); return true; }
    else if (cmd === '/jobdesk') { showJobdesk(); return true; }
    else if (cmd.startsWith('/beli ')) {
      const price = parseInt(cmd.split(' ')[1]);
      if (!window._pendingTrade) { appendMessage(`Tidak ada tawaran.`, 'narrator'); return true; }
      if (isNaN(price) || price !== window._pendingTrade.price) { appendMessage(`Harga salah.`, 'narrator'); return true; }
      if (coin < price) { appendMessage(`Koin kurang!`, 'narrator'); return true; }
      coin -= price;
      appendMessage(`✅ Membeli ${window._pendingTrade.itemName} [${window._pendingTrade.grade}]`, 'narrator');
      window._pendingTrade = null;
      updateUI();
      return true;
    } else if (cmd === '/tolak') {
      if (window._pendingTrade) { appendMessage(`Menolak tawaran.`, 'narrator'); window._pendingTrade = null; }
      else appendMessage(`Tidak ada tawaran.`, 'narrator');
      return true;
    } else if (cmd === '/npc') {
      appendMessage(`Klik titik tiga (⁝) untuk NPC.`, 'narrator');
      npcModal.classList.add('active'); overlay.classList.add('active');
      return true;
    } else if (cmd === '/buygacha') {
      if (coin < 100) { appendMessage(`Koin tidak cukup!`, 'narrator'); return true; }
      coin -= 100; gachaRemaining++; appendMessage(`✅ +1 Gacha. Sisa: ${gachaRemaining}`, 'narrator');
      updateUI(); return true;
    } else if (cmd === '/market') {
      marketOffer(); return true;
    } else if (cmd.startsWith('/job ')) {
      const job = cmd.substring(5);
      appendMessage(`🧑 Memulai ${job}...`, 'player');
      const coinEarn = Math.floor(Math.random() * 30) + 10;
      const gemsEarn = Math.floor(Math.random() * 10) + 2;
      const expEarn = Math.floor(Math.random() * 20) + 5;
      coin += coinEarn; gems += gemsEarn; addExp(expEarn);
      appendMessage(`💰 +${coinEarn} Koin, 💎 +${gemsEarn} Gems, ⭐ +${expEarn} EXP`, 'narrator');
      if (job.toLowerCase().includes('petualang')) {
        const found = huntAncient();
        if (!found) appendMessage(`Tidak menemukan hewan kuno.`, 'narrator');
      }
      updateUI();
      return true;
    } else if (cmd === '/help') {
      appendMessage(`📖 /gacha, /jobdesk, /npc, /buygacha, /beli <harga>, /tolak, /market, /job <nama>, /help`, 'narrator');
      return true;
    }
    return false;
  }

  // ========== EVENT ==========
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, 'player');
    chatInput.value = '';
    if (text.startsWith('/')) {
      if (!processCommand(text)) appendMessage(`Perintah tidak dikenal. /help`, 'narrator');
    } else {
      const replies = ['Hmm, menarik.', 'Lanjutkan.', 'Aku mendengarkan.', 'Ceritakan lebih banyak.'];
      appendMessage(replies[Math.floor(Math.random() * replies.length)], 'narrator');
    }
  }

  // Toggle modal
  menuDots.addEventListener('click', (e) => {
    e.stopPropagation();
    npcModal.classList.toggle('active');
    overlay.classList.toggle('active');
  });
  overlay.addEventListener('click', () => {
    npcModal.classList.remove('active');
    statusModal.classList.remove('active');
    titleShopModal.classList.remove('active');
    overlay.classList.remove('active');
  });

  // NPC click
  document.querySelectorAll('.npc-item').forEach(el => {
    el.addEventListener('click', function() {
      const index = parseInt(this.dataset.npc);
      if (!isNaN(index)) {
        npcModal.classList.remove('active');
        overlay.classList.remove('active');
        npcTrade(index);
      }
    });
  });

  // Status & Title Shop
  document.getElementById('statusBtn').addEventListener('click', () => {
    npcModal.classList.remove('active');
    statusModal.classList.add('active');
    overlay.classList.add('active');
  });
  document.getElementById('closeStatus').addEventListener('click', () => {
    statusModal.classList.remove('active');
    overlay.classList.remove('active');
  });

  document.getElementById('titleShopBtn').addEventListener('click', () => {
    npcModal.classList.remove('active');
    titleShopModal.classList.add('active');
    overlay.classList.add('active');
  });
  document.getElementById('closeTitleShop').addEventListener('click', () => {
    titleShopModal.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Beli gelar
  document.querySelectorAll('.title-shop-item').forEach(el => {
    el.addEventListener('click', function() {
      const titleName = this.dataset.title;
      const price = parseInt(this.dataset.price);
      if (gems < price) { appendMessage(`💎 Gems tidak cukup!`, 'narrator'); return; }
      gems -= price;
      title = titleName;
      appendMessage(`🏅 Gelar berubah menjadi: ${titleName}`, 'narrator');
      updateUI();
      titleShopModal.classList.remove('active');
      overlay.classList.remove('active');
    });
  });

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // Init
  updateUI();
  appendMessage(`Selamat datang, Pemain! Aku ${naratorName}. 🏰`, 'narrator');
  appendMessage(`💡 /help untuk daftar perintah.`, 'narrator');
  appendMessage(`🎲 Sisa gacha gratis: ${gachaRemaining}`, 'narrator');
  appendMessage(`🪙 ${coin} Koin, 💎 ${gems} Gems, Level ${level}`, 'narrator');
})();
