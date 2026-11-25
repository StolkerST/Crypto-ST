/* Crypto ST — live prices (v8)
 * Free CoinGecko public API, no key, no Node, no npm.
 * One request for all 3 coins, refreshed every 60 seconds.
 * If the request fails (offline / slow net / rate limit) the page keeps
 * the placeholder values and says so — nothing breaks.
 * Last good prices are cached in localStorage for up to 24h so a reload
 * while offline still shows real (if slightly old) numbers with their time.
 */
(function () {
  "use strict";

  var API_URL =
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd&ids=bitcoin,ethereum,binancecoin" +
    "&price_change_percentage=24h";

  var COINS = [
    { id: "bitcoin", prefix: "btc", symbol: "BTC" },
    { id: "ethereum", prefix: "eth", symbol: "ETH" },
    { id: "binancecoin", prefix: "bnb", symbol: "BNB" },
  ];

  var CACHE_KEY = "crypto-st-prices-v1";
  var CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
  var REFRESH_MS = 60 * 1000; // 60s — well inside CoinGecko's free limit

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    var node = el(id);
    if (node) node.textContent = text;
  }

  // $59,955 / $1,677.56 / $547.14
  function fmtPrice(v) {
    if (typeof v !== "number" || !isFinite(v)) return null;
    return (
      "$" +
      v.toLocaleString("en-US", {
        minimumFractionDigits: v >= 1000 ? 0 : 2,
        maximumFractionDigits: v >= 1000 ? 0 : 2,
      })
    );
  }

  // 1,205,512,671,367 -> $1.21T ; 65,990,086,937 -> $66.0B
  function fmtCompact(v) {
    if (typeof v !== "number" || !isFinite(v)) return null;
    var abs = Math.abs(v);
    if (abs >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
    if (abs >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
    if (abs >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
    return "$" + v.toFixed(0);
  }

  // 20,115,387 -> 20.1M BTC
  function fmtSupply(v, symbol) {
    if (typeof v !== "number" || !isFinite(v)) return null;
    return (v / 1e6).toFixed(1) + "M " + symbol;
  }

  function render(coins, updatedAt, note) {
    var byId = {};
    coins.forEach(function (c) {
      byId[c.id] = c;
    });
    COINS.forEach(function (coin) {
      var c = byId[coin.id];
      if (!c) return;
      var price = fmtPrice(c.current_price);
      if (price) setText("price-" + coin.prefix, price);
      var cap = fmtCompact(c.market_cap);
      if (cap) setText("cap-" + coin.prefix, cap);
      var vol = fmtCompact(c.total_volume);
      if (vol) setText("vol-" + coin.prefix, vol);
      var supply = fmtSupply(c.circulating_supply, coin.symbol);
      if (supply) setText("supply-" + coin.prefix, supply);
      var change = c.price_change_percentage_24h;
      var node = el("change-" + coin.prefix);
      if (node && typeof change === "number" && isFinite(change)) {
        var sign = change >= 0 ? "+" : "";
        node.textContent = sign + change.toFixed(2) + "% (24h)";
        node.style.color = change >= 0 ? "#15803d" : "#dc2626";
      }
    });
    var status = el("prices-updated");
    if (status && updatedAt) {
      var time = new Date(updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      status.textContent = note
        ? note + " · last update " + time
        : "Live prices · updated " + time;
    }
  }

  function loadCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var cached = JSON.parse(raw);
      if (
        !cached ||
        !cached.data ||
        Date.now() - cached.ts > CACHE_MAX_AGE_MS
      ) {
        return null;
      }
      return cached;
    } catch (e) {
      return null;
    }
  }

  function saveCache(data) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data: data })
      );
    } catch (e) {
      /* storage full / private mode — live prices still work */
    }
  }

  function fetchPrices() {
    var controller =
      typeof AbortController !== "undefined"
        ? new AbortController()
        : null;
    var timer = null;
    if (controller) {
      timer = setTimeout(function () {
        controller.abort();
      }, 10000); // 10s timeout — kind to slow connections
    }
    var opts = controller ? { signal: controller.signal } : {};
    return fetch(API_URL, opts)
      .then(function (res) {
        if (!res.ok) throw new Error("CoinGecko HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (timer) clearTimeout(timer);
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("CoinGecko returned no coins");
        }
        saveCache(data);
        render(data, Date.now(), null);
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        var cached = loadCache();
        if (cached) {
          render(cached.data, cached.ts, "Offline — showing saved prices");
        } else {
          setText(
            "prices-updated",
            "Could not reach CoinGecko — showing placeholder prices"
          );
        }
      });
  }

  // Show cached prices instantly if we have them, then refresh live.
  var cached = loadCache();
  if (cached) render(cached.data, cached.ts, "Saved prices");
  fetchPrices();
  setInterval(fetchPrices, REFRESH_MS);
})();
