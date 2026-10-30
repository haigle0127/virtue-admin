/** 后端统一响应壳 */
export interface ApiResult<T> {
  code: number
  msg: string
  data: T
}

/** 分页结果，后端 Long 会序列化为字符串 */
export interface PageResult<T> {
  list: T[]
  total: string | number
  pageNo?: number | null
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  userId: string
  expiresTime: string | number
}

export interface RoleOption {
  id: string
  name: string
}

export interface UserInfo {
  id: string
  username: string
  nickname?: string | null
  email?: string | null
  phone?: string | null
  avatar?: string | null
  introduction?: string | null
  education?: string | null
  roles: string[]
}

export interface UserPageItem {
  id: string
  username?: string | null
  nickname?: string | null
  email?: string | null
  phone?: string | null
  mobile?: string | null
  status?: number | null
}

export interface UserDetail extends UserPageItem {
  roleIds?: string[]
  roles?: RoleOption[]
}

export interface UserSavePayload {
  id?: string
  username: string
  nickname?: string
  email?: string
  phone?: string
  password?: string
  status: number
  roleIds: number[]
}

export interface RoleItem {
  id: string
  name?: string | null
  mark?: string | null
  code?: string | null
  description?: string | null
  remark?: string | null
  state?: string | null
  status?: number | null
  sort?: string | null
}

export interface RoleSavePayload {
  id?: string
  name: string
  code: string
  description?: string
  status: number
  sort: number
}

export interface DictTypeItem {
  id: string
  name?: string | null
  type?: string | null
  status?: string | null
  remark?: string | null
}

export interface DictTypeSavePayload {
  id?: string
  name: string
  type: string
  status: string
  remark?: string
}

export interface DictDataItem {
  id: string
  label?: string | null
  value?: string | null
  dictType?: string | null
  status?: string | null
  sort?: number | null
  colorType?: string | null
  cssClass?: string | null
  remark?: string | null
}

export interface DictDataSavePayload {
  id?: string
  label: string
  value: string
  dictType: string
  status: string
  sort: number
  colorType?: string
  remark?: string
}
