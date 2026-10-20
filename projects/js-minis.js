"use strict";

(() => {
  const $ = (id) => document.getElementById(id);

  function text(id, value) {
    $(id).textContent = value;
  }

  function status(id, message, state = "") {
    text(id, message);
    $(id).dataset.state = state;
  }

  function busy(container, active) {
    container.setAttribute("aria-busy", String(active));

    container.querySelectorAll("input, select, button").forEach((element) => {
      element.disabled = active;
    });
  }

  async function getJSON(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "This service is busy. Please wait a few minutes before trying again."
          );
        }

        throw new Error("The service is unavailable. Please try again later.");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("The request timed out. Please try again.");
      }

      if (error instanceof TypeError) {
        throw new Error(
          "Could not connect. Check your internet connection and try again."
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function safeURL(value) {
    if (typeof value !== "string") return null;

    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function attribution(selector, label, url) {
    const footer = document.querySelector(selector);
    if (!footer) return;

    const line = document.createElement("span");
    const link = document.createElement("a");

    link.textContent = label;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    line.append(link);
    footer.append(line);
  }

  // WEATHER

  const weatherForm = $("weather-form");

  function weatherDescription(code, isDay) {
    const conditions = {
      0: ["Clear sky", isDay ? "☀" : "☾"],
      1: ["Mainly clear", isDay ? "🌤" : "☾"],
      2: ["Partly cloudy", "⛅"],
      3: ["Overcast", "☁"],
      45: ["Fog", "🌫"],
      48: ["Freezing fog", "🌫"],
      51: ["Light drizzle", "🌦"],
      53: ["Moderate drizzle", "🌦"],
      55: ["Heavy drizzle", "🌧"],
      56: ["Light freezing drizzle", "🌧"],
      57: ["Heavy freezing drizzle", "🌧"],
      61: ["Light rain", "🌧"],
      63: ["Moderate rain", "🌧"],
      65: ["Heavy rain", "🌧"],
      66: ["Light freezing rain", "🌧"],
      67: ["Heavy freezing rain", "🌧"],
      71: ["Light snow", "❄"],
      73: ["Moderate snow", "❄"],
      75: ["Heavy snow", "❄"],
      77: ["Snow grains", "❄"],
      80: ["Light rain showers", "🌦"],
      81: ["Moderate rain showers", "🌧"],
      82: ["Heavy rain showers", "🌧"],
      85: ["Light snow showers", "❄"],
      86: ["Heavy snow showers", "❄"],
      95: ["Thunderstorm", "⛈"],
      96: ["Thunderstorm with light hail", "⛈"],
      99: ["Thunderstorm with heavy hail", "⛈"]
    };

    return conditions[code] || ["Conditions unavailable", "☁"];
  }

  function measurement(value, suffix) {
    return Number.isFinite(value) ? `${Math.round(value)}${suffix}` : "—";
  }

  async function loadWeather() {
    if (weatherForm.getAttribute("aria-busy") === "true") return;
    if (!weatherForm.reportValidity()) return;

    const city = $("weather-city").value.trim();

    if (city.length < 2) {
      status("weather-status", "Enter at least two letters.", "error");
      return;
    }

    busy(weatherForm, true);
    $("weather-result").hidden = true;
    status("weather-status", "Finding your city…");

    try {
      const search = new URLSearchParams({
        name: city,
        count: "1",
        language: "en",
        format: "json"
      });

      const locations = await getJSON(
        `https://geocoding-api.open-meteo.com/v1/search?${search}`
      );

      const location = locations.results?.[0];

      if (!location) {
        throw new Error("City not found. Try a nearby town or another spelling.");
      }

      status("weather-status", "Loading the weather…");

      const parameters = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "weather_code",
          "wind_speed_10m",
          "is_day"
        ].join(","),
        timezone: "auto"
      });

      const data = await getJSON(
        `https://api.open-meteo.com/v1/forecast?${parameters}`
      );

      const current = data.current;

      if (!current || !Number.isFinite(current.temperature_2m)) {
        throw new Error("Weather data is unavailable for this location.");
      }

      const [description, symbol] = weatherDescription(
        current.weather_code,
        current.is_day
      );

      const place = [...new Set(
        [location.name, location.admin1, location.country].filter(Boolean)
      )].join(", ");

      text("weather-location", place);
      text("weather-temperature", Math.round(current.temperature_2m));
      text("weather-description", description);
      text("weather-symbol", symbol);
      text("weather-feels", measurement(current.apparent_temperature, "°C"));
      text("weather-humidity", measurement(current.relative_humidity_2m, "%"));
      text("weather-wind", measurement(current.wind_speed_10m, " km/h"));

      text(
        "weather-updated",
        `Weather time: ${current.time.replace("T", " ")} (${data.timezone})`
      );

      $("weather-result").hidden = false;
      status("weather-status", "Weather loaded.", "success");
    } catch (error) {
      status("weather-status", error.message, "error");
    } finally {
      busy(weatherForm, false);
    }
  }

  weatherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadWeather();
  });

  attribution(
    ".weather-card .card-footer",
    "Weather: Open-Meteo · Location data: GeoNames",
    "https://open-meteo.com/"
  );

  // CURRENCY CONVERTER

  const currencyForm = $("currency-form");
  const rateCache = new Map();

  function money(amount, currency) {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      currencyDisplay: "code"
    }).format(amount);
  }

  async function convertCurrency() {
    if (currencyForm.getAttribute("aria-busy") === "true") return;
    if (!currencyForm.reportValidity()) return;

    const amount = Number($("currency-amount").value);
    const from = $("currency-from").value;
    const to = $("currency-to").value;

    if (!Number.isFinite(amount) || amount < 0) {
      status("currency-status", "Enter a valid amount of zero or more.", "error");
      return;
    }

    busy(currencyForm, true);
    $("currency-result").hidden = true;
    status("currency-status", "Getting the exchange rate…");

    try {
      let rate = 1;
      let rateDate = "";

      if (from !== to) {
        const key = `${from}-${to}`;
        let cached = rateCache.get(key);

        if (!cached || Date.now() - cached.saved > 60 * 60 * 1000) {
          const parameters = new URLSearchParams({ from, to });
          const data = await getJSON(
            `https://api.frankfurter.dev/v1/latest?${parameters}`
          );

          const fetchedRate = data.rates?.[to];

          if (!Number.isFinite(fetchedRate) || fetchedRate <= 0) {
            throw new Error("An exchange rate is unavailable for this pair.");
          }

          cached = {
            rate: fetchedRate,
            date: data.date,
            saved: Date.now()
          };

          rateCache.set(key, cached);
        }

        rate = cached.rate;
        rateDate = cached.date;
      }

      text("currency-original", `${money(amount, from)} equals`);
      text("currency-converted", money(amount * rate, to));

      text(
        "currency-rate",
        `1 ${from} = ${new Intl.NumberFormat("en-ZA", {
          maximumFractionDigits: 6
        }).format(rate)} ${to}`
      );

      text(
        "currency-date",
        from === to
          ? "Same currency — no conversion needed."
          : `Reference rate date: ${rateDate}. Not a live trading quote.`
      );

      $("currency-result").hidden = false;
      status("currency-status", "Conversion complete.", "success");
    } catch (error) {
      status("currency-status", error.message, "error");
    } finally {
      busy(currencyForm, false);
    }
  }

  currencyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    convertCurrency();
  });

  $("currency-swap").addEventListener("click", () => {
    const previousFrom = $("currency-from").value;
    $("currency-from").value = $("currency-to").value;
    $("currency-to").value = previousFrom;
    convertCurrency();
  });

  currencyForm.addEventListener("input", () => {
    $("currency-result").hidden = true;
    status("currency-status", "Press Convert currency to update the result.");
  });

  attribution(
    ".currency-card .card-footer",
    "Exchange rates: Frankfurter",
    "https://frankfurter.dev/"
  );

  // SPACEX LAUNCH TRACKER

  const launchButton = $("launch-refresh");
  const launchCacheKey = "js-minis-launch-v1";
  const launchCacheDuration = 15 * 60 * 1000;

  let launchTimer;
  let lastLaunchRequest = 0;

  function readLaunchCache() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(launchCacheKey));

      if (
        cached &&
        Date.now() - cached.saved < launchCacheDuration &&
        new Date(cached.launch.net).getTime() > Date.now()
      ) {
        return cached;
      }
    } catch {
      // Storage may be blocked. The app can still request data.
    }

    return null;
  }

  function saveLaunchCache(launch) {
    try {
      sessionStorage.setItem(
        launchCacheKey,
        JSON.stringify({ launch, saved: Date.now() })
      );
    } catch {
      // Storage is optional.
    }
  }

  function startCountdown(dateValue) {
    clearInterval(launchTimer);

    const target = new Date(dateValue).getTime();

    if (!Number.isFinite(target)) {
      ["days", "hours", "minutes", "seconds"].forEach((part) => {
        text(`launch-${part}`, "--");
      });
      return;
    }

    function tick() {
      const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));

      const values = {
        days: Math.floor(remaining / 86400),
        hours: Math.floor((remaining % 86400) / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60
      };

      Object.entries(values).forEach(([part, value]) => {
        text(`launch-${part}`, String(value).padStart(2, "0"));
      });

      if (remaining === 0) {
        clearInterval(launchTimer);
        status(
          "launch-status",
          "Scheduled time reached. Refresh for an update; liftoff is not confirmed."
        );
      }
    }

    launchTimer = setInterval(tick, 1000);
    tick();
  }

  function renderLaunch(launch) {
    text("launch-name", launch.name || "Upcoming SpaceX mission");
    text("launch-mission-status", launch.status?.name || "Schedule pending");
    text("launch-description", launch.mission?.description || "");
    text(
      "launch-rocket",
      launch.rocket?.configuration?.full_name ||
      launch.rocket?.configuration?.name ||
      "To be confirmed"
    );

    text(
      "launch-pad",
      [launch.pad?.name, launch.pad?.location?.name]
        .filter(Boolean)
        .join(", ") || "To be confirmed"
    );

    const date = new Date(launch.net);

    text(
      "launch-date",
      Number.isFinite(date.getTime())
        ? `${new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          }).format(date)} (your local time; subject to change)`
        : "To be confirmed"
    );

    const imageURL = safeURL(
      typeof launch.image === "string"
        ? launch.image
        : launch.image?.image_url
    );

    const image = $("launch-image");
    $("launch-image-wrap").hidden = true;
    image.removeAttribute("src");

    if (imageURL) {
      image.alt = launch.name || "SpaceX launch";
      image.onload = () => {
        $("launch-image-wrap").hidden = false;
      };
      image.onerror = () => {
        $("launch-image-wrap").hidden = true;
      };
      image.src = imageURL;
    }

    const missionLink = $("launch-link");
    missionLink.hidden = true;
    missionLink.removeAttribute("href");

    const linkURL = safeURL(launch.info_urls?.[0]?.url) ||
      safeURL(launch.vid_urls?.[0]?.url);

    if (linkURL) {
      missionLink.href = linkURL;
      missionLink.hidden = false;
    }

    $("launch-result").hidden = false;
    startCountdown(launch.net);
  }

  async function loadLaunch() {
    if (launchButton.disabled) return;

    const cached = readLaunchCache();

    if (cached) {
      status(
        "launch-status",
        "Recent launch data loaded. Updates are cached for 15 minutes.",
        "success"
      );
      renderLaunch(cached.launch);
      return;
    }

    if (Date.now() - lastLaunchRequest < 60000) {
      status("launch-status", "Please wait a minute before refreshing again.");
      return;
    }

    lastLaunchRequest = Date.now();
    launchButton.disabled = true;
    launchButton.setAttribute("aria-busy", "true");
    status("launch-status", "Finding the next SpaceX launch…");

    clearInterval(launchTimer);
    $("launch-result").hidden = true;

    try {
      const parameters = new URLSearchParams({
        lsp__id: "121",
        limit: "1",
        mode: "normal",
        ordering: "net",
        net__gt: new Date().toISOString(),
        hide_recent_previous: "true"
      });

      const data = await getJSON(
        `https://ll.thespacedevs.com/2.3.0/launches/upcoming/?${parameters}`
      );

      const launch = data.results?.[0];

      if (!launch) {
        throw new Error("No upcoming SpaceX launch was returned. Try again later.");
      }

      saveLaunchCache(launch);
      status("launch-status", "Next scheduled SpaceX mission loaded.", "success");
      renderLaunch(launch);
    } catch (error) {
      status("launch-status", error.message, "error");
    } finally {
      launchButton.disabled = false;
      launchButton.setAttribute("aria-busy", "false");
    }
  }

  launchButton.addEventListener("click", loadLaunch);

  attribution(
    ".launch-card .card-footer",
    "Launch data: The Space Devs",
    "https://thespacedevs.com/"
  );

  // JOKE GENERATOR

  let currentJoke = null;

  const offlineJokes = [
    {
      setup: "Why did the developer bring a ladder?",
      punchline: "To reach the next level of abstraction.",
      type: "Programming"
    },
    {
      setup: "Why did the CSS file go to therapy?",
      punchline: "It had too many unresolved issues with its parents.",
      type: "Programming"
    },
    {
      setup: "Why did the function pack a suitcase?",
      punchline: "It was about to return.",
      type: "Programming"
    }
  ];

  function showJoke(joke) {
    currentJoke = joke;
    text("joke-setup", joke.setup);
    text("joke-punchline", joke.punchline);
    text("joke-category", joke.type || "General");

    $("joke-punchline").hidden = true;
    $("joke-reveal").hidden = false;
    $("joke-copy").disabled = false;
  }

  async function loadJoke() {
    const button = $("joke-new");
    if (button.disabled) return;

    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    $("joke-reveal").hidden = true;
    $("joke-copy").disabled = true;
    status("joke-status", "Finding a joke…");

    try {
      const joke = await getJSON(
        "https://official-joke-api.appspot.com/jokes/random"
      );

      if (
        typeof joke.setup !== "string" ||
        typeof joke.punchline !== "string"
      ) {
        throw new Error("Invalid joke response.");
      }

      showJoke(joke);
      status("joke-status", "Ready? Reveal the punchline.");
    } catch {
      const alternatives = offlineJokes.filter(
        (joke) => joke.setup !== currentJoke?.setup
      );

      showJoke(
        alternatives[Math.floor(Math.random() * alternatives.length)]
      );

      status(
        "joke-status",
        "The joke service is unavailable. Here’s a built-in joke instead."
      );
    } finally {
      button.disabled = false;
      button.setAttribute("aria-busy", "false");
    }
  }

  $("joke-new").addEventListener("click", loadJoke);

  $("joke-reveal").addEventListener("click", () => {
    $("joke-punchline").hidden = false;
    $("joke-reveal").hidden = true;
    status("joke-status", "Want another? Press Tell me a joke.");
  });

  $("joke-copy").addEventListener("click", async () => {
    if (!currentJoke) return;

    try {
      await navigator.clipboard.writeText(
        `${currentJoke.setup}\n\n${currentJoke.punchline}`
      );

      status("joke-status", "Joke copied!", "success");
    } catch {
      $("joke-punchline").hidden = false;
      $("joke-reveal").hidden = true;

      status(
        "joke-status",
        "Copy is unavailable here. Select the joke text and copy it manually.",
        "error"
      );
    }
  });

  attribution(
    ".joke-card .card-footer",
    "Online jokes: Official Joke API",
    "https://github.com/15Dkatz/official_joke_api"
  );

  // INITIAL CONTENT
  // Launches load only when Refresh is clicked to reduce API requests.

  loadWeather();
  convertCurrency();
})();