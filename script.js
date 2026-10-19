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
      demo: "games/star-runner/index.html",
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

    /* OMINEX — PORTFOLIO GUIDE + WIKIPEDIA */

  function initOminex() {
    const root = document.querySelector("#ominex");
    const input = document.querySelector("#ominexInput");
    const send = document.querySelector("#ominexSend");
    const screen = document.querySelector("#ominexScreen");

    if (!input || !send || !screen) return;

    const hint = document.querySelector("#ominexHint");
    const newChat = document.querySelector("#ominexNewChat");
    const help = document.querySelector("#ominexHelp");

    let activeRequest = null;
    let requestNumber = 0;

    input.maxLength = 300;
    input.placeholder = "Ask about a topic or explore my projects…";
    input.setAttribute("aria-label", "Ask OMINEX");
    send.type = "button";

    const localAnswers = new Map([
      [
        "projects",
        "Luvo’s featured projects are Cinryvan, an entertainment discovery platform, and Lexryspell, a word discovery and pronunciation tool."
      ],
      [
        "showcase",
        "Explore the Showcase section for games, interfaces, animation, video editing and interactive applications."
      ],
      [
        "videos",
        "Visit the Videos section to watch Luvo’s Movie thinkers videos."
      ],
      [
        "skills",
        "Luvo works with web development, game development, graphic design, UI design, video editing and 3D animation."
      ],
      [
        "contact",
        "Contact Luvo at luvomaphela0@gmail.com. You can also use the portfolio’s contact section."
      ],
      [
        "help",
        'Ask about a topic such as “Who is Nelson Mandela?” or “What is gravity?” I search Wikipedia and show article introductions with sources. Portfolio commands: projects, showcase, videos, skills, contact and clear.'
      ],
      [
        "hello",
        "Hello! Ask me about a topic, or type projects to explore Luvo’s work."
      ],
      [
        "hi",
        "Hi! What would you like to learn about?"
      ],
      [
        "run it",
        "Ready. Ask about a topic or explore Luvo’s portfolio."
      ]
    ]);

    function setHint(text) {
      if (hint) hint.textContent = text;
    }

    function addMessage(text, type = "ai") {
      const message = document.createElement("div");
      message.className = `msg ${type}`;
      message.textContent = text;
      screen.appendChild(message);

      while (screen.children.length > 40) {
        screen.firstElementChild.remove();
      }

      screen.scrollTop = screen.scrollHeight;
      return message;
    }

    function addLink(container, label, url) {
      const link = document.createElement("a");
      link.textContent = label;
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      container.appendChild(link);
    }

    function resetChat() {
      requestNumber += 1;
      activeRequest?.abort();
      activeRequest = null;

      send.disabled = false;
      screen.removeAttribute("aria-busy");
      screen.replaceChildren();

      addMessage(
        "Hello, I’m OMINEX. Ask about a topic and I’ll look it up on Wikipedia, or type projects to explore Luvo’s work."
      );

      setHint(
        "Wikipedia topic summaries · Questions are sent to Wikipedia when searched."
      );

      input.value = "";
    }

    async function wikiRequest(parameters, signal) {
      const query = new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        origin: "*",
        ...parameters
      });

      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?${query}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error("Wikipedia request failed");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error("Wikipedia API error");
      }

      return data;
    }

    function topicFromQuestion(text) {
      return text
        .replace(
          /^(?:(?:please\s+)?(?:who|what)\s+(?:is|was|are|were)\s+|(?:please\s+)?(?:tell me about|search for|search wikipedia for|explain|define)\s+)/i,
          ""
        )
        .replace(/[?!]+$/, "")
        .trim() || text;
    }

    async function run(value = input.value) {
      const text = String(value).trim().slice(0, 300);
      if (!text) return;

      const command = text.toLowerCase().replace(/[.!?]+$/, "");

      if (command === "clear" || command === "new chat") {
        resetChat();
        return;
      }

      // Cancel an older lookup before starting a new one.
      activeRequest?.abort();
      const thisRequest = ++requestNumber;

      screen.querySelectorAll("[data-wiki-pending]").forEach(node => {
        node.textContent = "Previous lookup cancelled.";
        node.removeAttribute("data-wiki-pending");
      });

      input.value = "";
      addMessage(text, "user");
      root?.classList.remove("has-conversation");
      stopVoice();

      const local = localAnswers.get(command);

      if (local) {
        addMessage(local);
        speakAnswer(local);
        send.disabled = false;
        screen.removeAttribute("aria-busy");
        return;
      }

      const controller = new AbortController();
      activeRequest = controller;
      const timeout = setTimeout(() => controller.abort(), 12000);

      send.disabled = true;
      screen.setAttribute("aria-busy", "true");

      const message = addMessage("Searching Wikipedia…");
      message.dataset.wikiPending = "true";

      try {
        const topic = topicFromQuestion(text);

        const results = await wikiRequest(
          {
            list: "search",
            srsearch: topic,
            srnamespace: "0",
            srlimit: "3"
          },
          controller.signal
        );

        const matches = results.query?.search || [];

        if (!matches.length) {
          message.textContent =
            "I couldn’t find a matching Wikipedia article. Try a specific person, place or topic.";
          return;
        }

        const best = matches[0];

        const articleData = await wikiRequest(
          {
            pageids: String(best.pageid),
            prop: "extracts|pageprops",
            exintro: "1",
            explaintext: "1",
            exchars: "1100"
          },
          controller.signal
        );

        if (thisRequest !== requestNumber) return;

        const page = articleData.query?.pages?.[0];
        const articleURL =
          `https://en.wikipedia.org/?curid=${best.pageid}`;

        const ambiguous =
          page?.pageprops &&
          Object.prototype.hasOwnProperty.call(
            page.pageprops,
            "disambiguation"
          );

        const summary = page?.extract?.trim();

        message.textContent = ambiguous
          ? `“${best.title}” can refer to several topics. Open the article or add more detail to your question.`
          : summary
            ? `Wikipedia match: ${best.title}\n\n${summary}`
            : `I found “${best.title}”, but its introduction is unavailable. You can read the article below.`;

        message.appendChild(document.createElement("br"));
        message.appendChild(document.createElement("br"));

        addLink(
          message,
          `Source: ${best.title} — Wikipedia`,
          articleURL
        );

        const attribution = document.createElement("div");
        attribution.style.marginTop = "10px";
        attribution.style.fontSize = "11px";

        attribution.append("Text: Wikipedia contributors · ");

        addLink(
          attribution,
          "CC BY-SA 4.0",
          "https://creativecommons.org/licenses/by-sa/4.0/"
        );

        message.appendChild(attribution);
        if (summary && !ambiguous) {
          speakAnswer(summary);
        }

        if (matches.length > 1) {
          const alternatives = document.createElement("div");
          alternatives.style.marginTop = "12px";
          alternatives.append("Other matches: ");

          matches.slice(1).forEach((match, index) => {
            if (index > 0) alternatives.append(" · ");

            addLink(
              alternatives,
              match.title,
              `https://en.wikipedia.org/?curid=${match.pageid}`
            );
          });

          message.appendChild(alternatives);
        }
      } catch (error) {
        if (thisRequest !== requestNumber) return;

        message.textContent = error.name === "AbortError"
          ? "The Wikipedia lookup took too long. Please try again."
          : "I couldn’t reach Wikipedia right now. Please try again shortly.";
      } finally {
        clearTimeout(timeout);
        message.removeAttribute("data-wiki-pending");

        if (thisRequest === requestNumber) {
          activeRequest = null;
          send.disabled = false;
          screen.removeAttribute("aria-busy");
          screen.scrollTop = screen.scrollHeight;
        }
      }
    }

    send.addEventListener("click", () => run());

    input.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        run();
      }
    });

    newChat?.addEventListener("click", () => {
      resetChat();
      input.focus();
    });

    help?.addEventListener("click", () => run("help"));

    root?.querySelectorAll("[data-ominex-prompt]").forEach(button => {
      button.addEventListener("click", () => {
        run(button.dataset.ominexPrompt);
      });
    });

        /* VOICE OUTPUT + MICROPHONE INPUT */

    const voiceButton = document.getElementById("ominexVoiceMode");
    const micButton = document.getElementById("ominexMic");
    const voiceStatus = document.getElementById("ominexVoiceStatus");

    const speech = window.speechSynthesis;
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    let voiceEnabled = false;
    let recognition = null;
    let listening = false;
    let starting = false;
    let speechVersion = 0;

    function updateVoiceStatus() {
      if (voiceStatus) {
        voiceStatus.textContent =
          listening ? "Listening…" :
          root?.classList.contains("is-speaking") ? "Speaking…" :
          voiceEnabled ? "On" : "Off";
      }

      voiceButton?.setAttribute(
        "aria-pressed",
        String(voiceEnabled)
      );

      micButton?.setAttribute(
        "aria-label",
        listening ? "Stop voice input" : "Start voice input"
      );
    }

    function stopVoice() {
      speechVersion += 1;
      speech?.cancel();

      if (recognition && (listening || starting)) {
        recognition.abort();
      }

      listening = false;
      starting = false;

      root?.classList.remove("is-speaking", "is-listening");
      updateVoiceStatus();
    }

    function speakAnswer(text) {
      if (!voiceEnabled || !speech || !text) return;

      stopVoice();

      const version = speechVersion;
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speech.getVoices();

      utterance.voice =
        voices.find(voice => voice.lang === "en-ZA") ||
        voices.find(voice => voice.lang === "en-GB") ||
        voices.find(voice => voice.lang.startsWith("en")) ||
        null;

      utterance.lang = utterance.voice?.lang || "en-GB";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (version !== speechVersion) return;
        root?.classList.add("is-speaking");
        updateVoiceStatus();
      };

      const finish = () => {
        if (version !== speechVersion) return;
        root?.classList.remove("is-speaking");
        updateVoiceStatus();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      speech.speak(utterance);
    }

    if (voiceButton) {
      voiceButton.disabled = !speech;
      voiceButton.title = speech
        ? "Turn spoken answers on or off"
        : "Spoken answers are unavailable in this browser.";

      voiceButton.addEventListener("click", () => {
        voiceEnabled = !voiceEnabled;
        stopVoice();

        if (voiceEnabled) {
          const answers = [...screen.querySelectorAll(".msg.ai")];
          const latest = answers.reverse().find(message =>
            !message.hasAttribute("data-wiki-pending") &&
            message.textContent !== "Previous lookup cancelled."
          );

          const text = latest?.textContent
            .split("Source:")[0]
            .trim();

          speakAnswer(text || "Voice is on. Ask me a question.");
        }

        updateVoiceStatus();
      });
    }

    if (micButton) {
      micButton.disabled = !Recognition || !window.isSecureContext;
      micButton.title = micButton.disabled
        ? "Voice input needs a supported browser and HTTPS."
        : "Speak your question";
    }

    if (Recognition && window.isSecureContext) {
      recognition = new Recognition();
      recognition.lang = "en-ZA";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        starting = false;
        listening = true;
        root?.classList.add("is-listening");
        updateVoiceStatus();
        setHint("Listening… Speak your question.");
      };

      recognition.onresult = event => {
        const transcript = event.results[0][0].transcript.trim();
        if (!transcript) return;

        input.value = transcript;
        setHint("Question transcribed. Press Send when ready.");
        input.focus();
      };

      recognition.onerror = event => {
        const messages = {
          "not-allowed":
            "Microphone access was blocked. Allow it in your browser’s site settings.",
          "audio-capture":
            "No microphone was found. Check your microphone connection.",
          "no-speech":
            "No speech was detected. Click the microphone to try again.",
          "network":
            "Voice recognition could not connect. Please type your question."
        };

        if (event.error !== "aborted") {
          setHint(
            messages[event.error] ||
            "Voice input failed. You can still type your question."
          );
        }
      };

      recognition.onend = () => {
        starting = false;
        listening = false;
        root?.classList.remove("is-listening");
        updateVoiceStatus();

        if (hint?.textContent === "Listening… Speak your question.") {
          setHint("Microphone stopped. Click it to try again.");
        }
      };

      micButton?.addEventListener("click", () => {
        if (listening || starting) {
          stopVoice();
          setHint("Microphone stopped.");
          return;
        }

        stopVoice();

        try {
          starting = true;
          recognition.start();
        } catch {
          starting = false;
          setHint("Could not start the microphone. Please try again.");
        }
      });
    }

    window.addEventListener("pagehide", stopVoice);
    updateVoiceStatus();0

    resetChat();
    root?.classList.remove("has-conversation");
      stopVoice();
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