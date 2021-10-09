import React, { useEffect, useState } from 'react'
import { Button, Popconfirm, Table, Typography, Form, Input } from 'antd'

import 'antd/dist/antd.css'
import { useFetch } from '../../hooks/http.hook'
import { useMessage } from '../../hooks/message.hook'

export const MyTable = () => {
  const [itemsTable, setItemsTable] = useState([])
  const [editingKey, setEditingKey] = useState('')
  const [loadingTable, setLoadingTable] = useState(false)

  const [form] = Form.useForm()
  const { error, request, clearError } = useFetch()
  const message = useMessage()

  const getData = async () => {
    const dataList = await request(
      'http://178.128.196.163:3000/api/records',
      'GET'
    )

    let tmp = dataList.data.map((ele, ind) => {
      return {
        key: ind,
        id: ele._id,
        name: ele.data.name,
        address: ele.data.address,
        phone: ele.data.phone,
        postal: ele.data.postal,
        v: ele.__v,
      }
    })

    setItemsTable(tmp)
    message(dataList.status, dataList.statusText, dataList.url)
    clearError()
    setLoadingTable(false)
  }

  useEffect(() => {
    setLoadingTable(true)
    getData()
  }, [])

  const isEditing = (record) => record.key === editingKey

  const edit = (record) => {
    form.setFieldsValue({
      ID: '',
      Name: '',
      Address: '',
      Phone: '',
      Postal: '',
      ...record,
    })
    setEditingKey(record.key)
  }

  const cancel = () => {
    setEditingKey('')
  }

  const toObj = (dataSource, index) => {
    if (!dataSource[index].id) {
      return {
        data: {
          phone: dataSource[index].phone,
          postal: dataSource[index].postal,
          name: dataSource[index].name,
          address: dataSource[index].address,
        },
      }
    } else {
      return {
        _id: dataSource[index].id,
        data: {
          phone: dataSource[index].phone,
          postal: dataSource[index].postal,
          name: dataSource[index].name,
          address: dataSource[index].address,
        },
        __v: dataSource[index].v,
      }
    }
  }

  const save = async (key) => {
    try {
      setLoadingTable(true)
      const row = await form.validateFields()
      const dataSource = [...itemsTable],
        index = dataSource.findIndex((item) => key === item.key)

      const item = dataSource[index]

      if (index > -1) {
        dataSource.splice(index, 1, { ...item, ...row })
      } else {
        dataSource.push(row)
      }

      const obj = toObj(dataSource, index)

      let statusCrud = {}
      // если есть id -> обновление
      if (!!dataSource[index].id) {
        statusCrud = await updateRow(key, obj, item, dataSource)
      } else {
        // иначе создание
        statusCrud = await createRow(key, obj)
        // добавляем id к ново-созданнгому item dataSource
        dataSource[index].id = statusCrud.data._id
      }

      if (statusCrud.status === 200) {
        setItemsTable(dataSource)
        setEditingKey('')
        message(statusCrud.status, statusCrud.statusText, statusCrud.url)
      } else {
        cancel()
      }
      setLoadingTable(false)
    } catch (error) {
      console.log('Validate failed')
    }
  }

  const updateRow = async (key, obj, item) => {
    let updateRowPromise = await request(
      `http://178.128.196.163:3000/api/records/${item.id}`,
      'POST',
      obj
    )
    return updateRowPromise
  }

  const createRow = async (key, obj) => {
    let createRowPromise = await request(
      `http://178.128.196.163:3000/api/records/`,
      'PUT',
      obj
    )
    return createRowPromise
  }

  // добавляет строку только на клиенте, запрос на добавление пользователя происходит в функции save
  const addRow = () => {
    const dataSource = [...itemsTable],
      count = dataSource.length

    const newDataRow = {
      key: count,
      name: '',
      address: '',
      phone: '',
      postal: '',
      v: '0',
    }

    setItemsTable([...dataSource, newDataRow])
    edit(newDataRow)
  }

  const deleteRow = async (key) => {
    setLoadingTable(true)
    const dataSource = [...itemsTable],
      index = dataSource.findIndex((item) => key === item.key)

    const _dataSource = dataSource.filter((item) => item.key !== key) // обновленный массив для обновления состояния
    const _id = dataSource[index].id

    // отправляем запрос на сервер
    // и если успешно -> обновляем state на клиенте
    let deleteRow = await request(
      `http://178.128.196.163:3000/api/records/${_id}`,
      'DELETE'
    )

    if (deleteRow.status === 200) {
      setItemsTable(_dataSource)
      message(deleteRow.status, deleteRow.statusText, deleteRow.url)
    }
    setLoadingTable(false)
  }

  // столбцы таблицы
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'ID',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'Address',
      editable: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'Phone',
      editable: true,
    },
    {
      title: 'Postal',
      dataIndex: 'postal',
      key: 'Postal',
      editable: true,
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      key: 'x',
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <>
            <a
              href="/#"
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel editing ?" onConfirm={cancel}>
              <a href="/#">Cancel</a>
            </Popconfirm>
          </>
        ) : (
          <Typography.Link
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        )
      },
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      key: 'x',
      render: (_, record) =>
        itemsTable.length >= 1 ? (
          <Popconfirm
            title="Are you shure to delete row ?"
            onConfirm={() => deleteRow(record.key)}
          >
            <a href="/#">Delete</a>
          </Popconfirm>
        ) : null,
    },
  ]

  // input в редактируемых ячейках таблицы
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = <Input />
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                // required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    )
  }

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  })

  if (error) return <div>Ошибка: {error.message}</div>

  return (
    <>
      <Button onClick={addRow} type="primary" style={{ margin: 16 }}>
        Add a row
      </Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          loading={loadingTable}
          columns={mergedColumns}
          dataSource={itemsTable}
          hasData={true}
          expandable={{
            expandedRowRender: (record) => (
              <p style={{ margin: 0 }}>__v: {record.v}</p>
            ),
            rowExpandable: (record) => record.name !== 'Not Expandable',
          }}
        />
      </Form>
    </>
  )
}
