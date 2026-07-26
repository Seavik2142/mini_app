"use strict";

(function () {
  var sidebarStorageKey = "adminHMD.sidebarMini";
  var themeStorageKey = "adminHMD.colorTheme";
  var desktopMedia = "(min-width: 992px)";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function isDesktop() {
    return window.matchMedia(desktopMedia).matches;
  }

  function canUseStorage() {
    try {
      var testKey = sidebarStorageKey + ".test";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function getSavedMiniState(storageAvailable) {
    if (!storageAvailable) {
      return false;
    }

    return window.localStorage.getItem(sidebarStorageKey) === "true";
  }

  function saveMiniState(storageAvailable, isMini) {
    if (storageAvailable) {
      window.localStorage.setItem(sidebarStorageKey, String(isMini));
    }
  }

  function getPreferredTheme(storageAvailable) {
    var savedTheme = storageAvailable ? window.localStorage.getItem(themeStorageKey) : "";

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  }

  onReady(function () {
    var body = document.body;
    var sidebarToggle = document.querySelector("[data-sidebar-toggle]");
    var themeToggles = document.querySelectorAll("[data-theme-toggle]");
    var themeIcons = document.querySelectorAll("[data-theme-icon]");
    var closeButtons = document.querySelectorAll("[data-sidebar-close]");
    var sidebarLinks = document.querySelectorAll(".sidebar-nav .nav-link");
    var mediaQuery = window.matchMedia(desktopMedia);
    var storageAvailable = canUseStorage();

    function initValidation() {
      var forms = document.querySelectorAll(".needs-validation");

      Array.prototype.forEach.call(forms, function (form) {
        form.addEventListener("submit", function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add("was-validated");
        });
      });
    }

    function initTableSearch() {
      var searchInputs = document.querySelectorAll("[data-table-search]");

      Array.prototype.forEach.call(searchInputs, function (input) {
        var tableId = input.getAttribute("data-table-search");
        var table = document.getElementById(tableId);

        if (!table) {
          return;
        }

        input.addEventListener("input", function () {
          var query = input.value.trim().toLowerCase();
          var rows = table.querySelectorAll("tbody tr");

          Array.prototype.forEach.call(rows, function (row) {
            row.hidden = query !== "" && row.textContent.toLowerCase().indexOf(query) === -1;
          });
        });
      });
    }

    function updateThemeControls(theme) {
      var nextTheme = theme === "dark" ? "light" : "dark";
      var label = "Switch to " + nextTheme + " mode";
      var iconClass = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";

      Array.prototype.forEach.call(themeToggles, function (button) {
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
      });

      Array.prototype.forEach.call(themeIcons, function (icon) {
        icon.className = iconClass;
      });
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.setAttribute("data-bs-theme", theme);

      if (storageAvailable) {
        window.localStorage.setItem(themeStorageKey, theme);
      }

      updateThemeControls(theme);
    }

    function initThemeToggle() {
      applyTheme(getPreferredTheme(storageAvailable));

      Array.prototype.forEach.call(themeToggles, function (button) {
        button.addEventListener("click", function () {
          var currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
          applyTheme(currentTheme === "dark" ? "light" : "dark");
        });
      });
    }

    initValidation();
    initTableSearch();
    initThemeToggle();

    // Auto sanitize stored session string to fix legacy "Admin: seavik (Super Admin)"
    try {
      var sStr = window.localStorage.getItem('mini_app_admin_session');
      if (sStr) {
        var sObj = JSON.parse(sStr);
        if (sObj && sObj.username) {
          sObj.username = sObj.username.replace(/^Admin:\s*/i, '').replace(/\s*\([^)]*\)$/gi, '').trim();
          if (!sObj.username) sObj.username = 'Seavik';
          window.localStorage.setItem('mini_app_admin_session', JSON.stringify(sObj));
        }
      }
    } catch(e) {}

    // Initialize user profile values in UI.
    function initUserProfile() {
      var sessionStr = window.localStorage.getItem('mini_app_admin_session');
      var session = sessionStr ? JSON.parse(sessionStr) : { username: 'Seavik', role: 'SUPER_ADMIN' };
      var cleanName = (session.username || 'Seavik').replace(/^Admin:\s*/i, '').replace(/\s*\([^)]*\)$/gi, '').trim();
      if (!cleanName) cleanName = 'Seavik';
      var roleLabel = session.role === 'SUPER_ADMIN' ? 'Super Admin' : (session.role || 'Admin');

      var sidebarNameEl = document.querySelector(".sidebar-user strong");
      var sidebarWorkspaceEl = document.querySelector(".sidebar-user small");

      if (sidebarNameEl) sidebarNameEl.textContent = cleanName;
      if (sidebarWorkspaceEl) sidebarWorkspaceEl.textContent = roleLabel;
    }

    initUserProfile();

    function setClass(element, className, enabled) {
      if (enabled) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }

    function setToggleExpanded() {
      var expanded = isDesktop()
        ? !body.classList.contains("sidebar-mini")
        : body.classList.contains("sidebar-open");

      if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", String(expanded));
      }
    }

    function closeMobileSidebar() {
      body.classList.remove("sidebar-open");
      setToggleExpanded();
    }

    function toggleSidebar() {
      if (isDesktop()) {
        body.classList.toggle("sidebar-mini");
        saveMiniState(storageAvailable, body.classList.contains("sidebar-mini"));
      } else {
        body.classList.toggle("sidebar-open");
      }

      setToggleExpanded();
    }

    function addCloseHandlers(items) {
      Array.prototype.forEach.call(items, function (item) {
        item.addEventListener("click", function () {
          if (!isDesktop()) {
            closeMobileSidebar();
          }
        });
        item.addEventListener("touchstart", function () {
          if (!isDesktop()) {
            closeMobileSidebar();
          }
        }, { passive: true });
      });
    }

    if (getSavedMiniState(storageAvailable) && isDesktop()) {
      body.classList.add("sidebar-mini");
    }

    var lastToggleTime = 0;
    function handleToggleEvent(e) {
      var now = Date.now();
      if (now - lastToggleTime < 350) {
        return;
      }
      lastToggleTime = now;
      toggleSidebar();
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", handleToggleEvent);
      sidebarToggle.addEventListener("touchstart", function(e) {
        handleToggleEvent(e);
      }, { passive: true });
    }

    var backdrop = document.querySelector(".sidebar-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeMobileSidebar);
      backdrop.addEventListener("touchstart", closeMobileSidebar, { passive: true });
    }

    addCloseHandlers(closeButtons);
    addCloseHandlers(sidebarLinks);
    setToggleExpanded();

    function handleBreakpointChange() {
      if (isDesktop()) {
        body.classList.remove("sidebar-open");
        setClass(body, "sidebar-mini", getSavedMiniState(storageAvailable));
      } else {
        body.classList.remove("sidebar-mini");
      }
      setToggleExpanded();
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleBreakpointChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleBreakpointChange);
    }

    function checkAdminAuth() {
      var path = window.location.pathname.toLowerCase();
      var isAuthPage = path.indexOf("login.html") !== -1 || path.indexOf("register.html") !== -1 || path.indexOf("forgot-password.html") !== -1;
      var sessionStr = window.localStorage.getItem("mini_app_admin_session");

      if (!isAuthPage) {
        if (!sessionStr) {
          window.location.href = "login.html";
          return false;
        }
        try {
          var parsed = JSON.parse(sessionStr);
          if (!parsed || !parsed.username) {
            window.localStorage.removeItem("mini_app_admin_session");
            window.location.href = "login.html";
            return false;
          }
        } catch (e) {
          window.localStorage.removeItem("mini_app_admin_session");
          window.location.href = "login.html";
          return false;
        }
      }
      return true;
    }

    if (!checkAdminAuth()) return;

    function renderAdminUserInfo() {
      try {
        var sessionStr = window.localStorage.getItem('mini_app_admin_session');
        var session = sessionStr ? JSON.parse(sessionStr) : { username: 'Seavik', role: 'SUPER_ADMIN' };
        var rawName = session.username || 'Seavik';
        var cleanName = rawName.replace(/^Admin:\s*/i, '').replace(/\s*\([^)]*\)$/gi, '').trim();
        if (!cleanName) cleanName = 'Seavik';
        var roleLabel = session.role === 'SUPER_ADMIN' ? 'Super Admin' : (session.role || 'Admin');
        var emailStr = session.email || (cleanName.toLowerCase() + '@miniapp.com');

        var actions = document.querySelector('.navbar-actions');
        if (actions) {
          var existingBadge = document.getElementById('admin-profile-badge');
          if (existingBadge) existingBadge.remove();

          var badge = document.createElement('div');
          badge.id = 'admin-profile-badge';
          badge.className = 'dropdown d-inline-block me-2';
          badge.innerHTML = '<button class="btn p-1 border-0 d-flex align-items-center gap-2 rounded-pill bg-body-tertiary shadow-none" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="' + cleanName + ' (' + roleLabel + ')">' +
            '<div class="position-relative">' +
              '<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style="width:36px;height:36px;font-size:18px;">' +
                '<i class="bi bi-person-circle"></i>' +
              '</div>' +
              '<span class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>' +
            '</div>' +
            '<div class="text-start d-none d-sm-block pe-1">' +
              '<div class="fw-bold text-body small leading-tight mb-0">👑 ' + cleanName + '</div>' +
              '<div class="text-primary text-uppercase font-monospace" style="font-size: 10px; font-weight: 600;">' + roleLabel + '</div>' +
            '</div>' +
            '<i class="bi bi-chevron-down text-muted small me-1"></i>' +
          '</button>' +
          '<ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2 p-3" style="min-width:250px;">' +
            '<li class="d-flex align-items-center gap-3 pb-3 border-bottom mb-2">' +
              '<div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style="width:44px;height:44px;font-size:22px;">' +
                '<i class="bi bi-person-badge-fill"></i>' +
              '</div>' +
              '<div class="overflow-hidden">' +
                '<h6 class="fw-bold mb-0 text-truncate">👑 ' + cleanName + '</h6>' +
                '<span class="badge bg-primary bg-opacity-10 text-primary small mt-1 font-monospace">' + roleLabel + '</span>' +
              '</div>' +
            '</li>' +
            '<li class="py-1">' +
              '<div class="small text-muted mb-2 d-flex align-items-center justify-content-between"><span><i class="bi bi-shield-check text-success me-1"></i> Status:</span> <strong class="text-success">Active 🟢</strong></div>' +
              '<div class="small text-muted mb-2 d-flex align-items-center justify-content-between"><span><i class="bi bi-person me-1"></i> User:</span> <strong class="text-body font-monospace">' + cleanName + '</strong></div>' +
              '<div class="small text-muted d-flex align-items-center justify-content-between"><span><i class="bi bi-envelope me-1"></i> Email:</span> <strong class="text-body">' + emailStr + '</strong></div>' +
            '</li>' +
            '<li><hr class="dropdown-divider my-2"></li>' +
            '<li>' +
              '<a class="dropdown-item py-2 rounded-2 d-flex align-items-center gap-2 small font-semibold" href="users.html">' +
                '<i class="bi bi-gear text-primary"></i> Account & Staff Settings' +
              '</a>' +
            '</li>' +
            '<li>' +
              '<a class="dropdown-item text-danger py-2 rounded-2 d-flex align-items-center gap-2 small font-semibold mt-1" href="login.html" onclick="window.localStorage.removeItem(\'mini_app_admin_session\')">' +
                '<i class="bi bi-box-arrow-right"></i> Sign Out' +
              '</a>' +
            '</li>' +
          '</ul>';
          actions.insertBefore(badge, actions.firstChild);
        }
      } catch (e) {}
    }

    renderAdminUserInfo();
  });
})();
