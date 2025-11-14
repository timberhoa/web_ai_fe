import http from './http'
import type { Role } from './auth'
import type { Page } from './adminUsers'

export type ActivityLogResponse = {
  id: string
  userId: string
  username: string
  role: Role
  action: string
  method: string
  path: string
  query: string | null
  status: number
  ipAddress: string
  userAgent: string
  message: string
  durationMs: number
  occurredAt: string
}

export type ActivityLogFilter = {
  page?: number
  size?: number
  sort?: string
  from?: string // ISO date-time
  to?: string // ISO date-time
  username?: string
  role?: Role
  method?: string
  status?: number
  path?: string
  action?: string
  keyword?: string // fuzzy search across action/path/message
}

export const activityLogsApi = {
  async list(params: ActivityLogFilter = {}) {
    const {
      page = 0,
      size = 20,
      sort = 'occurredAt,desc',
      from,
      to,
      username,
      role,
      method,
      status,
      path,
      action,
      keyword,
    } = params

    const { data } = await http.get<Page<ActivityLogResponse>>('/admin/activity-logs', {
      params: {
        page,
        size,
        sort,
        ...(from && { from }),
        ...(to && { to }),
        ...(username && { username }),
        ...(role && { role }),
        ...(method && { method }),
        ...(status !== undefined && { status }),
        ...(path && { path }),
        ...(action && { action }),
        ...(keyword && { keyword }),
      },
    })
    return data
  },

  async detail(id: string) {
    const { data } = await http.get<ActivityLogResponse>(`/admin/activity-logs/${id}`)
    return data
  },
}

export default activityLogsApi

