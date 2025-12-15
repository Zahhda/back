import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

 
  useEffect(() => {
    if ("scrollRestoration" in history) {
      const prev = (history as any).scrollRestoration;
      (history as any).scrollRestoration = "manual";
      return () => { (history as any).scrollRestoration = prev; };
    }
  }, []);

  useEffect(() => {

    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
 
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, hash]);

  return null;
}
