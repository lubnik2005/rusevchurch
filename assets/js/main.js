/**
 * Slavic Evangelical Baptist Church of Orange County
 * Site scripts (adapted from BootstrapMade "TheEvent" template, trimmed).
 */
(function() {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim()
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el)
  }

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll (scrollspy).
   * Uses "last section whose top is above the reading line" so exactly one
   * link is active, and forces the final link active at the bottom of the
   * page (so a tall footer can't leave the last item unhighlighted).
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    const position = window.scrollY + 200
    const atBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 2

    // Collect nav links that point to an on-page section, in document order.
    const sectioned = navbarlinks.filter(l => l.hash && select(l.hash))

    let current = null
    sectioned.forEach(link => {
      const section = select(link.hash)
      if (position >= section.offsetTop) current = link
    })
    if (atBottom && sectioned.length) current = sectioned[sectioned.length - 1]

    navbarlinks.forEach(l => l.classList.toggle('active', l === current))
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight
    if (!header.classList.contains('header-scrolled')) {
      offset -= 20
    }
    let elementPos = select(el).offsetTop
    window.scrollTo({ top: elementPos - offset, behavior: 'smooth' })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      selectHeader.classList.toggle('header-scrolled', window.scrollY > 100)
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      backtotop.classList.toggle('active', window.scrollY > 100)
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('active')
  })

  /**
   * Smooth scroll with offset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()
      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        if (navbarToggle) navbarToggle.classList.remove('active')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with offset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollto(window.location.hash)
    }
  });

  /**
   * Lazy-load Google Maps automatically. The heavy Maps iframe is only
   * requested once the venue section scrolls near the viewport, so the
   * initial page stays free of maps.googleapis.com / maps.gstatic.com
   * requests without requiring a user click.
   */
  /**
   * Warm up Google Maps origins just before the map is requested.
   * Done in JS (not a static <head> preconnect) so the hints are never
   * flagged as "unused" on the initial page load.
   */
  const warmMapOrigins = () => {
    if (window.__mapOriginsWarmed) return
    window.__mapOriginsWarmed = true
    ;['https://maps.googleapis.com', 'https://maps.gstatic.com'].forEach(function(origin) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = origin
      document.head.appendChild(link)
    })
  }

  const injectMap = (holder) => {
    const src = holder.getAttribute('data-map-src')
    if (!src || holder.dataset.mapLoaded) return
    holder.dataset.mapLoaded = '1'
    const iframe = document.createElement('iframe')
    iframe.title = holder.getAttribute('data-map-title') || 'Google Map'
    iframe.src = src
    iframe.loading = 'lazy'
    iframe.width = '600'
    iframe.height = '450'
    iframe.style.border = '0'
    iframe.allowFullscreen = true
    iframe.setAttribute('tabindex', '0')
    const placeholder = holder.querySelector('.map-placeholder')
    if (placeholder) placeholder.remove()
    holder.appendChild(iframe)
  }

  const mapHolder = select('#map-holder')
  if (mapHolder) {
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            warmMapOrigins()
            injectMap(mapHolder)
            observer.disconnect()
          }
        })
      }, { rootMargin: '300px' })
      obs.observe(mapHolder)
    } else {
      warmMapOrigins()
      injectMap(mapHolder)
    }
  }

})()
