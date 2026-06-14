/* ==========================================================================
   SpinWheel Web Portal - Main Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollSpy();
  initMobileDrawer();
});

/* --------------------------------------------------------------------------
   1. 主题初始化与切换 (Theme Management)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // 1. 获取本地存储的偏好，若无，则检测系统首选项
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // 2. 绑定切换事件
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    
    // 保存设置
    if (document.body.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });

  // 3. 监听系统暗色模式变化 (仅当用户未手动设置时生效)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  });
}

/* --------------------------------------------------------------------------
   2. 滚动监听高亮侧栏目录 (ScrollSpy via IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('.article-section');
  const outlineItems = document.querySelectorAll('.outline-item');
  
  if (sections.length === 0 || outlineItems.length === 0) return;

  // 使用 IntersectionObserver 监听章节进入视图的状况
  const observerOptions = {
    root: null,
    // rootMargin 调节判断线。当章节到达视口中上方时被标记为 active
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        
        // 遍历所有目录项，设置 active 状态
        outlineItems.forEach((item) => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${activeId}`) {
            item.classList.add('active');
            
            // 如果是在移动端抽屉里，点击跳转后可平滑滚入对应目录可见区域
            if (item.closest('.mobile-drawer')) {
              item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
}

/* --------------------------------------------------------------------------
   3. 移动端抽屉目录导航 (Mobile Outline Drawer)
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const trigger = document.getElementById('mobile-outline-trigger');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('.mobile-drawer .outline-item a');

  if (!trigger || !overlay || !drawer) return;

  // 展开抽屉
  const openDrawer = () => {
    overlay.style.display = 'block';
    // 强制回流以让 transition 动画生效
    overlay.offsetHeight;
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden'; // 阻止背景页滚动
  };

  // 关闭抽屉
  const closeDrawer = () => {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
    
    // 动画结束后完全隐藏
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 250); // 与 CSS 中的 transition-speed 对应
  };

  trigger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // 点击抽屉内链接后自动关闭抽屉
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      // 允许平滑滚动开始后再关闭抽屉
      setTimeout(closeDrawer, 100);
    });
  });
}
