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
   * Keep unavailable links empty.
   * Add real demo, repository or asset URLs when available.
   */
  const projectLinks = {
    blockcraft: {
      demo: "games/blockcraft/index.html",
      code: ""
    },
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

  /*
   * Additional existing Showcase work.
   * The ten cards already in index.html remain in place.
   * RPG Interface and Space Combat are not duplicated here.
   */
  const showcaseItems = [
    {
      id: "neon-city-chase",
      title: "Neon City Chase",
      category: "Games",
      type: "Game Demo",
      background: "url('img/neon-city-chase.png') center / cover no-repeat",
      description:
        "High-speed racing game through a cyberpunk cityscape with dynamic lighting and particle effects.",
      tech: ["Unity", "C#", "Shader Graph"],
      demo: "",
      code: ""
    },
    {
      id: "dragon-flight",
      title: "Dragon Flight Animation",
      category: "Animations",
      type: "3D Animation",
      background: "url('img/dragon-flight.png') center / cover no-repeat",
      description:
        "Cinematic dragon flight sequence with particle systems and fire effects.",
      tech: ["Blender", "Maya", "Houdini"],
      demo: "",
      code: ""
    },
    {
      id: "game-launch-trailer",
      title: "Game Launch Trailer",
      category: "Videos",
      type: "Video Edit",
      background: "url('img/game-launch-trailer.png') center / cover no-repeat",
      description:
        "A trailer showcasing game features through editing and sound design.",
      tech: ["Premiere Pro", "After Effects", "DaVinci"],
      demo: "",
      code: ""
    },
    {
      id: "character-showcase",
      title: "Character Showcase",
      category: "Animations",
      type: "Animation Reel",
      background: "url('img/character-showcase.png') center / cover no-repeat",
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
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }

    try {
      const url = new URL(value, document.baseURI);

      if (["https:", "http:"].includes(url.protocol)) {
        return url.href;
      }

      // Allow relative project links during local file previews.
      if (
        window.location.protocol === "file:" &&
        url.protocol === "file:"
      ) {
        return url.href;
      }

      return null;
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

  /* NOTIFICATIONS */

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

    toast.classList.remove("hidden");
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");

      toastHideTimer = setTimeout(() => {
        toast.classList.add("hidden");
      }, 250);
    }, 6500);
  }

  /* INTRO */

  function initIntro() {
    const intro = $("#intro");
    if (!intro) return;

    const storageKey = "luvo-portfolio-intro";
    let seen = false;
    let timer;

    try {
      seen = sessionStorage.getItem(storageKey) === "seen";
    } catch {
      // Storage is optional.
    }

    function closeIntro() {
      clearTimeout(timer);

      const hadFocus = intro.contains(document.activeElement);

      intro.classList.add("intro-hide");
      intro.hidden = true;
      intro.style.display = "none";

      try {
        sessionStorage.setItem(storageKey, "seen");
      } catch {
        // Storage is optional.
      }

      if (hadFocus) $(".nav-logo")?.focus();
    }

    $("#skipIntro")?.addEventListener("click", closeIntro);

    if (seen || reducedMotion.matches) {
      closeIntro();
    } else {
      timer = setTimeout(closeIntro, 1800);
    }
  }

  /* MOBILE MENU AND ACTIVE NAVIGATION */

  function initNavigation() {
    const toggle = $(".mobile-menu-btn");
    const menu = $(".mobile-menu");
    const mobile = window.matchMedia("(max-width: 800px)");

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

      if (returnFocus && mobile.matches) {
        toggle.focus();
      }
    }

    if (toggle && menu) {
      menu.id ||= "mobileMenu";
      toggle.setAttribute("aria-controls", menu.id);
      setMenu(false);

      toggle.addEventListener("click", () => {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
      });

      menu.addEventListener("click", event => {
        const link = event.target.closest("a");
        if (!link) return;

        setMenu(false);

        const href = link.getAttribute("href");

        if (!href?.startsWith("#")) return;

        const section = document.getElementById(href.slice(1));

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

      const offset =
        ($(".navbar")?.getBoundingClientRect().height || 100) + 30;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset) {
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

    function queueUpdate() {
      if (queued) return;

      queued = true;
      requestAnimationFrame(updateActiveLink);
    }

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    updateActiveLink();
  }

  /* ACCESSIBLE PROJECT MODAL */

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

    modal.setAttribute("aria-labelledby", "projectDialogTitle");
    modal.removeAttribute("aria-label");

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

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    }

    function open(item) {
      if (!modal.classList.contains("hidden")) {
        close();
      }

      previousFocus = document.activeElement;

      const category = element(
        "p",
        "project-category",
        item.category || "Showcase"
      );

      const title = element("h2", "section-title", item.title);
      title.id = "projectDialogTitle";

      const description = element(
        "p",
        "project-description",
        item.description || ""
      );

      const tags = element("div", "tech-stack");

      (item.tech || []).forEach(tech => {
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

  /* SHOWCASE — PRESERVE HTML CARDS AND ADD UNIQUE EXISTING WORK */

  function initShowcase(dialog) {
    const grid = $("#showcaseGrid");
    if (!grid) return;

    const existingTitles = new Set(
      $$("h3", grid).map(title =>
        title.textContent.trim().replace(/\s+/g, " ").toLowerCase()
      )
    );

    showcaseItems.forEach(item => {
      const titleKey = item.title.toLowerCase();

      if (existingTitles.has(titleKey)) return;

      const card = element("article", "showcase-item");
      card.dataset.category = item.category;
      card.dataset.showcaseId = item.id;

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
      grid.append(card);
      existingTitles.add(titleKey);
    });

    const cards = [...grid.children].filter(card =>
      card.matches(".project-card, .showcase-item")
    );

    const filters = $$("#showcase .filter-btn");

    // Existing CSS must not override hidden filtered cards.
    if (!$("#showcase-filter-visibility")) {
      const style = element("style");
      style.id = "showcase-filter-visibility";
      style.textContent = `
        #showcaseGrid > [hidden] {
          display: none !important;
        }
      `;
      document.head.append(style);
    }

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
        applyFilter(button.dataset.category || "All");
      });
    });

    applyFilter("All");

    // Update counters if a stats section is present.
    const totals = [
      [cards.length, "Showcase projects"],
      [
        new Set(cards.map(card => card.dataset.category)).size,
        "Categories"
      ],
      [
        new Set(
          $$(".tag, .tech-tag", grid).map(tag =>
            tag.textContent.trim()
          )
        ).size,
        "Tools & technologies"
      ]
    ];

    $$("#showcase .stats-grid .stat-item").forEach((stat, index) => {
      if (!totals[index]) return;

      const number = $(".stat-number", stat);
      const label = $(".stat-label", stat);

      if (number) number.textContent = String(totals[index][0]);
      if (label) label.textContent = totals[index][1];
    });
  }

  /* GAME BUTTONS AND FEATURED DEMO */

  function initProjectButtons(dialog) {
    $$("#showcase .project-card[data-project]").forEach(card => {
      const links = projectLinks[card.dataset.project] || {};

      const item = {
        title:
          $(".project-title", card)?.textContent.trim() || "Project",
        category:
          $(".project-category", card)?.textContent.trim() || "Showcase",
        description:
          $(".project-description", card)?.textContent.trim() || "",
        tech: $$(".tag", card).map(tag => tag.textContent.trim()),
        ...links
      };

      // Only handle buttons. Keep existing project links working normally.
      $$("button.btn", card).forEach(button => {
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

    $("#showcase .featured-section .btn-outline")
      ?.addEventListener("click", () => {
        openProjectLink(
          projectLinks.featured.code,
          "Featured repository"
        );
      });

    const oldPlay = $("#showcase .demo-content .play-button");

    if (oldPlay) {
      let button = oldPlay;

      if (oldPlay.tagName !== "BUTTON") {
        button = element("button", oldPlay.className);
        button.append(...oldPlay.childNodes);
        oldPlay.replaceWith(button);
      }

      button.type = "button";
      button.setAttribute("aria-label", "Open featured demo");

      button.addEventListener("click", () => {
        openProjectLink(projectLinks.featured.demo, "Featured demo");
      });
    }
  }

  /* CONTACT FORM */

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
        field.parentElement?.classList.add("focused");
      });

      field.addEventListener("blur", () => {
        field.parentElement?.classList.remove("focused");
      });

      field.addEventListener("input", () => {
        field.setCustomValidity("");
        field.classList.remove("error");
        field.removeAttribute("aria-invalid");
      });
    });

    const submit = $(".submit-btn", form);

    if (submit) {
      submit.replaceChildren(
        document.createTextNode("Create email draft ↗")
      );
    }

    form.append(
      element(
        "p",
        "contact-desc",
        "Opens your email app with a draft. Review it and press Send there."
      )
    );

    form.addEventListener("submit", event => {
      event.preventDefault();

      fields.forEach(field => {
        const blank = field.required && !field.value.trim();

        field.setCustomValidity(
          blank ? "Please complete this field." : ""
        );

        field.classList.toggle("error", !field.validity.valid);
        field.setAttribute(
          "aria-invalid",
          String(!field.validity.valid)
        );
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
  }

  /* OMINEX — LOCAL PORTFOLIO GUIDE */

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

    if (heading) {
      heading.textContent = "OMINEX — Interactive Portfolio Guide";
    }

    function addMessage(text, type = "ai") {
      screen.append(element("div", `msg ${type}`, text));

      while (screen.childElementCount > 40) {
        screen.firstElementChild.remove();
      }

      screen.scrollTop = screen.scrollHeight;
    }

    const responses = new Map([
      [
        "run it",
        "OMINEX activated. Explore Luvo’s projects, games, animation and video work."
      ],
      [
        "help",
        "Commands: run it, projects, showcase, videos, skills, contact, clear."
      ],
      [
        "projects",
        "Featured Projects contains Cinryvan and Lexryspell. Use their project links to explore each platform."
      ],
      [
        "websites",
        "Cinryvan and Lexryspell are in Featured Projects."
      ],
      [
        "showcase",
        "Showcase contains BlockCraft, Cyber Runner, Fantasy RPG Interface, Space Combat VR, Game Awaits, OMINEX, Trade Bot, Motion Graphics, 99 Fashion, JavaScript Minis and other creative work. Use the category filters to browse."
      ],
      [
        "videos",
        "Visit the Movie thinkers section to watch the three linked YouTube videos."
      ],
      [
        "skills",
        "Luvo works across game development, web development, graphic and UI design, video editing and 3D animation."
      ],
      [
        "contact",
        "Email luvomaphela0@gmail.com or use the contact form to create an email draft."
      ],
      ["hello", 'Hello! Type "help" to see the available commands.'],
      ["hi", 'Hi! Type "help" to explore the portfolio.']
    ]);

    screen.replaceChildren();

    addMessage(
      'Welcome to OMINEX, a local command demo. Try "projects", "showcase", "videos", "contact" or "help".'
    );

    function run() {
      const text = input.value.trim();
      if (!text) return;

      input.value = "";

      const command = text
        .toLowerCase()
        .replace(/[.!?]+$/, "")
        .trim();

      if (command === "clear") {
        screen.replaceChildren();
        addMessage('Screen cleared. Type "help" for commands.');
        return;
      }

      addMessage(text, "user");

      addMessage(
        responses.get(command) ||
        'This is a local command demo. Type "help" to see the available commands.'
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

  /* SCROLL REVEALS */

  function initReveals() {
    const nodes = $$(
      ".skill-card, .project-card, .showcase-item, " +
      ".website-card, .youtube-card, .achievement"
    );

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      nodes.forEach(node => node.classList.add("animate-in"));
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

    nodes.forEach(node => observer.observe(node));

    reducedMotion.addEventListener("change", () => {
      if (!reducedMotion.matches) return;

      observer.disconnect();
      nodes.forEach(node => node.classList.add("animate-in"));
    });
  }

  /* LIGHTWEIGHT ENERGY BACKGROUND */

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
    let resizeTimer;

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

      if (
        document.hidden ||
        reducedMotion.matches ||
        !visible ||
        !width ||
        !height
      ) {
        return;
      }

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

  /* IMAGE FALLBACKS */

  function initImages() {
    $$("img").forEach(image => {
      image.decoding = "async";

      function handleError() {
        if (image.dataset.fallbackHandled) return;

        image.dataset.fallbackHandled = "true";

        const container = image.parentElement;
        if (!container) return;

        if (getComputedStyle(container).position === "static") {
          container.style.position = "relative";
        }

        if (container.getBoundingClientRect().height < 80) {
          container.style.minHeight = "180px";
        }

        image.hidden = true;
        image.style.display = "none";

        const fallback = element(
          "span",
          "image-fallback",
          image.alt || "Preview unavailable"
        );

        fallback.style.cssText =
          "position:absolute;inset:0;display:grid;" +
          "place-items:center;padding:24px;text-align:center;" +
          "color:#cbd3df;font-size:13px;pointer-events:none;";

        container.append(fallback);
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

    const dialog = initModal();

    initShowcase(dialog);
    initProjectButtons(dialog);
    initNavigation();
    initContactForm();
    initOminex();
    initImages();
    initReveals();
    initEnergy();

    const year = $("#currentYear");

    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();