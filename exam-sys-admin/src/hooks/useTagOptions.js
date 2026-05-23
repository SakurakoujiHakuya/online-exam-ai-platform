import { useCallback, useEffect, useState } from 'react'
import { list as listTags } from '@/api/tag'

const useTagOptions = () => {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchTags = useCallback(async (keyword = null) => {
        setLoading(true)
        try {
            const res = await listTags(keyword ? { keyword } : undefined)
            if (res.code === 1) {
                setTags(res.response || [])
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTags()
    }, [fetchTags])

    return { tags, loading, refreshTags: fetchTags }
}

export default useTagOptions
