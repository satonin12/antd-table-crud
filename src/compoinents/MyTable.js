import React, { useEffect, useState } from 'react'
import { Table } from 'antd'

import 'antd/dist/antd.css'

export const MyTable = () => {
  const [error, setError] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [itemsTable, setItemsTable] = useState([])

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
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'Address',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'Phone',
    },
    {
      title: 'Postal',
      dataIndex: 'postal',
      key: 'Postal',
    },
    {
      title: 'Edit',
      dataIndex: '',
      key: 'x',
      render: () => <a href="/#">Edit</a>,
    },
    {
      title: 'Delete',
      dataIndex: '',
      key: 'x',
      render: () => <a href="/#">Delete</a>,
    },
  ]

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

  if (error) return <div>Ошибка: {error.message}</div>

  if (!isLoaded) return <div>Загрузка...</div>

  return (
    <>
      <Table
        columns={columns}
        dataSource={itemsTable}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>__v: {record.v}</p>
          ),
          rowExpandable: (record) => record.name !== 'Not Expandable',
        }}
      />
    </>
  )
}
