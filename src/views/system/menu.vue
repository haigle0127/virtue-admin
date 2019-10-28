<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate(0)">
        {{ $t('table.add') }}
      </el-button>
    </div>
    <el-table v-if="tableShow" :data="list" row-key="id" border lazy :load="load" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" style="width: 100%">
      <el-table-column width="180" :label="$t('table.name')" prop="name" />
      <el-table-column width="180" :label="$t('table.ename')" prop="ename" />
      <el-table-column width="180" :label="$t('system.menu.power')" prop="power">
        <template slot-scope="scope">
          <el-tag type="success" effect="plain" size="mini">{{ scope.row.power }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180" :label="$t('table.description')" prop="description" />
      <el-table-column :label="$t('table.createTime')" prop="createTime" />
      <el-table-column width="250" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button-group>
            <el-button type="primary" effect="dark" size="small" @click="handleUpdate(row)">{{ $t('table.edit') }}</el-button>
            <el-button type="success" effect="dark" size="small" @click="handleCreate(row.id)">{{ $t('system.menu.addNext') }}</el-button>
            <el-button type="danger" effect="dark" size="small" @click="handleDelete(row)">{{ $t('table.delete') }}</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 增加，修改-->
    <el-dialog :title="$t('system.menu.'+dialogStatus)" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('table.ename')" prop="ename">
          <el-input v-model="temp.ename" />
        </el-form-item>
        <el-form-item :label="$t('system.menu.power')" prop="power">
          <el-input v-model="temp.power" />
        </el-form-item>
        <el-form-item :label="$t('table.description')" prop="description">
          <el-input v-model="temp.description" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, save, update, remove } from '@/api/system/menu'
import waves from '@/directive/waves' // waves directive
export default {
  name: 'Menu',
  directives: { waves },
  data() {
    return {
      tableShow: true,
      listLoading: true,
      listQuery: {
        id: 0
      },
      list: [],
      dialogStatus: '',
      dialogFormVisible: false,
      temp: {
        id: undefined,
        parentId: undefined,
        name: '',
        ename: '',
        power: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: this.$t('system.menu.nameNotBlank'), trigger: 'blur' }],
        ename: [{ required: true, message: this.$t('system.menu.enameNotBlank'), trigger: 'blur' }],
        power: [{ required: true, message: this.$t('system.menu.powerNotBlank'), trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.tableShow = false
      list(this.listQuery).then(resp => {
        this.list = resp.data
        // Just to simulate the time of the request
        this.tableShow = true
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        parentId: undefined,
        name: '',
        ename: '',
        power: '',
        description: ''
      }
    },
    handleCreate(id) {
      this.resetTemp()
      this.temp.parentId = id
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          save(this.temp).then(resp => {
            if (resp.success) {
              this.list = []
              this.listQuery.id = 0
              this.getList()
              this.dialogFormVisible = false
            }
            this.$message({
              message: resp.message,
              type: resp.success ? 'success' : 'info'
            })
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          update(this.temp).then(resp => {
            this.list = []
            this.listQuery.id = 0
            this.getList()
            this.dialogFormVisible = false
            this.$message({
              message: resp.message,
              type: resp.success ? 'success' : 'info'
            })
          })
        }
      })
    },
    handleUpdate(row) {
      const { id, parentId, name, ename, power, description } = row
      this.temp = { id, parentId, name, ename, power, description }
      this.dialogStatus = 'edit'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    load(tree, treeNode, resolve) {
      console.log(1)
      this.listQuery.id = tree.id
      list(this.listQuery).then(resp => {
        resolve(resp.data)
      })
    },
    handleDelete(row) {
      const tip = `${row.name} ${this.$t('table.delete')}`
      this.$confirm(tip, this.$t('table.prompt'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning'
      }).then(() => {
        this.list = []
        remove({ id: row.id }).then(resp => {
          this.listQuery.id = 0
          this.getList()
          this.$message({
            message: resp.message,
            type: resp.success ? 'success' : 'info'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('table.cancel')
        })
      })
    }
  }
}
</script>
