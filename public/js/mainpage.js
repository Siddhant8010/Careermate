// FAQ toggle with smooth height animation
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  const open = () => {
    item.classList.add("active");
    // Set to auto to measure, then animate from 0 -> full height
    answer.style.height = "auto";
    const full = answer.scrollHeight;  // measure with padding applied by .active
    answer.style.height = "0px";
    // force reflow
    answer.offsetHeight;
    answer.style.height = full + "px";
  };

  const close = () => {
    // Animate from current height -> 0
    const current = answer.scrollHeight;
    answer.style.height = current + "px";
    // force reflow
    answer.offsetHeight;
    answer.style.height = "0px";
    item.classList.remove("active");
  };

  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("active");

    // Close all other items
    faqItems.forEach((other) => {
      if (other !== item) {
        const otherAnswer = other.querySelector(".faq-answer");
        other.classList.remove("active");
        if (otherAnswer) otherAnswer.style.height = "0px";
      }
    });

    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  // After opening finishes, set height to auto so it adapts to content/resizes
  answer.addEventListener("transitionend", (e) => {
    if (e.propertyName === "height") {
      if (item.classList.contains("active")) {
        answer.style.height = "auto";
      }
    }
  });
});

// Keep open items correct on resize
window.addEventListener("resize", () => {
  document.querySelectorAll(".faq-item.active .faq-answer").forEach((ans) => {
    ans.style.height = "auto";
  });
});
// Career section inline image slider (auto crossfade)
const imageContainer = document.querySelector('.career-test-image .image-container');
if (imageContainer) {
  const existingImg = imageContainer.querySelector('img');
  const images = [
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3184170/pexels-photo-3184170.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ];

  // Preload images
  images.forEach((src) => { const i = new Image(); i.src = src; });

  // Create two stacked <img> for crossfade
  const imgA = document.createElement('img');
  const imgB = document.createElement('img');
  [imgA, imgB].forEach((img) => {
    img.className = 'slide-img';
    img.alt = existingImg ? (existingImg.alt || 'Career image') : 'Career image';
    img.loading = 'eager';
    imageContainer.appendChild(img);
  });

  // Keep original image in flow to preserve container height
  if (existingImg) existingImg.style.visibility = 'hidden';

  let index = 0;
  let showingA = true;
  const intervalMs = 3500;

  imgA.src = images[0];
  imgA.classList.add('visible');

  const advance = () => {
    index = (index + 1) % images.length;
    const target = showingA ? imgB : imgA;
    const other = showingA ? imgA : imgB;
    target.src = images[index];
    // trigger transition
    target.offsetHeight; // reflow
    other.classList.remove('visible');
    target.classList.add('visible');
    showingA = !showingA;
  };

  setInterval(advance, intervalMs);
}
// ✅ Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const authButtons = document.querySelector(".auth-buttons");
    const backdrop = document.querySelector(".mobile-menu-backdrop");
  
    if (toggleBtn && navLinks && authButtons) {
      const toggleMenu = () => {
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", !isExpanded);
  
        // Create combined menu when opening
        if (!isExpanded) {
          // Clone auth buttons and append to nav-links
          const authClone = authButtons.cloneNode(true);
          authClone.classList.add("mobile-auth-section");
          authClone.style.display = "flex";
          authClone.style.flexDirection = "column";
          authClone.style.gap = "var(--space-3)";
          authClone.style.padding = "var(--space-4)";
          authClone.style.borderTop = "2px solid var(--gray-200)";
          navLinks.appendChild(authClone);
        } else {
          // Remove cloned auth buttons
          const mobileAuth = navLinks.querySelector(".mobile-auth-section");
          if (mobileAuth) {
            mobileAuth.remove();
          }
        }
  
        // Toggle visibility for mobile
        navLinks.classList.toggle("open");
        if (backdrop) {
          backdrop.classList.toggle("open");
        }
      };

      const closeMenu = () => {
        toggleBtn.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("open");
        if (backdrop) {
          backdrop.classList.remove("open");
        }
        // Remove cloned auth buttons
        const mobileAuth = navLinks.querySelector(".mobile-auth-section");
        if (mobileAuth) {
          mobileAuth.remove();
        }
      };

      // Toggle menu on button click
      toggleBtn.addEventListener("click", toggleMenu);

      // Close menu when clicking backdrop
      if (backdrop) {
        backdrop.addEventListener("click", closeMenu);
      }

      // Close menu when clicking nav links
      navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
      });

      // Close menu on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navLinks.classList.contains("open")) {
          closeMenu();
        }
      });
    }
  });
  


