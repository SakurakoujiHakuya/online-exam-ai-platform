export const PRACTICE_HIDDEN_TAG_NAME = '考前保密'

export const sanitizeEditableTagNames = (tagNames = []) => (
    [...new Set(
        (tagNames || [])
            .map(name => typeof name === 'string' ? name.trim() : '')
            .filter(Boolean)
            .filter(name => name !== PRACTICE_HIDDEN_TAG_NAME)
    )]
)

export const splitTagSelection = (selectedNames = [], tags = []) => {
    const normalizedNames = sanitizeEditableTagNames(selectedNames)

    const tagIdMap = new Map((tags || []).map(tag => [tag.name, tag.id]))
    const tagIds = []
    const newTagNames = []

    normalizedNames.forEach(name => {
        const tagId = tagIdMap.get(name)
        if (tagId != null) {
            tagIds.push(tagId)
        } else {
            newTagNames.push(name)
        }
    })

    return {
        tagIds,
        newTagNames,
        tagNames: normalizedNames
    }
}
