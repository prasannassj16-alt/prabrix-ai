import '@testing-library/jest-dom';

// Polyfill window.matchMedia if not defined or partially defined in jsdom
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        media: '',
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return true;
        },
      };
    };

  // Ensure addEventListener / removeEventListener exist on existing matchMedia objects
  const origMatchMedia = window.matchMedia;
  window.matchMedia = function (query) {
    const res = origMatchMedia(query);
    if (!res.addEventListener) res.addEventListener = function () {};
    if (!res.removeEventListener) res.removeEventListener = function () {};
    return res;
  };
}
