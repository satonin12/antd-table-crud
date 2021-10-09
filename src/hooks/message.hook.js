import { useCallback } from 'react'
import { notification } from 'antd'
import Enum from 'enum'


import 'antd/dist/antd.css'

export const useMessage = () => {
  Enum.register()

  const statusCodeAnswerServer = new Enum({
    200: {
      type: 'success',
      message: 'ОК'
    },
    301: {
      type: 'warning',
      message: 'Moved Permanently'
    },
    302: {
      type: 'info',
      message: 'Found'
    },
    304: {
      type: 'info',
      message: 'Not Modified'
    },
    403: {
      type: 'error',
      message: 'Forbidden'
    },
    404: {
      type: 'error',
      message: 'Not Found'
    },
    410: {
      type: 'error',
      message: 'Gone'
    },
    451: {
      type: 'warning',
      message: 'Unavailable For Legal Reasons'
    },
    500: {
      type: 'error',
      message: 'Internal Server Error'
    },
    503: {
      type: 'warning',
      message: 'Service Unavailable'
    },
    504: {
      type: 'success',
      message: 'Gateway Timeout'
    },
  })

  const openNotificationWithIcon = (status, statusText, url) => {
    const NotificationType = statusCodeAnswerServer.get(status.toString())
    const title = NotificationType.key + ' - ' + NotificationType.value.type + ': ' + NotificationType.value.message

    notification[NotificationType.value.type]({
      message: title,
      // description: `Статус ответа сервера: ${status} - ${statusText} по аддресу (${url})`,
      // description: `Статус ответа сервера: ${status} - ${statusText}`,
    })
  }

  return useCallback((status, statusText, url) => {

    openNotificationWithIcon(status, statusText, url)
  }, [])
}
