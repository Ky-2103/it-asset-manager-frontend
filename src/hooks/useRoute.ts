import { useEffect, useState } from 'react'

const hasWindow = typeof window !== 'undefined'

function normalizeRoute(route: string) {
  return route.startsWith('/') ? route : `/${route}`
}

export function useRoute(defaultRoute = '/') {
  const [route, setRoute] = useState(() => {
    if (!hasWindow) return normalizeRoute(defaultRoute)
    return normalizeRoute(window.location.pathname || defaultRoute)
  })

  useEffect(() => {
    if (!hasWindow) return

    const onPopState = () => {
      setRoute(normalizeRoute(window.location.pathname || defaultRoute))
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [defaultRoute])

  function navigate(to: string, options?: { replace?: boolean }) {
    const nextRoute = normalizeRoute(to)

    if (hasWindow) {
      const method = options?.replace ? 'replaceState' : 'pushState'
      window.history[method](null, '', nextRoute)
    }

    setRoute(nextRoute)
  }

  return { route, navigate }
}
