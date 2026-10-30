<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RoleItem, RoleSavePayload } from '~/types/api'

const props = defineProps<{
  roleId?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [] }>()

const api = useApi()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)

const state = reactive({
  name: '',
  code: '',
  description: '',
  status: 0,
  sort: 0
})

const isEdit = computed(() => !!props.roleId)
const title = computed(() => isEdit.value ? '编辑角色' : '新建角色')

const schema = z.object({
  name: z.string().trim().min(1, '请输入角色名称'),
  code: z.string().trim().min(1, '请输入角色标识').regex(/^[a-zA-Z][\w-]*$/, '以字母开头，仅支持字母、数字、下划线、短横线'),
  description: z.string().trim().optional(),
  status: z.number().int(),
  sort: z.number().int().min(0, '排序不能小于 0')
})

type Schema = z.output<typeof schema>

watch(open, async (value) => {
  if (!value) {
    return
  }
  loading.value = true
  try {
    if (props.roleId) {
      const role = await api.request<RoleItem>('/admin-api/role/get', { query: { id: props.roleId } })
      Object.assign(state, {
        name: role.name || '',
        code: role.mark || role.code || '',
        description: role.description || role.remark || '',
        status: role.status ?? 0,
        sort: Number(role.sort ?? 0)
      })
    } else {
      Object.assign(state, { name: '', code: '', description: '', status: 0, sort: 0 })
    }
  } catch (error) {
    toast.add({
      title: '加载角色失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    loading.value = false
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  try {
    const payload: RoleSavePayload = {
      name: event.data.name,
      code: event.data.code,
      description: event.data.description,
      status: event.data.status,
      sort: event.data.sort
    }
    if (props.roleId) {
      payload.id = props.roleId
    }

    await api.request(props.roleId ? '/admin-api/role/update' : '/admin-api/role/create', {
      method: props.roleId ? 'PUT' : 'POST',
      body: payload
    })

    toast.add({
      title: isEdit.value ? '角色已更新' : '角色已创建',
      color: 'success',
      icon: 'i-lucide-check'
    })
    open.value = false
    emit('saved')
  } catch (error) {
    toast.add({
      title: '保存失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="isEdit ? '修改角色信息，角色标识会同步到权限判断' : '角色标识将作为 ROLE_ 前缀写入访问令牌'"
    :dismissible="!saving"
  >
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>

      <UForm
        v-else
        id="role-form"
        :schema="schema"
        :state="state"
        class="grid gap-4 sm:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField name="name" label="角色名称" required>
          <UInput v-model="state.name" placeholder="例如：超级管理员" class="w-full" />
        </UFormField>

        <UFormField
          name="code"
          label="角色标识"
          required
          description="英文标识，鉴权唯一依据"
        >
          <UInput v-model="state.code" placeholder="例如：admin" class="w-full" />
        </UFormField>

        <UFormField name="status" label="状态">
          <USelect v-model="state.status" :items="statusOptions" class="w-full" />
        </UFormField>

        <UFormField name="sort" label="排序">
          <UInput
            v-model.number="state.sort"
            type="number"
            min="0"
            class="w-full"
          />
        </UFormField>

        <UFormField name="description" label="角色说明" class="sm:col-span-2">
          <UTextarea
            v-model="state.description"
            :rows="3"
            placeholder="简单描述这个角色可以做什么"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          label="取消"
          color="neutral"
          variant="ghost"
          :disabled="saving"
          @click="open = false"
        />
        <UButton
          form="role-form"
          type="submit"
          :label="isEdit ? '保存修改' : '创建角色'"
          :loading="saving"
          :disabled="loading"
        />
      </div>
    </template>
  </UModal>
</template>
