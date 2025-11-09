import http from "./http"
import type { User } from "./auth"

export const userApi = {
  async getProfile(): Promise<User> {
    const { data } = await http.get<User>('/user/me')
    return data
  },
}
