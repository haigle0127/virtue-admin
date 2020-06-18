<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate(0)">添加</el-button>
    </div>
    <el-table v-if="tableShow" :data="list" row-key="id" border lazy :load="load" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" style="width: 100%">
      <el-table-column width="180" label="名称" prop="name" />
      <el-table-column width="180" label="别名" prop="ename" />
      <el-table-column width="180" label="权限标识" prop="power">
        <template slot-scope="scope">
          <el-tag type="success" effect="plain" size="mini">{{ scope.row.power }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180" label="简介" prop="description" />
      <el-table-column label="创建时间" prop="createTime" />
      <el-table-column width="250" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button-group>
            <el-link type="primary" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-link>
            <el-link type="success" icon="el-icon-edit" @click="handleCreate(row.id)">添加下一级</el-link>
            <el-link type="danger" icon="el-icon-delete" @click="handleDelete(row)">删除</el-link>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 增加，修改-->
    <el-dialog :title="dialogStatus+'权限'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="别名" prop="ename">
          <el-input v-model="temp.ename" />
        </el-form-item>
        <el-form-item label="权限标识" prop="power">
          <el-input v-model="temp.power" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="temp.description" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='添加'?createData():updateData()">确定</el-button>
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
        name: [{ required: true, message: '名称必填', trigger: 'blur' }],
        ename: [{ required: true, message: '别名必填', trigger: 'blur' }],
        power: [{ required: true, message: '权限标识必填', trigger: 'blur' }]
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
      this.dialogStatus = '添加'
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
      this.dialogStatus = '修改'
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
      const tip = `删除${row.name}`
      this.$confirm(tip, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
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
          message: '取 消'
        })
      })
    }
  }
}
</script>
