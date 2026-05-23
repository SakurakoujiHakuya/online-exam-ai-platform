export const buildGroupOptions = (subjects = []) => {
    const groupMap = new Map()

    subjects.forEach((subject) => {
        if (subject?.userGroupId == null || !subject?.userGroupName || groupMap.has(subject.userGroupId)) {
            return
        }
        groupMap.set(subject.userGroupId, {
            userGroupId: subject.userGroupId,
            userGroupName: subject.userGroupName,
            level: subject.userGroupId,
            levelName: subject.userGroupName
        })
    })

    return Array.from(groupMap.values()).sort((a, b) => a.userGroupId - b.userGroupId)
}
