// Component Tooltip – start
(function () {
  const HIDE_DELAY_MS = 150;
  let hideTipTimer = null;
  let escapeHandler = null;

  const clearHideTimer = () => {
    if (hideTipTimer) {
      clearTimeout(hideTipTimer);
      hideTipTimer = null;
    }
  };

  const setTipPosition = (tool, tip) => {
    // Take up the most area available on top/right/bottom/left of the tool. Relative to body.
    const rect = tool.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    const top = rect.top;
    const left = rect.left;
    const right = innerWidth - left - rect.width;
    const bottom = innerHeight - top - rect.height; // To do: check when body is shorter than viewport
    const area_top = top * innerWidth;
    const area_right = right * innerHeight;
    const area_bottom = bottom * innerWidth;
    const area_left = left * innerHeight;
    const body_rect = document.body.getBoundingClientRect();
    tip.removeAttribute("style");
    delete tip.dataset.nPosition;
    tip.classList.add("n-tooltip__content-visible");
    const positionTop = () => {
      tip.style.bottom = 20 + body_rect.height + body_rect.y - top + "px";
      tip.style.maxHeight = top - 40 + "px";
      tip.style.left = `${
        rect.x + rect.width / 2 - tip.scrollWidth / 2 - body_rect.x
      }px`;
      tip.dataset.nPosition = "top";
    };
    const positionBottom = () => {
      tip.style.top = 20 - body_rect.y + top + rect.height + "px";
      tip.style.maxHeight = bottom - 40 + "px";
      tip.style.left = `${
        rect.x + rect.width / 2 - tip.scrollWidth / 2 - body_rect.x
      }px`;
      tip.dataset.nPosition = "bottom";
    };
    const positionLeft = () => {
      tip.style.left = "auto";
      tip.style.right =
        20 +
        body_rect.width +
        body_rect.x -
        innerWidth +
        right +
        rect.width +
        "px";
      tip.style.maxWidth = left - 40 + "px";
      tip.style.top = `${
        -1 * body_rect.y + rect.top + rect.height / 2 - tip.scrollHeight / 2
      }px`;
      tip.dataset.nPosition = "left";
    };
    const positionRight = () => {
      tip.style.left = rect.x - body_rect.x + rect.width + 20 + "px";
      tip.style.maxWidth = right - 40 + "px";
      tip.style.top = `${
        -1 * body_rect.y + rect.top + rect.height / 2 - tip.scrollHeight / 2
      }px`;
      tip.dataset.nPosition = "right";
    };
    if (area_left > area_right) {
      if (area_top > area_bottom) {
        if (area_top > area_left) {
          // Top
          positionTop();
        } else {
          // Left
          positionLeft();
        }
      } else {
        if (area_bottom > area_left) {
          // Bottom
          positionBottom();
        } else {
          // Left
          positionLeft();
        }
      }
    } else {
      if (area_top > area_bottom) {
        if (area_top > area_right) {
          // Top
          positionTop();
        } else {
          // Right
          positionRight();
        }
      } else {
        if (area_bottom > area_right) {
          // Bottom
          positionBottom();
        } else {
          // Right
          positionRight();
        }
      }
    }
    let rect_tip = tip.getBoundingClientRect();
    let offset_y = 0;
    if (rect_tip.y < 0) {
      offset_y = Math.abs(rect_tip.y) + 10;
    } else {
      if (rect_tip.bottom > innerHeight) {
        offset_y = innerHeight - rect_tip.bottom - 10;
      }
    }
    tip.style.setProperty("--offset_y", offset_y + "px");
    let offset_x = 0;
    if (rect_tip.x < 0) {
      offset_x = Math.abs(rect_tip.x) + 10;
    } else {
      if (rect_tip.right > innerWidth) {
        offset_x = innerWidth - rect_tip.right - 10;
      }
    }
    tip.style.setProperty("--offset_x", offset_x + "px");
  };

  function getToolTip(tool) {
    if (!tool) return null;
    return (
      document.getElementById(tool.getAttribute("aria-describedby")) ||
      tool.nextElementSibling
    );
  }

  const scrollListenerOptions = { capture: true, passive: true };

  const removeGlobalListenersIfIdle = () => {
    if (!document.querySelector('.n-tooltip[aria-expanded="true"]')) {
      document.removeEventListener(
        "scroll",
        hideTipOnScroll,
        scrollListenerOptions
      );
      if (escapeHandler) {
        document.removeEventListener("keydown", escapeHandler);
        escapeHandler = null;
      }
    }
  };

  const hideTipFunction = (tool) => {
    if (!tool) return;
    clearHideTimer();
    let tip = getToolTip(tool);
    if (!tip) return;
    tool.removeAttribute("aria-expanded");
    tool.after(tip);
    tip.removeAttribute("style");
    delete tip.dataset.nPosition;
    tip.classList.remove("n-tooltip__content-visible");
    removeGlobalListenersIfIdle();
  };

  const scheduleHideTip = (tool) => {
    clearHideTimer();
    hideTipTimer = setTimeout(() => {
      hideTipTimer = null;
      hideTipFunction(tool);
    }, HIDE_DELAY_MS);
  };

  const ensureTipHoverHandlers = (tool, tip) => {
    tip._nTooltipTrigger = tool;
    if (tip.dataset.nTipHover) return;
    tip.dataset.nTipHover = "true";
    tip.dataset.ready = true;
    tip.addEventListener("mouseenter", () => {
      clearHideTimer();
    });
    tip.addEventListener("mouseleave", () => {
      const trigger = tip._nTooltipTrigger;
      if (trigger) scheduleHideTip(trigger);
    });
    tip.addEventListener("focusout", (e) => {
      const trigger = tip._nTooltipTrigger;
      if (
        trigger &&
        (!e.relatedTarget ||
          (!tip.contains(e.relatedTarget) && e.relatedTarget !== trigger))
      ) {
        hideTipFunction(trigger);
      }
    });
  };

  const ensureEscapeHandler = () => {
    if (escapeHandler) return;
    escapeHandler = (e) => {
      if (e.key !== "Escape") return;
      document
        .querySelectorAll('.n-tooltip[aria-expanded="true"]')
        .forEach((el) => hideTipFunction(el));
    };
    document.addEventListener("keydown", escapeHandler);
  };

  const hideTip = (e) => {
    const tool = e.currentTarget;
    if (e.type === "mouseleave") {
      scheduleHideTip(tool);
      return;
    }
    // blur: keep open if focus moved into the tip content
    const tip = getToolTip(tool);
    if (tip && e.relatedTarget && tip.contains(e.relatedTarget)) {
      return;
    }
    hideTipFunction(tool);
  };

  const hideTipOnScroll = () => {
    document
      .querySelectorAll(".n-tooltip")
      .forEach((el) => hideTipFunction(el));
    removeGlobalListenersIfIdle();
  };

  const showTip = (e) => {
    const tool = e.currentTarget;
    clearHideTimer();
    document
      .querySelectorAll('.n-tooltip[aria-expanded="true"]')
      .forEach((openTool) => {
        if (openTool !== tool) hideTipFunction(openTool);
      });
    if (tool.getAttribute("aria-expanded") === "true") return;
    const tip = getToolTip(tool);
    if (!tip) return;
    tip.dataset.ready = true;
    tool.setAttribute("aria-expanded", true);
    document.body.appendChild(tip);
    ensureTipHoverHandlers(tool, tip);
    setTipPosition(tool, tip);
    document.addEventListener("scroll", hideTipOnScroll, scrollListenerOptions);
    ensureEscapeHandler();
  };

  const init = (host = document) => {
    /* Tooltip */
    host.querySelectorAll(".n-tooltip:not([data-ready])").forEach((el) => {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", 0);
      const tip = getToolTip(el);
      if (tip) {
        if (!tip.id) {
          tip.id = "n-tooltip-" + Math.random().toString(36).slice(2, 10);
        }
        if (!el.hasAttribute("aria-describedby")) {
          el.setAttribute("aria-describedby", tip.id);
        }
        tip.dataset.ready = true;
      }
      el.addEventListener("touchend", showTip);
      el.addEventListener("mouseenter", showTip);
      el.addEventListener("focus", showTip);
      el.addEventListener("mouseleave", hideTip);
      el.addEventListener("blur", hideTip);
      el.dataset.ready = true;
    });
  };
  typeof nui !== "undefined" && typeof nui.registerComponent === "function"
    ? nui.registerComponent("n-tooltip", init)
    : init();
})();
// Component Tooltip – end
