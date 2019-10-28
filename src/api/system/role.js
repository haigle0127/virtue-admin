import request from '@/utils/request'
import { param } from '@/utils'

export function list(data) {
  return request({
    url: '/admin/role/list',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/admin/role/save',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/admin/role/update',
    method: 'post',
    data
  })
}

export function remove(query) {
  const data = param(query)
  return request({
    url: '/admin/role/delete',
    method: 'post',
    data
  })
}

export function getMenuAllTree() {
  return request({
    url: '/admin/role/getMenuAllTree',
    method: 'post'
  })
}

export function getRoleMenuList(query) {
  const data = param(query)
  return request({
    url: '/admin/role/getRoleMenuList',
    method: 'post',
    data
  })
}
