<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { DictDataItem, DictDataSavePayload } from '~/types/api'

const props = defineProps<{
  dictType: string
  dataId?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [] }>()

const api = useApi()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)

const colorOptions = [
  { label: '主色', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' },
  { label: '中性', value: 'neutral' }
]

const state = reactive({
  label: '',
  value: '',
  sort: 0,
  status: '0',
  colorType: 'primary',
  remark: ''
})

const isEdit = computed(() => !!props.dataId)
const title = computed(() => isEdit.value ? '编辑字典数据' : '新建字典数据')

const schema = z.object({
  label: z.string().trim().min(1, '请输入字典标签'),
  value: z.string().trim().min(1, '请输入字典值'),
  sort: z.number().int().min(0, '排序不能小于 0'),
  status: z.string(),
  colorType: z.string(),
  remark: z.string().trim().optional()
})

type Schema = z.output<typeof schema>

watch(open, async (value) => {
  if (!value) {
    return
  }
  loading.value = true
  try {
    if (props.dataId) {
      const item = await api.request<DictDataItem>('/admin-api/dict-data/get', { query: { id: props.dataId } })
      Object.assign(state, {
        label: item.label || '',
        value: item.value || '',
        sort: item.sort ?? 0,
        status: item.status || '0',
        colorType: item.colorType || 'primary',
        remark: item.remark || ''
      })
    } else {
      Object.assign(state, {
        label: '',
        value: '',
        sort: 0,
        status: '0',
        colorType: 'primary',
        remark: ''
      })
    }
  } catch (error) {
    toast.add({
      title: '加载字典数据失败',
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
    const payload: DictDataSavePayload = {
      label: event.data.label,
      value: event.data.value,
      dictType: props.dictType,
      sort: event.data.sort,
      status: event.data.status,
      colorType: event.data.colorType,
      remark: event.data.remark
    }
    if (props.dataId) {
      payload.id = props.dataId
    }

    await api.request(props.dataId ? '/admin-api/dict-data/update' : '/admin-api/dict-data/create', {
      method: props.dataId ? 'PUT' : 'POST',
      body: payload
    })

    toast.add({
      title: isEdit.value ? '字典数据已更新' : '字典数据已创建',
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
    :description="`字典类型：${dictType}`"
    :dismissible="!saving"
  >
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>

      <UForm
        v-else
        id="dict-data-form"
        :schema="schema"
        :state="state"
        class="grid gap-4 sm:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField name="label" label="字典标签" required>
          <UInput v-model="state.label" placeholder="展示给用户的文案" class="w-full" />
        </UFormField>

        <UFormField name="value" label="字典值" required>
          <UInput v-model="state.value" placeholder="存储值" class="w-full" />
        </UFormField>

        <UFormField name="sort" label="排序">
          <UInput
            v-model.number="state.sort"
            type="number"
            min="0"
            class="w-full"
          />
        </UFormField>

        <UFormField name="status" label="状态">
          <USelect v-model="state.status" :items="dictStatusOptions" class="w-full" />
        </UFormField>

        <UFormField name="colorType" label="颜色">
          <USelect v-model="state.colorType" :items="colorOptions" class="w-full" />
        </UFormField>

        <UFormField name="remark" label="备注" class="sm:col-span-2">
          <UTextarea
            v-model="state.remark"
            :rows="2"
            placeholder="用途说明"
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
          form="dict-data-form"
          type="submit"
          :label="isEdit ? '保存修改' : '创建字典数据'"
          :loading="saving"
          :disabled="loading"
        />
      </div>
    </template>
  </UModal>
</template>
