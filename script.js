// script.js
document.addEventListener('DOMContentLoaded', () => {

  // --- 1) 텍스트 슬라이드 애니메이션 ---
  const txtList = document.getElementById('animatedText');
  let isAnimating = false;

  function updateActive() {
    const lis = txtList.querySelectorAll('li');
    lis.forEach(li => li.classList.remove('active'));
    if (lis[0]) lis[0].classList.add('active');
  }

  function slideUp() {
    if (isAnimating) return;
    isAnimating = true;

    const itemH = txtList.querySelector('li').getBoundingClientRect().height;
    txtList.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    txtList.style.transform = `translate3d(0, -${itemH}px, 0)`;

    txtList.addEventListener('transitionend', function handler() {
      txtList.removeEventListener('transitionend', handler);
      txtList.style.transition = 'none';
      txtList.appendChild(txtList.firstElementChild);
      txtList.style.transform = 'translate3d(0, 0, 0)';
      txtList.offsetHeight;  // force reflow
      txtList.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      updateActive();
      isAnimating = false;
    }, { once: true });
  }

  updateActive();
  setInterval(slideUp, 2000);


  // --- 2) 로그인 폼 핸들러 ---
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const nameVal    = document.getElementById('name').value.trim();
      const comboVal   = document.getElementById('combo').value;
      const accountVal = document.getElementById('account').value.trim();

      try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { users } = await res.json();

        const user = users.find(u =>
          u.name    === nameVal &&
          u.combo   === comboVal &&
          u.account === accountVal
        );

        if (user) {
          sessionStorage.setItem('userData', JSON.stringify(user));
          window.location.href = 'account.html';
        } else {
          alert('입력하신 정보가 일치하지 않습니다. 다시 확인해 주세요.');
        }

      } catch (err) {
        console.error(err);
        alert('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  }


// --- 3) 협력사 캐러셀 (정확히 한 칸씩 슬라이드) ---
const viewport = document.querySelector('.partner-viewport');
const list     = document.querySelector('.partner-list');
const items    = Array.from(list.children);
const prevBtn  = document.querySelector('.partner-header .partner-btn.prev');
const nextBtn  = document.querySelector('.partner-header .partner-btn.next');
let index      = 0;

// 화면에 보이는 아이템 개수 결정
function getVisibleCount() {
  return window.matchMedia('(max-width: 600px)').matches ? 3 : 6;
}

// 버튼 활성화 업데이트
function updateButtons() {
  const visible = getVisibleCount();
  const maxIdx  = items.length - visible;
  prevBtn.classList.toggle('disabled', index <= 0);
  nextBtn.classList.toggle('disabled', index >= maxIdx);

  prevBtn.querySelector('img').src = index <= 0
    ? 'images/left_arrow.png'
    : 'images/left_arrow.png';
  nextBtn.querySelector('img').src = index >= maxIdx
    ? 'images/right_arrow.png'
    : 'images/right_arrow.png';
}

// 슬라이드
function slidePartners() {
  const visible = getVisibleCount();
  const itemEl  = list.querySelector('.partner-item');
  const itemW   = itemEl.getBoundingClientRect().width;
  const gap     = parseFloat(getComputedStyle(list).gap) || 0;
  const shiftPx = index * (itemW + gap);

  list.style.transform = `translateX(-${shiftPx}px)`;
}

// 이벤트 연결
prevBtn.addEventListener('click', () => {
  if (index > 0) {
    index--;
    slidePartners();
    updateButtons();
  }
});
nextBtn.addEventListener('click', () => {
  const visible = getVisibleCount();
  const maxIdx  = items.length - visible;
  if (index < maxIdx) {
    index++;
    slidePartners();
    updateButtons();
  }
});

// 리사이즈 대응
window.addEventListener('resize', () => {
  const visible = getVisibleCount();
  const maxIdx  = items.length - visible;
  index = Math.min(index, maxIdx);
  slidePartners();
  updateButtons();
});

// 초기화
slidePartners();
updateButtons();

});



const prevBtn = document.querySelector('.event-btn.prev');
const nextBtn = document.querySelector('.event-btn.next');
const eventList = document.querySelector('.event-list');

let currentIndex = 0;

// 각 뷰에서 보여줄 아이템 개수에 따라 이동폭 조절 (미디어 쿼리와 동일하게)
function getVisibleCount() {
  const width = window.innerWidth;
  if (width <= 480) return 1;
  if (width <= 768) return 2;
  return 3;
}

// 버튼 활성화 업데이트 함수
function updateButtons() {
  const visibleCount = getVisibleCount();
  const maxIndex = eventList.children.length - visibleCount;

  // 이전 버튼 비활성화 처리
  if (currentIndex <= 0) {
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.classList.remove('disabled');
  }

  // 다음 버튼 비활성화 처리
  if (currentIndex >= maxIndex) {
    nextBtn.classList.add('disabled');
  } else {
    nextBtn.classList.remove('disabled');
  }
}

// 슬라이드 위치 업데이트 함수
function updateSlide() {
  const visibleCount = getVisibleCount();
  const totalItems = eventList.children.length;
  const maxIndex = totalItems - visibleCount;

  // currentIndex가 범위 내에 있도록 조정
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > maxIndex) currentIndex = maxIndex;

  const itemWidth = eventList.children[0].offsetWidth;
  const gap = 16; // CSS gap 값
  const moveX = (itemWidth + gap) * currentIndex;

  eventList.style.transform = `translateX(-${moveX}px)`;

  updateButtons();
}

// 버튼 클릭 이벤트
prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateSlide();
  }
});

nextBtn.addEventListener('click', () => {
  const visibleCount = getVisibleCount();
  const maxIndex = eventList.children.length - visibleCount;

  if (currentIndex < maxIndex) {
    currentIndex++;
    updateSlide();
  }
});

// 윈도우 리사이즈 시 슬라이드 및 버튼 상태 업데이트
window.addEventListener('resize', () => {
  const visibleCount = getVisibleCount();
  const maxIndex = eventList.children.length - visibleCount;

  // currentIndex 범위 재조정
  currentIndex = Math.min(currentIndex, maxIndex);
  updateSlide();
});

// 초기화
updateSlide();