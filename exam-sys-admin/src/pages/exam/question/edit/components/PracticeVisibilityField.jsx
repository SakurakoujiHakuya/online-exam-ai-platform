import React from 'react'
import { Checkbox, Form } from 'antd'

const PracticeVisibilityField = () => (
    <Form.Item
        name="hideInPracticeCenter"
        valuePropName="checked"
        extra="开启后，该题不会在学生试题中心中展示，但教师仍可在后台组卷并用于正式考试。"
    >
        <Checkbox>在学生试题中心隐藏</Checkbox>
    </Form.Item>
)

export default PracticeVisibilityField
