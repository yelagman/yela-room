import gsap from "gsap";

/**
 * Modal Manager
 * Handles all modals (Work, About, Contact) with full GSAP transitions.
 */
export function createModalManager({ modals, overlay, controls, playHoverAnimation, sharedState }) {
  let touchHappened = false;
  let isModalOpen = false;
  let isTransitioning = false;
  let lastModalOpenTime = Date.now();

  // --- Scroll lock helpers (for Safari especially) ---
  let scrollY = 0;
  function lockBodyScroll() {
    // works for iOS Safari
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.classList.add("modal-open");
  }

  function unlockBodyScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.classList.remove("modal-open");
    window.scrollTo(0, scrollY);
  }

  const getOpenModal = () => document.querySelector('.modal[style*="display: block"]');

  function attemptCloseModal() {
    if (Date.now() - lastModalOpenTime < 300) return;
    const modal = getOpenModal();
    if (modal) hideModal(modal);
  }

  // --- Overlay events ---
  overlay.addEventListener("touchend", (e) => {
    e.preventDefault();
    attemptCloseModal();
  }, { passive: false });

  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    attemptCloseModal();
  }, { passive: false });

  // --- Exit button handlers ---
  document.querySelectorAll(".modal-exit-button").forEach((button) => {
    const handleModalExit = (e) => {
      e.preventDefault();
      const modal = e.target.closest(".modal");

      gsap.fromTo(button, { scale: 1, rotate: -15 }, {
        scale: 1.3,
        rotate: 45,
        duration: 0.3,
        ease: "back.out(2)",
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.set(button, { clearProps: "all" }),
      });

      hideModal(modal);
    };

    button.addEventListener("touchend", (e) => {
      touchHappened = true;
      handleModalExit(e);
    }, { passive: false });

    button.addEventListener("click", (e) => {
      if (touchHappened) return;
      handleModalExit(e);
    }, { passive: false });
  });

  // --- Show modal ---
  function showModal(modal) {
    if (!modal || isTransitioning) return;

    isTransitioning = true;
    modal.style.display = "block";
    overlay.style.display = "block";
    lockBodyScroll(); // ✅ lock background scroll on iOS

    isModalOpen = true;
    controls.enabled = false;
    lastModalOpenTime = Date.now();

    if (sharedState.currentHoveredObject) {
      playHoverAnimation(sharedState.currentHoveredObject, false);
      sharedState.currentHoveredObject = null;
      sharedState.currentIntersects = [];
    }

    document.body.style.cursor = "default";

    gsap.set(modal, { opacity: 0, scale: 0.8 });
    gsap.set(overlay, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => { isTransitioning = false; }
    });

    tl.to(overlay, { opacity: 1, duration: 0.3 })
      .to(modal, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, "<");
  }

  // --- Hide modal ---
  function hideModal(modal) {
    if (!modal || isTransitioning) return;

    isTransitioning = true;
    isModalOpen = false;
    controls.enabled = true;

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        modal.style.display = "none";
        overlay.style.display = "none";
        touchHappened = false;
        isTransitioning = false;
        unlockBodyScroll();
      }
    });

    tl.to(overlay, { opacity: 0, duration: 0.3 })
      .to(modal, { opacity: 0, scale: 0.8, duration: 0.4, ease: "back.in(1.7)" }, "<");
  }

  // --- Public API ---
  return {
    showModal,
    hideModal,
    isModalOpen: () => isModalOpen,
    attemptCloseModal,
    getOpenModal,
  };
}
