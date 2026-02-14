window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".size-header h1", { opacity: 0, y: 40, duration: 1, ease: "power2.out" });
  gsap.from(".size-header p", { opacity: 0, y: 20, duration: 1, delay: 0.3 });
  gsap.from(".size-chart", {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: { trigger: ".size-chart", start: "top 85%" },
  });
  gsap.from(".options", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: { trigger: ".options", start: "top 85%" },
  });
});
