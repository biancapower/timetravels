import { useEffect, useState } from 'react';

export interface Route {
  view: 'sentence' | 'help' | 'about';
  /** A section of the view to open at, by its element id. */
  section?: string;
}

const routes: Record<string, Route> = {
  '#help': { view: 'help' },
  '#about': { view: 'about' },
  '#privacy': { view: 'about', section: 'privacy' },
};

function read(): Route {
  return routes[location.hash] ?? { view: 'sentence' };
}

/**
 * Which view the address shows. Help and About have their own addresses,
 * so they can be linked to and the browser's Back button closes them.
 */
export function useRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const update = () => {
      setRoute(read());
    };
    addEventListener('popstate', update);
    addEventListener('hashchange', update);
    return () => {
      removeEventListener('popstate', update);
      removeEventListener('hashchange', update);
    };
  }, []);

  const open = (hash: string) => {
    history.pushState({ fromSentence: true }, '', hash);
    setRoute(read());
  };

  // Opened from the sentence, closing is the same as Back. Opened from a
  // link elsewhere, there is nothing to go back to, so drop the hash.
  const close = () => {
    const state = history.state as { fromSentence?: boolean } | null;
    if (state?.fromSentence) {
      history.back();
    } else {
      history.replaceState(null, '', location.pathname + location.search);
      setRoute(read());
    }
  };

  return { route, open, close };
}
