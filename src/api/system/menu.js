import request from '@/utils/request'
import { param } from '@/utils'

export function list(query) {
  const data = param(query)
  return request({
    url: '/admin/menu/list',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/admin/menu/save',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/admin/menu/update',
    method: 'post',
    data
  })
}

export function remove(query) {
  const data = param(query)
  return request({
    url: '/admin/menu/delete',
    method: 'post',
    data
  })
}
