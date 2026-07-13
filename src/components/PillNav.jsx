import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  brandName = '',
  items,
  activeHref,
  cta,
  className = '',
  ease = 'power3.easeOut',
  initialLoadAnimation = true
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0 });
    }

    if (initialLoadAnimation && navRef.current) {
      gsap.from(navRef.current, {
        y: -24,
        opacity: 0,
        duration: 0.7,
        ease
      });
    }
  }, [ease, initialLoadAnimation]);

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: 'hidden' })
        });
      }
    }
  };

  const closeMobileMenu = () => {
    if (!isMobileMenuOpen) return;
    toggleMobileMenu();
  };

  return (
    <div className={`pill-nav-container ${className}`}>
      <nav className="pill-nav" aria-label="Primary" ref={navRef}>
        {/* Brand: logo + name */}
        <a
          className="pill-nav-brand"
          href="/"
          onMouseEnter={handleLogoEnter}
        >
          {logo && (
            <img
              src={logo}
              alt={logoAlt}
              ref={logoImgRef}
              className="pill-nav-logo"
            />
          )}
          {brandName && (
            <span className="pill-nav-brand-text">{brandName}</span>
          )}
        </a>

        {/* Desktop nav links */}
        <ul className="pill-nav-links desktop-only" role="menubar">
          {items.map((item, i) => (
            <li key={item.href || `item-${i}`} role="none">
              <a
                role="menuitem"
                href={item.href}
                className={`pill-nav-link${activeHref === item.href ? ' is-active' : ''}`}
                aria-label={item.ariaLabel || item.label}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        {cta && (
          <a className="pill-nav-cta desktop-only" href={cta.href}>
            {cta.label}
          </a>
        )}

        {/* Mobile hamburger */}
        <button
          className="pill-nav-hamburger mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <div className="pill-nav-mobile-menu mobile-only" ref={mobileMenuRef}>
        <ul className="pill-nav-mobile-list">
          {items.map((item, i) => (
            <li key={item.href || `mobile-${i}`}>
              <a
                href={item.href}
                className={`pill-nav-mobile-link${activeHref === item.href ? ' is-active' : ''}`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </a>
            </li>
          ))}
          {cta && (
            <li>
              <a
                href={cta.href}
                className="pill-nav-mobile-cta"
                onClick={closeMobileMenu}
              >
                {cta.label}
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
