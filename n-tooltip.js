// Component Tooltip (v4 – Popover + CSS Anchor Positioning, CSS :hover/:focus-within baseline)
(function () {
  const canAnchorPopover =
    typeof HTMLElement !== "undefined" &&
    "popover" in HTMLElement.prototype &&
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("anchor-name: --a");
  let seq = 0;

  const init = (host = document) => {
    host.querySelectorAll(".n-tooltip:not([data-ready])").forEach((tool) => {
      tool.dataset.ready = true;
      if (!tool.hasAttribute("tabindex")) tool.setAttribute("tabindex", "0");
      const describedId = tool.getAttribute("aria-describedby");
      const tip =
        (describedId && document.getElementById(describedId)) ||
        (tool.nextElementSibling?.classList.contains("n-tooltip__content")
          ? tool.nextElementSibling
          : tool.querySelector(".n-tooltip__content"));
      if (!tip) return;
      const id = ++seq;
      if (!tip.id) tip.id = `n-tip-${id}`;
      if (!tip.hasAttribute("role")) tip.setAttribute("role", "tooltip");
      if (!describedId) tool.setAttribute("aria-describedby", tip.id);

      if (!canAnchorPopover) return;
      if (!tip.hasAttribute("popover")) tip.setAttribute("popover", "auto");
      const anchor = `--n-tip-${id}`;
      tool.style.setProperty("anchor-name", anchor);
      tip.style.setProperty("position-anchor", anchor);

      let timer;
      const show = () => {
        clearTimeout(timer);
        if (!tip.matches(":popover-open")) {
          try { tip.showPopover(); } catch {}
        }
      };
      const hide = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (tip.matches(":popover-open")) {
            try { tip.hidePopover(); } catch {}
          }
        }, 150);
      };

      tool.addEventListener("mouseenter", show);
      tool.addEventListener("focus", show);
      tool.addEventListener("mouseleave", hide);
      tool.addEventListener("blur", (e) => {
        if (!e.relatedTarget || !tip.contains(e.relatedTarget)) hide();
      });
      tip.addEventListener("mouseenter", () => clearTimeout(timer));
      tip.addEventListener("mouseleave", hide);
      tip.addEventListener("focusout", (e) => {
        if (!e.relatedTarget || (!tip.contains(e.relatedTarget) && e.relatedTarget !== tool)) {
          hide();
        }
      });
    });
  };

  typeof nui !== "undefined" && typeof nui.registerComponent === "function"
    ? nui.registerComponent("n-tooltip", init)
    : init();
})();
