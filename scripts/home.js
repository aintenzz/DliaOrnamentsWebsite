// ================================
// HERO ANIMATION (GSAP)
// ================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.from(".hero-logo", {
    opacity: 0,
    y: -50,
    duration: 1,
    ease: "power3.out"
  });

  gsap.from(".hero p", {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.5,
    ease: "power3.out"
  });

  gsap.from(".btn.gold-btn", {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.8,
    ease: "power3.out"
  });
});

// ================================
// SCROLL ANIMATIONS FOR SECTIONS
// ================================
gsap.utils.toArray(".bracelet, .link, .about, .faqs, .contact").forEach((el) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power3.out",
    stagger: 0.2
  });
});

// ================================
// FAQ TOGGLE
// ================================
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const faqItem = button.parentElement;
    faqItem.classList.toggle("active");
  });
});

// ================================
// HAMBURGER MENU TOGGLE
// ================================
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// ================================
// LOCAL STORAGE FOR CUSTOMIZE MODE
// ================================
document.querySelectorAll(".link a").forEach((btn) => {
  btn.addEventListener("click", () => {
    localStorage.setItem("customizedMode", "true");
  });
});

// ================================
// SMOOTH SCROLL FOR ANCHORS
// ================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Close nav menu on mobile after click
    if (navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
    }
  });
});
