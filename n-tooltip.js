// Component Tooltip – start
(function () {
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
  const hideTipFunction = (tool) => {
    if (!tool) return;
    let tip = getToolTip(tool);
    if (!tip) return;
    tool.removeAttribute("aria-expanded");
    tool.after(tip);
    tip.removeAttribute("style");
    delete tip.dataset.nPosition;
    tip.classList.remove("n-tooltip__content-visible");
    // If nothing is open, we don't need the scroll listener hanging around.
    if (!document.querySelector('.n-tooltip[aria-expanded="true"]')) {
      document.removeEventListener(
        "scroll",
        hideTipOnScroll,
        scrollListenerOptions
      );
    }
  };
  const hideTip = (e) => {
    hideTipFunction(e.currentTarget);
  };
  const hideTipOnScroll = (e) => {
    document
      .querySelectorAll(".n-tooltip")
      .forEach((el) => hideTipFunction(el));
    document.removeEventListener(
      "scroll",
      hideTipOnScroll,
      scrollListenerOptions
    );
  };
  const showTip = (e) => {
    const tool = e.currentTarget;
    if (tool.getAttribute("aria-expanded") === "true") return;
    const tip = getToolTip(tool);
    if (!tip) return;
    tool.setAttribute("aria-expanded", true);
    document.body.appendChild(tip);
    setTipPosition(tool, tip);
    document.addEventListener("scroll", hideTipOnScroll, scrollListenerOptions);
  };
  const init = (host = document) => {
    /* Tooltip */
    host.querySelectorAll(".n-tooltip:not([data-ready])").forEach((el) => {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", 0);
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
