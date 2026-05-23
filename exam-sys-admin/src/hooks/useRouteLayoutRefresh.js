import { useEffect } from 'react'

const useRouteLayoutRefresh = (deps = []) => {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined
        }

        const refreshLayout = () => {
            window.dispatchEvent(new Event('resize'))
        }

        const rafIds = []
        const timerIds = []

        refreshLayout()
        rafIds.push(window.requestAnimationFrame(refreshLayout))
        rafIds.push(window.requestAnimationFrame(() => window.requestAnimationFrame(refreshLayout)))

        ;[120, 320, 520].forEach(delay => {
            timerIds.push(window.setTimeout(refreshLayout, delay))
        })

        return () => {
            rafIds.forEach(id => window.cancelAnimationFrame(id))
            timerIds.forEach(id => window.clearTimeout(id))
        }
    }, deps)
}

export default useRouteLayoutRefresh
