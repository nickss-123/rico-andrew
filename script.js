(function() {
  // ---------- CONFETTI ----------
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 130;
  let animationId = null;

  function getConfettiColor() {
    const colors = ['#F8C150', '#CF9F3F', '#E5E9F0', '#2D4055', '#1E2B3A', '#A67C45'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function initConfetti() {
    resizeCanvas();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.2 - height * 0.2,
        size: Math.random() * 7 + 4,
        speedY: Math.random() * 6 + 5,
        speedX: Math.random() * 2 - 1,
        color: getConfettiColor(),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.8,
      });
    }
  }

  function drawConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#00000030';
      ctx.shadowBlur = 6;
      ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
      ctx.restore();

      p.y += p.speedY * 0.6;
      p.x += p.speedX * 0.4;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 50) {
        p.y = -30;
        p.x = Math.random() * width;
        p.speedY = Math.random() * 6 + 4;
        p.speedX = Math.random() * 2 - 1;
        p.color = getConfettiColor();
      }
      if (p.x > width + 30) p.x = -30;
      if (p.x < -30) p.x = width + 30;
    });
    animationId = requestAnimationFrame(drawConfetti);
  }

  function startConfetti() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    initConfetti();
    drawConfetti();
    setTimeout(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        ctx.clearRect(0, 0, width, height);
      }
    }, 4000);
  }

  window.addEventListener('resize', resizeCanvas);

  const celebrateBtn = document.getElementById('celebrateBtn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      startConfetti();
    });
  }

  // ---------- WISHING WALL (localStorage) ----------
  const STORAGE_KEY = 'andrew_birthday_wishes';

  // Default wishes (birthday messages)
  const defaultWishes = [
    { id: '1', name: 'Kuya Joel', message: 'Happy birthday Andrew! Your passion for bass and coffee inspires us all. Keep serving the Lord with that fire! 🙌', timestamp: new Date(Date.now() - 86400000).toLocaleString() },
    { id: '2', name: 'BCCC Youth', message: 'Brother, your service is a blessing. May God continue to guide your path! Enjoy your day 🎂🎸', timestamp: new Date(Date.now() - 43200000).toLocaleString() },
    { id: '3', name: 'Pastor Rick', message: 'Thank you for your dedication, Andrew. Keep shining for Jesus! We are proud of you.', timestamp: new Date(Date.now() - 7200000).toLocaleString() }
  ];

  function loadWishes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch(e) { return [...defaultWishes]; }
    } else {
      // first time: save defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWishes));
      return [...defaultWishes];
    }
  }

  function saveWishes(wishes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  }

  let wishes = loadWishes();

  function renderWishes() {
    const container = document.getElementById('wishListContainer');
    const countSpan = document.getElementById('wishCountDisplay');
    if (!container) return;
    
    if (!wishes.length) {
      container.innerHTML = '<div class="empty-wishes">✨ No wishes yet — be the first to leave a birthday blessing! ✨</div>';
      if (countSpan) countSpan.innerText = '💬 0 wishes';
      return;
    }
    
    // Sort by newest first (timestamp descending)
    const sorted = [...wishes].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    container.innerHTML = '';
    sorted.forEach(wish => {
      const wishDiv = document.createElement('div');
      wishDiv.className = 'wish-item';
      wishDiv.dataset.id = wish.id;
      wishDiv.innerHTML = `
        <div class="wish-content">
          <div class="wish-name"><i class="fas fa-user-astronaut"></i> ${escapeHtml(wish.name)}</div>
          <div class="wish-message">${escapeHtml(wish.message)}</div>
          <div class="wish-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(wish.timestamp)}</div>
        </div>
        <button class="delete-wish" data-id="${wish.id}" aria-label="Delete wish"><i class="fas fa-trash-alt"></i></button>
      `;
      container.appendChild(wishDiv);
    });
    
    // Attach delete events
    document.querySelectorAll('.delete-wish').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        deleteWishById(id);
      });
    });
    
    if (countSpan) countSpan.innerText = `💬 ${wishes.length} ${wishes.length === 1 ? 'wish' : 'wishes'}`;
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
      return c;
    });
  }
  
  function deleteWishById(id) {
    wishes = wishes.filter(w => w.id !== id);
    saveWishes(wishes);
    renderWishes();
  }
  
  function addWish(name, message) {
    if (!name.trim() || !message.trim()) {
      alert("Please enter both your name and a wish message 💙");
      return false;
    }
    const newWish = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      name: name.trim().substring(0, 40),
      message: message.trim().substring(0, 280),
      timestamp: new Date().toLocaleString()
    };
    wishes.unshift(newWish);
    saveWishes(wishes);
    renderWishes();
    return true;
  }
  
  // Submit button handler
  const submitBtn = document.getElementById('submitWishBtn');
  const nameInput = document.getElementById('wishNameInput');
  const msgInput = document.getElementById('wishMessageInput');
  
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = nameInput ? nameInput.value : '';
      const msg = msgInput ? msgInput.value : '';
      if (addWish(name, msg)) {
        if (nameInput) nameInput.value = '';
        if (msgInput) msgInput.value = '';
        // Optional: show a small confetti burst for the new wish
        startConfetti();  // celebrate each new wish!
      }
    });
  }
  
  // Allow pressing Enter (Ctrl+Enter) in textarea to submit
  if (msgInput) {
    msgInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitBtn.click();
      }
    });
  }
  
  // Initial render
  renderWishes();
})();