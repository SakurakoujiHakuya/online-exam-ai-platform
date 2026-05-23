import axios from 'axios'
import { message } from 'antd'
import Cookies from 'js-cookie'

const AUTH_ERROR_CODES = [400, 401, 403, 502, 50012, 50014]

let redirectingToLogin = false

const isAuthErrorCode = (code) => AUTH_ERROR_CODES.includes(Number(code))

const redirectToLogin = () => {
    if (redirectingToLogin || window.location.pathname === '/login') {
        return
    }
    redirectingToLogin = true
    Cookies.remove('adminUserName')
    Cookies.remove('adminUserInfo')
    window.location.replace('/login')
}

const request = function (loadtip, query) {
    let loadingMessage = null
    if (loadtip) {
        loadingMessage = message.loading({
            content: '正在加载中…',
            duration: 0
        })
    }
    return axios.request(query)
        .then(res => {
            if (loadtip && loadingMessage) {
                loadingMessage()
            }
            if (isAuthErrorCode(res.data.code)) {
                redirectToLogin()
                return Promise.reject(res.data)
            } else if (res.data.code === 500 || res.data.code === 501) {
                return Promise.reject(res.data)
            } else {
                return Promise.resolve(res.data)
            }
        })
        .catch(e => {
            if (loadtip && loadingMessage) {
                loadingMessage()
            }
            const status = e?.response?.status
            const responseCode = e?.response?.data?.code
            if (isAuthErrorCode(e?.code) || isAuthErrorCode(responseCode) || status === 401 || status === 403) {
                redirectToLogin()
                return Promise.reject(e)
            }
            message.error(e?.message || '请求失败')
            return Promise.reject(e?.message || e)
        })
}

const post = function (url, params, config = {}) {
    const query = {
        baseURL: import.meta.env.VITE_API_URL,
        url: url,
        method: 'post',
        withCredentials: true,
        timeout: config.timeout || 30000,
        data: params,
        headers: { 'Content-Type': 'application/json', 'request-ajax': true, ...(config.headers || {}) }
    }
    return request(false, query)
}

const postWithLoadTip = function (url, params) {
    const query = {
        baseURL: import.meta.env.VITE_API_URL,
        url: url,
        method: 'post',
        withCredentials: true,
        timeout: 30000,
        data: params,
        headers: { 'Content-Type': 'application/json', 'request-ajax': true }
    }
    return request(true, query)
}

const postWithOutLoadTip = function (url, params) {
    const query = {
        baseURL: import.meta.env.VITE_API_URL,
        url: url,
        method: 'post',
        withCredentials: true,
        timeout: 30000,
        data: params,
        headers: { 'Content-Type': 'application/json', 'request-ajax': true }
    }
    return request(false, query)
}

const get = function (url, params) {
    const query = {
        baseURL: import.meta.env.VITE_API_URL,
        url: url,
        method: 'get',
        withCredentials: true,
        timeout: 30000,
        params: params,
        headers: { 'request-ajax': true }
    }
    return request(false, query)
}

const form = function (url, params) {
    const query = {
        baseURL: import.meta.env.VITE_API_URL,
        url: url,
        method: 'post',
        withCredentials: true,
        timeout: 30000,
        data: params,
        headers: { 'Content-Type': 'multipart/form-data', 'request-ajax': true }
    }
    return request(false, query)
}

export {
    post,
    postWithLoadTip,
    postWithOutLoadTip,
    get,
    form
}
