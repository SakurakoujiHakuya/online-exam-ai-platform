import React from 'react'
import { Select } from 'antd'

const TagSelect = ({ tags = [], allowCreate = false, value, onChange, placeholder = '请选择标签', style, loading = false }) => {
    const options = allowCreate
        ? tags.map(tag => ({ value: tag.name, label: tag.name }))
        : tags.map(tag => ({ value: tag.id, label: tag.name }))

    return (
        <Select
            mode={allowCreate ? 'tags' : 'multiple'}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            style={style}
            loading={loading}
            allowClear
            showSearch
            maxTagCount="responsive"
            optionFilterProp="label"
        />
    )
}

export default TagSelect
