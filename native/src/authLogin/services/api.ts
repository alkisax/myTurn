// native\src\authLogin\services\api.ts

// 🔁 shared axios instance
// χρησιμοποιούμε wrapper αντί για raw axios για:
// - future interceptors (auth, logging, retry)
// - centralized error handling
import axios from 'axios'

export const api = axios.create()

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      console.log('TOKEN INVALID → need login')
    }

    return Promise.reject(err)
  }
)