import React, { useEffect, useState } from 'react'
import {
  Button,
  Popconfirm,
  Table,
  Typography,
  Form,
  InputNumber,
  Input,
} from 'antd'

import 'antd/dist/antd.css'

export const MyTable = () => {
  const [error, setError] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [itemsTable, setItemsTable] = useState([])
  const [editingKey, setEditingKey] = useState('')
  const [form] = Form.useForm()

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

  const save = async (key) => {
    console.log('сохранили')
  }

  // столбцы таблицы
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'ID',
      editable: true,
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
            onConfirm={() => handleDeleteRow(record.key)}
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
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />
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
                required: true,
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

  useEffect(() => {
    fetch('http://178.128.196.163:3000/api/records', { method: 'GET' })
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true)

          let tmp = result.map((ele, ind) => {
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
        },
        (error) => {
          setIsLoaded(true)
          setError(error)
        }
      )
  }, [])

  const handlerAddRow = () => {
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
  }

  const handleDeleteRow = (key) => {
    const dataSource = [...itemsTable]
    setItemsTable(dataSource.filter((item) => item.key !== key))
  }

  if (error) return <div>Ошибка: {error.message}</div>

  if (!isLoaded) return <div>Загрузка...</div>

  return (
    <>
      <Button onClick={handlerAddRow} type="primary" style={{ margin: 16 }}>
        Add a row
      </Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          columns={mergedColumns} //{columns}
          dataSource={itemsTable}
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
