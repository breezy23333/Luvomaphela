/* LUVO MAPHELA — PORTFOLIO JAVASCRIPT */

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /*
   * Add your real project URLs below.
   * Leave unavailable links empty.
   */
  const projectLinks = {
    "cyber-runner": {
      demo: "",
      code: ""
    },
    "fantasy-ui": {
      demo: "",
      assets: ""
    },
    "space-combat": {
      demo: "",
      code: ""
    },
    featured: {
      demo: "",
      code: ""
    }
  };

  /* Your existing showcase projects. */
  const showcaseItems = [
    {
      id: 1,
      title: "Neon City Chase",
      category: "Games",
      type: "Game Demo",
      background: "linear-gradient(135deg, #143a40, #34315d)",
      description:
        "High-speed racing game through a cyberpunk cityscape with dynamic lighting and particle effects.",
      tech: ["Unity", "C#", "Shader Graph"],
      demo: "",
      code: ""
    },
    {
      id: 2,
      title: "Dragon Flight Animation",
      category: "Animations",
      type: "3D Animation",
      background: "linear-gradient(135deg, #562632, #6a4323)",
      description:
        "Cinematic dragon flight sequence with particle systems and fire effects.",
      tech: ["Blender", "Maya", "Houdini"],
      demo: "",
      code: ""
    },
    {
      id: 3,
      title: "Game Launch Trailer",
      category: "Videos",
      type: "Video Edit",
      background: "linear-gradient(135deg, #214454, #16493e)",
      description:
        "A trailer showcasing game features through editing and sound design.",
      tech: ["Premiere Pro", "After Effects", "DaVinci"],
      demo: "",
      code: ""
    },
    {
      id: 4,
      title: "RPG Interface Design",
      category: "UI/UX",
      type: "UI Design",
      background: "linear-gradient(135deg, #37294e, #603247)",
      description:
        "An interface suite for a fantasy RPG with animated elements and intuitive navigation.",
      tech: ["Figma", "Unity UI", "CSS"],
      demo: "",
      code: ""
    },
    {
      id: 5,
      title: "Space Combat Demo",
      category: "Games",
      type: "Gameplay",
      background: "linear-gradient(135deg, #24264f, #1b4462)",
      description:
        "Space combat with procedural asteroid fields and AI-driven enemies.",
      tech: ["Unreal Engine", "C++", "Blueprint"],
      demo: "",
      code: ""
    },
    {
      id: 6,
      title: "Character Showcase",
      category: "Animations",
      type: "Animation Reel",
      background: "linear-gradient(135deg, #16493e, #214454)",
      description:
        "A character animation reel featuring rigging and motion capture.",
      tech: ["Maya", "MotionBuilder", "Zbrush"],
      demo: "",
      code: ""
    }
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function safeURL(value) {
    if (!value || !value.trim()) return null;

    try {
      const url = new URL(value, document.baseURI);
      return ["https:", "http:"].includes(url.protocol)
        ? url.href
        : null;
    } catch {
      return null;
    }
  }

  function openProjectLink(value, label) {
    const url = safeURL(value);

    if (!url) {
      notify(`${label} is not linked yet.`, "Project link");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  let toastTimer;
  let toastHideTimer;

  function notify(message, title = "Portfolio") {
    const toast = $("#toast");
    if (!toast) return;

    clearTimeout(toastTimer);
    clearTimeout(toastHideTimer);

    const heading = $(".toast-title", toast);
    const description = $(".toast-description", toast);

    if (heading) heading.textContent = title;
    if (description) description.textContent = message;

    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.classList.remove("hidden");
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");

      toastHideTimer = setTimeout(() => {
        toast.classList.add("hidden");
      }, 250);
    }, 6500);
  }

  /* 1. INTRO */

  function initIntro() {
    const intro = $("#intro");
    if (!intro) return;

    const skip = $("#skipIntro");
    const storageKey = "luvo-portfolio-intro";
    let seen = false;
    let timer;

    try {
      seen = sessionStorage.getItem(storageKey) === "seen";
    } catch {
      // The page still works when browser storage is unavailable.
    }

    function closeIntro() {
      clearTimeout(timer);

      const hadFocus = intro.contains(document.activeElement);
      intro.classList.add("intro-hide");
      intro.hidden = true;

      try {
        sessionStorage.setItem(storageKey, "seen");
      } catch {
        // Storage is optional.
      }

      if (hadFocus) $(".nav-logo")?.focus();
    }

    skip?.addEventListener("click", closeIntro);

    if (seen || reducedMotion.matches) {
      closeIntro();
    } else {
      timer = setTimeout(closeIntro, 1800);
    }
  }

  /* 2. MOBILE MENU & ACTIVE NAVIGATION */

  function initNavigation() {
    let toggle = $(".mobile-menu-btn");
    const menu = $(".mobile-menu");
    const mobile = window.matchMedia("(max-width: 800px)");

    /*
     * The supplied HTML uses a div for the menu control.
     * Replace it with a real keyboard-accessible button.
     */
    if (toggle && toggle.tagName !== "BUTTON") {
      const button = element("button", toggle.className);
      button.type = "button";
      button.append(...toggle.childNodes);
      toggle.replaceWith(button);
      toggle = button;
    }

    function setMenu(open, returnFocus = false) {
      if (!toggle || !menu) return;

      const isOpen = open && mobile.matches;
      toggle.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

      menu.classList.toggle("active", isOpen);
      menu.hidden = !isOpen;

      if (returnFocus && mobile.matches) toggle.focus();
    }

    if (toggle && menu) {
      menu.id ||= "mobileNavigation";
      toggle.setAttribute("aria-controls", menu.id);
      setMenu(false);

      toggle.addEventListener("click", () => {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
      });

      menu.addEventListener("click", event => {
        const link = event.target.closest("a");
        if (!link) return;

        setMenu(false);

        const id = link.getAttribute("href")?.slice(1);
        const section = id ? document.getElementById(id) : null;

        if (section) {
          section.setAttribute("tabindex", "-1");
          section.focus({ preventScroll: true });
        }
      });

      document.addEventListener("click", event => {
        if (
          !menu.hidden &&
          !menu.contains(event.target) &&
          !toggle.contains(event.target)
        ) {
          setMenu(false, menu.contains(document.activeElement));
        }
      });

      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !menu.hidden) {
          setMenu(false, true);
        }
      });

      mobile.addEventListener("change", () => {
        const focusInMenu =
          menu.contains(document.activeElement) ||
          document.activeElement === toggle;

        setMenu(false);

        if (focusInMenu) {
          (mobile.matches ? toggle : $(".nav-logo"))?.focus();
        }
      });
    }

    /*
     * Allow normal anchor navigation.
     * Only intercept empty placeholder links.
     */
    $$('a[href="#"]').forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        notify(
          `${link.textContent.trim()} has not been linked yet.`,
          "Link unavailable"
        );
      });
    });

    const links = $$(".nav-link, .mobile-link");
    const sections = $$("section[id]").filter(section =>
      links.some(link => link.hash === `#${section.id}`)
    );

    let queued = false;

    function updateActiveLink() {
      queued = false;
      let active = sections[0];

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 150) {
          active = section;
        }
      }

      if (!active) return;

      links.forEach(link => {
        const selected = link.hash === `#${active.id}`;
        link.classList.toggle("active", selected);

        if (selected) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(updateActiveLink);
      },
      { passive: true }
    );

    updateActiveLink();
  }

  /* 3. ACCESSIBLE PROJECT MODAL */

  function initModal() {
    const modal = $("#projectModal");
    const body = $("#modalBody");
    const closeButton = $("#modalClose");

    if (!modal || !body || !closeButton) {
      return {
        open() {
          notify("The project details panel is unavailable.");
        }
      };
    }

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "projectDialogTitle");
    closeButton.setAttribute("aria-label", "Close project details");

    let previousFocus = null;
    let backgroundState = [];

    function close() {
      if (modal.classList.contains("hidden")) return;

      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
      body.replaceChildren();

      backgroundState.forEach(([node, wasInert]) => {
        node.inert = wasInert;
      });

      backgroundState = [];

      if (previousFocus?.isConnected) previousFocus.focus();
    }

    function open(item) {
      previousFocus = document.activeElement;

      const category = element("p", "project-category", item.category);
      const title = element("h2", "section-title", item.title);
      title.id = "projectDialogTitle";

      const description = element(
        "p",
        "project-description",
        item.description
      );

      const tags = element("div", "tech-stack");

      item.tech.forEach(tech => {
        tags.append(element("span", "tech-tag", tech));
      });

      const actions = element("div", "featured-buttons");

      [
        ["Open project ↗", item.demo],
        ["View code ↗", item.code],
        ["View assets ↗", item.assets]
      ].forEach(([label, value]) => {
        const url = safeURL(value);
        if (!url) return;

        const link = element("a", "btn btn-primary", label);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        actions.append(link);
      });

      body.replaceChildren(category, title, description, tags);

      if (actions.childElementCount) {
        body.append(actions);
      } else {
        body.append(
          element(
            "p",
            "project-description",
            "A live demo or project link has not been added yet."
          )
        );
      }

      backgroundState = [...document.body.children]
        .filter(node => node !== modal && node instanceof HTMLElement)
        .map(node => [node, node.inert]);

      backgroundState.forEach(([node]) => {
        node.inert = true;
      });

      modal.classList.remove("hidden");
      document.body.classList.add("modal-open");
      closeButton.focus();
    }

    closeButton.addEventListener("click", close);
    $(".modal-overlay", modal)?.addEventListener("click", close);

    document.addEventListener("keydown", event => {
      if (modal.classList.contains("hidden")) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = $$(
        'a[href], button:not([disabled]), [tabindex="0"]',
        modal
      ).filter(node => node.getClientRects().length);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    return { open, close };
  }

  /* 4. SHOWCASE & CATEGORY FILTERS */

  function initShowcase(dialog) {
    const grid = $("#showcaseGrid");
    if (!grid) return;

    const fragment = document.createDocumentFragment();
    const cards = [];

    showcaseItems.forEach(item => {
      const card = element("article", "showcase-item");
      card.dataset.category = item.category;

      const thumbnail = element("div", "item-thumbnail");
      thumbnail.style.background = item.background;

      const overlay = element("div", "play-overlay");
      const preview = element("button", "play-button", "↗");
      preview.type = "button";
      preview.setAttribute("aria-label", `View ${item.title}`);
      preview.addEventListener("click", () => dialog.open(item));

      overlay.append(preview);
      thumbnail.append(
        overlay,
        element("span", "category-badge", item.type)
      );

      const content = element("div", "item-content");
      const tags = element("div", "tech-stack");

      item.tech.forEach(tech => {
        tags.append(element("span", "tech-tag", tech));
      });

      const details = element(
        "button",
        "view-details",
        "View project details ↗"
      );

      details.type = "button";
      details.addEventListener("click", () => dialog.open(item));

      content.append(
        element("p", "item-category", item.category),
        element("h3", "item-title", item.title),
        element("p", "item-description", item.description),
        tags,
        details
      );

      card.append(thumbnail, content);
      cards.push(card);
      fragment.append(card);
    });

    grid.replaceChildren(fragment);

    const filters = $$(".filter-btn");

    function applyFilter(category) {
      filters.forEach(button => {
        const active = button.dataset.category === category;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      cards.forEach(card => {
        card.hidden =
          category !== "All" &&
          card.dataset.category !== category;
      });
    }

    filters.forEach(button => {
      button.type = "button";
      button.addEventListener("click", () => {
        applyFilter(button.dataset.category);
      });
    });

    applyFilter("All");

    /*
     * Replace the old hard-coded download/rating counters
     * with counts derived from the actual showcase entries.
     */
    const stats = $$(".stats-grid .stat-item");

    const totals = [
      [showcaseItems.length, "Showcase projects"],
      [new Set(showcaseItems.map(item => item.category)).size, "Categories"],
      [
        new Set(showcaseItems.flatMap(item => item.tech)).size,
        "Tools & technologies"
      ]
    ];

    stats.forEach((stat, index) => {
      if (!totals[index]) return;
      const number = $(".stat-number", stat);
      const label = $(".stat-label", stat);

      if (number) number.textContent = String(totals[index][0]);
      if (label) label.textContent = totals[index][1];
    });
  }

  /* 5. EXISTING GAME PROJECT BUTTONS */

  function initProjectButtons(dialog) {
    $$(".project-card[data-project]").forEach(card => {
      const key = card.dataset.project;
      const links = projectLinks[key] || {};

      const item = {
        title: $(".project-title", card)?.textContent.trim() || "Project",
        category:
          $(".project-category", card)?.textContent.trim() || "Project",
        description:
          $(".project-description", card)?.textContent.trim() || "",
        tech: $$(".tag", card).map(tag => tag.textContent.trim()),
        ...links
      };

      $$(".btn", card).forEach(button => {
        button.type = "button";

        button.addEventListener("click", () => {
          const action = button.textContent.trim().toLowerCase();

          if (action.includes("details")) {
            dialog.open(item);
          } else if (action.includes("code")) {
            openProjectLink(links.code, `${item.title} repository`);
          } else if (action.includes("assets")) {
            openProjectLink(links.assets, `${item.title} assets`);
          } else {
            openProjectLink(links.demo, `${item.title} demo`);
          }
        });
      });
    });

    $("#featuredPlayBtn")?.addEventListener("click", () => {
      openProjectLink(projectLinks.featured.demo, "Featured demo");
    });

    $(".featured-buttons .btn-outline")?.addEventListener("click", () => {
      openProjectLink(projectLinks.featured.code, "Featured repository");
    });

    const oldPlay = $(".demo-content .play-button");

    if (oldPlay) {
      const button = element("button", "play-button");
      button.type = "button";
      button.setAttribute("aria-label", "Open featured demo");
      button.append(...oldPlay.childNodes);
      oldPlay.replaceWith(button);

      button.addEventListener("click", () => {
        openProjectLink(projectLinks.featured.demo, "Featured demo");
      });
    }
  }

  /* 6. CONTACT FORM */

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    const labels = {
      name: "Your name",
      email: "Your email",
      subject: "Subject",
      message: "Your message"
    };

    const fields = $$("input, textarea", form);

    fields.forEach(field => {
      field.setAttribute(
        "aria-label",
        labels[field.name] || field.placeholder || field.name
      );

      if (field.name === "name") field.autocomplete = "name";
      if (field.name === "email") field.autocomplete = "email";

      field.addEventListener("focus", () => {
        field.parentElement.classList.add("focused");
      });

      field.addEventListener("blur", () => {
        field.parentElement.classList.remove("focused");
      });

      field.addEventListener("input", () => {
        field.setCustomValidity("");
        field.classList.remove("error");
        field.removeAttribute("aria-invalid");
      });
    });

    const submit = $(".submit-btn", form);

    if (submit) {
      submit.replaceChildren(document.createTextNode("Create email draft ↗"));
    }

    const note = element(
      "p",
      "contact-desc",
      "Opens your email app with a draft. Review it and press Send there."
    );

    form.append(note);

    form.addEventListener("submit", event => {
      event.preventDefault();

      fields.forEach(field => {
        const blank = field.required && !field.value.trim();
        field.setCustomValidity(blank ? "Please complete this field." : "");
        field.classList.toggle("error", !field.validity.valid);
        field.setAttribute("aria-invalid", String(!field.validity.valid));
      });

      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const subject = String(data.get("subject") || "").trim();
      const message = String(data.get("message") || "").trim();

      const body = `${message}\n\nFrom: ${name}\nEmail: ${email}`;

      const mailto =
        "mailto:luvomaphela0@gmail.com" +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      notify(
        "An email draft was requested. Send it from your email app. If nothing opens, email luvomaphela0@gmail.com directly.",
        "Email draft"
      );

      window.location.href = mailto;
    });

    $$(".contact-value").forEach(value => {
      const text = value.textContent.trim();
      let href = "";

      if (text === "luvomaphela0@gmail.com") {
        href = `mailto:${text}`;
      } else if (text.startsWith("+27")) {
        href = `tel:${text.replace(/[^\d+]/g, "")}`;
      }

      if (!href) return;

      const link = element("a", "", text);
      link.href = href;
      value.replaceChildren(link);
    });
  }

  /* 7. OMINEX — LOCAL COMMAND DEMO */

  function initOminex() {
    const input = $("#ominexInput");
    const send = $("#ominexSend");
    const screen = $("#ominexScreen");

    if (!input || !send || !screen) return;

    input.setAttribute("aria-label", "OMINEX command");
    input.maxLength = 500;
    send.type = "button";

    screen.setAttribute("role", "log");
    screen.setAttribute("aria-live", "polite");
    screen.setAttribute("aria-relevant", "additions");

    const heading = $(".ominex-header h3");
    if (heading) heading.textContent = "OMINEX — Interactive Portfolio Guide";

    function addMessage(text, type = "ai") {
      screen.append(element("div", `msg ${type}`, text));

      while (screen.childElementCount > 40) {
        screen.firstElementChild.remove();
      }

      screen.scrollTop = screen.scrollHeight;
    }

    screen.replaceChildren();

    addMessage(
      'Welcome to OMINEX, a local command demo. Try "run it", "projects", "websites", "videos", "contact" or "help".'
    );

    function run() {
      const text = input.value.trim();
      if (!text) return;

      input.value = "";
      const command = text.toLowerCase().replace(/[.!?]+$/, "");

      if (command === "clear") {
        screen.replaceChildren();
        addMessage('Screen cleared. Type "help" for commands.');
        return;
      }

      addMessage(text, "user");

      const responses = {
        "run it":
          "OMINEX activated. Explore Luvo’s games, websites, animation and video work.",
        help:
          "Commands: run it, projects, websites, videos, skills, contact, clear.",
        projects:
          "The Featured Projects section includes Cyber Runner, Fantasy RPG Interface and Space Combat VR.",
        websites:
          "Explore Cinryvan for entertainment discovery and Lexryspell for word discovery. Both links are in My Websites.",
        videos:
          "Visit the Movie thinkers section to watch the three linked YouTube videos.",
        skills:
          "Luvo works across game development, web development, graphic and UI design, video editing and 3D animation.",
        contact:
          "Email luvomaphela0@gmail.com or use the contact form to create an email draft.",
        hello:
          'Hello! Type "help" to see the available commands.',
        hi:
          'Hi! Type "help" to explore the portfolio.'
      };

      addMessage(
        responses[command] ||
        'This is a local command demo, so I only recognise the listed commands. Type "help" to see them.'
      );
    }

    send.addEventListener("click", run);

    input.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        run();
      }
    });
  }

  /* 8. SCROLL REVEALS */

  function initReveals() {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );

    $$(
      ".skill-card, .project-card, .showcase-item, " +
      ".website-card, .youtube-card, .achievement"
    ).forEach(node => observer.observe(node));
  }

  /* 9. LIGHTWEIGHT ENERGY BACKGROUND */

  function initEnergy() {
    const canvas = $("#energy-canvas");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let previousTime = 0;
    let visible = true;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = window.innerWidth < 600 ? 22 : 48;

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 1.5 + 0.6
      }));
    }

    function draw(time) {
      frame = 0;

      if (document.hidden || reducedMotion.matches || !visible) return;

      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0;

      previousTime = time;
      context.clearRect(0, 0, width, height);

      particles.forEach(particle => {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        context.beginPath();
        context.fillStyle = "#c5f86b";
        context.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    }

    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;

      if (!document.hidden && !reducedMotion.matches && visible) {
        frame = requestAnimationFrame(draw);
      } else if (reducedMotion.matches) {
        context.clearRect(0, 0, width, height);
      }
    }

    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        resize();
        sync();
      }, 150);
    });

    document.addEventListener("visibilitychange", sync);

    reducedMotion.addEventListener("change", () => {
      resize();
      sync();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
      });

      observer.observe(canvas);
    }

    resize();
    sync();
  }

  /* 10. IMAGE FALLBACKS */

  function initImages() {
    $$("img").forEach(image => {
      image.decoding = "async";

      function handleError() {
        if (image.dataset.fallbackHandled) return;
        image.dataset.fallbackHandled = "true";

        const container = image.parentElement;
        image.hidden = true;

        const fallback = element(
          "span",
          "",
          image.alt || "Preview unavailable"
        );

        fallback.style.cssText =
          "position:absolute;inset:0;display:grid;" +
          "place-items:center;padding:24px;text-align:center;" +
          "color:#cbd3df;font-size:13px;pointer-events:none;";

        container?.append(fallback);
      }

      image.addEventListener("error", handleError, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        handleError();
      }
    });
  }

  /* START */

  function init() {
    initIntro();
    initNavigation();

    const dialog = initModal();

    initShowcase(dialog);
    initProjectButtons(dialog);
    initContactForm();
    initOminex();
    initImages();
    initReveals();
    initEnergy();

    const year = $("#currentYear");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();