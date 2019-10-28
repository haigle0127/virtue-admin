import request from '@/utils/request'
import { param } from '@/utils'

export function list(data) {
  return request({
    url: '/admin/user/list',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/admin/user/save',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/admin/user/update',
    method: 'post',
    data
  })
}

export function remove(query) {
  const data = param(query)
  return request({
    url: '/admin/user/delete',
    method: 'post',
    data
  })
}

export function getRoleAllList() {
  return request({
    url: '/admin/user/getRoleAllList',
    method: 'post'
  })
}

export function getUserRoleList(query) {
  const data = param(query)
  return request({
    url: '/admin/user/getUserRoleList',
    method: 'post',
    data
  })
}
